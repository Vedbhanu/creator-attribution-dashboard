import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

// 1. Fetch current video snippet from Google YouTube API
async function getYouTubeVideoSnippet(videoId: string, accessToken: string) {
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json'
        }
      }
    );
    if (res.ok) {
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        return data.items[0].snippet;
      }
    }
  } catch (err) {
    console.error('Failed to fetch YouTube video details:', err);
  }
  return null;
}

// 2. Push updated video snippet back to Google YouTube API
async function updateYouTubeVideoSnippet(videoId: string, snippet: any, accessToken: string) {
  try {
    const res = await fetch(
      'https://www.googleapis.com/youtube/v3/videos?part=snippet',
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          id: videoId,
          snippet: snippet
        })
      }
    );
    return res.ok;
  } catch (err) {
    console.error('Failed to update YouTube video description:', err);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, videoId, trackingSlug, ctaTemplate } = body;

    if (!userId || userId === 'demo') {
      return NextResponse.json({ success: false, error: 'Cannot inject links in Demo Sandbox mode.' }, { status: 403 });
    }

    const domain = request.headers.get('origin') || 'https://creator-attribution-dashboard.vercel.app';
    const trackingUrl = `${domain}/r/${trackingSlug}`;
    const customCta = (ctaTemplate || '🔥 Get Priority Access here 👉 {tracking_link}').replace('{tracking_link}', trackingUrl);

    // Retrieve Workspace Settings to get Google OAuth token
    let accessToken: string | null = null;
    let autoInjectEnabled = false;

    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase
        .from('workspace_settings')
        .select('youtube_access_token, youtube_auto_inject')
        .eq('user_id', userId)
        .single();
      
      if (data) {
        accessToken = data.youtube_access_token;
        autoInjectEnabled = !!data.youtube_auto_inject;
      }
    }

    // 3. Fallback/Simulated Mode (Marc Lou Sandbox Delight)
    // If no real Google Access Token is configured yet, we simulate the action successfully so they can inspect & test immediately
    if (!accessToken || !autoInjectEnabled) {
      console.log(`[SIMULATION] Injecting tracking link into video: ${videoId}`);
      console.log(`[SIMULATION] CTA Snippet: ${customCta}`);
      
      return NextResponse.json({
        success: true,
        simulated: true,
        message: '⚡ [Sandbox Simulation Mode] CTA Link successfully injected into YouTube description!',
        injectedCta: customCta
      });
    }

    // 4. Live Production API execution
    const currentSnippet = await getYouTubeVideoSnippet(videoId, accessToken);
    if (!currentSnippet) {
      return NextResponse.json({ success: false, error: 'Could not fetch video details from YouTube API. Verify OAuth permissions.' }, { status: 400 });
    }

    // Avoid injecting multiple times
    if (currentSnippet.description.includes(trackingUrl)) {
      return NextResponse.json({ success: true, message: 'Link already present in video description.' });
    }

    // Prepend the CTA snippet to the description
    const updatedDescription = `${customCta}\n\n${currentSnippet.description}`;
    const updatedSnippet = {
      ...currentSnippet,
      description: updatedDescription
    };

    const success = await updateYouTubeVideoSnippet(videoId, updatedSnippet, accessToken);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Failed to update video description on YouTube.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      simulated: false,
      message: '✅ YouTube Description updated successfully live on your channel!',
      injectedCta: customCta
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
