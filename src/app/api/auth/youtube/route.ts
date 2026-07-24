import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  
  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const redirectUri = `${protocol}://${host}/api/auth/youtube/callback`;

  // If no client credentials configured, bypass Google 401 and redirect directly to our local callback simulator
  if (!clientId || clientId.includes('demo-client-id')) {
    return NextResponse.redirect(`${redirectUri}?code=mock_simulated_code&state=${encodeURIComponent(userId)}`);
  }

  // Scopes requested:
  // - youtube.force-ssl: To read and update descriptions
  const scope = 'https://www.googleapis.com/auth/youtube.force-ssl';

  const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + 
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(scope)}&` +
    `access_type=offline&` +
    `prompt=select_account%20consent&` +
    `state=${encodeURIComponent(userId)}`;

  return NextResponse.redirect(oauthUrl);
}
