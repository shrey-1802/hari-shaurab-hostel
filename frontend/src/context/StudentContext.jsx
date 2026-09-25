import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { studentService } from '../services/studentService';
import { isBirthdayToday, isBirthdayThisWeek } from '../utils/helpers';
import { useAuth } from './AuthContext';
import { ROLES } from '../utils/constants';

const StudentContext = createContext();

export const StudentProvider = ({ children }) => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('ALL');
  const [selectedDept, setSelectedDept] = useState('ALL');

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await studentService.getAll();
      setStudents(data);
    } catch (error) {
      console.error('Failed to load students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Filter based on user role (Floor leader only sees their floor) and UI filters
  const visibleStudents = useMemo(() => {
    return students.filter(student => {
      // Role-based floor restriction
      if (user?.role === ROLES.WING_LEADER && user.assigned_floor) {
        if (student.floor_number !== user.assigned_floor) return false;
      } else if (selectedFloor !== 'ALL') {
        if (student.floor_number !== Number(selectedFloor)) return false;
      }

      // Department filter
      if (selectedDept !== 'ALL' && student.department !== selectedDept) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = student.full_name?.toLowerCase().includes(q);
        const matchesRoom = student.room_number?.toLowerCase().includes(q);
        const matchesDept = student.department?.toLowerCase().includes(q);
        const matchesCollege = student.college_name?.toLowerCase().includes(q);
        const matchesMobile = student.student_mobile?.includes(q);
        if (!matchesName && !matchesRoom && !matchesDept && !matchesCollege && !matchesMobile) {
          return false;
        }
      }

      return true;
    });
  }, [students, user, selectedFloor, selectedDept, searchQuery]);

  const addStudent = async (studentData) => {
    const created = await studentService.create(studentData);
    setStudents(prev => [created, ...prev]);
    return created;
  };

  const updateStudent = async (id, studentData) => {
    const updated = await studentService.update(id, studentData);
    setStudents(prev => prev.map(s => s.id === id ? updated : s));
    return updated;
  };

  const deleteStudent = async (id) => {
    await studentService.delete(id);
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  // Metrics
  const stats = useMemo(() => {
    const todayBirthdays = students.filter(s => isBirthdayToday(s.dob));
    const weekBirthdays = students.filter(s => isBirthdayThisWeek(s.dob));
    const floorCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    students.forEach(s => {
      if (floorCounts[s.floor_number] !== undefined) {
        floorCounts[s.floor_number]++;
      }
    });

    return {
      totalStudents: students.length,
      todayBirthdaysCount: todayBirthdays.length,
      weekBirthdaysCount: weekBirthdays.length,
      floorCounts,
      todayBirthdays,
      weekBirthdays,
    };
  }, [students]);

  return (
    <StudentContext.Provider
      value={{
        students,
        visibleStudents,
        loading,
        searchQuery,
        setSearchQuery,
        selectedFloor,
        setSelectedFloor,
        selectedDept,
        setSelectedDept,
        fetchStudents,
        addStudent,
        updateStudent,
        deleteStudent,
        stats,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export const useStudents = () => useContext(StudentContext);
