'use client';
import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Card, Member } from '@/lib/types';
import { DEPT_SHORT, DEPT_HUE, MEMBERS, MEMBER_BY_ID, SITE_USER_BY_ID, STATUSES } from '@/lib/data';
import { sum, groupBy, hue } from '@/lib/utils';
import CircleChart from '@/components/charts/circle-chart';
import BarsChart from '@/components/charts/bars-chart';
import Crosstab from '@/components/dashboard/crosstab';

interface DashboardProps {
  cards: Card[];
  totalCapacity: number;
  filterDept: string;
  onOpenCard?: (card: Card) => void;
  // kept for API compat but unused (layout fixed to grid, chartType fixed to donut)
  layout?: string;
  chartType?: string;
}

interface ColDef { id: string; name: string; full?: string; }
interface ModalFilter { label: string; cards: Card[]; }

function CardListModal({ filter, onClose, onOpenCard }: { filter: ModalFilter; onClose: () => void; onOpenCard?: (card: Card) => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} onClick={onClose} />
      <div style={{ position: 'relative', zIndex: 1, background: 'var(--surface)', borderRadius: 14, boxShadow: '0 16px 48px rgba(0,0,0,.2)', width: 'min(840px, 90vw)', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--divider)' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{filter.label}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{filter.cards.length} 張需求單</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', padding: 4 }}><X size={16} /></button>
        </div>
        <div style={{ overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr style={{ background: 'var(--surface-2)' }}>
                <th style={{ textAlign: 'left', padding: '8px 16px', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>ID</th>
                <th style={{ textAlign: 'left', padding: '8px 16px', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', minWidth: 180 }}>標題</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>發起單位</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>委託人</th>
                <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>受託人</th>
                <th style={{ textAlign: 'right', padding: '8px 12px', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>預估(h)</th>
                <th style={{ textAlign: 'right', padding: '8px 12px', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>實際(h)</th>
                <th style={{ textAlign: 'left', padding: '8px 16px', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>狀態</th>
              </tr>
            </thead>
            <tbody>
              {filter.cards.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: 'var(--muted)' }}>無資料</td></tr>
              ) : filter.cards.map(c => {
                const member = MEMBER_BY_ID[c.owner];
                const requester = c.requester ? SITE_USER_BY_ID[c.requester] : undefined;
                const status = STATUSES.find(s => s.id === c.status);
                const isOver = c.actual > c.est;
                return (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--divider)' }}>
                    <td style={{ padding: '9px 16px', fontFamily: 'var(--font-mono), monospace', fontSize: 11, color: 'var(--muted)' }}>{c.id}</td>
                    <td style={{ padding: '9px 16px', fontWeight: 500 }}>
                      {onOpenCard ? (
                        <span
                          style={{ cursor: 'pointer', color: 'var(--accent)' }}
                          onClick={() => { onOpenCard(c); onClose(); }}
                        >{c.title}</span>
                      ) : c.title}
                    </td>
                    <td style={{ padding: '9px 12px' }}>
                      <span className="dept-pill" style={{ fontSize: 11 }}>{DEPT_SHORT[c.dept] || c.dept}</span>
                    </td>
                    <td style={{ padding: '9px 12px', color: 'var(--ink-2)' }}>{requester?.name ?? '—'}</td>
                    <td style={{ padding: '9px 12px', color: 'var(--ink-2)' }}>{member?.name ?? '—'}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: 'var(--font-mono), monospace' }}>{c.est}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: 'var(--font-mono), monospace', color: isOver ? 'var(--st-block)' : undefined }}>{c.actual}</td>
                    <td style={{ padding: '9px 16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5 }}>
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
    </div>
  );
}

export default function Dashboard({ cards, totalCapacity, onOpenCard }: DashboardProps) {
  const [modal, setModal] = useState<ModalFilter | null>(null);

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

  const totalEst = sum(cards.map(c => c.est));
  const totalActual = sum(cards.map(c => c.actual));
  const capPct = totalCapacity > 0 ? Math.round((totalEst / totalCapacity) * 100) : 0;

  const xtabCols: ColDef[] = Object.keys(byDept).map(dept => ({ id: dept, name: DEPT_SHORT[dept] || dept, full: dept }));
  const getEstCell = (m: Member, col: ColDef) => sum(cards.filter(c => c.owner === m.id && c.dept === col.id).map(c => c.est));
  const getActCell = (m: Member, col: ColDef) => sum(cards.filter(c => c.owner === m.id && c.dept === col.id).map(c => c.actual));
  const getEstRowTotal = (m: Member) => sum(cards.filter(c => c.owner === m.id).map(c => c.est));
  const getActRowTotal = (m: Member) => sum(cards.filter(c => c.owner === m.id).map(c => c.actual));
  const getEstColTotal = (col: ColDef) => sum(cards.filter(c => c.dept === col.id).map(c => c.est));
  const getActColTotal = (col: ColDef) => sum(cards.filter(c => c.dept === col.id).map(c => c.actual));

  function openDept(full: string, name: string) {
    setModal({ label: name, cards: cards.filter(c => c.dept === full) });
  }
  function openMember(id: string, name: string) {
    setModal({ label: `${name} 的需求單`, cards: cards.filter(c => c.owner === id) });
  }

  const memberChartData = memberEst.map(m => ({ name: m.name, value: m.value, color: hue(m.hue) }));

  return (
    <div className="body">
      {modal && <CardListModal filter={modal} onClose={() => setModal(null)} onOpenCard={onOpenCard} />}

      <div className="dash layout-grid">
        {/* KPI 卡 */}
        <div className="kpi">
          <div className="kpi-lbl">需求單總數</div>
          <div className="kpi-val">{cards.length}<span className="unit">張</span></div>
          <div className="kpi-delta up">+4 vs 上月</div>
        </div>
        <div className="kpi" style={{ cursor: 'pointer' }} onClick={() => setModal({ label: '原始預估工時', cards })}>
          <div className="kpi-lbl">原始預估工時</div>
          <div className="kpi-val">{totalEst}<span className="unit">h</span></div>
          <div className="kpi-delta">{cards.length} 張單</div>
        </div>
        <div className="kpi" style={{ cursor: 'pointer' }} onClick={() => setModal({ label: '實際消耗工時', cards: cards.filter(c => c.actual > 0) })}>
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
                centerValue={`${totalEst}h`} centerLabel="預估"
                onSliceClick={i => openDept(deptEst[i].full!, deptEst[i].name)}
              />
            </div>
            <div className="legend">
              {deptEst.map((item, i) => (
                <div key={i} className="legend-row" style={{ cursor: 'pointer' }} onClick={() => openDept(item.full!, item.name)}>
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
                centerValue={`${totalEst}h`} centerLabel="預估"
                onSliceClick={i => openMember(memberEst[i].id, memberEst[i].name)}
              />
            </div>
            <div className="legend">
              {memberEst.map((m, i) => (
                <div key={i} className="legend-row" style={{ cursor: 'pointer' }} onClick={() => openMember(m.id, m.name)}>
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
            onCellClick={(m, col) => setModal({ label: `${m.name} × ${col.name} (預估)`, cards: cards.filter(c => c.owner === m.id && c.dept === col.id) })}
            onRowClick={m => setModal({ label: `${m.name} 的需求單`, cards: cards.filter(c => c.owner === m.id) })}
            onColClick={col => openDept(col.id, col.name)}
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
            onCellClick={(m, col) => setModal({ label: `${m.name} × ${col.name} (實際)`, cards: cards.filter(c => c.owner === m.id && c.dept === col.id) })}
            onRowClick={m => setModal({ label: `${m.name} 的需求單`, cards: cards.filter(c => c.owner === m.id) })}
            onColClick={col => openDept(col.id, col.name)}
          />
        </div>
      </div>
    </div>
  );
}
