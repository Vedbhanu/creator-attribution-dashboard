'use client';

import { useState, useEffect } from 'react';
import { OverviewMetrics } from '@/components/analytics/overview-metrics';
import { FunnelChart } from '@/components/analytics/funnel-chart';
import { ContentPerformanceTable } from '@/components/analytics/content-performance-table';
import { AnalyticsSummary, ContentAttributionMetrics } from '@/types/database';
import { Sparkles, ShieldCheck, Lock } from 'lucide-react';

export default function ShareDashboardPage({ params }: { params: { token: string } }) {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [rankings, setRankings] = useState<ContentAttributionMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics');
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
    return <div className="p-12 text-center text-[#4B4B4B] text-xs font-bold">Loading client report...</div>;
  }

  if (!summary) {
    return <div className="p-12 text-center text-[#4B4B4B] text-xs font-bold">Report unavailable.</div>;
  }

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#111111] font-sans p-6 sm:p-10 space-y-8">
      {/* Read-only Header Banner */}
      <div className="p-6 rounded-2xl bg-[#F6D74C] border-3 border-[#111111] shadow-[5px_5px_0px_#111111] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-[#111111] text-white mb-2">
            <Lock className="w-3.5 h-3.5 text-[#F6D74C]" />
            Verified Client Attribution Report
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">
            Revenue Performance Report
          </h1>
          <p className="text-xs text-[#111111] font-extrabold mt-1">
            Real-time attribution matching visitors, email leads, and revenue back to specific content items.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border-2 border-[#111111] text-xs font-black text-[#111111] shadow-[2px_2px_0px_#111111] self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-[#EC4899]" />
          <span>Read-Only View</span>
        </div>
      </div>

      {/* Main KPI Summary */}
      <OverviewMetrics summary={summary} />

      {/* Funnel */}
      <FunnelChart summary={summary} />

      {/* Rankings */}
      <ContentPerformanceTable rankings={rankings} />
    </div>
  );
}
