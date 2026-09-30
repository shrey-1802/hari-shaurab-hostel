import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NotificationBell } from '../notifications/NotificationBell';
import { User, LogOut, ShieldCheck, PlusCircle, Menu, X } from 'lucide-react';
import { Button } from '../ui/Button';
import logoImg from '../../assets/logo.png';

export const Navbar = ({ isLanding = false, onToggleMobileMenu, isMobileMenuOpen = false }) => {
  const { user, logout, isMainLeader } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-gray-200/80 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Hamburger (Mobile) + Logo & Brand */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile Menu Toggle Button (when user logged in or on landing) */}
          {user && !isLanding && (
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 text-gray-600 hover:text-gold-600 hover:bg-gold-50/60 rounded-xl transition-colors shrink-0"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          )}

          <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2 sm:gap-3 group min-w-0">
            <div className="p-1 rounded-xl bg-gold-50 group-hover:bg-gold-100 transition-colors shrink-0">
              <img
                src={logoImg}
                alt="Hari-Saurabh Hostel Logo"
                className="h-8 sm:h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-sm sm:text-xl tracking-tight text-[#4A4A4A] leading-tight flex items-center gap-1 truncate">
                HARI-SAURABH <span className="gold-gradient-text font-black">HOSTEL</span>
              </span>
              <span className="text-[9px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500 truncate hidden xs:block">
                Smart Hostel System
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Links for Landing Page */}
        {isLanding ? (
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-gold-600 transition-colors">Features</a>
            <a href="#preview" className="hover:text-gold-600 transition-colors">Directory Preview</a>
            <a href="#birthdays" className="hover:text-gold-600 transition-colors">Birthday Engine</a>
            <a href="#about" className="hover:text-gold-600 transition-colors">About</a>
            <a href="#contact" className="hover:text-gold-600 transition-colors">Contact</a>
          </nav>
        ) : null}

        {/* Action Controls & User Profile */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {user ? (
            <>
              {/* Quick Add Student Button (Hidden on xs mobile to save room) */}
              <Link to="/add-student" className="hidden sm:block">
                <Button size="sm" variant="secondary" icon={PlusCircle}>
                  Add Student
                </Button>
              </Link>

              {/* Notification Bell Component with Badge & Slide-over Drawer */}
              <NotificationBell />

              {/* User Avatar & Info */}
              <div className="flex items-center gap-1.5 sm:gap-3 pl-1 sm:pl-2 border-l border-gray-200">
                <Link to="/profile" className="flex items-center gap-2 group">
                  <div className="relative">
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={user.full_name}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-gold-400 group-hover:ring-gold-500 transition-all"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
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
                  className="p-1.5 sm:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link to="/login">
                <Button size="sm" variant="primary" icon={ShieldCheck}>
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



