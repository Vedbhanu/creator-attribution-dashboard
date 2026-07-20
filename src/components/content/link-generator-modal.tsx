'use client';

import { useState, useEffect } from 'react';
import { ContentItem } from '@/types/database';
import { X, Copy, Check, ExternalLink, Sparkles, Link2, Code } from 'lucide-react';

interface LinkGeneratorModalProps {
  content: ContentItem;
  isOpen: boolean;
  onClose: () => void;
}

export function LinkGeneratorModal({ content, isOpen, onClose }: LinkGeneratorModalProps) {
  const [activeTab, setActiveTab] = useState<'link' | 'embed'>('link');
  const [utmSource, setUtmSource] = useState(content.platform.toLowerCase());
  const [utmMedium, setUtmMedium] = useState('social_bio');
  const [utmCampaign, setUtmCampaign] = useState('creator_funnel');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
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
  const embedScriptCode = `<script src="${origin}/embed.js" data-slug="${content.tracking_slug}" data-host="${origin}"></script>`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullTrackingUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedScriptCode);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/80 backdrop-blur-sm">
      <div className="w-full max-w-xl p-6 rounded-3xl bg-[#FDFCF8] border-3 border-[#111111] shadow-[8px_8px_0px_#111111] space-y-6">
        <div className="flex items-center justify-between border-b-2 border-[#111111] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#EC4899] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111]">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#111111]">Tracking Link & Embed Code</h3>
              <p className="text-xs text-[#4B4B4B] font-bold">{content.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#111111] hover:bg-[#F6D74C] rounded-xl border-2 border-[#111111] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-[#F7F4EC] border-2 border-[#111111]">
          <button
            onClick={() => setActiveTab('link')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'link'
                ? 'bg-[#EC4899] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111]'
                : 'text-[#111111] hover:text-[#EC4899]'
            }`}
          >
            Short Campaign Link
          </button>
          <button
            onClick={() => setActiveTab('embed')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
              activeTab === 'embed'
                ? 'bg-[#4A4FE0] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111]'
                : 'text-[#111111] hover:text-[#4A4FE0]'
            }`}
          >
            Embed Form Script
          </button>
        </div>

        {activeTab === 'link' ? (
          <div className="space-y-4">
            {/* Custom UTM Input Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-[#111111]">UTM Source</label>
                <input
                  type="text"
                  value={utmSource}
                  onChange={(e) => setUtmSource(e.target.value)}
                  placeholder="youtube"
                  className="w-full px-3 py-2 rounded-xl bg-white border-2 border-[#111111] text-xs font-mono font-bold text-[#111111]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-[#111111]">UTM Medium</label>
                <input
                  type="text"
                  value={utmMedium}
                  onChange={(e) => setUtmMedium(e.target.value)}
                  placeholder="video_desc"
                  className="w-full px-3 py-2 rounded-xl bg-white border-2 border-[#111111] text-xs font-mono font-bold text-[#111111]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold text-[#111111]">UTM Campaign</label>
                <input
                  type="text"
                  value={utmCampaign}
                  onChange={(e) => setUtmCampaign(e.target.value)}
                  placeholder="launch"
                  className="w-full px-3 py-2 rounded-xl bg-white border-2 border-[#111111] text-xs font-mono font-bold text-[#111111]"
                />
              </div>
            </div>

            {/* Final URL Box */}
            <div className="p-4 rounded-2xl bg-[#F7F4EC] border-2 border-[#111111] shadow-[3px_3px_0px_#111111] space-y-3">
              <div className="flex items-center justify-between text-xs font-extrabold text-[#111111]">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#EC4899]" />
                  Generated Tracking Link
                </span>
                <button
                  onClick={handleCopyLink}
                  className="text-xs font-black text-[#EC4899] hover:underline inline-flex items-center gap-1"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-[#EC4899]" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedLink ? 'Copied to Clipboard!' : 'Copy Link'}
                </button>
              </div>
              <p className="text-xs font-mono font-bold text-[#4A4FE0] break-all bg-white p-3 rounded-xl border-2 border-[#111111]">
                {fullTrackingUrl}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#F7F4EC] border-2 border-[#111111] shadow-[3px_3px_0px_#111111] space-y-3">
              <div className="flex items-center justify-between text-xs font-extrabold text-[#111111]">
                <span className="flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-[#4A4FE0]" />
                  1-Line Embed Script (Webflow, Framer, WordPress)
                </span>
                <button
                  onClick={handleCopyEmbed}
                  className="text-xs font-black text-[#4A4FE0] hover:underline inline-flex items-center gap-1"
                >
                  {copiedEmbed ? <Check className="w-3.5 h-3.5 text-[#EC4899]" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedEmbed ? 'Copied Code!' : 'Copy Snippet'}
                </button>
              </div>
              <p className="text-xs font-mono font-bold text-[#111111] break-all bg-white p-3 rounded-xl border-2 border-[#111111]">
                {embedScriptCode}
              </p>
              <p className="text-[11px] text-[#4B4B4B] font-bold">
                Paste this script snippet anywhere on your website or checkout page.
              </p>
            </div>
          </div>
        )}

        {/* Test Click & Actions */}
        <div className="flex items-center justify-between pt-2 border-t-2 border-[#111111]">
          <a
            href={fullTrackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F6D74C] text-[#111111] border-2 border-[#111111] text-xs font-black shadow-[2px_2px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Test Live Click (Simulate Visitor)
          </a>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#EC4899] text-white border-2 border-[#111111] text-xs font-black shadow-[2px_2px_0px_#111111] transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
