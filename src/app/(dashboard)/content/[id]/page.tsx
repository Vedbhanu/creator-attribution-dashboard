'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ContentAttributionMetrics, Lead, Sale } from '@/types/database';
import { ArrowLeft, Copy, Check, ExternalLink, Users, DollarSign, TrendingUp, Sparkles, Eye, FileText, Calendar, CheckCircle2, Play, Zap, QrCode, Pencil, Save, X } from 'lucide-react';
import { getAppDomain } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';

export default function ContentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [metrics, setMetrics] = useState<ContentAttributionMetrics | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  // Edit Modal State
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editPlatform, setEditPlatform] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [domain, setDomain] = useState('');

  useEffect(() => {
    setDomain(getAppDomain());
    fetchDetail();
  }, [params.id]);

  const fetchDetail = async () => {
    try {
      const [detailRes, leadsRes, salesRes] = await Promise.all([
        fetch(`/api/content/${params.id}`),
        fetch('/api/leads'),
        fetch('/api/sales'),
      ]);

      const detailJson = await detailRes.json();
      const leadsJson = await leadsRes.json();
      const salesJson = await salesRes.json();

      if (detailJson.success && detailJson.metrics) {
        setMetrics(detailJson.metrics);
        setEditTitle(detailJson.metrics.content.title);
        setEditPlatform(detailJson.metrics.content.platform);
        setEditUrl(detailJson.metrics.content.url);
      }

      if (leadsJson.success && leadsJson.data) {
        setLeads(leadsJson.data.filter((l: any) => l.content_id === params.id));
      }

      if (salesJson.success && salesJson.data) {
        const itemLeadIds = new Set(leadsJson.data.filter((l: any) => l.content_id === params.id).map((l: any) => l.id));
        setSales(salesJson.data.filter((s: any) => itemLeadIds.has(s.lead_id) || s.content_id === params.id));
      }
    } catch (err) {
      console.error('Failed to fetch content details:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`);
  };

  const handleCopySnippet = () => {
    if (!metrics) return;
    const snippet = `🔥 ${metrics.content.title}\nCheck out the free resource here 👉 ${domain}/r/${metrics.content.tracking_slug}`;
    navigator.clipboard.writeText(snippet);
    showToast('YouTube description snippet copied to clipboard!');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!metrics) return;
    setSavingEdit(true);

    try {
      const res = await fetch(`/api/content/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          platform: editPlatform,
          url: editUrl
        })
      });

      const json = await res.json();
      if (json.success && json.data) {
        setMetrics(prev => prev ? {
          ...prev,
          content: {
            ...prev.content,
            title: editTitle,
            platform: editPlatform as any,
            url: editUrl
          }
        } : null);
        showToast('Video details updated! (Tracking link preserved)', 'success');
        setEditing(false);
      } else {
        showToast('Failed to update: ' + json.error, 'error');
      }
    } catch (err: any) {
      showToast('Error updating details: ' + err.message, 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  // Extract YouTube Thumbnail if applicable
  const getYouTubeThumbnail = (url: string) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : null;
  };

  if (loading) {
    return <div className="p-12 text-center text-[#4B4B4B] text-xs font-bold">Loading video financial report...</div>;
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
  const trackingUrl = `${domain}/r/${content.tracking_slug}`;
  const leadFormUrl = `${domain}/c/${content.tracking_slug}`;
  const ytThumbnail = getYouTubeThumbnail(content.url);
  const isTopPerformer = total_revenue > 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-2">
      {/* Back Button & Top Tagline */}
      <div className="flex items-center justify-between border-b-2 border-[#111111] pb-4">
        <button
          onClick={() => router.push('/content')}
          className="inline-flex items-center gap-2 text-xs font-extrabold text-[#111111] hover:text-[#EC4899] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Content Library
        </button>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#F6D74C] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111]">
          <Sparkles className="w-3.5 h-3.5 text-[#EC4899]" />
          Per-Video Financial P&L Report
        </span>
      </div>

      {/* Main Per-Video Header Card (Trace Style Visual) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border-3 border-[#111111] space-y-6 shadow-[8px_8px_0px_#111111]">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Thumbnail Preview / Icon */}
          <div className="relative w-full md:w-64 aspect-video shrink-0 rounded-2xl border-2 border-[#111111] overflow-hidden bg-[#111111] shadow-[3px_3px_0px_#111111]">
            {ytThumbnail ? (
              <img src={ytThumbnail} alt={content.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-[#4A4FE0] text-white p-4 text-center">
                <Play className="w-8 h-8 fill-white mb-1" />
                <span className="text-xs font-black uppercase tracking-wider">{content.platform}</span>
              </div>
            )}
            <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-[#111111] text-white text-[10px] font-black border border-white flex items-center gap-1">
              <span>{content.platform}</span>
            </div>
          </div>

          {/* Video Title & Badges */}
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-[#4B4B4B]">
                Published {new Date(content.published_at).toLocaleDateString()}
              </span>
              {isTopPerformer && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#EC4899] text-white border-2 border-[#111111] shadow-[1px_1px_0px_#111111]">
                  🥇 Top Performer
                </span>
              )}
            </div>

            <h1 className="text-2xl font-black text-[#111111] leading-tight">{content.title}</h1>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setEditing(true)}
                className="px-3 py-1.5 rounded-xl bg-[#F6D74C] text-[#111111] border-2 border-[#111111] text-xs font-black shadow-[2px_2px_0px_#111111] hover:bg-white transition-all inline-flex items-center gap-1"
              >
                <Pencil className="w-3.5 h-3.5 text-[#111111]" />
                <span>Edit Video Info</span>
              </button>

              <button
                onClick={handleCopySnippet}
                className="px-3 py-1.5 rounded-xl bg-white text-[#111111] border-2 border-[#111111] text-xs font-black shadow-[2px_2px_0px_#111111] hover:bg-[#F7F4EC] transition-all inline-flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5 text-[#EC4899]" />
                <span>📋 Copy YouTube Snippet</span>
              </button>

              <button
                onClick={() => setQrModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-white text-[#111111] border-2 border-[#111111] text-xs font-black shadow-[2px_2px_0px_#111111] hover:bg-[#F7F4EC] transition-all inline-flex items-center gap-1"
              >
                <QrCode className="w-3.5 h-3.5 text-[#4A4FE0]" />
                <span>📷 Download QR Code</span>
              </button>

              <a
                href={content.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#4A4FE0] text-white border-2 border-[#111111] text-xs font-black shadow-[2px_2px_0px_#111111] hover:bg-[#3b40cc] transition-all"
              >
                View Video <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Tracking Link Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t-2 border-[#111111]">
          <div className="p-4 rounded-2xl bg-[#F7F4EC] border-2 border-[#111111] space-y-2 shadow-[2px_2px_0px_#111111]">
            <div className="flex items-center justify-between text-xs font-extrabold text-[#111111]">
              <span>Short Tracking Link (Paste in Bio / Desc)</span>
              <button
                onClick={() => copyToClipboard(trackingUrl, 'Short tracking link')}
                className="text-[#4A4FE0] hover:underline inline-flex items-center gap-1 text-[11px] font-black"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Link</span>
              </button>
            </div>
            <p className="text-xs font-mono font-bold text-[#4A4FE0] truncate">{trackingUrl}</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#F7F4EC] border-2 border-[#111111] space-y-2 shadow-[2px_2px_0px_#111111]">
            <div className="flex items-center justify-between text-xs font-extrabold text-[#111111]">
              <span>Hosted Lead Capture Form</span>
              <button
                onClick={() => copyToClipboard(leadFormUrl, 'Lead form link')}
                className="text-[#EC4899] hover:underline inline-flex items-center gap-1 text-[11px] font-black"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Link</span>
              </button>
            </div>
            <p className="text-xs font-mono font-bold text-[#EC4899] truncate">{leadFormUrl}</p>
          </div>
        </div>
      </div>

      {/* 4 CORE REVENUE METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-6 rounded-2xl bg-[#EC4899] text-white border-2.5 border-[#111111] shadow-[4px_4px_0px_#111111] space-y-2">
          <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-white">
            <span>💲 Total Revenue</span>
          </div>
          <div className="text-3xl font-black text-white">${total_revenue.toFixed(2)}</div>
          <p className="text-[11px] text-white/90 font-bold">Attributed back to this video</p>
        </div>

        <div className="p-6 rounded-2xl bg-white text-[#111111] border-2.5 border-[#111111] shadow-[4px_4px_0px_#111111] space-y-2">
          <div className="flex items-center justify-between text-xs font-extrabold text-[#4B4B4B] uppercase tracking-wider">
            <span>🖱️ Unique Clicks</span>
          </div>
          <div className="text-3xl font-black text-[#111111]">{visitors_count}</div>
          <p className="text-[11px] text-[#4B4B4B] font-semibold">Cookie tracking clicks logged</p>
        </div>

        <div className="p-6 rounded-2xl bg-white text-[#111111] border-2.5 border-[#111111] shadow-[4px_4px_0px_#111111] space-y-2">
          <div className="flex items-center justify-between text-xs font-extrabold text-[#4B4B4B] uppercase tracking-wider">
            <span>📄 Lead Forms</span>
            <span className="px-2 py-0.5 rounded-full bg-[#4A4FE0] text-white text-[10px] font-black">{visitor_to_lead_cr}% CR</span>
          </div>
          <div className="text-3xl font-black text-[#4A4FE0]">{leads_count}</div>
          <p className="text-[11px] text-[#4B4B4B] font-semibold">Opt-in lead conversions</p>
        </div>

        <div className="p-6 rounded-2xl bg-[#F7F4EC] text-[#111111] border-2.5 border-[#111111] shadow-[4px_4px_0px_#111111] space-y-2">
          <div className="flex items-center justify-between text-xs font-extrabold text-[#4B4B4B] uppercase tracking-wider">
            <span>💰 Closed Sales</span>
            <span className="px-2 py-0.5 rounded-full bg-[#EC4899] text-white text-[10px] font-black">{lead_to_sale_cr}% CR</span>
          </div>
          <div className="text-3xl font-black text-[#111111]">{sales_count}</div>
          <p className="text-[11px] text-[#4B4B4B] font-bold">Successful purchases attributed</p>
        </div>
      </div>

      {/* PER-VIDEO FUNNEL & ATTRIBUTED SALES FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visual Funnel Bar */}
        <div className="p-6 rounded-3xl bg-white border-3 border-[#111111] shadow-[5px_5px_0px_#111111] space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#111111] pb-3">
            <h3 className="text-base font-black text-[#111111]">Per-Video Conversion Funnel</h3>
            <span className="text-xs font-bold text-[#4B4B4B]">Step-by-step conversion</span>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-extrabold text-[#111111] mb-1">
                <span>1. Unique Clicks</span>
                <span>{visitors_count} visitors (100%)</span>
              </div>
              <div className="h-4 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] overflow-hidden">
                <div className="h-full bg-[#4A4FE0] rounded-lg" style={{ width: '100%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-extrabold text-[#111111] mb-1">
                <span>2. Lead Opt-Ins</span>
                <span>{leads_count} leads ({visitor_to_lead_cr}%)</span>
              </div>
              <div className="h-4 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] overflow-hidden">
                <div className="h-full bg-[#F6D74C] rounded-lg" style={{ width: `${Math.min(100, Math.max(10, visitor_to_lead_cr))}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-extrabold text-[#111111] mb-1">
                <span>3. Closed Sales ($)</span>
                <span>{sales_count} sales ({lead_to_sale_cr}%)</span>
              </div>
              <div className="h-4 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] overflow-hidden">
                <div className="h-full bg-[#EC4899] rounded-lg" style={{ width: `${Math.min(100, Math.max(10, lead_to_sale_cr))}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Attributed Sales Feed */}
        <div className="p-6 rounded-3xl bg-white border-3 border-[#111111] shadow-[5px_5px_0px_#111111] space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#111111] pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#EC4899]" />
              <h3 className="text-base font-black text-[#111111]">Attributed Sales Feed</h3>
            </div>
            <span className="text-xs font-bold text-[#4A4FE0]">Auto-Synced</span>
          </div>

          {sales.length === 0 ? (
            <div className="p-8 text-center text-xs font-bold text-[#4B4B4B]">
              No purchases attributed to this video yet. (Connect PayPal/Payoneer webhook)
            </div>
          ) : (
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {sales.map((sale: any) => (
                <div key={sale.id} className="p-3.5 rounded-2xl bg-[#F7F4EC] border-2 border-[#111111] flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black text-[#111111]">{sale.lead_email || 'Customer Lead'}</p>
                    <p className="text-[11px] font-bold text-[#4B4B4B]">{sale.product_name || 'Purchase Conversion'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-[#EC4899]">+${Number(sale.amount).toFixed(2)}</p>
                    <p className="text-[10px] font-bold text-[#4B4B4B]">{new Date(sale.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Content Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-[#111111]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-3 border-[#111111] p-8 max-w-lg w-full space-y-6 shadow-[8px_8px_0px_#111111]">
            <div className="flex items-center justify-between border-b-2 border-[#111111] pb-3">
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5 text-[#EC4899]" />
                <h3 className="text-lg font-black text-[#111111]">Edit Video Information</h3>
              </div>
              <button onClick={() => setEditing(false)} className="text-[#111111] hover:text-[#EC4899] font-black text-sm">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-[#111111]">Video Title *</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] text-xs font-bold text-[#111111] focus:outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-[#111111]">Platform *</label>
                <select
                  value={editPlatform}
                  onChange={(e) => setEditPlatform(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] text-xs font-bold text-[#111111] focus:outline-none focus:bg-white"
                >
                  <option value="YouTube">YouTube</option>
                  <option value="Twitter/X">Twitter/X</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Newsletter">Newsletter</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Podcast">Podcast</option>
                  <option value="Blog">Blog</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-[#111111]">Target URL *</label>
                <input
                  type="url"
                  required
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] text-xs font-bold text-[#111111] focus:outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1.5 p-3 rounded-xl bg-[#F7F4EC] border-2 border-[#111111]">
                <label className="text-[11px] font-extrabold text-[#4B4B4B] uppercase">Tracking Slug (Immutable)</label>
                <p className="text-xs font-mono font-bold text-[#4A4FE0]">/r/{content.tracking_slug}</p>
                <p className="text-[10px] font-bold text-[#8A8A8A]">Slugs cannot be changed after creation so existing live links never break.</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="w-1/2 py-3.5 rounded-xl bg-[#F7F4EC] text-[#111111] font-extrabold text-xs border-2 border-[#111111]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="w-1/2 py-3.5 rounded-xl bg-[#EC4899] hover:bg-[#D6317C] text-white font-extrabold text-xs border-2 border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingEdit ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Lightbox Modal */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#111111]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-3 border-[#111111] p-8 max-w-sm w-full text-center space-y-6 shadow-[8px_8px_0px_#111111]">
            <div className="flex items-center justify-between border-b-2 border-[#111111] pb-3">
              <h3 className="text-lg font-black text-[#111111]">📷 Tracking QR Code</h3>
              <button onClick={() => setQrModalOpen(false)} className="text-[#111111] hover:text-[#EC4899] font-black text-sm">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-white rounded-2xl border-2 border-[#111111] inline-block shadow-[3px_3px_0px_#111111]">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(trackingUrl)}`}
                alt="QR Code"
                className="w-48 h-48 mx-auto"
              />
            </div>

            <p className="text-xs font-mono text-[#4A4FE0] font-bold truncate">{trackingUrl}</p>

            <div className="flex gap-2">
              <a
                href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(trackingUrl)}`}
                target="_blank"
                download="tracking-qr.png"
                className="w-full py-3 rounded-xl bg-[#EC4899] hover:bg-[#D6317C] text-white font-extrabold text-xs border-2 border-[#111111] shadow-[2px_2px_0px_#111111]"
              >
                Download HD QR Code
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
