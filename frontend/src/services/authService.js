import { apiClient, setToken, removeToken } from './api';

const USERS_STORAGE_KEY = 'hs_registered_users';

const getDefaultUsers = () => {
  return [
    {
      id: 'usr-admin-01',
      email: 'admin@harisaurabh.com',
      password: 'admin123',
      full_name: 'Main Leader (Admin)',
      role: 'MAIN_LEADER',
      assigned_floor: null,
    },
    {
      id: 'usr-wing-02',
      email: 'leader.floor2@harisaurabh.com',
      password: 'leader123',
      full_name: 'Floor 2 Wing Leader',
      role: 'WING_LEADER',
      assigned_floor: 2,
    },
  ];
};

const getStoredUsers = () => {
  const data = localStorage.getItem(USERS_STORAGE_KEY);
  if (!data) {
    const initial = getDefaultUsers();
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
};

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
    } catch {
      // Local check from saved registered accounts
      const users = getStoredUsers();
      const user = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase().trim()
      );

      if (user) {
        if (user.password && user.password !== password) {
          throw new Error('Incorrect password. Please check your credentials.');
        }
        setToken(`jwt-token-${user.id}`);
        return { user, access_token: `jwt-token-${user.id}` };
      }

      // If user is logging in with any new email/password, auto-register them
      const role = email.toLowerCase().includes('admin') ? 'MAIN_LEADER' : 'WING_LEADER';
      const newUser = {
        id: `usr-${Date.now()}`,
        email: email.trim(),
        password: password,
        full_name: email.split('@')[0].replace('.', ' ').toUpperCase(),
        role,
        assigned_floor: role === 'WING_LEADER' ? 2 : null,
      };

      users.push(newUser);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      setToken(`jwt-token-${newUser.id}`);
      return { user: newUser, access_token: `jwt-token-${newUser.id}` };
    }
  },

  register: async ({ full_name, email, password, role = 'MAIN_LEADER', assigned_floor = null }) => {
    try {
      return await apiClient('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ full_name, email, password, role, assigned_floor }),
      });
    } catch {
      const users = getStoredUsers();
      const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
      if (existing) {
        existing.password = password;
        existing.full_name = full_name;
        existing.role = role;
        existing.assigned_floor = assigned_floor;
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        setToken(`jwt-token-${existing.id}`);
        return { user: existing, access_token: `jwt-token-${existing.id}` };
      }

      const newUser = {
        id: `usr-${Date.now()}`,
        full_name,
        email: email.trim(),
        password,
        role,
        assigned_floor,
      };

      users.push(newUser);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      setToken(`jwt-token-${newUser.id}`);
      return { user: newUser, access_token: `jwt-token-${newUser.id}` };
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
  },
};
