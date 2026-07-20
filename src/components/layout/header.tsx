'use client';

import Link from 'next/link';
import { Plus, UserCheck, Zap } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';

export function Header() {
  const hasSupabase = isSupabaseConfigured();

  return (
    <header className="sticky top-0 z-20">
      {/* Top Banner (VedBhanu style) */}
      <div className="bg-[#F6D74C] border-b-2 border-[#111111] text-center py-2 px-4 font-extrabold text-xs text-[#111111]">
        ⚡ Creator Attribution Engine — See exactly which content item makes you money
      </div>

      {/* Main Header Bar */}
      <div className="h-16 border-b-2 border-[#111111] bg-[#FDFCF8] px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm font-extrabold text-[#111111] hover:text-[#EC4899] transition-colors">
            Ved Automation Workspace
          </Link>
          <span className="text-[#111111] font-bold">/</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-[#4A4FE0] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111]">
            <Zap className="w-3.5 h-3.5 text-[#F6D74C]" />
            {hasSupabase ? 'Supabase Cloud DB' : 'Local Storage Mode'}
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

          <Link href="/login" className="flex items-center gap-2 pl-4 border-l-2 border-[#111111] group">
            <div className="w-9 h-9 rounded-full bg-[#F6D74C] border-2 border-[#111111] flex items-center justify-center text-[#111111] font-extrabold shadow-[2px_2px_0px_#111111] group-hover:bg-[#EC4899] group-hover:text-white transition-colors">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-extrabold text-[#111111] group-hover:text-[#EC4899]">Ved Bhanu</p>
              <p className="text-[10px] text-[#4B4B4B] font-bold">Pro Account</p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
