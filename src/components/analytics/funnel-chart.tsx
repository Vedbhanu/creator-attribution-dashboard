'use client';

import { Eye, Users, ShoppingCart, DollarSign } from 'lucide-react';
import { AnalyticsSummary } from '@/types/database';

export function FunnelChart({ summary }: { summary: AnalyticsSummary }) {
  const visitorToLead = summary.total_visitors > 0
    ? ((summary.total_leads / summary.total_visitors) * 100).toFixed(1)
    : '0';

  const leadToSale = summary.total_leads > 0
    ? ((summary.total_sales / summary.total_leads) * 100).toFixed(1)
    : '0';

  return (
    <div className="p-6 rounded-2xl bg-white border-2.5 border-[#111111] shadow-[4px_4px_0px_#111111] space-y-6">
      <div className="flex items-center justify-between border-b-2 border-[#111111] pb-4">
        <div>
          <h2 className="text-base font-extrabold text-[#111111]">Attribution Conversion Funnel</h2>
          <p className="text-xs text-[#4B4B4B] font-semibold">Step-by-step visitor drop-off and monetization funnel</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
        {/* Step 1: Visitors */}
        <div className="p-4 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] space-y-3 relative shadow-[2px_2px_0px_#111111]">
          <div className="flex items-center justify-between text-xs font-extrabold text-[#4A4FE0]">
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" /> 1. Visitors
            </span>
            <span className="bg-[#4A4FE0] text-white px-2 py-0.5 rounded-full border border-[#111111] text-[10px]">100%</span>
          </div>
          <div className="text-2xl font-extrabold text-[#111111]">{summary.total_visitors}</div>
          <div className="w-full bg-white border border-[#111111] h-3 rounded-full overflow-hidden p-0.5">
            <div className="bg-[#4A4FE0] h-full w-full rounded-full"></div>
          </div>
          <p className="text-[10px] text-[#4B4B4B] font-bold">Clicked creator tracking links</p>
        </div>

        {/* Step 2: Leads */}
        <div className="p-4 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] space-y-3 relative shadow-[2px_2px_0px_#111111]">
          <div className="flex items-center justify-between text-xs font-extrabold text-[#EC4899]">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4" /> 2. Captured Leads
            </span>
            <span className="bg-[#EC4899] text-white px-2 py-0.5 rounded-full border border-[#111111] text-[10px]">{visitorToLead}%</span>
          </div>
          <div className="text-2xl font-extrabold text-[#EC4899]">{summary.total_leads}</div>
          <div className="w-full bg-white border border-[#111111] h-3 rounded-full overflow-hidden p-0.5">
            <div className="bg-[#EC4899] h-full rounded-full" style={{ width: `${Math.min(Number(visitorToLead), 100)}%` }}></div>
          </div>
          <p className="text-[10px] text-[#4B4B4B] font-bold">Submitted contact form</p>
        </div>

        {/* Step 3: Closed Sales */}
        <div className="p-4 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] space-y-3 relative shadow-[2px_2px_0px_#111111]">
          <div className="flex items-center justify-between text-xs font-extrabold text-[#111111]">
            <span className="flex items-center gap-1.5">
              <ShoppingCart className="w-4 h-4" /> 3. Closed Sales
            </span>
            <span className="bg-[#F6D74C] text-[#111111] px-2 py-0.5 rounded-full border border-[#111111] text-[10px] font-extrabold">{summary.overall_conversion_rate}%</span>
          </div>
          <div className="text-2xl font-extrabold text-[#111111]">{summary.total_sales}</div>
          <div className="w-full bg-white border border-[#111111] h-3 rounded-full overflow-hidden p-0.5">
            <div className="bg-[#F6D74C] h-full rounded-full" style={{ width: `${Math.min(summary.overall_conversion_rate, 100)}%` }}></div>
          </div>
          <p className="text-[10px] text-[#4B4B4B] font-bold">Purchased offer/product</p>
        </div>

        {/* Step 4: Total Revenue */}
        <div className="p-4 rounded-xl bg-[#EC4899] text-white border-2 border-[#111111] space-y-3 shadow-[3px_3px_0px_#111111]">
          <div className="flex items-center justify-between text-xs font-extrabold text-white">
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-[#F6D74C]" /> 4. Total Revenue
            </span>
            <span className="bg-[#111111] text-white px-2 py-0.5 rounded-full border border-white text-[10px]">Outcome</span>
          </div>
          <div className="text-2xl font-black text-white">
            ${summary.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="w-full bg-white border border-[#111111] h-3 rounded-full overflow-hidden p-0.5">
            <div className="bg-[#F6D74C] h-full w-full rounded-full"></div>
          </div>
          <p className="text-[10px] text-white font-extrabold">Attributed directly to content</p>
        </div>
      </div>
    </div>
  );
}
