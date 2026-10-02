import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, ShieldCheck } from 'lucide-react';
import logoImg from '../../assets/logo.png';

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200/80 text-gray-600 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Logo & About */}
          <div className="sm:col-span-2 space-y-4">
            <Link to="/dashboard" className="flex items-center gap-3 group w-fit">
              <img
                src={logoImg}
                alt="Hari-Saurabh Hostel"
                className="h-10 sm:h-12 w-auto group-hover:scale-105 transition-transform"
              />
              <div>
                <h4 className="text-base sm:text-lg font-bold text-[#4A4A4A]">HARI-SAURABH HOSTEL</h4>
                <p className="text-xs text-gold-600 font-semibold tracking-wider uppercase">
                  Smart Management Platform
                </p>
              </div>
            </Link>
            <p className="text-xs sm:text-sm text-gray-500 max-w-md leading-relaxed">
              Elevating student living with intelligent room management, floor-wise
              administration, automated birthday celebrations, and real-time alerts.
            </p>
          </div>

          {/* Quick Links — use React Router Link (not bare <a>) to avoid full reloads */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-[#4A4A4A] uppercase tracking-wider">
              Quick Navigation
            </h5>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/dashboard" className="hover:text-gold-600 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/students" className="hover:text-gold-600 transition-colors">
                  Student Directory
                </Link>
              </li>
              <li>
                <Link to="/birthdays" className="hover:text-gold-600 transition-colors">
                  Birthday Automations
                </Link>
              </li>
              <li>
                <Link to="/notifications" className="hover:text-gold-600 transition-colors">
                  Live Alerts
                </Link>
              </li>
              <li>
                <Link to="/settings" className="hover:text-gold-600 transition-colors">
                  Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* System Status */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-[#4A4A4A] uppercase tracking-wider">
              System Status
            </h5>
            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                <span>Frontend: Deployed &amp; Live</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gold-500 shrink-0" />
                <span>Backend: Render API Active</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                <span>Database: Supabase PostgreSQL</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-green-600 shrink-0" />
                <span>JWT Auth + Role Protection</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 sm:pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-3">
          <p>© {year} Hari-Saurabh Hostel Management System. All rights reserved.</p>
          <div className="flex items-center gap-1 text-gray-400">
            <Building2 className="w-3.5 h-3.5" />
            <span>Built for hostel leaders &amp; students</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
