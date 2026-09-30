import { apiClient, setToken, removeToken } from './api';

const USERS_STORAGE_KEY = 'hs_registered_users_v5';

export const LEADER_ACCOUNTS = [
  {
    id: 'usr-main-01',
    email: 'admin@hostel.com',
    password: 'Admin@1234',
    full_name: 'Main Hostel Leader',
    role: 'MAIN_LEADER',
    assigned_floor: null,
    room_start: null,
    room_end: null,
    label: 'Main Leader (All Floors)',
  },
  {
    id: 'usr-wing-4a',
    email: 'aryansinhc673@gmail.com',
    password: 'Wing@1234',
    full_name: 'AryanBhai (Floor 4: 401-409)',
    role: 'WING_LEADER',
    assigned_floor: 4,
    room_start: '401',
    room_end: '409',
    label: 'AryanBhai (401–409)',
  },
  {
    id: 'usr-wing-4b',
    email: 'shreemadgandhi369@gmail.com',
    password: 'Wing@1234',
    full_name: 'ShreemadBhai (Floor 4: 410-418)',
    role: 'WING_LEADER',
    assigned_floor: 4,
    room_start: '410',
    room_end: '418',
    label: 'ShreemadBhai (410–418)',
  },
  {
    id: 'usr-wing-6a',
    email: 'jeetsinhsolanki749@gmail.com',
    password: 'Wing@1234',
    full_name: 'JeetBhai (Floor 6: 601-609)',
    role: 'WING_LEADER',
    assigned_floor: 6,
    room_start: '601',
    room_end: '609',
    label: 'JeetBhai (601–609)',
  },
  {
    id: 'usr-wing-6b',
    email: 'patelparam2111@gmail.com',
    password: 'Wing@1234',
    full_name: 'Param (Floor 6: 610-618)',
    role: 'WING_LEADER',
    assigned_floor: 6,
    room_start: '610',
    room_end: '618',
    label: 'Param (610–618)',
  },
];

const getStoredUsers = () => {
  const data = localStorage.getItem(USERS_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(LEADER_ACCOUNTS));
    return LEADER_ACCOUNTS;
  }
  return JSON.parse(data);
};

export const authService = {
  login: async (email, password) => {
    try {
      // 1. Try Live Render API first
      const data = await apiClient('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (data?.access_token) {
        setToken(data.access_token);
      }
      return data;
    } catch {
      // 2. Offline / local fallback
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

      // If user is logging in with any new email, register them
      const isMain = email.toLowerCase().includes('admin') || email.toLowerCase().includes('main');
      const newUser = {
        id: `usr-${Date.now()}`,
        email: email.trim(),
        password: password,
        full_name: email.split('@')[0].replace('.', ' ').toUpperCase(),
        role: isMain ? 'MAIN_LEADER' : 'WING_LEADER',
        assigned_floor: isMain ? null : 4,
        room_start: isMain ? null : '401',
        room_end: isMain ? null : '409',
      };

      users.push(newUser);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      setToken(`jwt-token-${newUser.id}`);
      return { user: newUser, access_token: `jwt-token-${newUser.id}` };
    }
  },

  register: async ({ full_name, email, password, role = 'MAIN_LEADER', assigned_floor = null, room_start = null, room_end = null }) => {
    try {
      return await apiClient('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ full_name, email, password, role, assigned_floor, room_start, room_end }),
      });
    } catch {
      const users = getStoredUsers();
      const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
      if (existing) {
        existing.password = password;
        existing.full_name = full_name;
        existing.role = role;
        existing.assigned_floor = assigned_floor;
        existing.room_start = room_start;
        existing.room_end = room_end;
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
        room_start,
        room_end,
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
