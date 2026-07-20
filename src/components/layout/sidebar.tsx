'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Users, DollarSign, Sparkles } from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Analytics Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Content Library', href: '/content', icon: FileText },
  { name: 'Captured Leads', href: '/leads', icon: Users },
  { name: 'Sales & Revenue', href: '/sales', icon: DollarSign },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r-3 border-[#111111] bg-[#FDFCF8] flex flex-col justify-between h-screen sticky top-0 z-30">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b-2 border-[#111111] bg-[#F6D74C] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EC4899] text-white border-2 border-[#111111] flex items-center justify-center shadow-[3px_3px_0px_#111111]">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-[#111111] text-base leading-tight tracking-tight">Creator Attrib</h1>
            <p className="text-xs text-[#111111] font-bold">Which Content Makes $</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm border-2 border-[#111111] transition-all ${
                  isActive
                    ? 'bg-[#EC4899] text-white shadow-[3px_3px_0px_#111111] translate-x-0'
                    : 'bg-white text-[#111111] hover:bg-[#F7F4EC] shadow-[2px_2px_0px_#111111]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#111111]'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Quick Info */}
      <div className="p-4 border-2 border-[#111111] m-4 rounded-xl bg-[#F7F4EC] shadow-[3px_3px_0px_#111111] text-xs text-[#111111] space-y-2">
        <div className="flex items-center justify-between font-extrabold">
          <span>Engine Status</span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#4A4FE0] text-white text-[10px] border border-[#111111]">
            <span className="w-2 h-2 rounded-full bg-[#F6D74C] animate-pulse"></span>
            Active
          </span>
        </div>
        <p className="text-[#4B4B4B] text-[11px] font-medium leading-relaxed">
          Tracking links active & attributing visitors in real time.
        </p>
      </div>
    </aside>
  );
}
