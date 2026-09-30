import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cake, ArrowRight, Sparkles, Calendar, MessageCircle } from 'lucide-react';
import { useStudents } from '../../context/StudentContext';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';
import { WishOnWhatsAppButton } from './WishOnWhatsAppButton';
import {
  getDaysUntilBirthday,
  isBirthdayToday,
  isBirthdayTomorrow,
  formatBirthdayDateOnly,
  getBirthdayBadgeInfo,
} from '../../utils/helpers';

/**
 * UpcomingBirthdaysWidget
 * 
 * Dashboard widget displaying:
 * - Student Photo
 * - Student Name
 * - Birthday Date
 * - Countdown ("Today", "1 Day Left", "X Days Left")
 * - Wish on WhatsApp action (Direct chat redirect)
 */
export const UpcomingBirthdaysWidget = ({ maxItems = 4, className = '' }) => {
  const { students } = useStudents();
  const { user, isMainLeader } = useAuth();

  // Filter students based on role
  const relevantStudents = students.filter((s) => {
    if (!isMainLeader && user?.assigned_floor) {
      return s.floor_number === user.assigned_floor;
    }
    return true;
  });

  // Sort by days until birthday (0 = Today, 1 = Tomorrow, ...)
  const upcomingList = relevantStudents
    .map((s) => ({
      ...s,
      daysUntil: getDaysUntilBirthday(s.dob),
    }))
    .filter((s) => s.daysUntil <= 14) // Next 14 days
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, maxItems);

  const todayCount = upcomingList.filter((s) => s.daysUntil === 0).length;
  const tomorrowCount = upcomingList.filter((s) => s.daysUntil === 1).length;

  return (
    <div className={`bg-white rounded-[24px] p-6 border border-gray-200/80 shadow-soft-sm flex flex-col justify-between ${className}`}>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gold-50 text-gold-600 flex items-center justify-center border border-gold-200">
              <Cake className="w-5 h-5 text-gold-600" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#4A4A4A] flex items-center gap-2">
                <span>Upcoming Birthdays</span>
                {todayCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-gold-500 text-white text-[10px] font-black animate-pulse">
                    {todayCount} Today! 🎂
                  </span>
                )}
              </h3>
              <p className="text-xs text-gray-500">
                {isMainLeader ? 'Hostel-wide birthday alerts' : `Floor ${user?.assigned_floor || 2} birthday roster`}
              </p>
            </div>
          </div>

          <Link
            to="/birthdays"
            className="text-xs font-bold text-gold-600 hover:text-gold-700 flex items-center gap-1 group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* List of approaching birthdays */}
        {upcomingList.length === 0 ? (
          <div className="text-center py-8 px-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
            <Cake className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-[#4A4A4A]">No Birthdays in the Next 14 Days</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Check back later or view the full directory.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingList.map((student) => {
              const badge = getBirthdayBadgeInfo(student.dob);
              const isToday = student.daysUntil === 0;
              const isTomorrow = student.daysUntil === 1;

              return (
                <motion.div
                  key={student.id}
                  whileHover={{ x: 2 }}
                  className={`p-3 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 ${
                    isToday
                      ? 'bg-gradient-to-r from-gold-50/90 to-amber-50/70 border-gold-300 shadow-soft-sm ring-1 ring-gold-200'
                      : isTomorrow
                      ? 'bg-gold-50/40 border-gold-200/80'
                      : 'bg-white hover:bg-gray-50/80 border-gray-100'
                  }`}
                >
                  {/* Photo & Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-gold-400 to-amber-200 shadow-soft-sm">
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
                      <Link
                        to={`/student/${student.id}`}
                        className="text-xs sm:text-sm font-bold text-[#4A4A4A] hover:text-gold-600 transition-colors truncate block"
                      >
                        {student.full_name}
                      </Link>
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                        <span>Room {student.room_number}</span>
                        <span>•</span>
                        <span>Fl. {student.floor_number}</span>
                        <span>•</span>
                        <span className="text-gray-600 font-medium">{formatBirthdayDateOnly(student.dob)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Countdown Badge & Quick Wish Button */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isToday ? (
                      <span className="px-2.5 py-1 rounded-full bg-gold-500 text-white text-[10px] font-extrabold shadow-gold-glow animate-pulse">
                        Today
                      </span>
                    ) : isTomorrow ? (
                      <span className="px-2.5 py-1 rounded-full bg-gold-100 text-gold-800 border border-gold-300 text-[10px] font-extrabold">
                        1 Day Left
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-bold">
                        {badge.countdownText}
                      </span>
                    )}

                    <WishOnWhatsAppButton
                      studentPhone={student.whatsapp_number || student.student_mobile}
                      studentName={student.full_name}
                      size="compact"
                      variant={isToday ? 'primary' : 'outline'}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer info banner */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-gold-600" />
          Direct WhatsApp Chat link
        </span>
        <span className="text-gray-400 font-medium">Manual wishing</span>
      </div>
    </div>
  );
};
