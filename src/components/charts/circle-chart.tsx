'use client';
import React, { useState } from 'react';
import type { ChartDataItem } from '@/lib/types';

interface CircleChartProps {
  data: ChartDataItem[];
  size?: number;
  kind?: 'donut' | 'pie';
  centerLabel?: string;
  centerValue?: string;
}

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
}: CircleChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);

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

  const slices: { path: string; color: string; a0: number; a1: number }[] = [];
  let running = 0;
  for (const item of data) {
    const a0 = running;
    const a1 = a0 + (item.value / total) * TAU;
    slices.push({
      path: arcPath(cx, cy, rOuter, rInner, a0, a1),
      color: item.color,
      a0,
      a1,
    });
    running = a1;
  }

  // Hairline separator points
  const separators = slices.map((s) => {
    const [x, y] = polar(cx, cy, rOuter, s.a0);
    return { x, y };
  });

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-block' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
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
