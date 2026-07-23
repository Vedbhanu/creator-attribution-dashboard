import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const item = await storage.getContentById(params.id);
    if (!item) {
      return NextResponse.json({ success: false, error: 'Content item not found' }, { status: 404 });
    }

    const allMetrics = await storage.getAttributionMetrics((item as any).user_id || 'demo');
    const itemMetrics = allMetrics.find(m => m.content.id === params.id);

    return NextResponse.json({ success: true, data: item, metrics: itemMetrics });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const updated = await storage.updateContent(params.id, {
      title: body.title,
      platform: body.platform,
      url: body.url,
      destination_url: body.destination_url
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Content item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const success = await storage.deleteContent(params.id);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Content item not found or already deleted' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Content item deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
