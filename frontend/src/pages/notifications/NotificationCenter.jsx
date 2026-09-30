import React from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { useStudents } from '../../context/StudentContext';
import { useAuth } from '../../context/AuthContext';
import { WishOnWhatsAppButton } from '../../components/birthdays';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Bell, Cake, Info, CheckCheck, Sparkles, Clock, ArrowRight } from 'lucide-react';
import { formatDate, formatBirthdayDateOnly, isBirthdayToday, isBirthdayTomorrow, getDaysUntilBirthday } from '../../utils/helpers';

export const NotificationCenter = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { students } = useStudents();
  const { user, isMainLeader } = useAuth();

  // Filter students based on role for birthday alerts
  const relevantStudents = students.filter((s) => {
    if (!isMainLeader && user?.assigned_floor) {
      return s.floor_number === user.assigned_floor;
    }
    return true;
  });

  // Approaching birthdays (Today = 0, Tomorrow = 1)
  const birthdayAlerts = relevantStudents
    .map((s) => ({
      ...s,
      daysUntil: getDaysUntilBirthday(s.dob),
    }))
    .filter((s) => s.daysUntil === 0 || s.daysUntil === 1)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#4A4A4A]">Notification Center</h2>
            {(unreadCount > 0 || birthdayAlerts.length > 0) && (
              <span className="px-2.5 py-0.5 rounded-full bg-gold-500 text-white text-xs font-bold shadow-gold-glow">
                {unreadCount + birthdayAlerts.length} total
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Real-time birthday reminders, wing alerts, and manual WhatsApp wish triggers
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={markAllAsRead} icon={CheckCheck}>
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Approaching Birthday Alerts Section (Notification Cards) */}
      {birthdayAlerts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-gold-800 flex items-center gap-1.5">
              <Cake className="w-4 h-4 text-gold-600" />
              <span>Active Birthday Alerts ({birthdayAlerts.length})</span>
            </h3>
            <span className="text-[11px] text-gray-500 font-semibold">
              Manual WhatsApp Action
            </span>
          </div>

          <div className="space-y-3">
            {birthdayAlerts.map((student) => {
              const isToday = student.daysUntil === 0;
              const isTomorrow = student.daysUntil === 1;

              return (
                <Card
                  key={student.id}
                  className={`border-l-4 transition-all duration-200 ${
                    isToday
                      ? 'border-l-gold-500 bg-gold-50/30 border-gold-300 shadow-soft-sm ring-1 ring-gold-200'
                      : 'border-l-amber-400 bg-white border-gray-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left: Icon, Student info, alert text */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-gold-400 to-amber-300 text-gold-900 flex items-center justify-center shrink-0 shadow-soft-sm font-bold text-lg">
                        🎂
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-extrabold text-[#4A4A4A]">Birthday Alert</h4>
                          {isToday ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-gold-500 text-white text-[10px] font-black uppercase tracking-wide shadow-gold-glow animate-pulse">
                              Today 🎂
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-gold-100 text-gold-800 border border-gold-300 text-[10px] font-extrabold uppercase tracking-wide">
                              Tomorrow 🎈
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-gray-700 font-medium leading-relaxed">
                          <span className="font-extrabold text-[#4A4A4A]">{student.full_name}'s</span> birthday is{' '}
                          {isToday ? 'today' : 'tomorrow'} ({formatBirthdayDateOnly(student.dob)}).
                        </p>

                        <div className="flex items-center gap-2 text-[11px] text-gray-500 font-semibold">
                          <span>Room: {student.room_number}</span>
                          <span>•</span>
                          <span>Floor: {student.floor_number}</span>
                          <span>•</span>
                          <span>Dept: {student.department}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Buttons [View Profile] and [Wish on WhatsApp] */}
                    <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      <Link to={`/student/${student.id}`}>
                        <Button variant="outline" size="sm" className="text-xs font-bold">
                          View Profile
                        </Button>
                      </Link>

                      <WishOnWhatsAppButton
                        studentPhone={student.whatsapp_number || student.student_mobile}
                        studentName={student.full_name}
                        size="sm"
                        variant={isToday ? 'primary' : 'secondary'}
                        className="text-xs"
                      />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* System Notifications List */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
          <Bell className="w-4 h-4 text-gray-400" />
          <span>System Broadcasts & Logs ({notifications.length})</span>
        </h3>

        {notifications.length === 0 && birthdayAlerts.length === 0 ? (
          <Card className="text-center py-16">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-[#4A4A4A]">All Caught Up!</h4>
            <p className="text-xs text-gray-500 mt-1">No pending notifications at this time.</p>
          </Card>
        ) : (
          notifications.map((notif) => (
            <Card
              key={notif.id}
              hover={true}
              onClick={() => !notif.is_read && markAsRead(notif.id)}
              className={`transition-all duration-200 cursor-pointer ${
                !notif.is_read
                  ? 'border-l-4 border-l-gold-500 bg-gold-50/20 shadow-soft-sm'
                  : 'opacity-85 hover:opacity-100'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon based on notification type */}
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    notif.notification_type?.includes('BIRTHDAY')
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {notif.notification_type?.includes('BIRTHDAY') ? (
                    <Cake className="w-5 h-5" />
                  ) : (
                    <Info className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-sm font-bold text-[#4A4A4A] flex items-center gap-2">
                      <span>{notif.title}</span>
                      {!notif.is_read && (
                        <span className="w-2.5 h-2.5 rounded-full bg-gold-500 shadow-gold-glow shrink-0" title="Unread" />
                      )}
                    </h4>
                    <span className="text-[11px] text-gray-400 shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(notif.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{notif.message}</p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

