import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('hs_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('hs_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('hs_current_user');
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      const authenticatedUser = response.user || response;
      setUser(authenticatedUser);
      return authenticatedUser;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data) => {
    setLoading(true);
    try {
      const response = await authService.register(data);
      const authenticatedUser = response.user || response;
      setUser(authenticatedUser);
      return authenticatedUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const normalizedRole = (user?.role || '').toUpperCase();
  const isMainLeader = normalizedRole === 'MAIN_LEADER';
  const isWingLeader = normalizedRole === 'WING_LEADER';
  const assignedFloor = user?.floor_number ?? user?.assigned_floor ?? null;
  const roomStart = user?.room_start ?? null;
  const roomEnd = user?.room_end ?? null;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isMainLeader,
        isWingLeader,
        assignedFloor,
        roomStart,
        roomEnd,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
