import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Extract Email & Amount from PayPal, Payoneer, or Universal Webhook format
    let email = '';
    let amount = 0;
    let productName = 'Sales Purchase';

    // PayPal Webhook Format
    if (body.event_type === 'PAYMENT.CAPTURE.COMPLETED' || body.resource) {
      const resource = body.resource || body;
      email = resource.payer?.email_address || resource.subscriber?.email_address || '';
      amount = parseFloat(resource.amount?.value || resource.gross_amount?.value || '0');
      productName = resource.custom_id || 'PayPal Sale';
    } 
    // Payoneer / Universal Webhook / Zapier Format
    else {
      email = body.email || body.payer_email || body.customer_email || '';
      amount = parseFloat(body.amount || body.price || body.total || '0');
      productName = body.product_name || body.item_name || 'Universal Webhook Sale';
    }

    if (!email || isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid webhook payload: email and positive amount required' },
        { status: 400 }
      );
    }

    // 2. Find matching lead in database by email
    const leads = await storage.getLeads();
    const matchingLead = leads.find((l) => l.email.toLowerCase() === email.toLowerCase());

    if (!matchingLead) {
      return NextResponse.json(
        {
          success: false,
          error: `No matching lead found for email: ${email}. Sale recorded without attribution link.`,
        },
        { status: 404 }
      );
    }

    // 3. Automatically record sale linked to the lead & content item
    const newSale = await storage.addSale({
      lead_id: matchingLead.id,
      amount,
      status: 'completed',
    });

    return NextResponse.json({
      success: true,
      message: `Sale of $${amount} successfully attributed to lead ${email}!`,
      sale: newSale,
    });
  } catch (err: any) {
    console.error('Sales Webhook Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
