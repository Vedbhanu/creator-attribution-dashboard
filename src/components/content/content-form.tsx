'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlatformType } from '@/types/database';
import { Link2, Sparkles, ArrowLeft, Check, AlertCircle } from 'lucide-react';

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
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  // Auto-generate tracking slug from platform prefix + title slug
  useEffect(() => {
    if (!isCustomSlug && title) {
      const platformPrefix = platform.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 2);
      const titleSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 30);
      setTrackingSlug(`${platformPrefix}-${titleSlug}`);
    }
  }, [title, platform, isCustomSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, platform, url, tracking_slug: trackingSlug }),
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Content Library
        </button>
      </div>

      <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Add New Content Item</h2>
          <p className="text-xs text-slate-400 mt-1">
            Register a video, article, or social post to start attributing visitors, leads, and revenue.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Content Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Content Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. My $10k SaaS Launch Video"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"
            />
          </div>

          {/* Platform Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Platform *</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlatform(p)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border transition-all ${
                    platform === p
                      ? 'bg-blue-600/20 text-blue-400 border-blue-500/40 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Target Destination URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Original / Destination URL *</label>
            <input
              type="url"
              required
              placeholder="e.g. https://youtube.com/watch?v=12345"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"
            />
            <p className="text-[11px] text-slate-500">
              When visitors click your generated tracking link, they will be automatically redirected to this address.
            </p>
          </div>

          {/* Tracking Slug */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Tracking Slug *</label>
              <button
                type="button"
                onClick={() => setIsCustomSlug(!isCustomSlug)}
                className="text-[11px] text-blue-400 hover:underline"
              >
                {isCustomSlug ? 'Auto-generate from title' : 'Customize slug'}
              </button>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-xs font-medium text-slate-500">/r/</span>
              <input
                type="text"
                required
                value={trackingSlug}
                onChange={(e) => {
                  setIsCustomSlug(true);
                  setTrackingSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
                }}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-blue-400 text-sm font-mono focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Generated URLs Live Preview Box */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Generated URLs Preview
            </div>
            <div className="space-y-1 text-xs font-mono text-slate-400">
              <p>
                <span className="text-slate-500">Tracking Link: </span>
                <span className="text-blue-400">{origin || 'http://localhost:3000'}/r/{trackingSlug || 'your-slug'}</span>
              </p>
              <p>
                <span className="text-slate-500">Lead Form Page: </span>
                <span className="text-emerald-400">{origin || 'http://localhost:3000'}/c/{trackingSlug || 'your-slug'}</span>
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md shadow-blue-600/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Content Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
