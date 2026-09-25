import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { MainLeaderDashboard } from './MainLeaderDashboard';
import { WingLeaderDashboard } from './WingLeaderDashboard';
import { ROLES } from '../../utils/constants';

export const DashboardPage = () => {
  const { user } = useAuth();
  
  if (user?.role === ROLES.WING_LEADER) {
    return <WingLeaderDashboard />;
  }

  return <MainLeaderDashboard />;
};
