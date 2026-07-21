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
        webhook_secret: 'whsec_sample_demo_key'
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
      webhook_secret: `whsec_${nameFromEmail.toLowerCase()}_${Math.floor(100000 + Math.random() * 900000)}`
    }
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, brand_name, currency, custom_domain, webhook_secret } = body;

    if (!userId || userId === 'demo') {
      return NextResponse.json({ success: false, error: 'Cannot modify settings in Demo Sandbox mode. Please log in.' }, { status: 403 });
    }

    const updatedSettings = {
      user_id: userId,
      brand_name: brand_name || 'My Workspace',
      currency: currency || 'USD',
      custom_domain: custom_domain || 'attrib.yourdomain.com',
      webhook_secret: webhook_secret || 'whsec_creator_attrib_982374',
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase
        .from('workspace_settings')
        .upsert([updatedSettings], { onConflict: 'user_id' });

      if (error) {
        console.error('Supabase settings upsert error:', error.message);
      }
    }

    return NextResponse.json({ success: true, settings: updatedSettings });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
