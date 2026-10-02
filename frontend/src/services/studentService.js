import { apiClient } from './api';

const LOCAL_STORAGE_KEY = 'hs_students_data';
const CLEAN_STORAGE_VERSION = 'hs_cleaned_v2';

const getLocalStudents = () => {
  // Purge any stale legacy demo data once
  if (!localStorage.getItem(CLEAN_STORAGE_VERSION)) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]));
    localStorage.setItem(CLEAN_STORAGE_VERSION, 'true');
    return [];
  }

  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]));
    return [];
  }
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const saveLocalStudents = (students) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(students));
};

/**
 * Normalize a student record from backend API to frontend field names.
 * Backend uses: date_of_birth, profile_picture_url
 * Frontend uses: dob, profile_image_url
 */
const normalizeStudent = (s) => ({
  ...s,
  dob: s.dob || s.date_of_birth || '',
  date_of_birth: s.date_of_birth || s.dob || '',
  profile_image_url: s.profile_image_url || s.profile_picture_url || '',
  profile_picture_url: s.profile_picture_url || s.profile_image_url || '',
});

/**
 * Map frontend form data to backend API field names.
 */
const toApiPayload = (studentData) => {
  const payload = { ...studentData };
  // Map dob -> date_of_birth
  if (payload.dob && !payload.date_of_birth) {
    payload.date_of_birth = payload.dob;
  }
  // Map profile_image_url -> profile_picture_url (skip if it's a base64 data URL - backend won't store it)
  if (payload.profile_image_url && !payload.profile_picture_url && !payload.profile_image_url.startsWith('data:')) {
    payload.profile_picture_url = payload.profile_image_url;
  }
  // Remove frontend-only fields the backend doesn't expect
  delete payload.dob;
  delete payload.profile_image_url;
  delete payload.whatsapp_number; // not in backend schema
  return payload;
};

export const studentService = {
  getAll: async (params = {}) => {
    try {
      // Load all students (large page_size) for client-side filtering
      const queryParams = { page_size: 500, page: 1, ...params };
      const query = new URLSearchParams(queryParams).toString();
      const response = await apiClient(`/students?${query}`);
      // Backend returns paginated response: { students, total, page, page_size, total_pages }
      const list = Array.isArray(response) ? response : (response?.students || []);
      return list.map(normalizeStudent);
    } catch {
      let list = getLocalStudents();
      if (params.floor_number) {
        list = list.filter(s => s.floor_number === Number(params.floor_number));
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
  },

  getById: async (id) => {
    try {
      const s = await apiClient(`/students/${id}`);
      return normalizeStudent(s);
    } catch {
      const list = getLocalStudents();
      const found = list.find(s => s.id === id);
      if (!found) throw new Error('Student not found');
      return found;
    }
  },

  create: async (studentData, currentUser = null) => {
    try {
      const payload = toApiPayload(studentData);
      const result = await apiClient('/students', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return normalizeStudent(result);
    } catch (err) {
      // If error is from live API (e.g. 409 Conflict / capacity), propagate it
      if (err.message && (
        err.message.toLowerCase().includes('capacity') ||
        err.message.toLowerCase().includes('already exists') ||
        err.message.toLowerCase().includes('access denied')
      )) {
        throw err;
      }
      const list = getLocalStudents();
      const floorNum = Number(studentData.floor_number);
      const roomNum = String(studentData.room_number).trim();

      // Check max capacity = 2
      const existingInRoom = list.filter(
        (s) => s.floor_number === floorNum && String(s.room_number).trim().toLowerCase() === roomNum.toLowerCase()
      );
      if (existingInRoom.length >= 2) {
        throw new Error(`Room ${roomNum} on Floor ${floorNum} is already full (maximum 2 students allowed).`);
      }

      const newStudent = {
        ...studentData,
        id: `stu-${Date.now()}`,
        floor_number: floorNum,
        created_by: currentUser?.id || 'usr-local',
        creator_name: currentUser?.full_name || 'Wing Leader',
        created_at: new Date().toISOString(),
        dob: studentData.dob || studentData.date_of_birth || '',
        date_of_birth: studentData.date_of_birth || studentData.dob || '',
        profile_image_url: studentData.profile_image_url || '',
        profile_picture_url: studentData.profile_picture_url || '',
      };
      list.unshift(newStudent);
      saveLocalStudents(list);
      return newStudent;
    }
  },

  update: async (id, studentData) => {
    try {
      const payload = toApiPayload(studentData);
      const result = await apiClient(`/students/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      return normalizeStudent(result);
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('capacity')) {
        throw err;
      }
      const list = getLocalStudents();
      const index = list.findIndex(s => s.id === id);
      if (index === -1) throw new Error('Student not found');

      const current = list[index];
      const newFloor = studentData.floor_number ? Number(studentData.floor_number) : current.floor_number;
      const newRoom = studentData.room_number ? String(studentData.room_number).trim() : current.room_number;

      if (newFloor !== current.floor_number || newRoom.toLowerCase() !== String(current.room_number).trim().toLowerCase()) {
        const existingInRoom = list.filter(
          (s) => s.id !== id && s.floor_number === newFloor && String(s.room_number).trim().toLowerCase() === newRoom.toLowerCase()
        );
        if (existingInRoom.length >= 2) {
          throw new Error(`Room ${newRoom} on Floor ${newFloor} is already full (maximum 2 students allowed).`);
        }
      }

      list[index] = { ...list[index], ...studentData, floor_number: newFloor };
      saveLocalStudents(list);
      return list[index];
    }
  },

  getOccupancy: async (floor = null) => {
    try {
      const query = floor ? `?floor=${floor}` : '';
      return await apiClient(`/students/rooms/occupancy${query}`);
    } catch {
      const list = getLocalStudents();
      const occupancies = {};
      list.forEach((s) => {
        if (!floor || s.floor_number === Number(floor)) {
          const key = `${s.floor_number}_${s.room_number}`;
          if (!occupancies[key]) {
            occupancies[key] = {
              floor_number: s.floor_number,
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
    }
  },

  delete: async (id) => {
    try {
      return await apiClient(`/students/${id}`, {
        method: 'DELETE',
      });
    } catch {
      const list = getLocalStudents();
      const filtered = list.filter(s => s.id !== id);
      saveLocalStudents(filtered);
      return { success: true, message: 'Student deleted successfully' };
    }
  },
};
