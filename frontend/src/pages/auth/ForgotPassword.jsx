import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatedLogo } from '../../components/ui/AnimatedLogo';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] subtle-gold-mesh flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-[420px] flex flex-col items-center">
        <div className="mb-6">
          <AnimatedLogo size="medium" showText={false} />
        </div>

        <div className="w-full bg-white rounded-[28px] shadow-soft-md border border-gold-200/80 p-6 sm:p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold text-[#4A4A4A]">Password Recovery</h2>
            <p className="text-xs text-gray-500 mt-1">
              Enter your email to receive a password reset link
            </p>
          </div>

          {submitted ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-gray-800">Reset Email Sent</h4>
              <p className="text-xs text-gray-500">
                If an account exists for <span className="font-semibold text-gray-700">{email}</span>, you will receive instructions shortly.
              </p>
              <Link to="/login" className="block pt-2">
                <Button variant="primary" size="md" className="w-full">
                  Return to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Registered Email"
                type="email"
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="leader@harisaurabh.com"
                required
              />

              <Button type="submit" variant="primary" size="lg" className="w-full mt-2">
                Send Recovery Link
              </Button>

              <div className="text-center pt-4">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gold-600"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
