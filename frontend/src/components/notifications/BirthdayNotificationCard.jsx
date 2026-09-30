import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cake, Calendar, User, MapPin, Sparkles, MessageCircle } from 'lucide-react';
import { WishOnWhatsAppButton } from '../birthdays/WishOnWhatsAppButton';
import { Button } from '../ui/Button';
import {
  formatDate,
  formatBirthdayDateOnly,
  isBirthdayToday,
  isBirthdayTomorrow,
  calculateAge,
} from '../../utils/helpers';

/**
 * BirthdayNotificationCard
 * 
 * Rich birthday notification card for drawer & notification center:
 * - Title: Birthday Reminder
 * - Student Photo, Name, Room, Floor, Birthday Date
 * - Timing Badge: Gold "Today" or "Tomorrow"
 * - Actions: [View Profile] and [Wish on WhatsApp]
 * - Strictly manual WhatsApp redirect (No automated sending)
 */
export const BirthdayNotificationCard = ({
  student,
  notification,
  onActionClick,
  className = '',
}) => {
  // Support either full student object or notification record with student info
  const studentData = student || {
    id: notification?.student_id,
    full_name: notification?.student_name,
    profile_image_url: notification?.student_avatar,
    student_mobile: notification?.student_phone,
    whatsapp_number: notification?.student_phone,
    room_number: notification?.room_number,
    floor_number: notification?.floor_number,
    dob: notification?.dob,
    department: notification?.department || 'Resident',
  };

  if (!studentData?.id && !notification?.student_id) return null;

  const isToday = notification?.timing_type === 'TODAY' || isBirthdayToday(studentData.dob);
  const isTomorrow = notification?.timing_type === 'TOMORROW' || isBirthdayTomorrow(studentData.dob);
  const age = calculateAge(studentData.dob);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`p-4 rounded-2xl bg-white border transition-all duration-200 flex flex-col justify-between ${
        isToday
          ? 'border-2 border-gold-400 bg-gradient-to-r from-gold-50/40 via-white to-amber-50/30 shadow-gold-subtle ring-1 ring-gold-200'
          : isTomorrow
          ? 'border-2 border-gold-300/80 bg-white shadow-soft-sm'
          : 'border-gray-200 shadow-soft-sm hover:border-gold-300'
      } ${className}`}
    >
      {/* Top Header: Title & Timing Badge */}
      <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-gold-50 text-gold-600 border border-gold-200 flex items-center justify-center">
            <Cake className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-gold-800">
            Birthday Reminder 🎂
          </span>
        </div>

        {isToday ? (
          <span className="px-2.5 py-0.5 rounded-full bg-gold-500 text-white text-[10px] font-black uppercase tracking-wide shadow-gold-glow animate-pulse">
            Today
          </span>
        ) : isTomorrow ? (
          <span className="px-2.5 py-0.5 rounded-full bg-gold-100 text-gold-800 border border-gold-300 text-[10px] font-black uppercase tracking-wide">
            Tomorrow
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-bold">
            Upcoming
          </span>
        )}
      </div>

      {/* Main Content: Avatar, Name, Room & Floor */}
      <div className="flex items-center gap-3.5 my-1">
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-gold-400 via-amber-300 to-gold-200 shadow-soft-sm">
            <img
              src={studentData.profile_image_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={studentData.full_name}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          {isToday && (
            <span className="absolute -bottom-1 -right-1 text-xs">🎉</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-extrabold text-[#4A4A4A] truncate">
            {studentData.full_name}
          </h4>
          <p className="text-xs text-gray-600 mt-0.5">
            {studentData.full_name}'s birthday is {isToday ? 'today' : 'tomorrow'}!
          </p>
          <div className="flex items-center gap-2 text-[11px] text-gray-500 font-semibold mt-1">
            <span className="text-gray-700">Room {studentData.room_number}</span>
            <span>•</span>
            <span>Floor {studentData.floor_number}</span>
            {studentData.dob && (
              <>
                <span>•</span>
                <span className="text-gold-700 font-bold">{formatBirthdayDateOnly(studentData.dob)}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Actions: [View Profile] and [Wish on WhatsApp] */}
      <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2">
        <Link
          to={`/student/${studentData.id}`}
          onClick={onActionClick}
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
          studentPhone={studentData.whatsapp_number || studentData.student_mobile}
          studentName={studentData.full_name}
          size="sm"
          variant={isToday ? 'primary' : 'secondary'}
          className="w-full text-xs font-bold"
          onClick={onActionClick}
        />
      </div>
    </motion.div>
  );
};
