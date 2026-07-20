'use client';

import { useState, useEffect } from 'react';
import { ContentItem } from '@/types/database';
import { X, Copy, Check, ExternalLink, Sparkles, Link2 } from 'lucide-react';

interface LinkGeneratorModalProps {
  content: ContentItem;
  isOpen: boolean;
  onClose: () => void;
}

export function LinkGeneratorModal({ content, isOpen, onClose }: LinkGeneratorModalProps) {
  const [utmSource, setUtmSource] = useState(content.platform.toLowerCase());
  const [utmMedium, setUtmMedium] = useState('social_bio');
  const [utmCampaign, setUtmCampaign] = useState('creator_funnel');
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  if (!isOpen) return null;

  const baseUrl = `${origin}/r/${content.tracking_slug}`;
  const params = new URLSearchParams();
  if (utmSource) params.set('utm_source', utmSource);
  if (utmMedium) params.set('utm_medium', utmMedium);
  if (utmCampaign) params.set('utm_campaign', utmCampaign);

  const fullTrackingUrl = `${baseUrl}?${params.toString()}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullTrackingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-xl p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Link2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Tracking Link Builder</h3>
              <p className="text-xs text-slate-400">{content.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Custom UTM Input Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400">UTM Source</label>
            <input
              type="text"
              value={utmSource}
              onChange={(e) => setUtmSource(e.target.value)}
              placeholder="e.g. youtube"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400">UTM Medium</label>
            <input
              type="text"
              value={utmMedium}
              onChange={(e) => setUtmMedium(e.target.value)}
              placeholder="e.g. video_desc"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400">UTM Campaign</label>
            <input
              type="text"
              value={utmCampaign}
              onChange={(e) => setUtmCampaign(e.target.value)}
              placeholder="e.g. promo_launch"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Final URL Box */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Generated Campaign Link
            </span>
            <button
              onClick={handleCopy}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied to Clipboard!' : 'Copy Link'}
            </button>
          </div>
          <p className="text-xs font-mono text-blue-400 break-all bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
            {fullTrackingUrl}
          </p>
        </div>

        {/* Test Click Button */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <a
            href={fullTrackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Test Live Click (Simulate Visitor)
          </a>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
