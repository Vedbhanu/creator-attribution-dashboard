'use client';

import { useState, useEffect } from 'react';
import { ContentItem } from '@/types/database';
import { Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Mail, Phone, ExternalLink } from 'lucide-react';

export default function HostedLeadCapturePage({ params }: { params: { slug: string } }) {
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(2);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContentInfo();
  }, [params.slug]);

  const fetchContentInfo = async () => {
    try {
      const res = await fetch(`/api/content?slug=${encodeURIComponent(params.slug)}`);
      const json = await res.json();
      if (json.success && json.data) {
        setContent(json.data);
      }
    } catch (err) {
      console.error('Failed to load content for lead capture:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          phone,
          tracking_slug: params.slug,
          content_id: content?.id
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to submit lead.');
      }

      setSubmitted(true);
      const targetRedirect = content?.destination_url || content?.url;
      
      // 2-second countdown timer with progress bar
      if (targetRedirect) {
        let timer = 2;
        const interval = setInterval(() => {
          timer -= 1;
          setCountdown(timer);
          if (timer <= 0) {
            clearInterval(interval);
            window.location.href = targetRedirect;
          }
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center text-[#111111] text-xs font-bold">
        Loading offer details...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#111111] flex flex-col justify-between">
      {/* Top Banner */}
      <div className="bg-[#F6D74C] border-b-3 border-[#111111] text-center py-2.5 px-4 font-extrabold text-xs text-[#111111]">
        ⚡ Priority Access Form — Instant Attribution Verified
      </div>

      <div className="flex-1 flex items-center justify-center p-4 my-8">
        <div className="w-full max-w-lg p-8 rounded-3xl bg-white border-3 border-[#111111] shadow-[6px_6px_0px_#111111] space-y-6">
          {submitted ? (
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 rounded-full bg-[#EC4899] text-white border-2 border-[#111111] shadow-[3px_3px_0px_#111111] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-[#111111]">Access Granted!</h2>
                <p className="text-xs text-[#4B4B4B] font-bold">
                  Your lead details have been attributed. Access link sent to <span className="text-[#4A4FE0] font-black">{email}</span>.
                </p>
              </div>

              {/* Smooth Visual Progress Bar */}
              <div className="p-4 rounded-2xl bg-[#F7F4EC] border-2 border-[#111111] space-y-2 text-left">
                <div className="flex justify-between text-xs font-extrabold text-[#111111]">
                  <span>Redirecting to Offer Page...</span>
                  <span className="text-[#EC4899]">{countdown}s</span>
                </div>
                <div className="h-3 rounded-full bg-white border-2 border-[#111111] overflow-hidden">
                  <div 
                    className="h-full bg-[#EC4899] transition-all duration-1000"
                    style={{ width: `${(countdown / 2) * 100}%` }}
                  ></div>
                </div>
              </div>

              {(content?.destination_url || content?.url) && (
                <a
                  href={content.destination_url || content.url}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#EC4899] hover:bg-[#D6317C] text-white font-black text-sm border-2 border-[#111111] shadow-[4px_4px_0px_#111111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#111111] transition-all"
                >
                  Click Here to Redirect Now <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header Badge & Title */}
              <div className="space-y-3 text-center">
                <span className="inline-block bg-[#4A4FE0] text-white font-extrabold text-xs uppercase px-4 py-1.5 rounded-full border-2 border-[#111111] shadow-[2px_2px_0px_#111111]">
                  {content?.platform || 'Exclusive Offer'}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight leading-tight">
                  {content ? content.title : 'Get Priority Access'}
                </h1>
                <p className="text-xs text-[#4B4B4B] font-semibold max-w-md mx-auto">
                  Enter your details below to join the priority list and receive instant access.
                </p>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-[#EC4899]/10 border-2 border-[#EC4899] text-[#111111] text-xs font-bold">
                  {error}
                </div>
              )}

              {/* Lead Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-[#111111]">Email Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-[#111111]" />
                    <input
                      type="email"
                      required
                      placeholder="alex@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] text-sm text-[#111111] font-bold focus:outline-none focus:bg-white transition-all placeholder:text-[#8A8A8A]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-[#111111]">Phone Number (Optional)</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-[#111111]" />
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#F7F4EC] border-2 border-[#111111] text-sm text-[#111111] font-bold focus:outline-none focus:bg-white transition-all placeholder:text-[#8A8A8A]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-xl bg-[#EC4899] hover:bg-[#D6317C] text-white font-black text-sm border-2 border-[#111111] shadow-[4px_4px_0px_#111111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#111111] transition-all disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Claim Priority Access Now →'}
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#4B4B4B] font-bold pt-2">
                  <ShieldCheck className="w-4 h-4 text-[#4A4FE0]" />
                  <span>100% Secure. Zero spam guarantee.</span>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t-3 border-[#111111] bg-[#F7F4EC] py-4 text-center text-xs font-bold text-[#111111]">
        Powered by Creator Attribution Engine
      </footer>
    </div>
  );
}
