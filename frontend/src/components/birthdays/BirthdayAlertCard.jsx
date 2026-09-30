import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cake, User, MapPin, Building, Calendar, Phone, Sparkles } from 'lucide-react';
import { WishOnWhatsAppButton } from './WishOnWhatsAppButton';
import { Button } from '../ui/Button';
import {
  formatDate,
  formatBirthdayDateOnly,
  getBirthdayBadgeInfo,
  calculateAge,
  isBirthdayToday,
  isBirthdayTomorrow,
} from '../../utils/helpers';

/**
 * BirthdayAlertCard
 * 
 * Requirements:
 * - White Card
 * - Gold Accent Border
 * - Birthday Icon
 * - Student Profile Picture
 * - Student Name
 * - Room Number
 * - Floor Number
 * - Birthday Date / Timing
 * - Alert Badge: Gold Badge ("Tomorrow" or "Today")
 * - Buttons: [View Profile] and [Wish on WhatsApp]
 */
export const BirthdayAlertCard = ({ student, className = '' }) => {
  if (!student) return null;

  const badgeInfo = getBirthdayBadgeInfo(student.dob);
  const isToday = isBirthdayToday(student.dob);
  const isTomorrow = isBirthdayTomorrow(student.dob);
  const age = calculateAge(student.dob);

  // Determine timing description
  const timingText = isToday
    ? 'Birthday Today'
    : isTomorrow
    ? 'Birthday Tomorrow'
    : `Birthday in ${badgeInfo.label}`;

  // Floor display text (e.g. "6th Floor" or "Floor 2")
  const getFloorLabel = (floorNum) => {
    if (!floorNum) return 'Wing Floor';
    const suffixes = { 1: '1st', 2: '2nd', 3: '3rd', 4: '4th', 5: '5th', 6: '6th' };
    return `${suffixes[floorNum] || `${floorNum}th`} Floor`;
  };

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`relative bg-white rounded-[24px] p-5 sm:p-6 border transition-all duration-300 flex flex-col justify-between ${
        isToday
          ? 'border-2 border-gold-500 shadow-gold-glow ring-1 ring-gold-300/50'
          : isTomorrow
          ? 'border-2 border-gold-300 shadow-gold-subtle hover:border-gold-400'
          : 'border-gold-200/80 shadow-soft-sm hover:border-gold-300'
      } ${className}`}
    >
      {/* Top Header with Birthday Icon & Gold Badge */}
      <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gold-50 text-gold-600 flex items-center justify-center border border-gold-200">
            <Cake className="w-4 h-4 text-gold-600" />
          </div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-gold-800">
            {isToday ? '🎂 Birthday Today' : '🎂 Upcoming Birthday'}
          </span>
        </div>

        {/* Gold Alert Badge */}
        {isToday ? (
          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-gold-500 to-amber-500 text-white text-[11px] font-extrabold uppercase tracking-wide shadow-gold-glow animate-pulse">
            Today
          </span>
        ) : isTomorrow ? (
          <span className="px-3 py-1 rounded-full bg-gold-100 text-gold-800 border border-gold-300 text-[11px] font-extrabold uppercase tracking-wide shadow-soft-sm">
            Tomorrow
          </span>
        ) : (
          <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[10px] font-bold">
            {badgeInfo.shortLabel}
          </span>
        )}
      </div>

      {/* Profile & Info Main Section */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left my-2">
        {/* Profile Avatar with Gold Border */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-gold-400 via-amber-300 to-gold-200 shadow-soft-sm">
            <img
              src={student.profile_image_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
              alt={student.full_name}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          {isToday && (
            <span className="absolute -bottom-1 -right-1 text-lg" title="Birthday Today">
              🎉
            </span>
          )}
        </div>

        {/* Student Details */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <h4 className="text-lg font-extrabold text-[#4A4A4A] truncate tracking-tight" title={student.full_name}>
            {student.full_name}
          </h4>

          {/* Room Number & Floor Number */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-gray-600">
            <span className="px-2.5 py-0.5 rounded-lg bg-gray-100 text-gray-700 border border-gray-200">
              Room {student.room_number}
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-gold-50 text-gold-800 border border-gold-200">
              {getFloorLabel(student.floor_number)}
            </span>
          </div>

          {/* Birthday Date & Timing */}
          <div className="pt-1 flex flex-col gap-0.5">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-semibold text-gray-700">
              <Calendar className="w-3.5 h-3.5 text-gold-600 shrink-0" />
              <span>{formatBirthdayDateOnly(student.dob)} {age ? `(Turning ${age + (isToday ? 0 : 1)})` : ''}</span>
            </div>
            <span className="text-[11px] font-extrabold text-gold-700">
              {timingText}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons: [View Profile] and [Wish on WhatsApp] */}
      <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Link to={`/student/${student.id}`} className="w-full">
          <Button variant="outline" size="sm" className="w-full text-xs font-bold">
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
    </motion.div>
  );
};
