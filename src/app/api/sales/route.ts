import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo';

    const salesList = await storage.getSales(userId);
    const leadsList = await storage.getLeads(userId);
    const contentItems = await storage.getContent(userId);

    // Enrich sales records with lead email and content attribution
    const enrichedSales = salesList.map(sale => {
      const lead = leadsList.find(l => l.id === sale.lead_id);
      const content = lead ? contentItems.find(c => c.id === lead.content_id) : null;

      return {
        ...sale,
        lead_email: lead?.email || 'Unknown Lead',
        lead_phone: lead?.phone,
        content_id: content?.id,
        content_title: content?.title || 'Direct/Unknown',
        content_platform: content?.platform || 'Other',
        content_slug: content?.tracking_slug
      };
    });

    return NextResponse.json({ success: true, data: enrichedSales });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { lead_id, amount, status } = body;

    if (!lead_id || amount === undefined || amount === null) {
      return NextResponse.json({ success: false, error: 'Missing required fields: lead_id and amount' }, { status: 400 });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount < 0) {
      return NextResponse.json({ success: false, error: 'Amount must be a positive number' }, { status: 400 });
    }

    const newSale = await storage.addSale({
      lead_id,
      amount: numericAmount,
      status: status || 'completed'
    });

    return NextResponse.json({ success: true, data: newSale }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
