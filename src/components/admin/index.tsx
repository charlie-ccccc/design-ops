'use client';
import React, { useState, useMemo } from 'react';
import { Trash2 } from 'lucide-react';
import type { Card, LeaveEntry, PublicHoliday, Cat } from '@/lib/types';
import { MEMBERS, MEMBER_BY_ID, DEPT_SHORT, DEPT_HUE } from '@/lib/data';
import { sum, hue } from '@/lib/utils';

type CatFilter = 'all' | Cat;

interface AdminProps {
  cards: Card[];
  memberRatios: Record<string, number>;
  setMemberRatios: (r: Record<string, number>) => void;
  memberDays: Record<string, number>;
  setMemberDays: (d: Record<string, number>) => void;
  leave: LeaveEntry[];
  setLeave: (l: LeaveEntry[]) => void;
  publicHolidays: PublicHoliday[];
  setPublicHolidays: (h: PublicHoliday[]) => void;
  month: string;
  defaultWorkDays: number;
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
  cards, memberRatios, setMemberRatios, memberDays, setMemberDays,
  leave, setLeave, publicHolidays, setPublicHolidays, month, defaultWorkDays,
}: AdminProps) {
  const [catFilter, setCatFilter] = useState<CatFilter>('all');
  const [newLeave, setNewLeave] = useState({ member: MEMBERS[0].id, date: '', hours: 8 });
  const [newHoliday, setNewHoliday] = useState({ date: '', name: '' });

  const leaveByMember = useMemo(() =>
    Object.fromEntries(MEMBERS.map(m => [m.id,
      sum(leave.filter(l => l.member === m.id).map(l => l.hours))])),
    [leave]);

  const memberRows = useMemo(() => MEMBERS.map(m => {
    const days = memberDays[m.id] ?? defaultWorkDays;
    const ratio = memberRatios[m.id] ?? m.ratio;
    const lv = leaveByMember[m.id] || 0;
    const monthHours = Math.max(0, Math.round(days * 8 * ratio) - lv);
    const load = sum(cards.filter(c => c.owner === m.id).map(c => c.est));
    const pct = monthHours > 0 ? Math.round((load / monthHours) * 100) : 0;
    return { m, days, ratio, lv, monthHours, load, pct };
  }), [memberDays, memberRatios, leaveByMember, cards, defaultWorkDays]);

  const totalMonthHours = sum(memberRows.map(r => r.monthHours));
  const totalLoad = sum(memberRows.map(r => r.load));
  const totalLeaveHours = sum(memberRows.map(r => r.lv));
  const totalPct = totalMonthHours > 0 ? Math.round((totalLoad / totalMonthHours) * 100) : 0;

  const filteredCards = catFilter === 'all' ? cards : cards.filter(c => c.cat === catFilter);
  const deptMap: Record<string, number> = {};
  for (const c of filteredCards) deptMap[c.dept] = (deptMap[c.dept] || 0) + c.est;
  const deptLoads = Object.entries(deptMap).sort((a, b) => b[1] - a[1]);
  const maxDeptLoad = Math.max(...deptLoads.map(d => d[1]), 1);

  const [, mo] = month.split('/').map(Number);
  const monthPrefix = `${String(mo).padStart(2, '0')}/`;
  const monthHolidays = publicHolidays.filter(h => h.date.startsWith(monthPrefix));

  function addLeave() {
    if (!newLeave.date.trim() || newLeave.hours <= 0) return;
    setLeave([...leave, { id: `lv${Date.now()}`, member: newLeave.member, date: newLeave.date, hours: newLeave.hours }]);
    setNewLeave(p => ({ ...p, date: '', hours: 8 }));
  }

  function addHoliday() {
    if (!newHoliday.date.trim() || !newHoliday.name.trim()) return;
    const updated = [...publicHolidays, { date: newHoliday.date, name: newHoliday.name }]
      .sort((a, b) => a.date.localeCompare(b.date));
    setPublicHolidays(updated);
    setNewHoliday({ date: '', name: '' });
  }

  return (
    <div className="cap-grid" style={{ gridTemplateColumns: '1fr 1.6fr' }}>
      {/* ── Left: summary + distribution ── */}
      <div className="cap-side">
        <div className="panel">
          <div className="panel-h">
            <span className="panel-h-title">設計量能</span>
            <span className="panel-h-spacer" />
            <span className="tag">{month}</span>
          </div>
          <div className="cap-summary">
            <div style={{ textAlign: 'center' }}>
              <div style={{ font: `600 44px/1 var(--font-mono), monospace`, letterSpacing: '-0.03em', color: capColor(totalPct) }}>
                {totalPct}%
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>整體量能使用率</div>
            </div>
            <div style={{ height: 8, borderRadius: 99, background: 'var(--surface-2)', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(totalPct, 100)}%`, height: '100%', borderRadius: 99, background: capColor(totalPct), transition: 'width 0.3s ease' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {[
                { l: '月可用工時', v: `${totalMonthHours}h` },
                { l: '總承接工時', v: `${totalLoad}h` },
                { l: '總請假工時', v: `${totalLeaveHours}h` },
              ].map((t, i) => (
                <div key={i} style={{ background: 'var(--surface-2)', borderRadius: 'var(--r)', padding: '10px 12px' }}>
                  <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>{t.l}</div>
                  <div style={{ font: `600 15px/1.2 var(--font-mono), monospace`, marginTop: 4, color: 'var(--ink)' }}>{t.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-h">
            <span className="panel-h-title">承接分佈</span>
            <span className="panel-h-spacer" />
            <div className="layout-pick">
              {([['all', 'Total'], ['UIUX', 'UIUX'], ['平面視覺', '平面']] as [CatFilter, string][]).map(([v, lbl]) => (
                <button key={v} data-on={catFilter === v ? '1' : '0'} onClick={() => setCatFilter(v)}>{lbl}</button>
              ))}
            </div>
          </div>
          <div style={{ padding: '10px 16px 14px' }}>
            {deptLoads.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--muted-2)', padding: '8px 0' }}>無資料</div>
            ) : deptLoads.map(([dept, load]) => {
              const pct = (load / maxDeptLoad) * 100;
              const color = hue(DEPT_HUE[dept] || 1);
              return (
                <div key={dept} className="dept-bar-row">
                  <div className="name" title={dept}>
                    <span className="chip-dot" style={{ background: color, display: 'inline-block', marginRight: 6 }} />
                    {DEPT_SHORT[dept] || dept}
                  </div>
                  <div className="v">{load}h</div>
                  <div className="bar"><span style={{ width: `${pct}%`, background: color }} /></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Right: member table + leave + holidays ── */}
      <div className="cap-side">
        <div className="panel">
          <div className="panel-h">
            <span className="panel-h-title">成員量能</span>
            <span className="panel-h-sub">工作天 × 8 × 工時比例 − 請假</span>
            <span className="panel-h-spacer" />
            <span className="tag">{defaultWorkDays} 工作天</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="cap-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>成員</th>
                  <th>工作天</th>
                  <th>工時比例</th>
                  <th>請假(h)</th>
                  <th>月工時</th>
                  <th>承接(h)</th>
                  <th>量能%</th>
                </tr>
              </thead>
              <tbody>
                {memberRows.map(({ m, days, ratio, lv, monthHours, load, pct }) => (
                  <tr key={m.id}>
                    <td>
                      <div className="member">
                        <div className="av av-sm" style={{ background: hue(m.hue) }}>{m.initial}</div>
                        <div>
                          <div style={{ fontSize: 13 }}>{m.name}</div>
                          <div style={{ fontSize: 10.5, color: 'var(--muted)' }}>{m.cat}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <input
                        className="num-input" type="number" min={0} max={31}
                        value={days}
                        onChange={e => setMemberDays({ ...memberDays, [m.id]: Number(e.target.value) })}
                      />
                    </td>
                    <td>
                      <select
                        className="num-input" style={{ width: 66, textAlign: 'left', cursor: 'pointer' }}
                        value={ratio}
                        onChange={e => setMemberRatios({ ...memberRatios, [m.id]: Number(e.target.value) })}
                      >
                        <option value={0.875}>0.875</option>
                        <option value={0.625}>0.625</option>
                      </select>
                    </td>
                    <td>{lv}</td>
                    <td style={{ fontWeight: 600 }}>{monthHours}</td>
                    <td>{load}</td>
                    <td>
                      <div className="cap-bar">
                        <div className="track">
                          <span style={{ width: `${Math.min(pct, 100)}%`, background: capColor(pct) }} />
                        </div>
                        <span className={`cap-pct ${capClass(pct)}`}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td style={{ fontFamily: 'inherit', fontWeight: 600 }}>合計</td>
                  <td>—</td>
                  <td>—</td>
                  <td>{totalLeaveHours}</td>
                  <td style={{ fontWeight: 600 }}>{totalMonthHours}</td>
                  <td>{totalLoad}</td>
                  <td>
                    <div className="cap-bar">
                      <div className="track">
                        <span style={{ width: `${Math.min(totalPct, 100)}%`, background: capColor(totalPct) }} />
                      </div>
                      <span className={`cap-pct ${capClass(totalPct)}`}>{totalPct}%</span>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="panel">
          <div className="panel-h">
            <span className="panel-h-title">請假記錄</span>
            <span className="panel-h-spacer" />
            <span className="tag">{leave.length} 筆</span>
          </div>
          <div className="leave-list">
            {leave.length === 0 ? (
              <div style={{ padding: '12px 16px', fontSize: 12, color: 'var(--muted-2)' }}>尚無請假記錄</div>
            ) : leave.map(entry => {
              const mb = MEMBER_BY_ID[entry.member];
              return (
                <div key={entry.id} className="leave-row">
                  <div className="who">
                    {mb && <div className="av av-sm" style={{ background: hue(mb.hue) }}>{mb.initial}</div>}
                    <span>{mb ? mb.name : entry.member}</span>
                  </div>
                  <span className="date">{entry.date}</span>
                  <span className="hrs">{entry.hours}h</span>
                  <button className="del" onClick={() => setLeave(leave.filter(l => l.id !== entry.id))} title="刪除">
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>
          <div className="leave-add">
            <select className="input" value={newLeave.member} onChange={e => setNewLeave(p => ({ ...p, member: e.target.value }))}>
              {MEMBERS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <input className="input" type="text" placeholder="MM/DD" value={newLeave.date} onChange={e => setNewLeave(p => ({ ...p, date: e.target.value }))} />
            <input className="input" type="number" min={1} max={160} value={newLeave.hours} onChange={e => setNewLeave(p => ({ ...p, hours: Number(e.target.value) }))} />
            <button className="btn btn-primary" onClick={addLeave}>新增</button>
          </div>
        </div>

        <div className="panel">
          <div className="panel-h">
            <span className="panel-h-title">國定假日</span>
            <span className="panel-h-sub">影響工作天數計算</span>
            <span className="panel-h-spacer" />
            <span className="tag">
              {monthHolidays.length > 0 ? `本月 ${monthHolidays.length} 天` : '本月無假日'}
            </span>
          </div>
          <div className="leave-list">
            {publicHolidays.length === 0 ? (
              <div style={{ padding: '12px 16px', fontSize: 12, color: 'var(--muted-2)' }}>尚無假日設定</div>
            ) : publicHolidays.map(h => (
              <div key={h.date} className="leave-row">
                <div className="who">
                  <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: 11.5, color: 'var(--muted)', minWidth: 44 }}>{h.date}</span>
                  <span>{h.name}</span>
                </div>
                <span />
                <span />
                <button className="del" onClick={() => setPublicHolidays(publicHolidays.filter(x => x.date !== h.date))} title="刪除">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
          <div style={{ padding: '12px 16px', display: 'grid', gridTemplateColumns: '100px 1fr auto', gap: 8, borderTop: '1px solid var(--divider)', alignItems: 'center' }}>
            <input className="input" type="text" placeholder="MM/DD" value={newHoliday.date} onChange={e => setNewHoliday(p => ({ ...p, date: e.target.value }))} />
            <input className="input" type="text" placeholder="節日名稱" value={newHoliday.name} onChange={e => setNewHoliday(p => ({ ...p, name: e.target.value }))} />
            <button className="btn btn-primary" onClick={addHoliday}>新增</button>
          </div>
        </div>
      </div>
    </div>
  );
}
