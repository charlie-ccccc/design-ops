'use client';
import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import type { Card, Member } from '@/lib/types';
import { DEPT_SHORT, DEPT_HUE, MEMBERS, MEMBER_BY_ID, SITE_USER_BY_ID, STATUSES, DEPTS } from '@/lib/data';
import { sum, groupBy, hue } from '@/lib/utils';
import CircleChart from '@/components/charts/circle-chart';
import Crosstab from '@/components/dashboard/crosstab';

export interface DashFilter { dept?: string; owner?: string; }

interface DashboardProps {
  cards: Card[];
  totalCapacity: number;
  filterDept: string;
  onOpenCard?: (card: Card) => void;
  drillFilter?: DashFilter | null;
  onDrill?: (f: DashFilter | null) => void;
}

interface ColDef { id: string; name: string; full?: string; }

// ── Drill detail view ──────────────────────────────────────────────────────
function DrillView({ cards, drillFilter, onBack, onOpenCard }: {
  cards: Card[];
  drillFilter: DashFilter;
  onBack: () => void;
  onOpenCard?: (card: Card) => void;
}) {
  const [subDept, setSubDept]     = useState('');
  const [subOwner, setSubOwner]   = useState('');
  const [subCat, setSubCat]       = useState('');

  // Derive label
  const deptLabel   = drillFilter.dept  ? (DEPT_SHORT[drillFilter.dept]  || drillFilter.dept)  : '';
  const memberLabel = drillFilter.owner ? (MEMBER_BY_ID[drillFilter.owner]?.name || drillFilter.owner) : '';
  const title = [deptLabel, memberLabel].filter(Boolean).join(' × ') || '全部';

  // Apply sub-filters
  const filtered = cards.filter(c =>
    (!subDept  || c.dept  === subDept) &&
    (!subOwner || c.owner === subOwner) &&
    (!subCat   || c.cat   === subCat)
  );

  const totalEst    = sum(filtered.map(c => c.est));
  const totalActual = sum(filtered.map(c => c.actual));

  // Distinct owners in this drill set for the sub-filter dropdown
  const ownerIds = [...new Set(cards.map(c => c.owner).filter(Boolean))];
  const depts    = [...new Set(cards.map(c => c.dept).filter(Boolean))];
  const cats     = [...new Set(cards.map(c => c.cat).filter(Boolean))];

  return (
    <div style={{ padding: '0 0 40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button
          onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 14, padding: 0 }}
        >
          <ChevronLeft size={16} /> 返回總覽
        </button>
        <span style={{ color: 'var(--divider)' }}>|</span>
        <span style={{ fontSize: 16, fontWeight: 600 }}>{title}</span>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>{cards.length} 張需求單</span>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {[
          { label: '需求單', value: `${filtered.length} 張` },
          { label: '原始預估', value: `${totalEst}h` },
          { label: '實際消耗', value: `${totalActual}h` },
          { label: '進度', value: totalEst > 0 ? `${Math.round(totalActual / totalEst * 100)}%` : '—' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 18px', minWidth: 90 }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Sub-filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {!drillFilter.owner && ownerIds.length > 1 && (
          <select className="input" value={subOwner} onChange={e => setSubOwner(e.target.value)}>
            <option value="">全部受託人</option>
            {ownerIds.map(id => (
              <option key={id} value={id}>{MEMBER_BY_ID[id]?.name || id}</option>
            ))}
          </select>
        )}
        {!drillFilter.dept && depts.length > 1 && (
          <select className="input" value={subDept} onChange={e => setSubDept(e.target.value)}>
            <option value="">全部發起單位</option>
            {depts.map(d => <option key={d} value={d}>{DEPT_SHORT[d] || d}</option>)}
          </select>
        )}
        {cats.length > 1 && (
          <select className="input" value={subCat} onChange={e => setSubCat(e.target.value)}>
            <option value="">全部類別</option>
            {cats.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
      </div>

      {/* Card table */}
      <div className="xtab-wrap">
        <table className="xtab" style={{ fontSize: 14 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', whiteSpace: 'nowrap' }}>ID</th>
              <th style={{ textAlign: 'left', minWidth: 200 }}>標題</th>
              <th style={{ textAlign: 'left' }}>需求發起單位</th>
              <th style={{ textAlign: 'left' }}>委託人</th>
              <th style={{ textAlign: 'left' }}>受託人</th>
              <th style={{ textAlign: 'right' }}>原估(H)</th>
              <th style={{ textAlign: 'right' }}>實際(H)</th>
              <th style={{ textAlign: 'left' }}>狀態</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 24, color: 'var(--muted)' }}>無資料</td></tr>
            ) : filtered.map(c => {
              const member = MEMBER_BY_ID[c.owner];
              const requesterName = c.requesterName ?? (c.requester ? SITE_USER_BY_ID[c.requester]?.name : undefined);
              const status = STATUSES.find(s => s.id === c.status);
              const isOver = c.actual > c.est;
              return (
                <tr key={c.id}>
                  <td style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 12, color: 'var(--muted)' }}>{c.id}</td>
                  <td style={{ fontWeight: 500 }}>
                    {onOpenCard
                      ? <span style={{ cursor: 'pointer', color: 'var(--accent)' }} onClick={() => onOpenCard(c)}>{c.title}</span>
                      : c.title}
                  </td>
                  <td><span className="dept-pill" style={{ fontSize: 12 }}>{DEPT_SHORT[c.dept] || c.dept}</span></td>
                  <td style={{ color: 'var(--ink-2)' }}>{requesterName ?? '—'}</td>
                  <td style={{ color: 'var(--ink-2)' }}>{member?.name ?? '—'}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono), monospace' }}>{c.est}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono), monospace', color: isOver ? 'var(--st-block)' : undefined }}>{c.actual}</td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: status?.dot, flexShrink: 0 }} />
                      {status?.name ?? c.status}
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

// ── Main Dashboard ─────────────────────────────────────────────────────────
export default function Dashboard({ cards, totalCapacity, onOpenCard, drillFilter, onDrill }: DashboardProps) {
  const byDept = groupBy(cards, 'dept');

  const deptEst = Object.entries(byDept)
    .map(([dept, items]) => ({
      name: DEPT_SHORT[dept] || dept,
      full: dept,
      value: sum(items.map(c => c.est)),
      color: hue(DEPT_HUE[dept] || 1),
    }))
    .sort((a, b) => b.value - a.value);

  const memberEst = MEMBERS.map(m => {
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
  const getEstColTotal = (col: ColDef) => sum(cards.filter(c => c.dept === col.id).map(c => c.est));
  const getActColTotal = (col: ColDef) => sum(cards.filter(c => c.dept === col.id).map(c => c.actual));

  function drill(f: DashFilter) { onDrill?.(f); }

  const memberChartData = memberEst.map(m => ({ name: m.name, value: m.value, color: hue(m.hue) }));

  // ── Drill view ───────────────────────────────────────────────────────────
  if (drillFilter) {
    const drillCards = cards.filter(c =>
      (!drillFilter.dept  || c.dept  === drillFilter.dept) &&
      (!drillFilter.owner || c.owner === drillFilter.owner)
    );
    return (
      <DrillView
        cards={drillCards}
        drillFilter={drillFilter}
        onBack={() => onDrill?.(null)}
        onOpenCard={onOpenCard}
      />
    );
  }

  // ── Overview ─────────────────────────────────────────────────────────────
  return (
    <div className="body">
      <div className="dash layout-grid">
        {/* KPI */}
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

        {/* 部門圓餅 */}
        <div className="panel chart-card pie-card">
          <div className="panel-h">
            <span className="panel-h-title">部門預估工時</span>
            <span className="panel-h-sub">本月</span>
            <span className="panel-h-spacer" />
            <span className="tag">{deptEst.length} 部門</span>
          </div>
          <div className="chart-body">
            <div className="chart-wrap">
              <CircleChart
                data={deptEst} size={180} kind="donut"
                centerValue={`${totalEst}h`}
                onSliceClick={i => drill({ dept: deptEst[i].full! })}
              />
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

        {/* 成員圓餅 */}
        <div className="panel chart-card pie-card">
          <div className="panel-h">
            <span className="panel-h-title">成員預估工時</span>
            <span className="panel-h-sub">本月</span>
            <span className="panel-h-spacer" />
            <span className="tag">{memberEst.length} 人</span>
          </div>
          <div className="chart-body">
            <div className="chart-wrap">
              <CircleChart
                data={memberChartData} size={180} kind="donut"
                centerValue={`${totalEst}h`}
                onSliceClick={i => drill({ owner: memberEst[i].id })}
              />
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

        {/* 預估工時交叉表 */}
        <div className="panel table-card">
          <div className="panel-h">
            <span className="panel-h-title">成員 × 部門 (預估工時)</span>
            <span className="panel-h-spacer" />
            <span className="tag">{totalEst}h</span>
          </div>
          <Crosstab rows={MEMBERS} cols={xtabCols}
            getCell={getEstCell} getRowTotal={getEstRowTotal}
            getColTotal={getEstColTotal} grandTotal={totalEst}
            onCellClick={(m, col) => drill({ owner: m.id, dept: col.id })}
            onRowClick={m => drill({ owner: m.id })}
            onColClick={col => drill({ dept: col.id })}
          />
        </div>

        {/* 實際工時交叉表 */}
        <div className="panel table-card">
          <div className="panel-h">
            <span className="panel-h-title">成員 × 部門 (實際工時)</span>
            <span className="panel-h-spacer" />
            <span className="tag">{totalActual}h</span>
          </div>
          <Crosstab rows={MEMBERS} cols={xtabCols}
            getCell={getActCell} getRowTotal={getActRowTotal}
            getColTotal={getActColTotal} grandTotal={totalActual}
            onCellClick={(m, col) => drill({ owner: m.id, dept: col.id })}
            onRowClick={m => drill({ owner: m.id })}
            onColClick={col => drill({ dept: col.id })}
          />
        </div>
      </div>
    </div>
  );
}
