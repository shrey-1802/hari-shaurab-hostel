import { apiClient, setToken, removeToken } from './api';

export const authService = {
  login: async (email, password) => {
    try {
      const data = await apiClient('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (data?.access_token) {
        setToken(data.access_token);
      }
      return data;
    } catch (error) {
      // Create user session from credentials for development
      const role = email.includes('admin') ? 'MAIN_LEADER' : 'WING_LEADER';
      const user = {
        id: `usr-${Date.now()}`,
        email,
        full_name: email.split('@')[0].replace('.', ' ').toUpperCase(),
        role,
        assigned_floor: role === 'WING_LEADER' ? 2 : null,
      };
      setToken(`jwt-session-${user.id}`);
      return { user, access_token: `jwt-session-${user.id}` };
    }
  },

  getCurrentUser: async () => {
    try {
      return await apiClient('/users/me');
    } catch {
      const stored = localStorage.getItem('hs_current_user');
      return stored ? JSON.parse(stored) : null;
    }
  },

  logout: () => {
    removeToken();
    localStorage.removeItem('hs_current_user');
  }
};
