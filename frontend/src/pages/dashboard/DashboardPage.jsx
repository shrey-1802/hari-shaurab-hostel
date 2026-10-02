import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { MainLeaderDashboard } from './MainLeaderDashboard';
import { WingLeaderDashboard } from './WingLeaderDashboard';
import { ROLES } from '../../utils/constants';
import { usePageTitle } from '../../utils/usePageTitle';

export const DashboardPage = () => {
  const { user } = useAuth();
  usePageTitle('Dashboard');
  
  if (user?.role === ROLES.WING_LEADER) {
    return <WingLeaderDashboard />;
  }

  return <MainLeaderDashboard />;
};
