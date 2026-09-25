import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { AnimatedLogo } from '../ui/AnimatedLogo';
import { Bell, User, LogOut, ShieldCheck, Sparkles, PlusCircle } from 'lucide-react';
import { Button } from '../ui/Button';

export const Navbar = ({ isLanding = false }) => {
  const { user, logout, isMainLeader } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-md border-b border-gray-200/80 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-3 group">
          <div className="p-1 rounded-xl bg-gold-50 group-hover:bg-gold-100 transition-colors">
            <img
              src="/logo.png"
              alt="Hari-Saurabh Hostel Logo"
              className="h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#4A4A4A] leading-tight flex items-center gap-1.5">
              HARI-SAURABH <span className="gold-gradient-text font-black">HOSTEL</span>
            </span>
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500">
              Smart Hostel System
            </span>
          </div>
        </Link>

        {/* Navigation Links for Landing Page */}
        {isLanding ? (
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-gold-600 transition-colors">Features</a>
            <a href="#preview" className="hover:text-gold-600 transition-colors">Directory Preview</a>
            <a href="#birthdays" className="hover:text-gold-600 transition-colors">Birthday Engine</a>
            <a href="#about" className="hover:text-gold-600 transition-colors">About</a>
            <a href="#contact" className="hover:text-gold-600 transition-colors">Contact</a>
          </nav>
        ) : null}

        {/* Action Controls & User Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          {user ? (
            <>
              {/* Quick Add Student Button (Main Leader or Wing Leader) */}
              <Link to="/add-student" className="hidden sm:block">
                <Button size="sm" variant="secondary" icon={PlusCircle}>
                  Add Student
                </Button>
              </Link>

              {/* Notification Bell with Gold Dot */}
              <Link
                to="/notifications"
                className="relative p-2.5 rounded-xl text-gray-600 hover:text-gold-600 hover:bg-gold-50/80 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold-500 text-[10px] font-bold text-white shadow-gold-glow animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </Link>

              {/* User Avatar & Info */}
              <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
                <Link to="/profile" className="flex items-center gap-2 group">
                  <div className="relative">
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={user.full_name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-gold-400 group-hover:ring-gold-500 transition-all"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  </div>
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs font-bold text-[#4A4A4A] group-hover:text-gold-600 transition-colors leading-tight">
                      {user.full_name}
                    </span>
                    <span className="text-[10px] font-semibold text-gold-600 uppercase">
                      {isMainLeader ? 'Main Leader' : `Floor ${user.assigned_floor} Leader`}
                    </span>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button size="md" variant="primary" icon={ShieldCheck}>
                  Leader Login
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
