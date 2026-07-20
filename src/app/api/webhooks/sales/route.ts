import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function POST(req: NextRequest) {
  try {
    // 1. Webhook Authentication Check (Finding #1)
    const expectedSecret = process.env.WEBHOOK_SECRET || 'whsec_creator_attrib_982374';
    const authHeader = req.headers.get('authorization') || '';
    const customSecretHeader = req.headers.get('x-webhook-secret') || '';
    const urlSecret = req.nextUrl.searchParams.get('secret') || '';

    const providedToken = authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : (authHeader || customSecretHeader || urlSecret);

    if (providedToken !== expectedSecret) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid or missing Webhook Secret' },
        { status: 401 }
      );
    }

    const body = await req.json();

    // 2. Extract Data Fields (Email, Amount, Cookie ID, Phone, Product Name)
    let email = '';
    let amount = 0;
    let productName = 'Sales Purchase';
    let cookieId = body.cookie_id || body.visitor_id || body.custom_id || '';
    let phone = body.phone || body.payer_phone || '';

    // PayPal Webhook Format
    if (body.event_type === 'PAYMENT.CAPTURE.COMPLETED' || body.resource) {
      const resource = body.resource || body;
      email = resource.payer?.email_address || resource.subscriber?.email_address || '';
      amount = parseFloat(resource.amount?.value || resource.gross_amount?.value || '0');
      productName = resource.custom_id || 'PayPal Sale';
      if (!cookieId && resource.custom_id) cookieId = resource.custom_id;
    } 
    // Payoneer / Universal Webhook / Zapier Format
    else {
      email = body.email || body.payer_email || body.customer_email || '';
      amount = parseFloat(body.amount || body.price || body.total || '0');
      productName = body.product_name || body.item_name || 'Universal Webhook Sale';
    }

    if ((!email && !cookieId && !phone) || isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid webhook payload: email/cookie and positive amount required' },
        { status: 400 }
      );
    }

    // 3. Multi-Tier Attribution Resolution (Finding #2 & cross_email_attribution_resolution.md)
    const leads = await storage.getLeads();
    const visitors = await storage.getVisitors();
    let matchingLead = null;

    // TIER 1: Exact Email Match
    if (email) {
      matchingLead = leads.find((l) => l.email.toLowerCase() === email.toLowerCase());
    }

    // TIER 2: Cookie ID Match (Cross-Email Bridge)
    if (!matchingLead && cookieId) {
      const matchingVisitor = visitors.find((v) => v.cookie_id === cookieId || v.id === cookieId);
      if (matchingVisitor) {
        // Find lead created by this visitor or content item
        matchingLead = leads.find((l) => l.visitor_id === matchingVisitor.id || l.content_id === matchingVisitor.content_id);
      }
    }

    // TIER 3: Phone Number Match
    if (!matchingLead && phone) {
      matchingLead = leads.find((l) => l.phone && l.phone.replace(/[^0-9]/g, '') === phone.replace(/[^0-9]/g, ''));
    }

    // TIER 4: Unattributed Fallback Logging (Finding #3 - Do NOT silently drop revenue!)
    if (!matchingLead) {
      const unassignedSale = await storage.addSale({
        lead_id: 'unassigned',
        amount,
        status: 'completed',
      });

      return NextResponse.json({
        success: true,
        unassigned: true,
        message: `Sale of $${amount} recorded as unassigned for ${email || 'customer'}. Select video on dashboard to link.`,
        sale: unassignedSale,
      });
    }

    // Record Attributed Sale linked to Lead
    const newSale = await storage.addSale({
      lead_id: matchingLead.id,
      amount,
      status: 'completed',
    });

    return NextResponse.json({
      success: true,
      unassigned: false,
      message: `Sale of $${amount} successfully attributed to lead ${email || matchingLead.email}!`,
      sale: newSale,
    });
  } catch (err: any) {
    console.error('Sales Webhook Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
