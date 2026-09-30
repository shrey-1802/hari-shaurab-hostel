import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Cake,
  Bell,
  CheckCheck,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Radio,
  Trash2,
} from 'lucide-react';
import { useStudents } from '../../context/StudentContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { BirthdayNotificationCard } from './BirthdayNotificationCard';
import { pushNotificationService } from '../../services/pushNotificationService';
import { Button } from '../ui/Button';
import {
  getDaysUntilBirthday,
  isBirthdayToday,
  isBirthdayTomorrow,
  formatDate,
} from '../../utils/helpers';

/**
 * NotificationDrawer
 * 
 * Slide-over drawer with tabs, browser push permission controls,
 * and birthday notification cards with [View Profile] and [Wish on WhatsApp] actions.
 */
export const NotificationDrawer = ({ isOpen, onClose }) => {
  const { students } = useStudents();
  const { user, isMainLeader } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll, showToast } = useNotifications();
  const [activeTab, setActiveTab] = useState('birthdays'); // 'birthdays' | 'all'
  const [permissionState, setPermissionState] = useState('default');
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  useEffect(() => {
    setPermissionState(pushNotificationService.getPermissionState());
  }, [isOpen]);

  const handleEnablePush = async () => {
    setIsRequestingPermission(true);
    const result = await pushNotificationService.requestPermission();
    setPermissionState(pushNotificationService.getPermissionState());
    setIsRequestingPermission(false);

    if (result.success) {
      showToast('Browser Push Notifications Enabled! 🎂', 'success');
      // Trigger a test push notification
      await pushNotificationService.sendTestNotification();
    } else {
      showToast('Push notification permission was denied', 'info');
    }
  };

  const handleTestPush = async () => {
    const res = await pushNotificationService.sendTestNotification();
    if (res.success) {
      showToast('Test push notification dispatched to your browser!', 'success');
    }
  };

  // Filter scoped students for the leader
  const relevantStudents = students.filter((s) => {
    if (!isMainLeader && user?.assigned_floor) {
      return s.floor_number === user.assigned_floor;
    }
    return true;
  });

  // Approaching birthdays (Today = 0, Tomorrow = 1, upcoming within 7 days)
  const approachingBirthdays = relevantStudents
    .map((s) => ({
      ...s,
      daysUntil: getDaysUntilBirthday(s.dob),
    }))
    .filter((s) => s.daysUntil <= 7)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  const todayCount = approachingBirthdays.filter((s) => s.daysUntil === 0).length;
  const tomorrowCount = approachingBirthdays.filter((s) => s.daysUntil === 1).length;
  const totalAlerts = todayCount + tomorrowCount;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
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
                    <span>Notifications & Alerts</span>
                    {totalAlerts > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full bg-gold-500 text-white text-[11px] font-black shadow-gold-glow animate-pulse">
                        {totalAlerts} Alert{totalAlerts > 1 ? 's' : ''}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {isMainLeader ? 'Hostel-wide alerts' : `Floor ${user?.assigned_floor || 2} Wing notifications`}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Browser Push Permission Banner */}
            <div className="bg-white px-6 py-3 border-b border-gray-200">
              {permissionState === 'granted' ? (
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-green-700 font-bold">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                    Browser Push Enabled
                  </span>
                  <button
                    onClick={handleTestPush}
                    className="text-[11px] text-gold-700 font-bold hover:underline bg-gold-50 px-2 py-0.5 rounded-md border border-gold-200"
                  >
                    Test Push
                  </button>
                </div>
              ) : permissionState === 'denied' ? (
                <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Browser notifications blocked. Allow in browser address bar.</span>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-gold-50/90 border border-gold-200 text-xs">
                  <div className="flex items-center gap-2 text-gold-900">
                    <Radio className="w-4 h-4 text-gold-600 shrink-0 animate-pulse" />
                    <span className="font-semibold">Enable Browser Push Alerts?</span>
                  </div>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleEnablePush}
                    isLoading={isRequestingPermission}
                    className="text-[11px] py-1 px-2.5 shadow-none"
                  >
                    Enable
                  </Button>
                </div>
              )}
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
                <span>System Logs ({notifications.length})</span>
              </button>
            </div>

            {/* Drawer Body List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
              {activeTab === 'birthdays' ? (
                <>
                  {/* Manual WhatsApp Note */}
                  <div className="p-3 rounded-2xl bg-gold-50/70 border border-gold-200 text-xs text-gold-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-gold-600 shrink-0" />
                    <span className="font-semibold leading-relaxed">
                      Click <strong>"Wish on WhatsApp"</strong> to open direct chat. No automatic messages are sent.
                    </span>
                  </div>

                  {approachingBirthdays.length === 0 ? (
                    <div className="text-center py-16 px-4 bg-white rounded-2xl border border-gray-200">
                      <Cake className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h4 className="text-sm font-bold text-[#4A4A4A]">No Birthdays Approaching</h4>
                      <p className="text-xs text-gray-400 mt-1">
                        No birthdays in the next 7 days for your assigned wing.
                      </p>
                    </div>
                  ) : (
                    approachingBirthdays.map((student) => (
                      <BirthdayNotificationCard
                        key={student.id}
                        student={student}
                        onActionClick={onClose}
                      />
                    ))
                  )}
                </>
              ) : (
                /* System Notifications */
                <div className="space-y-3">
                  {notifications.length === 0 ? (
                    <div className="text-center py-16 px-4 bg-white rounded-2xl border border-gray-200">
                      <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h4 className="text-sm font-bold text-[#4A4A4A]">No Notifications</h4>
                      <p className="text-xs text-gray-400 mt-1">You are all caught up!</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => !notif.is_read && markAsRead(notif.id)}
                        className={`p-4 rounded-2xl bg-white border transition-all duration-200 cursor-pointer ${
                          !notif.is_read
                            ? 'border-l-4 border-l-gold-500 bg-gold-50/20 shadow-soft-sm'
                            : 'border-gray-200 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-extrabold text-[#4A4A4A]">{notif.title}</h4>
                          <span className="text-[10px] text-gray-400">{formatDate(notif.created_at)}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">{notif.message}</p>
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

              <div className="flex items-center gap-2">
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
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
