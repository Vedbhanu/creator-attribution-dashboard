'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ContentItem, ContentAttributionMetrics } from '@/types/database';
import { Search, ExternalLink, Copy, Check, Trash2, Plus, Sparkles, QrCode, FileText, Pencil, Save, X } from 'lucide-react';
import { getAppDomain } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export function ContentList() {
  const { showToast } = useToast();
  const [metrics, setMetrics] = useState<ContentAttributionMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
  
  // Modals & Editing
  const [qrModalUrl, setQrModalUrl] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPlatform, setEditPlatform] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [domain, setDomain] = useState('');

  useEffect(() => {
    setDomain(getAppDomain());
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      let userEmail = typeof window !== 'undefined' ? localStorage.getItem('user_email') : null;

      if (!userEmail && isSupabaseConfigured() && supabase) {
        const { data } = await supabase.auth.getUser();
        if (data?.user?.email) {
          userEmail = data.user.email;
          if (typeof window !== 'undefined') {
            localStorage.setItem('user_email', userEmail);
          }
        }
      }

      const activeUserId = userEmail || 'demo';
      const res = await fetch(`/api/content?userId=${encodeURIComponent(activeUserId)}`);
      const json = await res.json();
      if (json.success && json.metrics) {
        setMetrics(json.metrics);
      }

      // Automatically sync YouTube Channel feed to pull individual video titles
      if (activeUserId !== 'demo') {
        fetch(`/api/settings?userId=${encodeURIComponent(activeUserId)}`)
          .then(r => r.json())
          .then(settingsData => {
            if (settingsData.success && settingsData.settings?.youtube_channel_url) {
              fetch('/api/content/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: activeUserId,
                  youtube_channel_url: settingsData.settings.youtube_channel_url
                })
              })
              .then(res => res.json())
              .then(syncRes => {
                if (syncRes.success && syncRes.added > 0) {
                  // Re-fetch content metrics to show newly synced video titles live!
                  fetch(`/api/content?userId=${encodeURIComponent(activeUserId)}`)
                    .then(r => r.json())
                    .then(updatedJson => {
                      if (updatedJson.success && updatedJson.metrics) {
                        setMetrics(updatedJson.metrics);
                      }
                    });
                }
              });
            }
          });
      }
    } catch (err) {
      console.error('Failed to fetch content:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (slug: string) => {
    const fullUrl = `${domain}/r/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    showToast('Short tracking link copied to clipboard!');
  };

  const handleCopySnippet = (slug: string, title: string) => {
    const snippet = `🔥 ${title}\nCheck out the free resource here 👉 ${domain}/r/${slug}`;
    navigator.clipboard.writeText(snippet);
    showToast('YouTube description snippet copied to clipboard!');
  };

  const handleOpenEdit = (item: ContentItem) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditPlatform(item.platform);
    setEditUrl(item.url);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setSavingEdit(true);

    try {
      const res = await fetch(`/api/content/${editingItem.id}`, {
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
        setMetrics(prev => prev.map(m => {
          if (m.content.id === editingItem.id) {
            return {
              ...m,
              content: {
                ...m.content,
                title: editTitle,
                platform: editPlatform as any,
                url: editUrl
              }
            };
          }
          return m;
        }));
        showToast('Content item updated successfully! (Slug preserved)', 'success');
        setEditingItem(null);
      } else {
        showToast('Failed to update: ' + json.error, 'error');
      }
    } catch (err: any) {
      showToast('Error updating content: ' + err.message, 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content item? This will remove associated tracking metrics.')) {
      return;
    }
    setDeletingId(id);
    try {
      const res = await fetch(`/api/content/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMetrics(prev => prev.filter(m => m.content.id !== id));
        showToast('Content item deleted.', 'info');
      }
    } catch (err) {
      console.error('Failed to delete content:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredMetrics = metrics.filter(m => {
    // Only show automated YouTube tracking links once they receive at least 1 visitor click
    const isMasterOrClicked = m.visitors_count > 0 || m.content.tracking_slug.endsWith('-main') || !m.content.tracking_slug.startsWith('yt-');
    const matchesSearch = m.content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          m.content.tracking_slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = selectedPlatform === 'All' || m.content.platform === selectedPlatform;
    return isMasterOrClicked && matchesSearch && matchesPlatform;
  });

  const platformsList = ['All', ...Array.from(new Set(metrics.map(m => m.content.platform)))];

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#111111] tracking-tight">Content Library</h1>
          <p className="text-sm text-[#4B4B4B] font-semibold mt-1">
            Manage your content links, download QR codes, and view real-time attribution metrics.
          </p>
        </div>

        <Link
          href="/content/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-extrabold bg-[#EC4899] hover:bg-[#D6317C] text-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#111111] transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Content Item
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white border-2.5 border-[#111111] shadow-[4px_4px_0px_#111111] flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#111111]" />
          <input
            type="text"
            placeholder="Search by title or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] text-xs font-bold text-[#111111] focus:outline-none focus:bg-white transition-all placeholder:text-[#8A8A8A]"
          />
        </div>

        {/* Platform Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {platformsList.map(p => (
            <button
              key={p}
              onClick={() => setSelectedPlatform(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border-2 border-[#111111] whitespace-nowrap transition-all ${
                selectedPlatform === p
                  ? 'bg-[#4A4FE0] text-white shadow-[2px_2px_0px_#111111]'
                  : 'bg-white text-[#111111] hover:bg-[#F7F4EC]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Content Table / Cards */}
      {loading ? (
        <div className="p-12 text-center text-[#4B4B4B] text-xs font-bold">Loading content library...</div>
      ) : filteredMetrics.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border-2.5 border-[#111111] shadow-[4px_4px_0px_#111111] space-y-3">
          <Sparkles className="w-8 h-8 text-[#EC4899] mx-auto" />
          <p className="text-base text-[#111111] font-extrabold">No content items found</p>
          <p className="text-xs text-[#4B4B4B] font-semibold max-w-sm mx-auto">
            {searchTerm ? 'Try adjusting your search filter.' : 'Add your first piece of content to start generating attribution links.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {filteredMetrics.map(({ content, visitors_count, leads_count, sales_count, total_revenue }) => (
            <div
              key={content.id}
              className="p-6 rounded-2xl bg-white border-2.5 border-[#111111] shadow-[4px_4px_0px_#111111] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
            >
              {/* Info Column */}
              <div className="space-y-3 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-0.5 rounded-full text-[10px] font-extrabold bg-[#4A4FE0] text-white border-2 border-[#111111] shadow-[1px_1px_0px_#111111]">
                    {content.platform}
                  </span>
                  <span className="text-xs text-[#4B4B4B] font-bold">
                    Published {new Date(content.published_at).toLocaleDateString()}
                  </span>
                </div>

                <Link href={`/content/${content.id}`} className="block group">
                  <h3 className="font-black text-[#111111] group-hover:text-[#EC4899] transition-colors text-lg">
                    {content.title}
                  </h3>
                </Link>

                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2 text-[#111111] bg-[#F7F4EC] px-3 py-1.5 rounded-xl border-2 border-[#111111] font-bold">
                    <span className="text-[#4B4B4B] text-[10px]">Slug:</span>
                    <span>/r/{content.tracking_slug}</span>
                    <button
                      onClick={() => handleCopyLink(content.tracking_slug)}
                      title="Copy Short Link"
                      className="ml-1 text-[#111111] hover:text-[#EC4899]"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleCopySnippet(content.tracking_slug, content.title)}
                    className="px-3 py-1.5 rounded-xl bg-[#F6D74C] hover:bg-white text-[#111111] border-2 border-[#111111] font-extrabold text-[11px] inline-flex items-center gap-1 shadow-[2px_2px_0px_#111111]"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#EC4899]" />
                    <span>Copy Snippet</span>
                  </button>

                  <button
                    onClick={() => setQrModalUrl(`${domain}/r/${content.tracking_slug}`)}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#F7F4EC] text-[#111111] border-2 border-[#111111] font-extrabold text-[11px] inline-flex items-center gap-1 shadow-[2px_2px_0px_#111111]"
                  >
                    <QrCode className="w-3.5 h-3.5 text-[#4A4FE0]" />
                    <span>QR Code</span>
                  </button>

                  {content.url && content.url !== '/' && (
                    <a
                      href={content.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-[#EAFBF7] hover:bg-white text-[#0D9488] border-2 border-[#111111] font-extrabold text-[11px] inline-flex items-center gap-1 shadow-[2px_2px_0px_#111111]"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>▶️ View Original Video</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Attribution Metrics Pill Matrix & Actions */}
              <div className="flex items-center gap-3 border-t-2 lg:border-t-0 lg:border-l-2 border-[#111111] pt-4 lg:pt-0 lg:pl-6 w-full lg:w-auto justify-between lg:justify-end">
                <div className="text-center px-4 py-2 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] min-w-[70px]">
                  <div className="text-[10px] text-[#4B4B4B] font-extrabold uppercase">Visitors</div>
                  <div className="text-base font-black text-[#111111]">{visitors_count}</div>
                </div>

                <div className="text-center px-4 py-2 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] min-w-[70px]">
                  <div className="text-[10px] text-[#4B4B4B] font-extrabold uppercase">Leads</div>
                  <div className="text-base font-black text-[#4A4FE0]">{leads_count}</div>
                </div>

                <div className="text-center px-4 py-2 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] min-w-[70px]">
                  <div className="text-[10px] text-[#4B4B4B] font-extrabold uppercase">Sales</div>
                  <div className="text-base font-black text-[#EC4899]">{sales_count}</div>
                </div>

                <div className="text-center px-4 py-2 rounded-xl bg-[#EC4899] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] min-w-[110px]">
                  <div className="text-[10px] text-white font-extrabold uppercase">Revenue</div>
                  <div className="text-lg font-black text-white">${total_revenue.toFixed(2)}</div>
                </div>

                {/* Edit & Delete Action Buttons */}
                <div className="flex items-center gap-1.5 ml-1">
                  <button
                    onClick={() => handleOpenEdit(content)}
                    className="p-2.5 text-[#111111] bg-[#F6D74C] hover:bg-white rounded-xl border-2 border-[#111111] transition-all shadow-[2px_2px_0px_#111111]"
                    title="Edit Content Item"
                  >
                    <Pencil className="w-4 h-4 text-[#111111]" />
                  </button>

                  <button
                    onClick={() => handleDelete(content.id)}
                    disabled={deletingId === content.id}
                    className="p-2.5 text-[#111111] hover:text-white hover:bg-[#EC4899] rounded-xl border-2 border-[#111111] transition-all shadow-[2px_2px_0px_#111111]"
                    title="Delete Content Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Content Lightbox Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-[#111111]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-3 border-[#111111] p-8 max-w-lg w-full space-y-6 shadow-[8px_8px_0px_#111111]">
            <div className="flex items-center justify-between border-b-2 border-[#111111] pb-3">
              <div className="flex items-center gap-2">
                <Pencil className="w-5 h-5 text-[#EC4899]" />
                <h3 className="text-lg font-black text-[#111111]">Edit Content Item</h3>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="text-[#111111] hover:text-[#EC4899] font-black text-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-[#111111]">Content Title *</label>
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
                <p className="text-xs font-mono font-bold text-[#4A4FE0]">/r/{editingItem.tracking_slug}</p>
                <p className="text-[10px] font-bold text-[#8A8A8A]">Slugs cannot be changed after creation so existing live links never break.</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
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
      {qrModalUrl && (
        <div className="fixed inset-0 z-50 bg-[#111111]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-3 border-[#111111] p-8 max-w-sm w-full text-center space-y-6 shadow-[8px_8px_0px_#111111]">
            <div className="flex items-center justify-between border-b-2 border-[#111111] pb-3">
              <h3 className="text-lg font-black text-[#111111]">📷 Tracking QR Code</h3>
              <button
                onClick={() => setQrModalUrl(null)}
                className="text-[#111111] hover:text-[#EC4899] font-black text-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-white rounded-2xl border-2 border-[#111111] inline-block shadow-[3px_3px_0px_#111111]">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrModalUrl)}`}
                alt="QR Code"
                className="w-48 h-48 mx-auto"
              />
            </div>

            <p className="text-xs font-mono text-[#4A4FE0] font-bold truncate">{qrModalUrl}</p>

            <div className="flex gap-2">
              <a
                href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(qrModalUrl)}`}
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
