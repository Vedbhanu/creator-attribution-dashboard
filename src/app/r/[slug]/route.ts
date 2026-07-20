import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { storage } from '@/lib/storage';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;
    const { searchParams } = new URL(request.url);

    // Parse UTM query parameters
    const utmSource = searchParams.get('utm_source') || searchParams.get('source') || undefined;
    const utmMedium = searchParams.get('utm_medium') || searchParams.get('medium') || undefined;
    const utmCampaign = searchParams.get('utm_campaign') || searchParams.get('campaign') || undefined;

    // Lookup content item by tracking slug
    const content = await storage.getContentBySlug(slug);

    if (!content) {
      // If slug doesn't exist, redirect to home page or show 404
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Check or generate visitor cookie ID
    const cookieStore = cookies();
    let visitorCookieId = cookieStore.get('creator_visitor_id')?.value;

    if (!visitorCookieId) {
      visitorCookieId = 'ck_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
    }

    // Record visitor click in database
    await storage.addVisitor({
      cookie_id: visitorCookieId,
      content_id: content.id,
      landing_page: content.url,
      utm_source: utmSource || content.platform.toLowerCase(),
      utm_medium: utmMedium || 'tracking_link',
      utm_campaign: utmCampaign || 'attribution_mvp'
    });

    // Prepare redirect response to original target URL
    let destinationUrl = content.url;

    // Append UTM params to destination URL if valid URL
    try {
      const destObj = new URL(destinationUrl);
      if (utmSource) destObj.searchParams.set('utm_source', utmSource);
      if (utmMedium) destObj.searchParams.set('utm_medium', utmMedium);
      if (utmCampaign) destObj.searchParams.set('utm_campaign', utmCampaign);
      // Pass content tracking slug for cross-domain attribution
      destObj.searchParams.set('ref_slug', slug);
      destinationUrl = destObj.toString();
    } catch (e) {
      // If content.url is relative or non-standard, use raw URL
    }

    const response = NextResponse.redirect(destinationUrl, 302);

    // Set persistent 30-day visitor tracking cookie
    response.cookies.set('creator_visitor_id', visitorCookieId, {
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      sameSite: 'lax',
      httpOnly: false // Accessible for lead capture form javascript if needed
    });

    // Also set content_id cookie so lead forms know which content brought them
    response.cookies.set('creator_last_content_id', content.id, {
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      sameSite: 'lax',
      httpOnly: false
    });

    return response;
  } catch (error: any) {
    console.error('Tracking redirect error:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}
