'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutGrid, BarChart2, TrendingUp, Archive, Shield,
  Search, Bell, Settings, Plus, Download, X,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import type { Card, HistoryMonth, LeaveEntry, PublicHoliday, DashLayout, ChartType, CardStatus } from '@/lib/types';
import {
  MEMBERS, MEMBER_BY_ID, STATUSES, DEPTS, DEPT_SHORT, DEPT_HUE,
  CURRENT_CARDS, HISTORY, DEFAULT_LEAVE, DEFAULT_HOLIDAYS,
} from '@/lib/data';
import { sum, groupBy, hue, formatId, shiftMonth, workingDaysInMonth } from '@/lib/utils';
import KanbanBoard from '@/components/kanban/board';
import CardDrawer from '@/components/kanban/card-drawer';
import NewCardModal from '@/components/kanban/new-card-modal';
import Dashboard from '@/components/dashboard/index';
import Admin from '@/components/admin/index';
import History from '@/components/history/index';
import Permissions from '@/components/permissions/index';

const ACCENT_PRESETS = {
  violet: { hex: '#6B5BD9', light: 'oklch(0.52 0.14 282)', soft: 'oklch(0.94 0.03 282)', dark: 'oklch(0.74 0.14 282)', darkSoft: 'oklch(0.28 0.05 282)' },
  forest: { hex: '#3B7755', light: 'oklch(0.48 0.10 152)', soft: 'oklch(0.94 0.03 152)', dark: 'oklch(0.74 0.12 152)', darkSoft: 'oklch(0.26 0.04 152)' },
  rust:   { hex: '#B85C2E', light: 'oklch(0.55 0.13 38)',  soft: 'oklch(0.94 0.04 38)',  dark: 'oklch(0.74 0.13 38)',  darkSoft: 'oklch(0.28 0.05 38)' },
  ink:    { hex: '#3A3935', light: 'oklch(0.30 0.02 270)', soft: 'oklch(0.94 0.01 270)', dark: 'oklch(0.85 0.01 270)', darkSoft: 'oklch(0.22 0.01 270)' },
};

type Page = 'kanban' | 'dashboard' | 'capacity' | 'history' | 'permissions';

export default function App() {
  const [page, setPage] = useState<Page>('kanban');
  const [month, setMonth] = useState('2026/05');
  const [cards, setCards] = useState<Card[]>(CURRENT_CARDS);
  const [openCardId, setOpenCardId] = useState<string | null>(null);
  const [newCardOpen, setNewCardOpen] = useState(false);
  const [newCardDefaultStatus, setNewCardDefaultStatus] = useState<CardStatus>('belog');
  const [query, setQuery] = useState('');
  const [filterMember, setFilterMember] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [memberRatios, setMemberRatios] = useState<Record<string, number>>({});
  const [memberDays, setMemberDays] = useState<Record<string, number>>({});
  const [publicHolidays, setPublicHolidays] = useState<PublicHoliday[]>(DEFAULT_HOLIDAYS);
  const [leave, setLeave] = useState<LeaveEntry[]>(DEFAULT_LEAVE);
  const [history, setHistory] = useState<HistoryMonth[]>(HISTORY);
  const [previewCard, setPreviewCard] = useState<Card | null>(null);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [archiveMonthInput, setArchiveMonthInput] = useState('2026/05');

  // Tweaks
  const [dark, setDark] = useState(false);
  const [density, setDensity] = useState<'compact' | 'comfy'>('comfy');
  const [chartType, setChartType] = useState<ChartType>('donut');
  const [dashLayout, setDashLayout] = useState<DashLayout>('classic');
  const [showAdmin, setShowAdmin] = useState(true);
  const [accent, setAccent] = useState<keyof typeof ACCENT_PRESETS>('violet');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    document.documentElement.setAttribute('data-density', density);
  }, [density]);

  useEffect(() => {
    const p = ACCENT_PRESETS[accent];
    const r = document.documentElement.style;
    r.setProperty('--accent', dark ? p.dark : p.light);
    r.setProperty('--accent-soft', dark ? p.darkSoft : p.soft);
  }, [accent, dark]);

  useEffect(() => {
    const year = month.split('/')[0];
    fetch(`/api/holidays?year=${year}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((data: PublicHoliday[]) => { if (data.length > 0) setPublicHolidays(data); })
      .catch(() => {});
  }, [month.split('/')[0]]);

  const monthCards = useMemo(() => {
    if (month === '2026/05') return cards;
    const seed = month.charCodeAt(month.length - 1);
    return cards.slice(0, 14 + (seed % 8)).map((c, i) => ({
      ...c, month,
      est: Math.max(4, Math.round(c.est * (0.7 + ((seed + i) % 5) * 0.1))),
      actual: Math.max(0, Math.round(c.actual * (0.6 + ((seed + i) % 4) * 0.12))),
    }));
  }, [cards, month]);

  const leaveByMember = useMemo(() =>
    Object.fromEntries(MEMBERS.map(m => [m.id,
      sum(leave.filter(l => l.member === m.id).map(l => l.hours))])),
    [leave]);

  const defaultWorkDays = useMemo(
    () => workingDaysInMonth(month, publicHolidays),
    [month, publicHolidays],
  );

  const totalCapacity = useMemo(() =>
    MEMBERS.reduce((acc, m) => {
      const days = memberDays[m.id] ?? defaultWorkDays;
      const ratio = memberRatios[m.id] ?? m.ratio;
      const lv = leaveByMember[m.id] || 0;
      return acc + Math.max(0, Math.round(days * 8 * ratio) - lv);
    }, 0),
    [memberDays, memberRatios, defaultWorkDays, leaveByMember],
  );

  const openCard = cards.find(c => c.id === openCardId) ?? null;

  const onMove = (cardId: string, newStatus: string) => {
    setCards(cs => cs.map(c => c.id === cardId ? { ...c, status: newStatus as Card['status'] } : c));
  };
  const onUpdate = (cardId: string, patch: Partial<Card>) => {
    setCards(cs => cs.map(c => c.id === cardId ? { ...c, ...patch } : c));
  };
  const onCreate = (data: import('@/components/kanban/new-card-modal').NewCardData) => {
    const maxN = cards.reduce((m, c) => Math.max(m, Number(c.id.split('-')[1])), 0);
    const nc: Card = {
      ...data,
      id: formatId(maxN + 1),
      month: '2026/05',
      owner: '',
      est: 0,
      actual: 0,
      attach: 0,
      activity: [],
    };
    setCards(cs => [nc, ...cs]);
  };

  const onArchive = (archiveMonth: string) => {
    const archiveStatuses: CardStatus[] = ['done', 'pending'];
    const toArchive = cards.filter(c => archiveStatuses.includes(c.status));
    if (toArchive.length === 0) return;
    const toRollover = cards.filter(c => !archiveStatuses.includes(c.status));
    const totalEst = sum(toArchive.map(c => c.est));
    const totalActual = sum(toArchive.map(c => c.actual));
    const byDept = groupBy(toArchive, 'dept');
    const topDept = Object.entries(byDept)
      .map(([d, xs]) => [d, sum(xs.map(c => c.est))] as [string, number])
      .sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
    const newMonth: HistoryMonth = {
      month: archiveMonth,
      cards: toArchive.length,
      totalEst,
      totalActual,
      capacity: totalCapacity,
      topDept,
      deptTotals: Object.fromEntries(Object.entries(byDept).map(([d, xs]) => [d, sum(xs.map(c => c.est))])),
      memberTotals: Object.fromEntries(MEMBERS.map(m => [m.id, sum(toArchive.filter(c => c.owner === m.id).map(c => c.actual))])),
      cardList: toArchive,
    };
    setHistory(h => [newMonth, ...h]);
    setCards(toRollover);
  };

  const currentSnapshot = useMemo(() => {
    const totalEst = sum(cards.map(c => c.est));
    const totalActual = sum(cards.map(c => c.actual));
    const byDept = groupBy(cards, 'dept');
    const topDept = Object.entries(byDept)
      .map(([d, xs]) => [d, sum(xs.map(c => c.est))] as [string, number])
      .sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
    return {
      month: '2026/05',
      cards: cards.length,
      totalEst,
      totalActual,
      capacity: totalCapacity,
      topDept,
    };
  }, [cards, totalCapacity]);

  const workspacePages = [
    { id: 'kanban' as Page,    name: '任務看板', icon: <LayoutGrid size={15} />, count: cards.length },
    { id: 'dashboard' as Page, name: 'Dashboard', icon: <BarChart2 size={15} /> },
    { id: 'history' as Page,   name: '歷史封存', icon: <Archive size={15} />, count: history.length },
  ];
  const adminPages = [
    { id: 'capacity' as Page,     name: '量能管理', icon: <TrendingUp size={15} /> },
    { id: 'permissions' as Page,  name: '權限管理', icon: <Shield size={15} /> },
  ];

  return (
    <div className="app">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sb-brand">
          <div className="sb-mark">設</div>
          <div>
            <div className="sb-brand-name">DesignOps</div>
            <div className="sb-brand-sub">產能管理系統</div>
          </div>
        </div>

        <div className="sb-group">
          <div className="sb-group-h">工作台</div>
          {workspacePages.map(p => (
            <button key={p.id} className="sb-item" data-on={page === p.id ? '1' : '0'}
                    onClick={() => setPage(p.id)}>
              {p.icon}
              <span>{p.name}</span>
              {p.count != null && <span className="sb-item-tag">{p.count}</span>}
            </button>
          ))}
        </div>
        {showAdmin && (
          <div className="sb-group">
            <div className="sb-group-h">管理</div>
            {adminPages.map(p => (
              <button key={p.id} className="sb-item" data-on={page === p.id ? '1' : '0'}
                      onClick={() => setPage(p.id)}>
                {p.icon}
                <span>{p.name}</span>
              </button>
            ))}
          </div>
        )}

        <div className="sb-bottom">
          <div className="sb-avatar">設</div>
          <div>
            <div className="sb-user">主設計師</div>
            <div className="sb-user-role">設計組長 · Admin</div>
          </div>
          <Settings size={14} style={{ color: 'var(--muted)', marginLeft: 'auto' }} />
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="main">
        <header className="topbar">
          <div>
            <div className="tb-title">
              {[...workspacePages, ...adminPages].find(p => p.id === page)?.name}
              {page === 'kanban' && (filterMember || filterDept || query) && (
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)', marginLeft: 8 }}>
                  · 篩選中
                </span>
              )}
            </div>
            <div className="tb-crumb">
              {page === 'kanban'      && `工作台 / 任務看板`}
              {page === 'dashboard'   && `工作台 / Dashboard`}
              {page === 'history'     && '工作台 / 歷史封存'}
              {page === 'capacity'    && `管理 / 量能管理 / ${month}`}
              {page === 'permissions' && '管理 / 權限管理'}
            </div>
          </div>

          <span className="tb-spacer" />

          <div className="tb-tools">
            {page === 'kanban' && (
              <>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  {MEMBERS.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setFilterMember(filterMember === m.id ? '' : m.id)}
                      title={m.name}
                      style={{
                        appearance: 'none', border: 'none', padding: 0, cursor: 'pointer',
                        borderRadius: '50%', background: 'transparent',
                        opacity: filterMember && filterMember !== m.id ? 0.3 : 1,
                        boxShadow: filterMember === m.id
                          ? `0 0 0 2px var(--surface), 0 0 0 3.5px ${hue(m.hue)}`
                          : 'none',
                        transition: 'opacity 0.15s, box-shadow 0.15s',
                      }}
                    >
                      <span className="av av-sm" style={{ background: hue(m.hue) }}>{m.initial}</span>
                    </button>
                  ))}
                </div>
                <div style={{ width: 1, height: 18, background: 'var(--border)', margin: '0 2px' }} />
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-2)', pointerEvents: 'none' }}>
                    <Search size={13} />
                  </span>
                  <input className="input" placeholder="搜尋" style={{ paddingLeft: 26, width: 130 }}
                         value={query} onChange={e => setQuery(e.target.value)} />
                </div>
              </>
            )}

            {(page === 'kanban' || page === 'dashboard') && (
              <select className="input" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
                <option value="">全部單位</option>
                {DEPTS.map(d => <option key={d} value={d}>{DEPT_SHORT[d] || d}</option>)}
              </select>
            )}

            {page === 'dashboard' && (
              <div className="layout-pick" title="Dashboard 佈局">
                {(['classic', 'focus', 'grid'] as DashLayout[]).map(l => (
                  <button key={l} data-on={dashLayout === l ? '1' : '0'} onClick={() => setDashLayout(l)}>
                    {l === 'classic' ? '經典' : l === 'focus' ? '交叉' : '緊湊'}
                  </button>
                ))}
              </div>
            )}

            {page === 'capacity' && (
              <div className="month-pill">
                <button onClick={() => setMonth(m => shiftMonth(m, -1))}><ChevronLeft size={14} /></button>
                <span className="month-pill-val">{month}</span>
                <button onClick={() => setMonth(m => shiftMonth(m, 1))}><ChevronRight size={14} /></button>
              </div>
            )}

            {page === 'kanban' && (
              <>
                <button className="btn" onClick={() => { setArchiveMonthInput('2026/05'); setArchiveModalOpen(true); }} title="將設計完成與 Pending 卡片封存到歷史">
                  <Archive size={14} /> 封存本月
                </button>
                <button className="btn btn-primary"
                        onClick={() => { setNewCardDefaultStatus('belog'); setNewCardOpen(true); }}>
                  <Plus size={14} /> 新需求單
                </button>
              </>
            )}
            {page === 'dashboard' && (
              <button className="btn"><Download size={14} /> 匯出</button>
            )}

            <button className="btn btn-ghost" title="通知"><Bell size={14} /></button>
          </div>
        </header>

        <div className="body">
          {page === 'kanban' && (
            <KanbanBoard
              cards={cards}
              query={query}
              filterMember={filterMember}
              filterDept={filterDept}
              onMove={onMove}
              onOpen={id => setOpenCardId(id)}
              onAddCard={status => { setNewCardDefaultStatus(status as CardStatus); setNewCardOpen(true); }}
            />
          )}
          {page === 'dashboard' && (
            <Dashboard
              cards={monthCards.filter(c => !filterDept || c.dept === filterDept)}
              layout={dashLayout}
              chartType={chartType}
              totalCapacity={totalCapacity}
              filterDept={filterDept}
            />
          )}
          {page === 'capacity' && showAdmin && (
            <Admin
              cards={monthCards}
              memberRatios={memberRatios}
              setMemberRatios={setMemberRatios}
              memberDays={memberDays}
              setMemberDays={setMemberDays}
              leave={leave}
              setLeave={setLeave}
              publicHolidays={publicHolidays}
              month={month}
              defaultWorkDays={defaultWorkDays}
            />
          )}
          {page === 'history' && (
            <History
              archives={history}
              currentSnapshot={currentSnapshot}
              onArchive={() => { setArchiveMonthInput('2026/05'); setArchiveModalOpen(true); }}
              onOpenCard={card => setPreviewCard(card)}
            />
          )}
          {page === 'permissions' && showAdmin && (
            <Permissions />
          )}
        </div>
      </main>

      <CardDrawer card={openCard} onClose={() => setOpenCardId(null)} onUpdate={onUpdate} />
      <CardDrawer card={previewCard} onClose={() => setPreviewCard(null)} onUpdate={() => {}} />
      <NewCardModal
        open={newCardOpen}
        onClose={() => setNewCardOpen(false)}
        onCreate={onCreate}
        defaultStatus={newCardDefaultStatus}
      />

      {/* ── Archive confirm modal ── */}
      {archiveModalOpen && (() => {
        const toArchive = cards.filter(c => c.status === 'done' || c.status === 'pending');
        return (
          <div className="modal-scrim open" onClick={e => e.target === e.currentTarget && setArchiveModalOpen(false)}>
            <div className="modal">
              <div className="modal-h">
                <span className="modal-h-title">封存月份</span>
                <span style={{ flex: 1 }} />
                <button className="drawer-close" onClick={() => setArchiveModalOpen(false)} type="button">
                  <X size={16} />
                </button>
              </div>
              <div className="modal-body">
                <div className="form-row">
                  <label>封存月份</label>
                  <input
                    className="input"
                    style={{ width: '100%' }}
                    placeholder="YYYY/MM"
                    value={archiveMonthInput}
                    onChange={e => setArchiveMonthInput(e.target.value)}
                    autoFocus
                  />
                </div>
                <p style={{ margin: 0, fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.6 }}>
                  將封存 <strong style={{ color: 'var(--ink)' }}>{toArchive.length} 張</strong>「設計完成」與「Pending」卡片到歷史。
                  {cards.length - toArchive.length > 0 && (
                    <> 其餘 <strong style={{ color: 'var(--ink)' }}>{cards.length - toArchive.length} 張</strong> 繼續留在看板。</>
                  )}
                </p>
              </div>
              <div className="modal-f">
                <button type="button" className="btn btn-ghost" onClick={() => setArchiveModalOpen(false)}>取消</button>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={!archiveMonthInput.trim() || toArchive.length === 0}
                  onClick={() => { onArchive(archiveMonthInput.trim()); setArchiveModalOpen(false); }}
                >
                  <Archive size={14} /> 確認封存
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
