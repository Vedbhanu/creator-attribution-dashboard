'use client';

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Sparkles, ArrowRight, Check, X, ShieldCheck, DollarSign, Eye, Users, Trophy, Play, CheckCircle2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#111111] font-sans selection:bg-[#4A4FE0] selection:text-white">
      {/* Top Banner */}
      <div className="bg-[#F6D74C] border-b-3 border-[#111111] text-center py-2.5 px-4 font-extrabold text-xs sm:text-sm text-[#111111]">
        ⚡ Stop guessing which content makes money. Turn clicks into tracked sales.
      </div>

      {/* Navigation Header */}
      <header className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b-2 border-[#111111]/10">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#4A4FE0] text-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111] flex items-center justify-center font-black">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-black text-[#111111] tracking-tight">Creator Attrib</span>
            <span className="hidden sm:inline-block ml-2 text-xs font-bold px-2 py-0.5 rounded-full bg-[#F6D74C] text-[#111111] border border-[#111111]">
              By Ved Automation
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs font-extrabold text-[#111111] hover:text-[#4A4FE0] transition-colors px-2 py-1"
          >
            Sign In
          </Link>

          <Link
            href="/signup"
            className="px-5 py-2.5 rounded-xl bg-[#4A4FE0] hover:bg-[#3b40cc] text-white font-extrabold text-xs border-2 border-[#111111] shadow-[3px_3px_0px_#111111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#111111] transition-all"
          >
            Create Account →
          </Link>

          <Link
            href="/dashboard"
            className="hidden sm:inline-flex px-4 py-2.5 rounded-xl bg-[#F6D74C] hover:bg-white text-[#111111] font-extrabold text-xs border-2 border-[#111111] shadow-[3px_3px_0px_#111111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#111111] transition-all"
          >
            Live Demo
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center space-y-8">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111]">
          <div className="flex -space-x-2">
            <span className="w-7 h-7 rounded-full bg-[#4A4FE0] border-2 border-[#111111] text-[10px] font-black text-white flex items-center justify-center">YT</span>
            <span className="w-7 h-7 rounded-full bg-[#F6D74C] border-2 border-[#111111] text-[10px] font-black text-[#111111] flex items-center justify-center">X</span>
            <span className="w-7 h-7 rounded-full bg-[#111111] border-2 border-white text-[10px] font-black text-white flex items-center justify-center">NL</span>
          </div>
          <span className="text-xs font-extrabold text-[#111111]">
            Revenue-First Analytics for Creators & Solopreneurs
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-[#111111] tracking-tight leading-[1.15] max-w-4xl mx-auto">
          Discover which content <br />
          <span className="relative inline-block px-4 py-1.5 bg-[#4A4FE0] text-white rounded-xl border-2 border-[#111111] shadow-[4px_4px_0px_#111111] rotate-[-1deg]">
            actually makes you money.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-[#4B4B4B] font-semibold max-w-2xl mx-auto leading-relaxed">
          See exactly which YouTube video, X thread, or newsletter post brings in paying customers in real-time. Easy 30-second setup.
        </p>

        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://cal.com/ved-automation-contentleverage/creator-attribution"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#4A4FE0] hover:bg-[#3b40cc] text-white font-black text-base border-3 border-[#111111] shadow-[5px_5px_0px_#111111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#111111] transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 text-[#F6D74C] fill-[#F6D74C]" />
              <span>Schedule Strategy Call →</span>
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-extrabold text-[#4B4B4B] pt-2">
            <span className="flex items-center gap-1">
              <Check className="w-4 h-4 text-[#4A4FE0]" /> Full Done-For-You Setup
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Check className="w-4 h-4 text-[#4A4FE0]" /> Unlimited Content Links
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Check className="w-4 h-4 text-[#4A4FE0]" /> Revenue Leaderboard
            </span>
          </div>
        </div>

        {/* Preview Box */}
        <div className="pt-8">
          <Link href="/dashboard" className="block p-3 rounded-3xl bg-white border-3 border-[#111111] shadow-[8px_8px_0px_#111111] overflow-hidden max-w-4xl mx-auto hover:border-[#4A4FE0] transition-all group">
            <div className="flex items-center justify-between px-4 py-2 border-b-2 border-[#111111] bg-[#F7F4EC] rounded-t-2xl">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#4A4FE0] border border-[#111111]"></span>
                <span className="w-3 h-3 rounded-full bg-[#F6D74C] border border-[#111111]"></span>
                <span className="w-3 h-3 rounded-full bg-[#111111] border border-[#111111]"></span>
              </div>
              <span className="text-xs font-mono font-bold text-[#111111]">creator-attribution-dashboard.vercel.app/dashboard</span>
              <span className="text-xs font-bold text-[#4A4FE0] group-hover:underline">Click to Open Dashboard →</span>
            </div>

            <div className="p-6 bg-[#FDFCF8] text-left space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#4A4FE0] text-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111]">
                  <div className="text-[10px] font-black uppercase text-white/80">Total Attributed Revenue</div>
                  <div className="text-2xl font-black">$2,490.00</div>
                  <div className="text-[10px] font-bold text-white/90">Attributed directly to YouTube & X</div>
                </div>

                <div className="p-4 rounded-xl bg-white text-[#111111] border-2 border-[#111111] shadow-[3px_3px_0px_#111111]">
                  <div className="text-[10px] font-extrabold uppercase text-[#4B4B4B]">Visitors & Clicks</div>
                  <div className="text-2xl font-black">1,240</div>
                  <div className="text-[10px] font-bold text-[#4B4B4B]">Across 5 campaign links</div>
                </div>

                <div className="p-4 rounded-xl bg-[#F6D74C] text-[#111111] border-2 border-[#111111] shadow-[3px_3px_0px_#111111]">
                  <div className="text-[10px] font-extrabold uppercase text-[#111111]">Captured Leads</div>
                  <div className="text-2xl font-black">84 Leads</div>
                  <div className="text-[10px] font-bold text-[#111111]">6.7% Opt-in Conversion Rate</div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* PAIN VS SOLUTION */}
      <section className="border-t-3 border-[#111111] bg-[#F7F4EC] py-20 px-6">
        <div className="max-w-5xl mx-auto space-y-12 text-center">
          <div className="space-y-3">
            <span className="px-3.5 py-1 rounded-full bg-[#4A4FE0] text-white text-xs font-black border-2 border-[#111111] uppercase tracking-wider">
              The Old Way vs The Creator Way
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#111111]">
              Standard Analytics are built for engineers. <br />
              <span className="text-[#4A4FE0]">This is built for Creators.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="p-8 rounded-3xl bg-white border-3 border-[#111111] shadow-[5px_5px_0px_#111111] space-y-6">
              <div className="flex items-center justify-between border-b-2 border-[#111111] pb-4">
                <h3 className="text-xl font-black text-[#111111]">🚫 The Old Way</h3>
                <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-700 font-extrabold text-xs border border-rose-300">
                  Broken & Confusing
                </span>
              </div>
              <ul className="space-y-4 text-xs font-semibold text-[#4B4B4B]">
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <span>Google Analytics gives 100 complex charts but zero clarity on real sales.</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <span>You post 10 YouTube videos and have no idea which one brought in paying clients.</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <span>Visitors click your link today, but buy 2 weeks later—and you lose tracking.</span>
                </li>
              </ul>
            </div>

            <div className="p-8 rounded-3xl bg-[#4A4FE0] text-white border-3 border-[#111111] shadow-[5px_5px_0px_#111111] space-y-6">
              <div className="flex items-center justify-between border-b-2 border-[#111111] pb-4">
                <h3 className="text-xl font-black text-white">⚡ The Creator Attribution Way</h3>
                <span className="px-3 py-1 rounded-full bg-[#F6D74C] text-[#111111] font-black text-xs border border-[#111111]">
                  Simple & Clear
                </span>
              </div>
              <ul className="space-y-4 text-xs font-bold text-white">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#F6D74C] flex-shrink-0 mt-0.5" />
                  <span>1-Click tracking links for YouTube descriptions, X posts, Substack, and LinkedIn.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#F6D74C] flex-shrink-0 mt-0.5" />
                  <span>30-Day persistent visitor cookies match lead opt-ins directly back to content origin.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#F6D74C] flex-shrink-0 mt-0.5" />
                  <span>Ranked Revenue Leaderboard answering: <strong>"Which content makes me money?"</strong></span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3-STEP "HOW IT WORKS" */}
      <section className="py-20 px-6 max-w-5xl mx-auto space-y-12 text-center">
        <div className="space-y-3">
          <span className="px-3.5 py-1 rounded-full bg-[#F6D74C] text-[#111111] text-xs font-black border-2 border-[#111111] uppercase tracking-wider">
            Simple 3-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#111111]">
            Find your revenue opportunities in minutes
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-2xl bg-white border-2.5 border-[#111111] shadow-[4px_4px_0px_#111111] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#F6D74C] text-[#111111] border-2 border-[#111111] flex items-center justify-center font-black text-base">
              1
            </div>
            <h3 className="text-lg font-black text-[#111111]">1. Create Short Link</h3>
            <p className="text-xs font-semibold text-[#4B4B4B] leading-relaxed">
              Paste your YouTube video, X thread, or newsletter post URL to generate a clean short tracking link.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border-2.5 border-[#111111] shadow-[4px_4px_0px_#111111] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#4A4FE0] text-white border-2 border-[#111111] flex items-center justify-center font-black text-base">
              2
            </div>
            <h3 className="text-lg font-black text-[#111111]">2. Collect Leads & Clicks</h3>
            <p className="text-xs font-semibold text-[#4B4B4B] leading-relaxed">
              Visitors click your link and submit their email via your clean opt-in page or website.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#4A4FE0] text-white border-2.5 border-[#111111] shadow-[4px_4px_0px_#111111] space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#F6D74C] text-[#111111] border-2 border-[#111111] flex items-center justify-center font-black text-base">
              3
            </div>
            <h3 className="text-lg font-black text-white">3. See Which Posts Make Money</h3>
            <p className="text-xs font-bold text-white leading-relaxed">
              Watch exact dollar sales ($) map straight back to the specific YouTube video that generated them!
            </p>
          </div>
        </div>
      </section>

      {/* MANAGED SETUP CALL CTA (NO PRICING DISPLAYED) */}
      <section className="border-t-3 border-[#111111] bg-[#F6D74C] py-20 px-6">
        <div className="max-w-4xl mx-auto p-10 rounded-3xl bg-white border-3 border-[#111111] shadow-[8px_8px_0px_#111111] text-center space-y-8">
          <div className="space-y-3">
            <span className="px-4 py-1.5 rounded-full bg-[#4A4FE0] text-white text-xs font-black border-2 border-[#111111] uppercase tracking-wider">
              Turnkey Managed Setup
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#111111]">
              Ready to see which content makes you money?
            </h2>
            <p className="text-sm text-[#4B4B4B] font-semibold max-w-xl mx-auto">
              We handle 100% of the database setup, custom domain mapping, and dashboard configuration for you.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#F7F4EC] border-2 border-[#111111] max-w-md mx-auto space-y-4">
            <div className="space-y-1">
              <div className="text-xs font-extrabold text-[#4B4B4B] uppercase">Done-For-You Package</div>
              <div className="text-3xl font-black text-[#111111]">$1,000 <span className="text-sm font-bold text-[#4B4B4B]">one-time setup</span></div>
              <div className="text-xs font-bold text-[#4A4FE0]">+ $30–$50 / month managed hosting & support</div>
            </div>

            <ul className="text-xs font-bold text-[#111111] space-y-2 text-left pt-2 border-t border-[#111111]/20">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#4A4FE0]" /> 100% Turnkey Setup & Database Config</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#4A4FE0]" /> Unlimited Content Tracking Links</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#4A4FE0]" /> Hosted Public Lead Pages & API</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#4A4FE0]" /> Revenue Attribution Funnel Leaderboard</li>
            </ul>
          </div>

          <div className="pt-2">
            <a
              href="https://cal.com/ved-automation-contentleverage/creator-attribution"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#4A4FE0] hover:bg-[#3b40cc] text-white font-black text-base border-3 border-[#111111] shadow-[4px_4px_0px_#111111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#111111] transition-all"
            >
              <span>Schedule a Strategy Call →</span>
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t-3 border-[#111111] bg-[#F7F4EC] py-8 text-center text-xs font-bold text-[#111111] space-y-2">
        <p>© 2026 Creator Attribution Engine — Built by Ved Automation</p>
        <div className="flex items-center justify-center gap-4 text-[11px] text-[#4B4B4B]">
          <Link href="/dashboard" className="hover:underline">App Dashboard</Link>
          <span>•</span>
          <Link href="/login" className="hover:underline">Login</Link>
          <span>•</span>
          <Link href="/dashboard" className="hover:underline font-bold text-[#4A4FE0]">Open Dashboard</Link>
        </div>
      </footer>
    </div>
  );
}
