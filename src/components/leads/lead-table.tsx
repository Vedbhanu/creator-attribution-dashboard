'use client';

import { useState, useEffect } from 'react';
import { Search, Mail, Plus, CheckCircle2, Clock, Eye, DollarSign, MousePointerClick, ShieldCheck, X, Download } from 'lucide-react';
import { exportToCSV } from '@/lib/export';

interface EnrichedLead {
  id: string;
  visitor_id?: string;
  content_id: string;
  email: string;
  phone?: string;
  created_at: string;
  content_title: string;
  content_platform: string;
  content_slug: string;
  visitor_cookie: string;
  utm_source: string;
  sale_amount: number;
  sale_status: string | null;
}

export function LeadTable() {
  const [leads, setLeads] = useState<EnrichedLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTimelineLead, setSelectedTimelineLead] = useState<EnrichedLead | null>(null);

  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [selectedContentId, setSelectedContentId] = useState('');
  const [contentOptions, setContentOptions] = useState<{ id: string; title: string }[]>([]);
  const [submittingManual, setSubmittingManual] = useState(false);

  useEffect(() => {
    fetchLeads();
    fetchContentOptions();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      const json = await res.json();
      if (json.success && json.data) {
        setLeads(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchContentOptions = async () => {
    try {
      const res = await fetch('/api/content');
      const json = await res.json();
      if (json.success && json.data) {
        setContentOptions(json.data.map((c: any) => ({ id: c.id, title: c.title })));
        if (json.data.length > 0) setSelectedContentId(json.data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch content options:', err);
    }
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingManual(true);
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newEmail,
          phone: newPhone,
          content_id: selectedContentId
        }),
      });

      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        setNewEmail('');
        setNewPhone('');
        fetchLeads();
      }
    } catch (err) {
      console.error('Failed to manually add lead:', err);
    } finally {
      setSubmittingManual(false);
    }
  };

  const filteredLeads = leads.filter(l =>
    l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.content_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.phone && l.phone.includes(searchTerm))
  );

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#111111] tracking-tight">Captured Leads</h1>
          <p className="text-sm text-[#4B4B4B] font-semibold mt-1">
            Click any lead row to view their full activity timeline & attribution history.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={() => exportToCSV(filteredLeads, 'creator_leads_export')}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-extrabold bg-white hover:bg-[#F7F4EC] text-[#111111] border-2 border-[#111111] shadow-[3px_3px_0px_#111111] active:translate-x-[1px] active:translate-y-[1px] transition-all"
          >
            <Download className="w-4 h-4 text-[#4A4FE0]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-extrabold bg-[#EC4899] hover:bg-[#D6317C] text-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#111111] transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Manual Lead
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-4 rounded-2xl bg-white border-2.5 border-[#111111] shadow-[4px_4px_0px_#111111] flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#111111]" />
          <input
            type="text"
            placeholder="Search leads by email or content title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] text-xs font-bold text-[#111111] focus:outline-none focus:bg-white transition-all placeholder:text-[#8A8A8A]"
          />
        </div>
        <div className="text-xs font-bold text-[#111111]">
          Total Leads: <span className="font-black text-[#EC4899]">{filteredLeads.length}</span>
        </div>
      </div>

      {/* Leads Table */}
      {loading ? (
        <div className="p-12 text-center text-[#4B4B4B] text-xs font-bold">Loading leads data...</div>
      ) : filteredLeads.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border-2.5 border-[#111111] shadow-[4px_4px_0px_#111111] space-y-4">
          <Mail className="w-10 h-10 text-[#EC4899] mx-auto" />
          <div className="space-y-1">
            <p className="text-base text-[#111111] font-extrabold">No leads captured yet</p>
            <p className="text-xs text-[#4B4B4B] font-semibold max-w-md mx-auto">
              Visitors who opt in via your hosted forms (e.g. <code>/c/[slug]</code>) or embedded script will automatically appear here with full 30-day attribution.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F6D74C] text-[#111111] font-extrabold text-xs border-2 border-[#111111] shadow-[2px_2px_0px_#111111] hover:bg-white transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Record Manual Lead or Test Lead</span>
          </button>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border-2.5 border-[#111111] overflow-hidden shadow-[4px_4px_0px_#111111]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#111111]">
              <thead className="bg-[#F7F4EC] text-[#111111] font-extrabold border-b-2 border-[#111111] uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Lead Contact</th>
                  <th className="px-6 py-4">Attributed Content Source</th>
                  <th className="px-6 py-4">Visitor Cookie & UTM</th>
                  <th className="px-6 py-4">Captured Date</th>
                  <th className="px-6 py-4 text-right">Sale Status</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[#111111]/10 font-medium cursor-pointer">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedTimelineLead(lead)}
                    className="hover:bg-[#F7F4EC] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-extrabold text-[#111111] text-sm hover:text-[#EC4899] flex items-center gap-1.5">
                        {lead.email}
                        <Clock className="w-3.5 h-3.5 text-[#4A4FE0] opacity-80" />
                      </div>
                      {lead.phone && <div className="text-[11px] text-[#4B4B4B] font-bold">{lead.phone}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#4A4FE0] text-white border-2 border-[#111111] shadow-[1px_1px_0px_#111111]">
                          {lead.content_platform}
                        </span>
                        <span className="font-extrabold text-[#111111] truncate max-w-[200px]">{lead.content_title}</span>
                      </div>
                      <div className="text-[10px] font-mono text-[#4B4B4B] font-bold mt-0.5">/r/{lead.content_slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-[11px] text-[#111111] font-bold">{lead.visitor_cookie.substring(0, 18)}...</div>
                      <div className="text-[10px] text-[#4A4FE0] font-extrabold">UTM: {lead.utm_source}</div>
                    </td>
                    <td className="px-6 py-4 text-[#4B4B4B] font-bold whitespace-nowrap">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {lead.sale_amount > 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#EC4899] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          ${Number(lead.sale_amount).toFixed(2)}
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold text-[#111111] bg-[#F7F4EC] border-2 border-[#111111]">
                          Lead (No Sale)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LEAD ACTIVITY TIMELINE MODAL */}
      {selectedTimelineLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/70 backdrop-blur-xs">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-white border-3 border-[#111111] shadow-[8px_8px_0px_#111111] space-y-6">
            <div className="flex items-center justify-between border-b-2 border-[#111111] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#EC4899] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] flex items-center justify-center font-black">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#111111]">Lead Activity Timeline</h3>
                  <p className="text-xs font-bold text-[#EC4899]">{selectedTimelineLead.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTimelineLead(null)}
                className="p-1.5 rounded-xl border-2 border-[#111111] hover:bg-[#F6D74C] font-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Timeline Events */}
            <div className="space-y-4 relative pl-4 border-l-3 border-[#111111]/20 ml-2">
              {/* Event 1: Clicked Link */}
              <div className="relative space-y-1">
                <div className="w-7 h-7 rounded-full bg-[#F6D74C] text-[#111111] border-2 border-[#111111] shadow-[1px_1px_0px_#111111] flex items-center justify-center absolute -left-[31px] top-0 font-black text-xs">
                  <MousePointerClick className="w-3.5 h-3.5" />
                </div>
                <div className="p-3 rounded-2xl bg-[#F7F4EC] border-2 border-[#111111] space-y-1">
                  <div className="flex items-center justify-between text-xs font-extrabold text-[#111111]">
                    <span>1. Clicked Content Link</span>
                    <span className="text-[10px] text-[#4B4B4B]">{new Date(selectedTimelineLead.created_at).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-xs text-[#111111] font-bold">
                    Source: <strong>{selectedTimelineLead.content_platform}</strong> ({selectedTimelineLead.content_title})
                  </p>
                  <p className="text-[10px] font-mono text-[#4A4FE0]">UTM Source: {selectedTimelineLead.utm_source}</p>
                  <p className="text-[10px] font-mono text-[#4B4B4B]">Cookie ID: {selectedTimelineLead.visitor_cookie}</p>
                </div>
              </div>

              {/* Event 2: Submitted Opt-in Form */}
              <div className="relative space-y-1">
                <div className="w-7 h-7 rounded-full bg-[#4A4FE0] text-white border-2 border-[#111111] shadow-[1px_1px_0px_#111111] flex items-center justify-center absolute -left-[31px] top-0 font-black text-xs">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <div className="p-3 rounded-2xl bg-[#F7F4EC] border-2 border-[#111111] space-y-1">
                  <div className="flex items-center justify-between text-xs font-extrabold text-[#111111]">
                    <span>2. Submitted Opt-In Form</span>
                    <span className="text-[10px] text-[#4B4B4B]">{new Date(selectedTimelineLead.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-[#111111] font-bold">
                    Email: <strong>{selectedTimelineLead.email}</strong>
                  </p>
                  {selectedTimelineLead.phone && (
                    <p className="text-xs text-[#4B4B4B] font-bold">Phone: {selectedTimelineLead.phone}</p>
                  )}
                </div>
              </div>

              {/* Event 3: Converted Revenue Sale */}
              <div className="relative space-y-1">
                <div className={`w-7 h-7 rounded-full border-2 border-[#111111] shadow-[1px_1px_0px_#111111] flex items-center justify-center absolute -left-[31px] top-0 font-black text-xs ${selectedTimelineLead.sale_amount > 0 ? 'bg-[#EC4899] text-white' : 'bg-white text-[#4B4B4B]'}`}>
                  <DollarSign className="w-3.5 h-3.5" />
                </div>
                <div className="p-3 rounded-2xl bg-[#F7F4EC] border-2 border-[#111111] space-y-1">
                  <div className="flex items-center justify-between text-xs font-extrabold text-[#111111]">
                    <span>3. Sales Conversion</span>
                    {selectedTimelineLead.sale_amount > 0 && (
                      <span className="text-xs font-black text-[#EC4899]">${Number(selectedTimelineLead.sale_amount).toFixed(2)}</span>
                    )}
                  </div>
                  {selectedTimelineLead.sale_amount > 0 ? (
                    <p className="text-xs text-[#EC4899] font-black">
                      Purchased $${Number(selectedTimelineLead.sale_amount).toFixed(2)} attributed back to {selectedTimelineLead.content_platform}!
                    </p>
                  ) : (
                    <p className="text-xs text-[#4B4B4B] font-semibold">
                      Lead has not converted a sale yet. (Awaiting PayPal/Payoneer webhook)
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedTimelineLead(null)}
                className="px-5 py-2.5 rounded-xl bg-[#EC4899] text-white text-xs font-black border-2 border-[#111111] shadow-[2px_2px_0px_#111111]"
              >
                Close Timeline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Lead Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/70 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white border-3 border-[#111111] shadow-[6px_6px_0px_#111111] space-y-5">
            <h3 className="text-lg font-black text-[#111111]">Record Manual Lead</h3>
            <form onSubmit={handleManualAdd} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-[#111111]">Lead Email *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="lead@domain.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] text-xs font-bold text-[#111111] focus:outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-[#111111]">Phone (Optional)</label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+15550199"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] text-xs font-bold text-[#111111] focus:outline-none focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-[#111111]">Attributed Content Item *</label>
                <select
                  value={selectedContentId}
                  onChange={(e) => setSelectedContentId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] text-xs font-bold text-[#111111] focus:outline-none focus:bg-white"
                >
                  {contentOptions.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#111111]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingManual}
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-[#EC4899] text-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111]"
                >
                  {submittingManual ? 'Saving...' : 'Save Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
