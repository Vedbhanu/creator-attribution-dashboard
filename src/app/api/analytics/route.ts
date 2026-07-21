import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo';

    const summary = await storage.getAnalyticsSummary(userId);
    const contentMetrics = await storage.getAttributionMetrics(userId);

    // Sort content metrics by revenue descending (highest money-makers first!)
    const sortedMetrics = [...contentMetrics].sort((a, b) => b.total_revenue - a.total_revenue);

    return NextResponse.json({
      success: true,
      summary,
      rankings: sortedMetrics
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
