'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { OverviewMetrics } from '@/components/analytics/overview-metrics';
import { FunnelChart } from '@/components/analytics/funnel-chart';
import { ContentPerformanceTable } from '@/components/analytics/content-performance-table';
import { AnalyticsSummary, ContentAttributionMetrics } from '@/types/database';
import { Sparkles, Plus, RefreshCw, BarChart2 } from 'lucide-react';

export default function AnalyticsDashboardPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [rankings, setRankings] = useState<ContentAttributionMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const userEmail = typeof window !== 'undefined' ? localStorage.getItem('user_email') : 'demo';
      const res = await fetch(`/api/analytics?userId=${encodeURIComponent(userEmail || 'demo')}`);
      const json = await res.json();
      if (json.success) {
        setSummary(json.summary);
        setRankings(json.rankings);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-[#4B4B4B] text-xs font-bold">Loading analytics engine...</div>;
  }

  if (!summary) {
    return <div className="p-12 text-center text-[#4B4B4B] text-xs font-bold">Failed to load analytics dashboard.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-2">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#4A4FE0] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#F6D74C]" />
            Attribution Engine Active
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-tight">
            Which Content Makes Me Money?
          </h1>
          <p className="text-sm text-[#4B4B4B] font-semibold mt-1">
            Real-time attribution matching visitors, email leads, and revenue back to specific content pieces.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAnalytics}
            className="p-3 rounded-xl bg-white border-2 border-[#111111] text-[#111111] shadow-[3px_3px_0px_#111111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#111111] transition-all"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <Link
            href="/content/new"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-extrabold bg-[#EC4899] hover:bg-[#D6317C] text-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#111111] transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Content Item
          </Link>
        </div>
      </div>

      {/* KPI Overview Summary */}
      <OverviewMetrics summary={summary} />

      {/* Conversion Funnel */}
      <FunnelChart summary={summary} />

      {/* Platform Revenue Distribution Bar */}
      <div className="p-6 rounded-2xl bg-white border-2.5 border-[#111111] shadow-[4px_4px_0px_#111111] space-y-4">
        <div className="flex items-center gap-2 border-b-2 border-[#111111] pb-3">
          <BarChart2 className="w-5 h-5 text-[#4A4FE0]" />
          <h2 className="text-base font-extrabold text-[#111111]">Revenue Distribution by Platform</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(summary.platform_breakdown).map(([platform, data]) => (
            <div key={platform} className="p-4 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] space-y-2 shadow-[2px_2px_0px_#111111]">
              <div className="flex items-center justify-between text-xs font-extrabold text-[#111111]">
                <span>{platform}</span>
                <span className="text-[#4B4B4B]">{data.content_count} item(s)</span>
              </div>
              <div className="text-2xl font-black text-[#EC4899]">
                ${data.revenue.toFixed(2)}
              </div>
              <div className="text-[11px] text-[#4B4B4B] font-bold">
                {data.leads} lead(s) captured
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ranked Performance Table */}
      <ContentPerformanceTable rankings={rankings} />
    </div>
  );
}
