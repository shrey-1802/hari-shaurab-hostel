import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStudents } from '../../context/StudentContext';
import { useNotifications } from '../../context/NotificationContext';
import { birthdayService } from '../../services/birthdayService';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { formatDate, calculateAge, isBirthdayToday, isBirthdayThisWeek } from '../../utils/helpers';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Cake,
  Phone,
  Mail,
  Building2,
  GraduationCap,
  BookOpen,
  Users,
  MessageCircle,
  FileText,
  Calendar,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { students, deleteStudent } = useStudents();
  const { showToast } = useNotifications();
  const [student, setStudent] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sendingGreeting, setSendingGreeting] = useState(false);

  useEffect(() => {
    const found = students.find((s) => s.id === id);
    if (found) {
      setStudent(found);
    }
  }, [id, students]);

  if (!student) {
    return (
      <Card className="text-center py-16">
        <h3 className="text-lg font-bold text-[#4A4A4A]">Student Not Found</h3>
        <p className="text-xs text-gray-500 mt-2 mb-4">The student record may have been removed.</p>
        <Link to="/students">
          <Button variant="primary" size="md">
            Return to Directory
          </Button>
        </Link>
      </Card>
    );
  }

  const isToday = isBirthdayToday(student.dob);
  const isThisWeek = isBirthdayThisWeek(student.dob);

  const handleDelete = async () => {
    await deleteStudent(student.id);
    showToast(`${student.full_name}'s record has been deleted`, 'info');
    navigate('/students');
  };

  const handleSendGreeting = async () => {
    setSendingGreeting(true);
    try {
      await birthdayService.sendWhatsAppGreeting(student.id, 'Happy Birthday from Hari-Saurabh Hostel!');
      showToast(`Birthday WhatsApp message dispatched to ${student.student_mobile}`, 'success');
    } catch (err) {
      showToast('WhatsApp API dispatch failed', 'error');
    } finally {
      setSendingGreeting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/students"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gold-600 transition-colors bg-white px-3.5 py-2 rounded-xl border border-gray-200 shadow-soft-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Directory
        </Link>

        <div className="flex items-center gap-2">
          <Link to={`/edit-student/${student.id}`}>
            <Button variant="secondary" size="sm" icon={Edit3}>
              Edit Details
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
            className="text-red-500 border-red-200 hover:bg-red-50"
            icon={Trash2}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Main Student Header Hero */}
      <Card className={`relative overflow-hidden ${isToday ? 'border-2 border-gold-400 shadow-gold-glow' : ''}`}>
        <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          {/* 120px Circular Avatar with Gold Ring */}
          <div className="relative">
            <div className="w-[120px] h-[120px] rounded-full p-1.5 bg-gradient-to-tr from-gold-400 to-amber-300 shadow-soft-md">
              <img
                src={student.profile_image_url}
                alt={student.full_name}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            {isToday && (
              <span className="absolute -bottom-2 -right-2 text-2xl" title="Birthday Today">
                🎂
              </span>
            )}
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#4A4A4A]">{student.full_name}</h2>
              <Badge variant="gold" size="md">Floor {student.floor_number}</Badge>
              <Badge variant="gray" size="md">Room {student.room_number}</Badge>
              {isToday && <Badge variant="birthday" size="md">Birthday Today! 🎂</Badge>}
            </div>

            <p className="text-sm font-medium text-gray-500 flex items-center justify-center md:justify-start gap-2">
              <GraduationCap className="w-4 h-4 text-gold-600" />
              <span>{student.department} • {student.college_name}</span>
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs text-gray-600 font-semibold">
              <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border">
                <Calendar className="w-3.5 h-3.5 text-gold-600" />
                DOB: {formatDate(student.dob)} ({calculateAge(student.dob)} yrs)
              </span>
              <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border">
                <Phone className="w-3.5 h-3.5 text-gold-600" />
                {student.student_mobile}
              </span>
            </div>
          </div>

          {/* WhatsApp Direct Action */}
          <div className="flex flex-col gap-2 shrink-0">
            <a
              href={`https://wa.me/${student.whatsapp_number?.replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="primary" size="md" icon={MessageCircle} className="w-full">
                WhatsApp Chat
              </Button>
            </a>
            {isToday && (
              <Button
                variant="secondary"
                size="sm"
                isLoading={sendingGreeting}
                onClick={handleSendGreeting}
                icon={Sparkles}
              >
                Send Greeting
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* 2-Column Desktop Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Personal & Contact Information */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Users className="w-5 h-5 text-gold-600" />
            <h3 className="text-base font-bold text-[#4A4A4A]">Personal & Contact Details</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-gray-400 font-semibold block mb-0.5">Full Name</span>
              <span className="text-[#4A4A4A] font-bold text-sm">{student.full_name}</span>
            </div>
            <div>
              <span className="text-gray-400 font-semibold block mb-0.5">Date of Birth</span>
              <span className="text-[#4A4A4A] font-bold text-sm">{formatDate(student.dob)}</span>
            </div>
            <div>
              <span className="text-gray-400 font-semibold block mb-0.5">Student Mobile</span>
              <span className="text-[#4A4A4A] font-bold text-sm">{student.student_mobile}</span>
            </div>
            <div>
              <span className="text-gray-400 font-semibold block mb-0.5">WhatsApp Mobile</span>
              <span className="text-[#4A4A4A] font-bold text-sm">{student.whatsapp_number || student.student_mobile}</span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-400 font-semibold block mb-0.5">Hobbies & Interests</span>
              <span className="text-gray-700 font-medium bg-gold-50/60 p-2.5 rounded-xl border border-gold-200/60 block">
                {student.hobby || 'No hobbies listed'}
              </span>
            </div>
          </div>
        </Card>

        {/* Section 2: Parent / Guardian Information */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Building2 className="w-5 h-5 text-gold-600" />
            <h3 className="text-base font-bold text-[#4A4A4A]">Parent / Emergency Contact</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="col-span-2 sm:col-span-1">
              <span className="text-gray-400 font-semibold block mb-0.5">Parent / Guardian Name</span>
              <span className="text-[#4A4A4A] font-bold text-sm">{student.parent_name}</span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-gray-400 font-semibold block mb-0.5">Parent Mobile Number</span>
              <span className="text-[#4A4A4A] font-bold text-sm">{student.parent_mobile}</span>
            </div>
            <div className="col-span-2 pt-2">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-500">
                Authorized emergency contact on record for Hari-Saurabh Hostel administration.
              </div>
            </div>
          </div>
        </Card>

        {/* Section 3: Academic Information */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <BookOpen className="w-5 h-5 text-gold-600" />
            <h3 className="text-base font-bold text-[#4A4A4A]">Academic Record</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="col-span-2">
              <span className="text-gray-400 font-semibold block mb-0.5">College / Institute</span>
              <span className="text-[#4A4A4A] font-bold text-sm">{student.college_name}</span>
            </div>
            <div>
              <span className="text-gray-400 font-semibold block mb-0.5">Department / Branch</span>
              <span className="text-[#4A4A4A] font-bold text-sm">{student.department}</span>
            </div>
            <div>
              <span className="text-gray-400 font-semibold block mb-0.5">Semester Score / CGPA</span>
              <span className="text-gold-700 font-extrabold text-sm">{student.semester_result || 'N/A'}</span>
            </div>
          </div>
        </Card>

        {/* Section 4: Hostel & Non-Hostel Friends Network */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Users className="w-5 h-5 text-gold-600" />
            <h3 className="text-base font-bold text-[#4A4A4A]">Friendship Graph</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-gold-50/70 rounded-xl border border-gold-200">
              <span className="font-bold text-gold-800 block mb-1">🏢 Hostel Roommates & Friends:</span>
              <p className="text-gray-700 font-medium">{student.hostel_friends || 'None listed'}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
              <span className="font-bold text-gray-700 block mb-1">🎓 College / Non-Hostel Friends:</span>
              <p className="text-gray-600 font-medium">{student.non_hostel_friends || 'None listed'}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Student Removal"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            Are you sure you want to remove <span className="font-bold text-[#4A4A4A]">{student.full_name}</span> from the hostel directory? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="secondary" size="md" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="md" onClick={handleDelete} icon={Trash2}>
              Delete Record
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
