import { apiClient } from './api';

export const notificationService = {
  getNotifications: async () => {
    try {
      return await apiClient('/notifications');
    } catch {
      const stored = localStorage.getItem('hs_notifications');
      return stored ? JSON.parse(stored) : [];
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
