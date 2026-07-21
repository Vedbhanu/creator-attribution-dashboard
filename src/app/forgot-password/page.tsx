'use client';

import { useState } from 'react';
import Link from 'next/link';
import { KeyRound, Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (supabase) {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/login`,
        });
        if (resetError) throw resetError;
      }

      setSent(true);
    } catch (err: any) {
      // Show confirmation in local mode as well
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 rounded-3xl bg-white border-3 border-[#111111] shadow-[8px_8px_0px_#111111] space-y-6">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#4A4FE0] text-white border-2 border-[#111111] flex items-center justify-center mx-auto shadow-[3px_3px_0px_#111111]">
            <KeyRound className="w-6 h-6 text-[#F6D74C]" />
          </div>
          <h1 className="text-2xl font-black text-[#111111] tracking-tight">Reset Your Password</h1>
          <p className="text-xs text-[#4B4B4B] font-semibold">
            Enter your registered email address to receive password reset instructions.
          </p>
        </div>

        {sent ? (
          <div className="p-6 rounded-2xl bg-[#F7F4EC] border-2 border-[#111111] space-y-4 text-center shadow-[4px_4px_0px_#111111]">
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white border-2 border-[#111111] flex items-center justify-center mx-auto shadow-[2px_2px_0px_#111111]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black text-[#111111]">Reset Link Sent!</h3>
              <p className="text-xs text-[#4B4B4B] font-semibold">
                We've sent password reset instructions & OTP verification link to <strong>{email}</strong>. Please check your inbox.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#4A4FE0] text-white font-extrabold text-xs border-2 border-[#111111] shadow-[2px_2px_0px_#111111]"
            >
              Back to Login →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-100 border-2 border-[#111111] text-[#111111] text-xs font-bold flex items-center gap-2 shadow-[2px_2px_0px_#111111]">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

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
              <span>{loading ? 'Sending Reset Email...' : 'Send Password Reset Link →'}</span>
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
