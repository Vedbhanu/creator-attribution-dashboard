'use client';

import { DollarSign, Eye, Users, TrendingUp } from 'lucide-react';
import { AnalyticsSummary } from '@/types/database';

export function OverviewMetrics({ summary }: { summary: AnalyticsSummary }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Total Revenue Card */}
      <div className="p-6 rounded-2xl bg-[#EC4899] text-white border-2.5 border-[#111111] shadow-[4px_4px_0px_#111111] space-y-2 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-white">Total Attributed Revenue</span>
          <div className="p-2 rounded-xl bg-[#111111] text-white border-2 border-white shadow-[2px_2px_0px_#FFFFFF]">
            <DollarSign className="w-4 h-4 text-[#F6D74C]" />
          </div>
        </div>
        <div className="text-3xl font-black text-white">
          ${summary.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        <p className="text-[11px] text-white/90 font-bold">Attributed back to specific content</p>
      </div>

      {/* Total Visitors Card */}
      <div className="p-6 rounded-2xl bg-white text-[#111111] border-2.5 border-[#111111] shadow-[4px_4px_0px_#111111] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-[#4B4B4B] uppercase tracking-wider">Total Unique Visitors</span>
          <div className="p-2 rounded-xl bg-[#4A4FE0] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111]">
            <Eye className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="text-3xl font-extrabold text-[#111111]">{summary.total_visitors}</div>
        <p className="text-[11px] text-[#8A8A8A] font-semibold">Tracking clicks across all links</p>
      </div>

      {/* Captured Leads Card */}
      <div className="p-6 rounded-2xl bg-white text-[#111111] border-2.5 border-[#111111] shadow-[4px_4px_0px_#111111] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-[#4B4B4B] uppercase tracking-wider">Captured Email Leads</span>
          <div className="p-2 rounded-xl bg-[#F6D74C] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111]">
            <Users className="w-4 h-4 text-[#111111]" />
          </div>
        </div>
        <div className="text-3xl font-extrabold text-[#4A4FE0]">{summary.total_leads}</div>
        <p className="text-[11px] text-[#8A8A8A] font-semibold">Opt-in form conversions</p>
      </div>

      {/* Conversion Rate Card */}
      <div className="p-6 rounded-2xl bg-[#F7F4EC] text-[#111111] border-2.5 border-[#111111] shadow-[4px_4px_0px_#111111] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-[#4B4B4B] uppercase tracking-wider">Visitor → Sale Conversion</span>
          <div className="p-2 rounded-xl bg-[#EC4899] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111]">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="text-3xl font-extrabold text-[#111111]">{summary.overall_conversion_rate}%</div>
        <p className="text-[11px] text-[#4B4B4B] font-bold">{summary.total_sales} total closed sales</p>
      </div>
    </div>
  );
}
