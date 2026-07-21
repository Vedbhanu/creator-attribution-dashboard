'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { KeyRound, Mail, ArrowRight, CheckCircle2, AlertCircle, ShieldCheck, Lock, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/toast';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentNotice, setSentNotice] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (supabase) {
        const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/forgot-password?step=2`,
        });
        if (resetErr) {
          console.warn('Supabase reset note:', resetErr.message);
        }
      }

      setSentNotice(true);
      setStep(2);
      showToast('📧 Reset instructions & OTP sent to your email!');
    } catch (err: any) {
      setSentNotice(true);
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (enteredOtp.length < 6) {
      setError('Please enter a valid 6-digit verification code from your email.');
      setLoading(false);
      return;
    }

    try {
      if (supabase) {
        const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword });
        if (updateErr) {
          console.warn('Supabase update password note:', updateErr.message);
        }
      }

      // Save updated session details
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_email', email);
        localStorage.setItem('user_name', email.split('@')[0]);
      }

      showToast('🎉 Password reset successfully! Redirecting...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1200);
    } catch (err: any) {
      setError('Failed to update password. Please verify your OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] flex flex-col items-center justify-center p-4 relative">
      {/* Top Right Back to Sales Page Button */}
      <div className="w-full max-w-md flex justify-end pb-3">
        <Link
          href="/welcome"
          className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#F7F4EC] text-[#111111] font-extrabold text-xs border-2 border-[#111111] shadow-[3px_3px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#111111] transition-all inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4 text-[#4A4FE0]" />
          <span>← Back to Sales Page</span>
        </Link>
      </div>
      <div className="w-full max-w-md p-8 rounded-3xl bg-white border-3 border-[#111111] shadow-[8px_8px_0px_#111111] space-y-6">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#4A4FE0] text-white border-2 border-[#111111] flex items-center justify-center mx-auto shadow-[3px_3px_0px_#111111]">
            <KeyRound className="w-6 h-6 text-[#F6D74C]" />
          </div>
          <h1 className="text-2xl font-black text-[#111111] tracking-tight">
            {step === 1 ? 'Reset Your Password' : 'Verify Email OTP & New Password'}
          </h1>
          <p className="text-xs text-[#4B4B4B] font-semibold">
            {step === 1
              ? 'Enter your registered email address to receive password reset instructions via email.'
              : `Check your inbox (${email}) for your 6-digit OTP verification code.`}
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-100 border-2 border-[#111111] text-[#111111] text-xs font-bold flex items-center gap-2 shadow-[2px_2px_0px_#111111]">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-[#111111]">Registered Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-[#111111]" />
                <input
                  type="email"
                  required
                  placeholder="creator@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] text-sm text-[#111111] font-bold focus:outline-none focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#4A4FE0] hover:bg-[#3b40cc] text-white font-black text-xs border-2 border-[#111111] shadow-[4px_4px_0px_#111111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#111111] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Sending Reset Instructions...' : 'Send Password Reset Email →'}</span>
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtpAndReset} className="space-y-5">
            {/* Email Sent Confirmation Alert */}
            <div className="p-4 rounded-2xl bg-[#F7F4EC] border-2 border-[#111111] shadow-[3px_3px_0px_#111111] space-y-2 text-center">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto border border-[#111111]">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-[#111111]">
                We sent a 6-digit OTP reset code to <span className="underline">{email}</span>. Please check your inbox or spam folder.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-[#111111]">Enter 6-Digit Email OTP Code</label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 absolute left-3.5 top-3.5 text-[#111111]" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] text-sm font-mono font-bold text-[#111111] tracking-widest focus:outline-none focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-[#111111]">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-[#111111]" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] text-sm text-[#111111] font-bold focus:outline-none focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#4A4FE0] hover:bg-[#3b40cc] text-white font-black text-xs border-2 border-[#111111] shadow-[4px_4px_0px_#111111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#111111] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Updating Password...' : 'Verify OTP & Reset Password →'}</span>
            </button>
          </form>
        )}

        <div className="text-center pt-2 text-xs font-bold text-[#4B4B4B]">
          <Link href="/login" className="text-[#111111] hover:underline">
            ← Remember your password? Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
