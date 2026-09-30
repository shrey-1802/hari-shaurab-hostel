import React from 'react';
import { Cake, Calendar, Sparkles, Clock, PartyPopper } from 'lucide-react';
import { WishOnWhatsAppButton } from './WishOnWhatsAppButton';
import {
  formatDate,
  formatBirthdayDateOnly,
  getNextBirthdayDate,
  getDaysUntilBirthday,
  calculateAge,
  isBirthdayToday,
  isBirthdayTomorrow,
  getBirthdayBadgeInfo,
} from '../../utils/helpers';

/**
 * BirthdayProfileSection
 * 
 * Birthday Information Section on the Student Profile Page:
 * - Date Of Birth
 * - Age
 * - Next Birthday Date
 * - Countdown ("Today!", "Tomorrow!", "In X Days")
 * - Wish on WhatsApp Button (opens https://wa.me/{studentPhone} in new tab)
 */
export const BirthdayProfileSection = ({ student, className = '' }) => {
  if (!student || !student.dob) return null;

  const isToday = isBirthdayToday(student.dob);
  const isTomorrow = isBirthdayTomorrow(student.dob);
  const daysUntil = getDaysUntilBirthday(student.dob);
  const age = calculateAge(student.dob);
  const nextBirthdayFormatted = getNextBirthdayDate(student.dob);
  const badgeInfo = getBirthdayBadgeInfo(student.dob);

  return (
    <div
      className={`bg-white rounded-[24px] p-6 border transition-all duration-300 ${
        isToday
          ? 'border-2 border-gold-400 shadow-gold-glow ring-2 ring-gold-200'
          : isTomorrow
          ? 'border-2 border-gold-300 shadow-gold-subtle'
          : 'border-gray-200/80 shadow-soft-sm'
      } ${className}`}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gold-50 text-gold-600 flex items-center justify-center border border-gold-200">
            <Cake className="w-5 h-5 text-gold-600" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[#4A4A4A] flex items-center gap-2">
              <span>Birthday Information</span>
              {isToday && (
                <span className="px-2.5 py-0.5 rounded-full bg-gold-500 text-white text-[10px] font-black uppercase tracking-wide animate-pulse shadow-gold-glow">
                  Today 🎂
                </span>
              )}
              {isTomorrow && (
                <span className="px-2.5 py-0.5 rounded-full bg-gold-100 text-gold-800 border border-gold-300 text-[10px] font-black uppercase tracking-wide">
                  Tomorrow 🎈
                </span>
              )}
            </h3>
            <p className="text-xs text-gray-500">Resident milestone & celebration status</p>
          </div>
        </div>

        {/* WhatsApp Wish Action in Header */}
        <WishOnWhatsAppButton
          studentPhone={student.whatsapp_number || student.student_mobile}
          studentName={student.full_name}
          size="sm"
          variant={isToday ? 'primary' : 'secondary'}
        />
      </div>

      {/* Birthday Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        {/* Date of Birth */}
        <div className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-1">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-gold-600" />
            Date of Birth
          </span>
          <p className="text-sm font-extrabold text-[#4A4A4A]">{formatDate(student.dob)}</p>
          <span className="text-[11px] text-gray-500 font-semibold">{age} Years Old</span>
        </div>

        {/* Next Birthday Date */}
        <div className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-1">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <PartyPopper className="w-3.5 h-3.5 text-gold-600" />
            Next Birthday
          </span>
          <p className="text-sm font-extrabold text-[#4A4A4A]">{nextBirthdayFormatted}</p>
          <span className="text-[11px] text-gold-700 font-bold">Turning {age + (isToday ? 0 : 1)}</span>
        </div>

        {/* Countdown */}
        <div
          className={`p-3.5 rounded-2xl border space-y-1 ${
            isToday
              ? 'bg-gold-50 border-gold-300'
              : isTomorrow
              ? 'bg-amber-50/60 border-amber-200'
              : 'bg-gray-50/80 border-gray-100'
          }`}
        >
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-gold-600" />
            Countdown
          </span>
          <p
            className={`text-sm font-black ${
              isToday ? 'text-gold-700 animate-pulse' : isTomorrow ? 'text-amber-700' : 'text-[#4A4A4A]'
            }`}
          >
            {isToday ? 'Today! 🎂' : isTomorrow ? 'Tomorrow (1 Day Left) 🎈' : `In ${daysUntil} Days`}
          </p>
          <span className="text-[11px] text-gray-500 font-semibold">
            {isToday ? 'Celebrate today' : isTomorrow ? 'Approaching alert active' : 'Scheduled reminder'}
          </span>
        </div>

        {/* Manual Wish Status */}
        <div className="p-3.5 rounded-2xl bg-gold-50/50 border border-gold-200/80 space-y-1 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-gold-700 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-gold-600" />
              Manual WhatsApp Wish
            </span>
            <p className="text-xs text-gray-600 mt-1">
              Direct chat on: <span className="font-bold text-[#4A4A4A]">{student.whatsapp_number || student.student_mobile}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
