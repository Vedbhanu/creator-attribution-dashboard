import { ContentItem, Visitor, Lead, Sale, ContentAttributionMetrics, AnalyticsSummary } from '@/types/database';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// Seed Initial Data for Fallback/Testing Mode
const INITIAL_CONTENT: ContentItem[] = [
  {
    id: 'c-101',
    title: 'How I Built a $10k/mo Micro SaaS (Full Tutorial)',
    platform: 'YouTube',
    url: 'https://youtube.com/watch?v=demo101',
    tracking_slug: 'yt-saas-guide',
    published_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 7 * 86400000).toISOString()
  },
  {
    id: 'c-102',
    title: '5 AI Automation Tools Saving Me 20 Hours a Week',
    platform: 'Twitter/X',
    url: 'https://x.com/creator/status/demo102',
    tracking_slug: 'tw-ai-tools',
    published_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 'c-103',
    title: 'Issue #42: The Creator Attribution Blueprint',
    platform: 'Newsletter',
    url: 'https://newsletter.creator.com/p/issue-42',
    tracking_slug: 'nl-issue-42',
    published_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    created_at: new Date(Date.now() - 3 * 86400000).toISOString()
  }
];

const INITIAL_VISITORS: Visitor[] = [
  { id: 'v-1', cookie_id: 'ck_abc123', content_id: 'c-101', landing_page: 'https://youtube.com/watch?v=demo101', utm_source: 'youtube', utm_medium: 'description', utm_campaign: 'saas_launch', created_at: new Date(Date.now() - 6 * 86400000).toISOString() },
  { id: 'v-2', cookie_id: 'ck_xyz456', content_id: 'c-101', landing_page: 'https://youtube.com/watch?v=demo101', utm_source: 'youtube', utm_medium: 'card', utm_campaign: 'saas_launch', created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 'v-3', cookie_id: 'ck_tw789', content_id: 'c-102', landing_page: 'https://x.com/creator/status/demo102', utm_source: 'twitter', utm_medium: 'social', utm_campaign: 'ai_thread', created_at: new Date(Date.now() - 4 * 86400000).toISOString() },
  { id: 'v-4', cookie_id: 'ck_nl999', content_id: 'c-103', landing_page: 'https://newsletter.creator.com/p/issue-42', utm_source: 'substack', utm_medium: 'email', utm_campaign: 'weekly_issue', created_at: new Date(Date.now() - 2 * 86400000).toISOString() }
];

const INITIAL_LEADS: Lead[] = [
  { id: 'l-1', visitor_id: 'v-1', content_id: 'c-101', email: 'alex.smith@example.com', phone: '+15550192', created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 'l-2', visitor_id: 'v-3', content_id: 'c-102', email: 'maria.dev@example.com', phone: '+15550244', created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: 'l-3', visitor_id: 'v-4', content_id: 'c-103', email: 'jordan.growth@example.com', phone: '+15550988', created_at: new Date(Date.now() - 1 * 86400000).toISOString() }
];

const INITIAL_SALES: Sale[] = [
  { id: 's-1', lead_id: 'l-1', amount: 499.00, status: 'completed', created_at: new Date(Date.now() - 4 * 86400000).toISOString() },
  { id: 's-2', lead_id: 'l-2', amount: 199.00, status: 'completed', created_at: new Date(Date.now() - 2 * 86400000).toISOString() }
];

class StorageManager {
  private contentList: ContentItem[] = [...INITIAL_CONTENT];
  private visitorsList: Visitor[] = [...INITIAL_VISITORS];
  private leadsList: Lead[] = [...INITIAL_LEADS];
  private salesList: Sale[] = [...INITIAL_SALES];

  // CONTENT CRUD
  async getContent(): Promise<ContentItem[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('content').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        return data as ContentItem[];
      }
    }
    return [...this.contentList].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async getContentBySlug(slug: string): Promise<ContentItem | null> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('content').select('*').eq('tracking_slug', slug).single();
      if (!error && data) {
        return data as ContentItem;
      }
    }
    return this.contentList.find(c => c.tracking_slug === slug) || null;
  }

  async getContentById(id: string): Promise<ContentItem | null> {
    const memoryItem = this.contentList.find(c => c.id === id);
    if (memoryItem) return memoryItem;

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('content').select('*').eq('id', id).single();
      if (!error && data) {
        return data as ContentItem;
      }
    }
    return null;
  }

  async createContent(item: Omit<ContentItem, 'id' | 'created_at'>): Promise<ContentItem> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('content')
        .insert([{
          title: item.title,
          platform: item.platform,
          url: item.url,
          tracking_slug: item.tracking_slug,
          published_at: item.published_at || new Date().toISOString()
        }])
        .select()
        .single();

      if (!error && data) {
        return data as ContentItem;
      }
    }

    const newItem: ContentItem = {
      ...item,
      id: 'c-' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString()
    };
    this.contentList.unshift(newItem);
    return newItem;
  }

  async updateContent(id: string, partial: Partial<Omit<ContentItem, 'id' | 'created_at' | 'tracking_slug'>>): Promise<ContentItem | null> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('content')
        .update({
          title: partial.title,
          platform: partial.platform,
          url: partial.url
        })
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        return data as ContentItem;
      }
    }

    const index = this.contentList.findIndex(c => c.id === id);
    if (index !== -1) {
      this.contentList[index] = {
        ...this.contentList[index],
        ...(partial.title ? { title: partial.title } : {}),
        ...(partial.platform ? { platform: partial.platform } : {}),
        ...(partial.url ? { url: partial.url } : {})
      };
      return this.contentList[index];
    }
    return null;
  }

  async deleteContent(id: string): Promise<boolean> {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('content').delete().eq('id', id);
      if (!error) return true;
    }
    const initialLen = this.contentList.length;
    this.contentList = this.contentList.filter(c => c.id !== id);
    return this.contentList.length < initialLen;
  }

  // VISITOR TRACKING
  async addVisitor(visitor: Omit<Visitor, 'id' | 'created_at'>): Promise<Visitor> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('visitors')
        .insert([{
          cookie_id: visitor.cookie_id,
          content_id: visitor.content_id,
          landing_page: visitor.landing_page,
          utm_source: visitor.utm_source,
          utm_medium: visitor.utm_medium,
          utm_campaign: visitor.utm_campaign
        }])
        .select()
        .single();

      if (!error && data) {
        return data as Visitor;
      }
    }

    const newVisitor: Visitor = {
      ...visitor,
      id: 'v-' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString()
    };
    this.visitorsList.unshift(newVisitor);
    return newVisitor;
  }

  async getVisitors(): Promise<Visitor[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('visitors').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        return data as Visitor[];
      }
    }
    return [...this.visitorsList];
  }

  async getVisitorByCookie(cookieId: string): Promise<Visitor | null> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('visitors').select('*').eq('cookie_id', cookieId).order('created_at', { ascending: false }).limit(1).single();
      if (!error && data) {
        return data as Visitor;
      }
    }
    return this.visitorsList.find(v => v.cookie_id === cookieId) || null;
  }

  // LEADS
  async addLead(lead: Omit<Lead, 'id' | 'created_at'>): Promise<Lead> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('leads')
        .insert([{
          email: lead.email,
          phone: lead.phone,
          content_id: lead.content_id,
          visitor_id: lead.visitor_id
        }])
        .select()
        .single();

      if (!error && data) {
        return data as Lead;
      }
    }

    const newLead: Lead = {
      ...lead,
      id: 'l-' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString()
    };
    this.leadsList.unshift(newLead);
    return newLead;
  }

  async getLeads(): Promise<Lead[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        return data as Lead[];
      }
    }
    return [...this.leadsList].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // SALES
  async addSale(sale: Omit<Sale, 'id' | 'created_at'>): Promise<Sale> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('sales')
        .insert([{
          lead_id: sale.lead_id,
          amount: sale.amount,
          status: sale.status
        }])
        .select()
        .single();

      if (!error && data) {
        return data as Sale;
      }
    }

    const newSale: Sale = {
      ...sale,
      id: 's-' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString()
    };
    this.salesList.unshift(newSale);
    return newSale;
  }

  async getSales(): Promise<Sale[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('sales').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        return data as Sale[];
      }
    }
    return [...this.salesList].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // ATTRIBUTION METRICS COMPUTATION
  async getAttributionMetrics(): Promise<ContentAttributionMetrics[]> {
    const contentItems = await this.getContent();
    const visitorsList = await this.getVisitors();
    const leadsList = await this.getLeads();
    const salesList = await this.getSales();

    return contentItems.map(content => {
      const contentVisitors = visitorsList.filter(v => v.content_id === content.id);
      const contentLeads = leadsList.filter(l => l.content_id === content.id);
      const leadIds = new Set(contentLeads.map(l => l.id));

      const contentSales = salesList.filter(s => leadIds.has(s.lead_id) && s.status === 'completed');
      const totalRevenue = contentSales.reduce((acc, s) => acc + Number(s.amount), 0);

      const visitorsCount = contentVisitors.length;
      const leadsCount = contentLeads.length;
      const salesCount = contentSales.length;

      const visitorToLeadCr = visitorsCount > 0 ? Number(((leadsCount / visitorsCount) * 100).toFixed(1)) : 0;
      const leadToSaleCr = leadsCount > 0 ? Number(((salesCount / leadsCount) * 100).toFixed(1)) : 0;

      return {
        content,
        visitors_count: visitorsCount,
        leads_count: leadsCount,
        sales_count: salesCount,
        total_revenue: totalRevenue,
        visitor_to_lead_cr: visitorToLeadCr,
        lead_to_sale_cr: leadToSaleCr
      };
    });
  }

  // DASHBOARD OVERVIEW SUMMARY
  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    const metrics = await this.getAttributionMetrics();
    const visitorsList = await this.getVisitors();
    const leadsList = await this.getLeads();
    const salesList = await this.getSales();

    const totalVisitors = visitorsList.length;
    const totalLeads = leadsList.length;
    const completedSales = salesList.filter(s => s.status === 'completed');
    const totalSales = completedSales.length;
    const totalRevenue = completedSales.reduce((acc, s) => acc + Number(s.amount), 0);

    const overallConversionRate = totalVisitors > 0 
      ? Number(((totalSales / totalVisitors) * 100).toFixed(1)) 
      : 0;

    const platformBreakdown: Record<string, { revenue: number; leads: number; content_count: number }> = {};

    metrics.forEach(m => {
      const platform = m.content.platform;
      if (!platformBreakdown[platform]) {
        platformBreakdown[platform] = { revenue: 0, leads: 0, content_count: 0 };
      }
      platformBreakdown[platform].revenue += m.total_revenue;
      platformBreakdown[platform].leads += m.leads_count;
      platformBreakdown[platform].content_count += 1;
    });

    return {
      total_content_items: metrics.length,
      total_visitors: totalVisitors,
      total_leads: totalLeads,
      total_sales: totalSales,
      total_revenue: totalRevenue,
      overall_conversion_rate: overallConversionRate,
      platform_breakdown: platformBreakdown
    };
  }
}

export const storage = new StorageManager();
