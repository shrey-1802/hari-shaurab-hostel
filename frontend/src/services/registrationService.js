import { apiClient } from './api';
import { cloudSyncService } from './cloudSyncService';
import { studentService } from './studentService';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://raytyqftzbutisuruylj.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJheXR5cWZ0emJ1dGlzdXJ1eWxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3NTc5NzksImV4cCI6MjEwNjMzMzk3OX0.w8jtteL7cll2n4BFr9mbcS9kyvp1tbX8ZPbrhEtbCGI';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Prefer': 'return=representation',
});

// Seed fallback wing leader registration links mapping
const FALLBACK_LINKS = [
  {
    registration_token: 'wl-a',
    wing_leader_name: 'Wing Leader A (AryanBhai)',
    assigned_floor: 4,
    room_start: '401',
    room_end: '409',
    is_active: true,
  },
  {
    registration_token: 'wl-b',
    wing_leader_name: 'Wing Leader B (ShreemadBhai)',
    assigned_floor: 4,
    room_start: '410',
    room_end: '418',
    is_active: true,
  },
  {
    registration_token: 'wl-c',
    wing_leader_name: 'Wing Leader C (JeetBhai)',
    assigned_floor: 6,
    room_start: '601',
    room_end: '609',
    is_active: true,
  },
  {
    registration_token: 'wl-d',
    wing_leader_name: 'Wing Leader D (ParamBhai)',
    assigned_floor: 6,
    room_start: '610',
    room_end: '618',
    is_active: true,
  },
];

export const registrationService = {
  /**
   * Get registration link information and compute live room availability (< 2 capacity).
   */
  getLinkInfo: async (token) => {
    // 1. Try FastAPI backend first
    try {
      const response = await apiClient(`/registration/${token}`);
      if (response && response.registration_token) {
        return response;
      }
    } catch (err) {
      console.warn('[RegistrationService] FastAPI link info warning, checking Supabase/fallback:', err?.message);
    }

    // 2. Try Supabase REST API
    let linkData = null;
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/registration_links?registration_token=eq.${token}&is_active=eq.true`, {
        method: 'GET',
        headers: getHeaders(),
      });
      if (res.ok) {
        const rows = await res.json();
        if (rows && rows.length > 0) {
          linkData = rows[0];
        }
      }
    } catch (sErr) {
      console.warn('[RegistrationService] Supabase link fetch warning:', sErr?.message);
    }

    // 3. Fallback to mapped link definition
    if (!linkData) {
      const normToken = token.toLowerCase();
      linkData = FALLBACK_LINKS.find(
        (l) => l.registration_token === normToken || normToken.includes(l.registration_token)
      );
    }

    if (!linkData) {
      throw new Error(`Registration link '${token}' is invalid or expired.`);
    }

    // Calculate room occupancy from existing students list (Max 2 capacity rule)
    const allStudents = await studentService.getAll();
    const roomsList = [];
    const sNum = parseInt(linkData.room_start, 10);
    const eNum = parseInt(linkData.room_end, 10);

    if (!isNaN(sNum) && !isNaN(eNum)) {
      for (let r = sNum; r <= eNum; r++) {
        roomsList.push(String(r));
      }
    } else {
      roomsList.push(linkData.room_start, linkData.room_end);
    }

    const availableRooms = roomsList.map((roomNum) => {
      const count = allStudents.filter(
        (s) =>
          Number(s.floor_number) === Number(linkData.assigned_floor) &&
          String(s.room_number).trim() === String(roomNum).trim() &&
          s.registration_status !== 'REJECTED'
      ).length;

      return {
        room_number: roomNum,
        occupied: count,
        capacity: 2,
        available_beds: Math.max(0, 2 - count),
        is_available: count < 2,
      };
    });

    return {
      registration_token: linkData.registration_token,
      assigned_floor: linkData.assigned_floor,
      room_start: linkData.room_start,
      room_end: linkData.room_end,
      wing_leader_name: linkData.wing_leader_name,
      is_active: true,
      available_rooms: availableRooms,
    };
  },

  /**
   * Submit student self-registration form.
   */
  submitSelfRegistration: async (token, formData) => {
    // Validate link first
    const linkInfo = await registrationService.getLinkInfo(token);
    
    // Check room availability (Max 2 capacity rule)
    const targetRoom = linkInfo.available_rooms.find(
      (r) => String(r.room_number).trim() === String(formData.room_number).trim()
    );

    if (!targetRoom) {
      throw new Error(`Room ${formData.room_number} is not assigned to this Wing Leader link.`);
    }

    if (!targetRoom.is_available || targetRoom.occupied >= 2) {
      throw new Error(`Room ${formData.room_number} is at full capacity (maximum 2 students allowed per room).`);
    }

    const payload = {
      ...formData,
      floor_number: Number(linkInfo.assigned_floor),
      registration_status: 'PENDING',
      registered_via_link: token,
      registration_source: 'SELF_REGISTRATION',
    };

    // 1. Try FastAPI backend
    try {
      const response = await apiClient(`/registration/${token}`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (response && response.id) {
        return response;
      }
    } catch (err) {
      console.warn('[RegistrationService] FastAPI submit warning, falling back to Supabase Cloud REST:', err?.message);
      if (err.message && (err.message.includes('full capacity') || err.message.includes('already registered'))) {
        throw err;
      }
    }

    // 2. Supabase Cloud Database Insert
    const studentRecord = await cloudSyncService.addStudent({
      ...payload,
      dob: payload.date_of_birth,
      creator_name: linkInfo.wing_leader_name,
    });

    // Also send a notification to Wing Leader
    await cloudSyncService.addNotification({
      title: 'New Student Self-Registration',
      message: `Name: ${payload.full_name} | Room: ${payload.room_number} (Floor ${payload.floor_number}) | Status: Pending Approval`,
      notification_type: 'STUDENT_REGISTRATION_REQUEST',
      student_id: studentRecord.id,
      student_name: payload.full_name,
      student_avatar: payload.profile_picture_url,
      student_phone: payload.student_mobile,
      room_number: payload.room_number,
      floor_number: payload.floor_number,
    });

    return studentRecord;
  },

  /**
   * Get pending student self-registrations for review.
   */
  getPendingRegistrations: async (currentUser = null) => {
    try {
      const res = await apiClient('/registrations/pending');
      if (res && res.pending_registrations) {
        return res.pending_registrations;
      }
    } catch (err) {
      console.warn('[RegistrationService] FastAPI get pending warning, loading from cloud sync:', err?.message);
    }

    const allStudents = await studentService.getAll();
    let pending = allStudents.filter((s) => s.registration_status === 'PENDING');

    if (currentUser && currentUser.role === 'WING_LEADER' && currentUser.assigned_floor) {
      pending = pending.filter((s) => Number(s.floor_number) === Number(currentUser.assigned_floor));
    }

    return pending;
  },

  /**
   * Approve a pending student registration.
   */
  approveRegistration: async (studentId) => {
    try {
      const res = await apiClient(`/registrations/${studentId}/approve`, {
        method: 'PATCH',
      });
      if (res) {
        await cloudSyncService.updateStudent(studentId, { registration_status: 'APPROVED' });
        return res;
      }
    } catch (err) {
      console.warn('[RegistrationService] FastAPI approve warning, updating cloud DB:', err?.message);
    }

    const updated = await cloudSyncService.updateStudent(studentId, {
      registration_status: 'APPROVED',
      approved_at: new Date().toISOString(),
    });

    // Notify approved status
    await cloudSyncService.addNotification({
      title: 'Student Registration Approved',
      message: `Registration for ${updated.full_name || 'student'} (Room ${updated.room_number}) has been approved.`,
      notification_type: 'STUDENT_REGISTRATION_APPROVED',
      student_id: studentId,
      student_name: updated.full_name,
    });

    return updated;
  },

  /**
   * Reject a pending student registration.
   */
  rejectRegistration: async (studentId) => {
    try {
      const res = await apiClient(`/registrations/${studentId}/reject`, {
        method: 'PATCH',
      });
      if (res) {
        await cloudSyncService.updateStudent(studentId, { registration_status: 'REJECTED' });
        return res;
      }
    } catch (err) {
      console.warn('[RegistrationService] FastAPI reject warning, updating cloud DB:', err?.message);
    }

    const updated = await cloudSyncService.updateStudent(studentId, {
      registration_status: 'REJECTED',
      approved_at: new Date().toISOString(),
    });

    return updated;
  },

  /**
   * Get all Wing Leader shareable registration links.
   */
  getAllLinks: async () => {
    try {
      const res = await apiClient('/registration-links');
      if (Array.isArray(res) && res.length > 0) {
        return res;
      }
    } catch (err) {
      console.warn('[RegistrationService] FastAPI get links warning, using fallback links:', err?.message);
    }

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
    return FALLBACK_LINKS.map((l) => ({
      ...l,
      shareable_url: `${baseUrl}/register/${l.registration_token}`,
    }));
  },

  /**
   * Get Wing Leader's unique shareable link.
   */
  getMyLink: async (user = null) => {
    try {
      const res = await apiClient('/registration-links/my-link');
      if (res && res.registration_token) {
        return res;
      }
    } catch (err) {
      console.warn('[RegistrationService] FastAPI get my link warning:', err?.message);
    }

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
    const floor = user?.assigned_floor || user?.floor_number || 4;
    const rStartNum = user?.room_start ? parseInt(String(user.room_start).replace(/\D/g, ''), 10) : null;

    let token = 'wl-a';
    if (floor === 4) {
      token = (rStartNum && rStartNum >= 410) ? 'wl-b' : 'wl-a';
    } else if (floor === 6) {
      token = (rStartNum && rStartNum >= 610) ? 'wl-d' : 'wl-c';
    }

    const found = FALLBACK_LINKS.find((l) => l.registration_token === token) || FALLBACK_LINKS[0];
    const rStart = user?.room_start || found.room_start;
    const rEnd = user?.room_end || found.room_end;

    return {
      ...found,
      assigned_floor: floor,
      room_start: rStart,
      room_end: rEnd,
      shareable_url: `${baseUrl}/register/${found.registration_token}`,
    };
  },
};
