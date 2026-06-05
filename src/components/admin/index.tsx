'use client';
import React, { useState, useMemo } from 'react';
import { Trash2, X } from 'lucide-react';
import type { Card, LeaveEntry, PublicHoliday, Cat, Member } from '@/lib/types';
import { DEPT_SHORT, DEPT_HUE } from '@/lib/data';
import { sum, hue } from '@/lib/utils';

type CatFilter = 'all' | Cat;
type MainTab = 'capacity' | 'members' | 'leave';

const TIME_SLOTS: { label: string; min: number }[] = [];
for (let m = 8 * 60 + 30; m <= 18 * 60; m += 30) {
  TIME_SLOTS.push({
    label: `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`,
    min: m,
  });
}

function dayHours(startMin: number, endMin: number): number {
  if (startMin >= endMin) return 0;
  const morning = Math.max(0, Math.min(endMin, 720) - startMin);
  const afternoon = Math.max(0, endMin - Math.max(startMin, 810));
  return (morning + afternoon) / 60;
}

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
      total += dayHours(isFirst ? startMin : 510, isLast ? endMin : 1080);
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
  members: Member[];
  memberRatios: Record<string, number>;
  setMemberRatios: (r: Record<string, number>) => void;
  memberDays: Record<string, number>;
  setMemberDays: (d: Record<string, number>) => void;
  leave: LeaveEntry[];
  setLeave: (l: LeaveEntry[]) => void;
  publicHolidays: PublicHoliday[];
  month: string;
  defaultWorkDays: number;
  tab: MainTab;
  onTabChange: (t: MainTab) => void;
}

function capClass(pct: number) { return pct > 100 ? 'over' : pct > 85 ? 'warn' : 'ok'; }
function capColor(pct: number) {
  return pct > 100 ? 'var(--st-block)' : pct > 85 ? 'var(--st-review)' : 'var(--accent)';
}

function MiniCalendar({ month, leave, publicHolidays, selectedDate, onSelect, year, memberById }: {
  month: string; leave: LeaveEntry[]; publicHolidays: PublicHoliday[];
  selectedDate: string | null; onSelect: (d: string | null) => void; year: number;
  memberById: Record<string, Member>;
}) {
  const [, mo] = month.split('/').map(Number);
  const daysInMonth = new Date(year, mo, 0).getDate();
  const firstDow = new Date(year, mo - 1, 1).getDay();
  const holSet = new Set(publicHolidays.map(h => h.date));

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
          <div key={i} className={cls} onClick={() => !isNonWorking && onSelect(isSel ? null : dateKey)}>
            <div className="cal-n">{day}</div>
            {members.length > 0 && (
              <div className="cal-dots">
                {members.slice(0, 4).map((mid, j) => {
                  const mb = memberById[mid];
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

export default function Admin({
  cards, members, memberRatios, setMemberRatios, memberDays, setMemberDays,
  leave, setLeave, publicHolidays, month, defaultWorkDays, tab, onTabChange: setTab,
}: AdminProps) {
  const memberById = Object.fromEntries(members.map(m => [m.id, m]));
  const year = Number(month.split('/')[0]);
  const [catFilter, setCatFilter] = useState<CatFilter>('all');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Local draft state for numeric inputs — only saved to Firestore on blur
  const [draftDays, setDraftDays] = useState<Record<string, string>>({});
  const [draftRatios, setDraftRatios] = useState<Record<string, string>>({});
  const [leaveModal, setLeaveModal] = useState(false);
  const [newLeave, setNewLeave] = useState({
    member: '',
    startDate: '', startMin: 510,
    endDate:   '', endMin:   1080,
  });

  const newLeaveHours = useMemo(() => {
    if (!newLeave.startDate.trim() || !newLeave.endDate.trim()) return 0;
    return calcLeaveHours(newLeave.startDate, newLeave.startMin, newLeave.endDate, newLeave.endMin, publicHolidays, year);
  }, [newLeave, publicHolidays, year]);

  const currentMM = month.slice(5, 7);
  const leaveInMonth = useMemo(() =>
    leave.filter(l => l.date.slice(0, 2) === currentMM || (l.endDate || l.date).slice(0, 2) === currentMM),
    [leave, currentMM]);

  const leaveByMember = useMemo(() =>
    Object.fromEntries(members.map(m => [m.id,
      sum(leaveInMonth.filter(l => l.member === m.id).map(l => l.hours))])),
    [members, leaveInMonth]);

  const memberRows = useMemo(() => members.map(m => {
    const days  = memberDays[m.id]   ?? defaultWorkDays;
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

  const visibleLeave = (selectedDate
    ? leaveInMonth.filter(l => {
        const end = l.endDate || l.date;
        return l.date <= selectedDate && selectedDate <= end;
      })
    : leaveInMonth
  ).slice().sort((a, b) => a.date.localeCompare(b.date));

  const catLabel = catFilter === 'all' ? '整體' : catFilter;

  function addLeave() {
    if (!newLeave.startDate.trim() || !newLeave.endDate.trim() || newLeaveHours <= 0 || !newLeave.member) return;
    const isSameDay = newLeave.startDate === newLeave.endDate;
    const entry: LeaveEntry = {
      id: `lv${Date.now()}`,
      member: newLeave.member,
      date: newLeave.startDate,
      hours: newLeaveHours,
    };
    if (!isSameDay) entry.endDate = newLeave.endDate;
    setLeave([...leave, entry]);
    setNewLeave(p => ({ ...p, startDate: '', endDate: '', startMin: 510, endMin: 1080 }));
    setLeaveModal(false);
  }

  const TABS: { id: MainTab; label: string }[] = [
    { id: 'capacity', label: '設計量能' },
    { id: 'members',  label: '成員工時表' },
    { id: 'leave',    label: '請假紀錄' },
  ];

  return (
    <div style={{ padding: '18px 22px' }}>
      <div className="panel">

        {/* ── Tab bar ── */}
        <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--divider)' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                appearance: 'none', border: 'none', background: 'none', cursor: 'pointer',
                padding: '11px 18px', fontSize: 14, fontWeight: tab === t.id ? 600 : 400,
                color: tab === t.id ? 'var(--ink)' : 'var(--muted)',
                borderBottom: tab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
                marginBottom: -1, transition: 'color 0.15s', fontFamily: 'inherit',
              }}
            >
              {t.label}
            </button>
          ))}

          <span style={{ flex: 1 }} />

          {tab === 'members' && (
            <span style={{ fontSize: 13, color: 'var(--muted)', marginRight: 16 }}>
              工作天 × 8 × 工時比例 − 請假
            </span>
          )}
          {tab === 'leave' && selectedDate && (
            <button className="btn btn-ghost" style={{ fontSize: 13, padding: '2px 8px', gap: 4, marginRight: 16 }}
                    onClick={() => setSelectedDate(null)}>
              {selectedDate} <X size={11} />
            </button>
          )}
        </div>

        {/* ── 設計量能 ── */}
        {tab === 'capacity' && (
          <div style={{ padding: '20px 24px 28px' }}>

            {/* Filter */}
            <div className="layout-pick" style={{ marginBottom: 20 }}>
              {([['all', 'Total'], ['UIUX', 'UIUX'], ['平面視覺', '平面視覺']] as [CatFilter, string][]).map(([v, lbl]) => (
                <button key={v} data-on={catFilter === v ? '1' : '0'} onClick={() => setCatFilter(v)}>{lbl}</button>
              ))}
            </div>

            {/* Left / Right split */}
            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 32, alignItems: 'start' }}>

              {/* ── Left: 量能總覽 ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  量能總覽
                </div>

                {/* Big percentage gauge */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ font: `600 64px/1 var(--font-mono), monospace`, letterSpacing: '-0.03em', color: capColor(filteredPct) }}>
                    {filteredPct}%
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 8 }}>{catLabel}量能使用率</div>
                  <div style={{ height: 6, borderRadius: 99, background: 'var(--surface-2)', overflow: 'hidden', marginTop: 12 }}>
                    <div style={{ width: `${Math.min(filteredPct, 100)}%`, height: '100%', borderRadius: 99, background: capColor(filteredPct), transition: 'width 0.3s ease' }} />
                  </div>
                </div>

                {/* 3 stat cards stacked */}
                {[
                  { l: '可用工時', v: `${filteredMonthHours}h` },
                  { l: '本月承接', v: `${filteredLoad}h` },
                  { l: '請假工時', v: `${filteredLeave}h` },
                ].map((s, i) => (
                  <div key={i} style={{ background: 'var(--surface-2)', borderRadius: 'var(--r)', padding: '14px 18px' }}>
                    <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{s.l}</div>
                    <div style={{ font: `600 26px/1 var(--font-mono), monospace`, color: 'var(--ink)', marginTop: 6 }}>{s.v}</div>
                  </div>
                ))}
              </div>

              {/* ── Right: 承接分佈 ── */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>
                  承接分佈
                  <span className="tag" style={{ fontSize: 12, marginLeft: 8 }}>{deptLoads.length} 部門</span>
                </div>
                {deptLoads.length === 0 ? (
                  <div style={{ fontSize: 13, color: 'var(--muted-2)' }}>無資料</div>
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
        )}

        {/* ── 成員工時表 ── */}
        {tab === 'members' && (
          <div style={{ overflowX: 'auto' }}>
            <table className="cap-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>成員</th>
                  <th>工作天</th><th>工時比例(%)</th><th>請假(h)</th>
                  <th>月工時</th><th>承接(h)</th><th>量能%</th>
                </tr>
              </thead>
              <tbody>
                {memberRows.map(({ m, days, ratio, lv, monthHours, load, pct }) => (
                  <tr key={m.id}>
                    <td>
                      <div className="member">
                        {m.photo
                          ? <img src={m.photo} alt={m.name} className="av av-sm" style={{ objectFit: 'cover' }} />
                          : <div className="av av-sm" style={{ background: hue(m.hue) }}>{m.initial}</div>}
                        <div>
                          <div style={{ fontSize: 14 }}>{m.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{m.cat}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <input className="num-input" type="number" min={0} max={31}
                             value={draftDays[m.id] ?? days}
                             onChange={e => setDraftDays(d => ({ ...d, [m.id]: e.target.value }))}
                             onBlur={() => {
                               const v = Number(draftDays[m.id] ?? days);
                               setDraftDays(d => { const c = { ...d }; delete c[m.id]; return c; });
                               setMemberDays({ ...memberDays, [m.id]: v });
                             }} />
                    </td>
                    <td>
                      <input className="num-input" type="number" min={10} max={100} step={0.5}
                             value={draftRatios[m.id] ?? Math.round(ratio * 1000) / 10}
                             onChange={e => setDraftRatios(r => ({ ...r, [m.id]: e.target.value }))}
                             onBlur={() => {
                               const v = Number(draftRatios[m.id] ?? Math.round(ratio * 1000) / 10);
                               setDraftRatios(r => { const c = { ...r }; delete c[m.id]; return c; });
                               setMemberRatios({ ...memberRatios, [m.id]: v / 100 });
                             }} />
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

        {/* ── 請假紀錄 ── */}
        {tab === 'leave' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 0, alignItems: 'start' }}>
              {/* Left: Calendar */}
              <div style={{ borderRight: '1px solid var(--divider)', padding: '16px 0' }}>
                <MiniCalendar
                  month={month} year={year}
                  leave={leave} publicHolidays={publicHolidays}
                  selectedDate={selectedDate} onSelect={setSelectedDate}
                  memberById={memberById}
                />
              </div>

              {/* Right: Leave list */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {/* List header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 10px' }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>
                    {selectedDate ? `${selectedDate} 請假` : '所有請假記錄'}
                    {selectedDate && (
                      <button className="btn btn-ghost" style={{ fontSize: 12, padding: '2px 7px', marginLeft: 8 }}
                              onClick={() => setSelectedDate(null)}>
                        清除 <X size={10} />
                      </button>
                    )}
                  </span>
                  <button className="btn btn-primary" style={{ fontSize: 13, padding: '4px 12px' }}
                          onClick={() => {
                            setNewLeave(p => ({ ...p, startDate: selectedDate ?? '', endDate: selectedDate ?? '', member: p.member || (members[0]?.id ?? '') }));
                            setLeaveModal(true);
                          }}>
                    <span style={{ fontSize: 15, lineHeight: 1, marginRight: 2 }}>+</span> 新增
                  </button>
                </div>

                {/* List body */}
                <div className="leave-list" style={{ flex: 1, minHeight: 200 }}>
                  {visibleLeave.length === 0 ? (
                    <div style={{ padding: '24px 18px', fontSize: 13, color: 'var(--muted-2)', textAlign: 'center' }}>
                      {selectedDate ? '當日無請假記錄' : '尚無請假記錄'}
                    </div>
                  ) : visibleLeave.map(entry => {
                    const mb = memberById[entry.member];
                    return (
                      <div key={entry.id} className="leave-row">
                        <div className="who">
                          {mb && (mb.photo
                            ? <img src={mb.photo} alt={mb.name} className="av av-sm" style={{ objectFit: 'cover' }} />
                            : <div className="av av-sm" style={{ background: hue(mb.hue) }}>{mb.initial}</div>)}
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
              </div>
            </div>

            {/* ── Add leave modal ── */}
            {leaveModal && (
              <div className="modal-scrim open" onClick={e => e.target === e.currentTarget && setLeaveModal(false)}>
                <div className="modal" style={{ width: 420 }}>
                  <div className="modal-h">
                    <span className="modal-h-title">新增請假</span>
                    <span style={{ flex: 1 }} />
                    <button className="drawer-close" onClick={() => setLeaveModal(false)}><X size={16} /></button>
                  </div>
                  <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* 成員 */}
                    <div className="form-row">
                      <label>成員</label>
                      <select className="input" style={{ width: '100%' }} value={newLeave.member}
                              onChange={e => setNewLeave(p => ({ ...p, member: e.target.value }))}>
                        {!newLeave.member && <option value="">請選擇成員</option>}
                        {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                    </div>
                    {/* 開始 */}
                    <div className="form-row">
                      <label>開始</label>
                      <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                        <input className="input" type="date" style={{ width: 150 }}
                               value={newLeave.startDate ? `${year}-${newLeave.startDate.replace('/', '-')}` : ''}
                               onChange={e => {
                                 const v = e.target.value ? e.target.value.slice(5).replace('-', '/') : '';
                                 setNewLeave(p => ({ ...p, startDate: v, endDate: (!p.endDate || v > p.endDate) ? v : p.endDate }));
                               }} />
                        <select className="input" style={{ flex: 1 }} value={newLeave.startMin}
                                onChange={e => setNewLeave(p => ({ ...p, startMin: Number(e.target.value) }))}>
                          {TIME_SLOTS.map(s => <option key={s.min} value={s.min}>{s.label}</option>)}
                        </select>
                      </div>
                    </div>
                    {/* 結束 */}
                    <div className="form-row">
                      <label>結束</label>
                      <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                        <input className="input" type="date" style={{ width: 150 }}
                               value={newLeave.endDate ? `${year}-${newLeave.endDate.replace('/', '-')}` : ''}
                               onChange={e => {
                                 const v = e.target.value ? e.target.value.slice(5).replace('-', '/') : '';
                                 setNewLeave(p => ({ ...p, endDate: v }));
                               }} />
                        <select className="input" style={{ flex: 1 }} value={newLeave.endMin}
                                onChange={e => setNewLeave(p => ({ ...p, endMin: Number(e.target.value) }))}>
                          {TIME_SLOTS.map(s => <option key={s.min} value={s.min}>{s.label}</option>)}
                        </select>
                      </div>
                    </div>
                    {/* 計算工時 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--surface-2)', borderRadius: 8 }}>
                      <span style={{ fontSize: 13, color: 'var(--muted)' }}>計算工時</span>
                      <span style={{ fontFamily: 'var(--font-mono), monospace', fontWeight: 700, fontSize: 16, color: newLeaveHours > 0 ? 'var(--ink)' : 'var(--muted-2)', marginLeft: 'auto' }}>
                        {newLeaveHours > 0 ? `${newLeaveHours} h` : '—'}
                      </span>
                    </div>
                  </div>
                  <div className="modal-f">
                    <button className="btn btn-ghost" onClick={() => setLeaveModal(false)}>取消</button>
                    <button className="btn btn-primary" onClick={addLeave}
                            disabled={!newLeave.startDate.trim() || !newLeave.endDate.trim() || newLeaveHours <= 0}>
                      儲存
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
