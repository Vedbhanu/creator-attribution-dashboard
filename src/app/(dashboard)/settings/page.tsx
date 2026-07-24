'use client';

import { useState, useEffect } from 'react';
import { Settings, Globe, Key, Sparkles, Save, Check, Copy, Zap, RefreshCw, Youtube, Video, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

export default function SettingsPage() {
  const { showToast } = useToast();
  const [brandName, setBrandName] = useState('Ved Automation');
  const [currency, setCurrency] = useState('USD');
  const [customDomain, setCustomDomain] = useState('attrib.yourdomain.com');
  const [webhookSecret, setWebhookSecret] = useState('whsec_creator_attrib_982374');
  const [youtubeChannelUrl, setYoutubeChannelUrl] = useState('');
  const [youtubeAutoInject, setYoutubeAutoInject] = useState(false);
  const [ctaTemplate, setCtaTemplate] = useState('🔥 Get Priority Access here 👉 {tracking_link}');
  const [syncingChannel, setSyncingChannel] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  // Accordion Toggle States (Clean & Uncluttered UX)
  const [showBrand, setShowBrand] = useState(true);
  const [showDomain, setShowDomain] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);
  const [showYoutube, setShowYoutube] = useState(false);

  // Webhook Tester State
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Auto-Injection Tester State
  const [testingInject, setTestingInject] = useState(false);
  const [injectResult, setInjectResult] = useState<string | null>(null);

  useEffect(() => {
    // Check url searchParams to show custom OAuth toast
    const params = new URLSearchParams(window.location.search);
    if (params.get('oauth') === 'simulated') {
      showToast('⚡ YouTube Channel Connected (Sandbox mode)!', 'success');
    } else if (params.get('oauth') === 'success') {
      showToast('✅ YouTube Channel connected successfully live!', 'success');
    } else if (params.get('oauth') === 'failed') {
      showToast('⚠️ YouTube connection failed.', 'error');
    }

    // Load active user's workspace settings
    const userEmail = typeof window !== 'undefined' ? localStorage.getItem('user_email') : 'demo';
    fetch(`/api/settings?userId=${encodeURIComponent(userEmail || 'demo')}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setBrandName(data.settings.brand_name || 'My Workspace');
          setCurrency(data.settings.currency || 'USD');
          setCustomDomain(data.settings.custom_domain || 'attrib.yourdomain.com');
          setWebhookSecret(data.settings.webhook_secret || 'whsec_creator_attrib_982374');
          setYoutubeChannelUrl(data.settings.youtube_channel_url || '');
          setYoutubeAutoInject(!!data.settings.youtube_auto_inject);
          setCtaTemplate(data.settings.cta_template || '🔥 Get Priority Access here 👉 {tracking_link}');
          setIsConnected(!!data.settings.youtube_access_token);
        }
      })
      .catch((err) => console.error('Settings fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);

    try {
      const userEmail = typeof window !== 'undefined' ? localStorage.getItem('user_email') : 'demo';
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userEmail,
          brand_name: brandName,
          currency,
          custom_domain: customDomain,
          webhook_secret: webhookSecret,
          youtube_channel_url: youtubeChannelUrl,
          youtube_auto_inject: youtubeAutoInject,
          cta_template: ctaTemplate
        }),
      });

      const json = await res.json();
      if (json.success) {
        showToast('⚡ Workspace & Branding settings saved successfully!');
      } else {
        showToast(`⚠️ Save warning: ${json.error}`, 'error');
      }
    } catch (err: any) {
      showToast(`❌ Error saving settings: ${err.message}`, 'error');
    } finally {
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleTestInject = async () => {
    setTestingInject(true);
    setInjectResult(null);
    try {
      const userEmail = typeof window !== 'undefined' ? localStorage.getItem('user_email') : 'demo';
      const res = await fetch('/api/content/sync/inject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userEmail,
          videoId: 'sZbyenmT070',
          trackingSlug: 'yt-verification-link',
          ctaTemplate: ctaTemplate
        })
      });
      const json = await res.json();
      if (json.success) {
        setInjectResult(json.message);
        showToast('✅ Description Injector Verified!');
      } else {
        setInjectResult(`⚠️ Error: ${json.error}`);
      }
    } catch (err: any) {
      setInjectResult(`❌ Test Failed: ${err.message}`);
    } finally {
      setTestingInject(false);
    }
  };

  const handleSyncChannel = async () => {
    if (!youtubeChannelUrl) {
      showToast('⚠️ Please enter a YouTube channel URL or handle first.', 'error');
      return;
    }
    setSyncingChannel(true);
    try {
      const userEmail = typeof window !== 'undefined' ? localStorage.getItem('user_email') : 'demo';
      const res = await fetch('/api/content/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userEmail,
          youtube_channel_url: youtubeChannelUrl
        })
      });
      const json = await res.json();
      if (json.success) {
        showToast(`⚡ Sync complete! Generated ${json.added} new tracking links.`, 'success');
      } else {
        showToast(`⚠️ Sync failed: ${json.error}`, 'error');
      }
    } catch (err: any) {
      showToast(`❌ Connection failed: ${err.message}`, 'error');
    } finally {
      setSyncingChannel(false);
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(webhookSecret);
    setCopiedSecret(true);
    showToast('🔑 Webhook secret copied to clipboard!');
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleTestWebhook = async () => {
    setTestingWebhook(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/webhooks/sales', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${webhookSecret}`
        },
        body: JSON.stringify({
          email: 'alex.smith@example.com',
          amount: 1.00,
          product_name: 'Test Webhook Verification Sale'
        })
      });
      const json = await res.json();
      if (json.success) {
        setTestResult('✅ Webhook Endpoint Live & Verified! ($1.00 attributed successfully)');
        showToast('✅ Test webhook verified!');
      } else {
        setTestResult(`⚠️ Endpoint Live: ${json.error}`);
      }
    } catch (err: any) {
      setTestResult(`❌ Webhook Test Failed: ${err.message}`);
    } finally {
      setTestingWebhook(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-2">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b-2 border-[#111111] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#EC4899]" />
            <h1 className="text-3xl font-black text-[#111111] tracking-tight">Workspace & Branding Settings</h1>
          </div>
          <p className="text-sm text-[#4B4B4B] font-semibold mt-1">
            Manage your brand identity, custom domain, default currency, and API security keys.
          </p>
        </div>

        {saved && (
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-[#EC4899] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111]">
            <Check className="w-4 h-4" />
            Settings Saved!
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* 1. Brand & Identity (Collapsible) */}
        <div className="rounded-3xl bg-white border-3 border-[#111111] shadow-[5px_5px_0px_#111111] overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => setShowBrand(!showBrand)}
            className="w-full p-6 flex items-center justify-between hover:bg-[#F7F4EC]/50 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#4A4FE0]" />
              <div>
                <h2 className="text-base font-black text-[#111111]">Brand & Workspace Identity</h2>
                <p className="text-xs text-[#4B4B4B] font-semibold">{brandName} ({currency})</p>
              </div>
            </div>
            {showBrand ? <ChevronUp className="w-5 h-5 text-[#111111]" /> : <ChevronDown className="w-5 h-5 text-[#111111]" />}
          </button>

          {showBrand && (
            <div className="p-6 pt-0 border-t-2 border-[#111111]/10 space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-[#111111]">Business / Brand Name</label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] text-xs font-bold text-[#111111] focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-[#111111]">Default Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] text-xs font-bold text-[#111111] focus:outline-none focus:bg-white"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. Custom Domain Configuration (Collapsible) */}
        <div className="rounded-3xl bg-white border-3 border-[#111111] shadow-[5px_5px_0px_#111111] overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => setShowDomain(!showDomain)}
            className="w-full p-6 flex items-center justify-between hover:bg-[#F7F4EC]/50 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#EC4899]" />
              <div>
                <h2 className="text-base font-black text-[#111111]">Custom Tracking Subdomain</h2>
                <p className="text-xs text-[#4B4B4B] font-semibold">{customDomain || 'Not configured (using platform domain)'}</p>
              </div>
            </div>
            {showDomain ? <ChevronUp className="w-5 h-5 text-[#111111]" /> : <ChevronDown className="w-5 h-5 text-[#111111]" />}
          </button>

          {showDomain && (
            <div className="p-6 pt-0 border-t-2 border-[#111111]/10 space-y-4 animate-fadeIn">
              <div className="space-y-2 pt-4">
                <label className="text-xs font-extrabold text-[#111111]">Your Custom Subdomain (Vercel CNAME)</label>
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="attrib.yourdomain.com"
                  className="w-full px-4 py-3 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] text-xs font-mono font-bold text-[#4A4FE0] focus:outline-none focus:bg-white"
                />
                <p className="text-[11px] text-[#4B4B4B] font-bold">
                  Point a CNAME DNS record from <code>{customDomain || 'yourdomain.com'}</code> to <code>cname.vercel-dns.com</code>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 3. API & Webhook Security + Test Button (Collapsible) */}
        <div className="rounded-3xl bg-white border-3 border-[#111111] shadow-[5px_5px_0px_#111111] overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => setShowWebhook(!showWebhook)}
            className="w-full p-6 flex items-center justify-between hover:bg-[#F7F4EC]/50 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-[#F6D74C]" />
              <div>
                <h2 className="text-base font-black text-[#111111]">Webhook API Secret & Live Tester</h2>
                <p className="text-xs text-[#4B4B4B] font-semibold">Stripe / LemonSqueezy sales integration</p>
              </div>
            </div>
            {showWebhook ? <ChevronUp className="w-5 h-5 text-[#111111]" /> : <ChevronDown className="w-5 h-5 text-[#111111]" />}
          </button>

          {showWebhook && (
            <div className="p-6 pt-0 border-t-2 border-[#111111]/10 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pt-4">
                <span className="text-xs font-extrabold text-[#111111]">Stripe / Thrivecart Sales Webhook</span>
                <button
                  type="button"
                  onClick={handleTestWebhook}
                  disabled={testingWebhook}
                  className="px-3.5 py-1.5 rounded-xl bg-[#F6D74C] text-[#111111] border-2 border-[#111111] text-xs font-black shadow-[2px_2px_0px_#111111] inline-flex items-center gap-1.5 hover:bg-white transition-all disabled:opacity-50"
                >
                  {testingWebhook ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-[#EC4899]" />}
                  <span>{testingWebhook ? 'Testing...' : '🧪 Send Test Webhook ($1.00)'}</span>
                </button>
              </div>

              {testResult && (
                <div className="p-3.5 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] text-xs font-black text-[#111111] shadow-[2px_2px_0px_#111111]">
                  {testResult}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-extrabold text-[#111111]">Sales Webhook Authorization Secret</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={webhookSecret}
                    className="w-full px-4 py-3 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] text-xs font-mono font-bold text-[#111111]"
                  />
                  <button
                    type="button"
                    onClick={handleCopySecret}
                    className="px-4 py-3 rounded-xl bg-[#4A4FE0] hover:bg-[#3b40cc] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] text-xs font-black inline-flex items-center gap-1.5 whitespace-nowrap transition-all"
                  >
                    {copiedSecret ? <Check className="w-4 h-4 text-[#F6D74C]" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedSecret ? 'Copied Secret!' : 'Copy Secret'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-[#4B4B4B] font-bold">
                  Webhook URL: <code>https://creator-attribution-dashboard.vercel.app/api/webhooks/sales</code>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 4. YouTube Autopilot Channel Sync & Upload Defaults (Collapsible) */}
        <div className="rounded-3xl bg-white border-3 border-[#111111] shadow-[5px_5px_0px_#111111] overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => setShowYoutube(!showYoutube)}
            className="w-full p-6 flex items-center justify-between hover:bg-[#F7F4EC]/50 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <Youtube className="w-5 h-5 text-[#FF0000]" />
              <div>
                <h2 className="text-base font-black text-[#111111]">YouTube Autopilot (Upload Defaults Method)</h2>
                <p className="text-xs text-[#4B4B4B] font-semibold">100% Zero-Friction Master CTA Snippet & Channel Sync</p>
              </div>
            </div>
            {showYoutube ? <ChevronUp className="w-5 h-5 text-[#111111]" /> : <ChevronDown className="w-5 h-5 text-[#111111]" />}
          </button>

          {showYoutube && (
            <div className="p-6 pt-0 border-t-2 border-[#111111]/10 space-y-5 animate-fadeIn">
              <div className="space-y-2 pt-4">
                <label className="text-xs font-extrabold text-[#111111]">YouTube Channel URL or Handle (@handle)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={youtubeChannelUrl}
                    onChange={(e) => setYoutubeChannelUrl(e.target.value)}
                    placeholder="e.g. https://www.youtube.com/@AlexMedia"
                    className="w-full px-4 py-3 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] text-xs font-bold text-[#111111] focus:outline-none focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleSyncChannel}
                    disabled={syncingChannel}
                    className="px-4 py-3 rounded-xl bg-[#F6D74C] hover:bg-white text-[#111111] border-2 border-[#111111] text-xs font-black shadow-[2px_2px_0px_#111111] inline-flex items-center gap-1.5 whitespace-nowrap transition-all disabled:opacity-50"
                  >
                    {syncingChannel ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Video className="w-3.5 h-3.5 text-[#4A4FE0]" />}
                    <span>{syncingChannel ? 'Syncing...' : '🔄 Sync Channel Feed'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-[#4B4B4B] font-bold">
                  Connect your handle so we can automatically discover your new uploads and populate your Content Library.
                </p>
              </div>

              {/* Master Upload Defaults Autopilot Snippet Card */}
              <div className="p-5 rounded-2xl bg-[#F7F4EC] border-2 border-[#111111] shadow-[3px_3px_0px_#111111] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-black text-[#111111] flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#4A4FE0]" />
                      Your Master Channel CTA Snippet (For YouTube Upload Defaults)
                    </h3>
                    <p className="text-[11px] text-[#4B4B4B] font-semibold mt-0.5">
                      Paste this snippet into YouTube Studio once, and 100% of your future uploads will track visitors automatically!
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-[#111111]">YouTube Description CTA Template</label>
                  <input
                    type="text"
                    value={ctaTemplate}
                    onChange={(e) => setCtaTemplate(e.target.value)}
                    placeholder="🔥 Get Priority Access here 👉 {tracking_link}"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-[#111111] text-xs font-bold text-[#111111] focus:outline-none"
                  />
                </div>

                {/* Generated Master Snippet Copy Box */}
                <div className="p-3.5 rounded-xl bg-white border-2 border-[#111111] space-y-2">
                  <span className="text-[10px] font-black text-[#8A8A8A] uppercase tracking-wider block">Generated Snippet Payload</span>
                  {(() => {
                    const userEmail = typeof window !== 'undefined' ? localStorage.getItem('user_email') || 'creator' : 'creator';
                    const userSlug = userEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
                    const activeDomain = customDomain && !customDomain.includes('yourdomain.com')
                      ? `https://${customDomain}`
                      : (typeof window !== 'undefined' ? window.location.origin : 'https://creator-attribution-dashboard.vercel.app');
                    const generatedLink = `${activeDomain}/r/yt-${userSlug || 'main'}`;
                    const fullCta = ctaTemplate.replace('{tracking_link}', generatedLink);

                    return (
                      <div className="flex items-center justify-between gap-3">
                        <code className="text-xs font-mono font-bold text-[#4A4FE0] break-all">
                          {fullCta}
                        </code>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(fullCta);
                            showToast('📋 Master CTA Snippet copied to clipboard!');
                          }}
                          className="px-3.5 py-2 rounded-xl bg-[#4A4FE0] hover:bg-[#3b40cc] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] text-xs font-black inline-flex items-center gap-1.5 whitespace-nowrap transition-all"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy CTA Snippet</span>
                        </button>
                      </div>
                    );
                  })()}
                </div>

                {/* Step-by-step Setup Guide */}
                <div className="p-4 rounded-xl bg-white border-2 border-[#111111] space-y-2.5">
                  <h4 className="text-xs font-black text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                    <span>⚡ 30-Second Autopilot Setup Guide</span>
                  </h4>
                  <ol className="text-xs font-bold text-[#111111] space-y-2 list-decimal list-inside">
                    <li>Click <strong>"Copy CTA Snippet"</strong> above.</li>
                    <li>
                      Open{' '}
                      <a
                        href="https://studio.youtube.com"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#4A4FE0] underline inline-flex items-center gap-1"
                      >
                        YouTube Studio → Settings → Upload Defaults <ExternalLink className="w-3 h-3" />
                      </a>
                    </li>
                    <li>Paste into the <strong>Description</strong> box and click <strong>Save</strong>.</li>
                  </ol>
                  <div className="p-2.5 rounded-lg bg-[#EAFBF7] border border-[#111111] text-[11px] font-extrabold text-[#0D9488] flex items-center gap-1.5">
                    <span>🎉 Done! Every new video you publish will automatically include your tracking link on 100% autopilot.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="px-8 py-4 rounded-2xl bg-[#EC4899] hover:bg-[#D6317C] text-white font-black text-xs border-3 border-[#111111] shadow-[4px_4px_0px_#111111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#111111] transition-all inline-flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Workspace Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
