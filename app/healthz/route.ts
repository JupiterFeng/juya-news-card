import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'juya-news-card-next',
    now: new Date().toISOString(),
  });
}
