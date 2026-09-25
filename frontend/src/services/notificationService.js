import { apiClient } from './api';
import { NOTIFICATION_TYPES } from '../utils/constants';

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    notification_type: NOTIFICATION_TYPES.BIRTHDAY_REMINDER,
    title: '🎂 Birthday Today: Devendra Rathore',
    message: 'Devendra Rathore from Floor 2 (Room 202-B) is celebrating their birthday today! WhatsApp greeting scheduled.',
    created_at: new Date().toISOString(),
    is_read: false,
    student_id: 'stu-102',
  },
  {
    id: 'notif-2',
    notification_type: NOTIFICATION_TYPES.BIRTHDAY_REMINDER,
    title: '⏰ 24-Hour Reminder: Aarav Patel',
    message: 'Aarav Patel from Floor 2 (Room 201-A) has a birthday approaching in 3 days (Sep 28).',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    is_read: false,
    student_id: 'stu-101',
  },
  {
    id: 'notif-3',
    notification_type: NOTIFICATION_TYPES.SYSTEM_ALERT,
    title: '🚀 Render Backend Live Connection Ready',
    message: 'Your system is configured to connect seamlessly to Render deployment and Supabase DB.',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    is_read: true,
  },
];

export const notificationService = {
  getNotifications: async () => {
    try {
      return await apiClient('/notifications');
    } catch {
      const stored = localStorage.getItem('hs_notifications');
      if (!stored) {
        localStorage.setItem('hs_notifications', JSON.stringify(INITIAL_NOTIFICATIONS));
        return INITIAL_NOTIFICATIONS;
      }
      return JSON.parse(stored);
    }
  },

  markAsRead: async (id) => {
    try {
      return await apiClient(`/notifications/${id}/read`, { method: 'PUT' });
    } catch {
      const stored = JSON.parse(localStorage.getItem('hs_notifications') || '[]');
      const updated = stored.map(n => n.id === id ? { ...n, is_read: true } : n);
      localStorage.setItem('hs_notifications', JSON.stringify(updated));
      return { success: true };
    }
  },

  markAllAsRead: async () => {
    try {
      return await apiClient('/notifications/read-all', { method: 'PUT' });
    } catch {
      const stored = JSON.parse(localStorage.getItem('hs_notifications') || '[]');
      const updated = stored.map(n => ({ ...n, is_read: true }));
      localStorage.setItem('hs_notifications', JSON.stringify(updated));
      return { success: true };
    }
  }
};
