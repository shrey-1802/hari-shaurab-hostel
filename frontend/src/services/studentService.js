import { apiClient } from './api';
import { INITIAL_STUDENTS } from '../utils/constants';

const LOCAL_STORAGE_KEY = 'hs_students_data';

const getLocalStudents = () => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_STUDENTS));
    return INITIAL_STUDENTS;
  }
  return JSON.parse(data);
};

const saveLocalStudents = (students) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(students));
};

export const studentService = {
  getAll: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      return await apiClient(`/students?${query}`);
    } catch {
      let list = getLocalStudents();
      if (params.floor_number) {
        list = list.filter(s => s.floor_number === Number(params.floor_number));
      }
      if (params.search) {
        const q = params.search.toLowerCase();
        list = list.filter(s => 
          s.full_name.toLowerCase().includes(q) ||
          s.room_number.toLowerCase().includes(q) ||
          s.department.toLowerCase().includes(q)
        );
      }
      return list;
    }
  },

  getById: async (id) => {
    try {
      return await apiClient(`/students/${id}`);
    } catch {
      const list = getLocalStudents();
      const found = list.find(s => s.id === id);
      if (!found) throw new Error('Student not found');
      return found;
    }
  },

  create: async (studentData) => {
    try {
      return await apiClient('/students', {
        method: 'POST',
        body: JSON.stringify(studentData),
      });
    } catch {
      const list = getLocalStudents();
      const newStudent = {
        ...studentData,
        id: `stu-${Date.now()}`,
        floor_number: Number(studentData.floor_number),
        created_at: new Date().toISOString(),
      };
      list.unshift(newStudent);
      saveLocalStudents(list);
      return newStudent;
    }
  },

  update: async (id, studentData) => {
    try {
      return await apiClient(`/students/${id}`, {
        method: 'PUT',
        body: JSON.stringify(studentData),
      });
    } catch {
      const list = getLocalStudents();
      const index = list.findIndex(s => s.id === id);
      if (index === -1) throw new Error('Student not found');
      list[index] = { ...list[index], ...studentData, floor_number: Number(studentData.floor_number) };
      saveLocalStudents(list);
      return list[index];
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
