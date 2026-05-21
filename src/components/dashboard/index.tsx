'use client';
import React from 'react';
import type { Card, DashLayout, ChartType, Member } from '@/lib/types';
import { DEPT_SHORT, DEPT_HUE, MEMBERS } from '@/lib/data';
import { sum, groupBy, hue } from '@/lib/utils';
import CircleChart from '@/components/charts/circle-chart';
import BarsChart from '@/components/charts/bars-chart';
import Crosstab from '@/components/dashboard/crosstab';

interface DashboardProps {
  cards: Card[];
  layout: DashLayout;
  chartType: ChartType;
  totalCapacity: number;
  filterDept: string;
}

interface ColDef {
  id: string;
  name: string;
  full?: string;
}

export default function Dashboard({
  cards,
  layout,
  chartType,
  totalCapacity,
  filterDept,
}: DashboardProps) {
  const byDept = groupBy(cards, 'dept');

  const deptEst = Object.entries(byDept)
    .map(([dept, items]) => ({
      name: DEPT_SHORT[dept] || dept,
      full: dept,
      value: sum(items.map((c) => c.est)),
      color: hue(DEPT_HUE[dept] || 1),
    }))
    .sort((a, b) => b.value - a.value);

  const memberEst = MEMBERS.map((m) => {
    const memberCards = cards.filter((c) => c.owner === m.id);
    return {
      id: m.id,
      name: m.name,
      initial: m.initial,
      hue: m.hue,
      value: sum(memberCards.map((c) => c.est)),
      actual: sum(memberCards.map((c) => c.actual)),
      color: hue(m.hue),
    };
  })
    .filter((m) => m.value > 0)
    .sort((a, b) => b.value - a.value);

  const totalEst = sum(cards.map((c) => c.est));
  const totalActual = sum(cards.map((c) => c.actual));
  const doneCount = cards.filter((c) => c.status === 'done').length;
  const inProgressCount = cards.filter((c) => c.status === 'designing').length;

  const capPct = totalCapacity > 0 ? Math.round((totalEst / totalCapacity) * 100) : 0;

  const kpis = [
    {
      lbl: '需求單總數',
      val: cards.length,
      unit: '張',
      delta: '+4 vs 上月',
      cls: 'up' as const,
    },
    {
      lbl: '原始預估工時',
      val: totalEst,
      unit: 'h',
      delta: `${cards.length} 張單`,
      cls: undefined,
    },
    {
      lbl: '實際消耗工時',
      val: totalActual,
      unit: 'h',
      delta: `${totalEst > 0 ? Math.round((totalActual / totalEst) * 100) : 0}% 進度`,
      cls: undefined,
    },
    {
      lbl: '本月量能',
      val: capPct,
      unit: '%',
      delta: `${totalCapacity}h 可用`,
      cls: totalEst / totalCapacity > 1 ? ('down' as const) : ('up' as const),
    },
  ];

  // Crosstab cols from byDept
  const xtabCols: ColDef[] = Object.keys(byDept).map((dept) => ({
    id: dept,
    name: DEPT_SHORT[dept] || dept,
    full: dept,
  }));

  const getEstCell = (m: Member, col: ColDef) =>
    sum(cards.filter((c) => c.owner === m.id && c.dept === col.id).map((c) => c.est));

  const getActCell = (m: Member, col: ColDef) =>
    sum(cards.filter((c) => c.owner === m.id && c.dept === col.id).map((c) => c.actual));

  const getEstRowTotal = (m: Member) =>
    sum(cards.filter((c) => c.owner === m.id).map((c) => c.est));

  const getActRowTotal = (m: Member) =>
    sum(cards.filter((c) => c.owner === m.id).map((c) => c.actual));

  const getEstColTotal = (col: ColDef) =>
    sum(cards.filter((c) => c.dept === col.id).map((c) => c.est));

  const getActColTotal = (col: ColDef) =>
    sum(cards.filter((c) => c.dept === col.id).map((c) => c.actual));

  const grandEst = totalEst;
  const grandAct = totalActual;

  function KPIs({ className }: { className?: string }) {
    return (
      <>
        {kpis.map((k, i) => (
          <div key={i} className={`kpi${className ? ' ' + className : ''}`}>
            <div className="kpi-lbl">{k.lbl}</div>
            <div className="kpi-val">
              {k.val}
              <span className="unit">{k.unit}</span>
            </div>
            <div className={`kpi-delta${k.cls ? ' ' + k.cls : ''}`}>{k.delta}</div>
          </div>
        ))}
      </>
    );
  }

  function ChartCard({
    title,
    sub,
    data,
    count,
    className,
  }: {
    title: string;
    sub?: string;
    data: { name: string; value: number; color: string; full?: string }[];
    count?: string;
    className?: string;
  }) {
    const total = sum(data.map((d) => d.value));
    return (
      <div className={`panel chart-card${className ? ' ' + className : ''}`}>
        <div className="panel-h">
          <span className="panel-h-title">{title}</span>
          {sub && <span className="panel-h-sub">{sub}</span>}
          <span className="panel-h-spacer" />
          {count && <span className="tag">{count}</span>}
        </div>
        <div className="chart-body">
          {chartType === 'bars' ? (
            <BarsChart data={data} />
          ) : (
            <>
              <div className="chart-wrap">
                <CircleChart
                  data={data}
                  size={180}
                  kind={chartType}
                  centerValue={chartType === 'donut' ? `${total}h` : undefined}
                  centerLabel={chartType === 'donut' ? '預估' : undefined}
                />
              </div>
              <div className="legend">
                {data.map((item, i) => (
                  <div key={i} className="legend-row">
                    <div className="sw" style={{ background: item.color }} />
                    <span className="name" title={item.full || item.name}>
                      {item.name}
                    </span>
                    <span className="val">{item.value}h</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  function EstCrosstab({ className }: { className?: string }) {
    return (
      <div className={`panel${className ? ' ' + className : ''}`}>
        <div className="panel-h">
          <span className="panel-h-title">成員 × 部門 (預估工時)</span>
          <span className="panel-h-spacer" />
          <span className="tag">{grandEst}h</span>
        </div>
        <Crosstab
          rows={MEMBERS}
          cols={xtabCols}
          getCell={getEstCell}
          getRowTotal={getEstRowTotal}
          getColTotal={getEstColTotal}
          grandTotal={grandEst}
        />
      </div>
    );
  }

  function ActCrosstab({ className }: { className?: string }) {
    return (
      <div className={`panel${className ? ' ' + className : ''}`}>
        <div className="panel-h">
          <span className="panel-h-title">成員 × 部門 (實際工時)</span>
          <span className="panel-h-spacer" />
          <span className="tag">{grandAct}h</span>
        </div>
        <Crosstab
          rows={MEMBERS}
          cols={xtabCols}
          getCell={getActCell}
          getRowTotal={getActRowTotal}
          getColTotal={getActColTotal}
          grandTotal={grandAct}
        />
      </div>
    );
  }

  const memberChartData = memberEst.map((m) => ({
    name: m.name,
    value: m.value,
    color: hue(m.hue),
  }));

  if (layout === 'classic') {
    return (
      <div className="body">
        <div className="dash layout-classic">
          {kpis.map((k, i) => (
            <div key={i} className="kpi">
              <div className="kpi-lbl">{k.lbl}</div>
              <div className="kpi-val">
                {k.val}
                <span className="unit">{k.unit}</span>
              </div>
              <div className={`kpi-delta${k.cls ? ' ' + k.cls : ''}`}>{k.delta}</div>
            </div>
          ))}
          <ChartCard
            title="部門預估工時"
            sub="本月"
            data={deptEst}
            count={`${deptEst.length} 部門`}
          />
          <ChartCard
            title="成員預估工時"
            sub="本月"
            data={memberChartData}
            count={`${memberEst.length} 人`}
          />
          <EstCrosstab className="col-span-2" />
          <ActCrosstab className="col-span-2" />
        </div>
      </div>
    );
  }

  if (layout === 'focus') {
    return (
      <div className="body">
        <div className="dash layout-focus">
          <div className="focus-hero">
            <EstCrosstab />
            <ActCrosstab />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="focus-kpis">
              {kpis.map((k, i) => (
                <div key={i} className="kpi">
                  <div className="kpi-lbl">{k.lbl}</div>
                  <div className="kpi-val">
                    {k.val}
                    <span className="unit">{k.unit}</span>
                  </div>
                  <div className={`kpi-delta${k.cls ? ' ' + k.cls : ''}`}>{k.delta}</div>
                </div>
              ))}
            </div>
            <ChartCard
              title="部門預估工時"
              sub="本月"
              data={deptEst}
              count={`${deptEst.length} 部門`}
            />
            <ChartCard
              title="成員預估工時"
              sub="本月"
              data={memberChartData}
              count={`${memberEst.length} 人`}
            />
          </div>
        </div>
      </div>
    );
  }

  // grid layout
  return (
    <div className="body">
      <div className="dash layout-grid">
        {kpis.map((k, i) => (
          <div key={i} className="kpi">
            <div className="kpi-lbl">{k.lbl}</div>
            <div className="kpi-val">
              {k.val}
              <span className="unit">{k.unit}</span>
            </div>
            <div className={`kpi-delta${k.cls ? ' ' + k.cls : ''}`}>{k.delta}</div>
          </div>
        ))}
        <ChartCard
          title="部門預估工時"
          sub="本月"
          data={deptEst}
          count={`${deptEst.length} 部門`}
          className="pie-card"
        />
        <ChartCard
          title="成員預估工時"
          sub="本月"
          data={memberChartData}
          count={`${memberEst.length} 人`}
          className="pie-card"
        />
        <EstCrosstab className="table-card" />
        <ActCrosstab className="table-card" />
      </div>
    </div>
  );
}
