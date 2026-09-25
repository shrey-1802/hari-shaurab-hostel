import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { DEMO_USERS, ROLES } from '../utils/constants';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('hs_current_user');
    return saved ? JSON.parse(saved) : DEMO_USERS.mainLeader;
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

  const switchRole = (roleType, floor = null) => {
    if (roleType === ROLES.MAIN_LEADER) {
      setUser(DEMO_USERS.mainLeader);
    } else if (floor === 3) {
      setUser(DEMO_USERS.wingLeaderFloor3);
    } else {
      setUser(DEMO_USERS.wingLeaderFloor2);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const isMainLeader = user?.role === ROLES.MAIN_LEADER;
  const isWingLeader = user?.role === ROLES.WING_LEADER;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        switchRole,
        isMainLeader,
        isWingLeader,
        assignedFloor: user?.assigned_floor || null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
