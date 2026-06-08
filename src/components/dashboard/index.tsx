'use client';
import React, { useState, useMemo } from 'react';
import { ChevronLeft } from 'lucide-react';
import type { Card, Member, Cat } from '@/lib/types';
import type { AppUser } from '@/contexts/auth-context';
import { DEPT_SHORT, DEPT_HUE, STATUSES } from '@/lib/data';
import { sum, groupBy, hue } from '@/lib/utils';
import CircleChart from '@/components/charts/circle-chart';
import Crosstab from '@/components/dashboard/crosstab';

export interface DashFilter { dept?: string; owner?: string; }

interface DashboardProps {
  cards: Card[];
  totalCapacity: number;
  onOpenCard?: (card: Card) => void;
  drillFilter?: DashFilter | null;
  onDrill?: (f: DashFilter | null) => void;
  members: Member[];
  siteUsers: AppUser[];
}

interface ColDef { id: string; name: string; full?: string; }

// ── Card table (reused in drill view) ──────────────────────────────────────
function DrillCardTable({ cards, onOpenCard, memberByUid, siteUsers }: {
  cards: Card[];
  onOpenCard?: (card: Card) => void;
  memberByUid: Record<string, Member>;
  siteUsers: AppUser[];
}) {
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
              <th>原估(H)</th>
              <th>實際(H)</th>
              <th style={{ textAlign: 'left' }}>狀態</th>
            </tr>
          </thead>
          <tbody>
            {cards.length === 0 ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--muted)', padding: '24px 0' }}>無符合條件的卡片</td></tr>
            ) : cards.map(card => {
              const member = memberByUid[card.owner ?? ''];
              const requesterName = card.requesterName
                ?? (card.requester ? siteUsers.find(u => u.uid === card.requester)?.name : undefined);
              const status = STATUSES.find(s => s.id === card.status);
              const isOver = card.actual > card.est;
              return (
                <tr key={card.id}>
                  <td className="cell-num" style={{ fontSize: 12, fontFamily: 'var(--font-mono), monospace', letterSpacing: '0.02em' }}>{card.id}</td>
                  <td style={{ textAlign: 'left' }}>
                    {onOpenCard ? (
                      <button
                        onClick={() => onOpenCard(card)}
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'var(--ink)', fontFamily: 'inherit', fontSize: 'inherit', textAlign: 'left', lineHeight: 'inherit' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink)')}
                      >{card.title}</button>
                    ) : card.title}
                  </td>
                  <td style={{ textAlign: 'left' }}><span className="dept-pill" style={{ fontSize: 12 }}>{DEPT_SHORT[card.dept] || card.dept}</span></td>
                  <td style={{ textAlign: 'left' }}>{requesterName ?? '—'}</td>
                  <td style={{ textAlign: 'left' }}><span className="kcard-cat" data-cat={card.cat}>{card.cat}</span></td>
                  <td style={{ textAlign: 'left' }}>{member?.name ?? card.owner}</td>
                  <td className="cell-num">{card.est}</td>
                  <td className="cell-num" style={{ color: isOver ? 'var(--st-block)' : undefined }}>{card.actual}</td>
                  <td style={{ textAlign: 'left' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13 }}>
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

// ── Drill detail view ──────────────────────────────────────────────────────
function DrillView({ allCards, drillFilter, onBack, onOpenCard, memberByUid, siteUsers }: {
  allCards: Card[];
  drillFilter: DashFilter;
  onBack: () => void;
  onOpenCard?: (card: Card) => void;
  memberByUid: Record<string, Member>;
  siteUsers: AppUser[];
}) {
  // Sub-filter state — pre-initialised from drillFilter
  const [subDept,  setSubDept]  = useState(drillFilter.dept  ?? '');
  const [subOwner, setSubOwner] = useState(drillFilter.owner ?? '');
  const [subCat,   setSubCat]   = useState<Cat | ''>('');

  // Stats are based on the drill-fixed set (not sub-filtered)
  const drillCards = useMemo(() =>
    allCards.filter(c =>
      (!drillFilter.dept  || c.dept  === drillFilter.dept) &&
      (!drillFilter.owner || c.owner === drillFilter.owner)
    ), [allCards, drillFilter]);

  // Table rows respect sub-filters
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
  const hasSubFilter = !isDefaultFilter;

  return (
    <div className="history">
      {/* Header — matches history detail header */}
      <div className="history-detail-header">
        <button className="btn btn-ghost" onClick={onBack} style={{ gap: 4 }}>
          <ChevronLeft size={14} /> 返回總覽
        </button>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>{title}</h2>
        <span className="tag">{drillCards.length} 張</span>
      </div>

      {/* Stats row — matches history-detail-meta */}
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

      {/* Sub-filter row */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <select className="input" style={{ minWidth: 110 }} value={subOwner} onChange={e => setSubOwner(e.target.value)}>
          <option value="">全部受託人</option>
          {ownerIds.map(id => <option key={id} value={id}>{memberByUid[id]?.name ?? siteUsers.find(u => u.uid === id)?.name ?? id}</option>)}
        </select>
        <select className="input" style={{ minWidth: 110 }} value={subDept} onChange={e => setSubDept(e.target.value)}>
          <option value="">全部發起單位</option>
          {depts.map(d => <option key={d} value={d}>{DEPT_SHORT[d] || d}</option>)}
        </select>
        <select className="input" style={{ minWidth: 100 }} value={subCat} onChange={e => setSubCat(e.target.value as Cat | '')}>
          <option value="">全部類別</option>
          <option value="UIUX">UIUX</option>
          <option value="平面視覺">平面視覺</option>
        </select>
        {hasSubFilter && (
          <button className="btn btn-ghost" onClick={() => { setSubDept(drillFilter.dept ?? ''); setSubOwner(drillFilter.owner ?? ''); setSubCat(''); }}>
            清除篩選
          </button>
        )}
        {hasSubFilter && (
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>
            顯示 {filtered.length} / {allCards.length} 張
          </span>
        )}
      </div>

      <DrillCardTable cards={filtered} onOpenCard={onOpenCard} memberByUid={memberByUid} siteUsers={siteUsers} />
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────
export default function Dashboard({ cards, totalCapacity, onOpenCard, drillFilter, onDrill, members, siteUsers }: DashboardProps) {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const memberByUid = useMemo(() => Object.fromEntries(members.map(m => [m.id, m])), [members]);

  const byDept = groupBy(cards, 'dept');

  const deptEst = Object.entries(byDept)
    .map(([dept, items]) => ({
      name: DEPT_SHORT[dept] || dept,
      full: dept,
      value: sum(items.map(c => c.est)),
      color: hue(DEPT_HUE[dept] || 1),
    }))
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value);

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
  const memberChartData = memberEst.map(m => ({ name: m.name, value: m.value, color: hue(m.hue) }));

  // ── Drill view ───────────────────────────────────────────────────────────
  if (drillFilter) {
    return (
      <div className="body">
        <DrillView
          allCards={cards}
          drillFilter={drillFilter}
          onBack={() => onDrill?.(null)}
          onOpenCard={onOpenCard}
          memberByUid={memberByUid}
          siteUsers={siteUsers}
        />
      </div>
    );
  }

  // ── Overview ─────────────────────────────────────────────────────────────
  return (
    <div className="body">
      <div className="dash layout-grid" style={isMobile ? { gridTemplateColumns: '1fr 1fr' } : undefined}>
        <div className="kpi" style={{ cursor: 'pointer' }} onClick={() => drill({})}>
          <div className="kpi-lbl">需求單總數</div>
          <div className="kpi-val">{cards.length}<span className="unit">張</span></div>
          <div className="kpi-delta up">+4 vs 上月</div>
        </div>
        <div className="kpi" style={{ cursor: 'pointer' }} onClick={() => drill({})}>
          <div className="kpi-lbl">原始預估工時</div>
          <div className="kpi-val">{totalEst}<span className="unit">h</span></div>
          <div className="kpi-delta">{cards.length} 張單</div>
        </div>
        <div className="kpi" style={{ cursor: 'pointer' }} onClick={() => drill({})}>
          <div className="kpi-lbl">實際消耗工時</div>
          <div className="kpi-val">{totalActual}<span className="unit">h</span></div>
          <div className="kpi-delta">{totalEst > 0 ? Math.round((totalActual / totalEst) * 100) : 0}% 進度</div>
        </div>
        <div className="kpi">
          <div className="kpi-lbl">本月量能</div>
          <div className="kpi-val">{capPct}<span className="unit">%</span></div>
          <div className={`kpi-delta${totalEst / totalCapacity > 1 ? ' down' : ' up'}`}>{totalCapacity}h 可用</div>
        </div>

        <div className="panel chart-card pie-card" style={isMobile ? { gridColumn: 'span 2' } : undefined}>
          <div className="panel-h">
            <span className="panel-h-title">部門預估工時</span>
            <span className="panel-h-sub">本月</span>
            <span className="panel-h-spacer" />
            <span className="tag">{deptEst.length} 部門</span>
          </div>
          <div className="chart-body">
            <div className="chart-wrap">
              <CircleChart data={deptEst} size={180} kind="donut" centerValue={`${totalEst}h`}
                onSliceClick={i => drill({ dept: deptEst[i].full! })} />
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

        <div className="panel chart-card pie-card" style={isMobile ? { gridColumn: 'span 2' } : undefined}>
          <div className="panel-h">
            <span className="panel-h-title">成員預估工時</span>
            <span className="panel-h-sub">本月</span>
            <span className="panel-h-spacer" />
            <span className="tag">{memberEst.length} 人</span>
          </div>
          <div className="chart-body">
            <div className="chart-wrap">
              <CircleChart data={memberChartData} size={180} kind="donut" centerValue={`${totalEst}h`}
                onSliceClick={i => drill({ owner: memberEst[i].id })} />
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

        <div className="panel table-card" style={isMobile ? { gridColumn: 'span 2' } : undefined}>
          <div className="panel-h">
            <span className="panel-h-title">成員 × 部門 (預估工時)</span>
            <span className="panel-h-spacer" />
            <span className="tag">{totalEst}h</span>
          </div>
          <Crosstab rows={activeMembers} cols={xtabCols}
            getCell={getEstCell} getRowTotal={getEstRowTotal}
            getColTotal={getEstColTotal} grandTotal={totalEst}
            onCellClick={(m, col) => drill({ owner: m.id, dept: col.id })}
            onRowClick={m => drill({ owner: m.id })}
            onColClick={col => drill({ dept: col.id })} />
        </div>

        <div className="panel table-card" style={isMobile ? { gridColumn: 'span 2' } : undefined}>
          <div className="panel-h">
            <span className="panel-h-title">成員 × 部門 (實際工時)</span>
            <span className="panel-h-spacer" />
            <span className="tag">{totalActual}h</span>
          </div>
          <Crosstab rows={activeMembers} cols={xtabCols}
            getCell={getActCell} getRowTotal={getActRowTotal}
            getColTotal={getActColTotal} grandTotal={totalActual}
            onCellClick={(m, col) => drill({ owner: m.id, dept: col.id })}
            onRowClick={m => drill({ owner: m.id })}
            onColClick={col => drill({ dept: col.id })} />
        </div>
      </div>
    </div>
  );
}
