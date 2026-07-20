'use client';

import { useState, useEffect } from 'react';
import { Search, DollarSign, Plus, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface EnrichedSale {
  id: string;
  lead_id: string;
  amount: number;
  status: 'completed' | 'pending' | 'refunded';
  created_at: string;
  lead_email: string;
  lead_phone?: string;
  content_title: string;
  content_platform: string;
  content_slug?: string;
}

export function SalesTable() {
  const [sales, setSales] = useState<EnrichedSale[]>([]);
  const [leadsOptions, setLeadsOptions] = useState<{ id: string; email: string; content_title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form fields for new sale modal
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<'completed' | 'pending' | 'refunded'>('completed');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSales();
    fetchLeadsOptions();
  }, []);

  const fetchSales = async () => {
    try {
      const res = await fetch('/api/sales');
      const json = await res.json();
      if (json.success && json.data) {
        setSales(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch sales:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeadsOptions = async () => {
    try {
      const res = await fetch('/api/leads');
      const json = await res.json();
      if (json.success && json.data) {
        setLeadsOptions(json.data.map((l: any) => ({
          id: l.id,
          email: l.email,
          content_title: l.content_title
        })));
        if (json.data.length > 0) setSelectedLeadId(json.data[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch lead options:', err);
    }
  };

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: selectedLeadId,
          amount: parseFloat(amount),
          status
        }),
      });

      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        setAmount('');
        fetchSales();
      }
    } catch (err) {
      console.error('Failed to record sale:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSales = sales.filter(s =>
    s.lead_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.content_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = sales
    .filter(s => s.status === 'completed')
    .reduce((acc, s) => acc + Number(s.amount), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#111111] tracking-tight">Sales & Revenue Log</h1>
          <p className="text-sm text-[#4B4B4B] font-semibold mt-1">
            Record sales conversions and view instant revenue attribution per content item.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-extrabold bg-[#EC4899] hover:bg-[#D6317C] text-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#111111] transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Record New Sale
        </button>
      </div>

      {/* KPI Cards Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-[#EC4899] text-white border-2.5 border-[#111111] shadow-[4px_4px_0px_#111111] space-y-1">
          <div className="text-xs font-extrabold uppercase tracking-wider text-white">Total Attributed Revenue</div>
          <div className="text-3xl font-black text-white">${totalRevenue.toFixed(2)}</div>
          <p className="text-[11px] text-white font-bold">Completed transactions</p>
        </div>

        <div className="p-6 rounded-2xl bg-white text-[#111111] border-2.5 border-[#111111] shadow-[4px_4px_0px_#111111] space-y-1">
          <div className="text-xs font-extrabold uppercase tracking-wider text-[#4B4B4B]">Total Transactions</div>
          <div className="text-3xl font-extrabold text-[#111111]">{sales.length}</div>
          <p className="text-[11px] text-[#4B4B4B] font-bold">Recorded sales entries</p>
        </div>

        <div className="p-6 rounded-2xl bg-[#F7F4EC] text-[#111111] border-2.5 border-[#111111] shadow-[4px_4px_0px_#111111] space-y-1">
          <div className="text-xs font-extrabold uppercase tracking-wider text-[#4B4B4B]">Average Order Value</div>
          <div className="text-3xl font-extrabold text-[#4A4FE0]">
            ${sales.length > 0 ? (totalRevenue / sales.length).toFixed(2) : '0.00'}
          </div>
          <p className="text-[11px] text-[#4B4B4B] font-bold">Per converted lead</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border-2.5 border-[#111111] shadow-[4px_4px_0px_#111111] flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-[#111111]" />
          <input
            type="text"
            placeholder="Search sales by lead email or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] text-xs font-bold text-[#111111] focus:outline-none focus:bg-white transition-all placeholder:text-[#8A8A8A]"
          />
        </div>
      </div>

      {/* Sales Table */}
      {loading ? (
        <div className="p-12 text-center text-[#4B4B4B] text-xs font-bold">Loading sales log...</div>
      ) : filteredSales.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border-2.5 border-[#111111] shadow-[4px_4px_0px_#111111] space-y-3">
          <DollarSign className="w-8 h-8 text-[#EC4899] mx-auto" />
          <p className="text-base text-[#111111] font-extrabold">No sales recorded yet</p>
          <p className="text-xs text-[#4B4B4B] font-semibold max-w-sm mx-auto">
            Record your first sale to map revenue back to the original content item that generated the lead.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border-2.5 border-[#111111] overflow-hidden shadow-[4px_4px_0px_#111111]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#111111]">
              <thead className="bg-[#F7F4EC] text-[#111111] font-extrabold border-b-2 border-[#111111] uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Customer / Lead</th>
                  <th className="px-6 py-4">Attributed Content</th>
                  <th className="px-6 py-4">Sale Amount ($)</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[#111111]/10 font-medium">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-[#F7F4EC] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-extrabold text-[#111111] text-sm">{sale.lead_email}</div>
                      {sale.lead_phone && <div className="text-[11px] text-[#4B4B4B] font-bold">{sale.lead_phone}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#4A4FE0] text-white border-2 border-[#111111] shadow-[1px_1px_0px_#111111]">
                          {sale.content_platform}
                        </span>
                        <span className="font-extrabold text-[#111111] truncate max-w-[200px]">{sale.content_title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-base font-black text-[#EC4899]">${Number(sale.amount).toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      {sale.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-[#EC4899] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Completed
                        </span>
                      ) : sale.status === 'pending' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-[#F6D74C] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111]">
                          <RefreshCw className="w-3.5 h-3.5" />
                          Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-white text-[#111111] border-2 border-[#111111]">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Refunded
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-[#4B4B4B] whitespace-nowrap">
                      {new Date(sale.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Sale Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/70 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white border-3 border-[#111111] shadow-[6px_6px_0px_#111111] space-y-5">
            <h3 className="text-lg font-black text-[#111111]">Record New Sale</h3>
            <form onSubmit={handleCreateSale} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-[#111111]">Select Lead Customer *</label>
                <select
                  value={selectedLeadId}
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] text-xs font-bold text-[#111111] focus:outline-none focus:bg-white"
                >
                  {leadsOptions.map(l => (
                    <option key={l.id} value={l.id}>{l.email} (Source: {l.content_title})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-[#111111]">Sale Amount ($ USD) *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2 text-sm font-black text-[#111111]">$</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="0"
                    placeholder="299.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] text-sm font-black text-[#EC4899] focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-[#111111]">Transaction Status *</label>
                <select
                  value={status}
                  onChange={(e: any) => setStatus(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] text-xs font-bold text-[#111111] focus:outline-none focus:bg-white"
                >
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="refunded">Refunded</option>
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
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-[#EC4899] text-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111]"
                >
                  {submitting ? 'Recording...' : 'Record Sale'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
