import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStudents } from '../../context/StudentContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FLOORS, DEPARTMENTS, COLLEGES } from '../../utils/constants';
import {
  ArrowLeft,
  UserPlus,
  Upload,
  Sparkles,
  Building2,
  Users,
  GraduationCap,
  Calendar,
  Phone,
  Image,
} from 'lucide-react';

export const AddStudent = () => {
  const navigate = useNavigate();
  const { addStudent } = useStudents();
  const { user, isMainLeader } = useAuth();
  const { showToast } = useNotifications();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    dob: '',
    student_mobile: '',
    parent_name: '',
    parent_mobile: '',
    college_name: COLLEGES[0],
    department: DEPARTMENTS[0],
    semester_result: '',
    hobby: '',
    hostel_friends: '',
    non_hostel_friends: '',
    floor_number: isMainLeader ? 4 : user?.assigned_floor || 4,
    room_number: '',
    whatsapp_number: '',
    profile_image_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
  });

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
    setLoading(true);
    try {
      const created = await addStudent(formData);
      showToast(`${formData.full_name} enrolled successfully!`, 'success');
      navigate(`/student/${created.id}`);
    } catch (error) {
      showToast('Error registering student. Please check fields.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/students"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gold-600 transition-colors bg-white px-3.5 py-2 rounded-xl border border-gray-200 shadow-soft-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Directory
        </Link>
        <span className="text-xs font-bold text-gold-600 bg-gold-50 px-3 py-1.5 rounded-full border border-gold-200">
          New Registration
        </span>
      </div>

      {/* Form Container */}
      <Card>
        <div className="flex items-center gap-3 pb-4 mb-6 border-b border-gray-100">
          <div className="w-10 h-10 rounded-2xl bg-gold-50 text-gold-600 flex items-center justify-center">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[#4A4A4A]">Register New Resident</h2>
            <p className="text-xs text-gray-500">Add student profile with room allocation & friends</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Photo Upload */}
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

          {/* Section 1: Basic & Contact Info */}
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
                label="Date of Birth *"
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleChange}
                required
              />
              <Input
                label="Student Mobile Number *"
                name="student_mobile"
                value={formData.student_mobile}
                onChange={handleChange}
                placeholder="+91 98765 00000"
                required
              />
              <Input
                label="WhatsApp Number"
                name="whatsapp_number"
                value={formData.whatsapp_number}
                onChange={handleChange}
                placeholder="+91 98765 00000"
              />
            </div>
          </div>

          {/* Section 2: Room & Floor Allocation */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-700 flex items-center gap-2">
              <Building2 className="w-4 h-4" /> 2. Room & Floor Allocation
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

              <Input
                label="Room Number *"
                name="room_number"
                value={formData.room_number}
                onChange={handleChange}
                placeholder="e.g. 201-A or 304"
                required
              />
            </div>
          </div>

          {/* Section 3: Academic Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-700 flex items-center gap-2">
              <GraduationCap className="w-4 h-4" /> 3. Academic Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* College - Read-only Text Input */}
              <div>
                <label className="block text-xs font-semibold text-[#4A4A4A] uppercase tracking-wider mb-2">
                  College / University
                </label>
                <input
                  type="text"
                  value={formData.college_name}
                  disabled
                  className="w-full h-[52px] px-4 bg-gray-50 border border-[#DADADA] rounded-[14px] text-sm text-[#4A4A4A] font-medium cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A4A4A] uppercase tracking-wider mb-2">
                  Department
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full h-[52px] px-4 bg-white border border-[#DADADA] rounded-[14px] text-sm text-[#4A4A4A] focus:outline-none focus:border-gold-500 font-medium truncate"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Semester Result / CGPA"
                name="semester_result"
                value={formData.semester_result}
                onChange={handleChange}
                placeholder="e.g. 8.75 CGPA (4th Sem)"
              />

              <Input
                label="Hobby & Interests"
                name="hobby"
                value={formData.hobby}
                onChange={handleChange}
                placeholder="e.g. Football, Chess, Coding"
              />
            </div>
          </div>

          {/* Section 4: Parent & Friends */}
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

          {/* Action Buttons */}
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
