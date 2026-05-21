'use client';
import React, { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import type { HistoryMonth, Card } from '@/lib/types';
import { DEPT_SHORT, MEMBER_BY_ID, STATUSES } from '@/lib/data';
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
  onArchive: () => void;
}

// ── Archive summary card ─────────────────────────────────────────
interface ArchiveCardItem {
  month: string;
  cards: number;
  totalEst: number;
  totalActual: number;
  capacity: number;
  topDept: string;
  isLive?: boolean;
  onClick?: () => void;
}

function ArchiveCard({ item }: { item: ArchiveCardItem }) {
  const [year, mon] = item.month.split('/');
  const capPct = item.capacity > 0 ? Math.round((item.totalEst / item.capacity) * 100) : 0;

  const stats = [
    { l: '需求單', v: item.cards, sub: '張' },
    { l: '原始預估', v: item.totalEst, sub: 'h' },
    { l: '實際消耗', v: item.totalActual, sub: 'h' },
    { l: '量能使用', v: `${capPct}%`, sub: `${item.capacity}h 可用` },
  ];

  return (
    <div
      className={`archive-card${item.onClick ? ' clickable' : ''}`}
      onClick={item.onClick}
      style={{ cursor: item.onClick ? 'pointer' : 'default' }}
    >
      <div>
        <div className="month">
          <span className="y">{year}</span>
          {mon}
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 6 }}>
          最多：{DEPT_SHORT[item.topDept] || item.topDept}
        </div>
        {item.isLive && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8,
            fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'var(--st-done)',
            background: 'color-mix(in oklab, var(--st-done) 12%, transparent)',
            padding: '2px 7px', borderRadius: 4,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--st-done)', flexShrink: 0 }} />
            LIVE
          </span>
        )}
      </div>

      <div className="stats">
        {stats.map((s, i) => (
          <div key={i} className="stat">
            <div className="l">{s.l}</div>
            <div className="v">
              {s.v}
              {typeof s.v === 'number' && (
                <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 2 }}>{s.sub}</span>
              )}
            </div>
            {typeof s.v !== 'number' && <div className="sub">{s.sub}</div>}
          </div>
        ))}
      </div>

      <div>
        {item.onClick ? (
          <button className="btn btn-ghost" style={{ padding: '6px 8px' }} onClick={e => { e.stopPropagation(); item.onClick?.(); }}>
            <ChevronRight size={16} />
          </button>
        ) : (
          <div style={{ width: 36 }} />
        )}
      </div>
    </div>
  );
}

// ── Card table ───────────────────────────────────────────────────
function HistoryCardTable({ cards }: { cards: Card[] }) {
  return (
    <div className="panel">
      <div className="xtab-wrap">
        <table className="xtab">
          <thead>
            <tr>
              <th>ID</th>
              <th style={{ textAlign: 'left', minWidth: 200 }}>標題</th>
              <th style={{ textAlign: 'left' }}>部門</th>
              <th style={{ textAlign: 'left' }}>類別</th>
              <th style={{ textAlign: 'left' }}>受託人</th>
              <th>原估(h)</th>
              <th>實際(h)</th>
              <th style={{ textAlign: 'left' }}>狀態</th>
            </tr>
          </thead>
          <tbody>
            {cards.map(card => {
              const member = MEMBER_BY_ID[card.owner];
              const status = STATUSES.find(s => s.id === card.status);
              const isOver = card.actual > card.est;
              return (
                <tr key={card.id}>
                  <td className="cell-num" style={{ fontSize: 10.5, fontFamily: 'var(--font-mono), monospace', letterSpacing: '0.02em' }}>
                    {card.id}
                  </td>
                  <td style={{ textAlign: 'left' }}>{card.title}</td>
                  <td style={{ textAlign: 'left' }}>
                    <span className="dept-pill" style={{ fontSize: 11 }}>
                      {DEPT_SHORT[card.dept] || card.dept}
                    </span>
                  </td>
                  <td style={{ textAlign: 'left' }}>
                    <span className="kcard-cat" data-cat={card.cat}>{card.cat}</span>
                  </td>
                  <td style={{ textAlign: 'left' }}>{member?.name ?? card.owner}</td>
                  <td className="cell-num">{card.est}</td>
                  <td className="cell-num" style={{ color: isOver ? 'var(--st-block)' : undefined }}>
                    {card.actual}
                  </td>
                  <td style={{ textAlign: 'left' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: status?.dot, flexShrink: 0 }} />
                      {status?.name ?? card.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Month detail view ────────────────────────────────────────────
function HistoryDetail({ archive, onBack }: { archive: HistoryMonth; onBack: () => void }) {
  const [year, mon] = archive.month.split('/');
  const capPct = archive.capacity > 0 ? Math.round((archive.totalEst / archive.capacity) * 100) : 0;
  const doneCount = archive.cardList.filter(c => c.status === 'done').length;
  const pendingCount = archive.cardList.filter(c => c.status === 'pending').length;

  return (
    <div className="history">
      <div className="history-detail-header">
        <button className="btn btn-ghost" onClick={onBack} style={{ gap: 4 }}>
          <ChevronLeft size={14} /> 返回列表
        </button>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>
          {year} 年 {mon} 月封存
        </h2>
        <span className="tag">{archive.cardList.length} 張</span>
      </div>

      <div className="history-detail-meta">
        {[
          { l: '原始預估', v: `${archive.totalEst}h` },
          { l: '實際消耗', v: `${archive.totalActual}h` },
          { l: '量能使用', v: `${capPct}%` },
          { l: '設計完成', v: `${doneCount} 張` },
          { l: 'Pending', v: `${pendingCount} 張` },
          { l: '最多部門', v: DEPT_SHORT[archive.topDept] || archive.topDept },
        ].map((s, i) => (
          <div key={i} className="stat-item">
            <div className="l">{s.l}</div>
            <div className="v">{s.v}</div>
          </div>
        ))}
      </div>

      <HistoryCardTable cards={archive.cardList} />
    </div>
  );
}

// ── Main export ──────────────────────────────────────────────────
export default function History({ archives, currentSnapshot, onArchive }: HistoryProps) {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const selectedArchive = archives.find(a => a.month === selectedMonth) ?? null;

  if (selectedArchive) {
    return (
      <div className="body">
        <HistoryDetail archive={selectedArchive} onBack={() => setSelectedMonth(null)} />
      </div>
    );
  }

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

        <ArchiveCard item={liveItem} />

        {archives.map(arch => (
          <ArchiveCard
            key={arch.month}
            item={{
              month: arch.month,
              cards: arch.cards,
              totalEst: arch.totalEst,
              totalActual: arch.totalActual,
              capacity: arch.capacity,
              topDept: arch.topDept,
              onClick: () => setSelectedMonth(arch.month),
            }}
          />
        ))}
      </div>
    </div>
  );
}
