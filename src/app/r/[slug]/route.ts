import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { storage } from '@/lib/storage';

async function fetchYouTubeVideoTitle(videoId: string): Promise<string | null> {
  try {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`, {
      next: { revalidate: 86400 } // Cache metadata for 24h
    });
    if (res.ok) {
      const data = await res.json();
      return data.title || null;
    }
  } catch (err) {
    console.warn('oEmbed fetch note for video:', videoId, err);
  }
  return null;
}

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

    // Inspect HTTP Referer header & query params for Smart Referer Auto-Attribution
    const referer = request.headers.get('referer') || request.headers.get('referrer') || searchParams.get('ref_url') || '';
    
    // Lookup base content item by tracking slug
    let content = await storage.getContentBySlug(slug);

    // SMART REFERER AUTO-ATTRIBUTION ENGINE:
    // Extract YouTube video ID if click originated from a specific YouTube video watch page or shorts
    const ytMatch = referer.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
    
    if (ytMatch && ytMatch[1]) {
      const videoId = ytMatch[1];
      const videoSlug = `yt-${videoId}`;
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

      // Check if this specific video has already been registered in storage
      let autoContent = await storage.getContentBySlug(videoSlug);

      if (!autoContent) {
        // Fetch official video title via public oEmbed API (0 API key required)
        const fetchedTitle = await fetchYouTubeVideoTitle(videoId);
        const ownerUserId = (content as any)?.user_id || 'demo';

        // Auto-register video item on-the-fly
        autoContent = await storage.createContent({
          title: fetchedTitle ? `⚡ ${fetchedTitle}` : `YouTube Video (${videoId})`,
          platform: 'YouTube',
          url: videoUrl,
          destination_url: content ? (content.destination_url || content.url) : undefined,
          tracking_slug: videoSlug,
          user_id: ownerUserId,
          published_at: new Date().toISOString()
        });
      }

      if (autoContent) {
        content = autoContent;
      }
    }

    if (!content) {
      // If slug doesn't exist, redirect to home page
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Check or generate visitor cookie ID
    const cookieStore = cookies();
    let visitorCookieId = cookieStore.get('creator_visitor_id')?.value;

    if (!visitorCookieId) {
      visitorCookieId = 'ck_' + crypto.randomUUID();
    }

    // Record visitor click in database with real-time content attribution
    await storage.addVisitor({
      cookie_id: visitorCookieId,
      content_id: content.id,
      landing_page: content.destination_url || content.url,
      utm_source: utmSource || (ytMatch ? 'youtube_auto' : content.platform.toLowerCase()),
      utm_medium: utmMedium || 'tracking_link',
      utm_campaign: utmCampaign || slug
    });

    // Prepare redirect response to destination URL
    let destinationUrl = content.destination_url || content.url;

    // Sanitize destination URL to ensure valid http/https protocol
    if (!destinationUrl.startsWith('http://') && !destinationUrl.startsWith('https://')) {
      destinationUrl = `https://${destinationUrl}`;
    }

    // Append UTM params & ref_slug to destination URL if valid
    try {
      const destObj = new URL(destinationUrl);
      if (utmSource) destObj.searchParams.set('utm_source', utmSource);
      if (utmMedium) destObj.searchParams.set('utm_medium', utmMedium);
      if (utmCampaign) destObj.searchParams.set('utm_campaign', utmCampaign);
      destObj.searchParams.set('ref_slug', content.tracking_slug);
      destinationUrl = destObj.toString();
    } catch (e) {
      // Fallback to sanitized URL
    }

    const response = NextResponse.redirect(destinationUrl, 302);

    // Set persistent 30-day visitor tracking cookie
    response.cookies.set('creator_visitor_id', visitorCookieId, {
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      sameSite: 'lax',
      httpOnly: false
    });

    // Set content_id cookie so lead forms know which content brought them
    response.cookies.set('creator_last_content_id', content.id, {
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      sameSite: 'lax',
      httpOnly: false
    });

    return response;
  } catch (error: any) {
    console.error('Smart Referer Tracking error:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}
