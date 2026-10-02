import { apiClient } from './api';
import { cloudSyncService } from './cloudSyncService';

const LOCAL_STORAGE_KEY = 'hs_students_data';

const getLocalStudents = () => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const saveLocalStudents = (students) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(students));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('student_data_changed'));
  }
};

/**
 * Normalize a student record from backend API or Supabase to frontend field names.
 */
const normalizeStudent = (s) => ({
  ...s,
  id: s.id || `stu-${Date.now()}`,
  dob: s.dob || s.date_of_birth || '',
  date_of_birth: s.date_of_birth || s.dob || '',
  student_number: s.student_number || `STU-${s.id}`,
  student_mobile: s.student_mobile || '',
  floor_number: Number(s.floor_number),
  room_number: String(s.room_number),
  profile_image_url: s.profile_image_url || s.profile_picture_url || '',
  profile_picture_url: s.profile_picture_url || s.profile_image_url || '',
  creator_name: s.creator_name || (s.created_by ? 'Wing Leader' : 'Wing Leader'),
});

/**
 * Map frontend form data to backend API field names.
 */
const toApiPayload = (studentData) => {
  const payload = { ...studentData };
  if (payload.dob && !payload.date_of_birth) {
    payload.date_of_birth = payload.dob;
  }
  if (!payload.student_number) {
    payload.student_number = `HS-${payload.floor_number}${payload.room_number}-${Date.now().toString().slice(-4)}`;
  }
  if (payload.profile_image_url && !payload.profile_picture_url && !payload.profile_image_url.startsWith('data:')) {
    payload.profile_picture_url = payload.profile_image_url;
  }
  delete payload.dob;
  delete payload.profile_image_url;
  delete payload.whatsapp_number;
  return payload;
};

export const studentService = {
  getAll: async (params = {}) => {
    // 1. Try Live Render FastAPI Backend first
    try {
      const queryParams = { page_size: 500, page: 1, ...params };
      const query = new URLSearchParams(queryParams).toString();
      const response = await apiClient(`/students?${query}`);
      const list = Array.isArray(response) ? response : (response?.students || []);
      if (list && list.length > 0) {
        const normalized = list.map(normalizeStudent);
        saveLocalStudents(normalized);
        return normalized;
      }
    } catch (err) {
      console.warn('[StudentService] FastAPI endpoint warning, switching to cloud sync:', err?.message);
    }

    // 2. Direct Cloud Database Sync (Supabase REST API — 100% Shared Across Devices)
    try {
      const cloudList = await cloudSyncService.getAllStudents();
      if (Array.isArray(cloudList) && cloudList.length > 0) {
        const normalized = cloudList.map(normalizeStudent);
        saveLocalStudents(normalized);

        let list = normalized;
        if (params.floor_number) {
          list = list.filter(s => Number(s.floor_number) === Number(params.floor_number));
        }
        if (params.search) {
          const q = params.search.toLowerCase();
          list = list.filter(s =>
            s.full_name?.toLowerCase().includes(q) ||
            s.room_number?.toLowerCase().includes(q) ||
            s.department?.toLowerCase().includes(q)
          );
        }
        return list;
      }
    } catch (cloudErr) {
      console.warn('[StudentService] Cloud sync fetch warning:', cloudErr?.message);
    }

    // 3. Fallback to Local Cache
    let list = getLocalStudents().map(normalizeStudent);
    if (params.floor_number) {
      list = list.filter(s => Number(s.floor_number) === Number(params.floor_number));
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(s =>
        s.full_name?.toLowerCase().includes(q) ||
        s.room_number?.toLowerCase().includes(q) ||
        s.department?.toLowerCase().includes(q)
      );
    }
    return list;
  },

  getById: async (id) => {
    const list = await studentService.getAll();
    const found = list.find(s => String(s.id) === String(id));
    if (!found) throw new Error('Student profile not found');
    return found;
  },

  create: async (studentData, currentUser = null) => {
    const floorNum = Number(studentData.floor_number);
    const roomNum = String(studentData.room_number).trim();

    // Verify room capacity = 2 max per room
    const currentList = getLocalStudents();
    const existingInRoom = currentList.filter(
      (s) => Number(s.floor_number) === floorNum && String(s.room_number).trim().toLowerCase() === roomNum.toLowerCase()
    );
    if (existingInRoom.length >= 2) {
      throw new Error(`Room ${roomNum} on Floor ${floorNum} is already full (maximum 2 students allowed per room).`);
    }

    const payload = toApiPayload(studentData);
    payload.created_by = currentUser?.id || null;
    payload.creator_name = currentUser?.full_name || 'Wing Leader';

    // 1. Try FastAPI backend
    try {
      const result = await apiClient('/students', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (result) {
        const normalized = normalizeStudent(result);
        await cloudSyncService.addStudent(normalized);
        const updatedList = [normalized, ...currentList.filter(s => s.id !== normalized.id)];
        saveLocalStudents(updatedList);
        return normalized;
      }
    } catch (err) {
      if (err.message && (
        err.message.toLowerCase().includes('capacity') ||
        err.message.toLowerCase().includes('already exists')
      )) {
        throw err;
      }
      console.warn('[StudentService] FastAPI post warning, storing to shared cloud DB:', err?.message);
    }

    // 2. Write to Shared Cloud Database (Supabase REST API)
    const cloudRecord = await cloudSyncService.addStudent({
      ...studentData,
      creator_name: currentUser?.full_name || 'Wing Leader',
    });

    const normalized = normalizeStudent(cloudRecord);
    const updatedList = [normalized, ...currentList.filter(s => s.id !== normalized.id)];
    saveLocalStudents(updatedList);
    return normalized;
  },

  update: async (id, studentData) => {
    const payload = toApiPayload(studentData);

    // 1. Try FastAPI backend
    try {
      const result = await apiClient(`/students/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      if (result) {
        const normalized = normalizeStudent(result);
        await cloudSyncService.updateStudent(id, normalized);
        const currentList = getLocalStudents();
        const updatedList = currentList.map(s => (s.id === id ? normalized : s));
        saveLocalStudents(updatedList);
        return normalized;
      }
    } catch (err) {
      console.warn('[StudentService] FastAPI update warning, updating shared cloud DB:', err?.message);
    }

    // 2. Direct Cloud DB Update
    const cloudRecord = await cloudSyncService.updateStudent(id, studentData);
    const normalized = normalizeStudent(cloudRecord);
    const currentList = getLocalStudents();
    const updatedList = currentList.map(s => (s.id === id ? normalized : s));
    saveLocalStudents(updatedList);
    return normalized;
  },

  delete: async (id) => {
    // 1. Try FastAPI backend
    try {
      await apiClient(`/students/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('[StudentService] FastAPI delete warning, deleting from shared cloud DB:', err?.message);
    }

    // 2. Delete from Shared Cloud Database
    await cloudSyncService.deleteStudent(id);

    const currentList = getLocalStudents();
    const filtered = currentList.filter(s => s.id !== id);
    saveLocalStudents(filtered);
    return { success: true, message: 'Student deleted successfully' };
  },

  getOccupancy: async (floor = null) => {
    const list = getLocalStudents();
    const occupancies = {};
    list.forEach((s) => {
      const fNum = Number(s.floor_number);
      if (!floor || fNum === Number(floor)) {
        const key = `${fNum}_${s.room_number}`;
        if (!occupancies[key]) {
          occupancies[key] = {
            floor_number: fNum,
            room_number: s.room_number,
            occupied: 0,
            capacity: 2,
            is_full: false,
            available_slots: 2,
          };
        }
        occupancies[key].occupied += 1;
        occupancies[key].is_full = occupancies[key].occupied >= 2;
        occupancies[key].available_slots = Math.max(0, 2 - occupancies[key].occupied);
      }
    });
    return occupancies;
  },
};
