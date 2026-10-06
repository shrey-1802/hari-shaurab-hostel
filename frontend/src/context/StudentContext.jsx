import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { studentService } from '../services/studentService';
import { notificationService } from '../services/notificationService';
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
      // Synchronize database notifications & browser push alerts for Today and Tomorrow
      notificationService.syncBirthdayNotifications(data, user).catch(() => {});
    } catch (error) {
      console.error('Failed to load students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();

    // 5-second live cloud sync interval: Ensures Wing Leader changes automatically
    // reflect to Main Leader and Main Leader changes reflect to Wing Leaders in real-time
    const syncInterval = setInterval(() => {
      fetchStudents();
    }, 5000);

    // Listen for storage updates across tabs & window focus
    const handleRefresh = () => {
      fetchStudents();
    };
    window.addEventListener('storage', handleRefresh);
    window.addEventListener('student_data_changed', handleRefresh);
    window.addEventListener('focus', handleRefresh);

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('storage', handleRefresh);
      window.removeEventListener('student_data_changed', handleRefresh);
      window.removeEventListener('focus', handleRefresh);
    };
  }, [user]);

  // Helper to check if a room is in leader's assigned room range (e.g. 401-409)
  const isRoomInScope = (room, start, end) => {
    if (!start || !end || !room) return true;
    const sDigits = parseInt(String(start).replace(/\D/g, ''), 10);
    const eDigits = parseInt(String(end).replace(/\D/g, ''), 10);
    const rDigits = parseInt(String(room).replace(/\D/g, ''), 10);
    if (!isNaN(sDigits) && !isNaN(eDigits) && !isNaN(rDigits)) {
      return rDigits >= sDigits && rDigits <= eDigits;
    }
    return String(room) >= String(start) && String(room) <= String(end);
  };

  // Check if current user has permission to view/edit a given student
  const canAccessStudent = (student) => {
    if (!user || !student) return false;
    const role = (user.role || '').toUpperCase();
    if (role === ROLES.MAIN_LEADER || role === 'MAIN_LEADER') return true;
    const assignedFloor = user.assigned_floor ?? user.floor_number;
    if (assignedFloor !== null && assignedFloor !== undefined && Number(student.floor_number) !== Number(assignedFloor)) return false;
    return isRoomInScope(student.room_number, user.room_start, user.room_end);
  };

  // Calculate live occupancy for a room (Max 2 capacity per room)
  const getRoomOccupancy = (floor, room, excludeStudentId = null) => {
    if (!room || !floor) {
      return { count: 0, capacity: 2, isFull: false, availableSlots: 2, students: [] };
    }
    const roomStudents = students.filter((s) => {
      if (excludeStudentId && s.id === excludeStudentId) return false;
      return (
        s.floor_number === Number(floor) &&
        String(s.room_number).trim().toLowerCase() === String(room).trim().toLowerCase()
      );
    });
    const count = roomStudents.length;
    return {
      count,
      capacity: 2,
      isFull: count >= 2,
      availableSlots: Math.max(0, 2 - count),
      students: roomStudents,
    };
  };

  // Filter based on user role:
  // - Main Leader: can see all students across all floors/wings
  // - Wing Leader: ONLY sees students allocated to their assigned floor & room range
  const visibleStudents = useMemo(() => {
    const isMain = (user?.role || '').toUpperCase() === ROLES.MAIN_LEADER;
    const assignedFloor = user?.assigned_floor || user?.floor_number;
    const roomStart = user?.room_start;
    const roomEnd = user?.room_end;

    return students.filter((student) => {
      // 1. Role-based scoping
      if (!isMain) {
        if (assignedFloor !== null && assignedFloor !== undefined && Number(student.floor_number) !== Number(assignedFloor)) return false;
        if (roomStart && roomEnd && !isRoomInScope(student.room_number, roomStart, roomEnd)) {
          return false;
        }
      } else if (selectedFloor !== 'ALL') {
        if (Number(student.floor_number) !== Number(selectedFloor)) return false;
      }

      // 2. Department filter
      if (selectedDept !== 'ALL' && student.department !== selectedDept) {
        return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = student.full_name?.toLowerCase().includes(q);
        const matchesRoom = student.room_number?.toLowerCase().includes(q);
        const matchesDept = student.department?.toLowerCase().includes(q);
        const matchesCollege = student.college_name?.toLowerCase().includes(q);
        const matchesMobile = student.student_mobile?.includes(q);
        const matchesCreator = student.creator_name?.toLowerCase().includes(q);
        if (!matchesName && !matchesRoom && !matchesDept && !matchesCollege && !matchesMobile && !matchesCreator) {
          return false;
        }
      }

      return true;
    });
  }, [students, user, selectedFloor, selectedDept, searchQuery]);

  const addStudent = async (studentData) => {
    const created = await studentService.create(studentData, user);
    setStudents((prev) => [created, ...prev]);
    return created;
  };

  const updateStudent = async (id, studentData) => {
    const updated = await studentService.update(id, studentData);
    setStudents((prev) => prev.map((s) => (s.id === id ? updated : s)));
    return updated;
  };

  const deleteStudent = async (id) => {
    await studentService.delete(id);
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  // Metrics
  const stats = useMemo(() => {
    const isMain = (user?.role || '').toUpperCase() === ROLES.MAIN_LEADER;
    const scopedList = isMain ? students : visibleStudents;

    const todayBirthdays = scopedList.filter((s) => isBirthdayToday(s.dob));
    const weekBirthdays = scopedList.filter((s) => isBirthdayThisWeek(s.dob));
    const floorCounts = { 4: 0, 6: 0 };
    scopedList.forEach((s) => {
      if (floorCounts[s.floor_number] !== undefined) {
        floorCounts[s.floor_number]++;
      }
    });

    return {
      totalStudents: scopedList.length,
      todayBirthdaysCount: todayBirthdays.length,
      weekBirthdaysCount: weekBirthdays.length,
      floorCounts,
      todayBirthdays,
      weekBirthdays,
    };
  }, [students, visibleStudents, user]);

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
        getRoomOccupancy,
        canAccessStudent,
        isRoomInScope,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export const useStudents = () => useContext(StudentContext);
