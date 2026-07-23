import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { generateShortSlug } from '@/lib/utils';

// 1. Resolve custom handles (@Handle) or channel URLs to raw YouTube channel IDs
async function resolveChannelId(urlOrHandle: string): Promise<string | null> {
  const clean = urlOrHandle.trim();
  if (/^UC[a-zA-Z0-9_-]{22}$/.test(clean)) {
    return clean;
  }
  const idMatch = clean.match(/channel_id=(UC[a-zA-Z0-9_-]{22})/);
  if (idMatch) return idMatch[1];

  const pathMatch = clean.match(/\/channel\/(UC[a-zA-Z0-9_-]{22})/);
  if (pathMatch) return pathMatch[1];

  try {
    let targetUrl = clean;
    if (clean.startsWith('@')) {
      targetUrl = `https://www.youtube.com/${clean}`;
    } else if (!clean.startsWith('http')) {
      targetUrl = `https://www.youtube.com/@${clean}`;
    }

    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (res.ok) {
      const html = await res.text();
      const metaMatch = html.match(/itemprop="channelId"\s+content="(UC[a-zA-Z0-9_-]{22})"/i) ||
                        html.match(/"channelId":"(UC[a-zA-Z0-9_-]{22})"/i) ||
                        html.match(/href="https:\/\/www\.youtube\.com\/feeds\/videos\.xml\?channel_id=(UC[a-zA-Z0-9_-]{22})"/i);
      if (metaMatch) return metaMatch[1];
    }
  } catch (err) {
    console.error('Failed to resolve YouTube channel handle:', err);
  }
  return null;
}

// 2. Fetch and parse the channel's XML feed (RegExp based, lightweight, zero-dependency)
async function fetchVideosFromRss(channelId: string): Promise<{ id: string; title: string; url: string }[]> {
  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const xml = await res.text();
      const entries: { id: string; title: string; url: string }[] = [];
      const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
      let match;
      while ((match = entryRegex.exec(xml)) !== null) {
        const entryContent = match[1];
        const videoIdMatch = entryContent.match(/<yt:videoId>(.*?)<\/yt:videoId>/) ||
                             entryContent.match(/<id>yt:video:(.*?)<\/id>/);
        const titleMatch = entryContent.match(/<title>(.*?)<\/title>/);
        
        if (videoIdMatch && titleMatch) {
          const videoId = videoIdMatch[1];
          const rawTitle = titleMatch[1];
          const title = rawTitle
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'");

          entries.push({
            id: videoId,
            title,
            url: `https://www.youtube.com/watch?v=${videoId}`
          });
        }
      }
      return entries;
    }
  } catch (err) {
    console.error('Failed to fetch videos from RSS feed:', err);
  }
  return [];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, youtube_channel_url } = body;

    if (!userId || userId === 'demo') {
      return NextResponse.json({ success: false, error: 'Cannot sync channel in Demo Sandbox mode.' }, { status: 403 });
    }

    if (!youtube_channel_url) {
      return NextResponse.json({ success: false, error: 'Missing YouTube Channel URL or Handle.' }, { status: 400 });
    }

    const channelId = await resolveChannelId(youtube_channel_url);
    if (!channelId) {
      return NextResponse.json({ success: false, error: 'Failed to resolve YouTube Channel ID. Please verify the URL or Handle.' }, { status: 400 });
    }

    // 1. Fetch recent videos
    const videos = await fetchVideosFromRss(channelId);
    if (videos.length === 0) {
      return NextResponse.json({ success: true, added: 0, message: 'No new videos found in YouTube channel feed.' });
    }

    // 2. Fetch existing content items
    const existingContent = await storage.getContent(userId);
    const existingUrls = new Set(existingContent.map(c => c.url.toLowerCase()));

    let addedCount = 0;
    const addedItems = [];

    // 3. Auto-add new videos to Content library
    for (const video of videos) {
      if (!existingUrls.has(video.url.toLowerCase())) {
        const slug = 'yt-' + generateShortSlug(video.title);
        
        // Double check uniqueness of slug
        const existsSlug = await storage.getContentBySlug(slug);
        const finalSlug = existsSlug ? `${slug}-${Math.floor(1000 + Math.random() * 9000)}` : slug;

        const newItem = await storage.createContent({
          title: video.title,
          platform: 'YouTube',
          url: video.url,
          tracking_slug: finalSlug,
          user_id: userId,
          published_at: new Date().toISOString()
        } as any);

        addedItems.push(newItem);
        addedCount++;
      }
    }

    // Save channel metadata to workspace settings
    if (isSupabaseConfigured() && supabase) {
      await supabase
        .from('workspace_settings')
        .update({
          youtube_channel_url: youtube_channel_url,
          youtube_channel_id: channelId
        })
        .eq('user_id', userId);
    }

    return NextResponse.json({
      success: true,
      added: addedCount,
      channelId,
      items: addedItems,
      message: `Synced channel successfully! Generated ${addedCount} new video tracking links.`
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
