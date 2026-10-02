/**
 * Real-time Cloud Sync Service for Hari-Saurabh Hostel System
 * Connects directly to Supabase REST / Cloud Storage so student entries added
 * by any Wing Leader (e.g. ShreemadBhai) are instantly visible to Main Leaders (PriyankBhai/ShyamBhai)
 * across all devices and browsers.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://raytyqftzbutisuruylj.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_KpxO6r4SK4audx8tqVz9zw_Q5_9E-_w';

const CLOUD_CACHE_KEY = 'hs_students_cloud_cache_v4';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Prefer': 'return=representation',
});

export const cloudSyncService = {
  /**
   * Fetch all students from shared Cloud Database
   */
  getAllStudents: async () => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/students?select=*&order=created_at.desc`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          // Cache in localStorage for fast initial render
          localStorage.setItem(CLOUD_CACHE_KEY, JSON.stringify(data));
          return data;
        }
      }
    } catch (error) {
      console.warn('[CloudSync] Direct cloud fetch warning:', error?.message);
    }

    // Fallback to local cache if network is offline
    const cached = localStorage.getItem(CLOUD_CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  },

  /**
   * Add a new student to shared Cloud Database
   */
  addStudent: async (student) => {
    const payload = {
      full_name: student.full_name,
      date_of_birth: student.dob || student.date_of_birth || '2000-01-01',
      student_number: student.student_number || `STU-${Date.now().toString().slice(-6)}`,
      student_mobile: student.student_mobile || '',
      parent_name: student.parent_name || '',
      parent_mobile: student.parent_mobile || '',
      college_name: student.college_name || 'Hari-Saurabh Institute of Technology',
      department: student.department || '',
      semester_result: student.semester_result || '',
      hobby: student.hobby || '',
      hostel_friends: student.hostel_friends || '',
      non_hostel_friends: student.non_hostel_friends || '',
      floor_number: Number(student.floor_number),
      room_number: String(student.room_number),
      profile_picture_url: student.profile_image_url || student.profile_picture_url || '',
    };

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/students`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const created = await response.json();
        const record = Array.isArray(created) ? created[0] : created;
        if (record) {
          // Update local cache
          const existing = cloudSyncService.getCachedStudents();
          const updated = [record, ...existing.filter(s => s.id !== record.id)];
          localStorage.setItem(CLOUD_CACHE_KEY, JSON.stringify(updated));
          return record;
        }
      }
    } catch (error) {
      console.warn('[CloudSync] Direct cloud insert warning:', error?.message);
    }

    // Return student formatted with local cache fallback
    const fallbackRecord = {
      ...payload,
      id: student.id || `stu-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      creator_name: student.creator_name || 'Wing Leader',
    };
    const existing = cloudSyncService.getCachedStudents();
    const updated = [fallbackRecord, ...existing];
    localStorage.setItem(CLOUD_CACHE_KEY, JSON.stringify(updated));
    return fallbackRecord;
  },

  /**
   * Update student in shared Cloud Database
   */
  updateStudent: async (id, student) => {
    const payload = {
      full_name: student.full_name,
      date_of_birth: student.dob || student.date_of_birth,
      student_mobile: student.student_mobile,
      parent_name: student.parent_name,
      parent_mobile: student.parent_mobile,
      college_name: student.college_name,
      department: student.department,
      semester_result: student.semester_result,
      hobby: student.hobby,
      hostel_friends: student.hostel_friends,
      non_hostel_friends: student.non_hostel_friends,
      floor_number: Number(student.floor_number),
      room_number: String(student.room_number),
      profile_picture_url: student.profile_image_url || student.profile_picture_url,
    };

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/students?id=eq.${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const updated = await response.json();
        const record = Array.isArray(updated) ? updated[0] : updated;
        if (record) {
          const existing = cloudSyncService.getCachedStudents();
          const list = existing.map(s => (s.id === id ? { ...s, ...record } : s));
          localStorage.setItem(CLOUD_CACHE_KEY, JSON.stringify(list));
          return record;
        }
      }
    } catch (error) {
      console.warn('[CloudSync] Direct cloud update warning:', error?.message);
    }

    const existing = cloudSyncService.getCachedStudents();
    const list = existing.map(s => (s.id === id ? { ...s, ...student } : s));
    localStorage.setItem(CLOUD_CACHE_KEY, JSON.stringify(list));
    return student;
  },

  /**
   * Delete student from shared Cloud Database
   */
  deleteStudent: async (id) => {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/students?id=eq.${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
    } catch (error) {
      console.warn('[CloudSync] Direct cloud delete warning:', error?.message);
    }

    const existing = cloudSyncService.getCachedStudents();
    const filtered = existing.filter(s => s.id !== id);
    localStorage.setItem(CLOUD_CACHE_KEY, JSON.stringify(filtered));
    return { success: true };
  },

  getCachedStudents: () => {
    const data = localStorage.getItem(CLOUD_CACHE_KEY);
    return data ? JSON.parse(data) : [];
  },
};
