'use client';
import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import type { HistoryMonth, Card, Cat } from '@/lib/types';
import type { AppUser } from '@/contexts/auth-context';
import { DEPT_SHORT, DEPT_HUE, MEMBER_BY_ID, STATUSES } from '@/lib/data';
import { sum, groupBy } from '@/lib/utils';
import { ArchiveCard } from '@/components/ui/ArchiveCard/ArchiveCard';
import { Button } from '@/components/ui/Button/Button';
import { Tag, DeptPill } from '@/components/ui/Badge/Badge';
import { Input } from '@/components/ui/Input/Input';
import { Table } from '@/components/ui/Table/Table';
import type { TableColumn } from '@/components/ui/Table/Table';

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
  siteUsers: AppUser[];
}

// ── Card table ───────────────────────────────────────────────────
function makeCardColumns(onOpenCard: (card: Card) => void, siteUsers: AppUser[]): TableColumn<Card>[] {
  return [
    {
      key: 'id', header: 'ID', align: 'left', minWidth: '70px',
      render: c => (
        <span style={{ fontSize: 12, fontFamily: 'var(--font-mono), monospace', letterSpacing: '0.02em', color: 'var(--md-sys-color-on-surface-secondary)' }}>
          {c.id}
        </span>
      ),
    },
    {
      key: 'title', header: '標題', align: 'left', minWidth: '200px',
      render: c => (
        <button
          onClick={() => onOpenCard(c)}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--md-sys-color-on-surface)', fontFamily: 'inherit', fontSize: 'inherit', textAlign: 'left', lineHeight: 'inherit' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--md-sys-color-primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--md-sys-color-on-surface)')}
        >
          {c.title}
        </button>
      ),
    },
    {
      key: 'dept', header: '需求發起單位', align: 'left',
      render: c => <DeptPill hue={DEPT_HUE[c.dept] || 1}>{DEPT_SHORT[c.dept] || c.dept}</DeptPill>,
    },
    {
      key: 'requester', header: '委託人', align: 'left',
      render: c => {
        const name = c.requesterName ?? (c.requester ? siteUsers.find(u => u.uid === c.requester)?.name : undefined);
        return name ?? '—';
      },
    },
    {
      key: 'cat', header: '類別', align: 'left',
      render: c => <span className="kcard-cat" data-cat={c.cat}>{c.cat}</span>,
    },
    {
      key: 'owner', header: '受託人', align: 'left',
      render: c => {
        const name = (c.owner ? siteUsers.find(u => u.uid === c.owner)?.name : undefined) ?? MEMBER_BY_ID[c.owner ?? '']?.name ?? c.owner;
        return name ?? '—';
      },
    },
    { key: 'est', header: '原估(h)' },
    {
      key: 'actual', header: '實際(h)',
      render: c => <span style={{ color: c.actual > c.est ? 'var(--st-block)' : undefined }}>{c.actual}</span>,
    },
    {
      key: 'status', header: '狀態', align: 'left',
      render: c => {
        const s = STATUSES.find(st => st.id === c.status);
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: s?.dot, flexShrink: 0 }} />
            {s?.name ?? c.status}
          </span>
        );
      },
    },
  ];
}

// ── Month detail view ────────────────────────────────────────────
function HistoryDetail({ archive, isLive, onBack, onOpenCard, siteUsers }: {
  archive: HistoryMonth;
  isLive?: boolean;
  onBack: () => void;
  onOpenCard: (card: Card) => void;
  siteUsers: AppUser[];
}) {
  const [year, mon] = archive.month.split('/');
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
  const columns = useMemo(() => makeCardColumns(onOpenCard, siteUsers), [onOpenCard, siteUsers]);

  return (
    <div className="history">
      <div className="history-detail-header">
        <Button variant="ghost" leadingIcon={<ChevronLeft size={14} />} onClick={onBack}>
          返回列表
        </Button>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>
          {year} 年 {mon} 月
        </h2>
        {isLive && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'var(--st-done)', background: 'color-mix(in oklab, var(--st-done) 12%, transparent)',
            padding: '2px 7px', borderRadius: 4,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--st-done)', flexShrink: 0 }} />
            LIVE
          </span>
        )}
        <Tag>{archive.cardList.length} 張</Tag>
      </div>

      <div className="history-detail-meta">
        {[
          { l: '原始預估', v: `${archive.totalEst}h` },
          { l: '實際消耗', v: `${archive.totalActual}h` },
          { l: '設計完成', v: `${doneCount} 張` },
          { l: 'Pending', v: `${pendingCount} 張` },
        ].map((s, i) => (
          <div key={i} className="stat-item">
            <div className="l">{s.l}</div>
            <div className="v">{s.v}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <Input as="select" style={{ minWidth: 110, width: 'auto' }} value={filterOwner} onChange={e => setFilterOwner((e.target as HTMLSelectElement).value)}>
          <option value="">全部受託人</option>
          {ownerIds.map(id => (
            <option key={id} value={id}>
              {siteUsers.find(u => u.uid === id)?.name ?? MEMBER_BY_ID[id]?.name ?? id}
            </option>
          ))}
        </Input>
        <Input as="select" style={{ minWidth: 110, width: 'auto' }} value={filterDept} onChange={e => setFilterDept((e.target as HTMLSelectElement).value)}>
          <option value="">全部發起單位</option>
          {depts.map(d => <option key={d} value={d}>{DEPT_SHORT[d] || d}</option>)}
        </Input>
        <Input as="select" style={{ minWidth: 100, width: 'auto' }} value={filterCat} onChange={e => setFilterCat((e.target as HTMLSelectElement).value as Cat | '')}>
          <option value="">全部類別</option>
          <option value="UIUX">UIUX</option>
          <option value="平面視覺">平面視覺</option>
        </Input>
        {hasFilter && (
          <Button variant="ghost" onClick={() => { setFilterOwner(''); setFilterDept(''); setFilterCat(''); }}>
            清除篩選
          </Button>
        )}
        {hasFilter && (
          <span style={{ fontSize: 13, color: 'var(--md-sys-color-on-surface-muted)' }}>
            顯示 {filtered.length} / {archive.cardList.length} 張
          </span>
        )}
      </div>

      <div className="panel">
        <Table
          columns={columns}
          rows={filtered}
          getKey={c => c.id}
          stickyFirstCol
          emptyText="無符合條件的卡片"
        />
      </div>
    </div>
  );
}

// ── Main export ──────────────────────────────────────────────────
export default function History({ archives, currentSnapshot, currentCards, onOpenCard, siteUsers }: HistoryProps) {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const LIVE_MONTH = currentSnapshot.month;

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
          siteUsers={siteUsers}
        />
      </div>
    );
  }

  const allMonths = [liveArchive, ...archives];
  const byYear = allMonths.reduce<Record<string, typeof allMonths>>((acc, arch) => {
    const y = arch.month.split('/')[0];
    (acc[y] ??= []).push(arch);
    return acc;
  }, {});
  const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));

  return (
    <div className="body">
      <div className="history">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>歷史紀錄</h2>
          <Tag>{archives.length + 1} 個月</Tag>
        </div>

        {years.map(year => (
          <div key={year} className="history-year-group">
            <div className="history-year-header">{year}</div>
            {byYear[year].map(arch => (
              <ArchiveCard
                key={arch.month}
                month={`${arch.month.split('/')[1]}月`}
                isLive={arch.month === LIVE_MONTH}
                stats={[
                  { label: '需求單', value: arch.cards, sub: '張' },
                  { label: '原始預估', value: arch.totalEst, sub: 'h' },
                  { label: '實際消耗', value: arch.totalActual, sub: 'h' },
                ]}
                onView={() => setSelectedMonth(arch.month)}
                onClick={() => setSelectedMonth(arch.month)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
