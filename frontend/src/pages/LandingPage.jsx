import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AnimatedLogo } from '../components/ui/AnimatedLogo';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Cake,
  Bell,
  ShieldCheck,
  Building2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Smartphone,
  ChevronRight,
  MessageSquare,
  Search,
  Lock,
  Mail,
} from 'lucide-react';

export const LandingPage = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@harisaurabh.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState('MAIN_LEADER');

  const handleQuickLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (role) => {
    setActiveRole(role);
    if (role === 'MAIN_LEADER') {
      setEmail('admin@harisaurabh.com');
    } else {
      setEmail('aman.floor2@harisaurabh.com');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col selection:bg-gold-500 selection:text-white">
      <Navbar isLanding={true} />

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden subtle-gold-mesh">
        {/* Floating background decorative orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-gold-200/20 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-glow" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-amber-200/25 rounded-full blur-3xl pointer-events-none -z-10 animate-float" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Left: Animated Logo & Core Proposition */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-7 text-center lg:text-left space-y-6"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 border border-gold-300/80 shadow-soft-sm text-gold-800 text-xs sm:text-sm font-bold">
                <Sparkles className="w-4 h-4 text-gold-500 animate-spin-ultra-slow" />
                <span>Next-Gen Smart Hostel Administration</span>
                <span className="w-1.5 h-1.5 rounded-full bg-gold-500"></span>
                <span className="text-gray-500 font-medium">GitHub Pages & Render Ready</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#4A4A4A] tracking-tight leading-[1.15]">
                Smart Management for <br className="hidden sm:inline" />
                <span className="gold-gradient-text">Hari-Saurabh Hostel</span>
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl leading-relaxed mx-auto lg:mx-0">
                Experience seamless student directories, automated birthday celebration alerts, WhatsApp Cloud integration, and floor leader authorization in one unified platform.
              </p>

              {/* Key Value Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 max-w-xl mx-auto lg:mx-0 text-left">
                <div className="flex items-center gap-2.5 text-sm font-semibold text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-gold-500 shrink-0" />
                  <span>Role-Based Floor Access (RBAC)</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm font-semibold text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-gold-500 shrink-0" />
                  <span>Automated 24h & 6h Birthday Alerts</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm font-semibold text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-gold-500 shrink-0" />
                  <span>WhatsApp 9:00 AM Greeting Bot</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm font-semibold text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-gold-500 shrink-0" />
                  <span>Instant Student Friend Graph</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
                <Link to="/login">
                  <Button size="lg" variant="primary" icon={ArrowRight}>
                    Open Leader Dashboard
                  </Button>
                </Link>
                <a href="#preview">
                  <Button size="lg" variant="secondary" icon={Users}>
                    View Student Directory
                  </Button>
                </a>
              </div>
            </motion.div>

            {/* Hero Right: Animated Hari-Saurabh Logo Showcase & Glassmorphic Quick Login Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1 }}
              className="lg:col-span-5 flex flex-col items-center justify-center relative"
            >
              {/* Central Floating Logo with Gold Aura */}
              <div className="mb-6">
                <AnimatedLogo size="hero" showText={false} animated={true} />
              </div>

              {/* Glassmorphism Login Card (420px wide per guidelines) */}
              <div className="w-full max-w-[420px] rounded-[28px] bg-white/95 backdrop-blur-xl border border-gold-200/90 shadow-soft-lg p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-28 h-28 bg-gold-200/40 rounded-full blur-xl pointer-events-none" />

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-[#4A4A4A]">Leader Sign In</h3>
                  <p className="text-xs text-gray-500 mt-1">Select role or enter your credentials</p>

                  {/* Role Selector Tabs */}
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-100 rounded-xl mt-4">
                    <button
                      type="button"
                      onClick={() => handleRoleSelect('MAIN_LEADER')}
                      className={`py-2 text-xs font-bold rounded-lg transition-all ${
                        activeRole === 'MAIN_LEADER'
                          ? 'bg-gold-500 text-white shadow-sm'
                          : 'text-gray-600 hover:text-[#4A4A4A]'
                      }`}
                    >
                      Main Leader
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRoleSelect('WING_LEADER')}
                      className={`py-2 text-xs font-bold rounded-lg transition-all ${
                        activeRole === 'WING_LEADER'
                          ? 'bg-gold-500 text-white shadow-sm'
                          : 'text-gray-600 hover:text-[#4A4A4A]'
                      }`}
                    >
                      Wing Leader (Fl. 2)
                    </button>
                  </div>
                </div>

                <form onSubmit={handleQuickLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-4 h-4 w-4 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full h-[50px] pl-11 pr-4 bg-white border border-[#DADADA] rounded-[14px] text-sm text-[#4A4A4A] focus:outline-none focus:border-gold-500 focus:ring-4 focus:ring-gold-100 transition-all shadow-sm"
                        placeholder="leader@harisaurabh.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-4 h-4 w-4 text-gray-400" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full h-[50px] pl-11 pr-4 bg-white border border-[#DADADA] rounded-[14px] text-sm text-[#4A4A4A] focus:outline-none focus:border-gold-500 focus:ring-4 focus:ring-gold-100 transition-all shadow-sm"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={loading}
                    className="w-full mt-2"
                    icon={ArrowRight}
                  >
                    Enter Management Portal
                  </Button>
                </form>

                <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                  <span className="text-xs text-gray-400">
                    Hostel Admin System v1.0 • Supabase & Render Powered
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="gold" size="md">ENTERPRISE FEATURES</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#4A4A4A] mt-3">
              Built for Leaders, Designed for Students
            </h2>
            <p className="text-base text-gray-500 mt-3">
              Everything required to oversee residential floors, record academic profiles, celebrate moments, and manage communication.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card hover={true} className="border-t-4 border-t-gold-500">
              <div className="w-14 h-14 rounded-2xl bg-gold-50 flex items-center justify-center mb-6 text-gold-600 shadow-soft-sm">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-[#4A4A4A] mb-2">Student Directory & Graph</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                Rich cards with high-res photos, DOB, room badges, academic scores, hobbies, and hostel/non-hostel friend graphs.
              </p>
              <div className="flex items-center text-xs font-bold text-gold-600 gap-1">
                <span>Multi-filter by floor & department</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </Card>

            {/* Feature 2 */}
            <Card hover={true} className="border-t-4 border-t-gold-500">
              <div className="w-14 h-14 rounded-2xl bg-gold-50 flex items-center justify-center mb-6 text-gold-600 shadow-soft-sm">
                <Cake className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-[#4A4A4A] mb-2">Automated Birthday Engine</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                Smart reminders sent 24 hours & 6 hours prior to floor leaders, with auto 9:00 AM WhatsApp Cloud API personalized greetings.
              </p>
              <div className="flex items-center text-xs font-bold text-gold-600 gap-1">
                <span>WhatsApp Cloud API Integration</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </Card>

            {/* Feature 3 */}
            <Card hover={true} className="border-t-4 border-t-gold-500">
              <div className="w-14 h-14 rounded-2xl bg-gold-50 flex items-center justify-center mb-6 text-gold-600 shadow-soft-sm">
                <Building2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-[#4A4A4A] mb-2">Floor & Wing Permissions</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                Main Leader retains high-level multi-floor analytics while Wing Leaders have laser focus on their assigned floor students.
              </p>
              <div className="flex items-center text-xs font-bold text-gold-600 gap-1">
                <span>PostgreSQL Row Level Security (RLS)</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Interactive Directory Showcase */}
      <section id="preview" className="py-20 bg-[#F7F8FA] border-y border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <Badge variant="gold" size="md">LIVE PREVIEW</Badge>
              <h2 className="text-3xl font-extrabold text-[#4A4A4A] mt-2">
                Luxury Student Profile Cards
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Preview the 320x420px student card component with gold ring avatar and birthday glow.
              </p>
            </div>
            <Link to="/students">
              <Button variant="secondary" size="md" icon={Search}>
                Explore Full Directory
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
            {/* Demo Card 1 - Today's Birthday Special Card */}
            <div className="w-full max-w-[340px] rounded-[28px] bg-white border-2 border-gold-400 p-6 shadow-gold-glow relative flex flex-col items-center text-center transition-all duration-300 hover:scale-[1.02]">
              <div className="absolute -top-3.5 px-3.5 py-1 bg-gradient-to-r from-gold-500 to-amber-500 text-white text-xs font-extrabold rounded-full shadow-gold-glow flex items-center gap-1.5 animate-pulse">
                🎂 Birthday Today!
              </div>

              {/* Profile Image with Gold Ring */}
              <div className="mt-4 relative group">
                <div className="w-[120px] h-[120px] rounded-full p-1.5 bg-gradient-to-tr from-gold-400 to-amber-300 shadow-soft-md">
                  <img
                    src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80"
                    alt="Devendra Rathore"
                    className="w-full h-full rounded-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>

              <h4 className="text-xl font-bold text-[#4A4A4A] mt-4">Devendra Rathore</h4>
              <p className="text-xs text-gray-500">Information Technology • 4th Sem</p>

              {/* Badges */}
              <div className="flex items-center gap-2 mt-4">
                <Badge variant="gold" size="sm">Floor 2</Badge>
                <Badge variant="gray" size="sm">Room 202-B</Badge>
              </div>

              {/* DOB */}
              <div className="mt-4 text-xs font-semibold text-gray-600 bg-gold-50 px-4 py-2 rounded-xl border border-gold-200 w-full">
                🎉 DOB: 25 Sep 2004 (20 Years)
              </div>

              <div className="grid grid-cols-2 gap-2 w-full mt-6">
                <Link to="/students" className="w-full">
                  <Button variant="primary" size="sm" className="w-full">
                    View Profile
                  </Button>
                </Link>
                <Button variant="outline" size="sm" className="w-full">
                  Friends
                </Button>
              </div>
            </div>

            {/* Demo Card 2 */}
            <div className="w-full max-w-[340px] rounded-[28px] bg-white border border-gray-200 p-6 shadow-soft-sm relative flex flex-col items-center text-center transition-all duration-300 hover:shadow-soft-md hover:border-gold-300">
              <div className="mt-4 relative group">
                <div className="w-[120px] h-[120px] rounded-full p-1.5 bg-gradient-to-tr from-gold-400 to-amber-200 shadow-soft-md">
                  <img
                    src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80"
                    alt="Aarav Patel"
                    className="w-full h-full rounded-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>

              <h4 className="text-xl font-bold text-[#4A4A4A] mt-4">Aarav Patel</h4>
              <p className="text-xs text-gray-500">Computer Science • 6th Sem</p>

              <div className="flex items-center gap-2 mt-4">
                <Badge variant="gold" size="sm">Floor 2</Badge>
                <Badge variant="gray" size="sm">Room 201-A</Badge>
              </div>

              <div className="mt-4 text-xs font-semibold text-gray-600 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200 w-full">
                DOB: 28 Sep 2003 (In 3 Days)
              </div>

              <div className="grid grid-cols-2 gap-2 w-full mt-6">
                <Link to="/students" className="w-full">
                  <Button variant="primary" size="sm" className="w-full">
                    View Profile
                  </Button>
                </Link>
                <Button variant="outline" size="sm" className="w-full">
                  Friends
                </Button>
              </div>
            </div>

            {/* Demo Card 3 */}
            <div className="w-full max-w-[340px] rounded-[28px] bg-white border border-gray-200 p-6 shadow-soft-sm relative flex flex-col items-center text-center transition-all duration-300 hover:shadow-soft-md hover:border-gold-300">
              <div className="mt-4 relative group">
                <div className="w-[120px] h-[120px] rounded-full p-1.5 bg-gradient-to-tr from-gold-400 to-amber-200 shadow-soft-md">
                  <img
                    src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80"
                    alt="Kavya Singhania"
                    className="w-full h-full rounded-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>

              <h4 className="text-xl font-bold text-[#4A4A4A] mt-4">Kavya Singhania</h4>
              <p className="text-xs text-gray-500">Electronics & Comm • 6th Sem</p>

              <div className="flex items-center gap-2 mt-4">
                <Badge variant="gold" size="sm">Floor 3</Badge>
                <Badge variant="gray" size="sm">Room 301-A</Badge>
              </div>

              <div className="mt-4 text-xs font-semibold text-gray-600 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200 w-full">
                DOB: 02 Oct 2003
              </div>

              <div className="grid grid-cols-2 gap-2 w-full mt-6">
                <Link to="/students" className="w-full">
                  <Button variant="primary" size="sm" className="w-full">
                    View Profile
                  </Button>
                </Link>
                <Button variant="outline" size="sm" className="w-full">
                  Friends
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cloud Architecture & Deployment Banner */}
      <section className="py-16 bg-gradient-to-r from-gold-500 via-amber-500 to-gold-600 text-white shadow-soft-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Ready for GitHub Pages & Render Deployment
              </h3>
              <p className="text-amber-100 text-sm max-w-2xl">
                Automated GitHub Actions workflow for Pages, unified Render backend API connectors, and automated PostgreSQL Supabase schema.
              </p>
            </div>
            <Link to="/login">
              <Button size="lg" className="bg-white text-gold-700 hover:bg-gold-50 font-bold shadow-soft-md" icon={ShieldCheck}>
                Launch Admin Portal
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
