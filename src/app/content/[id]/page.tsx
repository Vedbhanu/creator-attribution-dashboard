'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ContentAttributionMetrics } from '@/types/database';
import { ArrowLeft, Copy, Check, ExternalLink, Users, DollarSign, TrendingUp, Sparkles } from 'lucide-react';

export default function ContentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [metrics, setMetrics] = useState<ContentAttributionMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
    fetchDetail();
  }, [params.id]);

  const fetchDetail = async () => {
    try {
      const res = await fetch(`/api/content/${params.id}`);
      const json = await res.json();
      if (json.success && json.metrics) {
        setMetrics(json.metrics);
      }
    } catch (err) {
      console.error('Failed to fetch content details:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500 text-xs font-medium">Loading content analytics...</div>;
  }

  if (!metrics) {
    return (
      <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <p className="text-slate-300 font-semibold text-sm">Content item not found.</p>
        <button
          onClick={() => router.push('/content')}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold"
        >
          Return to Content Library
        </button>
      </div>
    );
  }

  const { content, visitors_count, leads_count, sales_count, total_revenue, visitor_to_lead_cr, lead_to_sale_cr } = metrics;
  const trackingUrl = `${origin}/r/${content.tracking_slug}`;
  const leadFormUrl = `${origin}/c/${content.tracking_slug}`;

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-2">
      {/* Back Button */}
      <button
        onClick={() => router.push('/content')}
        className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Content Library
      </button>

      {/* Header Info Banner */}
      <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {content.platform}
              </span>
              <span className="text-xs text-slate-500">
                Published {new Date(content.published_at).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100">{content.title}</h1>
          </div>

          <a
            href={content.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 transition-colors self-start md:self-auto"
          >
            Visit Original Content <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Tracking Links Copy Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>Tracking Link</span>
              <button
                onClick={() => copyToClipboard(trackingUrl, 'tracking')}
                className="text-blue-400 hover:underline inline-flex items-center gap-1 text-[11px]"
              >
                {copied === 'tracking' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied === 'tracking' ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
            <p className="text-xs font-mono text-blue-400 truncate">{trackingUrl}</p>
            <p className="text-[11px] text-slate-500">Share this link in social posts, video descriptions, or emails.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>Hosted Lead Capture Form</span>
              <button
                onClick={() => copyToClipboard(leadFormUrl, 'lead')}
                className="text-emerald-400 hover:underline inline-flex items-center gap-1 text-[11px]"
              >
                {copied === 'lead' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied === 'lead' ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
            <p className="text-xs font-mono text-emerald-400 truncate">{leadFormUrl}</p>
            <p className="text-[11px] text-slate-500">Direct form where visitors submit email/phone to become leads.</p>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs font-medium text-slate-400">Total Clicks / Visitors</div>
          <div className="text-2xl font-bold text-slate-100">{visitors_count}</div>
          <p className="text-[11px] text-slate-500">Tracked via cookie logging</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs font-medium text-indigo-400">Captured Leads</div>
          <div className="text-2xl font-bold text-indigo-400">{leads_count}</div>
          <p className="text-[11px] text-slate-500">Visitor → Lead CR: <span className="text-indigo-400 font-semibold">{visitor_to_lead_cr}%</span></p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="text-xs font-medium text-emerald-400">Converted Sales</div>
          <div className="text-2xl font-bold text-emerald-400">{sales_count}</div>
          <p className="text-[11px] text-slate-500">Lead → Sale CR: <span className="text-emerald-400 font-semibold">{lead_to_sale_cr}%</span></p>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-emerald-950/30 border border-emerald-500/30 space-y-1">
          <div className="text-xs font-medium text-emerald-400">Total Revenue Generated</div>
          <div className="text-3xl font-extrabold text-emerald-400">${total_revenue.toFixed(2)}</div>
          <p className="text-[11px] text-emerald-400/70 font-medium">Attributed to this piece of content</p>
        </div>
      </div>
    </div>
  );
}
