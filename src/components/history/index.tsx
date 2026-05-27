'use client';
import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import type { HistoryMonth, Card, Cat } from '@/lib/types';
import { DEPT_SHORT, MEMBER_BY_ID, SITE_USER_BY_ID, STATUSES } from '@/lib/data';
import { sum, groupBy } from '@/lib/utils';

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
  currentCards: Card[];
  onOpenCard: (card: Card) => void;
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
  onClick: () => void;
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
    <div className="archive-card clickable" onClick={item.onClick} style={{ cursor: 'pointer' }}>
      <div>
        <div className="month">
          <span className="y">{year}</span>
          {mon}
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 6 }}>
          最多：{DEPT_SHORT[item.topDept] || item.topDept}
        </div>
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

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
        {item.isLive && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'var(--st-done)',
            background: 'color-mix(in oklab, var(--st-done) 12%, transparent)',
            padding: '2px 7px', borderRadius: 4,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--st-done)', flexShrink: 0 }} />
            LIVE
          </span>
        )}
        <button className="btn btn-ghost" style={{ padding: '6px 8px' }} onClick={e => { e.stopPropagation(); item.onClick(); }}>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ── Card table ───────────────────────────────────────────────────
function HistoryCardTable({ cards, onOpenCard }: { cards: Card[]; onOpenCard: (card: Card) => void }) {
  return (
    <div className="panel">
      <div className="xtab-wrap">
        <table className="xtab">
          <thead>
            <tr>
              <th>ID</th>
              <th style={{ textAlign: 'left', minWidth: 200 }}>標題</th>
              <th style={{ textAlign: 'left' }}>需求發起單位</th>
              <th style={{ textAlign: 'left' }}>委託人</th>
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
              const requesterName = card.requesterName ?? (card.requester ? SITE_USER_BY_ID[card.requester]?.name : undefined);
              const status = STATUSES.find(s => s.id === card.status);
              const isOver = card.actual > card.est;
              return (
                <tr key={card.id}>
                  <td className="cell-num" style={{ fontSize: 10.5, fontFamily: 'var(--font-mono), monospace', letterSpacing: '0.02em' }}>
                    {card.id}
                  </td>
                  <td style={{ textAlign: 'left' }}>
                    <button
                      onClick={() => onOpenCard(card)}
                      style={{
                        background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                        color: 'var(--ink)', fontFamily: 'inherit', fontSize: 'inherit',
                        textAlign: 'left', lineHeight: 'inherit',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink)')}
                    >
                      {card.title}
                    </button>
                  </td>
                  <td style={{ textAlign: 'left' }}>
                    <span className="dept-pill" style={{ fontSize: 11 }}>
                      {DEPT_SHORT[card.dept] || card.dept}
                    </span>
                  </td>
                  <td style={{ textAlign: 'left' }}>{requesterName ?? '—'}</td>
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
            {cards.length === 0 && (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', color: 'var(--muted)', padding: '24px 0' }}>
                  無符合條件的卡片
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Month detail view ────────────────────────────────────────────
function HistoryDetail({ archive, isLive, onBack, onOpenCard }: {
  archive: HistoryMonth;
  isLive?: boolean;
  onBack: () => void;
  onOpenCard: (card: Card) => void;
}) {
  const [year, mon] = archive.month.split('/');
  const capPct = archive.capacity > 0 ? Math.round((archive.totalEst / archive.capacity) * 100) : 0;
  const doneCount = archive.cardList.filter(c => c.status === 'done').length;
  const pendingCount = archive.cardList.filter(c => c.status === 'pending').length;

  const [filterOwner, setFilterOwner] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterCat, setFilterCat] = useState<Cat | ''>('');

  const ownerIds = useMemo(() =>
    [...new Set(archive.cardList.map(c => c.owner).filter(Boolean))], [archive]);
  const depts = useMemo(() =>
    [...new Set(archive.cardList.map(c => c.dept).filter(Boolean))], [archive]);

  const filtered = useMemo(() =>
    archive.cardList.filter(c =>
      (!filterOwner || c.owner === filterOwner) &&
      (!filterDept  || c.dept  === filterDept) &&
      (!filterCat   || c.cat   === filterCat)
    ), [archive, filterOwner, filterDept, filterCat]);

  const hasFilter = filterOwner || filterDept || filterCat;

  return (
    <div className="history">
      <div className="history-detail-header">
        <button className="btn btn-ghost" onClick={onBack} style={{ gap: 4 }}>
          <ChevronLeft size={14} /> 返回列表
        </button>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>
          {year} 年 {mon} 月
        </h2>
        {isLive && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 10.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'var(--st-done)', background: 'color-mix(in oklab, var(--st-done) 12%, transparent)',
            padding: '2px 7px', borderRadius: 4,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--st-done)', flexShrink: 0 }} />
            LIVE
          </span>
        )}
        <span className="tag">{archive.cardList.length} 張</span>
      </div>

      <div className="history-detail-meta">
        {[
          { l: '原始預估', v: `${archive.totalEst}h` },
          { l: '實際消耗', v: `${archive.totalActual}h` },
          { l: '量能使用', v: `${capPct}%` },
          { l: '設計完成', v: `${doneCount} 張` },
          { l: 'Pending', v: `${pendingCount} 張` },
          { l: '最多發起單位', v: DEPT_SHORT[archive.topDept] || archive.topDept },
        ].map((s, i) => (
          <div key={i} className="stat-item">
            <div className="l">{s.l}</div>
            <div className="v">{s.v}</div>
          </div>
        ))}
      </div>

      {/* 篩選列 */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <select className="input" style={{ minWidth: 110 }} value={filterOwner} onChange={e => setFilterOwner(e.target.value)}>
          <option value="">全部受託人</option>
          {ownerIds.map(id => (
            <option key={id} value={id}>{MEMBER_BY_ID[id]?.name ?? id}</option>
          ))}
        </select>
        <select className="input" style={{ minWidth: 110 }} value={filterDept} onChange={e => setFilterDept(e.target.value)}>
          <option value="">全部發起單位</option>
          {depts.map(d => <option key={d} value={d}>{DEPT_SHORT[d] || d}</option>)}
        </select>
        <select className="input" style={{ minWidth: 100 }} value={filterCat} onChange={e => setFilterCat(e.target.value as Cat | '')}>
          <option value="">全部類別</option>
          <option value="UIUX">UIUX</option>
          <option value="平面視覺">平面視覺</option>
        </select>
        {hasFilter && (
          <button className="btn btn-ghost" onClick={() => { setFilterOwner(''); setFilterDept(''); setFilterCat(''); }}>
            清除篩選
          </button>
        )}
        {hasFilter && (
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>
            顯示 {filtered.length} / {archive.cardList.length} 張
          </span>
        )}
      </div>

      <HistoryCardTable cards={filtered} onOpenCard={onOpenCard} />
    </div>
  );
}

// ── Main export ──────────────────────────────────────────────────
export default function History({ archives, currentSnapshot, currentCards, onOpenCard }: HistoryProps) {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const LIVE_MONTH = currentSnapshot.month;

  // build a virtual HistoryMonth for the live view
  const liveArchive = useMemo((): HistoryMonth => {
    const byDept = groupBy(currentCards, 'dept');
    const topDept = Object.entries(byDept)
      .map(([d, xs]) => [d, sum(xs.map(c => c.est))] as [string, number])
      .sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
    return {
      month: LIVE_MONTH,
      cards: currentCards.length,
      totalEst: sum(currentCards.map(c => c.est)),
      totalActual: sum(currentCards.map(c => c.actual)),
      capacity: currentSnapshot.capacity,
      topDept,
      deptTotals: Object.fromEntries(Object.entries(byDept).map(([d, xs]) => [d, sum(xs.map(c => c.est))])),
      memberTotals: {},
      cardList: currentCards,
    };
  }, [currentCards, currentSnapshot, LIVE_MONTH]);

  const selectedArchive = selectedMonth === LIVE_MONTH
    ? liveArchive
    : archives.find(a => a.month === selectedMonth) ?? null;

  if (selectedArchive) {
    return (
      <div className="body">
        <HistoryDetail
          archive={selectedArchive}
          isLive={selectedMonth === LIVE_MONTH}
          onBack={() => setSelectedMonth(null)}
          onOpenCard={onOpenCard}
        />
      </div>
    );
  }

  return (
    <div className="body">
      <div className="history">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>
            歷史紀錄
          </h2>
          <span className="tag">{archives.length + 1} 個月</span>
        </div>

        <ArchiveCard
          item={{
            month: liveArchive.month,
            cards: liveArchive.cards,
            totalEst: liveArchive.totalEst,
            totalActual: liveArchive.totalActual,
            capacity: liveArchive.capacity,
            topDept: liveArchive.topDept,
            isLive: true,
            onClick: () => setSelectedMonth(LIVE_MONTH),
          }}
        />

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
