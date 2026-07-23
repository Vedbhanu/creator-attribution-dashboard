import { NextResponse } from 'next/server';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const userId = searchParams.get('state'); // State contains userId

    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const redirectUri = `${protocol}://${host}/api/auth/youtube/callback`;

    if (!code || !userId) {
      return NextResponse.json({ error: 'Missing code or state parameters' }, { status: 400 });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    // 1. Sandbox Simulation Mode
    // If no client credentials exist in environment variables, we simulate connection success
    if (!clientId || !clientSecret) {
      console.log(`[SIMULATION] Simulated Google OAuth exchange successful for user: ${userId}`);
      
      if (isSupabaseConfigured() && supabase) {
        await supabase
          .from('workspace_settings')
          .update({
            youtube_access_token: 'mock_simulated_google_oauth_access_token_18237198',
            youtube_refresh_token: 'mock_simulated_google_oauth_refresh_token_98231',
            youtube_auto_inject: true
          })
          .eq('user_id', userId);
      }

      return NextResponse.redirect(`${protocol}://${host}/settings?oauth=simulated`);
    }

    // 2. Real Google OAuth Exchange
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      console.error('Google OAuth token exchange failed:', errText);
      return NextResponse.redirect(`${protocol}://${host}/settings?oauth=failed&error=${encodeURIComponent(errText)}`);
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token } = tokenData;

    // 3. Save access and refresh tokens to database
    if (isSupabaseConfigured() && supabase) {
      await supabase
        .from('workspace_settings')
        .update({
          youtube_access_token: access_token,
          youtube_refresh_token: refresh_token || null,
          youtube_auto_inject: true
        })
        .eq('user_id', userId);
    }

    return NextResponse.redirect(`${protocol}://${host}/settings?oauth=success`);
  } catch (err: any) {
    console.error('Google callback error:', err);
    return NextResponse.json({ error: 'OAuth Callback exception: ' + err.message }, { status: 500 });
  }
}
