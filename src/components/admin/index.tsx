'use client';
import React, { useState, useMemo } from 'react';
import { Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Card, LeaveEntry, PublicHoliday, Cat, Member } from '@/lib/types';
import { DEPT_SHORT, DEPT_HUE } from '@/lib/data';
import { sum, hue, shiftMonth } from '@/lib/utils';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Modal } from '@/components/ui/Modal/Modal';
import { FormRow } from '@/components/ui/FormRow/FormRow';
import { Tag } from '@/components/ui/Badge/Badge';
import { Table } from '@/components/ui/Table/Table';
import type { TableColumn } from '@/components/ui/Table/Table';
import { LeaveCalendar } from '@/components/ui/LeaveCalendar/LeaveCalendar';
import type { LeaveCalendarDot } from '@/components/ui/LeaveCalendar/LeaveCalendar';
import { InfoTooltip } from '@/components/ui/Tooltip/Tooltip';
import { MemberCell } from '@/components/ui/MemberCell/MemberCell';

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
  onMonthChange: (m: string) => void;
  deptColors?: Record<string, string>;
  tab: MainTab;
  onTabChange: (t: MainTab) => void;
}

function capColor(pct: number) {
  return pct > 100 ? 'var(--st-block)' : pct > 85 ? 'var(--st-review)' : 'var(--md-sys-color-primary)';
}
function capClass(pct: number) { return pct > 100 ? 'over' : pct > 85 ? 'warn' : 'ok'; }

type MemberRow = {
  m: Member; days: number; ratio: number;
  lv: number; monthHours: number; load: number; actual: number; pct: number;
};

export default function Admin({
  cards, members, memberRatios, setMemberRatios, memberDays, setMemberDays,
  leave, setLeave, publicHolidays, month, onMonthChange, deptColors = {}, defaultWorkDays, tab, onTabChange: setTab,
}: AdminProps) {
  const memberById = Object.fromEntries(members.map(m => [m.id, m]));
  const year = Number(month.split('/')[0]);
  const [catFilter, setCatFilter] = useState<CatFilter>('all');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
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
    const actual = sum(cards.filter(c => c.owner === m.id).map(c => c.actual ?? 0));
    const pct = monthHours > 0 ? Math.round((load / monthHours) * 100) : (load > 0 ? 999 : 0);
    return { m, days, ratio, lv, monthHours, load, actual, pct };
  }), [memberDays, memberRatios, leaveByMember, cards, defaultWorkDays]);

  const filteredRows  = catFilter === 'all' ? memberRows : memberRows.filter(r => r.m.cat === catFilter);
  const filteredCards = catFilter === 'all' ? cards : cards.filter(c => c.cat === catFilter);
  const filteredMonthHours = sum(filteredRows.map(r => r.monthHours));
  const filteredLoad  = sum(filteredCards.map(c => c.est));
  const filteredLeave = sum(filteredRows.map(r => r.lv));
  const filteredPct   = filteredMonthHours > 0 ? Math.round((filteredLoad / filteredMonthHours) * 100) : 0;

  const deptMap: Record<string, number> = {};
  const deptActualMap: Record<string, number> = {};
  for (const c of filteredCards) {
    deptMap[c.dept] = (deptMap[c.dept] || 0) + c.est;
    deptActualMap[c.dept] = (deptActualMap[c.dept] || 0) + (c.actual ?? 0);
  }
  const deptLoads = Object.entries(deptMap).sort((a, b) => b[1] - a[1]);
  const maxDeptLoad = Math.max(...deptLoads.map(d => d[1]), 1);

  const totalMonthHours = sum(memberRows.map(r => r.monthHours));
  const totalLoad       = sum(memberRows.map(r => r.load));
  const totalActual     = sum(memberRows.map(r => r.actual));
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
    const entry: LeaveEntry = {
      id: `lv${Date.now()}`,
      member: newLeave.member,
      date: newLeave.startDate,
      hours: newLeaveHours,
    };
    if (newLeave.startDate !== newLeave.endDate) entry.endDate = newLeave.endDate;
    setLeave([...leave, entry]);
    setNewLeave(p => ({ ...p, startDate: '', endDate: '', startMin: 510, endMin: 1080 }));
    setLeaveModal(false);
  }

  // Build LeaveCalendar data
  const calHolidays = useMemo(() => new Set(publicHolidays.map(h => h.date)), [publicHolidays]);
  const calLeaveDots = useMemo(() => {
    const mo = Number(month.split('/')[1]);
    const dots: Record<string, LeaveCalendarDot[]> = {};
    for (const l of leave) {
      const end = l.endDate || l.date;
      const [smo2, sday2] = l.date.split('/').map(Number);
      const [emo2, eday2] = end.split('/').map(Number);
      const cur = new Date(year, smo2 - 1, sday2);
      const endD = new Date(year, emo2 - 1, eday2);
      while (cur <= endD) {
        if (cur.getMonth() + 1 === mo) {
          const key = `${String(cur.getMonth() + 1).padStart(2, '0')}/${String(cur.getDate()).padStart(2, '0')}`;
          const mb = memberById[l.member];
          (dots[key] ??= []).push({ id: l.id, color: mb ? hue(mb.hue) : 'var(--md-sys-color-on-surface-muted)' });
        }
        cur.setDate(cur.getDate() + 1);
      }
    }
    return dots;
  }, [leave, year, month, memberById]);

  // Members table columns
  const memberColumns: TableColumn<MemberRow>[] = [
    {
      key: 'member', header: '成員', align: 'left',
      render: ({ m }) => <MemberCell photo={m.photo} name={m.name} initial={m.initial} color={hue(m.hue)} sub={m.cat} />,
      footer: <span style={{ fontWeight: 600 }}>合計</span>,
    },
    {
      key: 'days', header: '工作天',
      render: ({ m, days }) => (
        <input className="num-input" type="number" min={0} max={31}
          value={draftDays[m.id] ?? days}
          onChange={e => setDraftDays(d => ({ ...d, [m.id]: e.target.value }))}
          onBlur={() => {
            const v = Number(draftDays[m.id] ?? days);
            setDraftDays(d => { const c = { ...d }; delete c[m.id]; return c; });
            setMemberDays({ ...memberDays, [m.id]: v });
          }} />
      ),
      footer: '—',
    },
    {
      key: 'ratio', header: '工時比例(%)',
      render: ({ m, ratio }) => (
        <input className="num-input" type="number" min={10} max={100} step={0.5}
          value={draftRatios[m.id] ?? Math.round(ratio * 1000) / 10}
          onChange={e => setDraftRatios(r => ({ ...r, [m.id]: e.target.value }))}
          onBlur={() => {
            const v = Number(draftRatios[m.id] ?? Math.round(ratio * 1000) / 10);
            setDraftRatios(r => { const c = { ...r }; delete c[m.id]; return c; });
            setMemberRatios({ ...memberRatios, [m.id]: v / 100 });
          }} />
      ),
      footer: '—',
    },
    {
      key: 'lv', header: '請假(h)',
      render: ({ lv }) => lv,
      footer: totalLeaveHours,
    },
    {
      key: 'monthHours', header: <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>月工時 <InfoTooltip content={'工作天 × 8 × 工時比例 − 請假'} position="bottom" /></span>,
      render: ({ monthHours }) => <span style={{ fontWeight: 600 }}>{monthHours}</span>,
      footer: <span style={{ fontWeight: 600 }}>{totalMonthHours}</span>,
    },
    {
      key: 'load', header: '承接(h)',
      render: ({ load }) => load,
      footer: totalLoad,
    },
    {
      key: 'actual', header: '實際(h)',
      render: ({ actual }) => actual,
      footer: totalActual,
    },
    {
      key: 'pct', header: <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>量能% <InfoTooltip content={'承接(h) ÷ 月工時 × 100%'} position="bottom" /></span>,
      render: ({ pct, monthHours, load }) => {
        if (monthHours === 0) return <span className="cap-pct">—</span>;
        return (
          <div className="cap-bar">
            <div className="track"><span style={{ width: `${Math.min(pct, 100)}%`, background: capColor(pct) }} /></div>
            <span className={`cap-pct ${capClass(pct)}`}>{pct}%</span>
          </div>
        );
      },
      footer: (
        <div className="cap-bar">
          <div className="track"><span style={{ width: `${Math.min(totalPct, 100)}%`, background: capColor(totalPct) }} /></div>
          <span className={`cap-pct ${capClass(totalPct)}`}>{totalPct}%</span>
        </div>
      ),
    },
  ];

  const TABS: { id: MainTab; label: string }[] = [
    { id: 'capacity', label: '設計量能' },
    { id: 'members',  label: '成員工時表' },
    { id: 'leave',    label: '請假紀錄' },
  ];

  const calMonth = Number(month.split('/')[1]);

  return (
    <div className="admin-wrap" style={{ padding: '18px 22px' }}>
      <div className="panel">

        {/* Mobile-only month switcher */}
        <div className="cap-month-pill-mobile">
          <button onClick={() => onMonthChange(shiftMonth(month, -1))}><ChevronLeft size={14} /></button>
          <span className="cap-month-val">{month}</span>
          <button onClick={() => onMonthChange(shiftMonth(month, 1))}><ChevronRight size={14} /></button>
        </div>

        {/* Tab bar */}
        <div className="admin-tab-bar" style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--md-sys-color-outline-variant)' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              className="admin-tab"
              onClick={() => setTab(t.id)}
              style={{
                appearance: 'none', border: 'none', background: 'none', cursor: 'pointer',
                padding: '11px 18px', fontSize: 14, fontWeight: tab === t.id ? 600 : 400,
                color: tab === t.id ? 'var(--md-sys-color-on-surface)' : 'var(--md-sys-color-on-surface-muted)',
                borderBottom: tab === t.id ? '2px solid var(--md-sys-color-primary)' : '2px solid transparent',
                marginBottom: -1, transition: 'color 0.15s', fontFamily: 'inherit',
              }}
            >
              {t.label}
            </button>
          ))}

          <span className="admin-tab-spacer" style={{ flex: 1 }} />

          {tab === 'leave' && selectedDate && (
            <Button variant="ghost" style={{ fontSize: 13, padding: '2px 8px', gap: 4, marginRight: 16 }}
                    onClick={() => setSelectedDate(null)}>
              {selectedDate} <X size={11} />
            </Button>
          )}
        </div>

        {/* ── 設計量能 ── */}
        {tab === 'capacity' && (
          <div style={{ padding: '20px 24px 28px' }}>
            <div className="layout-pick" style={{ marginBottom: 20 }}>
              {([['all', 'Total'], ['UIUX', 'UIUX'], ['平面視覺', '平面視覺']] as [CatFilter, string][]).map(([v, lbl]) => (
                <button key={v} data-on={catFilter === v ? '1' : '0'} onClick={() => setCatFilter(v)}>{lbl}</button>
              ))}
            </div>

            <div className="cap-overview-layout" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 32, alignItems: 'start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--md-sys-color-on-surface-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  量能總覽
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ font: `600 64px/1 var(--font-mono), monospace`, letterSpacing: '-0.03em', color: capColor(filteredPct) }}>
                    {filteredPct}%
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--md-sys-color-on-surface-muted)', marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    {catLabel}量能使用率
                    <InfoTooltip content={`本月承接 ÷ 可用工時 × 100%\n= ${filteredLoad}h ÷ ${filteredMonthHours}h × 100%`} />
                  </div>
                  <div style={{ height: 6, borderRadius: 99, background: 'var(--md-sys-color-surface-variant)', overflow: 'hidden', marginTop: 12 }}>
                    <div style={{ width: `${Math.min(filteredPct, 100)}%`, height: '100%', borderRadius: 99, background: capColor(filteredPct), transition: 'width 0.3s ease' }} />
                  </div>
                </div>
                <div className="cap-stat-row">
                  {[
                    { l: '可用工時', v: `${filteredMonthHours}h` },
                    { l: '本月承接', v: `${filteredLoad}h` },
                    { l: '請假工時', v: `${filteredLeave}h` },
                  ].map((s, i) => (
                    <div key={i} className="cap-stat-card" style={{ background: 'var(--md-sys-color-surface-variant)', borderRadius: 'var(--r)', padding: '14px 18px' }}>
                      <div style={{ fontSize: 12, color: 'var(--md-sys-color-on-surface-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{s.l}</div>
                      <div className="cap-stat-v" style={{ font: `600 26px/1 var(--font-mono), monospace`, color: 'var(--md-sys-color-on-surface)', marginTop: 6 }}>{s.v}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--md-sys-color-on-surface-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>
                  承接分佈
                  <Tag style={{ fontSize: 12, marginLeft: 8 }}>{deptLoads.length} 部門</Tag>
                </div>
                {deptLoads.length === 0 ? (
                  <div style={{ fontSize: 13, color: 'var(--md-sys-color-on-surface-muted)' }}>無資料</div>
                ) : deptLoads.map(([dept, load]) => {
                  const pct = (load / maxDeptLoad) * 100;
                  const actual = deptActualMap[dept] ?? 0;
                  const color = deptColors[dept] ?? hue(DEPT_HUE[dept] || 1);
                  return (
                    <div key={dept} className="dept-bar-row">
                      <div className="name" title={dept}>
                        <span className="chip-dot" style={{ background: color, display: 'inline-block', marginRight: 6 }} />
                        {DEPT_SHORT[dept] || dept}
                      </div>
                      <div className="v">
                        {load}h
                        {actual > 0 && <span style={{ fontSize: 11, color: 'var(--md-sys-color-on-surface-muted)', marginLeft: 4 }}>/ {actual}h</span>}
                      </div>
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
          <Table
            className="cap-table"
            columns={memberColumns}
            rows={memberRows}
            getKey={r => r.m.id}
            hasFooter
          />
        )}

        {/* ── 請假紀錄 ── */}
        {tab === 'leave' && (
          <div className="cap-leave-layout" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 0, alignItems: 'start' }}>
            <div className="cap-leave-cal" style={{ borderRight: '1px solid var(--md-sys-color-outline-variant)', padding: '16px 0' }}>
              <LeaveCalendar
                year={year}
                month={calMonth}
                holidays={calHolidays}
                leaveDots={calLeaveDots}
                selectedDate={selectedDate}
                onSelect={setSelectedDate}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 10px' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--md-sys-color-on-surface)' }}>
                  {selectedDate ? `${selectedDate} 請假` : '所有請假記錄'}
                  {selectedDate && (
                    <Button variant="ghost" style={{ fontSize: 12, padding: '2px 7px', marginLeft: 8 }}
                            onClick={() => setSelectedDate(null)}>
                      清除 <X size={10} />
                    </Button>
                  )}
                </span>
                <Button variant="primary" style={{ fontSize: 13, padding: '4px 12px' }}
                        onClick={() => {
                          setNewLeave(p => ({ ...p, startDate: selectedDate ?? '', endDate: selectedDate ?? '', member: p.member || (members[0]?.id ?? '') }));
                          setLeaveModal(true);
                        }}>
                  <span style={{ fontSize: 15, lineHeight: 1, marginRight: 2 }}>+</span> 新增
                </Button>
              </div>

              <div className="leave-list" style={{ flex: 1, minHeight: 200 }}>
                {visibleLeave.length === 0 ? (
                  <div style={{ padding: '24px 18px', fontSize: 13, color: 'var(--md-sys-color-on-surface-muted)', textAlign: 'center' }}>
                    {selectedDate ? '當日無請假記錄' : '尚無請假記錄'}
                  </div>
                ) : visibleLeave.map(entry => {
                  const mb = memberById[entry.member];
                  return (
                    <div key={entry.id} className="leave-row">
                      <div className="who">
                        {mb
                          ? <MemberCell photo={mb.photo} name={mb.name} initial={mb.initial} color={hue(mb.hue)} />
                          : <span>{entry.member}</span>}
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
        )}

      </div>

      {/* Add leave modal */}
      <Modal
        open={leaveModal}
        onClose={() => setLeaveModal(false)}
        title="新增請假"
        footer={
          <>
            <Button variant="ghost" onClick={() => setLeaveModal(false)}>取消</Button>
            <Button variant="primary" onClick={addLeave}
                    disabled={!newLeave.startDate.trim() || !newLeave.endDate.trim() || newLeaveHours <= 0}>
              儲存
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <FormRow label="成員">
            <Input as="select" style={{ width: '100%' }} value={newLeave.member}
                   onChange={e => setNewLeave(p => ({ ...p, member: (e.target as HTMLSelectElement).value }))}>
              {!newLeave.member && <option value="">請選擇成員</option>}
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </Input>
          </FormRow>
          <FormRow label="開始">
            <div style={{ display: 'flex', gap: 8, width: '100%' }}>
              <Input type="date" style={{ width: 150 }}
                     value={newLeave.startDate ? `${year}-${newLeave.startDate.replace('/', '-')}` : ''}
                     onChange={e => {
                       const v = (e.target as HTMLInputElement).value ? (e.target as HTMLInputElement).value.slice(5).replace('-', '/') : '';
                       setNewLeave(p => ({ ...p, startDate: v, endDate: (!p.endDate || v > p.endDate) ? v : p.endDate }));
                     }} />
              <Input as="select" style={{ flex: 1 }} value={newLeave.startMin}
                     onChange={e => setNewLeave(p => ({ ...p, startMin: Number((e.target as HTMLSelectElement).value) }))}>
                {TIME_SLOTS.map(s => <option key={s.min} value={s.min}>{s.label}</option>)}
              </Input>
            </div>
          </FormRow>
          <FormRow label="結束">
            <div style={{ display: 'flex', gap: 8, width: '100%' }}>
              <Input type="date" style={{ width: 150 }}
                     value={newLeave.endDate ? `${year}-${newLeave.endDate.replace('/', '-')}` : ''}
                     onChange={e => {
                       const v = (e.target as HTMLInputElement).value ? (e.target as HTMLInputElement).value.slice(5).replace('-', '/') : '';
                       setNewLeave(p => ({ ...p, endDate: v }));
                     }} />
              <Input as="select" style={{ flex: 1 }} value={newLeave.endMin}
                     onChange={e => setNewLeave(p => ({ ...p, endMin: Number((e.target as HTMLSelectElement).value) }))}>
                {TIME_SLOTS.map(s => <option key={s.min} value={s.min}>{s.label}</option>)}
              </Input>
            </div>
          </FormRow>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--md-sys-color-surface-variant)', borderRadius: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--md-sys-color-on-surface-muted)' }}>計算工時</span>
            <span style={{ fontFamily: 'var(--font-mono), monospace', fontWeight: 700, fontSize: 16, color: newLeaveHours > 0 ? 'var(--md-sys-color-on-surface)' : 'var(--md-sys-color-on-surface-muted)', marginLeft: 'auto' }}>
              {newLeaveHours > 0 ? `${newLeaveHours} h` : '—'}
            </span>
          </div>
        </div>
      </Modal>

    </div>
  );
}
