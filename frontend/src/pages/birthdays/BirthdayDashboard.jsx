import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStudents } from '../../context/StudentContext';
import { useNotifications } from '../../context/NotificationContext';
import { birthdayService } from '../../services/birthdayService';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatDate, calculateAge, getDaysUntilBirthday } from '../../utils/helpers';
import {
  Cake,
  Sparkles,
  MessageCircle,
  Clock,
  Send,
  Calendar,
  CheckCircle2,
  Phone,
  AlertCircle,
} from 'lucide-react';

export const BirthdayDashboard = () => {
  const { stats } = useStudents();
  const { showToast } = useNotifications();
  const [sendingId, setSendingId] = useState(null);

  const handleSendGreeting = async (student) => {
    setSendingId(student.id);
    try {
      await birthdayService.sendWhatsAppGreeting(
        student.id,
        `Dear ${student.full_name}, Wishing you a very Happy Birthday from Hari-Saurabh Hostel Management!`
      );
      showToast(`Greeting sent to ${student.full_name} (${student.whatsapp_number})`, 'success');
    } catch (err) {
      showToast('Failed to dispatch greeting', 'error');
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-gold-500 to-amber-600 rounded-[28px] p-6 sm:p-8 text-white shadow-soft-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Automated Celebration Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Birthday Dashboard & Alerts
            </h2>
            <p className="text-amber-100 text-xs sm:text-sm">
              WhatsApp 9:00 AM auto-greeting • 24-Hour & 6-Hour Wing Leader proactive reminders
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="birthday" size="lg" className="px-4 py-2 bg-white text-gold-700 shadow-soft-sm font-black">
              🎂 {stats.todayBirthdaysCount} Today • {stats.weekBirthdaysCount} This Week
            </Badge>
          </div>
        </div>
      </div>

      {/* Today's Celebrations Spotlight */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cake className="w-6 h-6 text-gold-500" />
            <h3 className="text-xl font-bold text-[#4A4A4A]">Today's Celebrations</h3>
          </div>
          <span className="text-xs font-semibold text-gray-500">
            Automated WhatsApp Greetings @ 9:00 AM IST
          </span>
        </div>

        {stats.todayBirthdays.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.todayBirthdays.map((student) => (
              <Card
                key={student.id}
                className="border-2 border-gold-400 bg-gradient-to-b from-gold-50/50 to-white shadow-gold-glow relative overflow-hidden"
              >
                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-1 bg-gold-500 text-white font-extrabold text-[11px] rounded-full animate-pulse shadow-sm">
                    Today 🎂
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-gold-400 to-amber-300 shadow-soft-sm shrink-0">
                    <img
                      src={student.profile_image_url}
                      alt={student.full_name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-[#4A4A4A]">{student.full_name}</h4>
                    <p className="text-xs text-gray-500">{student.department}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <Badge variant="gold" size="sm">Floor {student.floor_number}</Badge>
                      <Badge variant="gray" size="sm">Room {student.room_number}</Badge>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gold-200 text-xs text-gray-600 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Turning:</span>
                    <span className="font-bold text-[#4A4A4A]">{calculateAge(student.dob)} Years Old</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Mobile:</span>
                    <span className="font-semibold text-gray-700">{student.student_mobile}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <Button
                    variant="primary"
                    size="sm"
                    isLoading={sendingId === student.id}
                    onClick={() => handleSendGreeting(student)}
                    icon={Sparkles}
                    className="w-full text-xs"
                  >
                    Send Greeting
                  </Button>
                  <a
                    href={`https://wa.me/${student.whatsapp_number?.replace(/\D/g, '')}?text=Happy%20Birthday%20${encodeURIComponent(student.full_name)}!%20Wishing%20you%20a%20fantastic%20year%20from%20Hari-Saurabh%20Hostel.`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button variant="secondary" size="sm" icon={MessageCircle} className="w-full text-xs">
                      WhatsApp Direct
                    </Button>
                  </a>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <Cake className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-[#4A4A4A]">No Birthdays Today</h4>
            <p className="text-xs text-gray-500 mt-1">
              Check upcoming birthdays below to prepare celebration plans.
            </p>
          </Card>
        )}
      </div>

      {/* Upcoming Birthdays Roster */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-[#4A4A4A]">Upcoming Birthdays (Next 30 Days)</h3>
            <p className="text-xs text-gray-500">
              Automated 24h & 6h reminders will dispatch notifications to Wing Leaders
            </p>
          </div>
          <Badge variant="gold" size="sm">{stats.weekBirthdays.length} This Week</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase">
                <th className="pb-3">Student</th>
                <th className="pb-3">Floor / Room</th>
                <th className="pb-3">Birthday Date</th>
                <th className="pb-3">Countdown</th>
                <th className="pb-3">Automated Reminders</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.weekBirthdays.map((student) => {
                const daysLeft = getDaysUntilBirthday(student.dob);
                return (
                  <tr key={student.id} className="hover:bg-gold-50/40 transition-colors">
                    <td className="py-3.5 flex items-center gap-3">
                      <img
                        src={student.profile_image_url}
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
                      {daysLeft === 0 ? (
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 animate-pulse">
                          🎉 Today!
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-gold-700 bg-gold-50 px-2.5 py-1 rounded-lg border border-gold-200">
                          In {daysLeft} Days
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 text-xs text-green-700 font-medium">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                        24h & 6h Scheduled
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <Link to={`/student/${student.id}`}>
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
                      </Link>
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
