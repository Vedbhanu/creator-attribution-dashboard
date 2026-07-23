'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { OverviewMetrics } from '@/components/analytics/overview-metrics';
import { FunnelChart } from '@/components/analytics/funnel-chart';
import { ContentPerformanceTable } from '@/components/analytics/content-performance-table';
import { AnalyticsSummary, ContentAttributionMetrics } from '@/types/database';
import { Sparkles, Plus, RefreshCw, BarChart2 } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export default function AnalyticsDashboardPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [rankings, setRankings] = useState<ContentAttributionMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      let userEmail = typeof window !== 'undefined' ? localStorage.getItem('user_email') : null;

      if (!userEmail && isSupabaseConfigured() && supabase) {
        const { data } = await supabase.auth.getUser();
        if (data?.user?.email) {
          userEmail = data.user.email;
          if (typeof window !== 'undefined') {
            localStorage.setItem('user_email', userEmail);
          }
        }
      }

      const activeUserId = userEmail || 'demo';
      const res = await fetch(`/api/analytics?userId=${encodeURIComponent(activeUserId)}`);
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

      {/* First-Time Creator Quickstart Banner */}
      {summary.total_content_items === 0 && (
        <div className="p-8 rounded-3xl bg-[#F6D74C] border-3 border-[#111111] shadow-[8px_8px_0px_#111111] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-[#4A4FE0] text-white text-xs font-black border border-[#111111] uppercase">
                ⚡ 3-Step Setup Checklist
              </span>
              <h2 className="text-2xl font-black text-[#111111] pt-1">
                Welcome to your Creator Attribution Workspace!
              </h2>
              <p className="text-xs font-bold text-[#111111] max-w-xl">
                Get ready to discover which specific YouTube videos, X posts, or newsletters generate real cash.
              </p>
            </div>
            <Link
              href="/content/new"
              className="px-6 py-3.5 rounded-xl bg-[#EC4899] hover:bg-[#D6317C] text-white font-black text-xs border-2 border-[#111111] shadow-[3px_3px_0px_#111111] inline-flex items-center gap-2 self-start sm:self-auto transition-all"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Create First Link →</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-white border-2 border-[#111111] space-y-2 shadow-[2px_2px_0px_#111111]">
              <div className="text-xs font-black text-[#4A4FE0]">Step 1: Create Tracking Link</div>
              <p className="text-xs font-semibold text-[#4B4B4B]">
                Register a YouTube video or X post to generate a short tracking link (<code className="bg-[#F7F4EC] px-1 py-0.5 rounded text-[#4A4FE0]">/r/slug</code>).
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white border-2 border-[#111111] space-y-2 shadow-[2px_2px_0px_#111111]">
              <div className="text-xs font-black text-[#EC4899]">Step 2: Collect Leads & Clicks</div>
              <p className="text-xs font-semibold text-[#4B4B4B]">
                Share your hosted opt-in page (<code className="bg-[#F7F4EC] px-1 py-0.5 rounded text-[#EC4899]">/c/slug</code>) or add your tracking link in bio/desc.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white border-2 border-[#111111] space-y-2 shadow-[2px_2px_0px_#111111]">
              <div className="text-xs font-black text-[#111111]">Step 3: Track Revenue Webhooks</div>
              <p className="text-xs font-semibold text-[#4B4B4B]">
                Test your PayPal/Payoneer/Zapier sales webhook in Settings (<code className="bg-[#F7F4EC] px-1 py-0.5 rounded text-[#111111]">/settings</code>).
              </p>
            </div>
          </div>
        </div>
      )}

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
