import React from 'react';
import { Link } from 'react-router-dom';
import { useStudents } from '../../context/StudentContext';
import { useNotifications } from '../../context/NotificationContext';
import { BirthdayDashboardSection, UpcomingBirthdaysWidget } from '../../components/birthdays';
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
} from 'lucide-react';
import { isBirthdayToday, isBirthdayTomorrow } from '../../utils/helpers';

export const MainLeaderDashboard = () => {
  const { students, stats } = useStudents();
  const { unreadCount } = useNotifications();

  // Approaching alerts count (Today + Tomorrow)
  const approachingCount = students.filter((s) => isBirthdayToday(s.dob) || isBirthdayTomorrow(s.dob)).length;

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
            All 5 residential floors active • Real-time student roster & manual WhatsApp birthday wish engine
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
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Birthdays Approaching</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Cake className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-600">
            {approachingCount}
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <span className="font-semibold text-amber-700">
              {stats.todayBirthdaysCount > 0 ? `🎉 ${stats.todayBirthdaysCount} Today!` : '1 Day Before / Today'}
            </span>
            <Link to="/birthdays" className="font-bold text-gold-600 hover:underline">
              Birthday Hub →
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
            <span>Proactive Wing Alerts</span>
            <Link to="/notifications" className="font-bold text-purple-600 hover:underline">
              Review →
            </Link>
          </div>
        </Card>
      </div>

      {/* Dedicated Birthday Alert Dashboard Section */}
      <BirthdayDashboardSection />

      {/* Floor Occupancy Distribution & Widget Row */}
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
              <span className="text-xs text-gray-500">Need to view student directory?</span>
              <Link to="/students">
                <Button variant="secondary" size="sm" icon={ArrowRight}>
                  Open Directory
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* Upcoming Birthdays Quick Widget (5 cols) */}
        <div className="lg:col-span-5">
          <UpcomingBirthdaysWidget maxItems={4} className="h-full" />
        </div>
      </div>
    </div>
  );
};

