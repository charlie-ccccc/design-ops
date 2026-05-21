'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutGrid, BarChart2, TrendingUp, Archive,
  Search, Bell, Settings, Plus, Download,
  ChevronLeft, ChevronRight, Filter,
} from 'lucide-react';
import type { Card, LeaveEntry, DashLayout, ChartType, CardStatus } from '@/lib/types';
import {
  MEMBERS, MEMBER_BY_ID, STATUSES, DEPTS, DEPT_SHORT, DEPT_HUE,
  CURRENT_CARDS, HISTORY, DEFAULT_LEAVE, DEFAULT_BASE,
} from '@/lib/data';
import { sum, groupBy, hue, formatId, shiftMonth } from '@/lib/utils';
import KanbanBoard from '@/components/kanban/board';
import CardDrawer from '@/components/kanban/card-drawer';
import NewCardModal from '@/components/kanban/new-card-modal';
import Dashboard from '@/components/dashboard/index';
import Admin from '@/components/admin/index';
import History from '@/components/history/index';

const ACCENT_PRESETS = {
  violet: { hex: '#6B5BD9', light: 'oklch(0.52 0.14 282)', soft: 'oklch(0.94 0.03 282)', dark: 'oklch(0.74 0.14 282)', darkSoft: 'oklch(0.28 0.05 282)' },
  forest: { hex: '#3B7755', light: 'oklch(0.48 0.10 152)', soft: 'oklch(0.94 0.03 152)', dark: 'oklch(0.74 0.12 152)', darkSoft: 'oklch(0.26 0.04 152)' },
  rust:   { hex: '#B85C2E', light: 'oklch(0.55 0.13 38)',  soft: 'oklch(0.94 0.04 38)',  dark: 'oklch(0.74 0.13 38)',  darkSoft: 'oklch(0.28 0.05 38)' },
  ink:    { hex: '#3A3935', light: 'oklch(0.30 0.02 270)', soft: 'oklch(0.94 0.01 270)', dark: 'oklch(0.85 0.01 270)', darkSoft: 'oklch(0.22 0.01 270)' },
};

type Page = 'kanban' | 'dashboard' | 'capacity' | 'history';

export default function App() {
  const [page, setPage] = useState<Page>('kanban');
  const [month, setMonth] = useState('2026/05');
  const [cards, setCards] = useState<Card[]>(CURRENT_CARDS);
  const [openCardId, setOpenCardId] = useState<string | null>(null);
  const [newCardOpen, setNewCardOpen] = useState(false);
  const [newCardDefaultStatus, setNewCardDefaultStatus] = useState<CardStatus>('todo');
  const [query, setQuery] = useState('');
  const [filterMember, setFilterMember] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [baseHours, setBaseHours] = useState<Record<string, number>>(DEFAULT_BASE);
  const [leave, setLeave] = useState<LeaveEntry[]>(DEFAULT_LEAVE);

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

  const totalCapacity = useMemo(() =>
    MEMBERS.reduce((acc, m) => acc + (baseHours[m.id] ?? m.base) - (leaveByMember[m.id] || 0), 0),
    [baseHours, leaveByMember]);

  const openCard = cards.find(c => c.id === openCardId) ?? null;

  const onMove = (cardId: string, newStatus: string) => {
    setCards(cs => cs.map(c => c.id === cardId ? { ...c, status: newStatus as Card['status'] } : c));
  };
  const onUpdate = (cardId: string, patch: Partial<Card>) => {
    setCards(cs => cs.map(c => c.id === cardId ? { ...c, ...patch } : c));
  };
  const onCreate = (data: Omit<Card, 'id' | 'month' | 'desc' | 'attach' | 'activity'>) => {
    const maxN = cards.reduce((m, c) => Math.max(m, Number(c.id.split('-')[1])), 0);
    const nc: Card = {
      ...data,
      id: formatId(maxN + 1),
      month: '2026/05',
      desc: data.cat === 'UIUX'
        ? '本單為 UIUX 設計需求，交付物含 Figma 原型、規格、互動 demo 影片。'
        : '本單為平面視覺需求，交付物含主視覺、延伸 SocialKV、可編輯原始檔。',
      attach: 2,
      activity: [{ who: '系統', msg: `${MEMBER_BY_ID[data.owner].name} 接下此單`, t: '5/20 16:30' }],
    };
    setCards(cs => [nc, ...cs]);
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
      capacity: Math.round((totalEst / totalCapacity) * 100) || 0,
      topDept,
    };
  }, [cards, totalCapacity]);

  const navPages = [
    { id: 'kanban' as Page,    name: '任務看板', icon: <LayoutGrid size={15} />, count: cards.length },
    { id: 'dashboard' as Page, name: 'Dashboard', icon: <BarChart2 size={15} /> },
    ...(showAdmin ? [{ id: 'capacity' as Page, name: '量能管理', icon: <TrendingUp size={15} />, tag: 'Admin' }] : []),
    { id: 'history' as Page,   name: '歷史封存', icon: <Archive size={15} />, count: HISTORY.length },
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
          {navPages.map(p => (
            <button key={p.id} className="sb-item" data-on={page === p.id ? '1' : '0'}
                    onClick={() => setPage(p.id)}>
              {p.icon}
              <span>{p.name}</span>
              {p.tag && <span className="sb-item-tag" style={{ color: 'var(--accent)', fontWeight: 600 }}>{p.tag}</span>}
              {p.count != null && <span className="sb-item-tag">{p.count}</span>}
            </button>
          ))}
        </div>

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
              {navPages.find(p => p.id === page)?.name}
              {page === 'kanban' && (filterMember || filterDept || query) && (
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)', marginLeft: 8 }}>
                  · 篩選中
                </span>
              )}
            </div>
            <div className="tb-crumb">
              {page === 'kanban' && `Workspace / 任務看板 / ${month}`}
              {page === 'dashboard' && `Workspace / Dashboard / ${month}`}
              {page === 'capacity' && `Admin / 量能管理 / ${month}`}
              {page === 'history' && 'Workspace / 歷史封存'}
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

            {page !== 'history' && (
              <div className="month-pill">
                <button onClick={() => setMonth(m => shiftMonth(m, -1))}><ChevronLeft size={14} /></button>
                <span className="month-pill-val">{month}</span>
                <button onClick={() => setMonth(m => shiftMonth(m, 1))}><ChevronRight size={14} /></button>
              </div>
            )}

            {page === 'kanban' && (
              <button className="btn btn-primary"
                      onClick={() => { setNewCardDefaultStatus('todo'); setNewCardOpen(true); }}>
                <Plus size={14} /> 新需求單
              </button>
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
              cards={monthCards}
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
              baseHours={baseHours}
              setBaseHours={setBaseHours}
              leave={leave}
              setLeave={setLeave}
              month={month}
            />
          )}
          {page === 'history' && (
            <History archives={HISTORY} currentSnapshot={currentSnapshot} />
          )}
        </div>
      </main>

      <CardDrawer card={openCard} onClose={() => setOpenCardId(null)} onUpdate={onUpdate} />
      <NewCardModal
        open={newCardOpen}
        onClose={() => setNewCardOpen(false)}
        onCreate={onCreate}
        defaultStatus={newCardDefaultStatus}
      />
    </div>
  );
}
