'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlatformType } from '@/types/database';
import { Link2, Sparkles, ArrowLeft, Check, AlertCircle, Wand2 } from 'lucide-react';
import { getAppDomain } from '@/lib/utils';

const PLATFORMS: PlatformType[] = [
  'YouTube',
  'Twitter/X',
  'Newsletter',
  'LinkedIn',
  'TikTok',
  'Instagram',
  'Podcast',
  'Blog',
  'Other'
];

export function ContentForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState<PlatformType>('YouTube');
  const [url, setUrl] = useState('');
  const [trackingSlug, setTrackingSlug] = useState('');
  const [isCustomSlug, setIsCustomSlug] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [domain, setDomain] = useState('');

  useEffect(() => {
    setDomain(getAppDomain());
  }, []);

  // Auto-detect platform & slug from URL input
  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    
    // Auto-detect platform from URL domain
    if (newUrl.includes('youtube.com') || newUrl.includes('youtu.be')) {
      setPlatform('YouTube');
    } else if (newUrl.includes('twitter.com') || newUrl.includes('x.com')) {
      setPlatform('Twitter/X');
    } else if (newUrl.includes('linkedin.com')) {
      setPlatform('LinkedIn');
    } else if (newUrl.includes('tiktok.com')) {
      setPlatform('TikTok');
    } else if (newUrl.includes('substack.com')) {
      setPlatform('Newsletter');
    }
  };

  // Auto-generate tracking slug from title slug
  useEffect(() => {
    if (!isCustomSlug && title) {
      const prefixMap: Record<string, string> = {
        'YouTube': 'yt',
        'Twitter/X': 'tw',
        'Newsletter': 'nl',
        'LinkedIn': 'li',
        'TikTok': 'tk',
        'Instagram': 'ig',
        'Podcast': 'pod',
        'Blog': 'blog',
        'Other': 'post'
      };
      const platformPrefix = prefixMap[platform] || 'ref';
      const titleSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 35);
      setTrackingSlug(`${platformPrefix}-${titleSlug}`);
    }
  }, [title, platform, isCustomSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const userEmail = typeof window !== 'undefined' ? localStorage.getItem('user_email') : null;
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, platform, url, tracking_slug: trackingSlug, userId: userEmail }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create content item');
      }

      router.push('/content');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-2">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs font-extrabold text-[#111111] hover:text-[#EC4899] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Content Library
        </button>
      </div>

      <div className="p-8 rounded-3xl bg-white border-3 border-[#111111] shadow-[8px_8px_0px_#111111] space-y-6">
        <div>
          <h2 className="text-2xl font-black text-[#111111]">Add New Content Item</h2>
          <p className="text-xs font-semibold text-[#4B4B4B] mt-1">
            Register a video, article, or social post to start attributing visitors, leads, and revenue.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-100 border-2 border-[#111111] text-[#111111] text-xs font-bold flex items-center gap-3 shadow-[3px_3px_0px_#111111]">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Target Destination URL */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-[#111111]">Original / Destination URL *</label>
            <input
              type="url"
              required
              placeholder="e.g. https://youtube.com/watch?v=12345"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] text-[#111111] text-xs font-bold focus:outline-none focus:bg-white transition-all placeholder:text-[#8A8A8A]"
            />
            <p className="text-[11px] text-[#4B4B4B] font-semibold">
              When visitors click your generated tracking link, they will be automatically redirected to this address.
            </p>
          </div>

          {/* Platform Selector */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-[#111111]">Platform *</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlatform(p)}
                  className={`py-2 px-3 rounded-xl text-xs font-extrabold border-2 border-[#111111] transition-all ${
                    platform === p
                      ? 'bg-[#4A4FE0] text-white shadow-[2px_2px_0px_#111111]'
                      : 'bg-white text-[#111111] hover:bg-[#F7F4EC]'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Content Title */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-[#111111]">Content Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. My $10k SaaS Launch Video"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] text-[#111111] text-xs font-bold focus:outline-none focus:bg-white transition-all placeholder:text-[#8A8A8A]"
            />
          </div>

          {/* Tracking Slug */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-[#111111]">Short Link Keyword (Slug) *</label>
              <button
                type="button"
                onClick={() => setIsCustomSlug(!isCustomSlug)}
                className="text-[11px] font-black text-[#4A4FE0] hover:underline flex items-center gap-1"
              >
                <Wand2 className="w-3 h-3" />
                {isCustomSlug ? 'Auto-generate from title' : 'Customize keyword'}
              </button>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-xs font-mono font-bold text-[#4B4B4B]">/r/</span>
              <input
                type="text"
                required
                value={trackingSlug}
                onChange={(e) => {
                  setIsCustomSlug(true);
                  setTrackingSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
                }}
                className="w-full pl-9 pr-4 py-3 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] text-[#4A4FE0] text-xs font-mono font-bold focus:outline-none focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Generated URLs Live Preview Box */}
          <div className="p-5 rounded-2xl bg-[#F7F4EC] border-2 border-[#111111] space-y-3 shadow-[3px_3px_0px_#111111]">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#111111]">
              <Sparkles className="w-4 h-4 text-[#EC4899]" />
              Generated Tracking URLs Preview
            </div>
            <div className="space-y-1.5 text-xs font-mono font-bold">
              <p className="truncate">
                <span className="text-[#4B4B4B]">Short Tracking Link: </span>
                <span className="text-[#4A4FE0]">{domain}/r/{trackingSlug || 'your-slug'}</span>
              </p>
              <p className="truncate">
                <span className="text-[#4B4B4B]">Hosted Lead Form: </span>
                <span className="text-[#EC4899]">{domain}/c/{trackingSlug || 'your-slug'}</span>
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-3 rounded-xl text-xs font-extrabold text-[#111111] hover:bg-[#F7F4EC] border-2 border-[#111111] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl text-xs font-extrabold bg-[#EC4899] hover:bg-[#D6317C] text-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#111111] transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving Link...' : 'Save & Generate Links →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
