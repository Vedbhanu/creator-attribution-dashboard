'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, ArrowRight, Check, Copy, ExternalLink, Globe, DollarSign, Video, CheckCircle2, ArrowLeft } from 'lucide-react';
import { getAppDomain, generateShortSlug } from '@/lib/utils';

export default function OnboardingWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [origin, setOrigin] = useState('');

  // Step 1 State
  const [brandName, setBrandName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [youtubeChannelUrl, setYoutubeChannelUrl] = useState('');

  // Step 2 State
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState('YouTube');
  const [url, setUrl] = useState('');
  const [syncedVideos, setSyncedVideos] = useState<any[]>([]);

  // Step 3 State
  const [createdSlug, setCreatedSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  useEffect(() => {
    setOrigin(getAppDomain());
  }, []);

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName) return;
    setLoading(true);

    try {
      const userEmail = typeof window !== 'undefined' ? localStorage.getItem('user_email') : 'demo';
      
      // Save settings to backend database
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userEmail,
          brand_name: brandName,
          currency,
          youtube_channel_url: youtubeChannelUrl
        })
      });

      // Sync YouTube Channel Feed if handle/URL provided
      if (youtubeChannelUrl.trim()) {
        const syncRes = await fetch('/api/content/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userEmail,
            youtube_channel_url: youtubeChannelUrl
          })
        });
        const syncJson = await syncRes.json();
        if (syncJson.success && syncJson.items && syncJson.items.length > 0) {
          setSyncedVideos(syncJson.items);
        }
      }
      
      setStep(2);
    } catch (err) {
      console.error('Onboarding workspace save issue:', err);
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url) return;
    setLoading(true);

    try {
      const userEmail = typeof window !== 'undefined' ? localStorage.getItem('user_email') : 'demo';
      const slug = generateShortSlug(title);
      
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          platform,
          url,
          tracking_slug: slug,
          userId: userEmail,
          published_at: new Date().toISOString(),
        }),
      });

      const json = await res.json();
      if (json.success) {
        setCreatedSlug(slug);
        setStep(3);
      } else {
        alert(json.error || 'Failed to create content item');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(label);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const domain = origin || getAppDomain();
  const trackingUrl = createdSlug ? `${domain}/r/${createdSlug}` : '';
  const leadFormUrl = createdSlug ? `${domain}/c/${createdSlug}` : '';

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#111111] flex flex-col justify-between p-6">
      {/* Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-4 border-b-2 border-[#111111]/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#4A4FE0] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center font-black">
            <Sparkles className="w-5 h-5 text-[#F6D74C]" />
          </div>
          <span className="text-base font-black text-[#111111] tracking-tight">Creator Attrib Setup</span>
        </div>

        {/* Progress Bar Dots & Top Right Back Navigation */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full border-2 border-[#111111] flex items-center justify-center text-xs font-black transition-all ${step === 1 ? 'bg-[#4A4FE0] text-white shadow-[2px_2px_0px_#111111]' : step > 1 ? 'bg-[#F6D74C] text-[#111111]' : 'bg-[#F7F4EC] text-[#4B4B4B]'}`}>
              {step > 1 ? <Check className="w-3.5 h-3.5 text-[#111111]" /> : '1'}
            </div>
            <div className="w-4 h-0.5 bg-[#111111]/20"></div>
            <div className={`w-7 h-7 rounded-full border-2 border-[#111111] flex items-center justify-center text-xs font-black transition-all ${step === 2 ? 'bg-[#4A4FE0] text-white shadow-[2px_2px_0px_#111111]' : step > 2 ? 'bg-[#F6D74C] text-[#111111]' : 'bg-[#F7F4EC] text-[#4B4B4B]'}`}>
              {step > 2 ? <Check className="w-3.5 h-3.5 text-[#111111]" /> : '2'}
            </div>
            <div className="w-4 h-0.5 bg-[#111111]/20"></div>
            <div className={`w-7 h-7 rounded-full border-2 border-[#111111] flex items-center justify-center text-xs font-black transition-all ${step === 3 ? 'bg-[#4A4FE0] text-white shadow-[2px_2px_0px_#111111]' : 'bg-[#F7F4EC] text-[#4B4B4B]'}`}>
              3
            </div>
          </div>

          {step === 1 && (
            <Link
              href="/"
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#F7F4EC] text-[#111111] font-extrabold text-xs border-2 border-[#111111] shadow-[2px_2px_0px_#111111] inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#4A4FE0]" />
              <span>Back</span>
            </Link>
          )}
          {step === 2 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#F7F4EC] text-[#111111] font-extrabold text-xs border-2 border-[#111111] shadow-[2px_2px_0px_#111111] inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#4A4FE0]" />
              <span>Back</span>
            </button>
          )}
          {step === 3 && (
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#F7F4EC] text-[#111111] font-extrabold text-xs border-2 border-[#111111] shadow-[2px_2px_0px_#111111] inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#4A4FE0]" />
              <span>Back</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Form Container */}
      <main className="max-w-xl mx-auto w-full my-auto py-8">
        {step === 1 && (
          <div className="p-8 rounded-3xl bg-white border-3 border-[#111111] shadow-[8px_8px_0px_#111111] space-y-6">
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-[#F6D74C] text-[#111111] text-xs font-black border border-[#111111]">
                Step 1 of 3
              </span>
              <h1 className="text-2xl font-black text-[#111111]">Welcome! Set Up Your Brand Workspace</h1>
              <p className="text-xs text-[#4B4B4B] font-semibold">
                Tell us your business name and preferred currency to personalize your revenue reports.
              </p>
            </div>

            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-[#111111]">Creator / Agency Brand Name</label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3.5 top-3.5 text-[#111111]" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ved Automation, Alex Media"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] text-sm text-[#111111] font-bold focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-[#111111]">Revenue Currency</label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 absolute left-3.5 top-3.5 text-[#111111]" />
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] text-sm text-[#111111] font-bold focus:outline-none focus:bg-white"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-[#111111]">YouTube Channel URL / Handle (Optional Autopilot Sync)</label>
                <div className="relative">
                  <Video className="w-4 h-4 absolute left-3.5 top-3.5 text-[#111111]" />
                  <input
                    type="text"
                    placeholder="e.g. @AlexMedia or https://youtube.com/@AlexMedia"
                    value={youtubeChannelUrl}
                    onChange={(e) => setYoutubeChannelUrl(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] text-sm text-[#111111] font-bold focus:outline-none focus:bg-white"
                  />
                </div>
                <p className="text-[10px] text-[#4B4B4B] font-bold">
                  Recommended: Paste your handle to auto-generate tracking links for your videos!
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-[#EC4899] hover:bg-[#D6317C] text-white font-black text-xs border-2 border-[#111111] shadow-[4px_4px_0px_#111111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#111111] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{loading ? 'Setting up Workspace...' : 'Continue to Add Content →'}</span>
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="p-8 rounded-3xl bg-white border-3 border-[#111111] shadow-[8px_8px_0px_#111111] space-y-6">
            {syncedVideos.length > 0 ? (
              <div className="space-y-5">
                <div className="space-y-2">
                  <span className="px-3 py-1 rounded-full bg-[#F6D74C] text-[#111111] text-xs font-black border border-[#111111] uppercase animate-bounce">
                    ⚡ Autopilot Synced!
                  </span>
                  <h1 className="text-2xl font-black text-[#111111]">YouTube Links Generated!</h1>
                  <p className="text-xs text-[#4B4B4B] font-semibold">
                    We pulled the latest uploads from your channel and automatically generated tracking links:
                  </p>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {syncedVideos.slice(0, 3).map((video, idx) => {
                    const fullTrackingUrl = `${domain}/r/${video.tracking_slug}`;
                    return (
                      <div key={idx} className="p-3.5 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] space-y-1.5 shadow-[2px_2px_0px_#111111]">
                        <div className="font-extrabold text-[#111111] text-xs truncate">{video.title}</div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono text-[#4A4FE0] truncate">{fullTrackingUrl}</span>
                          <button
                            onClick={() => copyToClipboard(fullTrackingUrl, `sync-${idx}`)}
                            className="text-[#4A4FE0] hover:text-[#EC4899] text-[10px] font-black whitespace-nowrap"
                          >
                            {copiedLink === `sync-${idx}` ? 'Copied!' : 'Copy Link'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-1/3 py-4 rounded-xl bg-white hover:bg-[#F7F4EC] text-[#111111] font-black text-xs border-2 border-[#111111] shadow-[3px_3px_0px_#111111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#111111] transition-all flex items-center justify-center gap-1"
                  >
                    <span>← Back</span>
                  </button>

                  <button
                    onClick={() => setStep(3)}
                    className="w-2/3 py-4 rounded-xl bg-[#EC4899] hover:bg-[#D6317C] text-white font-black text-xs border-2 border-[#111111] shadow-[4px_4px_0px_#111111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#111111] transition-all flex items-center justify-center gap-1"
                  >
                    <span>Continue to Webhooks →</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="px-3 py-1 rounded-full bg-[#4A4FE0] text-white text-xs font-black border border-[#111111]">
                    Step 2 of 3
                  </span>
                  <h1 className="text-2xl font-black text-[#111111]">Register Your First Content Item</h1>
                  <p className="text-xs text-[#4B4B4B] font-semibold">
                    Add a YouTube video, X post, newsletter, or podcast episode you want to track.
                  </p>
                </div>

                <form onSubmit={handleStep2Submit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-[#111111]">Content Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. How I Built My First SaaS in 14 Days"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] text-sm text-[#111111] font-bold focus:outline-none focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-[#111111]">Platform Channel</label>
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] text-sm text-[#111111] font-bold focus:outline-none focus:bg-white"
                    >
                      <option value="YouTube">YouTube Video</option>
                      <option value="Twitter/X">Twitter / X Post</option>
                      <option value="Newsletter">Substack / Newsletter</option>
                      <option value="LinkedIn">LinkedIn Post</option>
                      <option value="TikTok">TikTok Video</option>
                      <option value="Podcast">Podcast Episode</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-[#111111]">Original Post / Video URL</label>
                    <input
                      type="url"
                      required
                      placeholder="https://youtube.com/watch?v=..."
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] text-sm text-[#111111] font-bold focus:outline-none focus:bg-white"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-1/3 py-4 rounded-xl bg-white hover:bg-[#F7F4EC] text-[#111111] font-black text-xs border-2 border-[#111111] shadow-[3px_3px_0px_#111111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#111111] transition-all flex items-center justify-center gap-1"
                    >
                      <span>← Back</span>
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-2/3 py-4 rounded-xl bg-[#4A4FE0] hover:bg-[#3b40cc] text-white font-black text-xs border-2 border-[#111111] shadow-[4px_4px_0px_#111111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#111111] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <span>{loading ? 'Generating Link...' : 'Generate Link →'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="p-8 rounded-3xl bg-white border-3 border-[#111111] shadow-[8px_8px_0px_#111111] space-y-6">
            <div className="space-y-2 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#EC4899] text-white border-2 border-[#111111] flex items-center justify-center mx-auto shadow-[3px_3px_0px_#111111]">
                <CheckCircle2 className="w-6 h-6 text-[#F6D74C]" />
              </div>
              <h1 className="text-2xl font-black text-[#111111]">You're Ready to Track Revenue!</h1>
              <p className="text-xs text-[#4B4B4B] font-semibold">
                Here are your 2 generated tracking links for <strong>"{title}"</strong>:
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#F7F4EC] border-2 border-[#111111] space-y-2 shadow-[2px_2px_0px_#111111]">
                <div className="flex items-center justify-between text-xs font-extrabold text-[#111111]">
                  <span>Short Tracking Link (Paste in bio/desc)</span>
                  <button
                    onClick={() => copyToClipboard(trackingUrl, 'tracking')}
                    className="text-[#4A4FE0] hover:underline inline-flex items-center gap-1 text-[11px] font-black"
                  >
                    {copiedLink === 'tracking' ? <Check className="w-3.5 h-3.5 text-[#EC4899]" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedLink === 'tracking' ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
                <p className="text-xs font-mono font-bold text-[#4A4FE0] truncate">{trackingUrl}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F7F4EC] border-2 border-[#111111] space-y-2 shadow-[2px_2px_0px_#111111]">
                <div className="flex items-center justify-between text-xs font-extrabold text-[#111111]">
                  <span>Hosted Lead Capture Form</span>
                  <button
                    onClick={() => copyToClipboard(leadFormUrl, 'lead')}
                    className="text-[#EC4899] hover:underline inline-flex items-center gap-1 text-[11px] font-black"
                  >
                    {copiedLink === 'lead' ? <Check className="w-3.5 h-3.5 text-[#EC4899]" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedLink === 'lead' ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
                <p className="text-xs font-mono font-bold text-[#EC4899] truncate">{leadFormUrl}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-1/3 py-4 rounded-xl bg-white hover:bg-[#F7F4EC] text-[#111111] font-black text-xs border-2 border-[#111111] shadow-[3px_3px_0px_#111111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#111111] transition-all flex items-center justify-center gap-1"
              >
                <span>← Edit Video</span>
              </button>

              <button
                onClick={() => router.push('/dashboard')}
                className="w-2/3 py-4 rounded-xl bg-[#EC4899] hover:bg-[#D6317C] text-white font-black text-xs border-2 border-[#111111] shadow-[4px_4px_0px_#111111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#111111] transition-all flex items-center justify-center gap-2"
              >
                <span>Open Dashboard →</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center text-xs font-bold text-[#4B4B4B] py-2">
        © 2026 Creator Attribution Engine — Built by Ved Automation
      </footer>
    </div>
  );
}
