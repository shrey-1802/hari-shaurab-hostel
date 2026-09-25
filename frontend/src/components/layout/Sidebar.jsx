import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Cake,
  Bell,
  Settings,
  Shield,
  LogOut,
  Sparkles,
} from 'lucide-react';

export const Sidebar = () => {
  const { user, logout, isMainLeader, switchRole } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/students', label: 'Student Directory', icon: Users },
    { to: '/add-student', label: 'Add Student', icon: UserPlus },
    { to: '/birthdays', label: 'Birthdays & Alerts', icon: Cake },
    {
      to: '/notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : null,
    },
    { to: '/settings', label: 'Settings & API', icon: Settings },
  ];

  return (
    <aside className="w-72 bg-white border-r border-gray-200/80 min-h-[calc(100vh-80px)] flex flex-col justify-between py-6 px-4 select-none shrink-0 shadow-soft-sm">
      {/* Navigation Group */}
      <div className="space-y-6">
        {/* Role Badge Banner */}
        <div className="bg-gradient-to-r from-gold-50 to-amber-50/60 p-4 rounded-2xl border border-gold-200/70">
          <div className="flex items-center gap-2 text-gold-700 font-bold text-xs uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4 text-gold-600" />
            <span>Active Session</span>
          </div>
          <p className="text-sm font-extrabold text-[#4A4A4A] truncate">{user?.full_name}</p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gold-200/60">
            <span className="text-[11px] font-semibold text-gray-500">
              {isMainLeader ? 'All Floors Access' : `Floor ${user?.assigned_floor} Only`}
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-gold-500 text-white">
              {user?.role}
            </span>
          </div>
        </div>

        {/* Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gold-50 text-gold-700 border-l-4 border-gold-500 shadow-sm font-bold pl-3'
                      : 'text-gray-600 hover:bg-gold-50/50 hover:text-gold-700'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-gold-500 text-white shadow-gold-glow animate-pulse">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Role Quick-Switcher for Testing/Demo & Logout */}
      <div className="pt-6 border-t border-gray-100 space-y-4">
        <div className="px-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-gold-500" />
            Quick Demo Switcher
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <button
              onClick={() => switchRole('MAIN_LEADER')}
              className={`p-2 rounded-xl text-center border transition-all ${
                isMainLeader
                  ? 'bg-gold-500 text-white border-gold-600 font-bold shadow-sm'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gold-50'
              }`}
            >
              Main Leader
            </button>
            <button
              onClick={() => switchRole('WING_LEADER', 2)}
              className={`p-2 rounded-xl text-center border transition-all ${
                !isMainLeader
                  ? 'bg-gold-500 text-white border-gold-600 font-bold shadow-sm'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gold-50'
              }`}
            >
              Floor 2 Wing
            </button>
          </div>
        </div>

        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
