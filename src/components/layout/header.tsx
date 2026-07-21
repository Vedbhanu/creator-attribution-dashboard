'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Plus, UserCheck, Zap, LogOut, LogIn, Settings, ShieldCheck, ChevronDown } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/toast';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();
  const hasSupabase = isSupabaseConfigured();

  const [brandName, setBrandName] = useState('Demo Creator Workspace');
  const [userName, setUserName] = useState('Demo Creator');
  const [userEmail, setUserEmail] = useState('demo@creator.com');
  const [accountTag, setAccountTag] = useState('Sample Sandbox');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Read local user session
    const storedEmail = typeof window !== 'undefined' ? localStorage.getItem('user_email') : null;
    const storedRole = typeof window !== 'undefined' ? localStorage.getItem('user_role') : null;
    const storedName = typeof window !== 'undefined' ? localStorage.getItem('user_name') : null;

    setIsLoggedIn(!!storedEmail);

    if (storedEmail) {
      setUserEmail(storedEmail);
      if (storedRole === 'admin' || storedEmail === 'abdbhanu1212@gmail.com') {
        setUserName('Ved Bhanu');
        setAccountTag('Agency Admin 👑');
        setBrandName('Ved Automation Agency');
        setIsAdmin(true);
      } else {
        setUserName(storedName || storedEmail.split('@')[0]);
        setAccountTag('Creator Workspace');
        setBrandName(`${storedName || 'Creator'}'s Workspace`);
        setIsAdmin(false);
      }
    } else {
      // Default Demo Mode (Isolated from Ved's admin data)
      setBrandName('Demo Sandbox Workspace');
      setUserName('Demo Creator');
      setUserEmail('demo@creator.com');
      setAccountTag('Sample Sandbox');
      setIsAdmin(false);
    }

    // Close dropdown on outside click
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_name');
      }
      if (supabase) {
        await supabase.auth.signOut();
      }
      showToast('👋 Logged out successfully!');
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error(err);
      window.location.href = '/login';
    }
  };

  return (
    <header className="sticky top-0 z-20">
      {/* Top Banner */}
      <div className="bg-[#F6D74C] border-b-2 border-[#111111] text-center py-2 px-4 font-extrabold text-xs text-[#111111]">
        ⚡ Creator Attribution Engine — See exactly which content item makes you money
      </div>

      {/* Main Header Bar */}
      <div className="h-16 border-b-2 border-[#111111] bg-[#FDFCF8] px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm font-extrabold text-[#111111] hover:text-[#4A4FE0] transition-colors">
            {brandName}
          </Link>
          <span className="text-[#111111] font-bold">/</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-[#4A4FE0] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111]">
            <Zap className="w-3.5 h-3.5 text-[#F6D74C]" />
            {hasSupabase ? 'Supabase Cloud DB' : 'Local Sandbox Mode'}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/content/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold bg-[#EC4899] hover:bg-[#D6317C] text-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#111111] transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Content Item
          </Link>

          {/* User Profile Pill & Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 pl-4 border-l-2 border-[#111111] group focus:outline-none"
            >
              <div className="w-9 h-9 rounded-full bg-[#F6D74C] border-2 border-[#111111] flex items-center justify-center text-[#111111] font-extrabold shadow-[2px_2px_0px_#111111] group-hover:bg-[#4A4FE0] group-hover:text-white transition-colors">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-extrabold text-[#111111] group-hover:text-[#4A4FE0] flex items-center gap-1">
                  <span>{userName}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </p>
                <p className="text-[10px] text-[#4B4B4B] font-bold">{accountTag}</p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 p-2 rounded-2xl bg-white border-3 border-[#111111] shadow-[6px_6px_0px_#111111] z-50 space-y-1">
                <div className="p-3 border-b-2 border-[#111111] bg-[#F7F4EC] rounded-xl text-left">
                  <p className="text-xs font-black text-[#111111] truncate">{userName}</p>
                  <p className="text-[10px] font-mono font-bold text-[#4B4B4B] truncate">{userEmail}</p>
                </div>

                <Link
                  href="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="w-full px-3 py-2 rounded-xl text-xs font-extrabold text-[#111111] hover:bg-[#F7F4EC] flex items-center gap-2 transition-colors"
                >
                  <Settings className="w-4 h-4 text-[#4A4FE0]" />
                  <span>Workspace Settings</span>
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setDropdownOpen(false)}
                    className="w-full px-3 py-2 rounded-xl text-xs font-extrabold text-[#111111] hover:bg-[#F6D74C] flex items-center gap-2 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#111111]" />
                    <span>Agency Admin 👑</span>
                  </Link>
                )}

                {isLoggedIn ? (
                  <button
                    onClick={handleLogout}
                    className="w-full px-3 py-2 rounded-xl text-xs font-black text-rose-600 hover:bg-rose-100 flex items-center gap-2 transition-colors border-t border-[#111111]/10 pt-2"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>Log Out →</span>
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setDropdownOpen(false)}
                    className="w-full px-3 py-2.5 rounded-xl text-xs font-black text-white bg-[#4A4FE0] hover:bg-[#3b40cc] flex items-center justify-center gap-2 transition-colors border-t border-[#111111]/10 mt-1 shadow-[2px_2px_0px_#111111]"
                  >
                    <LogIn className="w-4 h-4 text-white" />
                    <span>Sign In / Create Account →</span>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
