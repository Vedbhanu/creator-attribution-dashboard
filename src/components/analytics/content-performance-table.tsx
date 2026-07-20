'use client';

import Link from 'next/link';
import { ContentAttributionMetrics } from '@/types/database';
import { Trophy, ArrowUpRight, Download } from 'lucide-react';
import { exportToCSV } from '@/lib/export';

export function ContentPerformanceTable({ rankings }: { rankings: ContentAttributionMetrics[] }) {
  const handleExport = () => {
    const data = rankings.map(({ content, visitors_count, leads_count, sales_count, total_revenue, visitor_to_lead_cr }) => ({
      Title: content.title,
      Platform: content.platform,
      Tracking_Slug: content.tracking_slug,
      Visitors: visitors_count,
      Leads: leads_count,
      Sales: sales_count,
      Conversion_Rate: `${visitor_to_lead_cr}%`,
      Revenue: `$${total_revenue.toFixed(2)}`,
    }));
    exportToCSV(data, 'creator_attribution_revenue_report');
  };

  return (
    <div className="p-6 rounded-2xl bg-white border-2.5 border-[#111111] shadow-[4px_4px_0px_#111111] space-y-5">
      <div className="flex items-center justify-between border-b-2 border-[#111111] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#EC4899]" />
            <h2 className="text-base font-extrabold text-[#111111]">Top Performing Content (By Revenue)</h2>
          </div>
          <p className="text-xs text-[#4B4B4B] font-semibold mt-0.5">Ranked list answering: Which content items generate your revenue?</p>
        </div>

        <div className="flex items-center gap-3">
          {rankings.length > 0 && (
            <button
              onClick={handleExport}
              className="px-3 py-1.5 rounded-xl bg-white text-[#111111] font-extrabold text-xs border-2 border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-[#F7F4EC] inline-flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-[#4A4FE0]" />
              Export CSV
            </button>
          )}

          <Link
            href="/content"
            className="px-3 py-1.5 rounded-xl bg-[#F6D74C] text-[#111111] font-extrabold text-xs border-2 border-[#111111] shadow-[2px_2px_0px_#111111] hover:translate-x-[1px] hover:translate-y-[1px] inline-flex items-center gap-1"
          >
            View All Content <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {rankings.length === 0 ? (
        <div className="p-8 text-center text-[#4B4B4B] text-xs font-bold">No performance metrics recorded yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#111111]">
            <thead className="bg-[#F7F4EC] text-[#111111] font-extrabold border-b-2 border-[#111111] uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Content Title</th>
                <th className="px-4 py-3">Platform</th>
                <th className="px-4 py-3 text-center">Visitors</th>
                <th className="px-4 py-3 text-center">Leads</th>
                <th className="px-4 py-3 text-center">Sales</th>
                <th className="px-4 py-3 text-center">Conv. Rate</th>
                <th className="px-4 py-3 text-right">Revenue ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#111111]/10 font-medium">
              {rankings.map(({ content, visitors_count, leads_count, sales_count, total_revenue, visitor_to_lead_cr }, index) => (
                <tr key={content.id} className="hover:bg-[#F7F4EC] transition-colors">
                  <td className="px-4 py-3 font-extrabold text-[#111111]">
                    {index === 0 ? (
                      <span className="w-7 h-7 rounded-full bg-[#F6D74C] text-[#111111] border-2 border-[#111111] shadow-[1px_1px_0px_#111111] flex items-center justify-center text-xs">🥇</span>
                    ) : index === 1 ? (
                      <span className="w-7 h-7 rounded-full bg-white text-[#111111] border-2 border-[#111111] shadow-[1px_1px_0px_#111111] flex items-center justify-center text-xs">🥈</span>
                    ) : index === 2 ? (
                      <span className="w-7 h-7 rounded-full bg-[#F7F4EC] text-[#111111] border-2 border-[#111111] shadow-[1px_1px_0px_#111111] flex items-center justify-center text-xs">🥉</span>
                    ) : (
                      <span className="text-[#4B4B4B] pl-2 font-bold">#{index + 1}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/content/${content.id}`} className="font-extrabold text-[#111111] hover:text-[#EC4899] transition-colors text-sm">
                      {content.title}
                    </Link>
                    <div className="text-[10px] font-mono text-[#4B4B4B] font-bold">/r/{content.tracking_slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#4A4FE0] text-white border-2 border-[#111111] shadow-[1px_1px_0px_#111111]">
                      {content.platform}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-extrabold text-[#111111]">{visitors_count}</td>
                  <td className="px-4 py-3 text-center font-extrabold text-[#4A4FE0]">{leads_count}</td>
                  <td className="px-4 py-3 text-center font-extrabold text-[#EC4899]">{sales_count}</td>
                  <td className="px-4 py-3 text-center font-mono text-xs font-bold text-[#111111]">
                    {visitor_to_lead_cr}%
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-base font-black text-[#EC4899]">
                      ${total_revenue.toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
