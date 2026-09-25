import React from 'react';
import { Link } from 'react-router-dom';
import { useStudents } from '../../context/StudentContext';
import { useNotifications } from '../../context/NotificationContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Users,
  Building2,
  Cake,
  Bell,
  UserPlus,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Calendar,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';
import { isBirthdayToday, formatDate } from '../../utils/helpers';

export const MainLeaderDashboard = () => {
  const { students, stats } = useStudents();
  const { notifications, unreadCount } = useNotifications();

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-gold-500 via-amber-500 to-gold-600 rounded-[28px] p-6 sm:p-8 text-white shadow-soft-md">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Main Leader Administration
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hari-Saurabh Command Center
          </h2>
          <p className="text-amber-100 text-xs sm:text-sm">
            All 5 residential floors active • Real-time student roster & automated birthday sync
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/add-student">
            <Button size="md" className="bg-white text-gold-700 hover:bg-gold-50 font-bold shadow-soft-sm" icon={UserPlus}>
              Register New Student
            </Button>
          </Link>
          <Link to="/birthdays">
            <Button size="md" variant="outline" className="text-white border-white/60 hover:bg-white/10" icon={Cake}>
              Birthdays ({stats.todayBirthdaysCount})
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Cards Per Row (Per UI_UX_GUIDELINES.md) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Students */}
        <Card hover={true} className="border-l-4 border-l-gold-500">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Residents</span>
            <div className="w-10 h-10 rounded-2xl bg-gold-50 text-gold-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#4A4A4A]">{stats.totalStudents}</div>
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <span className="flex items-center text-green-600 font-semibold gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> 100% Enrolled
            </span>
            <Link to="/students" className="font-bold text-gold-600 hover:underline">
              View all →
            </Link>
          </div>
        </Card>

        {/* Card 2: Floor Distribution */}
        <Card hover={true} className="border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Floors</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#4A4A4A]">5 Wings</div>
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <span>Fl. 1-5 Operational</span>
            <span className="font-semibold text-blue-600">Full Coverage</span>
          </div>
        </Card>

        {/* Card 3: Upcoming Birthdays */}
        <Card hover={true} className="border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Birthdays This Week</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Cake className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-600">
            {stats.weekBirthdaysCount}
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <span className="font-semibold text-amber-700">
              {stats.todayBirthdaysCount > 0 ? `🎉 ${stats.todayBirthdaysCount} Today!` : 'No birthdays today'}
            </span>
            <Link to="/birthdays" className="font-bold text-gold-600 hover:underline">
              Automations →
            </Link>
          </div>
        </Card>

        {/* Card 4: Notifications */}
        <Card hover={true} className="border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Live Alerts</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#4A4A4A]">{unreadCount} Unread</div>
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <span>24h & 6h Triggers Active</span>
            <Link to="/notifications" className="font-bold text-purple-600 hover:underline">
              Review →
            </Link>
          </div>
        </Card>
      </div>

      {/* Floor Occupancy Distribution & Today's Celebrations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Floor Occupancy Visualizer (7 cols) */}
        <div className="lg:col-span-7">
          <Card className="h-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-[#4A4A4A]">Floor-wise Student Distribution</h3>
                <p className="text-xs text-gray-500">Real-time student density across residential wings</p>
              </div>
              <Badge variant="gold" size="sm">5 Floors Active</Badge>
            </div>

            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((floor) => {
                const count = stats.floorCounts[floor] || 0;
                const percentage = stats.totalStudents > 0 ? Math.round((count / stats.totalStudents) * 100) : 0;
                return (
                  <div key={floor} className="space-y-1.5 p-3 rounded-2xl hover:bg-gold-50/50 transition-colors">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center gap-2 text-[#4A4A4A]">
                        <span className="w-2.5 h-2.5 rounded-full bg-gold-500"></span>
                        Floor {floor} Wing
                      </span>
                      <span className="text-gray-600 font-semibold">
                        {count} Students ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-gold-400 to-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 8)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">Need to reassign rooms?</span>
              <Link to="/students">
                <Button variant="secondary" size="sm" icon={ArrowRight}>
                  Open Directory
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Birthday Highlights (5 cols) */}
        <div className="lg:col-span-5">
          <Card className="h-full border-t-4 border-t-gold-500">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Cake className="w-5 h-5 text-gold-600" />
                <h3 className="text-lg font-bold text-[#4A4A4A]">Birthday Center</h3>
              </div>
              <Link to="/birthdays" className="text-xs font-bold text-gold-600 hover:underline">
                View All
              </Link>
            </div>

            {stats.todayBirthdays.length > 0 ? (
              <div className="space-y-4">
                {stats.todayBirthdays.map((student) => (
                  <div
                    key={student.id}
                    className="p-4 rounded-2xl bg-gradient-to-r from-gold-50 to-amber-50/60 border border-gold-300 shadow-soft-sm relative overflow-hidden"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={student.profile_image_url}
                        alt={student.full_name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-gold-400"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-[#4A4A4A] truncate">{student.full_name}</h4>
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-gold-500 text-white animate-pulse">
                            Today 🎂
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Floor {student.floor_number} • Room {student.room_number}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Link to={`/student/${student.id}`} className="flex-1">
                        <Button size="sm" variant="secondary" className="w-full text-xs">
                          Profile
                        </Button>
                      </Link>
                      <a
                        href={`https://wa.me/${student.whatsapp_number?.replace(/\D/g, '')}?text=Happy%20Birthday%20${encodeURIComponent(student.full_name)}!%20Wishing%20you%20a%20wonderful%20year%20ahead%20from%20Hari-Saurabh%20Hostel.`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1"
                      >
                        <Button size="sm" variant="primary" className="w-full text-xs" icon={MessageCircle}>
                          WhatsApp
                        </Button>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Cake className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-medium">No birthdays today</p>
                <p className="text-xs text-gray-400 mt-1">Check upcoming events below</p>
              </div>
            )}

            {/* Upcoming peek */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Coming Up This Week ({stats.weekBirthdays.length})
              </h5>
              <div className="space-y-2">
                {stats.weekBirthdays.slice(0, 3).map((student) => (
                  <div key={student.id} className="flex items-center justify-between text-xs py-1.5 px-2 rounded-xl hover:bg-gray-50">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      <span className="font-semibold text-gray-700">{student.full_name}</span>
                    </div>
                    <span className="text-gray-500 font-medium">{formatDate(student.dob)}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
