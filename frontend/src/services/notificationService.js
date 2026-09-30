import { apiClient } from './api';
import { isBirthdayToday, isBirthdayTomorrow, formatBirthdayDateOnly } from '../utils/helpers';
import { pushNotificationService } from './pushNotificationService';

const NOTIFICATIONS_STORAGE_KEY = 'hs_notifications';

const getStoredNotifications = () => {
  const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const saveStoredNotifications = (notifications) => {
  localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
};

export const notificationService = {
  getNotifications: async () => {
    try {
      return await apiClient('/notifications');
    } catch {
      return getStoredNotifications();
    }
  },

  createNotification: async (notificationData) => {
    try {
      return await apiClient('/notifications', {
        method: 'POST',
        body: JSON.stringify(notificationData),
      });
    } catch {
      const list = getStoredNotifications();
      const newNotif = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        title: notificationData.title,
        message: notificationData.message,
        notification_type: notificationData.notification_type || 'SYSTEM_ALERT',
        student_id: notificationData.student_id || null,
        floor_number: notificationData.floor_number || null,
        is_read: false,
        created_at: new Date().toISOString(),
        ...notificationData,
      };
      list.unshift(newNotif);
      saveStoredNotifications(list);
      return newNotif;
    }
  },

  /**
   * Scans students for birthdays Today and Tomorrow (1 Day Before),
   * stores notifications in database/storage, and dispatches Browser Push Notifications.
   */
  syncBirthdayNotifications: async (students = [], user = null) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const existing = getStoredNotifications();
    const createdNotifications = [];

    // Filter relevant students based on leader role
    const scopedStudents = students.filter((s) => {
      if (user?.role === 'WING_LEADER' && user.assigned_floor) {
        return s.floor_number === user.assigned_floor;
      }
      return true;
    });

    for (const student of scopedStudents) {
      const isToday = isBirthdayToday(student.dob);
      const isTomorrow = isBirthdayTomorrow(student.dob);

      if (isToday || isTomorrow) {
        const type = isToday ? 'TODAY' : 'TOMORROW';
        const dedupeId = `bday-${student.id}-${todayStr}-${type}`;

        // Check if already created in notifications list
        const alreadyExists = existing.some((n) => n.dedupe_key === dedupeId || (n.student_id === student.id && n.created_at?.startsWith(todayStr) && n.timing_type === type));

        if (!alreadyExists) {
          const title = isToday ? 'Birthday Reminder 🎂' : 'Birthday Reminder 🎂';
          const message = isToday
            ? `${student.full_name}'s birthday is today! (Room ${student.room_number}, Floor ${student.floor_number})`
            : `${student.full_name}'s birthday is tomorrow. (Room ${student.room_number}, Floor ${student.floor_number})`;

          const notif = await notificationService.createNotification({
            title,
            message,
            notification_type: 'BIRTHDAY_ALERT',
            timing_type: type,
            dedupe_key: dedupeId,
            student_id: student.id,
            student_name: student.full_name,
            student_avatar: student.profile_image_url,
            student_phone: student.whatsapp_number || student.student_mobile,
            room_number: student.room_number,
            floor_number: student.floor_number,
            dob: student.dob,
          });

          createdNotifications.push(notif);
        }

        // Trigger Browser Push Notification via Service Worker / Notification API
        await pushNotificationService.sendBirthdayNotification({
          student,
          isToday,
          isTomorrow,
        });
      }
    }

    return createdNotifications;
  },

  markAsRead: async (id) => {
    try {
      return await apiClient(`/notifications/${id}/read`, { method: 'PUT' });
    } catch {
      const stored = getStoredNotifications();
      const updated = stored.map(n => n.id === id ? { ...n, is_read: true } : n);
      saveStoredNotifications(updated);
      return { success: true };
    }
  },

  markAllAsRead: async () => {
    try {
      return await apiClient('/notifications/read-all', { method: 'PUT' });
    } catch {
      const stored = getStoredNotifications();
      const updated = stored.map(n => ({ ...n, is_read: true }));
      saveStoredNotifications(updated);
      return { success: true };
    }
  },

  clearAll: async () => {
    try {
      return await apiClient('/notifications/clear-all', { method: 'DELETE' });
    } catch {
      saveStoredNotifications([]);
      return { success: true };
    }
  },
};

