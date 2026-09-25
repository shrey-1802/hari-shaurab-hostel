import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStudents } from '../../context/StudentContext';
import { useAuth } from '../../context/AuthContext';
import { StudentCard } from './StudentCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { FLOORS, DEPARTMENTS, ROLES } from '../../utils/constants';
import { formatDate } from '../../utils/helpers';
import {
  Search,
  Filter,
  UserPlus,
  LayoutGrid,
  List,
  Download,
  Building2,
  Sparkles,
  Users,
} from 'lucide-react';

export const StudentList = () => {
  const { user, isMainLeader } = useAuth();
  const {
    visibleStudents,
    loading,
    searchQuery,
    setSearchQuery,
    selectedFloor,
    setSelectedFloor,
    selectedDept,
    setSelectedDept,
    deleteStudent,
  } = useStudents();

  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  const handleExportCSV = () => {
    if (!visibleStudents.length) return;
    const headers = ['ID,Full Name,Floor,Room,DOB,Mobile,Parent Name,Parent Mobile,Department,College'];
    const rows = visibleStudents.map(s =>
      `"${s.id}","${s.full_name}",${s.floor_number},"${s.room_number}","${s.dob}","${s.student_mobile}","${s.parent_name}","${s.parent_mobile}","${s.department}","${s.college_name}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hari-saurabh-students-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#4A4A4A]">Student Directory</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {isMainLeader
              ? `Showing ${visibleStudents.length} students across all 5 hostel floors`
              : `Showing ${visibleStudents.length} assigned students on Floor ${user?.assigned_floor}`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="md" onClick={handleExportCSV} icon={Download}>
            Export CSV
          </Button>
          <Link to="/add-student">
            <Button variant="primary" size="md" icon={UserPlus}>
              Add Student
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-center">
          {/* Search Box */}
          <div className="lg:col-span-5">
            <Input
              placeholder="Search by student name, room 201-A, mobile..."
              icon={Search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Floor Filter (If Main Leader) */}
          {isMainLeader ? (
            <div className="lg:col-span-3">
              <select
                value={selectedFloor}
                onChange={(e) => setSelectedFloor(e.target.value)}
                className="w-full h-[52px] px-4 bg-white border border-[#DADADA] rounded-[14px] text-sm text-[#4A4A4A] focus:outline-none focus:border-gold-500 focus:ring-4 focus:ring-gold-100 font-semibold"
              >
                <option value="ALL">🏢 All Floors (1-5)</option>
                {FLOORS.map((f) => (
                  <option key={f} value={f}>
                    Floor {f} Wing
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="lg:col-span-3">
              <div className="h-[52px] px-4 bg-gold-50 border border-gold-200 rounded-[14px] flex items-center text-xs font-bold text-gold-800">
                🏢 Locked to Floor {user?.assigned_floor}
              </div>
            </div>
          )}

          {/* Department Filter */}
          <div className="lg:col-span-3">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full h-[52px] px-4 bg-white border border-[#DADADA] rounded-[14px] text-sm text-[#4A4A4A] focus:outline-none focus:border-gold-500 focus:ring-4 focus:ring-gold-100 font-semibold truncate"
            >
              <option value="ALL">🎓 All Departments</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Grid / List Toggle */}
          <div className="lg:col-span-1 flex justify-end">
            <div className="flex items-center bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-sm text-gold-600' : 'text-gray-400 hover:text-gray-700'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'table' ? 'bg-white shadow-sm text-gold-600' : 'text-gray-400 hover:text-gray-700'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Student Content */}
      {visibleStudents.length === 0 ? (
        /* Empty State */
        <Card className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-gold-50 text-gold-500 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#4A4A4A]">No Students Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-6">
            We could not find any student matching your active search query or floor filters.
          </p>
          <div className="flex justify-center gap-3">
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                setSearchQuery('');
                setSelectedFloor('ALL');
                setSelectedDept('ALL');
              }}
            >
              Clear Filters
            </Button>
            <Link to="/add-student">
              <Button variant="primary" size="md" icon={UserPlus}>
                Add New Student
              </Button>
            </Link>
          </div>
        </Card>
      ) : viewMode === 'grid' ? (
        /* 4 Cards Per Row Grid (Desktop: 4, Tablet: 2, Mobile: 1) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
          {visibleStudents.map((student) => (
            <StudentCard key={student.id} student={student} onDelete={deleteStudent} />
          ))}
        </div>
      ) : (
        /* Table View */
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase">
                  <th className="pb-3">Student</th>
                  <th className="pb-3">Floor & Room</th>
                  <th className="pb-3">Department</th>
                  <th className="pb-3">DOB</th>
                  <th className="pb-3">Mobile</th>
                  <th className="pb-3">Parent Name</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visibleStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gold-50/40 transition-colors">
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
                      <div className="flex items-center gap-1.5">
                        <Badge variant="gold" size="sm">Fl. {student.floor_number}</Badge>
                        <Badge variant="gray" size="sm">{student.room_number}</Badge>
                      </div>
                    </td>
                    <td className="py-3.5 text-xs text-gray-600 font-medium">{student.department}</td>
                    <td className="py-3.5 text-xs text-gray-600">{formatDate(student.dob)}</td>
                    <td className="py-3.5 text-xs text-gray-600">{student.student_mobile}</td>
                    <td className="py-3.5 text-xs text-gray-600">{student.parent_name}</td>
                    <td className="py-3.5 text-right">
                      <Link to={`/student/${student.id}`}>
                        <Button variant="primary" size="sm">
                          Profile
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
