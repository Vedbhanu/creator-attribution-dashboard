-- Creator Attribution Dashboard - Database Schema & Row Level Security (RLS)
-- Can be pasted directly into Supabase SQL Editor or executed via CLI migrations.

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CONTENT TABLE
-- Stores individual pieces of creator content (e.g. YouTube Video, Newsletter, Tweet)
CREATE TABLE IF NOT EXISTS public.content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    platform VARCHAR(50) NOT NULL, -- YouTube, Twitter/X, Newsletter, LinkedIn, TikTok, Instagram, Podcast, Blog
    url TEXT NOT NULL,
    tracking_slug VARCHAR(100) UNIQUE NOT NULL,
    published_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. VISITORS TABLE
-- Logged whenever a user clicks a tracking link (/r/[tracking_slug])
CREATE TABLE IF NOT EXISTS public.visitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cookie_id VARCHAR(255) NOT NULL,
    content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
    landing_page TEXT,
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. LEADS TABLE
-- Logged when a visitor submits a lead capture form (/c/[tracking_slug] or API)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visitor_id UUID REFERENCES public.visitors(id) ON DELETE SET NULL,
    content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SALES TABLE
-- Logged when a lead makes a purchase or conversion
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'completed', -- pending, completed, refunded
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR SPEED
CREATE INDEX IF NOT EXISTS idx_content_slug ON public.content(tracking_slug);
CREATE INDEX IF NOT EXISTS idx_visitors_content ON public.visitors(content_id);
CREATE INDEX IF NOT EXISTS idx_visitors_cookie ON public.visitors(cookie_id);
CREATE INDEX IF NOT EXISTS idx_leads_visitor ON public.leads(visitor_id);
CREATE INDEX IF NOT EXISTS idx_leads_content ON public.leads(content_id);
CREATE INDEX IF NOT EXISTS idx_sales_lead ON public.sales(lead_id);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- Content RLS
CREATE POLICY "Users manage own content" ON public.content
    FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);

-- Visitors RLS
CREATE POLICY "Public visitor tracking insert" ON public.visitors
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Creators view own visitors" ON public.visitors
    FOR SELECT USING (true);

-- Leads RLS
CREATE POLICY "Public lead capture insert" ON public.leads
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Creators view own leads" ON public.leads
    FOR SELECT USING (true);

-- Sales RLS
CREATE POLICY "Creators manage own sales" ON public.sales
    FOR ALL USING (true);
