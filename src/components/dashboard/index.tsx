'use client';
import React, { useState, useMemo } from 'react';
import { ChevronLeft } from 'lucide-react';
import type { Card, Member, Cat } from '@/lib/types';
import type { AppUser } from '@/contexts/auth-context';
import { DEPT_SHORT, DEPT_HUE, STATUSES } from '@/lib/data';
import { sum, groupBy, hue } from '@/lib/utils';
import CircleChart from '@/components/charts/circle-chart';
import Crosstab from '@/components/dashboard/crosstab';
import { KpiCard } from '@/components/ui/KpiCard/KpiCard';
import { Button } from '@/components/ui/Button/Button';
import { Tag, DeptPill } from '@/components/ui/Badge/Badge';
import { Input } from '@/components/ui/Input/Input';
import { Table } from '@/components/ui/Table/Table';
import type { TableColumn } from '@/components/ui/Table/Table';

export interface DashFilter { dept?: string; owner?: string; }

interface DashboardProps {
  cards: Card[];
  totalCapacity: number;
  onOpenCard?: (card: Card) => void;
  drillFilter?: DashFilter | null;
  onDrill?: (f: DashFilter | null) => void;
  members: Member[];
  siteUsers: AppUser[];
  deptColors?: Record<string, string>;
}

interface ColDef { id: string; name: string; full?: string; }

// ── Card table columns ────────────────────────────────────────────────────────
function makeCardColumns(onOpenCard: ((card: Card) => void) | undefined, memberByUid: Record<string, Member>, siteUsers: AppUser[]): TableColumn<Card>[] {
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
      render: c => onOpenCard ? (
        <button
          onClick={() => onOpenCard(c)}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--md-sys-color-on-surface)', fontFamily: 'inherit', fontSize: 'inherit', textAlign: 'left', lineHeight: 'inherit' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--md-sys-color-primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--md-sys-color-on-surface)')}
        >
          {c.title}
        </button>
      ) : c.title,
    },
    {
      key: 'dept', header: '需求發起單位', align: 'left',
      render: c => <DeptPill hue={DEPT_HUE[c.dept] || 1}>{DEPT_SHORT[c.dept] || c.dept}</DeptPill>,
    },
    {
      key: 'requester', header: '委託人', align: 'left',
      render: c => c.requesterName ?? (c.requester ? siteUsers.find(u => u.uid === c.requester)?.name : undefined) ?? '—',
    },
    {
      key: 'cat', header: '類別', align: 'left',
      render: c => <span className="kcard-cat" data-cat={c.cat}>{c.cat}</span>,
    },
    {
      key: 'owner', header: '受託人', align: 'left',
      render: c => memberByUid[c.owner ?? '']?.name ?? c.owner ?? '—',
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

// ── Drill detail view ──────────────────────────────────────────────────────
function DrillView({ allCards, drillFilter, onBack, onOpenCard, memberByUid, siteUsers }: {
  allCards: Card[];
  drillFilter: DashFilter;
  onBack: () => void;
  onOpenCard?: (card: Card) => void;
  memberByUid: Record<string, Member>;
  siteUsers: AppUser[];
}) {
  const [subDept,  setSubDept]  = useState(drillFilter.dept  ?? '');
  const [subOwner, setSubOwner] = useState(drillFilter.owner ?? '');
  const [subCat,   setSubCat]   = useState<Cat | ''>('');

  const drillCards = useMemo(() =>
    allCards.filter(c =>
      (!drillFilter.dept  || c.dept  === drillFilter.dept) &&
      (!drillFilter.owner || c.owner === drillFilter.owner)
    ), [allCards, drillFilter]);

  const filtered = useMemo(() =>
    allCards.filter(c =>
      (!subDept  || c.dept  === subDept) &&
      (!subOwner || c.owner === subOwner) &&
      (!subCat   || c.cat   === subCat)
    ), [allCards, subDept, subOwner, subCat]);

  const totalEst     = sum(drillCards.map(c => c.est));
  const totalActual  = sum(drillCards.map(c => c.actual));
  const doneCount    = drillCards.filter(c => c.status === 'done').length;
  const pendingCount = drillCards.filter(c => c.status === 'pending').length;

  const deptLabel   = drillFilter.dept  ? (DEPT_SHORT[drillFilter.dept]  || drillFilter.dept)  : '';
  const memberLabel = drillFilter.owner ? (memberByUid[drillFilter.owner]?.name || siteUsers.find(u => u.uid === drillFilter.owner)?.name || drillFilter.owner) : '';
  const title = [deptLabel, memberLabel].filter(Boolean).join(' × ') || '全部';

  const ownerIds = useMemo(() => [...new Set(allCards.map(c => c.owner).filter(Boolean))], [allCards]);
  const depts    = useMemo(() => [...new Set(allCards.map(c => c.dept).filter(Boolean))], [allCards]);
  const isDefaultFilter = subDept === (drillFilter.dept ?? '') && subOwner === (drillFilter.owner ?? '') && subCat === '';
  const columns = useMemo(() => makeCardColumns(onOpenCard, memberByUid, siteUsers), [onOpenCard, memberByUid, siteUsers]);

  return (
    <div className="history">
      <div className="history-detail-header">
        <Button variant="ghost" leadingIcon={<ChevronLeft size={14} />} onClick={onBack}>
          返回總覽
        </Button>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>{title}</h2>
        <Tag>{drillCards.length} 張</Tag>
      </div>

      <div className="history-detail-meta">
        {[
          { l: '原始預估',   v: `${totalEst}h` },
          { l: '實際消耗',   v: `${totalActual}h` },
          { l: '進度',       v: totalEst > 0 ? `${Math.round(totalActual / totalEst * 100)}%` : '—' },
          { l: '設計完成',   v: `${doneCount} 張` },
          { l: 'Pending',    v: `${pendingCount} 張` },
        ].map((s, i) => (
          <div key={i} className="stat-item">
            <div className="l">{s.l}</div>
            <div className="v">{s.v}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <Input as="select" style={{ minWidth: 110 }} value={subOwner} onChange={e => setSubOwner((e.target as HTMLSelectElement).value)}>
          <option value="">全部受託人</option>
          {ownerIds.map(id => <option key={id} value={id}>{memberByUid[id]?.name ?? siteUsers.find(u => u.uid === id)?.name ?? id}</option>)}
        </Input>
        <Input as="select" style={{ minWidth: 110 }} value={subDept} onChange={e => setSubDept((e.target as HTMLSelectElement).value)}>
          <option value="">全部發起單位</option>
          {depts.map(d => <option key={d} value={d}>{DEPT_SHORT[d] || d}</option>)}
        </Input>
        <Input as="select" style={{ minWidth: 100 }} value={subCat} onChange={e => setSubCat((e.target as HTMLSelectElement).value as Cat | '')}>
          <option value="">全部類別</option>
          <option value="UIUX">UIUX</option>
          <option value="平面視覺">平面視覺</option>
        </Input>
        {!isDefaultFilter && (
          <Button variant="ghost" onClick={() => { setSubDept(drillFilter.dept ?? ''); setSubOwner(drillFilter.owner ?? ''); setSubCat(''); }}>
            清除篩選
          </Button>
        )}
        {!isDefaultFilter && (
          <span style={{ fontSize: 13, color: 'var(--md-sys-color-on-surface-muted)' }}>
            顯示 {filtered.length} / {allCards.length} 張
          </span>
        )}
      </div>

      <div className="panel">
        <Table columns={columns} rows={filtered} getKey={c => c.id} stickyFirstCol emptyText="無符合條件的卡片" />
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────
export default function Dashboard({ cards, totalCapacity, onOpenCard, drillFilter, onDrill, members, siteUsers, deptColors = {} }: DashboardProps) {
  const memberByUid = useMemo(() => Object.fromEntries(members.map(m => [m.id, m])), [members]);
  const byDept = groupBy(cards, 'dept');

  const deptEst = Object.entries(byDept)
    .map(([dept, items]) => ({ name: DEPT_SHORT[dept] || dept, full: dept, value: sum(items.map(c => c.est)), color: deptColors[dept] ?? hue(DEPT_HUE[dept] || 1) }))
    .filter(d => d.value > 0).sort((a, b) => b.value - a.value);

  const memberEst = members.map(m => {
    const mc = cards.filter(c => c.owner === m.id);
    return { id: m.id, name: m.name, initial: m.initial, hue: m.hue, value: sum(mc.map(c => c.est)), actual: sum(mc.map(c => c.actual)), color: hue(m.hue) };
  }).filter(m => m.value > 0).sort((a, b) => b.value - a.value);

  const totalEst    = sum(cards.map(c => c.est));
  const totalActual = sum(cards.map(c => c.actual));
  const capPct      = totalCapacity > 0 ? Math.round((totalEst / totalCapacity) * 100) : 0;

  const xtabCols: ColDef[] = Object.keys(byDept).map(dept => ({ id: dept, name: DEPT_SHORT[dept] || dept, full: dept }));
  const getEstCell     = (m: Member, col: ColDef) => sum(cards.filter(c => c.owner === m.id && c.dept === col.id).map(c => c.est));
  const getActCell     = (m: Member, col: ColDef) => sum(cards.filter(c => c.owner === m.id && c.dept === col.id).map(c => c.actual));
  const getEstRowTotal = (m: Member) => sum(cards.filter(c => c.owner === m.id).map(c => c.est));
  const getActRowTotal = (m: Member) => sum(cards.filter(c => c.owner === m.id).map(c => c.actual));
  const activeMembers  = members.filter(m => cards.some(c => c.owner === m.id));
  const getEstColTotal = (col: ColDef) => sum(cards.filter(c => c.dept === col.id).map(c => c.est));
  const getActColTotal = (col: ColDef) => sum(cards.filter(c => c.dept === col.id).map(c => c.actual));

  function drill(f: DashFilter) { onDrill?.(f); }

  if (drillFilter) {
    return (
      <div className="body">
        <DrillView allCards={cards} drillFilter={drillFilter} onBack={() => onDrill?.(null)} onOpenCard={onOpenCard} memberByUid={memberByUid} siteUsers={siteUsers} />
      </div>
    );
  }

  return (
    <div className="body">
      <div className="dash layout-grid">
        <KpiCard label="需求單總數"   value={cards.length} unit="張" delta="+4 vs 上月" deltaDirection="up"    style={{ cursor: 'pointer' }} onClick={() => drill({})} />
        <KpiCard label="原始預估工時" value={totalEst}     unit="h"  delta={`${cards.length} 張單`}            style={{ cursor: 'pointer' }} onClick={() => drill({})} />
        <KpiCard label="實際消耗工時" value={totalActual}  unit="h"  delta={`${totalEst > 0 ? Math.round((totalActual / totalEst) * 100) : 0}% 進度`} style={{ cursor: 'pointer' }} onClick={() => drill({})} />
        <KpiCard label="本月量能"     value={capPct}       unit="%"  delta={`${totalCapacity}h 可用`} deltaDirection={totalEst / totalCapacity > 1 ? 'down' : 'up'} />

        <div className="panel chart-card pie-card">
          <div className="panel-h">
            <span className="panel-h-title">部門預估工時</span>
            <span className="panel-h-sub">本月</span>
            <span className="panel-h-spacer" />
            <Tag>{deptEst.length} 部門</Tag>
          </div>
          <div className="chart-body">
            <div className="chart-wrap">
              <CircleChart data={deptEst} size={180} kind="donut" centerValue={`${totalEst}h`} onSliceClick={i => drill({ dept: deptEst[i].full! })} />
            </div>
            <div className="legend">
              {deptEst.map((item, i) => (
                <div key={i} className="legend-row" style={{ cursor: 'pointer' }} onClick={() => drill({ dept: item.full! })}>
                  <div className="sw" style={{ background: item.color }} />
                  <span className="name" title={item.full || item.name}>{item.name}</span>
                  <span className="val">{item.value}h</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="panel chart-card pie-card">
          <div className="panel-h">
            <span className="panel-h-title">成員預估工時</span>
            <span className="panel-h-sub">本月</span>
            <span className="panel-h-spacer" />
            <Tag>{memberEst.length} 人</Tag>
          </div>
          <div className="chart-body">
            <div className="chart-wrap">
              <CircleChart data={memberEst.map(m => ({ name: m.name, value: m.value, color: hue(m.hue) }))} size={180} kind="donut" centerValue={`${totalEst}h`} onSliceClick={i => drill({ owner: memberEst[i].id })} />
            </div>
            <div className="legend">
              {memberEst.map((m, i) => (
                <div key={i} className="legend-row" style={{ cursor: 'pointer' }} onClick={() => drill({ owner: m.id })}>
                  <div className="sw" style={{ background: m.color }} />
                  <span className="name">{m.name}</span>
                  <span className="val">{m.value}h</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="panel table-card">
          <div className="panel-h">
            <span className="panel-h-title">成員 × 部門 (預估工時)</span>
            <span className="panel-h-spacer" />
            <Tag>{totalEst}h</Tag>
          </div>
          <Crosstab rows={activeMembers} cols={xtabCols} getCell={getEstCell} getRowTotal={getEstRowTotal} getColTotal={getEstColTotal} grandTotal={totalEst} onCellClick={(m, col) => drill({ owner: m.id, dept: col.id })} onRowClick={m => drill({ owner: m.id })} onColClick={col => drill({ dept: col.id })} />
        </div>

        <div className="panel table-card">
          <div className="panel-h">
            <span className="panel-h-title">成員 × 部門 (實際工時)</span>
            <span className="panel-h-spacer" />
            <Tag>{totalActual}h</Tag>
          </div>
          <Crosstab rows={activeMembers} cols={xtabCols} getCell={getActCell} getRowTotal={getActRowTotal} getColTotal={getActColTotal} grandTotal={totalActual} onCellClick={(m, col) => drill({ owner: m.id, dept: col.id })} onRowClick={m => drill({ owner: m.id })} onColClick={col => drill({ dept: col.id })} />
        </div>
      </div>
    </div>
  );
}
