import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { storage } from '@/lib/storage';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tracking_slug, utm_source, utm_medium, utm_campaign, landing_page } = body;

    if (!tracking_slug) {
      return NextResponse.json({ success: false, error: 'Missing tracking_slug' }, { status: 400 });
    }

    const content = await storage.getContentBySlug(tracking_slug);
    if (!content) {
      return NextResponse.json({ success: false, error: 'Invalid tracking slug' }, { status: 404 });
    }

    const cookieStore = cookies();
    let visitorCookieId = cookieStore.get('creator_visitor_id')?.value;

    if (!visitorCookieId) {
      visitorCookieId = 'ck_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
    }

    const visitor = await storage.addVisitor({
      cookie_id: visitorCookieId,
      content_id: content.id,
      landing_page: landing_page || content.url,
      utm_source: utm_source || content.platform.toLowerCase(),
      utm_medium: utm_medium || 'api_pixel',
      utm_campaign: utm_campaign || 'direct'
    });

    const response = NextResponse.json({ success: true, data: visitor, cookie_id: visitorCookieId });
    
    response.cookies.set('creator_visitor_id', visitorCookieId, {
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      sameSite: 'lax',
      httpOnly: false
    });

    response.cookies.set('creator_last_content_id', content.id, {
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      sameSite: 'lax',
      httpOnly: false
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
