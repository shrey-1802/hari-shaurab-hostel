import React from 'react';
import { Link } from 'react-router-dom';
import { useStudents } from '../../context/StudentContext';
import { useNotifications } from '../../context/NotificationContext';
import { BirthdayDashboardSection, WishOnWhatsAppButton } from '../../components/birthdays';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatDate, getDaysUntilBirthday, isBirthdayToday, isBirthdayTomorrow } from '../../utils/helpers';
import {
  Cake,
  Sparkles,
  MessageCircle,
  Calendar,
  CheckCircle2,
  Phone,
  Shield,
  ArrowRight,
} from 'lucide-react';

export const BirthdayDashboard = () => {
  const { students, stats } = useStudents();
  const { showToast } = useNotifications();

  // 1 Day Before (Tomorrow) & Today counts
  const todayBirthdays = students.filter((s) => isBirthdayToday(s.dob));
  const tomorrowBirthdays = students.filter((s) => isBirthdayTomorrow(s.dob));
  const upcomingSorted = [...students]
    .map((s) => ({ ...s, daysUntil: getDaysUntilBirthday(s.dob) }))
    .filter((s) => s.daysUntil <= 30)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-gold-500 to-amber-600 rounded-[28px] p-6 sm:p-8 text-white shadow-soft-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Birthday Alert Hub
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Birthday Alerts & Manual WhatsApp Wishes
            </h2>
            <p className="text-amber-100 text-xs sm:text-sm">
              Proactive alerts for Leaders • 1 Day Before (Tomorrow) & Birthday Today notifications
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="px-4 py-2 rounded-2xl bg-white text-gold-800 shadow-soft-sm font-black text-sm flex items-center gap-2">
              🎂 {todayBirthdays.length} Today • {tomorrowBirthdays.length} Tomorrow
            </span>
          </div>
        </div>
      </div>

      {/* Primary Birthday Dashboard Section */}
      <BirthdayDashboardSection />

      {/* Extended 30-Day Birthday Roster Table */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-[#4A4A4A]">Upcoming Birthdays Schedule (Next 30 Days)</h3>
            <p className="text-xs text-gray-500">
              Complete resident calendar with direct manual WhatsApp contact
            </p>
          </div>
          <Badge variant="gold" size="sm">{upcomingSorted.length} Upcoming</Badge>
        </div>

        <div className="overflow-x-auto w-full min-w-0">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase">
                <th className="pb-3">Student</th>
                <th className="pb-3">Floor / Room</th>
                <th className="pb-3">Birthday Date</th>
                <th className="pb-3">Countdown</th>
                <th className="pb-3">Alert Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {upcomingSorted.map((student) => {
                const daysLeft = student.daysUntil;
                const isToday = daysLeft === 0;
                const isTomorrow = daysLeft === 1;

                return (
                  <tr key={student.id} className="hover:bg-gold-50/40 transition-colors">
                    <td className="py-3.5 flex items-center gap-3">
                      <img
                        src={student.profile_image_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt={student.full_name}
                        className="w-10 h-10 rounded-full object-cover ring-1 ring-gold-300"
                      />
                      <div>
                        <div className="font-bold text-[#4A4A4A]">{student.full_name}</div>
                        <div className="text-xs text-gray-400">{student.department}</div>
                      </div>
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="gold" size="sm">Fl. {student.floor_number}</Badge>
                        <Badge variant="gray" size="sm">{student.room_number}</Badge>
                      </div>
                    </td>
                    <td className="py-3.5 text-xs text-gray-600 font-semibold">{formatDate(student.dob)}</td>
                    <td className="py-3.5">
                      {isToday ? (
                        <span className="text-xs font-extrabold text-white bg-gold-500 px-2.5 py-1 rounded-full shadow-gold-glow animate-pulse">
                          🎉 Today!
                        </span>
                      ) : isTomorrow ? (
                        <span className="text-xs font-extrabold text-gold-800 bg-gold-100 px-2.5 py-1 rounded-full border border-gold-300">
                          🎈 Tomorrow (1 Day Left)
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">
                          In {daysLeft} Days
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 text-xs">
                      {isToday || isTomorrow ? (
                        <span className="text-gold-700 font-extrabold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-gold-500" />
                          Leader Alert Active
                        </span>
                      ) : (
                        <span className="text-gray-400 font-medium">Scheduled</span>
                      )}
                    </td>
                    <td className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <WishOnWhatsAppButton
                          studentPhone={student.whatsapp_number || student.student_mobile}
                          studentName={student.full_name}
                          size="sm"
                          variant={isToday ? 'primary' : 'secondary'}
                          className="text-xs"
                        />
                        <Link to={`/student/${student.id}`}>
                          <Button variant="outline" size="sm" className="text-xs">
                            Profile
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

