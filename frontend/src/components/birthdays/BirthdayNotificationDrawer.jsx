import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cake, Bell, Calendar, ArrowRight, CheckCheck, Sparkles, User, ExternalLink } from 'lucide-react';
import { useStudents } from '../../context/StudentContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { WishOnWhatsAppButton } from './WishOnWhatsAppButton';
import { Button } from '../ui/Button';
import {
  getDaysUntilBirthday,
  isBirthdayToday,
  isBirthdayTomorrow,
  formatBirthdayDateOnly,
  getBirthdayBadgeInfo,
  formatDate,
} from '../../utils/helpers';

/**
 * BirthdayNotificationDrawer
 * 
 * Top-right notification bell integration & slide-over drawer:
 * - Shows badge count for upcoming birthdays (Today & Tomorrow) + system notifications
 * - Opens sleek slide-over drawer on click
 * - Lists approaching student birthdays with photo, name, room/floor, date, Wish on WhatsApp and View Profile buttons
 * - Allows leaders to quickly wish residents manually on WhatsApp
 */
export const BirthdayNotificationDrawer = ({ isOpen, onClose }) => {
  const { students } = useStudents();
  const { user, isMainLeader } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [activeTab, setActiveTab] = useState('birthdays'); // 'birthdays' | 'all'

  // Filter students based on Leader role
  const relevantStudents = students.filter((s) => {
    if (!isMainLeader && user?.assigned_floor) {
      return s.floor_number === user.assigned_floor;
    }
    return true;
  });

  // Calculate approaching birthdays (Today = 0, Tomorrow = 1, upcoming within 7 days)
  const approachingBirthdays = relevantStudents
    .map((s) => ({
      ...s,
      daysUntil: getDaysUntilBirthday(s.dob),
    }))
    .filter((s) => s.daysUntil <= 7)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  const todayList = approachingBirthdays.filter((s) => s.daysUntil === 0);
  const tomorrowList = approachingBirthdays.filter((s) => s.daysUntil === 1);
  const alertCount = todayList.length + tomorrowList.length;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative w-full max-w-md bg-[#F7F8FA] h-full shadow-2xl flex flex-col z-10 border-l border-gray-200"
          >
            {/* Header */}
            <div className="bg-white px-6 py-5 border-b border-gray-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gold-50 border border-gold-200 flex items-center justify-center text-gold-600">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#4A4A4A] flex items-center gap-2">
                    <span>Birthday Alerts</span>
                    {alertCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-gold-500 text-white text-xs font-black shadow-gold-glow">
                        {alertCount} Actionable
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {isMainLeader ? 'Hostel Command Notifications' : `Floor ${user?.assigned_floor || 2} Wing Alerts`}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                title="Close Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white px-6 py-2 border-b border-gray-200 flex items-center gap-4 text-xs font-bold">
              <button
                onClick={() => setActiveTab('birthdays')}
                className={`pb-2 border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === 'birthdays'
                    ? 'border-gold-500 text-gold-700'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                <Cake className="w-3.5 h-3.5" />
                <span>Birthday Reminders ({approachingBirthdays.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`pb-2 border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === 'all'
                    ? 'border-gold-500 text-gold-700'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>System Alerts ({notifications.length})</span>
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {activeTab === 'birthdays' ? (
                <>
                  {/* Alert summary banner */}
                  <div className="p-3.5 rounded-2xl bg-gold-50/80 border border-gold-200 text-xs text-gold-900 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-gold-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold block">Manual WhatsApp Wishes</span>
                      <p className="text-[11px] text-gold-800 leading-relaxed">
                        Click "Wish on WhatsApp" to open WhatsApp directly with the resident. No automatic messages are sent.
                      </p>
                    </div>
                  </div>

                  {/* Approaching List */}
                  {approachingBirthdays.length === 0 ? (
                    <div className="text-center py-16 px-4 bg-white rounded-2xl border border-gray-200">
                      <Cake className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h4 className="text-sm font-bold text-[#4A4A4A]">No Upcoming Birthdays</h4>
                      <p className="text-xs text-gray-400 mt-1">
                        No birthdays approaching in the next 7 days for your assigned wing.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {approachingBirthdays.map((student) => {
                        const isToday = student.daysUntil === 0;
                        const isTomorrow = student.daysUntil === 1;

                        return (
                          <div
                            key={student.id}
                            className={`p-4 rounded-2xl bg-white border transition-all duration-200 space-y-3 ${
                              isToday
                                ? 'border-2 border-gold-400 shadow-gold-glow ring-1 ring-gold-200'
                                : isTomorrow
                                ? 'border-2 border-gold-200 shadow-soft-sm'
                                : 'border-gray-200 shadow-soft-sm'
                            }`}
                          >
                            {/* Student Header */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="relative shrink-0">
                                  <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-gold-400 to-amber-200 shadow-soft-sm">
                                    <img
                                      src={student.profile_image_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                                      alt={student.full_name}
                                      className="w-full h-full rounded-full object-cover"
                                    />
                                  </div>
                                  {isToday && (
                                    <span className="absolute -bottom-1 -right-1 text-xs">🎂</span>
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <h4 className="text-sm font-extrabold text-[#4A4A4A] truncate">
                                    {student.full_name}
                                  </h4>
                                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-semibold">
                                    <span className="text-gray-700">Room {student.room_number}</span>
                                    <span>•</span>
                                    <span>Floor {student.floor_number}</span>
                                  </div>
                                  <span className="text-[10px] text-gray-400 block truncate">
                                    {student.department}
                                  </span>
                                </div>
                              </div>

                              {/* Timing Badge */}
                              {isToday ? (
                                <span className="px-2.5 py-1 rounded-full bg-gold-500 text-white text-[10px] font-black uppercase tracking-wide shadow-gold-glow animate-pulse">
                                  Today
                                </span>
                              ) : isTomorrow ? (
                                <span className="px-2.5 py-1 rounded-full bg-gold-100 text-gold-800 border border-gold-300 text-[10px] font-black uppercase tracking-wide">
                                  Tomorrow
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-bold">
                                  In {student.daysUntil} Days
                                </span>
                              )}
                            </div>

                            {/* Birthday details note */}
                            <div className="flex items-center justify-between text-xs font-semibold text-gray-600 bg-gray-50/80 px-3 py-1.5 rounded-xl border border-gray-100">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-gold-600" />
                                {formatBirthdayDateOnly(student.dob)}
                              </span>
                              <span className="text-gold-700 font-bold">
                                {isToday ? 'Birthday Today 🎉' : isTomorrow ? '1 Day Left 🎈' : `In ${student.daysUntil} Days`}
                              </span>
                            </div>

                            {/* Actions: View Profile and Wish on WhatsApp */}
                            <div className="grid grid-cols-2 gap-2 pt-1">
                              <Link
                                to={`/student/${student.id}`}
                                onClick={onClose}
                                className="w-full"
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full text-xs font-bold"
                                >
                                  View Profile
                                </Button>
                              </Link>

                              <WishOnWhatsAppButton
                                studentPhone={student.whatsapp_number || student.student_mobile}
                                studentName={student.full_name}
                                size="sm"
                                variant={isToday ? 'primary' : 'secondary'}
                                className="w-full text-xs"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                /* System Notifications List */
                <div className="space-y-3">
                  {notifications.length === 0 ? (
                    <div className="text-center py-16 px-4 bg-white rounded-2xl border border-gray-200">
                      <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h4 className="text-sm font-bold text-[#4A4A4A]">No Notifications</h4>
                      <p className="text-xs text-gray-400 mt-1">You are all caught up!</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => !n.is_read && markAsRead(n.id)}
                        className={`p-4 rounded-2xl bg-white border transition-all duration-200 cursor-pointer ${
                          !n.is_read
                            ? 'border-l-4 border-l-gold-500 bg-gold-50/20 shadow-soft-sm'
                            : 'border-gray-200 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-extrabold text-[#4A4A4A]">{n.title}</h4>
                          <span className="text-[10px] text-gray-400">{formatDate(n.created_at)}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <Link
                to="/notifications"
                onClick={onClose}
                className="text-xs font-bold text-gold-600 hover:text-gold-700 flex items-center gap-1.5"
              >
                <span>Full Notification Center</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              {activeTab === 'all' && unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5 text-gold-600" />
                  Mark Read
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
