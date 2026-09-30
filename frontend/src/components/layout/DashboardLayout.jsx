import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Toast } from '../ui/Toast';
import { useNotifications } from '../../context/NotificationContext';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Cake,
  Bell,
  Settings,
} from 'lucide-react';

export const DashboardLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { unreadCount } = useNotifications();

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col w-full max-w-full overflow-x-hidden">
      {/* Top Navbar */}
      <Navbar
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto relative min-w-0">
        {/* Desktop Fixed Sidebar */}
        <div className="hidden lg:block shrink-0">
          <Sidebar />
        </div>

        {/* Mobile / Tablet Drawer Sidebar */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-fade-in"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Slide-in Drawer Container */}
            <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl z-10 flex flex-col animate-slide-right">
              <Sidebar onClose={() => setIsMobileMenuOpen(false)} isMobile={true} />
            </div>
          </div>
        )}

        {/* Main Content Area: Fully Responsive & Prevents Overflow */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 overflow-y-auto w-full min-w-0 max-w-full pb-24 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (For fast thumb navigation on mobile phones) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-gray-200/80 px-2 py-1.5 shadow-lg">
        <div className="flex items-center justify-around">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex flex-col items-center py-1 px-2.5 rounded-xl text-[10px] font-bold transition-colors ${
                isActive ? 'text-gold-600 bg-gold-50/80' : 'text-gray-500 hover:text-gray-900'
              }`
            }
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/students"
            className={({ isActive }) =>
              `flex flex-col items-center py-1 px-2.5 rounded-xl text-[10px] font-bold transition-colors ${
                isActive ? 'text-gold-600 bg-gold-50/80' : 'text-gray-500 hover:text-gray-900'
              }`
            }
          >
            <Users className="w-5 h-5 mb-0.5" />
            <span>Directory</span>
          </NavLink>

          <NavLink
            to="/add-student"
            className={({ isActive }) =>
              `flex flex-col items-center py-1 px-2.5 rounded-xl text-[10px] font-bold transition-colors ${
                isActive ? 'text-gold-600 bg-gold-50/80' : 'text-gray-500 hover:text-gray-900'
              }`
            }
          >
            <UserPlus className="w-5 h-5 mb-0.5" />
            <span>Add</span>
          </NavLink>

          <NavLink
            to="/birthdays"
            className={({ isActive }) =>
              `flex flex-col items-center py-1 px-2.5 rounded-xl text-[10px] font-bold transition-colors ${
                isActive ? 'text-gold-600 bg-gold-50/80' : 'text-gray-500 hover:text-gray-900'
              }`
            }
          >
            <Cake className="w-5 h-5 mb-0.5" />
            <span>Birthdays</span>
          </NavLink>

          <NavLink
            to="/notifications"
            className={({ isActive }) =>
              `flex flex-col items-center py-1 px-2.5 rounded-xl text-[10px] font-bold transition-colors relative ${
                isActive ? 'text-gold-600 bg-gold-50/80' : 'text-gray-500 hover:text-gray-900'
              }`
            }
          >
            <div className="relative">
              <Bell className="w-5 h-5 mb-0.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-gold-500 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </div>
            <span>Alerts</span>
          </NavLink>
        </div>
      </div>

      <Toast />
    </div>
  );
};

