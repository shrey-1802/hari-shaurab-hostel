import React, { useState, useMemo } from 'react';
import { Cake, Sparkles, Filter, Users, Calendar, AlertCircle } from 'lucide-react';
import { useStudents } from '../../context/StudentContext';
import { useAuth } from '../../context/AuthContext';
import { BirthdayAlertCard } from './BirthdayAlertCard';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  getDaysUntilBirthday,
  isBirthdayToday,
  isBirthdayTomorrow,
} from '../../utils/helpers';
import { FLOORS } from '../../utils/constants';

/**
 * BirthdayDashboardSection
 * 
 * Comprehensive Birthday Section for Main Leader & Wing Leader Dashboards:
 * - Highlights Today's and Tomorrow's (1 Day Before) birthdays with Gold Badges
 * - Grid of BirthdayAlertCards with manual WhatsApp wish triggers
 * - Wing/Floor filtering & tab filtering
 * - Strict adherence to manual wishing (No automatic messages sent)
 */
export const BirthdayDashboardSection = ({ className = '' }) => {
  const { students } = useStudents();
  const { user, isMainLeader } = useAuth();
  const [filterTab, setFilterTab] = useState('approaching'); // 'approaching' | 'today' | 'tomorrow' | 'week'
  const [selectedFloor, setSelectedFloor] = useState('ALL');

  // Role-based floor constraint
  const effectiveFloor = !isMainLeader && user?.assigned_floor ? String(user.assigned_floor) : selectedFloor;

  // Filter students based on floor and birthday proximity
  const filteredStudents = useMemo(() => {
    return students
      .map((student) => ({
        ...student,
        daysUntil: getDaysUntilBirthday(student.dob),
      }))
      .filter((student) => {
        // Floor check
        if (effectiveFloor !== 'ALL') {
          if (student.floor_number !== Number(effectiveFloor)) return false;
        }

        // Tab check
        if (filterTab === 'today') {
          return student.daysUntil === 0;
        }
        if (filterTab === 'tomorrow') {
          return student.daysUntil === 1;
        }
        if (filterTab === 'approaching') {
          return student.daysUntil === 0 || student.daysUntil === 1;
        }
        if (filterTab === 'week') {
          return student.daysUntil >= 0 && student.daysUntil <= 7;
        }
        return true;
      })
      .sort((a, b) => a.daysUntil - b.daysUntil);
  }, [students, effectiveFloor, filterTab]);

  // Overall counts for badges
  const stats = useMemo(() => {
    const list = !isMainLeader && user?.assigned_floor
      ? students.filter((s) => s.floor_number === user.assigned_floor)
      : students;

    const todayCount = list.filter((s) => isBirthdayToday(s.dob)).length;
    const tomorrowCount = list.filter((s) => isBirthdayTomorrow(s.dob)).length;
    const weekCount = list.filter((s) => {
      const d = getDaysUntilBirthday(s.dob);
      return d >= 0 && d <= 7;
    }).length;

    return { todayCount, tomorrowCount, weekCount, total: list.length };
  }, [students, isMainLeader, user]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Section Header Card */}
      <div className="bg-white rounded-[28px] p-6 sm:p-7 border border-gray-200/80 shadow-soft-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-gold-400 to-amber-300 text-white flex items-center justify-center shadow-gold-glow">
              <Cake className="w-6 h-6 text-gold-900" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#4A4A4A]">Upcoming Birthdays</h3>
                {stats.todayCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-gold-500 text-white text-xs font-black shadow-gold-glow animate-pulse">
                    {stats.todayCount} Today 🎂
                  </span>
                )}
                {stats.tomorrowCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-gold-100 text-gold-800 border border-gold-300 text-xs font-bold">
                    {stats.tomorrowCount} Tomorrow 🎈
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                {isMainLeader
                  ? 'Real-time hostel birthday alerts • Manual WhatsApp wish dispatch'
                  : `Floor ${user?.assigned_floor || 2} Wing Leader alerts • Manual WhatsApp wishing`}
              </p>
            </div>
          </div>

          {/* Controls: Floor selector for Main Leader & Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {isMainLeader && (
              <div className="flex items-center gap-1.5 bg-gray-50 p-1.5 rounded-2xl border border-gray-200 text-xs font-semibold">
                <span className="text-gray-400 pl-2">Wing:</span>
                <button
                  onClick={() => setSelectedFloor('ALL')}
                  className={`px-3 py-1 rounded-xl transition-all ${
                    selectedFloor === 'ALL'
                      ? 'bg-gold-500 text-white font-bold shadow-soft-sm'
                      : 'text-gray-600 hover:text-gold-600'
                  }`}
                >
                  All Floors
                </button>
                {FLOORS.map((fl) => (
                  <button
                    key={fl}
                    onClick={() => setSelectedFloor(String(fl))}
                    className={`px-2.5 py-1 rounded-xl transition-all ${
                      selectedFloor === String(fl)
                        ? 'bg-gold-500 text-white font-bold shadow-soft-sm'
                        : 'text-gray-600 hover:text-gold-600'
                    }`}
                  >
                    Fl {fl}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-5 mt-5 border-t border-gray-100">
          <button
            onClick={() => setFilterTab('approaching')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              filterTab === 'approaching'
                ? 'bg-gold-500 text-white shadow-gold-subtle'
                : 'bg-gray-100 text-gray-600 hover:bg-gold-50 hover:text-gold-700'
            }`}
          >
            <span>⚡ Approaching Alerts ({stats.todayCount + stats.tomorrowCount})</span>
          </button>
          <button
            onClick={() => setFilterTab('today')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              filterTab === 'today'
                ? 'bg-gold-500 text-white shadow-gold-subtle'
                : 'bg-gray-100 text-gray-600 hover:bg-gold-50 hover:text-gold-700'
            }`}
          >
            <span>🎂 Today ({stats.todayCount})</span>
          </button>
          <button
            onClick={() => setFilterTab('tomorrow')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              filterTab === 'tomorrow'
                ? 'bg-gold-500 text-white shadow-gold-subtle'
                : 'bg-gray-100 text-gray-600 hover:bg-gold-50 hover:text-gold-700'
            }`}
          >
            <span>🎈 Tomorrow ({stats.tomorrowCount})</span>
          </button>
          <button
            onClick={() => setFilterTab('week')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              filterTab === 'week'
                ? 'bg-gold-500 text-white shadow-gold-subtle'
                : 'bg-gray-100 text-gray-600 hover:bg-gold-50 hover:text-gold-700'
            }`}
          >
            <span>📅 Next 7 Days ({stats.weekCount})</span>
          </button>
        </div>

        {/* Policy Notice: Manual WhatsApp wishes */}
        <div className="mt-4 p-3 rounded-2xl bg-gold-50/70 border border-gold-200 text-xs text-gold-900 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-gold-600 shrink-0" />
            <span>
              <strong>Manual WhatsApp Wish Policy:</strong> The leader manually decides whether to send wishes. Clicking "Wish on WhatsApp" redirects directly to WhatsApp chat.
            </span>
          </div>
          <span className="hidden md:inline-block text-[11px] font-bold text-gold-800 bg-white/80 px-2.5 py-1 rounded-lg border border-gold-300">
            No Auto Messaging
          </span>
        </div>
      </div>

      {/* Cards Grid */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-[24px] p-12 text-center border border-gray-200">
          <Cake className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-[#4A4A4A]">No Birthdays Found for Selected Filter</h4>
          <p className="text-xs text-gray-400 mt-1">
            Try selecting another floor or view the "Next 7 Days" tab.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <BirthdayAlertCard key={student.id} student={student} />
          ))}
        </div>
      )}
    </div>
  );
};
