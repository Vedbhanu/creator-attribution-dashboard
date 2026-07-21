import { NextResponse } from 'next/server';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || 'default_user';

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

  // Fallback defaults
  return NextResponse.json({
    success: true,
    settings: {
      user_id: userId,
      brand_name: 'Ved Automation Workspace',
      currency: 'USD',
      custom_domain: 'attrib.yourdomain.com',
      webhook_secret: 'whsec_creator_attrib_982374'
    }
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId = 'default_user', brand_name, currency, custom_domain, webhook_secret } = body;

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
