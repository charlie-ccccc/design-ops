'use client';
import React from 'react';
import { ChevronRight } from 'lucide-react';
import type { HistoryMonth, Card } from '@/lib/types';
import { DEPT_SHORT } from '@/lib/data';
import { sum } from '@/lib/utils';

interface CurrentSnapshot {
  month: string;
  cards: number;
  totalEst: number;
  totalActual: number;
  capacity: number;
  topDept: string;
}

interface HistoryProps {
  archives: HistoryMonth[];
  currentSnapshot: CurrentSnapshot;
}

interface ArchiveCardItem {
  month: string;
  cards: number;
  totalEst: number;
  totalActual: number;
  capacity: number;
  topDept: string;
  isLive?: boolean;
}

function ArchiveCard({ item }: { item: ArchiveCardItem }) {
  const [year, mon] = item.month.split('/');
  const capPct =
    item.capacity > 0 ? Math.round((item.totalEst / item.capacity) * 100) : 0;

  const stats = [
    { l: '需求單', v: item.cards, sub: '張' },
    { l: '原始預估', v: item.totalEst, sub: 'h' },
    { l: '實際消耗', v: item.totalActual, sub: 'h' },
    { l: '量能', v: `${capPct}%`, sub: `${item.capacity}h 可用` },
  ];

  return (
    <div className="archive-card">
      {/* Left: month + dept */}
      <div>
        <div className="month">
          <span className="y">{year}</span>
          {mon}
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 6 }}>
          最多：{DEPT_SHORT[item.topDept] || item.topDept}
        </div>
        {item.isLive && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              marginTop: 8,
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--st-done)',
              background: 'color-mix(in oklab, var(--st-done) 12%, transparent)',
              padding: '2px 7px',
              borderRadius: 4,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--st-done)',
                flexShrink: 0,
              }}
            />
            LIVE
          </span>
        )}
      </div>

      {/* Middle: stats */}
      <div className="stats">
        {stats.map((s, i) => (
          <div key={i} className="stat">
            <div className="l">{s.l}</div>
            <div className="v">
              {s.v}
              {typeof s.v === 'number' && (
                <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 2 }}>
                  {s.sub}
                </span>
              )}
            </div>
            {typeof s.v !== 'number' && (
              <div className="sub">{s.sub}</div>
            )}
          </div>
        ))}
      </div>

      {/* Right: chevron button */}
      <div>
        <button className="btn btn-ghost" style={{ padding: '6px 8px' }}>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default function History({ archives, currentSnapshot }: HistoryProps) {
  const liveItem: ArchiveCardItem = {
    month: currentSnapshot.month,
    cards: currentSnapshot.cards,
    totalEst: currentSnapshot.totalEst,
    totalActual: currentSnapshot.totalActual,
    capacity: currentSnapshot.capacity,
    topDept: currentSnapshot.topDept,
    isLive: true,
  };

  return (
    <div className="body">
      <div className="history">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>
            歷史月份封存
          </h2>
          <span className="tag">{archives.length + 1} 個月</span>
        </div>

        {/* Current (live) snapshot */}
        <ArchiveCard item={liveItem} />

        {/* Archived months */}
        {archives.map((arch) => {
          const item: ArchiveCardItem = {
            month: arch.month,
            cards: arch.cards,
            totalEst: arch.totalEst,
            totalActual: arch.totalActual,
            capacity: arch.capacity,
            topDept: arch.topDept,
          };
          return <ArchiveCard key={arch.month} item={item} />;
        })}
      </div>
    </div>
  );
}
