import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AnimatedLogo } from '../components/ui/AnimatedLogo';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import {
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';

export const LandingPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] subtle-gold-mesh flex flex-col justify-between items-center selection:bg-gold-500 selection:text-white relative overflow-hidden px-4 py-8">
      {/* Dynamic Background Ambient Orbs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-br from-gold-300/20 to-amber-400/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-glow" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-gradient-to-tl from-amber-300/20 to-gold-400/10 rounded-full blur-3xl pointer-events-none -z-10 animate-float" />

      {/* Top Security & System Status Bar */}
      <motion.header
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-5xl flex items-center justify-between z-10"
      >
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-gray-500 tracking-wider uppercase">
            System Online
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-gold-200/80 shadow-soft-sm text-[11px] font-bold text-gold-800">
          <ShieldCheck className="w-3.5 h-3.5 text-gold-600" />
          <span>SSL 256-Bit Encrypted</span>
        </div>
      </motion.header>

      {/* Central Focused Area: Animated Logo & Sign-In Form */}
      <main className="w-full max-w-[440px] flex flex-col items-center justify-center my-auto py-6 z-10">
        {/* Animated Brand Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8 flex flex-col items-center text-center"
        >
          <AnimatedLogo size="hero" showText={false} animated={true} />
        </motion.div>

        {/* 420px Executive Glassmorphism Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="w-full bg-white/90 backdrop-blur-xl rounded-[28px] border border-gold-200/90 shadow-soft-lg p-7 sm:p-9 relative overflow-hidden"
        >
          {/* Subtle gold accent light in corner */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-200/30 rounded-full blur-2xl pointer-events-none" />

          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-[#4A4A4A]">Leader Sign In</h2>
            <p className="text-xs text-gray-500 mt-1">
              Enter your credentials to access your administration dashboard
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-600 text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#4A4A4A] uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="leader@harisaurabh.com"
                  required
                  className="w-full h-[52px] pl-11 pr-4 bg-white border border-[#DADADA] focus:border-gold-500 focus:ring-4 focus:ring-gold-100 rounded-[14px] text-sm text-[#4A4A4A] placeholder-gray-400 focus:outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-[#4A4A4A] uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-gold-600 hover:text-gold-700 transition-colors"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-[52px] pl-11 pr-12 bg-white border border-[#DADADA] focus:border-gold-500 focus:ring-4 focus:ring-gold-100 rounded-[14px] text-sm text-[#4A4A4A] placeholder-gray-400 focus:outline-none transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              className="w-full mt-3 h-[52px] text-base font-bold shadow-soft-md"
              icon={ArrowRight}
            >
              Sign In to Portal
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-center gap-1.5 text-xs text-gray-400">
            <Sparkles className="w-3.5 h-3.5 text-gold-500" />
            <span>Authorized Leader & Staff Access Only</span>
          </div>
        </motion.div>
      </main>

      {/* Minimalist Professional Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="w-full max-w-5xl text-center z-10 pt-4"
      >
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} Hari-Saurabh Hostel Management System. All rights reserved.
        </p>
      </motion.footer>
    </div>
  );
};
