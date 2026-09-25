import React from 'react';
import { Heart, Building2, Phone, Mail, ShieldCheck } from 'lucide-react';
import { AnimatedLogo } from '../ui/AnimatedLogo';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200/80 text-gray-600 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Logo & About */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Hari-Saurabh Hostel" className="h-12 w-auto" />
              <div>
                <h4 className="text-lg font-bold text-[#4A4A4A]">HARI-SAURABH HOSTEL</h4>
                <p className="text-xs text-gold-600 font-semibold tracking-wider uppercase">Smart Management Platform</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 max-w-md leading-relaxed">
              Elevating student living with intelligent room management, floor-wise administration, automated birthday celebrations, and real-time alerts.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-[#4A4A4A] uppercase tracking-wider">Quick Navigation</h5>
            <ul className="space-y-2 text-sm">
              <li><a href="/dashboard" className="hover:text-gold-600 transition-colors">Admin Dashboard</a></li>
              <li><a href="/students" className="hover:text-gold-600 transition-colors">Student Directory</a></li>
              <li><a href="/birthdays" className="hover:text-gold-600 transition-colors">Birthday Automations</a></li>
              <li><a href="/notifications" className="hover:text-gold-600 transition-colors">Live Alerts</a></li>
            </ul>
          </div>

          {/* Support & Deployment */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-[#4A4A4A] uppercase tracking-wider">Deploy & Cloud</h5>
            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span>Frontend: Vercel Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gold-500"></span>
                <span>Backend: Render API Live</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>Database: Supabase PostgreSQL</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <p>© {new Date().getFullYear()} Hari-Saurabh Hostel Management System. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Built with precision for leaders and students</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
