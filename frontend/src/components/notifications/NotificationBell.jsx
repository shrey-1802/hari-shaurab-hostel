import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, ShieldCheck } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useStudents } from '../../context/StudentContext';
import { useAuth } from '../../context/AuthContext';
import { pushNotificationService } from '../../services/pushNotificationService';
import { getDaysUntilBirthday } from '../../utils/helpers';
import { NotificationDrawer } from './NotificationDrawer';

/**
 * NotificationBell
 * 
 * Top-right interactive notification bell:
 * - Dynamic badge count (Unread + Approaching Birthday Alerts for current leader)
 * - Browser push permission indicator
 * - Clicking opens the NotificationDrawer
 */
export const NotificationBell = ({ className = '', onBellClick }) => {
  const { unreadCount } = useNotifications();
  const { students } = useStudents();
  const { user, isMainLeader } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [pushStatus, setPushStatus] = useState('default');

  useEffect(() => {
    setPushStatus(pushNotificationService.getPermissionState());
  }, []);

  // Approaching birthdays (Today & Tomorrow)
  const approachingCount = students.filter((s) => {
    if (!isMainLeader && user?.assigned_floor) {
      if (s.floor_number !== user.assigned_floor) return false;
    }
    const days = getDaysUntilBirthday(s.dob);
    return days === 0 || days === 1;
  }).length;

  const totalCount = unreadCount + approachingCount;

  const handleClick = (e) => {
    e.stopPropagation();
    if (onBellClick) {
      onBellClick();
    } else {
      setIsDrawerOpen(true);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="button"
        onClick={handleClick}
        className={`relative p-2.5 rounded-2xl bg-white/90 hover:bg-gold-50/90 text-gray-600 hover:text-gold-600 border border-gray-200/80 shadow-soft-sm transition-all duration-200 ${className}`}
        title={
          totalCount > 0
            ? `${totalCount} Pending Alert${totalCount > 1 ? 's' : ''}`
            : 'Notifications & Birthday Alerts'
        }
      >
        <Bell className="w-5 h-5 transition-transform duration-200" />

        {/* Total Count Badge */}
        {totalCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] px-1.5 items-center justify-center rounded-full bg-gradient-to-r from-gold-500 to-amber-500 text-[10px] font-black text-white shadow-gold-glow animate-pulse">
            {totalCount}
          </span>
        )}

        {/* Small push notification enabled dot */}
        {pushStatus === 'granted' && totalCount === 0 && (
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-green-500 ring-2 ring-white"
            title="Browser Push Notifications Active"
          />
        )}
      </motion.button>

      {/* Slide-over Drawer */}
      <NotificationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
};
