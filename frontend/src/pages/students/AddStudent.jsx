import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStudents } from '../../context/StudentContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FLOORS, DEPARTMENTS } from '../../utils/constants';
import { usePageTitle } from '../../utils/usePageTitle';
import {
  ArrowLeft,
  UserPlus,
  Upload,
  Building2,
  Users,
  GraduationCap,
  Phone,
  Plus,
  X,
} from 'lucide-react';

import { ShareRegistrationLinkCard } from '../../components/registration/ShareRegistrationLinkCard';

export const AddStudent = () => {
  const navigate = useNavigate();
  const { addStudent, getRoomOccupancy, isRoomInScope } = useStudents();
  const { user, isMainLeader } = useAuth();
  const { showToast } = useNotifications();
  usePageTitle('Add New Student');

  const assignedFloor = isMainLeader ? 4 : (user?.floor_number || user?.assigned_floor || 4);
  const roomStart = user?.room_start;
  const roomEnd = user?.room_end;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    student_number: '',
    dob: '',
    student_mobile: '',
    parent_name: '',
    parent_mobile: '',
    college_name: '',
    department: '',
    semester_result: '',
    hobby: '',
    hostel_friends: '',
    non_hostel_friends: '',
    floor_number: assignedFloor,
    room_number: roomStart || '',
    profile_image_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
  });

  // Calculate available room numbers for the active floor
  const floorRoomList = React.useMemo(() => {
    const list = [];
    const floor = Number(formData.floor_number);
    const startNum = !isMainLeader && roomStart ? parseInt(roomStart.replace(/\D/g, ''), 10) : floor * 100 + 1;
    const endNum = !isMainLeader && roomEnd ? parseInt(roomEnd.replace(/\D/g, ''), 10) : floor * 100 + 18;

    for (let r = startNum; r <= endNum; r++) {
      const roomStr = String(r);
      const occ = getRoomOccupancy(floor, roomStr);
      list.push({
        roomNumber: roomStr,
        ...occ,
      });
    }
    return list;
  }, [formData.floor_number, isMainLeader, roomStart, roomEnd, getRoomOccupancy]);

  const selectedRoomOccupancy = React.useMemo(() => {
    if (!formData.room_number) return null;
    return getRoomOccupancy(formData.floor_number, formData.room_number);
  }, [formData.floor_number, formData.room_number, getRoomOccupancy]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, profile_image_url: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validate Date of Birth (compulsory & not > current year)
    if (!formData.dob) {
      showToast('Date of Birth is compulsory.', 'error');
      return;
    }
    const dobDate = new Date(formData.dob);
    const currentYear = new Date().getFullYear();
    if (dobDate >= new Date() || dobDate.getFullYear() > currentYear) {
      showToast('Date of Birth cannot be in the future or exceed current year.', 'error');
      return;
    }

    // 2. Validate WhatsApp Number (compulsory)
    if (!formData.student_mobile || !formData.student_mobile.trim()) {
      showToast('WhatsApp Number is compulsory for student registration.', 'error');
      return;
    }

    // 3. Validate wing leader room range
    if (!isMainLeader && roomStart && roomEnd) {
      if (!isRoomInScope(formData.room_number, roomStart, roomEnd)) {
        showToast(`Access denied: You are assigned to rooms ${roomStart}–${roomEnd} only.`, 'error');
        return;
      }
    }

    // 4. Validate max room capacity = 2
    const occ = getRoomOccupancy(formData.floor_number, formData.room_number);
    if (occ.isFull) {
      showToast(
        `Room ${formData.room_number} is already at full capacity (2/2 students allocated). Please select another room.`,
        'error'
      );
      return;
    }

    // 5. Validate student number
    if (!formData.student_number.trim()) {
      showToast('Student Number / Enrollment ID is required.', 'error');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        date_of_birth: formData.dob,
        whatsapp_number: formData.student_mobile,
      };
      const created = await addStudent(submitData);
      showToast(`${formData.full_name} registered successfully in Room ${formData.room_number}!`, 'success');
      navigate(`/student/${created.id}`);
    } catch (error) {
      showToast(error.message || 'Error registering student. Please check fields.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Link
          to="/students"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gold-600 transition-colors bg-white px-3.5 py-2 rounded-xl border border-gray-200 shadow-soft-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Directory
        </Link>
        <div className="flex items-center gap-2">
          {!isMainLeader && roomStart && (
            <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
              Assigned Rooms: {roomStart}–{roomEnd}
            </span>
          )}
          <span className="text-xs font-bold text-gold-600 bg-gold-50 px-3 py-1.5 rounded-full border border-gold-200">
            Max 2 Students / Room
          </span>
        </div>
      </div>

      {/* Option 1: Share Registration Link with Student */}
      <ShareRegistrationLinkCard />

      {/* Option 2: Register Student Manually */}
      <Card>
        <div className="flex items-center gap-3 pb-4 mb-6 border-b border-gray-100">
          <div className="w-10 h-10 rounded-2xl bg-gold-50 text-gold-600 flex items-center justify-center">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[#4A4A4A]">Option 2: Register Resident Profile Manually</h2>
            <p className="text-xs text-gray-500">
              Direct manual student profile entry with strict room allocation (2 students per room capacity)
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-gold-400 to-amber-300 shadow-soft-sm shrink-0">
              <img
                src={formData.profile_image_url}
                alt="Profile Preview"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-[#4A4A4A]">Student Profile Photo</h4>
              <p className="text-xs text-gray-500">Supports JPG, PNG with automatic circle thumbnail formatting</p>
              <label className="inline-flex items-center gap-2 text-xs font-bold bg-white text-gold-700 px-4 py-2 rounded-xl border border-gold-300 hover:bg-gold-50 cursor-pointer shadow-soft-sm">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload New Photo</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-700 flex items-center gap-2">
              <Users className="w-4 h-4" /> 1. Personal & Contact Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name *"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="e.g. Siddharth Sharma"
                required
              />
              <Input
                label="Student Number / Enrollment ID *"
                name="student_number"
                value={formData.student_number}
                onChange={handleChange}
                placeholder="e.g. HS-2024-001 or Enrollment No."
                required
              />
              <Input
                label="Date of Birth * (Format: DD/MM/YYYY)"
                name="dob"
                type="date"
                max={new Date().toISOString().split('T')[0]}
                value={formData.dob}
                onChange={handleChange}
                required
              />
              <Input
                label="WhatsApp Number * (Compulsory)"
                name="student_mobile"
                value={formData.student_mobile}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-700 flex items-center gap-2">
              <Building2 className="w-4 h-4" /> 2. Room & Floor Allocation (2 Students / Room)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#4A4A4A] uppercase tracking-wider mb-2">
                  Floor Number *
                </label>
                <select
                  name="floor_number"
                  value={formData.floor_number}
                  onChange={handleChange}
                  disabled={!isMainLeader}
                  className="w-full h-[52px] px-4 bg-white border border-[#DADADA] rounded-[14px] text-sm text-[#4A4A4A] focus:outline-none focus:border-gold-500 focus:ring-4 focus:ring-gold-100 font-medium disabled:bg-gray-50 disabled:cursor-not-allowed"
                >
                  {FLOORS.map((f) => (
                    <option key={f} value={f}>
                      Floor {f} Wing
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A4A4A] uppercase tracking-wider mb-2">
                  Select Room (Occupancy Status) *
                </label>
                <select
                  name="room_number"
                  value={formData.room_number}
                  onChange={handleChange}
                  required
                  className="w-full h-[52px] px-4 bg-white border border-[#DADADA] rounded-[14px] text-sm text-[#4A4A4A] focus:outline-none focus:border-gold-500 focus:ring-4 focus:ring-gold-100 font-medium"
                >
                  <option value="">-- Choose Assigned Room --</option>
                  {floorRoomList.map((r) => (
                    <option
                      key={r.roomNumber}
                      value={r.roomNumber}
                      disabled={r.isFull}
                      className={r.isFull ? 'text-gray-400 bg-gray-100' : 'text-gray-800'}
                    >
                      Room {r.roomNumber} — {r.occupied}/2 {r.isFull ? '(FULL - 2/2)' : `(${r.availableSlots} slot available)`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Room Occupancy Indicator Banner */}
            {selectedRoomOccupancy && (
              <div
                className={`p-3.5 rounded-2xl text-xs font-medium border flex items-center justify-between ${
                  selectedRoomOccupancy.isFull
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : selectedRoomOccupancy.count === 1
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-green-50 border-green-200 text-green-800'
                }`}
              >
                <div>
                  <span className="font-bold">
                    Room {formData.room_number} Status:{' '}
                  </span>
                  {selectedRoomOccupancy.isFull ? (
                    <span>FULL (2 of 2 students allocated). Cannot add more students.</span>
                  ) : selectedRoomOccupancy.count === 1 ? (
                    <span>
                      1 of 2 slots occupied (1 slot available). Roommate:{' '}
                      <strong>{selectedRoomOccupancy.students[0]?.full_name}</strong>
                    </span>
                  ) : (
                    <span>Empty room (2 of 2 slots available).</span>
                  )}
                </div>
                <span className="font-black px-2.5 py-1 rounded-xl bg-white border shadow-sm">
                  {selectedRoomOccupancy.count} / 2 Allocated
                </span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-700 flex items-center gap-2">
              <GraduationCap className="w-4 h-4" /> 3. Academic Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="College / University *"
                name="college_name"
                value={formData.college_name}
                onChange={handleChange}
                placeholder="e.g. Hari-Saurabh Institute of Technology"
                required
              />

              <div>
                <label className="block text-xs font-semibold text-[#4A4A4A] uppercase tracking-wider mb-2">
                  Department / Field of Study *
                </label>
                <input
                  list="dept-suggestions"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="e.g. Computer Science, Commerce, B.Pharmacy..."
                  required
                  className="w-full h-[52px] px-4 bg-white border border-[#DADADA] rounded-[14px] text-sm text-[#4A4A4A] focus:outline-none focus:border-gold-500 focus:ring-4 focus:ring-gold-100 font-medium"
                />
                <datalist id="dept-suggestions">
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d} />
                  ))}
                </datalist>
              </div>

              <Input
                label="Semester Result / CGPA"
                name="semester_result"
                value={formData.semester_result}
                onChange={handleChange}
                placeholder="e.g. 8.75 CGPA (4th Sem)"
              />

              <Input
                label="Hobby / Interests"
                name="hobby"
                value={formData.hobby}
                onChange={handleChange}
                placeholder="Type any hobby, such as Cricket, Drawing, Coding, Reading..."
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-700 flex items-center gap-2">
              <Phone className="w-4 h-4" /> 4. Parent Details & Friends
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Parent Name *"
                name="parent_name"
                value={formData.parent_name}
                onChange={handleChange}
                placeholder="Father or Mother Name"
                required
              />
              <Input
                label="Parent Mobile Number *"
                name="parent_mobile"
                value={formData.parent_mobile}
                onChange={handleChange}
                placeholder="+91 98765 11111"
                required
              />
              <Input
                label="Hostel Friends"
                name="hostel_friends"
                value={formData.hostel_friends}
                onChange={handleChange}
                placeholder="e.g. Aarav (Room 201), Rohan (Room 204)"
              />
              <Input
                label="Non-Hostel Friends"
                name="non_hostel_friends"
                value={formData.non_hostel_friends}
                onChange={handleChange}
                placeholder="e.g. Nitin, Vivek"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
            <Link to="/students">
              <Button variant="secondary" size="lg">
                Cancel
              </Button>
            </Link>
            <Button type="submit" variant="primary" size="lg" isLoading={loading} icon={UserPlus}>
              Save Student Record
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
