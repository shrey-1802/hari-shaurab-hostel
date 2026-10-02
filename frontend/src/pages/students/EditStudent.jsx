import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStudents } from '../../context/StudentContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FLOORS, DEPARTMENTS } from '../../utils/constants';
import { ArrowLeft, Edit3, Upload, Users, Building2, GraduationCap, Phone } from 'lucide-react';

export const EditStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { students, updateStudent, getRoomOccupancy, canAccessStudent, isRoomInScope } = useStudents();
  const { user, isMainLeader } = useAuth();
  const { showToast } = useNotifications();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(null);

  const roomStart = user?.room_start;
  const roomEnd = user?.room_end;

  useEffect(() => {
    const student = students.find((s) => s.id === id);
    if (student) {
      // Normalize: ensure dob is set (may come as date_of_birth from API)
      setFormData({
        ...student,
        dob: student.dob || student.date_of_birth || '',
      });
    }
  }, [id, students]);

  if (!formData) {
    return (
      <Card className="text-center py-16">
        <h3 className="text-lg font-bold text-[#4A4A4A]">Loading Student Record...</h3>
      </Card>
    );
  }

  // Access control guard for Wing Leaders
  if (!isMainLeader && !canAccessStudent(formData)) {
    return (
      <Card className="text-center py-16 max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
          <Building2 className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-[#4A4A4A]">Access Restricted</h3>
        <p className="text-xs text-gray-500 mt-2 mb-4">
          You only have permission to manage students allocated to Floor {user?.assigned_floor || 4} in rooms {user?.room_start}–{user?.room_end}.
        </p>
        <Link to="/students">
          <Button variant="primary" size="md">
            Return to Directory
          </Button>
        </Link>
      </Card>
    );
  }

  // Calculate available room numbers for the active floor
  const floorRoomList = () => {
    const list = [];
    const floor = Number(formData.floor_number);
    const startNum = !isMainLeader && roomStart ? parseInt(roomStart.replace(/\D/g, ''), 10) : floor * 100 + 1;
    const endNum = !isMainLeader && roomEnd ? parseInt(roomEnd.replace(/\D/g, ''), 10) : floor * 100 + 18;

    for (let r = startNum; r <= endNum; r++) {
      const roomStr = String(r);
      const occ = getRoomOccupancy(floor, roomStr, formData.id);
      list.push({
        roomNumber: roomStr,
        ...occ,
      });
    }
    return list;
  };

  const selectedRoomOccupancy = getRoomOccupancy(formData.floor_number, formData.room_number, formData.id);

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

    // 1. Validate wing leader room range
    if (!isMainLeader && roomStart && roomEnd) {
      if (!isRoomInScope(formData.room_number, roomStart, roomEnd)) {
        showToast(`Access denied: You are assigned to rooms ${roomStart}–${roomEnd} only.`, 'error');
        return;
      }
    }

    // 2. Validate max room capacity = 2 (excluding this student)
    const occ = getRoomOccupancy(formData.floor_number, formData.room_number, formData.id);
    if (occ.isFull) {
      showToast(
        `Room ${formData.room_number} is already at full capacity (2/2 students allocated). Please select another room.`,
        'error'
      );
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        date_of_birth: formData.dob,
      };
      await updateStudent(formData.id, submitData);
      showToast(`${formData.full_name}'s profile updated!`, 'success');
      navigate(`/student/${formData.id}`);
    } catch (err) {
      showToast(err.message || 'Error saving changes', 'error');
    } finally {
      setLoading(false);
    }
  };

  const roomsList = floorRoomList();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to={`/student/${id}`}
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gold-600 transition-colors bg-white px-3.5 py-2 rounded-xl border border-gray-200 shadow-soft-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Cancel & Return
        </Link>
        <span className="text-xs font-bold text-gold-600 bg-gold-50 px-3 py-1.5 rounded-full border border-gold-200">
          Edit Mode (Max 2 / Room)
        </span>
      </div>

      <Card>
        <div className="flex items-center gap-3 pb-4 mb-6 border-b border-gray-100">
          <div className="w-10 h-10 rounded-2xl bg-gold-50 text-gold-600 flex items-center justify-center">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[#4A4A4A]">Edit Student Record</h2>
            <p className="text-xs text-gray-500">Update contact, room allocation, or academic information</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Photo */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-gold-400 to-amber-300 shadow-soft-sm shrink-0">
              <img
                src={formData.profile_image_url}
                alt="Profile Preview"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-[#4A4A4A]">Change Profile Picture</h4>
              <label className="inline-flex items-center gap-2 text-xs font-bold bg-white text-gold-700 px-4 py-2 rounded-xl border border-gold-300 hover:bg-gold-50 cursor-pointer shadow-soft-sm">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload New Photo</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
          </div>

          {/* Section 1 */}
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
                required
              />
              <Input
                label="Date of Birth *"
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleChange}
                required
              />
              <Input
                label="Student Mobile *"
                name="student_mobile"
                value={formData.student_mobile}
                onChange={handleChange}
                required
              />
              <Input
                label="WhatsApp Number"
                name="whatsapp_number"
                value={formData.whatsapp_number}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Section 2 */}
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
                  className="w-full h-[52px] px-4 bg-white border border-[#DADADA] rounded-[14px] text-sm text-[#4A4A4A] focus:outline-none focus:border-gold-500 font-semibold disabled:bg-gray-100"
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
                  {roomsList.map((r) => (
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
                    <span>FULL (2 of 2 other students already allocated).</span>
                  ) : selectedRoomOccupancy.count === 1 ? (
                    <span>
                      1 other student allocated. Roommate:{' '}
                      <strong>{selectedRoomOccupancy.students[0]?.full_name}</strong>
                    </span>
                  ) : (
                    <span>Current student is the sole resident or room is empty.</span>
                  )}
                </div>
                <span className="font-black px-2.5 py-1 rounded-xl bg-white border shadow-sm">
                  {selectedRoomOccupancy.count + 1} / 2 Total Slots
                </span>
              </div>
            )}
          </div>

          {/* Section 3 */}
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
                  list="dept-suggestions-edit"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="e.g. Computer Science, Commerce, B.Pharmacy..."
                  required
                  className="w-full h-[52px] px-4 bg-white border border-[#DADADA] rounded-[14px] text-sm text-[#4A4A4A] focus:outline-none focus:border-gold-500 focus:ring-4 focus:ring-gold-100 font-medium"
                />
                <datalist id="dept-suggestions-edit">
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
              />
              <Input
                label="Hobby"
                name="hobby"
                value={formData.hobby}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Section 4 */}
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
                required
              />
              <Input
                label="Parent Mobile *"
                name="parent_mobile"
                value={formData.parent_mobile}
                onChange={handleChange}
                required
              />
              <Input
                label="Hostel Friends"
                name="hostel_friends"
                value={formData.hostel_friends}
                onChange={handleChange}
              />
              <Input
                label="Non-Hostel Friends"
                name="non_hostel_friends"
                value={formData.non_hostel_friends}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
            <Link to={`/student/${formData.id}`}>
              <Button variant="secondary" size="lg">
                Cancel
              </Button>
            </Link>
            <Button type="submit" variant="primary" size="lg" isLoading={loading} icon={Edit3}>
              Save Modifications
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
