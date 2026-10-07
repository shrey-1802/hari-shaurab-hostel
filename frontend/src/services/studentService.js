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
const normalizeStudent = (s) => {
  let extra = {};
  if (s.address && typeof s.address === 'string' && s.address.startsWith('{')) {
    try {
      extra = JSON.parse(s.address);
    } catch {}
  }
  return {
    ...s,
    ...extra,
    id: s.id || `stu-${Date.now()}`,
    dob: s.dob || s.date_of_birth || '',
    date_of_birth: s.date_of_birth || s.dob || '',
    student_number: s.student_number || `STU-${s.id}`,
    student_mobile: s.student_mobile || s.mobile || '',
    floor_number: Number(s.floor_number),
    room_number: String(s.room_number),
    profile_image_url: s.profile_image_url || s.profile_picture_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    profile_picture_url: s.profile_picture_url || s.profile_image_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    creator_name: s.creator_name || 'Wing Leader',
    college_name: extra.college_name || s.college_name || 'Hari-Saurabh Institute of Technology',
    department: extra.department || s.department || 'General',
    parent_name: extra.parent_name || s.parent_name || '',
    parent_mobile: extra.parent_mobile || s.parent_mobile || '',
    semester_result: extra.semester_result || s.semester_result || '',
    hobby: extra.hobby || s.hobby || '',
    hostel_friends: extra.hostel_friends || s.hostel_friends || '',
    non_hostel_friends: extra.non_hostel_friends || s.non_hostel_friends || '',
    registration_status: extra.registration_status || s.registration_status || 'APPROVED',
  };
};

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
    let cloudStudents = null;
    let apiStudents = [];

    // 1. Direct Cloud Database Sync (Supabase REST API — 100% Shared Across Devices in Real Time)
    try {
      const cloudList = await cloudSyncService.getAllStudents();
      if (Array.isArray(cloudList)) {
        cloudStudents = cloudList.map(normalizeStudent);
      }
    } catch (cloudErr) {
      console.warn('[StudentService] Cloud sync fetch warning:', cloudErr?.message);
    }

    // 2. Fetch from FastAPI Backend if available
    try {
      const queryParams = { page_size: 500, page: 1, ...params };
      const query = new URLSearchParams(queryParams).toString();
      const response = await apiClient(`/students?${query}`);
      const list = Array.isArray(response) ? response : (response?.students || []);
      if (list && list.length > 0) {
        apiStudents = list.map(normalizeStudent);
      }
    } catch (err) {
      // Expected if Render is sleeping; Supabase already handles data
    }

    let mergedList = [];
    if (cloudStudents !== null) {
      // Cloud DB is reachable: Cloud is single source of truth
      const mergedMap = new Map();
      cloudStudents.forEach((s) => {
        const key = s.id || s.student_number;
        if (key) mergedMap.set(String(key), s);
      });

      // Retain only local items genuinely pending sync
      const localStudents = getLocalStudents().map(normalizeStudent);
      localStudents.filter(s => s._pending_cloud_sync === true).forEach((s) => {
        const key = s.id || s.student_number;
        if (key && !mergedMap.has(String(key))) mergedMap.set(String(key), s);
      });

      mergedList = Array.from(mergedMap.values());
      saveLocalStudents(mergedList);
    } else {
      // Offline fallback only
      const localStudents = getLocalStudents().map(normalizeStudent);
      const mergedMap = new Map();
      localStudents.forEach((s) => {
        const key = s.id || s.student_number;
        if (key) mergedMap.set(String(key), s);
      });
      apiStudents.forEach((s) => {
        const key = s.id || s.student_number;
        if (key) mergedMap.set(String(key), s);
      });
      mergedList = Array.from(mergedMap.values());
    }

    // Apply filtering if params provided
    if (params.floor_number) {
      mergedList = mergedList.filter(s => Number(s.floor_number) === Number(params.floor_number));
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      mergedList = mergedList.filter(s =>
        s.full_name?.toLowerCase().includes(q) ||
        s.room_number?.toLowerCase().includes(q) ||
        s.department?.toLowerCase().includes(q)
      );
    }
    return mergedList;
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

    // 1. Write to Shared Cloud Database (Supabase REST API — 100% Online Persistence)
    const cloudRecord = await cloudSyncService.addStudent({
      ...studentData,
      creator_name: currentUser?.full_name || 'Wing Leader',
    });

    const normalized = normalizeStudent(cloudRecord);
    const updatedList = [normalized, ...currentList.filter(s => s.id !== normalized.id)];
    saveLocalStudents(updatedList);

    // 2. Background sync to FastAPI backend if available
    try {
      const payload = toApiPayload(studentData);
      payload.created_by = currentUser?.id || null;
      payload.creator_name = currentUser?.full_name || 'Wing Leader';
      apiClient('/students', {
        method: 'POST',
        body: JSON.stringify(payload),
      }).catch(() => {});
    } catch {}

    return normalized;
  },

  update: async (id, studentData) => {
    // 1. Direct Cloud DB Update (Supabase)
    const cloudRecord = await cloudSyncService.updateStudent(id, studentData);
    const normalized = normalizeStudent(cloudRecord);
    const currentList = getLocalStudents();
    const updatedList = currentList.map(s => (s.id === id ? normalized : s));
    saveLocalStudents(updatedList);

    // 2. Background sync to FastAPI backend if available
    try {
      const payload = toApiPayload(studentData);
      apiClient(`/students/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }).catch(() => {});
    } catch {}

    return normalized;
  },

  delete: async (id) => {
    // 1. Delete from Shared Cloud Database
    await cloudSyncService.deleteStudent(id);

    const currentList = getLocalStudents();
    const filtered = currentList.filter(s => s.id !== id);
    saveLocalStudents(filtered);

    // 2. Background sync to FastAPI backend if available
    try {
      apiClient(`/students/${id}`, { method: 'DELETE' }).catch(() => {});
    } catch {}

    return { success: true, message: 'Student deleted successfully' };
  },

  clearAll: async () => {
    await cloudSyncService.clearAllStudents();
    saveLocalStudents([]);
    return { success: true };
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
