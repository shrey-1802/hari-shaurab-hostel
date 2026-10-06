import React, { useState, useEffect } from 'react';
import { registrationService } from '../../services/registrationService';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatDate } from '../../utils/helpers';
import {
  UserCheck,
  UserX,
  Clock,
  Building2,
  Phone,
  User,
  Check,
  X,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

export const PendingRegistrationsList = ({ onStatusChange }) => {
  const { user } = useAuth();
  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    loadPending();
  }, [user]);

  const loadPending = async () => {
    setLoading(true);
    try {
      const list = await registrationService.getPendingRegistrations(user);
      setPendingList(list);
    } catch (err) {
      console.warn('Failed to load pending registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (studentId, name) => {
    if (!window.confirm(`Approve self-registration for student "${name}"?`)) return;
    setActionId(studentId);
    try {
      await registrationService.approveRegistration(studentId);
      await loadPending();
      if (onStatusChange) onStatusChange();
    } catch (err) {
      alert(err.message || 'Failed to approve student registration.');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (studentId, name) => {
    if (!window.confirm(`Reject self-registration request for "${name}"?`)) return;
    setActionId(studentId);
    try {
      await registrationService.rejectRegistration(studentId);
      await loadPending();
      if (onStatusChange) onStatusChange();
    } catch (err) {
      alert(err.message || 'Failed to reject student registration.');
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 space-y-3 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4" />
        <div className="h-20 bg-gray-100 rounded w-full" />
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-amber-500 shadow-soft-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-[#4A4A4A]">Pending Student Self-Registrations</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-black">
              {pendingList.length} Pending
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Review student self-registration requests submitted via shareable links
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={loadPending} icon={Clock}>
          Refresh List
        </Button>
      </div>

      {pendingList.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-2">
            <UserCheck className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-gray-700">No Pending Self-Registrations</p>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
            All submitted student registrations have been reviewed. Share your registration link with students to accept new applications.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto w-full min-w-0">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-bold text-gray-500 uppercase">
                <th className="pb-3">Student Info</th>
                <th className="pb-3">Floor & Room</th>
                <th className="pb-3">Department & Result</th>
                <th className="pb-3">Parent Info</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Approval Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pendingList.map((student) => (
                <tr key={student.id} className="hover:bg-amber-50/50 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          student.profile_picture_url ||
                          student.profile_image_url ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                        }
                        alt={student.full_name}
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-amber-300 shrink-0"
                      />
                      <div>
                        <div className="font-extrabold text-[#4A4A4A]">{student.full_name}</div>
                        <div className="text-xs text-gray-500">Roll: {student.student_number}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-gray-400" /> {student.student_mobile}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4">
                    <div className="space-y-1">
                      <Badge variant="gold" size="sm" className="font-bold">
                        Floor {student.floor_number}
                      </Badge>
                      <div className="text-xs font-extrabold text-[#4A4A4A]">
                        Room {student.room_number}
                      </div>
                    </div>
                  </td>

                  <td className="py-4 text-xs text-gray-600">
                    <div className="font-semibold text-gray-800">{student.department || 'N/A'}</div>
                    <div className="text-gray-500">{student.college_name || 'Hostel Student'}</div>
                    {student.semester_result && (
                      <div className="text-[11px] text-amber-700 font-bold mt-0.5">
                        Result: {student.semester_result}
                      </div>
                    )}
                  </td>

                  <td className="py-4 text-xs text-gray-600">
                    <div className="font-semibold">{student.parent_name || 'N/A'}</div>
                    <div className="text-gray-500">{student.parent_mobile || ''}</div>
                  </td>

                  <td className="py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black border border-amber-300 animate-pulse">
                      <Clock className="w-3 h-3" /> PENDING
                    </span>
                  </td>

                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(student.id, student.full_name)}
                        disabled={actionId === student.id}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-soft-sm"
                        icon={UserCheck}
                      >
                        Approve
                      </Button>

                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleReject(student.id, student.full_name)}
                        disabled={actionId === student.id}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700 font-bold text-xs"
                        icon={UserX}
                      >
                        Reject
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};
