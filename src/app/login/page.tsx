'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Mail, Lock, ArrowRight, ShieldCheck, AlertCircle, KeyRound, ArrowLeft } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      if (isSupabaseConfigured() && supabase) {
        const { error: authError } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/dashboard`
          }
        });
        if (authError) throw authError;
      } else {
        // Fallback for simulation/testing
        localStorage.setItem('user_email', 'abdbhanu12@gmail.com');
        localStorage.setItem('user_name', 'Ved Bhanu');
        localStorage.setItem('user_role', 'admin');
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Google login failed.');
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSupabaseConfigured() && supabase) {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) {
          setError('Invalid email or password. Please verify your credentials and try again.');
          setLoading(false);
          return;
        }
      } else {
        // Validation check in local mode
        if (!email.includes('@') || password.length < 4) {
          setError('Please enter a valid email and password.');
          setLoading(false);
          return;
        }
      }

      // Save user session details locally
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_email', email);
        if (email.toLowerCase().includes('ved') || email === 'abdbhanu1212@gmail.com') {
          localStorage.setItem('user_role', 'admin');
          localStorage.setItem('user_name', 'Ved Bhanu');
        } else {
          localStorage.setItem('user_role', 'client');
          const derivedName = email.split('@')[0];
          localStorage.setItem('user_name', derivedName.charAt(0).toUpperCase() + derivedName.slice(1));
        }
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
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
            <Sparkles className="w-6 h-6 text-[#F6D74C]" />
          </div>
          <h1 className="text-2xl font-black text-[#111111] tracking-tight">Creator Login</h1>
          <p className="text-xs text-[#4B4B4B] font-semibold">
            Access your creator attribution dashboard & revenue analytics
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-100 border-2 border-[#111111] text-[#111111] text-xs font-bold flex items-center gap-2.5 shadow-[3px_3px_0px_#111111]">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-[#111111]">Email Address</label>
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

          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-[#111111]">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-[#111111]" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] text-sm text-[#111111] font-bold focus:outline-none focus:bg-white"
              />
            </div>
          </div>

          {/* Prominent Forgot Password Link */}
          <div className="flex items-center justify-between text-xs font-bold py-1">
            <Link
              href="/forgot-password"
              className="text-[#4A4FE0] hover:underline font-extrabold inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F7F4EC] border border-[#111111] shadow-[2px_2px_0px_#111111]"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#4A4FE0]" />
              <span>🔑 Forgot Password? Reset Here →</span>
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#4A4FE0] hover:bg-[#3b40cc] text-white font-black text-xs border-2 border-[#111111] shadow-[4px_4px_0px_#111111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#111111] transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Login to Dashboard →'}
          </button>
        </form>

        <div className="relative flex items-center justify-center my-3">
          <div className="border-t border-[#111111]/10 w-full"></div>
          <span className="absolute bg-white px-3 text-[10px] font-extrabold text-[#8A8A8A] uppercase">Or</span>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-white hover:bg-[#F7F4EC] text-[#111111] font-black text-xs border-2 border-[#111111] shadow-[4px_4px_0px_#111111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#111111] transition-all inline-flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.59 5.59 0 0 1 8.4 12.928a5.59 5.59 0 0 1 5.59-5.592c1.47 0 2.804.572 3.805 1.5l3.24-3.24A10.15 10.15 0 0 0 13.99 2.2a10.19 10.19 0 0 0-10.19 10.19 10.19 10.19 0 0 0 10.19 10.19c5.68 0 10.19-4.026 10.19-10.19 0-.61-.06-1.2-.17-1.765H12.24Z" />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="text-center pt-2 text-xs font-bold text-[#4B4B4B] space-y-2 border-t border-[#111111]/10">
          <p>
            Don't have an account yet?{' '}
            <Link href="/signup" className="text-[#4A4FE0] hover:underline font-extrabold">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
