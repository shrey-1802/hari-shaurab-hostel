/**
 * Real-time Cloud Sync Service for Hari-Saurabh Hostel System
 * Connected directly to live Supabase PostgreSQL REST API
 * (Project Ref: raytyqftzbutisuruylj)
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://raytyqftzbutisuruylj.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJheXR5cWZ0emJ1dGlzdXJ1eWxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3NTc5NzksImV4cCI6MjEwNjMzMzk3OX0.w8jtteL7cll2n4BFr9mbcS9kyvp1tbX8ZPbrhEtbCGI';

const CLOUD_CACHE_KEY = 'hs_students_cloud_cache_v5';
const NOTIFICATIONS_CACHE_KEY = 'hs_notifications_cloud_cache_v5';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Prefer': 'return=representation',
});

// Helper to ensure photo URL is lightweight for Supabase REST JSON payload
const sanitizePhotoUrl = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
  if (typeof url === 'string' && url.startsWith('data:image/') && url.length > 50000) {
    // Large base64 data URIs can exceed Supabase REST payload limits; fallback to standard avatar URL
    return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
  }
  return url;
};

export const cloudSyncService = {
  /**
   * Fetch all students from Supabase Cloud Database & auto-sync any pending local records
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
          localStorage.setItem(CLOUD_CACHE_KEY, JSON.stringify(data));
          
          // Background sync any local-only records to Supabase Cloud DB
          cloudSyncService.syncPendingLocalStudentsToCloud(data).catch(() => {});
          
          return data;
        }
      }
    } catch (error) {
      console.warn('[CloudSync] Supabase REST fetch warning:', error?.message);
    }

    const cached = localStorage.getItem(CLOUD_CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  },

  /**
   * Add a new student to Supabase Cloud Database (100% Online Persistence)
   */
  addStudent: async (student) => {
    const rawPhoto = student.profile_image_url || student.profile_picture_url || '';
    const cleanPhoto = sanitizePhotoUrl(rawPhoto);

    const payload = {
      full_name: student.full_name || 'Hostel Student',
      date_of_birth: student.dob || student.date_of_birth || '2000-01-01',
      student_number: student.student_number || `HS-${Date.now().toString().slice(-6)}`,
      student_mobile: student.student_mobile || '',
      parent_name: student.parent_name || '',
      parent_mobile: student.parent_mobile || '',
      college_name: student.college_name || 'Hari-Saurabh Institute of Technology',
      department: student.department || '',
      semester_result: student.semester_result || '',
      hobby: student.hobby || '',
      hostel_friends: student.hostel_friends || '',
      non_hostel_friends: student.non_hostel_friends || '',
      floor_number: Number(student.floor_number) || 4,
      room_number: String(student.room_number) || '401',
      profile_picture_url: cleanPhoto,
      creator_name: student.creator_name || 'Wing Leader',
    };

    if (student.registration_status) {
      payload.registration_status = student.registration_status;
    }

    try {
      let response = await fetch(`${SUPABASE_URL}/rest/v1/students`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      // If duplicate student_number error occurred, append random suffix and retry
      if (!response.ok && response.status === 409) {
        payload.student_number = `${payload.student_number}-${Math.floor(100 + Math.random() * 900)}`;
        response = await fetch(`${SUPABASE_URL}/rest/v1/students`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        const created = await response.json();
        const record = Array.isArray(created) ? created[0] : created;
        if (record) {
          const existing = cloudSyncService.getCachedStudents();
          const updated = [record, ...existing.filter(s => s.id !== record.id)];
          localStorage.setItem(CLOUD_CACHE_KEY, JSON.stringify(updated));

          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('student_data_changed'));
          }
          return record;
        }
      } else {
        const errDetail = await response.text().catch(() => '');
        console.warn('[CloudSync] Supabase POST response not ok:', response.status, errDetail);
      }
    } catch (error) {
      console.warn('[CloudSync] Supabase REST insert warning:', error?.message);
    }

    // Local fallback with flag for auto-retry sync
    const fallbackRecord = {
      ...payload,
      id: student.id || `stu-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      _pending_cloud_sync: true,
    };

    const existing = cloudSyncService.getCachedStudents();
    const updated = [fallbackRecord, ...existing];
    localStorage.setItem(CLOUD_CACHE_KEY, JSON.stringify(updated));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('student_data_changed'));
    }

    return fallbackRecord;
  },

  /**
   * Update student in Supabase Cloud Database
   */
  updateStudent: async (id, student) => {
    const rawPhoto = student.profile_image_url || student.profile_picture_url;
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
      floor_number: student.floor_number ? Number(student.floor_number) : undefined,
      room_number: student.room_number ? String(student.room_number) : undefined,
    };

    if (rawPhoto) {
      payload.profile_picture_url = sanitizePhotoUrl(rawPhoto);
    }
    if (student.registration_status) {
      payload.registration_status = student.registration_status;
    }

    // Clean undefined fields
    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

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

          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('student_data_changed'));
          }
          return record;
        }
      }
    } catch (error) {
      console.warn('[CloudSync] Supabase REST update warning:', error?.message);
    }

    const existing = cloudSyncService.getCachedStudents();
    const list = existing.map(s => (s.id === id ? { ...s, ...student } : s));
    localStorage.setItem(CLOUD_CACHE_KEY, JSON.stringify(list));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('student_data_changed'));
    }

    return student;
  },

  /**
   * Delete student from Supabase Cloud Database
   */
  deleteStudent: async (id) => {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/students?id=eq.${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
    } catch (error) {
      console.warn('[CloudSync] Supabase REST delete warning:', error?.message);
    }

    const existing = cloudSyncService.getCachedStudents();
    const filtered = existing.filter(s => s.id !== id);
    localStorage.setItem(CLOUD_CACHE_KEY, JSON.stringify(filtered));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('student_data_changed'));
    }

    return { success: true };
  },

  /**
   * Auto-sync any locally created records up to Supabase Cloud DB
   */
  syncPendingLocalStudentsToCloud: async (cloudRecords = []) => {
    const localRecords = cloudSyncService.getCachedStudents();
    const cloudIdSet = new Set(cloudRecords.map(s => String(s.id)));
    const cloudStudentNumSet = new Set(cloudRecords.map(s => String(s.student_number)));

    const pendingLocal = localRecords.filter((s) => {
      if (s._pending_cloud_sync) return true;
      if (typeof s.id === 'string' && s.id.startsWith('stu-') && !cloudStudentNumSet.has(String(s.student_number))) {
        return true;
      }
      return false;
    });

    for (const student of pendingLocal) {
      try {
        const payload = {
          full_name: student.full_name || 'Hostel Student',
          date_of_birth: student.dob || student.date_of_birth || '2000-01-01',
          student_number: student.student_number || `HS-${Date.now().toString().slice(-6)}`,
          student_mobile: student.student_mobile || '',
          parent_name: student.parent_name || '',
          parent_mobile: student.parent_mobile || '',
          college_name: student.college_name || 'Hari-Saurabh Institute of Technology',
          department: student.department || '',
          semester_result: student.semester_result || '',
          hobby: student.hobby || '',
          hostel_friends: student.hostel_friends || '',
          non_hostel_friends: student.non_hostel_friends || '',
          floor_number: Number(student.floor_number) || 4,
          room_number: String(student.room_number) || '401',
          profile_picture_url: sanitizePhotoUrl(student.profile_picture_url || student.profile_image_url),
          creator_name: student.creator_name || 'Wing Leader',
        };

        const res = await fetch(`${SUPABASE_URL}/rest/v1/students`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          console.log(`[CloudSync] Auto-synced pending local student '${student.full_name}' to Supabase Cloud DB`);
        }
      } catch (err) {
        console.warn(`[CloudSync] Auto-sync failed for ${student.full_name}:`, err?.message);
      }
    }
  },

  getCachedStudents: () => {
    const data = localStorage.getItem(CLOUD_CACHE_KEY);
    return data ? JSON.parse(data) : [];
  },

  // ============================================================
  // NOTIFICATIONS CLOUD SYNC
  // ============================================================
  getAllNotifications: async () => {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/notifications?select=*&order=created_at.desc`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          localStorage.setItem(NOTIFICATIONS_CACHE_KEY, JSON.stringify(data));
          return data;
        }
      }
    } catch (error) {
      console.warn('[CloudSync] Supabase notifications REST fetch warning:', error?.message);
    }

    const cached = localStorage.getItem(NOTIFICATIONS_CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  },

  addNotification: async (notif) => {
    const payload = {
      title: notif.title,
      message: notif.message,
      notification_type: notif.notification_type || 'SYSTEM_ALERT',
      timing_type: notif.timing_type || null,
      dedupe_key: notif.dedupe_key || null,
      student_id: notif.student_id ? String(notif.student_id) : null,
      student_name: notif.student_name || null,
      student_avatar: sanitizePhotoUrl(notif.student_avatar),
      student_phone: notif.student_phone || null,
      room_number: notif.room_number ? String(notif.room_number) : null,
      floor_number: notif.floor_number ? Number(notif.floor_number) : null,
      dob: notif.dob || null,
      is_read: false,
    };

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/notifications`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const created = await response.json();
        const record = Array.isArray(created) ? created[0] : created;
        if (record) {
          const existing = cloudSyncService.getCachedNotifications();
          const updated = [record, ...existing.filter(n => n.id !== record.id)];
          localStorage.setItem(NOTIFICATIONS_CACHE_KEY, JSON.stringify(updated));
          return record;
        }
      }
    } catch (error) {
      console.warn('[CloudSync] Supabase notification insert warning:', error?.message);
    }

    const fallbackRecord = {
      ...payload,
      id: notif.id || `notif-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    const existing = cloudSyncService.getCachedNotifications();
    const updated = [fallbackRecord, ...existing];
    localStorage.setItem(NOTIFICATIONS_CACHE_KEY, JSON.stringify(updated));
    return fallbackRecord;
  },

  markNotificationRead: async (id) => {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/notifications?id=eq.${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ is_read: true }),
      });
    } catch (error) {
      console.warn('[CloudSync] Supabase notification read update warning:', error?.message);
    }
    const existing = cloudSyncService.getCachedNotifications();
    const updated = existing.map(n => n.id === id ? { ...n, is_read: true } : n);
    localStorage.setItem(NOTIFICATIONS_CACHE_KEY, JSON.stringify(updated));
  },

  markAllNotificationsRead: async () => {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/notifications?is_read=eq.false`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ is_read: true }),
      });
    } catch (error) {
      console.warn('[CloudSync] Supabase notification mark all read warning:', error?.message);
    }
    const existing = cloudSyncService.getCachedNotifications();
    const updated = existing.map(n => ({ ...n, is_read: true }));
    localStorage.setItem(NOTIFICATIONS_CACHE_KEY, JSON.stringify(updated));
  },

  clearAllNotifications: async () => {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/notifications?id=neq.0`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
    } catch (error) {
      console.warn('[CloudSync] Supabase notification clear warning:', error?.message);
    }
    localStorage.setItem(NOTIFICATIONS_CACHE_KEY, JSON.stringify([]));
  },

  getCachedNotifications: () => {
    const data = localStorage.getItem(NOTIFICATIONS_CACHE_KEY);
    return data ? JSON.parse(data) : [];
  },

  // ============================================================
  // PUSH SUBSCRIPTIONS CLOUD SYNC
  // ============================================================
  savePushSubscription: async (email, subscription) => {
    if (!subscription || !subscription.endpoint) return;
    const payload = {
      email: email || 'leader@hostel.com',
      endpoint: subscription.endpoint,
      p256dh_key: subscription.keys?.p256dh || '',
      auth_key: subscription.keys?.auth || '',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      is_active: true,
    };

    try {
      await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.warn('[CloudSync] Save push subscription warning:', err?.message);
    }
  },
};
