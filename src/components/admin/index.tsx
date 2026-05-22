'use client';
import React, { useState, useMemo } from 'react';
import { Trash2, X } from 'lucide-react';
import type { Card, LeaveEntry, PublicHoliday, Cat } from '@/lib/types';
import { MEMBERS, MEMBER_BY_ID, DEPT_SHORT, DEPT_HUE } from '@/lib/data';
import { sum, hue } from '@/lib/utils';

type CatFilter = 'all' | Cat;
type RightTab = 'capacity' | 'leave';

const TIME_SLOTS: { label: string; min: number }[] = [];
for (let m = 8 * 60 + 30; m <= 18 * 60; m += 30) {
  TIME_SLOTS.push({
    label: `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`,
    min: m,
  });
}

// Hours in one day, lunch 12:00–13:30 excluded
function dayHours(startMin: number, endMin: number): number {
  if (startMin >= endMin) return 0;
  const morning = Math.max(0, Math.min(endMin, 720) - startMin);
  const afternoon = Math.max(0, endMin - Math.max(startMin, 810));
  return (morning + afternoon) / 60;
}

// Multi-day leave: iterate each calendar day, skip weekends + holidays
function calcLeaveHours(
  startDate: string, startMin: number,
  endDate: string, endMin: number,
  holidays: Array<{ date: string }>,
  year: number,
): number {
  const [smo, sday] = startDate.split('/').map(Number);
  const [emo, eday] = endDate.split('/').map(Number);
  const start = new Date(year, smo - 1, sday);
  const end   = new Date(year, emo - 1, eday);
  if (start > end) return 0;

  const holSet = new Set(holidays.map(h => h.date));
  let total = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const dow = cur.getDay();
    const key = `${String(cur.getMonth() + 1).padStart(2, '0')}/${String(cur.getDate()).padStart(2, '0')}`;
    if (dow !== 0 && dow !== 6 && !holSet.has(key)) {
      const isFirst = cur.getTime() === start.getTime();
      const isLast  = cur.getTime() === end.getTime();
      total += dayHours(
        isFirst ? startMin : 510,
        isLast  ? endMin  : 1080,
      );
    }
    cur.setDate(cur.getDate() + 1);
  }
  return Math.round(total * 10) / 10;
}

function dateRangeLabel(date: string, endDate?: string) {
  if (!endDate || endDate === date) return date;
  const [sm] = date.split('/');
  const [em, ed] = endDate.split('/');
  return sm === em ? `${date}→${ed}` : `${date}→${endDate}`;
}

interface AdminProps {
  cards: Card[];
  memberRatios: Record<string, number>;
  setMemberRatios: (r: Record<string, number>) => void;
  memberDays: Record<string, number>;
  setMemberDays: (d: Record<string, number>) => void;
  leave: LeaveEntry[];
  setLeave: (l: LeaveEntry[]) => void;
  publicHolidays: PublicHoliday[];
  month: string;
  defaultWorkDays: number;
}

function capClass(pct: number) { return pct > 100 ? 'over' : pct > 85 ? 'warn' : 'ok'; }
function capColor(pct: number) {
  return pct > 100 ? 'var(--st-block)' : pct > 85 ? 'var(--st-review)' : 'var(--accent)';
}

// ── Mini calendar ────────────────────────────────────────────
function MiniCalendar({ month, leave, publicHolidays, selectedDate, onSelect, year }: {
  month: string; leave: LeaveEntry[]; publicHolidays: PublicHoliday[];
  selectedDate: string | null; onSelect: (d: string | null) => void; year: number;
}) {
  const [, mo] = month.split('/').map(Number);
  const daysInMonth = new Date(year, mo, 0).getDate();
  const firstDow = new Date(year, mo - 1, 1).getDay(); // Sun-first

  const holSet = new Set(publicHolidays.map(h => h.date));

  // Expand multi-day leave ranges
  const leaveByDate: Record<string, string[]> = {};
  for (const l of leave) {
    const end = l.endDate || l.date;
    const [smo2, sday2] = l.date.split('/').map(Number);
    const [emo2, eday2] = end.split('/').map(Number);
    const cur = new Date(year, smo2 - 1, sday2);
    const endD = new Date(year, emo2 - 1, eday2);
    while (cur <= endD) {
      const key = `${String(cur.getMonth() + 1).padStart(2, '0')}/${String(cur.getDate()).padStart(2, '0')}`;
      (leaveByDate[key] ??= []).push(l.member);
      cur.setDate(cur.getDate() + 1);
    }
  }

  const today = new Date();
  const isThisMonth = today.getFullYear() === year && today.getMonth() + 1 === mo;
  const todayKey = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;

  const cells = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);

  return (
    <div className="cal-grid">
      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
        <div key={d} className="cal-hdr">{d}</div>
      ))}
      {cells.map((day, i) => {
        if (!day) return <div key={i} />;
        const col = i % 7;
        const isWeekend = col === 0 || col === 6;
        const dateKey = `${String(mo).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
        const isHoliday = holSet.has(dateKey);
        const isNonWorking = isWeekend || isHoliday;
        const isToday = isThisMonth && dateKey === todayKey;
        const isSel = selectedDate === dateKey;
        const members = leaveByDate[dateKey] ?? [];
        const cls = ['cal-day',
          isNonWorking ? 'weekend' : 'clickable',
          isToday ? 'today' : '', isSel ? 'selected' : '',
          isHoliday && !isWeekend ? 'holiday' : '',
        ].filter(Boolean).join(' ');
        return (
          <div key={i} className={cls}
               onClick={() => !isNonWorking && onSelect(isSel ? null : dateKey)}>
            <div className="cal-n">{day}</div>
            {members.length > 0 && (
              <div className="cal-dots">
                {members.slice(0, 4).map((mid, j) => {
                  const mb = MEMBER_BY_ID[mid];
                  return <div key={j} style={{ width: 4, height: 4, borderRadius: '50%', flexShrink: 0, background: mb ? hue(mb.hue) : 'var(--muted-2)' }} />;
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────
export default function Admin({
  cards, memberRatios, setMemberRatios, memberDays, setMemberDays,
  leave, setLeave, publicHolidays, month, defaultWorkDays,
}: AdminProps) {
  const year = Number(month.split('/')[0]);
  const [catFilter, setCatFilter] = useState<CatFilter>('all');
  const [rightTab, setRightTab] = useState<RightTab>('capacity');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [newLeave, setNewLeave] = useState({
    member: MEMBERS[0].id,
    startDate: '', startMin: 510,
    endDate:   '', endMin:   1080,
  });

  const newLeaveHours = useMemo(() => {
    if (!newLeave.startDate.trim() || !newLeave.endDate.trim()) return 0;
    return calcLeaveHours(newLeave.startDate, newLeave.startMin, newLeave.endDate, newLeave.endMin, publicHolidays, year);
  }, [newLeave, publicHolidays, year]);

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

  const filteredRows  = catFilter === 'all' ? memberRows : memberRows.filter(r => r.m.cat === catFilter);
  const filteredCards = catFilter === 'all' ? cards : cards.filter(c => c.cat === catFilter);
  const filteredMonthHours = sum(filteredRows.map(r => r.monthHours));
  const filteredLoad  = sum(filteredCards.map(c => c.est));
  const filteredLeave = sum(filteredRows.map(r => r.lv));
  const filteredPct   = filteredMonthHours > 0 ? Math.round((filteredLoad / filteredMonthHours) * 100) : 0;

  const deptMap: Record<string, number> = {};
  for (const c of filteredCards) deptMap[c.dept] = (deptMap[c.dept] || 0) + c.est;
  const deptLoads = Object.entries(deptMap).sort((a, b) => b[1] - a[1]);
  const maxDeptLoad = Math.max(...deptLoads.map(d => d[1]), 1);

  const totalMonthHours = sum(memberRows.map(r => r.monthHours));
  const totalLoad       = sum(memberRows.map(r => r.load));
  const totalLeaveHours = sum(memberRows.map(r => r.lv));
  const totalPct        = totalMonthHours > 0 ? Math.round((totalLoad / totalMonthHours) * 100) : 0;

  // Filter leave list by selected date (handle ranges)
  const visibleLeave = (selectedDate
    ? leave.filter(l => {
        const end = l.endDate || l.date;
        return l.date <= selectedDate && selectedDate <= end;
      })
    : leave
  ).slice().sort((a, b) => a.date.localeCompare(b.date));

  const catLabel = catFilter === 'all' ? '整體' : catFilter === 'UIUX' ? 'UIUX' : '平面視覺';

  function addLeave() {
    if (!newLeave.startDate.trim() || !newLeave.endDate.trim() || newLeaveHours <= 0) return;
    const isSameDay = newLeave.startDate === newLeave.endDate;
    setLeave([...leave, {
      id: `lv${Date.now()}`,
      member: newLeave.member,
      date: newLeave.startDate,
      endDate: isSameDay ? undefined : newLeave.endDate,
      hours: newLeaveHours,
    }]);
    setNewLeave(p => ({ ...p, startDate: '', endDate: '', startMin: 510, endMin: 1080 }));
  }

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="cap-grid" style={{ gridTemplateColumns: '1fr 1.6fr' }}>

      {/* ── Left: 設計量能 ── */}
      <div className="cap-side">
        <div className="panel">
          <div className="panel-h">
            <span className="panel-h-title">設計量能</span>
            <span className="panel-h-spacer" />
            <div className="layout-pick">
              {([['all', 'Total'], ['UIUX', 'UIUX'], ['平面視覺', '平面']] as [CatFilter, string][]).map(([v, lbl]) => (
                <button key={v} data-on={catFilter === v ? '1' : '0'} onClick={() => setCatFilter(v)}>{lbl}</button>
              ))}
            </div>
          </div>

          <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ font: `600 48px/1 var(--font-mono), monospace`, letterSpacing: '-0.03em', color: capColor(filteredPct) }}>
                {filteredPct}%
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 5 }}>{catLabel}量能使用率</div>
            </div>
            <div style={{ height: 8, borderRadius: 99, background: 'var(--surface-2)', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(filteredPct, 100)}%`, height: '100%', borderRadius: 99, background: capColor(filteredPct), transition: 'width 0.3s ease' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {[
                { l: '可用工時', v: `${filteredMonthHours}h` },
                { l: '本月承接', v: `${filteredLoad}h` },
                { l: '請假工時', v: `${filteredLeave}h` },
              ].map((t, i) => (
                <div key={i} style={{ background: 'var(--surface-2)', borderRadius: 'var(--r)', padding: '10px 12px' }}>
                  <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>{t.l}</div>
                  <div style={{ font: `600 15px/1.2 var(--font-mono), monospace`, marginTop: 4, color: 'var(--ink)' }}>{t.v}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--divider)', margin: '16px 0 0' }} />
          <div style={{ padding: '10px 16px 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>承接分佈</span>
            <span className="tag" style={{ fontSize: 10 }}>{deptLoads.length} 部門</span>
          </div>
          <div style={{ padding: '2px 16px 16px' }}>
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

      {/* ── Right: tabbed card ── */}
      <div className="cap-side">
        <div className="panel">
          {/* Tab bar */}
          <div className="panel-h" style={{ borderBottom: '1px solid var(--divider)', paddingBottom: 12 }}>
            <div className="layout-pick">
              <button data-on={rightTab === 'capacity' ? '1' : '0'} onClick={() => setRightTab('capacity')}>成員工時表</button>
              <button data-on={rightTab === 'leave' ? '1' : '0'} onClick={() => setRightTab('leave')}>請假記錄</button>
            </div>
            <span className="panel-h-spacer" />
            {rightTab === 'capacity' && (
              <>
                <span className="panel-h-sub" style={{ marginRight: 8 }}>工作天 × 8 × 工時比例 − 請假</span>
                <span className="tag">{defaultWorkDays} 工作天</span>
              </>
            )}
            {rightTab === 'leave' && (
              <>
                {selectedDate && (
                  <button className="btn btn-ghost" style={{ fontSize: 11, padding: '2px 8px', gap: 4 }}
                          onClick={() => setSelectedDate(null)}>
                    {selectedDate} <X size={11} />
                  </button>
                )}
                <span className="tag">{visibleLeave.length} 筆</span>
              </>
            )}
          </div>

          {/* ── 量能總覽 ── */}
          {rightTab === 'capacity' && (
            <div style={{ overflowX: 'auto' }}>
              <table className="cap-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>成員</th>
                    <th>工作天</th><th>工時比例</th><th>請假(h)</th>
                    <th>月工時</th><th>承接(h)</th><th>量能%</th>
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
                        <input className="num-input" type="number" min={0} max={31} value={days}
                               onChange={e => setMemberDays({ ...memberDays, [m.id]: Number(e.target.value) })} />
                      </td>
                      <td>
                        <input className="num-input" type="number" min={0.1} max={1} step={0.005}
                               value={ratio}
                               onChange={e => setMemberRatios({ ...memberRatios, [m.id]: Number(e.target.value) })} />
                      </td>
                      <td>{lv}</td>
                      <td style={{ fontWeight: 600 }}>{monthHours}</td>
                      <td>{load}</td>
                      <td>
                        <div className="cap-bar">
                          <div className="track"><span style={{ width: `${Math.min(pct, 100)}%`, background: capColor(pct) }} /></div>
                          <span className={`cap-pct ${capClass(pct)}`}>{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td style={{ fontFamily: 'inherit', fontWeight: 600 }}>合計</td>
                    <td>—</td><td>—</td>
                    <td>{totalLeaveHours}</td>
                    <td style={{ fontWeight: 600 }}>{totalMonthHours}</td>
                    <td>{totalLoad}</td>
                    <td>
                      <div className="cap-bar">
                        <div className="track"><span style={{ width: `${Math.min(totalPct, 100)}%`, background: capColor(totalPct) }} /></div>
                        <span className={`cap-pct ${capClass(totalPct)}`}>{totalPct}%</span>
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* ── 請假記錄 ── */}
          {rightTab === 'leave' && (
            <>
              <MiniCalendar
                month={month} year={year}
                leave={leave} publicHolidays={publicHolidays}
                selectedDate={selectedDate} onSelect={setSelectedDate}
              />

              <div style={{ borderTop: '1px solid var(--divider)' }} />

              <div className="leave-list">
                {visibleLeave.length === 0 ? (
                  <div style={{ padding: '12px 16px', fontSize: 12, color: 'var(--muted-2)' }}>
                    {selectedDate ? '當日無請假記錄' : '尚無請假記錄'}
                  </div>
                ) : visibleLeave.map(entry => {
                  const mb = MEMBER_BY_ID[entry.member];
                  return (
                    <div key={entry.id} className="leave-row">
                      <div className="who">
                        {mb && <div className="av av-sm" style={{ background: hue(mb.hue) }}>{mb.initial}</div>}
                        <span>{mb ? mb.name : entry.member}</span>
                      </div>
                      <span className="date">{dateRangeLabel(entry.date, entry.endDate)}</span>
                      <span className="hrs">{entry.hours}h</span>
                      <button className="del" onClick={() => setLeave(leave.filter(l => l.id !== entry.id))} title="刪除">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Add leave form */}
              <div style={{ padding: '12px 16px', borderTop: '1px solid var(--divider)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <select className="input" value={newLeave.member}
                        onChange={e => setNewLeave(p => ({ ...p, member: e.target.value }))}>
                  {MEMBERS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <div style={{ display: 'grid', gridTemplateColumns: '76px 1fr 16px 76px 1fr auto auto', gap: 6, alignItems: 'center' }}>
                  <input className="input" type="text" placeholder="MM/DD"
                         value={newLeave.startDate}
                         onChange={e => {
                           const v = e.target.value;
                           setNewLeave(p => ({ ...p, startDate: v, endDate: p.endDate || v }));
                         }} />
                  <select className="input" value={newLeave.startMin}
                          onChange={e => setNewLeave(p => ({ ...p, startMin: Number(e.target.value) }))}>
                    {TIME_SLOTS.map(s => <option key={s.min} value={s.min}>{s.label}</option>)}
                  </select>
                  <span style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted)' }}>→</span>
                  <input className="input" type="text" placeholder="MM/DD"
                         value={newLeave.endDate}
                         onChange={e => setNewLeave(p => ({ ...p, endDate: e.target.value }))} />
                  <select className="input" value={newLeave.endMin}
                          onChange={e => setNewLeave(p => ({ ...p, endMin: Number(e.target.value) }))}>
                    {TIME_SLOTS.map(s => <option key={s.min} value={s.min}>{s.label}</option>)}
                  </select>
                  <span style={{
                    fontFamily: 'var(--font-mono), monospace', fontSize: 12.5, fontWeight: 600,
                    color: newLeaveHours > 0 ? 'var(--ink)' : 'var(--muted-2)',
                    minWidth: 34, textAlign: 'right', flexShrink: 0,
                  }}>
                    {newLeaveHours > 0 ? `${newLeaveHours}h` : '—'}
                  </span>
                  <button className="btn btn-primary" onClick={addLeave}
                          disabled={!newLeave.startDate.trim() || !newLeave.endDate.trim() || newLeaveHours <= 0}>
                    新增
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
