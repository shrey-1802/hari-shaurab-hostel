import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useStudents } from '../../context/StudentContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Users,
  Building2,
  Cake,
  UserPlus,
  ArrowRight,
  Sparkles,
  Shield,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { formatDate } from '../../utils/helpers';

export const WingLeaderDashboard = () => {
  const { user } = useAuth();
  const { visibleStudents, stats } = useStudents();
  const assignedFloor = user?.assigned_floor || 2;

  const floorStudents = visibleStudents;
  const floorBirthdays = floorStudents.filter(s => {
    const dob = new Date(s.dob);
    const today = new Date();
    return dob.getMonth() === today.getMonth();
  });

  return (
    <div className="space-y-8">
      {/* Wing Leader Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-gold-500 to-amber-500 rounded-[28px] p-6 sm:p-8 text-white shadow-soft-md">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            Wing Leader • Floor {assignedFloor} Roster
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Floor {assignedFloor} Residence Overview
          </h2>
          <p className="text-amber-100 text-xs sm:text-sm">
            Managing {floorStudents.length} assigned residents on your floor
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/add-student">
            <Button size="md" className="bg-white text-gold-700 hover:bg-gold-50 font-bold shadow-soft-sm" icon={UserPlus}>
              Add Floor {assignedFloor} Student
            </Button>
          </Link>
        </div>
      </div>

      {/* 3 KPI Cards for Wing Leader */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card hover={true} className="border-l-4 border-l-gold-500">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Assigned Students</span>
            <div className="w-10 h-10 rounded-2xl bg-gold-50 text-gold-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#4A4A4A]">{floorStudents.length} Residents</div>
          <p className="text-xs text-gray-500 mt-2">All rooms accounted for on Floor {assignedFloor}</p>
        </Card>

        <Card hover={true} className="border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Floor Birthdays</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Cake className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-600">{floorBirthdays.length} This Month</div>
          <p className="text-xs text-gray-500 mt-2">Automated reminders scheduled</p>
        </Card>

        <Card hover={true} className="border-l-4 border-l-green-500">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Access Clearance</span>
            <div className="w-10 h-10 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-green-600">Active</div>
          <p className="text-xs text-gray-500 mt-2">Authorized Wing Leader credentials</p>
        </Card>
      </div>

      {/* Floor Student List */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-[#4A4A4A]">Floor {assignedFloor} Student List</h3>
            <p className="text-xs text-gray-500">Quick contact and room access for all residents</p>
          </div>
          <Link to="/students">
            <Button variant="secondary" size="sm" icon={ArrowRight}>
              Open Directory
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase">
                <th className="pb-3">Student</th>
                <th className="pb-3">Room</th>
                <th className="pb-3">Department</th>
                <th className="pb-3">DOB</th>
                <th className="pb-3">Mobile</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {floorStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gold-50/50 transition-colors">
                  <td className="py-3.5 flex items-center gap-3">
                    <img
                      src={student.profile_image_url}
                      alt={student.full_name}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-gold-300"
                    />
                    <div>
                      <div className="font-bold text-[#4A4A4A]">{student.full_name}</div>
                      <div className="text-xs text-gray-400">{student.college_name}</div>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <Badge variant="gray" size="sm">{student.room_number}</Badge>
                  </td>
                  <td className="py-3.5 text-xs text-gray-600 font-medium">{student.department}</td>
                  <td className="py-3.5 text-xs text-gray-600">{formatDate(student.dob)}</td>
                  <td className="py-3.5 text-xs text-gray-600">{student.student_mobile}</td>
                  <td className="py-3.5 text-right">
                    <Link to={`/student/${student.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
