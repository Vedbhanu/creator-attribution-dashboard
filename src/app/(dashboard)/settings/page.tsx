'use client';

import { useState, useEffect } from 'react';
import { Settings, Globe, Key, Sparkles, Save, Check, Copy, Zap, RefreshCw, Youtube, Video } from 'lucide-react';
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
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleConnectYoutube = () => {
    const userEmail = typeof window !== 'undefined' ? localStorage.getItem('user_email') : 'demo';
    window.location.href = `/api/auth/youtube?userId=${encodeURIComponent(userEmail || 'demo')}`;
  };

  const handleDisconnectYoutube = async () => {
    try {
      const userEmail = typeof window !== 'undefined' ? localStorage.getItem('user_email') : 'demo';
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userEmail,
          youtube_access_token: null,
          youtube_refresh_token: null,
          youtube_auto_inject: false
        })
      });
      const json = await res.json();
      if (json.success) {
        setIsConnected(false);
        setYoutubeAutoInject(false);
        showToast('Disconnected YouTube Channel.', 'success');
      }
    } catch (err) {
      console.error(err);
    }
  };

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
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setSaved(false), 2000);
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

      <form onSubmit={handleSave} className="space-y-6">
        {/* Brand & Identity */}
        <div className="p-6 rounded-3xl bg-white border-3 border-[#111111] shadow-[5px_5px_0px_#111111] space-y-4">
          <div className="flex items-center gap-2 border-b-2 border-[#111111] pb-3">
            <Sparkles className="w-5 h-5 text-[#4A4FE0]" />
            <h2 className="text-base font-black text-[#111111]">Brand & Workspace Identity</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        {/* Custom Domain Configuration */}
        <div className="p-6 rounded-3xl bg-white border-3 border-[#111111] shadow-[5px_5px_0px_#111111] space-y-4">
          <div className="flex items-center gap-2 border-b-2 border-[#111111] pb-3">
            <Globe className="w-5 h-5 text-[#EC4899]" />
            <h2 className="text-base font-black text-[#111111]">Custom Tracking Subdomain</h2>
          </div>

          <div className="space-y-2">
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

        {/* API & Webhook Security + Test Button */}
        <div className="p-6 rounded-3xl bg-white border-3 border-[#111111] shadow-[5px_5px_0px_#111111] space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#111111] pb-3">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-[#F6D74C]" />
              <h2 className="text-base font-black text-[#111111]">Webhook API Secret & Live Tester</h2>
            </div>
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

        {/* YouTube Autopilot Channel Sync */}
        <div className="p-6 rounded-3xl bg-white border-3 border-[#111111] shadow-[5px_5px_0px_#111111] space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#111111] pb-3">
            <div className="flex items-center gap-2">
              <Youtube className="w-5 h-5 text-[#FF0000]" />
              <h2 className="text-base font-black text-[#111111]">YouTube Autopilot Sync</h2>
            </div>
            <button
              type="button"
              onClick={handleSyncChannel}
              disabled={syncingChannel}
              className="px-3.5 py-1.5 rounded-xl bg-[#F6D74C] text-[#111111] border-2 border-[#111111] text-xs font-black shadow-[2px_2px_0px_#111111] inline-flex items-center gap-1.5 hover:bg-white transition-all disabled:opacity-50"
            >
              {syncingChannel ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Video className="w-3.5 h-3.5 text-[#4A4FE0]" />}
              <span>{syncingChannel ? 'Syncing...' : '🔄 Sync Channel Feed'}</span>
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-extrabold text-[#111111]">YouTube Channel URL or Handle (@handle)</label>
            <input
              type="text"
              value={youtubeChannelUrl}
              onChange={(e) => setYoutubeChannelUrl(e.target.value)}
              placeholder="e.g. https://www.youtube.com/@AlexMedia"
              className="w-full px-4 py-3 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] text-xs font-bold text-[#111111] focus:outline-none focus:bg-white"
            />
            <p className="text-[11px] text-[#4B4B4B] font-bold">
              When configured, our system automatically tracks your uploads and generates short redirect links (<code className="bg-[#F7F4EC] px-1 py-0.5 rounded text-[#4A4FE0]">/r/yt-slug</code>) for your videos.
            </p>
          </div>

          {/* Autopilot Description Injector settings */}
          <div className="pt-4 border-t-2 border-[#111111]/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-xs font-extrabold text-[#111111] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#EC4899]"></span>
                  Enable YouTube Auto-Injection (Autopilot Pro)
                </label>
                <p className="text-[11px] text-[#4B4B4B] font-medium">
                  Automatically inserts tracking link into new YouTube video descriptions via Google API.
                </p>
              </div>
              <input
                type="checkbox"
                checked={youtubeAutoInject}
                onChange={(e) => setYoutubeAutoInject(e.target.checked)}
                className="w-5 h-5 rounded border-2 border-[#111111] accent-[#EC4899] cursor-pointer"
              />
            </div>

            {youtubeAutoInject && (
              <div className="space-y-3 pt-2 animate-fadeIn">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-[#111111]">YouTube Description CTA Template</label>
                  <input
                    type="text"
                    value={ctaTemplate}
                    onChange={(e) => setCtaTemplate(e.target.value)}
                    placeholder="🔥 Access resources here 👉 {tracking_link}"
                    className="w-full px-4 py-3 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] text-xs font-bold text-[#111111] focus:outline-none focus:bg-white"
                  />
                  <p className="text-[10px] text-[#8A8A8A] font-semibold">
                    Use <code>{`{tracking_link}`}</code> where you want the short redirect URL to appear.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] flex items-center justify-between gap-3 shadow-[2px_2px_0px_#111111]">
                  <div className="text-[11px] font-bold text-[#111111]">
                    Status: <span className={isConnected ? 'text-[#EC4899] font-black' : 'text-[#4B4B4B] font-black'}>
                      {isConnected ? '✅ Live YouTube Connected' : '❌ Disconnected'}
                    </span>
                  </div>
                  {isConnected ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleTestInject}
                        disabled={testingInject}
                        className="px-3.5 py-1.5 rounded-lg bg-[#EC4899] hover:bg-[#D6317C] text-white text-[11px] font-black border-2 border-[#111111] shadow-[2px_2px_0px_#111111] active:translate-y-[1px] transition-all disabled:opacity-50"
                      >
                        {testingInject ? 'Testing...' : '🧪 Test Injector'}
                      </button>
                      <button
                        type="button"
                        onClick={handleDisconnectYoutube}
                        className="px-3.5 py-1.5 rounded-lg bg-red-100 text-red-600 text-[11px] font-black border-2 border-[#111111]"
                      >
                        Disconnect
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleConnectYoutube}
                      className="px-3.5 py-1.5 rounded-lg bg-[#4A4FE0] hover:bg-[#3b40cc] text-white text-[11px] font-black border-2 border-[#111111] shadow-[2px_2px_0px_#111111] active:translate-y-[1px] transition-all"
                    >
                      Connect YouTube Channel
                    </button>
                  )}
                </div>

                {injectResult && (
                  <div className="p-3.5 rounded-xl bg-[#FDFCF8] border-2 border-[#111111] text-xs font-bold text-[#111111] shadow-[2px_2px_0px_#111111]">
                    {injectResult}
                  </div>
                )}
              </div>
            )}
          </div>
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
