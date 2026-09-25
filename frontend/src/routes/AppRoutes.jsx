import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from '../pages/LandingPage';
import { Login } from '../pages/auth/Login';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { StudentList } from '../pages/students/StudentList';
import { StudentProfile } from '../pages/students/StudentProfile';
import { AddStudent } from '../pages/students/AddStudent';
import { EditStudent } from '../pages/students/EditStudent';
import { BirthdayDashboard } from '../pages/birthdays/BirthdayDashboard';
import { NotificationCenter } from '../pages/notifications/NotificationCenter';
import { Settings } from '../pages/settings/Settings';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected Leader & Admin Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/students" element={<StudentList />} />
          <Route path="/student/:id" element={<StudentProfile />} />
          <Route path="/add-student" element={<AddStudent />} />
          <Route path="/edit-student/:id" element={<EditStudent />} />
          <Route path="/birthdays" element={<BirthdayDashboard />} />
          <Route path="/notifications" element={<NotificationCenter />} />
          <Route path="/profile" element={<Settings />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
