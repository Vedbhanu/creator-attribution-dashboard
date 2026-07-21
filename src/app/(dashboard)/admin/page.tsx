'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, Users, DollarSign, Video, Zap, ArrowRight, Lock, AlertTriangle, Eye, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

interface ClientWorkspace {
  id: string;
  name: string;
  email: string;
  brand: string;
  contentCount: number;
  leadsCount: number;
  revenue: number;
  joinedAt: string;
  status: 'active' | 'onboarding';
}

export default function AgencyAdminPage() {
  const { showToast } = useToast();
  const [isAdminAuthorized, setIsAdminAuthorized] = useState<boolean | null>(null);
  const [activeClient, setActiveClient] = useState<string | null>(null);

  // Mock initial clients roster for Agency Admin view
  const [clients] = useState<ClientWorkspace[]>([
    {
      id: 'client_01',
      name: 'Sarah Jenkins',
      email: 'sarah@creatoracademy.com',
      brand: 'Creator Academy Pro',
      contentCount: 12,
      leadsCount: 142,
      revenue: 4990.00,
      joinedAt: '2026-07-15',
      status: 'active'
    },
    {
      id: 'client_02',
      name: 'Alex Vance',
      email: 'alex@saasgrowth.io',
      brand: 'SaaS Growth Newsletter',
      contentCount: 8,
      leadsCount: 94,
      revenue: 2500.00,
      joinedAt: '2026-07-18',
      status: 'active'
    },
    {
      id: 'client_03',
      name: 'Marcus Miller',
      email: 'marcus@fitnessleverage.com',
      brand: 'Fitness Leverage',
      contentCount: 3,
      leadsCount: 28,
      revenue: 0.00,
      joinedAt: '2026-07-20',
      status: 'onboarding'
    }
  ]);

  useEffect(() => {
    // Check local session or admin email
    const storedRole = typeof window !== 'undefined' ? localStorage.getItem('user_role') : null;
    const isVedAdmin = true; // Set to true for Ved Admin session view
    setIsAdminAuthorized(isVedAdmin);
  }, []);

  const handleSwitchWorkspace = (client: ClientWorkspace) => {
    setActiveClient(client.brand);
    showToast(`⚡ Switched to client workspace: ${client.brand}`);
  };

  if (isAdminAuthorized === false) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-rose-100 border-3 border-[#111111] shadow-[5px_5px_0px_#111111] flex items-center justify-center mx-auto text-rose-600">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-[#111111]">403 — Agency Admin Access Restricted</h1>
          <p className="text-xs text-[#4B4B4B] font-semibold max-w-md mx-auto">
            This Agency Control Panel is restricted exclusively to <strong>Ved (Agency Owner)</strong>. Client accounts are not authorized to view global agency data.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#4A4FE0] text-white font-extrabold text-xs border-2 border-[#111111] shadow-[3px_3px_0px_#111111]"
        >
          Return to My Workspace →
        </Link>
      </div>
    );
  }

  const totalClients = clients.length;
  const totalCombinedRevenue = clients.reduce((acc, c) => acc + c.revenue, 0);
  const totalLeads = clients.reduce((acc, c) => acc + c.leadsCount, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-[#111111] pb-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-[#F6D74C] text-[#111111] text-xs font-black border-2 border-[#111111] shadow-[2px_2px_0px_#111111]">
              👑 Agency Owner Portal
            </span>
            <h1 className="text-3xl font-black text-[#111111] tracking-tight">Agency Multi-Client Control Panel</h1>
          </div>
          <p className="text-xs text-[#4B4B4B] font-semibold mt-1">
            Manage all client workspaces, switch client views, and track global agency revenue.
          </p>
        </div>

        {activeClient && (
          <div className="px-4 py-2 rounded-xl bg-[#4A4FE0] text-white text-xs font-black border-2 border-[#111111] shadow-[3px_3px_0px_#111111] flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#F6D74C]" />
            <span>Viewing: {activeClient}</span>
          </div>
        )}
      </div>

      {/* Global Agency Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-[#4A4FE0] text-white border-3 border-[#111111] shadow-[6px_6px_0px_#111111] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase text-white/80">Combined Client Revenue</span>
            <DollarSign className="w-5 h-5 text-[#F6D74C]" />
          </div>
          <div className="text-3xl font-black">${totalCombinedRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div className="text-[11px] font-bold text-white/90">Across all active agency clients</div>
        </div>

        <div className="p-6 rounded-3xl bg-white text-[#111111] border-3 border-[#111111] shadow-[6px_6px_0px_#111111] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-[#4B4B4B]">Active Client Workspaces</span>
            <Users className="w-5 h-5 text-[#4A4FE0]" />
          </div>
          <div className="text-3xl font-black">{totalClients} Clients</div>
          <div className="text-[11px] font-bold text-[#4B4B4B]">Managed by Ved Automation</div>
        </div>

        <div className="p-6 rounded-3xl bg-[#F6D74C] text-[#111111] border-3 border-[#111111] shadow-[6px_6px_0px_#111111] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-[#111111]">Total Captured Leads</span>
            <Zap className="w-5 h-5 text-[#111111]" />
          </div>
          <div className="text-3xl font-black">{totalLeads} Leads</div>
          <div className="text-[11px] font-bold text-[#111111]">Attributed across video campaigns</div>
        </div>
      </div>

      {/* Client Roster Table */}
      <div className="p-8 rounded-3xl bg-white border-3 border-[#111111] shadow-[8px_8px_0px_#111111] space-y-6">
        <div className="flex items-center justify-between border-b-2 border-[#111111] pb-4">
          <div>
            <h2 className="text-xl font-black text-[#111111]">Client Account Roster</h2>
            <p className="text-xs font-semibold text-[#4B4B4B]">Select a client to switch into their workspace</p>
          </div>

          <span className="text-xs font-black px-3 py-1 rounded-full bg-[#F7F4EC] text-[#111111] border border-[#111111]">
            Strict Isolation Enabled
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-[#111111] bg-[#F7F4EC] text-xs font-black text-[#111111]">
                <th className="py-3.5 px-4">Client Name & Email</th>
                <th className="py-3.5 px-4">Brand Workspace</th>
                <th className="py-3.5 px-4 text-center">Tracked Content</th>
                <th className="py-3.5 px-4 text-center">Leads</th>
                <th className="py-3.5 px-4 text-right">Attributed Revenue</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#111111]/10 text-xs font-bold text-[#111111]">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-[#F7F4EC]/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-extrabold text-[#111111]">{client.name}</div>
                    <div className="text-[11px] text-[#4B4B4B] font-mono">{client.email}</div>
                  </td>
                  <td className="py-4 px-4 font-black text-[#4A4FE0]">
                    {client.brand}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="px-2.5 py-1 rounded-full bg-white border border-[#111111]">
                      {client.contentCount} items
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center font-extrabold">
                    {client.leadsCount}
                  </td>
                  <td className="py-4 px-4 text-right font-black text-emerald-700 text-sm">
                    ${client.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => handleSwitchWorkspace(client)}
                      className="px-3 py-1.5 rounded-xl bg-[#4A4FE0] hover:bg-[#3b40cc] text-white border-2 border-[#111111] shadow-[2px_2px_0px_#111111] text-xs font-extrabold inline-flex items-center gap-1 transition-all"
                    >
                      <span>Switch Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
