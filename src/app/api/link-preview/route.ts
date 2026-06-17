import { NextRequest, NextResponse } from 'next/server';

// In-memory cache: url → { image, title, ts }
const cache = new Map<string, { image?: string; title?: string; ts: number }>();
const TTL = 1000 * 60 * 60; // 1 hour

function extractMeta(html: string, property: string): string | undefined {
  return (
    html.match(new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`))?.[1] ??
    html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`))?.[1]
  );
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'missing url' }, { status: 400 });

  const cached = cache.get(url);
  if (cached && Date.now() - cached.ts < TTL) {
    return NextResponse.json({ image: cached.image, title: cached.title });
  }

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LinkPreview/1.0)' },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return NextResponse.json({});
    const html = await res.text();

    const image = extractMeta(html, 'og:image');
    const title =
      extractMeta(html, 'og:title') ??
      html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim();

    const result = { image, title, ts: Date.now() };
    cache.set(url, result);
    return NextResponse.json({ image, title });
  } catch {
    return NextResponse.json({});
  }
}
