'use client';
import { useEffect, useState } from 'react';

interface PreviewData {
  image?: string;
  title?: string;
}

export function LinkPreview({ url }: { url: string }) {
  const [data, setData] = useState<PreviewData | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/link-preview?url=${encodeURIComponent(url)}`)
      .then(r => r.json())
      .then((d: PreviewData) => { if (!cancelled && d.image) setData(d); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [url]);

  if (!data?.image) return null;

  const domain = (() => { try { return new URL(url).hostname.replace('www.', ''); } catch { return ''; } })();

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex', gap: 10, alignItems: 'flex-start', marginTop: 6,
        padding: '8px 10px', borderRadius: 8,
        border: '1px solid var(--md-sys-color-outline-variant)',
        background: 'var(--md-sys-color-surface-variant)',
        textDecoration: 'none', color: 'inherit',
        maxWidth: 360,
      }}
    >
      <img
        src={data.image}
        alt=""
        style={{ width: 72, height: 52, objectFit: 'cover', borderRadius: 5, flexShrink: 0, background: 'var(--md-sys-color-outline-variant)' }}
        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
      />
      <div style={{ minWidth: 0 }}>
        {data.title && (
          <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {data.title}
          </div>
        )}
        <div style={{ fontSize: 11, color: 'var(--md-sys-color-on-surface-muted)', marginTop: 3 }}>{domain}</div>
      </div>
    </a>
  );
}
