import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStudents } from '../../context/StudentContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FLOORS, DEPARTMENTS, COLLEGES } from '../../utils/constants';
import { ArrowLeft, Edit3, Upload, Users, Building2, GraduationCap, Phone } from 'lucide-react';

export const EditStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { students, updateStudent } = useStudents();
  const { isMainLeader } = useAuth();
  const { showToast } = useNotifications();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const student = students.find((s) => s.id === id);
    if (student) {
      setFormData(student);
    }
  }, [id, students]);

  if (!formData) {
    return (
      <Card className="text-center py-16">
        <h3 className="text-lg font-bold text-[#4A4A4A]">Loading Student Record...</h3>
      </Card>
    );
  }

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
      await updateStudent(formData.id, formData);
      showToast(`${formData.full_name}'s profile updated!`, 'success');
      navigate(`/student/${formData.id}`);
    } catch (err) {
      showToast('Error saving changes', 'error');
    } finally {
      setLoading(false);
    }
  };

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
          Edit Mode
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
                  className="w-full h-[52px] px-4 bg-white border border-[#DADADA] rounded-[14px] text-sm text-[#4A4A4A] focus:outline-none focus:border-gold-500 font-semibold disabled:bg-gray-100"
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
                required
              />
            </div>
          </div>

          {/* Section 3 */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-700 flex items-center gap-2">
              <GraduationCap className="w-4 h-4" /> 3. Academic Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#4A4A4A] uppercase tracking-wider mb-2">
                  College
                </label>
                <select
                  name="college_name"
                  value={formData.college_name}
                  onChange={handleChange}
                  className="w-full h-[52px] px-4 bg-white border border-[#DADADA] rounded-[14px] text-sm text-[#4A4A4A] focus:outline-none focus:border-gold-500 font-medium truncate"
                >
                  {COLLEGES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
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
