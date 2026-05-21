'use client';
import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { Card, LeaveEntry } from '@/lib/types';
import { MEMBERS, MEMBER_BY_ID, DEPT_SHORT, DEPT_HUE } from '@/lib/data';
import { sum, hue } from '@/lib/utils';

interface AdminProps {
  cards: Card[];
  baseHours: Record<string, number>;
  setBaseHours: (h: Record<string, number>) => void;
  leave: LeaveEntry[];
  setLeave: (l: LeaveEntry[]) => void;
  month: string;
}

function capClass(pct: number) {
  if (pct > 100) return 'over';
  if (pct > 85) return 'warn';
  return 'ok';
}

function capColor(pct: number) {
  if (pct > 100) return 'var(--st-block)';
  if (pct > 85) return 'var(--st-review)';
  return 'var(--accent)';
}

export default function Admin({
  cards,
  baseHours,
  setBaseHours,
  leave,
  setLeave,
  month,
}: AdminProps) {
  const [newLeave, setNewLeave] = useState({
    member: MEMBERS[0].id,
    date: '',
    hours: 8,
  });

  // Per-member calculations
  const memberRows = MEMBERS.map((m) => {
    const base = baseHours[m.id] ?? m.base;
    const leaveTotal = sum(leave.filter((l) => l.member === m.id).map((l) => l.hours));
    const avail = Math.max(0, base - leaveTotal);
    const load = sum(cards.filter((c) => c.owner === m.id).map((c) => c.est));
    const pct = avail > 0 ? Math.round((load / avail) * 100) : 0;
    return { m, base, leaveTotal, avail, load, pct };
  });

  const totalBase = sum(memberRows.map((r) => r.base));
  const totalLeave = sum(memberRows.map((r) => r.leaveTotal));
  const totalAvail = sum(memberRows.map((r) => r.avail));
  const totalLoad = sum(memberRows.map((r) => r.load));
  const totalPct = totalAvail > 0 ? Math.round((totalLoad / totalAvail) * 100) : 0;

  // Dept load aggregation
  const deptLoads: { dept: string; load: number }[] = [];
  const deptMap: Record<string, number> = {};
  for (const c of cards) {
    deptMap[c.dept] = (deptMap[c.dept] || 0) + c.est;
  }
  for (const [dept, load] of Object.entries(deptMap)) {
    deptLoads.push({ dept, load });
  }
  deptLoads.sort((a, b) => b.load - a.load);
  const maxDeptLoad = Math.max(...deptLoads.map((d) => d.load), 1);

  // Stat tiles
  const statTiles = [
    { lbl: '總可用工時', val: `${totalAvail}h` },
    { lbl: '總承接工時', val: `${totalLoad}h` },
    { lbl: '總請假工時', val: `${totalLeave}h` },
    { lbl: '已完成工單', val: `${cards.filter((c) => c.status === 'done').length} 張` },
    { lbl: '設計中工單', val: `${cards.filter((c) => c.status === 'designing').length} 張` },
  ];

  function addLeave() {
    if (!newLeave.date.trim() || newLeave.hours <= 0) return;
    const entry: LeaveEntry = {
      id: `lv${Date.now()}`,
      member: newLeave.member,
      date: newLeave.date,
      hours: newLeave.hours,
    };
    setLeave([...leave, entry]);
    setNewLeave((p) => ({ ...p, date: '', hours: 8 }));
  }

  function deleteLeave(id: string) {
    setLeave(leave.filter((l) => l.id !== id));
  }

  return (
    <div className="body">
      <div className="cap-grid">
        {/* Left: Capacity table */}
        <div className="panel">
          <div className="panel-h">
            <span className="panel-h-title">成員量能設定</span>
            <span className="panel-h-sub">{month}</span>
            <span className="panel-h-spacer" />
            <span className="tag">{MEMBERS.length} 人</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="cap-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>成員 / 類別</th>
                  <th>可用(h)</th>
                  <th>請假(h)</th>
                  <th>淨可用</th>
                  <th>承接</th>
                  <th>量能%</th>
                </tr>
              </thead>
              <tbody>
                {memberRows.map(({ m, base, leaveTotal, avail, load, pct }) => (
                  <tr key={m.id}>
                    <td>
                      <div className="member">
                        <div className="av av-sm" style={{ background: hue(m.hue) }}>
                          {m.initial}
                        </div>
                        <div>
                          <div style={{ fontFamily: 'inherit', fontSize: 13 }}>{m.name}</div>
                          <div style={{ fontSize: 10.5, color: 'var(--muted)', fontFamily: 'inherit' }}>
                            {m.cat}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <input
                        className="num-input"
                        type="number"
                        min={0}
                        max={999}
                        value={base}
                        onChange={(e) =>
                          setBaseHours({ ...baseHours, [m.id]: Number(e.target.value) })
                        }
                      />
                    </td>
                    <td>{leaveTotal}</td>
                    <td>{avail}</td>
                    <td>{load}</td>
                    <td>
                      <div className="cap-bar">
                        <div className="track">
                          <span
                            style={{
                              width: `${Math.min(pct, 100)}%`,
                              background: capColor(pct),
                            }}
                          />
                        </div>
                        <span className={`cap-pct ${capClass(pct)}`}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td style={{ fontFamily: 'inherit' }}>合計</td>
                  <td>{totalBase}</td>
                  <td>{totalLeave}</td>
                  <td>{totalAvail}</td>
                  <td>{totalLoad}</td>
                  <td>
                    <div className="cap-bar">
                      <div className="track">
                        <span
                          style={{
                            width: `${Math.min(totalPct, 100)}%`,
                            background: capColor(totalPct),
                          }}
                        />
                      </div>
                      <span className={`cap-pct ${capClass(totalPct)}`}>{totalPct}%</span>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Right: Cap side */}
        <div className="cap-side">
          {/* Summary panel */}
          <div className="panel">
            <div className="panel-h">
              <span className="panel-h-title">量能摘要</span>
              <span className="panel-h-spacer" />
              <span className="tag">{month}</span>
            </div>
            <div className="cap-summary">
              {/* Big percentage */}
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    font: `600 42px/1 var(--font-mono), monospace`,
                    letterSpacing: '-0.03em',
                    color: capColor(totalPct),
                  }}
                >
                  {totalPct}%
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                  整體量能使用率
                </div>
              </div>
              {/* Progress bar */}
              <div style={{ height: 8, borderRadius: 99, background: 'var(--surface-2)', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.min(totalPct, 100)}%`,
                    height: '100%',
                    borderRadius: 99,
                    background: capColor(totalPct),
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              {/* Stat tiles: 3+2 grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {statTiles.slice(0, 3).map((t, i) => (
                  <div key={i} style={{ background: 'var(--surface-2)', borderRadius: 'var(--r)', padding: '10px 12px' }}>
                    <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>
                      {t.lbl}
                    </div>
                    <div style={{ font: `600 15px/1.2 var(--font-mono), monospace`, marginTop: 4, color: 'var(--ink)' }}>
                      {t.val}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {statTiles.slice(3).map((t, i) => (
                  <div key={i} style={{ background: 'var(--surface-2)', borderRadius: 'var(--r)', padding: '10px 12px' }}>
                    <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>
                      {t.lbl}
                    </div>
                    <div style={{ font: `600 15px/1.2 var(--font-mono), monospace`, marginTop: 4, color: 'var(--ink)' }}>
                      {t.val}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dept load panel */}
          <div className="panel">
            <div className="panel-h">
              <span className="panel-h-title">部門承接分布</span>
              <span className="panel-h-spacer" />
              <span className="tag">{deptLoads.length} 部門</span>
            </div>
            <div style={{ padding: '10px 16px 14px' }}>
              {deptLoads.length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--muted-2)', padding: '8px 0' }}>無資料</div>
              ) : (
                deptLoads.map(({ dept, load }) => {
                  const pct = (load / maxDeptLoad) * 100;
                  const color = hue(DEPT_HUE[dept] || 1);
                  return (
                    <div key={dept} className="dept-bar-row">
                      <div className="name" title={dept}>
                        <span
                          className="chip-dot"
                          style={{ background: color, display: 'inline-block', marginRight: 6 }}
                        />
                        {DEPT_SHORT[dept] || dept}
                      </div>
                      <div className="v">{load}h</div>
                      <div className="bar">
                        <span style={{ width: `${pct}%`, background: color }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Leave panel */}
          <div className="panel">
            <div className="panel-h">
              <span className="panel-h-title">請假記錄</span>
              <span className="panel-h-spacer" />
              <span className="tag">{leave.length} 筆</span>
            </div>
            <div className="leave-list">
              {leave.length === 0 ? (
                <div style={{ padding: '12px 16px', fontSize: 12, color: 'var(--muted-2)' }}>
                  尚無請假記錄
                </div>
              ) : (
                leave.map((entry) => {
                  const m = MEMBER_BY_ID[entry.member];
                  return (
                    <div key={entry.id} className="leave-row">
                      <div className="who">
                        {m && (
                          <div className="av av-sm" style={{ background: hue(m.hue) }}>
                            {m.initial}
                          </div>
                        )}
                        <span>{m ? m.name : entry.member}</span>
                      </div>
                      <span className="date">{entry.date}</span>
                      <span className="hrs">{entry.hours}h</span>
                      <button
                        className="del"
                        onClick={() => deleteLeave(entry.id)}
                        title="刪除"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
            <div className="leave-add">
              <select
                className="input"
                style={{ width: '100%' }}
                value={newLeave.member}
                onChange={(e) => setNewLeave((p) => ({ ...p, member: e.target.value }))}
              >
                {MEMBERS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <input
                className="input"
                style={{ width: '100%' }}
                type="text"
                placeholder="MM/DD"
                value={newLeave.date}
                onChange={(e) => setNewLeave((p) => ({ ...p, date: e.target.value }))}
              />
              <input
                className="input"
                style={{ width: '100%' }}
                type="number"
                min={1}
                max={160}
                value={newLeave.hours}
                onChange={(e) => setNewLeave((p) => ({ ...p, hours: Number(e.target.value) }))}
              />
              <button className="btn btn-primary" onClick={addLeave}>
                新增
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
