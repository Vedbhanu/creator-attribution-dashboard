import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo';
    
    const contentList = await storage.getContent(userId);
    const metricsList = await storage.getAttributionMetrics(userId);
    
    return NextResponse.json({ success: true, data: contentList, metrics: metricsList });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, platform, url, tracking_slug, userId } = body;

    if (!title || !platform || !url || !tracking_slug) {
      return NextResponse.json({ success: false, error: 'Missing required fields: title, platform, url, tracking_slug' }, { status: 400 });
    }

    // Ensure slug formatting (lowercase, hyphens only)
    const sanitizedSlug = tracking_slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-');

    // Check if slug already exists
    const existing = await storage.getContentBySlug(sanitizedSlug);
    if (existing) {
      return NextResponse.json({ success: false, error: 'Tracking slug already in use. Please choose a unique slug.' }, { status: 400 });
    }

    const newContent = await storage.createContent({
      title: title.trim(),
      platform,
      url: url.trim(),
      tracking_slug: sanitizedSlug,
      user_id: userId || 'demo',
      published_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true, data: newContent }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
