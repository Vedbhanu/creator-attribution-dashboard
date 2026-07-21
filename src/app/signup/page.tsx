'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Mail, Lock, User, ArrowRight, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (supabase) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } }
        });
        if (error) console.warn('Supabase auth note:', error.message);
      }

      // Save user session details locally
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_email', email);
        localStorage.setItem('user_name', name || email.split('@')[0]);
        if (email.toLowerCase().includes('ved') || email === 'abdbhanu1212@gmail.com') {
          localStorage.setItem('user_role', 'admin');
        } else {
          localStorage.setItem('user_role', 'client');
        }
      }

      // Save initial workspace settings
      fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: email,
          brand_name: `${name}'s Workspace`,
          currency: 'USD',
          custom_domain: 'attrib.yourdomain.com',
          webhook_secret: 'whsec_creator_attrib_982374'
        })
      }).catch(err => console.error(err));

      router.push('/onboarding');
      router.refresh();
    } catch (err: any) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_email', email);
        localStorage.setItem('user_name', name || email.split('@')[0]);
        localStorage.setItem('user_role', 'client');
      }
      router.push('/onboarding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] flex flex-col items-center justify-center p-4 relative">
      {/* Top Right Back to Sales Page Button */}
      <div className="w-full max-w-md flex justify-end pb-3">
        <Link
          href="/"
          className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#F7F4EC] text-[#111111] font-extrabold text-xs border-2 border-[#111111] shadow-[3px_3px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#111111] transition-all inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4 text-[#4A4FE0]" />
          <span>Back to Sales Page</span>
        </Link>
      </div>

      <div className="w-full max-w-md p-8 rounded-3xl bg-white border-3 border-[#111111] shadow-[8px_8px_0px_#111111] space-y-6">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#4A4FE0] text-white border-2 border-[#111111] flex items-center justify-center mx-auto shadow-[3px_3px_0px_#111111]">
            <Sparkles className="w-6 h-6 text-[#F6D74C]" />
          </div>
          <h1 className="text-2xl font-black text-[#111111] tracking-tight">Create Creator Account</h1>
          <p className="text-xs text-[#4B4B4B] font-semibold">
            Start tracking visitors, leads, and revenue in under 2 minutes
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border-2 border-rose-500 text-rose-600 text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-[#111111]">Creator / Brand Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3.5 text-[#111111]" />
              <input
                type="text"
                required
                placeholder="Alex Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] text-sm text-[#111111] font-bold focus:outline-none focus:bg-white"
              />
            </div>
          </div>

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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#4A4FE0] hover:bg-[#3b40cc] text-white font-black text-xs border-2 border-[#111111] shadow-[4px_4px_0px_#111111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#111111] transition-all disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Get Started Now →'}
          </button>
        </form>

        <div className="text-center pt-2 text-xs font-bold text-[#4B4B4B] space-y-2">
          <p>
            Already have an account?{' '}
            <Link href="/login" className="text-[#4A4FE0] hover:underline font-extrabold">
              Sign In
            </Link>
          </p>
          <p>
            <Link href="/" className="text-[#111111] hover:underline">
              ← Back to Sales Page
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
