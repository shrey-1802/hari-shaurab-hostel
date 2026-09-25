import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AnimatedLogo } from '../../components/ui/AnimatedLogo';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, ShieldCheck, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@harisaurabh.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeRole, setActiveRole] = useState('MAIN_LEADER');

  const handleRoleSelect = (role) => {
    setActiveRole(role);
    if (role === 'MAIN_LEADER') {
      setEmail('admin@harisaurabh.com');
      setPassword('admin123');
    } else {
      setEmail('aman.floor2@harisaurabh.com');
      setPassword('wing123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] subtle-gold-mesh flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-10 left-10 w-80 h-80 bg-gold-200/20 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-glow" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl pointer-events-none -z-10 animate-float" />

      {/* Top back link */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gold-600 transition-colors bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 shadow-soft-sm"
        >
          ← Back to Homepage
        </Link>
      </div>

      <div className="w-full max-w-[420px] flex flex-col items-center">
        {/* Animated Logo Header */}
        <div className="mb-6">
          <AnimatedLogo size="large" showText={false} animated={true} />
        </div>

        {/* 420px Glassmorphic Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full bg-white rounded-[28px] shadow-soft-md border border-gold-200/80 p-6 sm:p-8 relative"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold text-[#4A4A4A]">Leader Portal</h2>
            <p className="text-xs text-gray-500 mt-1">Sign in to access student management & floor alerts</p>

            {/* Role Demo Quick-Select Buttons */}
            <div className="grid grid-cols-2 gap-2 mt-4 p-1.5 bg-gray-100/80 rounded-2xl">
              <button
                type="button"
                onClick={() => handleRoleSelect('MAIN_LEADER')}
                className={`py-2 px-3 text-xs font-bold rounded-xl transition-all ${
                  activeRole === 'MAIN_LEADER'
                    ? 'bg-gold-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-[#4A4A4A]'
                }`}
              >
                👑 Main Leader
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect('WING_LEADER')}
                className={`py-2 px-3 text-xs font-bold rounded-xl transition-all ${
                  activeRole === 'WING_LEADER'
                    ? 'bg-gold-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-[#4A4A4A]'
                }`}
              >
                🏢 Wing Leader (Fl. 2)
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="leader@harisaurabh.com"
              required
            />

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#4A4A4A] uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-gold-600 hover:text-gold-700"
                >
                  Forgot?
                </Link>
              </div>
              <Input
                type="password"
                icon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              className="w-full mt-2"
              icon={ArrowRight}
            >
              Authenticate & Enter
            </Button>
          </form>

          {/* Quick Demo Info */}
          <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
            <span className="flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              Demo accounts auto-filled
            </span>
            <span className="font-semibold text-gold-600">v1.0 Ready</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
