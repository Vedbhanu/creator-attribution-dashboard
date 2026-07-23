import { NextResponse } from 'next/server';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  // 1. Demo Sandbox Mode (Unauthenticated preview)
  if (!userId || userId === 'demo' || userId === 'default_user') {
    return NextResponse.json({
      success: true,
      settings: {
        user_id: 'demo',
        brand_name: 'Demo Creator Workspace',
        currency: 'USD',
        custom_domain: 'attrib.democreator.com',
        webhook_secret: 'whsec_sample_demo_key',
        youtube_channel_url: ''
      }
    });
  }

  // 2. Query Supabase for logged-in user settings
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('workspace_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!error && data) {
        return NextResponse.json({ success: true, settings: data });
      }
    } catch (err) {
      console.warn('Supabase settings query note:', err);
    }
  }

  // 3. Fallback defaults dynamically generated for new logged-in creator
  const nameFromEmail = userId.split('@')[0];
  const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);

  return NextResponse.json({
    success: true,
    settings: {
      user_id: userId,
      brand_name: `${formattedName}'s Workspace`,
      currency: 'USD',
      custom_domain: `attrib.${nameFromEmail.toLowerCase()}.com`,
      webhook_secret: `whsec_${nameFromEmail.toLowerCase()}_${Math.floor(100000 + Math.random() * 900000)}`,
      youtube_channel_url: ''
    }
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, brand_name, currency, custom_domain, webhook_secret, youtube_channel_url } = body;

    if (!userId || userId === 'demo') {
      return NextResponse.json({ success: false, error: 'Cannot modify settings in Demo Sandbox mode. Please log in.' }, { status: 403 });
    }

    // Retrieve existing credentials to prevent wiping them out on brand settings save
    let existingAuth = {
      youtube_access_token: null,
      youtube_refresh_token: null,
      youtube_auto_inject: false,
      cta_template: '🔥 Get Priority Access here 👉 {tracking_link}'
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data } = await supabase
          .from('workspace_settings')
          .select('youtube_access_token, youtube_refresh_token, youtube_auto_inject, cta_template')
          .eq('user_id', userId)
          .single();
        if (data) {
          existingAuth = {
            youtube_access_token: data.youtube_access_token,
            youtube_refresh_token: data.youtube_refresh_token,
            youtube_auto_inject: !!data.youtube_auto_inject,
            cta_template: data.cta_template || existingAuth.cta_template
          };
        }
      } catch (e) {
        console.warn('OAuth settings merge skip:', e);
      }
    }

    const updatedSettings: any = {
      user_id: userId,
      brand_name: brand_name || 'My Workspace',
      currency: currency || 'USD',
      custom_domain: custom_domain || 'attrib.yourdomain.com',
      webhook_secret: webhook_secret || 'whsec_creator_attrib_982374',
      youtube_channel_url: youtube_channel_url !== undefined ? youtube_channel_url : '',
      
      // Preserve or set OAuth fields
      youtube_auto_inject: body.hasOwnProperty('youtube_auto_inject') ? body.youtube_auto_inject : existingAuth.youtube_auto_inject,
      cta_template: body.hasOwnProperty('cta_template') ? body.cta_template : existingAuth.cta_template,
      youtube_access_token: body.hasOwnProperty('youtube_access_token') ? body.youtube_access_token : existingAuth.youtube_access_token,
      youtube_refresh_token: body.hasOwnProperty('youtube_refresh_token') ? body.youtube_refresh_token : existingAuth.youtube_refresh_token,
      
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured() && supabase) {
      // Attempt upsert with all parameters
      const { error } = await supabase
        .from('workspace_settings')
        .upsert([updatedSettings], { onConflict: 'user_id' });

      if (error) {
        console.warn('Supabase settings custom columns upsert warning (Self-healing fallback active):', error.message);
        // Fallback: Strip youtube_channel_url and tokens if columns do not exist yet
        const { youtube_channel_url, youtube_auto_inject, cta_template, youtube_access_token, youtube_refresh_token, ...legacySettings } = updatedSettings;
        const { error: fallbackErr } = await supabase
          .from('workspace_settings')
          .upsert([legacySettings], { onConflict: 'user_id' });

        if (fallbackErr) {
          console.error('Supabase settings fallback upsert error:', fallbackErr.message);
        }
      }
    }

    return NextResponse.json({ success: true, settings: updatedSettings });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
