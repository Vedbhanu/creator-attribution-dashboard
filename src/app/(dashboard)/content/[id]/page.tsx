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
    return <div className="p-12 text-center text-[#4B4B4B] text-xs font-bold">Loading content analytics...</div>;
  }

  if (!metrics) {
    return (
      <div className="p-12 text-center rounded-2xl bg-white border-2 border-[#111111] space-y-4 shadow-[4px_4px_0px_#111111]">
        <p className="text-[#111111] font-extrabold text-sm">Content item not found.</p>
        <button
          onClick={() => router.push('/content')}
          className="px-4 py-2 rounded-xl bg-[#EC4899] text-white text-xs font-black border-2 border-[#111111] shadow-[2px_2px_0px_#111111]"
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
        className="inline-flex items-center gap-2 text-xs font-extrabold text-[#111111] hover:text-[#EC4899] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Content Library
      </button>

      {/* Header Info Banner */}
      <div className="p-8 rounded-3xl bg-white border-3 border-[#111111] space-y-6 shadow-[6px_6px_0px_#111111]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-black bg-[#4A4FE0] text-white border border-[#111111]">
                {content.platform}
              </span>
              <span className="text-xs text-[#4B4B4B] font-bold">
                Published {new Date(content.published_at).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-2xl font-black text-[#111111]">{content.title}</h1>
          </div>

          <a
            href={content.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F7F4EC] hover:bg-[#F6D74C] border-2 border-[#111111] text-xs font-black text-[#111111] shadow-[2px_2px_0px_#111111] transition-colors self-start md:self-auto"
          >
            Visit Original Content <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Tracking Links Copy Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t-2 border-[#111111]">
          <div className="p-4 rounded-2xl bg-[#F7F4EC] border-2 border-[#111111] space-y-2 shadow-[2px_2px_0px_#111111]">
            <div className="flex items-center justify-between text-xs font-extrabold text-[#111111]">
              <span>Tracking Link</span>
              <button
                onClick={() => copyToClipboard(trackingUrl, 'tracking')}
                className="text-[#4A4FE0] hover:underline inline-flex items-center gap-1 text-[11px] font-black"
              >
                {copied === 'tracking' ? <Check className="w-3.5 h-3.5 text-[#EC4899]" /> : <Copy className="w-3.5 h-3.5" />}
                {copied === 'tracking' ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
            <p className="text-xs font-mono font-bold text-[#4A4FE0] truncate">{trackingUrl}</p>
            <p className="text-[11px] text-[#4B4B4B] font-medium">Share this link in social posts, video descriptions, or emails.</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F7F4EC] border-2 border-[#111111] space-y-2 shadow-[2px_2px_0px_#111111]">
            <div className="flex items-center justify-between text-xs font-extrabold text-[#111111]">
              <span>Hosted Lead Capture Form</span>
              <button
                onClick={() => copyToClipboard(leadFormUrl, 'lead')}
                className="text-[#EC4899] hover:underline inline-flex items-center gap-1 text-[11px] font-black"
              >
                {copied === 'lead' ? <Check className="w-3.5 h-3.5 text-[#EC4899]" /> : <Copy className="w-3.5 h-3.5" />}
                {copied === 'lead' ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
            <p className="text-xs font-mono font-bold text-[#EC4899] truncate">{leadFormUrl}</p>
            <p className="text-[11px] text-[#4B4B4B] font-medium">Direct form where visitors submit email/phone to become leads.</p>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111] space-y-1">
          <div className="text-xs font-extrabold text-[#4B4B4B]">Total Clicks / Visitors</div>
          <div className="text-2xl font-black text-[#111111]">{visitors_count}</div>
          <p className="text-[11px] text-[#4B4B4B] font-medium">Tracked via cookie logging</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111] space-y-1">
          <div className="text-xs font-extrabold text-[#4A4FE0]">Captured Leads</div>
          <div className="text-2xl font-black text-[#4A4FE0]">{leads_count}</div>
          <p className="text-[11px] text-[#4B4B4B] font-medium">Visitor → Lead CR: <span className="text-[#4A4FE0] font-black">{visitor_to_lead_cr}%</span></p>
        </div>

        <div className="p-5 rounded-2xl bg-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111] space-y-1">
          <div className="text-xs font-extrabold text-[#EC4899]">Converted Sales</div>
          <div className="text-2xl font-black text-[#EC4899]">{sales_count}</div>
          <p className="text-[11px] text-[#4B4B4B] font-medium">Lead → Sale CR: <span className="text-[#EC4899] font-black">{lead_to_sale_cr}%</span></p>
        </div>

        <div className="p-5 rounded-2xl bg-[#EC4899] text-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111] space-y-1">
          <div className="text-xs font-black text-white/80">Total Revenue Generated</div>
          <div className="text-3xl font-black text-white">${total_revenue.toFixed(2)}</div>
          <p className="text-[11px] text-white/90 font-bold">Attributed to this piece of content</p>
        </div>
      </div>
    </div>
  );
}
