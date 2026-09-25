import { apiClient, setToken, removeToken } from './api';
import { DEMO_USERS } from '../utils/constants';

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
      // Mock Fallback for Demo & Preview
      if (email.includes('admin')) {
        const user = DEMO_USERS.mainLeader;
        setToken('demo-token-main-leader');
        return { user, access_token: 'demo-token-main-leader' };
      } else if (email.includes('floor3')) {
        const user = DEMO_USERS.wingLeaderFloor3;
        setToken('demo-token-wing-floor3');
        return { user, access_token: 'demo-token-wing-floor3' };
      } else {
        const user = DEMO_USERS.wingLeaderFloor2;
        setToken('demo-token-wing-floor2');
        return { user, access_token: 'demo-token-wing-floor2' };
      }
    }
  },

  getCurrentUser: async () => {
    try {
      return await apiClient('/users/me');
    } catch {
      const stored = localStorage.getItem('hs_current_user');
      return stored ? JSON.parse(stored) : DEMO_USERS.mainLeader;
    }
  },

  logout: () => {
    removeToken();
    localStorage.removeItem('hs_current_user');
  }
};
