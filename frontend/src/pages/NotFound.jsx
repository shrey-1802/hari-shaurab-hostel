import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Building2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import logoImg from '../assets/logo.png';

export const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col items-center justify-center px-4 text-center">
      {/* Animated background orbs */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-gradient-to-br from-gold-300/20 to-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-gradient-to-tl from-amber-300/20 to-gold-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-md w-full">
        {/* Logo */}
        <Link to="/" className="inline-block mb-8">
          <img src={logoImg} alt="Hari-Saurabh Hostel" className="h-16 w-auto mx-auto" />
        </Link>

        {/* 404 Number */}
        <div className="relative mb-6">
          <span className="text-[120px] font-black text-gold-100 select-none leading-none">404</span>
          <div className="absolute inset-0 flex items-center justify-center">
            <Building2 className="w-16 h-16 text-gold-400" />
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-extrabold text-[#4A4A4A] mb-2">Page Not Found</h1>
        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
          Please check the URL or navigate back to the dashboard.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/dashboard">
            <Button variant="primary" size="lg" icon={Home}>
              Back to Dashboard
            </Button>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>

        {/* Footer note */}
        <p className="text-xs text-gray-400 mt-10">
          © {new Date().getFullYear()} Hari-Saurabh Hostel Management System
        </p>
      </div>
    </div>
  );
};
