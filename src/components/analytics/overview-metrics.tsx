'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DollarSign, Eye, Users, TrendingUp, Sparkles, Plus, ArrowRight, Zap, Check } from 'lucide-react';
import { AnalyticsSummary } from '@/types/database';
import { generateShortSlug } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';

export function OverviewMetrics({ summary }: { summary: AnalyticsSummary }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [quickUrl, setQuickUrl] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [creating, setCreating] = useState(false);

  const handleQuickCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickUrl) return;
    setCreating(true);

    try {
      // 1. Auto-detect platform and platform prefix
      let platform = 'YouTube';
      let prefix = 'yt-';
      if (quickUrl.includes('twitter.com') || quickUrl.includes('x.com')) {
        platform = 'Twitter/X';
        prefix = 'tw-';
      } else if (quickUrl.includes('linkedin.com')) {
        platform = 'LinkedIn';
        prefix = 'li-';
      } else if (quickUrl.includes('substack.com')) {
        platform = 'Newsletter';
        prefix = 'nl-';
      } else if (quickUrl.includes('instagram.com')) {
        platform = 'Instagram';
        prefix = 'ig-';
      }

      // 2. Title Resolution Strategy (YouTube oEmbed -> Custom Title -> Default)
      let resolvedTitle = customTitle.trim();

      if (!resolvedTitle && platform === 'YouTube') {
        try {
          const oembedRes = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(quickUrl)}&format=json`);
          if (oembedRes.ok) {
            const oembedData = await oembedRes.json();
            if (oembedData && oembedData.title) {
              resolvedTitle = oembedData.title;
            }
          }
        } catch (oembedErr) {
          console.log('YouTube oEmbed fetch skipped/failed, using fallback title.');
        }
      }

      if (!resolvedTitle) {
        resolvedTitle = `Untitled ${platform} Post`;
      }

      // 3. Clean Slug Generation (Readable slug instead of junk q-xxxxx)
      const baseSlug = generateShortSlug(resolvedTitle);
      const tracking_slug = prefix + baseSlug;

      const userEmail = typeof window !== 'undefined' ? localStorage.getItem('user_email') : null;
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: resolvedTitle,
          platform,
          url: quickUrl,
          tracking_slug,
          userId: userEmail
        })
      });

      const json = await res.json();
      if (json.success) {
        const fullLink = `${window.location.origin}/r/${tracking_slug}`;
        navigator.clipboard.writeText(fullLink);
        showToast('⚡ Short link generated & copied to clipboard!', 'success');
        setQuickUrl('');
        setCustomTitle('');
        router.refresh();
      }
    } catch (err: any) {
      console.error('Quick link creation failed:', err);
      showToast('Failed to create quick link: ' + err.message, 'error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* 1-Click Top Dashboard Quick Bar (Clean Title & oEmbed Auto-Fetch) */}
      <div className="p-5 rounded-3xl bg-white border-3 border-[#111111] shadow-[6px_6px_0px_#111111] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#EC4899]" />
            <span className="text-xs font-black text-[#111111]">1-Click Quick Link Generator</span>
          </div>
          <span className="text-[11px] font-bold text-[#4B4B4B]">Auto-scrapes YouTube titles</span>
        </div>

        <form onSubmit={handleQuickCreate} className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <input
              type="url"
              required
              placeholder="Paste YouTube, X, or post URL..."
              value={quickUrl}
              onChange={(e) => setQuickUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] text-xs font-bold text-[#111111] focus:outline-none focus:bg-white transition-all placeholder:text-[#8A8A8A]"
            />
          </div>

          <div className="md:col-span-4 relative">
            <input
              type="text"
              placeholder="Optional title (Auto-detects if blank)..."
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] text-xs font-bold text-[#111111] focus:outline-none focus:bg-white transition-all placeholder:text-[#8A8A8A]"
            />
          </div>

          <button
            type="submit"
            disabled={creating}
            className="md:col-span-2 px-4 py-2.5 rounded-xl bg-[#EC4899] hover:bg-[#D6317C] text-white text-xs font-black border-2 border-[#111111] shadow-[3px_3px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] transition-all whitespace-nowrap flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <span>{creating ? 'Fetching...' : '⚡ Create Link'}</span>
          </button>
        </form>
      </div>

      {summary.total_content_items === 0 && (
        <div className="p-6 rounded-3xl bg-[#F6D74C] border-3 border-[#111111] shadow-[6px_6px_0px_#111111] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EC4899] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center font-black">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#111111]">Welcome to Creator Attribution Engine! 🚀</h3>
              <p className="text-xs text-[#111111] font-bold">
                You haven't generated your first tracking link yet. Create one in 30 seconds to start attributing revenue!
              </p>
            </div>
          </div>
          <Link
            href="/onboarding"
            className="px-5 py-3 rounded-xl bg-[#EC4899] hover:bg-[#D6317C] text-white text-xs font-black border-2 border-[#111111] shadow-[3px_3px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] transition-all whitespace-nowrap flex items-center gap-1.5"
          >
            <span>Create First Tracking Link</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

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
    </div>
  );
}
