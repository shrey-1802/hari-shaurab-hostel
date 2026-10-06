import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { registrationService } from '../../services/registrationService';
import {
  Building2,
  User,
  Phone,
  Calendar,
  Award,
  BookOpen,
  Heart,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Sparkles,
  Lock,
  ArrowRight,
} from 'lucide-react';

export const StudentSelfRegistrationPage = () => {
  const { token } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [linkInfo, setLinkInfo] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    full_name: '',
    date_of_birth: '',
    student_number: '',
    student_mobile: '',
    parent_name: '',
    parent_mobile: '',
    college_name: 'Hari-Saurabh Institute of Technology',
    department: 'Computer Engineering',
    semester_result: '',
    hobby: '',
    hostel_friends: '',
    non_hostel_friends: '',
    room_number: '',
    profile_picture_url: '',
  });

  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    fetchLinkDetails();
  }, [token]);

  const fetchLinkDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const info = await registrationService.getLinkInfo(token);
      setLinkInfo(info);
      // Auto select first available room if available
      const avail = info.available_rooms.find((r) => r.is_available);
      if (avail) {
        setFormData((prev) => ({ ...prev, room_number: avail.room_number }));
      }
    } catch (err) {
      setError(err.message || 'Invalid or expired registration link.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setFormData((prev) => ({ ...prev, profile_picture_url: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.room_number) {
      alert('Please select an available room number.');
      return;
    }

    setSubmitting(true);
    try {
      await registrationService.submitSelfRegistration(token, formData);
      setSubmitted(true);
    } catch (err) {
      alert(err.message || 'Failed to submit registration form.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-amber-300 font-semibold text-sm">Validating Registration Link...</p>
        </div>
      </div>
    );
  }

  if (error || !linkInfo) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900/90 border border-red-500/30 rounded-3xl p-8 text-center space-y-6 shadow-2xl backdrop-blur-xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto border border-red-500/20">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Invalid Registration Link</h2>
            <p className="text-sm text-slate-400 mt-2">
              {error || 'This registration link does not exist, has expired, or was deactivated.'}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 text-xs text-slate-300 text-left">
            💡 <strong className="text-amber-400">Next Steps:</strong> Please contact your designated Wing Leader to receive a valid, active registration link.
          </div>
          <Link
            to="/"
            className="inline-flex items-center justify-center w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold hover:brightness-110 transition-all shadow-lg"
          >
            Back to Hostel Portal
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-8 text-center space-y-6 shadow-2xl backdrop-blur-xl">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-500/10 animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-500/30">
              Registration Submitted
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-3">Welcome to Hari-Saurabh!</h2>
            <p className="text-sm text-slate-300 mt-2">
              Your self-registration request for <strong className="text-amber-400">Room {formData.room_number}</strong> (Floor {linkInfo.assigned_floor}) has been received.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80 text-left space-y-3">
            <div className="flex items-center justify-between text-xs border-b border-slate-700/60 pb-2">
              <span className="text-slate-400">Student Name</span>
              <span className="font-bold text-white">{formData.full_name}</span>
            </div>
            <div className="flex items-center justify-between text-xs border-b border-slate-700/60 pb-2">
              <span className="text-slate-400">Assigned Floor</span>
              <span className="font-bold text-amber-400">Floor {linkInfo.assigned_floor}</span>
            </div>
            <div className="flex items-center justify-between text-xs border-b border-slate-700/60 pb-2">
              <span className="text-slate-400">Assigned Room</span>
              <span className="font-bold text-amber-400">Room {formData.room_number}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Approval Status</span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                PENDING APPROVAL
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Assigned Leader <strong className="text-slate-200">{linkInfo.wing_leader_name}</strong> has been notified via live notifications and will review your profile shortly.
          </p>

          <Link
            to="/login"
            className="inline-flex items-center justify-center w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold hover:brightness-110 transition-all shadow-lg text-sm"
          >
            Go to Leader Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 rounded-3xl p-6 sm:p-10 text-slate-950 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-950/15 text-slate-950 text-xs font-black uppercase tracking-wider backdrop-blur-md">
                <Sparkles className="w-4 h-4" />
                Student Self Registration
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
                Hari-Saurabh Hostel Admission
              </h1>
              <p className="text-slate-900/90 text-xs sm:text-sm max-w-xl font-medium">
                Fill your personal, academic, and social profile. Your room assignment is locked to your Wing Leader's assigned floor.
              </p>
            </div>

            <div className="bg-slate-950/20 backdrop-blur-md rounded-2xl p-4 text-slate-950 text-left border border-slate-950/10 min-w-[200px]">
              <div className="text-[10px] uppercase font-bold text-slate-900/70 tracking-wider">Assigned Leader</div>
              <div className="font-extrabold text-sm text-slate-950">{linkInfo.wing_leader_name}</div>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 text-amber-400 text-xs font-extrabold">
                <Lock className="w-3.5 h-3.5" />
                Floor {linkInfo.assigned_floor} Locked
              </div>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-8">

          {/* Section 1: Locked Floor & Room Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm uppercase tracking-wider border-b border-slate-800 pb-2">
              <Building2 className="w-4 h-4" />
              Step 1: Floor & Room Selection (Capacity Rules)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Auto-Filled Floor (Locked) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Assigned Floor Number</span>
                  <span className="text-amber-400 text-[11px] font-semibold flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Auto-Assigned & Locked
                  </span>
                </label>
                <div className="w-full py-3 px-4 rounded-xl bg-slate-800/80 border border-amber-500/40 text-amber-300 font-extrabold flex items-center justify-between text-sm shadow-inner">
                  <span>Floor {linkInfo.assigned_floor}</span>
                  <span className="text-xs font-normal text-slate-400">(Cannot be modified)</span>
                </div>
              </div>

              {/* Room Selection Dropdown */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Select Room Number</span>
                  <span className="text-slate-400 text-[11px]">Max 2 Students / Room</span>
                </label>
                <select
                  name="room_number"
                  value={formData.room_number}
                  onChange={handleChange}
                  required
                  className="w-full py-3 px-4 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-sm focus:outline-none focus:border-amber-500 transition-colors"
                >
                  <option value="" disabled>-- Select Assigned Room --</option>
                  {linkInfo.available_rooms.map((room) => (
                    <option
                      key={room.room_number}
                      value={room.room_number}
                      disabled={!room.is_available}
                    >
                      Room {room.room_number} {room.is_available ? `(${room.available_beds} Bed Available)` : '(FULL - 2/2)'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Room Availability Pill List */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
              <div className="text-xs font-bold text-slate-400">Wing Leader Allowed Rooms & Live Availability:</div>
              <div className="flex flex-wrap gap-2">
                {linkInfo.available_rooms.map((r) => (
                  <div
                    key={r.room_number}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border ${
                      r.is_available
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-red-500/10 text-red-400 border-red-500/30 opacity-60'
                    }`}
                  >
                    <span>Room {r.room_number}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-950/60">
                      {r.occupied}/2 Occupied
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Personal Details & Photo */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm uppercase tracking-wider border-b border-slate-800 pb-2">
              <User className="w-4 h-4" />
              Step 2: Personal Identification
            </div>

            {/* Profile Photo Upload */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-dashed border-amber-500/40 flex items-center justify-center overflow-hidden shrink-0 relative group">
                {previewImage ? (
                  <img src={previewImage} alt="Profile Preview" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-slate-500" />
                )}
              </div>
              <div className="space-y-2 text-center sm:text-left flex-1">
                <label className="text-xs font-bold text-slate-300 block">Upload Student Profile Picture</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 transition-all cursor-pointer"
                />
                <p className="text-[11px] text-slate-500">JPG, PNG or WEBP (Max 5MB)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Full Name *</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="e.g. Rahul Patel"
                  required
                  className="w-full py-3 px-4 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Date Of Birth *</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  required
                  className="w-full py-3 px-4 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Student Enrollment / Roll Number *</label>
                <input
                  type="text"
                  name="student_number"
                  value={formData.student_number}
                  onChange={handleChange}
                  placeholder="e.g. 21012011045"
                  required
                  className="w-full py-3 px-4 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Student Mobile Number *</label>
                <input
                  type="tel"
                  name="student_mobile"
                  value={formData.student_mobile}
                  onChange={handleChange}
                  placeholder="e.g. +91 9876543210"
                  required
                  className="w-full py-3 px-4 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Parent Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm uppercase tracking-wider border-b border-slate-800 pb-2">
              <Phone className="w-4 h-4" />
              Step 3: Parent / Guardian Details
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Parent / Guardian Name</label>
                <input
                  type="text"
                  name="parent_name"
                  value={formData.parent_name}
                  onChange={handleChange}
                  placeholder="e.g. Mahendra Patel"
                  className="w-full py-3 px-4 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Parent Mobile Number</label>
                <input
                  type="tel"
                  name="parent_mobile"
                  value={formData.parent_mobile}
                  onChange={handleChange}
                  placeholder="e.g. +91 9812345678"
                  className="w-full py-3 px-4 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Academic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm uppercase tracking-wider border-b border-slate-800 pb-2">
              <BookOpen className="w-4 h-4" />
              Step 4: Academic Information
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">College / Institute Name</label>
                <input
                  type="text"
                  name="college_name"
                  value={formData.college_name}
                  onChange={handleChange}
                  className="w-full py-3 px-4 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Department / Branch</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="e.g. Computer Engineering"
                  className="w-full py-3 px-4 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Semester Result / SPI</label>
                <input
                  type="text"
                  name="semester_result"
                  value={formData.semester_result}
                  onChange={handleChange}
                  placeholder="e.g. 8.5 SPI"
                  className="w-full py-3 px-4 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Social Info & Hobbies */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm uppercase tracking-wider border-b border-slate-800 pb-2">
              <Heart className="w-4 h-4" />
              Step 5: Social Profile & Hobbies
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Hobbies & Interests</label>
                <input
                  type="text"
                  name="hobby"
                  value={formData.hobby}
                  onChange={handleChange}
                  placeholder="e.g. Cricket, Coding, Music"
                  className="w-full py-3 px-4 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Hostel Friends</label>
                <input
                  type="text"
                  name="hostel_friends"
                  value={formData.hostel_friends}
                  onChange={handleChange}
                  placeholder="e.g. Amit, Snehal"
                  className="w-full py-3 px-4 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Non-Hostel Friends</label>
                <input
                  type="text"
                  name="non_hostel_friends"
                  value={formData.non_hostel_friends}
                  onChange={handleChange}
                  placeholder="e.g. Rohit"
                  className="w-full py-3 px-4 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-slate-950 font-black text-base shadow-2xl hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Submitting Registration...
                </>
              ) : (
                <>
                  Submit Registration Request
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            <p className="text-center text-xs text-slate-500 mt-3">
              By submitting, your details will be routed directly to assigned Wing Leader <strong className="text-slate-300">{linkInfo.wing_leader_name}</strong> for review and approval.
            </p>
          </div>

        </form>
      </div>
    </div>
  );
};
