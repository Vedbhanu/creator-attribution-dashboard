import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { storage } from '@/lib/storage';

export async function GET() {
  try {
    const leadsList = await storage.getLeads();
    const contentItems = await storage.getContent();
    const visitorsList = await storage.getVisitors();
    const salesList = await storage.getSales();

    // Join lead objects with content, visitor, and sale info for rich presentation
    const enrichedLeads = leadsList.map(lead => {
      const content = contentItems.find(c => c.id === lead.content_id);
      const visitor = visitorsList.find(v => v.id === lead.visitor_id);
      const sale = salesList.find(s => s.lead_id === lead.id);

      return {
        ...lead,
        content_title: content?.title || 'Unknown Content',
        content_platform: content?.platform || 'Other',
        content_slug: content?.tracking_slug || '',
        visitor_cookie: visitor?.cookie_id || 'Direct',
        utm_source: visitor?.utm_source || 'direct',
        sale_amount: sale ? sale.amount : 0,
        sale_status: sale ? sale.status : null
      };
    });

    return NextResponse.json({ success: true, data: enrichedLeads });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, phone, content_id, tracking_slug } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email address is required' }, { status: 400 });
    }

    const cookieStore = cookies();
    const visitorCookieId = cookieStore.get('creator_visitor_id')?.value;
    const cookieContentId = cookieStore.get('creator_last_content_id')?.value;

    let targetContentId = content_id || cookieContentId;
    let visitorId: string | undefined = undefined;

    // If tracking_slug provided, resolve content item
    if (tracking_slug) {
      const content = await storage.getContentBySlug(tracking_slug);
      if (content) {
        targetContentId = content.id;
      }
    }

    // If visitor cookie present, match visitor record
    if (visitorCookieId) {
      const visitor = await storage.getVisitorByCookie(visitorCookieId);
      if (visitor) {
        visitorId = visitor.id;
        if (!targetContentId) {
          targetContentId = visitor.content_id;
        }
      }
    }

    // Fallback if no content found yet, grab first available content or throw error
    if (!targetContentId) {
      const allContent = await storage.getContent();
      if (allContent.length > 0) {
        targetContentId = allContent[0].id;
      } else {
        return NextResponse.json({ success: false, error: 'No content item associated with lead capture.' }, { status: 400 });
      }
    }

    const newLead = await storage.addLead({
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : undefined,
      content_id: targetContentId,
      visitor_id: visitorId
    });

    return NextResponse.json({ success: true, data: newLead }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
