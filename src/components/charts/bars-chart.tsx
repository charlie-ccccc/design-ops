'use client';
import React from 'react';
import type { ChartDataItem } from '@/lib/types';

interface BarsChartProps {
  data: ChartDataItem[];
}

export default function BarsChart({ data }: BarsChartProps) {
  if (!data || data.length === 0) {
    return <div style={{ fontSize: 11, color: 'var(--muted-2)', padding: '12px 0' }}>無資料</div>;
  }

  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.map((item, i) => {
        const pct = (item.value / max) * 100;
        return (
          <div key={i}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: item.color,
                  flexShrink: 0,
                }}
              />
              <span style={{ flex: 1, fontSize: 12, color: 'var(--ink-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.name}
              </span>
              <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-mono), monospace', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                {item.value}h
              </span>
            </div>
            <div style={{ width: '100%', height: 5, borderRadius: 99, background: 'var(--surface-2)', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${pct}%`,
                  height: '100%',
                  borderRadius: 99,
                  background: item.color,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
