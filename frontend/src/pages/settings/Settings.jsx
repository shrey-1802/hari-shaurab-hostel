import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Bell,
  Building,
  CheckCircle2,
  Mail,
  Smartphone,
  Save,
  Moon,
  Sparkles,
} from 'lucide-react';
import { usePageTitle } from '../../utils/usePageTitle';

export const Settings = () => {
  const { user, isMainLeader } = useAuth();
  const { showToast } = useNotifications();
  usePageTitle('Settings & Profile');

  const [notificationPreferences, setNotificationPreferences] = useState({
    birthdayAlerts: true,
    dayBeforeReminders: true,
    whatsappPrompt: true,
    soundAlerts: false,
  });

  const handleToggle = (key) => {
    setNotificationPreferences((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      showToast('Preference updated', 'info');
      return updated;
    });
  };

  const handleSaveProfileSettings = (e) => {
    e.preventDefault();
    showToast('Settings saved successfully!', 'success');
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto w-full min-w-0">
      {/* Top Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#4A4A4A]">Settings & Leader Profile</h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Manage system preferences, notification alerts, and active administrator account details
        </p>
      </div>

      {/* Leader Profile Summary Card */}
      <Card className="space-y-6 border-l-4 border-l-gold-500">
        <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-gold-50 text-gold-600 flex items-center justify-center">
            <User className="w-5 h-5 text-gold-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#4A4A4A]">Active Leader Account</h3>
            <p className="text-xs text-gray-500">Verified hostel administration credentials</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative shrink-0">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
              alt={user?.full_name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-gold-400/80 shadow-soft-sm"
            />
            <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" title="Active Session" />
          </div>

          <div className="space-y-3 text-center sm:text-left flex-1 min-w-0">
            <div>
              <h4 className="text-lg sm:text-xl font-extrabold text-[#4A4A4A] truncate">{user?.full_name}</h4>
              <p className="text-xs sm:text-sm text-gray-500 flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-gold-600" />
                <span>{user?.email}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <Badge variant="gold" size="md">
                {user?.role === 'MAIN_LEADER' ? 'Main Leader' : 'Wing Leader'}
              </Badge>
              {user?.assigned_floor ? (
                <Badge variant="gray" size="md">
                  Assigned Floor {user.assigned_floor} Wing
                </Badge>
              ) : (
                <Badge variant="success" size="md">
                  All Floors Authority (Fl. 4 & 6)
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Hostel Information Card */}
      <Card className="space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-gold-50 text-gold-600 flex items-center justify-center">
            <Building className="w-5 h-5 text-gold-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#4A4A4A]">Hostel Premises Information</h3>
            <p className="text-xs text-gray-500">Institution & Residential overview</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-gray-50/70 border border-gray-200">
            <span className="text-gray-400 font-semibold block mb-0.5">Hostel Name</span>
            <span className="text-[#4A4A4A] font-extrabold text-sm">Hari-Saurabh Boy's Hostel</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-50/70 border border-gray-200">
            <span className="text-gray-400 font-semibold block mb-0.5">Active Residential Floors</span>
            <span className="text-[#4A4A4A] font-extrabold text-sm">Floor 4 & Floor 6</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-50/70 border border-gray-200">
            <span className="text-gray-400 font-semibold block mb-0.5">Primary Wish Channel</span>
            <span className="text-gold-700 font-extrabold text-sm">WhatsApp Manual Dispatch (wa.me)</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-50/70 border border-gray-200">
            <span className="text-gray-400 font-semibold block mb-0.5">System Access Level</span>
            <span className="text-green-700 font-extrabold text-sm">Role-Based Clearance Active</span>
          </div>
        </div>
      </Card>

      {/* Alert & Notification Preferences */}
      <Card className="space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Bell className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#4A4A4A]">Birthday & System Alerts</h3>
            <p className="text-xs text-gray-500">Configure proactive notifications</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-gray-200/80 hover:bg-gold-50/20 transition-colors">
            <div>
              <p className="text-xs sm:text-sm font-bold text-[#4A4A4A]">Birthday Today Live Notification</p>
              <p className="text-[11px] text-gray-500">Display top banner and sound alert when resident has a birthday today</p>
            </div>
            <button
              onClick={() => handleToggle('birthdayAlerts')}
              className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors duration-200 ${
                notificationPreferences.birthdayAlerts ? 'bg-gold-500 justify-end' : 'bg-gray-200 justify-start'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white shadow-md transform transition-transform" />
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-gray-200/80 hover:bg-gold-50/20 transition-colors">
            <div>
              <p className="text-xs sm:text-sm font-bold text-[#4A4A4A]">1 Day Before (Tomorrow) Advance Reminder</p>
              <p className="text-[11px] text-gray-500">Alert leaders 24 hours ahead to prepare birthday arrangements</p>
            </div>
            <button
              onClick={() => handleToggle('dayBeforeReminders')}
              className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors duration-200 ${
                notificationPreferences.dayBeforeReminders ? 'bg-gold-500 justify-end' : 'bg-gray-200 justify-start'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white shadow-md transform transition-transform" />
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-gray-200/80 hover:bg-gold-50/20 transition-colors">
            <div>
              <p className="text-xs sm:text-sm font-bold text-[#4A4A4A]">Direct WhatsApp Wish Prompt</p>
              <p className="text-[11px] text-gray-500">Enable one-click manual WhatsApp chat link for fast student greetings</p>
            </div>
            <button
              onClick={() => handleToggle('whatsappPrompt')}
              className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors duration-200 ${
                notificationPreferences.whatsappPrompt ? 'bg-gold-500 justify-end' : 'bg-gray-200 justify-start'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white shadow-md transform transition-transform" />
            </button>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button variant="primary" size="md" onClick={handleSaveProfileSettings} icon={Save}>
            Save Preferences
          </Button>
        </div>
      </Card>
    </div>
  );
};

