import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

// 1. Fetch current video snippet from Google YouTube API
async function getYouTubeVideoSnippet(videoId: string, accessToken: string | null) {
  if (!accessToken) throw new Error('Google API Error (401): Unauthenticated (Access token missing)');
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      }
    }
  );
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google API Error (${res.status}): ${errText}`);
  }
  const data = await res.json();
  if (data.items && data.items.length > 0) {
    return data.items[0].snippet;
  }
  throw new Error(`Video with ID ${videoId} was not found on your YouTube channel.`);
}

// 2. Push updated video snippet back to Google YouTube API
async function updateYouTubeVideoSnippet(videoId: string, snippet: any, accessToken: string | null) {
  if (!accessToken) throw new Error('Google API Error (401): Unauthenticated (Access token missing)');
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
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google Update Error (${res.status}): ${errText}`);
  }
  return true;
}

// Helper to refresh Google OAuth Access Token using Refresh Token
async function refreshGoogleAccessToken(userId: string, refreshToken: string) {
  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      })
    });

    if (res.ok) {
      const data = await res.json();
      const newAccessToken = data.access_token;

      if (isSupabaseConfigured() && supabase) {
        await supabase
          .from('workspace_settings')
          .update({ youtube_access_token: newAccessToken })
          .eq('user_id', userId);
      }
      return newAccessToken;
    }
  } catch (err) {
    console.error('Failed to refresh Google Access Token:', err);
  }
  return null;
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
    let refreshToken: string | null = null;
    let autoInjectEnabled = false;

    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase
        .from('workspace_settings')
        .select('youtube_access_token, youtube_refresh_token, youtube_auto_inject')
        .eq('user_id', userId)
        .single();
      
      if (data) {
        accessToken = data.youtube_access_token;
        refreshToken = data.youtube_refresh_token;
        autoInjectEnabled = !!data.youtube_auto_inject;
      }
    }

    // 3. Fallback/Simulated Mode (Marc Lou Sandbox Delight)
    // If no real Google Access Token is configured yet or it is a mock sandbox token, we simulate the action successfully
    const isMockToken = accessToken && (accessToken.includes('mock') || accessToken.includes('debug'));
    if (!accessToken || !autoInjectEnabled || isMockToken) {
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
    try {
      let currentSnippet;
      try {
        currentSnippet = await getYouTubeVideoSnippet(videoId, accessToken);
      } catch (err: any) {
        // If unauthenticated (401) and we have a refresh token, try to refresh it
        if (err.message.includes('401') && refreshToken) {
          console.log('[OAUTH] Access token expired, attempting refresh...');
          const newAccessToken = await refreshGoogleAccessToken(userId, refreshToken);
          if (newAccessToken) {
            accessToken = newAccessToken;
            currentSnippet = await getYouTubeVideoSnippet(videoId, accessToken);
          } else {
            throw err;
          }
        } else {
          throw err;
        }
      }
      
      // Avoid injecting multiple times
      if (currentSnippet.description.includes(trackingUrl)) {
        return NextResponse.json({ success: true, message: 'Link already present in video description.' });
      }

      // Prepend the CTA snippet to the description
      const updatedDescription = `${customCta}\n\n${currentSnippet.description}`;
      
      // Sanitize snippet: Google YouTube API throws 403 Forbidden if read-only fields
      // (like channelId, channelTitle, publishedAt, localized, thumbnails) are included in PUT payload
      const updatedSnippet: any = {
        title: currentSnippet.title,
        description: updatedDescription,
        categoryId: currentSnippet.categoryId || '22'
      };
      if (currentSnippet.tags) updatedSnippet.tags = currentSnippet.tags;
      if (currentSnippet.defaultLanguage) updatedSnippet.defaultLanguage = currentSnippet.defaultLanguage;
      if (currentSnippet.defaultAudioLanguage) updatedSnippet.defaultAudioLanguage = currentSnippet.defaultAudioLanguage;

      try {
        await updateYouTubeVideoSnippet(videoId, updatedSnippet, accessToken);
      } catch (err: any) {
        // Retry once if token expired during update check
        if (err.message.includes('401') && refreshToken) {
          const newAccessToken = await refreshGoogleAccessToken(userId, refreshToken);
          if (newAccessToken) {
            await updateYouTubeVideoSnippet(videoId, updatedSnippet, newAccessToken);
          } else {
            throw err;
          }
        } else {
          throw err;
        }
      }

      return NextResponse.json({
        success: true,
        simulated: false,
        message: '✅ YouTube Description updated successfully live on your channel!',
        injectedCta: customCta
      });
    } catch (err: any) {
      return NextResponse.json({ success: false, error: err.message }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
