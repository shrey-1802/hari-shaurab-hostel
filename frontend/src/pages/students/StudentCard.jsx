import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { isBirthdayToday, isBirthdayThisWeek, formatDate, calculateAge } from '../../utils/helpers';
import { Cake, Users, Phone, Sparkles, Heart } from 'lucide-react';

export const StudentCard = ({ student, onDelete }) => {
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const isToday = isBirthdayToday(student.dob);
  const isThisWeek = isBirthdayThisWeek(student.dob);

  return (
    <>
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ duration: 0.2 }}
        className={`w-full max-w-[320px] min-h-[420px] rounded-[24px] bg-white p-6 shadow-soft-sm relative flex flex-col items-center justify-between text-center transition-all duration-300 border ${
          isToday
            ? 'border-2 border-gold-400 shadow-gold-glow ring-2 ring-gold-200'
            : isThisWeek
            ? 'border-gold-300 shadow-gold-subtle'
            : 'border-[#DADADA]/80 hover:border-gold-300 hover:shadow-soft-md'
        }`}
      >
        {/* Birthday Floating Badge */}
        {isToday ? (
          <div className="absolute -top-3.5 px-3 py-1 bg-gradient-to-r from-gold-500 to-amber-500 text-white text-[11px] font-extrabold rounded-full shadow-gold-glow flex items-center gap-1.5 animate-pulse">
            <Cake className="w-3.5 h-3.5" />
            <span>Birthday Today! 🎂</span>
          </div>
        ) : isThisWeek ? (
          <div className="absolute -top-3.5 px-3 py-1 bg-gold-100 text-gold-800 border border-gold-300 text-[11px] font-bold rounded-full shadow-sm flex items-center gap-1">
            <Cake className="w-3.5 h-3.5 text-gold-600" />
            <span>Birthday This Week</span>
          </div>
        ) : null}

        {/* TOP: 120px Circular Profile Image with Gold Ring */}
        <div className="mt-2 relative group">
          <div className="w-[120px] h-[120px] rounded-full p-1 bg-gradient-to-tr from-gold-400 to-amber-200 shadow-soft-sm">
            <img
              src={student.profile_image_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
              alt={student.full_name}
              className="w-full h-full rounded-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </div>

        {/* MIDDLE: Student Name & Badges */}
        <div className="my-3 space-y-2 w-full">
          <h4 className="text-[20px] font-bold text-[#4A4A4A] tracking-tight truncate" title={student.full_name}>
            {student.full_name}
          </h4>

          {/* Floor & Room Badges */}
          <div className="flex items-center justify-center gap-2">
            <Badge variant="gold" size="sm">
              Floor {student.floor_number}
            </Badge>
            <Badge variant="gray" size="sm">
              Room {student.room_number}
            </Badge>
          </div>

          <p className="text-xs text-gray-500 truncate" title={student.department}>
            {student.department}
          </p>
        </div>

        {/* BOTTOM: Date of Birth & Action Buttons */}
        <div className="w-full space-y-3 pt-2 border-t border-gray-100">
          <div className="text-xs font-semibold text-gray-600 bg-gray-50 py-1.5 px-3 rounded-xl border border-gray-200/70 flex items-center justify-center gap-1.5">
            <Cake className="w-3.5 h-3.5 text-gold-600" />
            <span>DOB: {formatDate(student.dob)}</span>
            <span className="text-gray-400">({calculateAge(student.dob)} yrs)</span>
          </div>

          <div className="grid grid-cols-2 gap-2 w-full">
            <Link to={`/student/${student.id}`} className="w-full">
              <Button variant="primary" size="sm" className="w-full text-xs">
                View Profile
              </Button>
            </Link>

            <Button
              variant="secondary"
              size="sm"
              className="w-full text-xs"
              onClick={() => setShowFriendsModal(true)}
              icon={Users}
            >
              Friends
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Friends Popup Modal */}
      <Modal
        isOpen={showFriendsModal}
        onClose={() => setShowFriendsModal(false)}
        title={`${student.full_name}'s Friends Network`}
      >
        <div className="space-y-6">
          {/* Hostel Friends */}
          <div className="p-4 rounded-2xl bg-gold-50/80 border border-gold-200">
            <div className="flex items-center gap-2 text-gold-800 font-bold text-sm mb-2">
              <Sparkles className="w-4 h-4 text-gold-600" />
              <span>Hostel Friends & Roommates</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
              {student.hostel_friends || 'No hostel friends recorded yet.'}
            </p>
          </div>

          {/* Non-Hostel Friends */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
            <div className="flex items-center gap-2 text-gray-700 font-bold text-sm mb-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span>Non-Hostel & College Friends</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
              {student.non_hostel_friends || 'No outside friends recorded.'}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" size="md" onClick={() => setShowFriendsModal(false)}>
              Close
            </Button>
            <Link to={`/student/${student.id}`}>
              <Button variant="primary" size="md">
                Full Profile Details
              </Button>
            </Link>
          </div>
        </div>
      </Modal>
    </>
  );
};
