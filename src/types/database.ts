export type PlatformType = 
  | 'YouTube' 
  | 'Twitter/X' 
  | 'Newsletter' 
  | 'LinkedIn' 
  | 'TikTok' 
  | 'Instagram' 
  | 'Podcast' 
  | 'Blog' 
  | 'Other';

export interface ContentItem {
  id: string;
  user_id?: string;
  title: string;
  platform: PlatformType;
  url: string;
  tracking_slug: string;
  published_at: string;
  created_at: string;
  updated_at?: string;
}

export interface Visitor {
  id: string;
  cookie_id: string;
  content_id: string;
  landing_page?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  created_at: string;
}

export interface Lead {
  id: string;
  visitor_id?: string;
  content_id: string;
  email: string;
  phone?: string;
  created_at: string;
}

export interface Sale {
  id: string;
  lead_id: string;
  amount: number;
  status: 'completed' | 'pending' | 'refunded';
  created_at: string;
}

// Joined analytics view model
export interface ContentAttributionMetrics {
  content: ContentItem;
  visitors_count: number;
  leads_count: number;
  sales_count: number;
  total_revenue: number;
  visitor_to_lead_cr: number; // Conversion rate %
  lead_to_sale_cr: number;    // Conversion rate %
}

export interface AnalyticsSummary {
  total_content_items: number;
  total_visitors: number;
  total_leads: number;
  total_sales: number;
  total_revenue: number;
  overall_conversion_rate: number;
  platform_breakdown: Record<string, { revenue: number; leads: number; content_count: number }>;
}
