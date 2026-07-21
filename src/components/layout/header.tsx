'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus, UserCheck, Zap, Shield, Sparkles } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';

export function Header() {
  const pathname = usePathname();
  const hasSupabase = isSupabaseConfigured();

  const [brandName, setBrandName] = useState('Demo Creator Workspace');
  const [userName, setUserName] = useState('Demo Creator');
  const [accountTag, setAccountTag] = useState('Sample Sandbox Data');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user has saved workspace settings or logged in session
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setBrandName(data.settings.brand_name || 'Ved Automation Workspace');
          
          // Check if admin account
          if (data.settings.user_id === 'admin' || data.settings.brand_name?.includes('Ved Automation')) {
            setUserName('Ved Bhanu');
            setAccountTag('Agency Admin 👑');
            setIsAdmin(true);
          } else {
            setUserName(data.settings.brand_name || 'Creator Pro');
            setAccountTag('Creator Workspace');
          }
        }
      })
      .catch(() => {
        setBrandName('Demo Creator Workspace');
        setUserName('Demo Creator');
        setAccountTag('Sample Sandbox');
      });
  }, []);

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

          <Link href="/settings" className="flex items-center gap-2 pl-4 border-l-2 border-[#111111] group">
            <div className="w-9 h-9 rounded-full bg-[#F6D74C] border-2 border-[#111111] flex items-center justify-center text-[#111111] font-extrabold shadow-[2px_2px_0px_#111111] group-hover:bg-[#4A4FE0] group-hover:text-white transition-colors">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-extrabold text-[#111111] group-hover:text-[#4A4FE0]">{userName}</p>
              <p className="text-[10px] text-[#4B4B4B] font-bold">{accountTag}</p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
