'use client';
import React, { useState } from 'react';
import type { ChartDataItem } from '@/lib/types';

interface CircleChartProps {
  data: ChartDataItem[];
  size?: number;
  kind?: 'donut' | 'pie';
  centerLabel?: string;
  centerValue?: string;
  onSliceClick?: (index: number) => void;
}

interface TooltipPos { x: number; y: number; }

const TAU = Math.PI * 2;

function polar(cx: number, cy: number, r: number, a: number): [number, number] {
  return [cx + r * Math.sin(a), cy - r * Math.cos(a)];
}

function arcPath(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  a0: number,
  a1: number
): string {
  const large = a1 - a0 > Math.PI ? 1 : 0;
  const [ox0, oy0] = polar(cx, cy, rOuter, a0);
  const [ox1, oy1] = polar(cx, cy, rOuter, a1);
  const [ix0, iy0] = polar(cx, cy, rInner, a0);
  const [ix1, iy1] = polar(cx, cy, rInner, a1);

  if (rInner === 0) {
    return `M ${cx},${cy} L ${ox0},${oy0} A ${rOuter} ${rOuter} 0 ${large} 1 ${ox1},${oy1} Z`;
  }
  return [
    `M ${ox0},${oy0}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${ox1},${oy1}`,
    `L ${ix1},${iy1}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${ix0},${iy0}`,
    'Z',
  ].join(' ');
}

export default function CircleChart({
  data,
  size = 200,
  kind = 'donut',
  centerLabel,
  centerValue,
  onSliceClick,
}: CircleChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [tipPos, setTipPos] = useState<TooltipPos>({ x: 0, y: 0 });

  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0 || data.length === 0) {
    return (
      <div style={{ width: size, height: size, display: 'grid', placeItems: 'center' }}>
        <span style={{ fontSize: 11, color: 'var(--muted-2)' }}>無資料</span>
      </div>
    );
  }

  const cx = size / 2;
  const cy = size / 2;
  const rOuter = size / 2 - 4;
  const rInner = kind === 'donut' ? rOuter * 0.62 : 0;
  const rMid = (rOuter + rInner) / 2;

  const slices: { path: string; color: string; a0: number; a1: number; full?: boolean }[] = [];
  let running = 0;
  for (const item of data) {
    const a0 = running;
    const frac = item.value / total;
    // SVG arc can't draw a full circle — use a special flag for 100% slices
    const full = frac >= 0.9999;
    const a1 = full ? a0 + TAU - 0.0001 : a0 + frac * TAU;
    slices.push({ path: arcPath(cx, cy, rOuter, rInner, a0, a1), color: item.color, a0, a1, full });
    running = full ? a0 + TAU : a1;
  }

  // Hairline separator points
  const separators = slices.map((s) => {
    const [x, y] = polar(cx, cy, rOuter, s.a0);
    return { x, y };
  });

  const hoveredItem = hovered !== null ? data[hovered] : null;

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-block' }}>
      {hoveredItem && (
        <div style={{
          position: 'fixed',
          left: tipPos.x + 14,
          top: tipPos.y - 10,
          pointerEvents: 'none',
          zIndex: 9999,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '6px 10px',
          boxShadow: '0 4px 16px rgba(0,0,0,.12)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          whiteSpace: 'nowrap',
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: hoveredItem.color, flexShrink: 0, display: 'inline-block' }} />
          <span style={{ fontSize: 13, fontWeight: 500 }}>{hoveredItem.name}</span>
          <span style={{ fontSize: 13, color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>{hoveredItem.value}h</span>
          <span style={{ fontSize: 12, color: 'var(--muted-2)' }}>{Math.round(hoveredItem.value / total * 100)}%</span>
        </div>
      )}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
        onMouseMove={e => setTipPos({ x: e.clientX, y: e.clientY })}>
        {/* Background ring for donut */}
        {kind === 'donut' && (
          <circle
            cx={cx}
            cy={cy}
            r={rMid}
            fill="none"
            stroke="var(--surface-2)"
            strokeWidth={rOuter - rInner}
          />
        )}
        {/* Slices */}
        {slices.map((s, i) => (
          <path
            key={i}
            d={s.path}
            fill={s.color}
            opacity={hovered !== null && hovered !== i ? 0.35 : 1}
            style={{ transition: 'opacity 0.15s ease', cursor: 'pointer' }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onSliceClick?.(i)}
          />
        ))}
        {/* Hairline separators */}
        {slices.length > 1 &&
          separators.map((sep, i) => (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={sep.x}
              y2={sep.y}
              stroke="white"
              strokeWidth={1.2}
              pointerEvents="none"
            />
          ))}
      </svg>
      {kind === 'donut' && centerValue && (
        <div className="donut-center">
          <div>
            <div className="v">{centerValue}</div>
            {centerLabel && <div className="l">{centerLabel}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
