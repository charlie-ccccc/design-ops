'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  LayoutGrid, BarChart2, TrendingUp, Archive, Shield,
  Search, Bell, Plus, Download,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { doc, updateDoc, deleteField } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Card, LeaveEntry, PublicHoliday, CardStatus, Member, Cat, HistoryMonth } from '@/lib/types';
import {
  STATUSES, DEPTS, DEPT_SHORT, DEPT_HUE,
  DEFAULT_HOLIDAYS,
} from '@/lib/data';
import { sum, groupBy, hue, formatId, shiftMonth, workingDaysInMonth, workingDaysBetween, dueMonthOf } from '@/lib/utils';
import { useFirestoreCards } from '@/hooks/use-firestore-cards';
import { useFirestoreUsers } from '@/hooks/use-firestore-users';
import { useFirestoreSettings } from '@/hooks/use-firestore-settings';
import KanbanBoard from '@/components/kanban/board';
import CardDrawer from '@/components/kanban/card-drawer';
import NewCardModal from '@/components/kanban/new-card-modal';
import Dashboard, { type DashFilter } from '@/components/dashboard/index';
import Admin from '@/components/admin/index';
import History from '@/components/history/index';
import Permissions from '@/components/permissions/index';
import LoginPage from '@/components/auth/login-page';
import { useAuth } from '@/contexts/auth-context';
import type { AppUser } from '@/contexts/auth-context';

const ACCENT_PRESETS = {
  violet: { hex: '#6B5BD9', light: 'oklch(0.52 0.14 282)', soft: 'oklch(0.94 0.03 282)', dark: 'oklch(0.74 0.14 282)', darkSoft: 'oklch(0.28 0.05 282)' },
  forest: { hex: '#3B7755', light: 'oklch(0.48 0.10 152)', soft: 'oklch(0.94 0.03 152)', dark: 'oklch(0.74 0.12 152)', darkSoft: 'oklch(0.26 0.04 152)' },
  rust:   { hex: '#B85C2E', light: 'oklch(0.55 0.13 38)',  soft: 'oklch(0.94 0.04 38)',  dark: 'oklch(0.74 0.13 38)',  darkSoft: 'oklch(0.28 0.05 38)' },
  ink:    { hex: '#3A3935', light: 'oklch(0.30 0.02 270)', soft: 'oklch(0.94 0.01 270)', dark: 'oklch(0.85 0.01 270)', darkSoft: 'oklch(0.22 0.01 270)' },
};

type Page = 'kanban' | 'dashboard' | 'capacity' | 'history' | 'permissions';

export default function App() {
  const { user, loading, signOutUser } = useAuth();
  const { cards, initialized, addCard, updateCard, deleteCard, clearAllCards } = useFirestoreCards();
  const siteUsers = useFirestoreUsers();
  const { depts, updateDepts, leave, updateLeave, allMemberDays, allMemberRatios, updateMemberDays, updateMemberRatios, historyMonths, updateHistory, lastArchivedMonth, updateLastArchivedMonth, settingsReady } = useFirestoreSettings();

  const toMember = (u: typeof siteUsers[0]): Member => ({
    id: u.uid, name: u.name, alias: u.name,
    initial: u.initial ?? u.name[0] ?? '?',
    cat: (u.cat ?? 'UIUX') as Cat,
    hue: u.hue ?? 1, base: 168,
    ratio: u.roles.includes('Admin') ? 0.625 : 0.875,
    photo: u.photo,
  });

  // Current 成員 only — for kanban filter, assignment dropdowns
  const members = useMemo((): Member[] =>
    siteUsers.filter(u => u.roles.includes('成員')).map(toMember),
    [siteUsers],
  );

  const memberById = useMemo(() =>
    Object.fromEntries(members.map(m => [m.id, m])),
    [members],
  );

  const [page, setPage] = useState<Page>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search).get('page') as Page | null;
      if (p && ['kanban', 'dashboard', 'capacity', 'history', 'permissions'].includes(p)) return p;
    }
    return 'kanban';
  });
  const [adminTab, setAdminTab] = useState<'capacity' | 'members' | 'leave'>(() => {
    if (typeof window !== 'undefined') {
      const t = new URLSearchParams(window.location.search).get('tab');
      if (t === 'members' || t === 'leave') return t;
    }
    return 'capacity';
  });
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Current 成員 + former members who have a days entry for the selected month — for capacity calculation
  const capacityMembers = useMemo((): Member[] => {
    const monthDaysMap = allMemberDays[month] ?? {};
    const activeIds = new Set(members.map(m => m.id));
    const former = siteUsers
      .filter(u => !activeIds.has(u.uid) && u.uid in monthDaysMap)
      .map(toMember);
    return [...members, ...former];
  }, [members, siteUsers, allMemberDays, month]);
  const [openCardId, setOpenCardId] = useState<string | null>(null);
  const [newCardOpen, setNewCardOpen] = useState(false);
  const [newCardDefaultStatus, setNewCardDefaultStatus] = useState<CardStatus>('belog');
  const [query, setQuery] = useState('');
  const [filterMember, setFilterMember] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const memberDays = allMemberDays[month] ?? {};
  const memberRatios = allMemberRatios[month] ?? {};
  const setMemberDays = useCallback((d: Record<string, number>) => updateMemberDays(month, d), [updateMemberDays, month]);
  const setMemberRatios = useCallback((r: Record<string, number>) => updateMemberRatios(month, r), [updateMemberRatios, month]);
  const [publicHolidays, setPublicHolidays] = useState<PublicHoliday[]>(DEFAULT_HOLIDAYS);
  const [previewCard, setPreviewCard] = useState<Card | null>(null);
  const [dashFilter, setDashFilter] = useState<DashFilter | null>(null);

  // Tweaks
  const [dark, setDark] = useState(false);
  const [density, setDensity] = useState<'compact' | 'comfy'>('comfy');
  const showAdmin = user?.roles.includes('Admin') ?? false;
  const isMember = user?.roles.includes('成員') ?? false;
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

  // Auto-archive: done/pending cards whose due month < current month → history
  useEffect(() => {
    if (!settingsReady || !initialized) return;

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const currentRealMonth = `${now.getFullYear()}/${pad(now.getMonth() + 1)}`;

    // Any done/pending card from a past month should be in history
    // (don't gate on lastArchivedMonth — rely on allInHistory / existingIds for idempotency)
    const toArchive = cards.filter(c =>
      (c.status === 'done' || c.status === 'pending') && dueMonthOf(c) < currentRealMonth
    );

    if (toArchive.length === 0) {
      if (lastArchivedMonth !== currentRealMonth) updateLastArchivedMonth(currentRealMonth);
      return;
    }

    // Check if every card is already recorded in history (avoid re-processing)
    const allInHistory = toArchive.every(c => {
      const entry = historyMonths.find(h => h.month === dueMonthOf(c));
      return entry?.cardList?.some(hc => hc.id === c.id);
    });
    if (allInHistory) {
      // Cards in history but not yet cleaned from Firestore
      Promise.all(toArchive.map(c => deleteCard(c.id))).catch(console.error);
      return;
    }

    // Group by archive month and process each
    const grouped = groupBy(toArchive, c => dueMonthOf(c));
    let updatedHistory = [...historyMonths];

    for (const [archiveMonth, monthCards] of Object.entries(grouped)) {
      const existingEntry = updatedHistory.find(h => h.month === archiveMonth);
      const existingIds = new Set((existingEntry?.cardList ?? []).map(c => c.id));
      const newCards = monthCards.filter(c => !existingIds.has(c.id));

      if (newCards.length === 0) {
        Promise.all(monthCards.map(c => deleteCard(c.id))).catch(console.error);
        continue;
      }

      const allCards = [...(existingEntry?.cardList ?? []), ...newCards];
      const byDept: Record<string, number> = {};
      const byMember: Record<string, number> = {};
      for (const c of allCards) {
        byDept[c.dept] = (byDept[c.dept] ?? 0) + c.est;
        if (c.owner) byMember[c.owner] = (byMember[c.owner] ?? 0) + c.actual;
      }
      const topDept = Object.entries(byDept).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';

      // Compute capacity only when creating a new entry
      let capacity = existingEntry?.capacity ?? 0;
      if (!existingEntry) {
        const daysMap = allMemberDays[archiveMonth] ?? {};
        const ratiosMap = allMemberRatios[archiveMonth] ?? {};
        const defaultDays = workingDaysInMonth(archiveMonth, publicHolidays);
        const mm = archiveMonth.split('/')[1];
        const archiveMemberIds = new Set([...members.map(m => m.id), ...Object.keys(daysMap)]);
        const archiveMembers = siteUsers.filter(u => archiveMemberIds.has(u.uid)).map(toMember);
        const leaveByMember = Object.fromEntries(archiveMembers.map(m => [m.id,
          sum(leave.filter(l => l.member === m.id && l.date.startsWith(mm + '/')).map(l => l.hours))]));
        capacity = archiveMembers.reduce((acc, m) => {
          const days = daysMap[m.id] ?? defaultDays;
          const ratio = ratiosMap[m.id] ?? m.ratio;
          const lv = leaveByMember[m.id] || 0;
          return acc + Math.max(0, Math.round(days * 8 * ratio) - lv);
        }, 0);
      }

      const entry: HistoryMonth = {
        month: archiveMonth,
        cards: allCards.length,
        totalEst: sum(allCards.map(c => c.est)),
        totalActual: sum(allCards.map(c => c.actual)),
        capacity,
        topDept,
        deptTotals: byDept,
        memberTotals: byMember,
        cardList: allCards,
      };

      updatedHistory = existingEntry
        ? updatedHistory.map(h => h.month === archiveMonth ? entry : h)
        : [entry, ...updatedHistory];

      Promise.all(newCards.map(c => deleteCard(c.id))).catch(console.error);
    }

    updateHistory(updatedHistory.sort((a, b) => b.month.localeCompare(a.month)));
    if (currentRealMonth > lastArchivedMonth) updateLastArchivedMonth(currentRealMonth);
  }, [settingsReady, initialized, lastArchivedMonth, historyMonths, cards, allMemberDays, allMemberRatios, members, leave, publicHolidays, siteUsers]);

  const CURRENT_MONTH = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  // Kanban: active cards always visible; done/pending only if due month ≥ current month
  const kanbanCards = useMemo(() =>
    cards.filter(c => {
      if (['belog', 'todo', 'designing', 'reviewing'].includes(c.status)) return true;
      return dueMonthOf(c) >= CURRENT_MONTH;
    }), [cards]);

  // Dashboard/Admin: all cards whose due month matches the selected month
  const monthCards = useMemo(() => {
    const live = cards.filter(c => dueMonthOf(c) === month);
    if (live.length > 0) return live;
    // Past month: fall back to archived card list so Admin capacity still shows data
    return historyMonths.find(h => h.month === month)?.cardList ?? [];
  }, [cards, month, historyMonths]);

  const leaveByMember = useMemo(() => {
    const mm = month.split('/')[1];
    return Object.fromEntries(capacityMembers.map(m => [m.id,
      sum(leave.filter(l => l.member === m.id && l.date.startsWith(mm + '/')).map(l => l.hours))]));
  }, [capacityMembers, leave, month]);

  const defaultWorkDays = useMemo(
    () => workingDaysInMonth(month, publicHolidays),
    [month, publicHolidays],
  );

  const totalCapacity = useMemo(() =>
    capacityMembers.reduce((acc, m) => {
      const days = memberDays[m.id] ?? defaultWorkDays;
      const ratio = memberRatios[m.id] ?? m.ratio;
      const lv = leaveByMember[m.id] || 0;
      return acc + Math.max(0, Math.round(days * 8 * ratio) - lv);
    }, 0),
    [members, memberDays, memberRatios, defaultWorkDays, leaveByMember],
  );

  // Restore state from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cardId = params.get('card');
    if (cardId) setOpenCardId(cardId);
    const dept  = params.get('dept')  ?? undefined;
    const owner = params.get('owner') ?? undefined;
    if (dept || owner) setDashFilter({ dept, owner });
  }, []);

  // Sync page + card + dashFilter to URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (page === 'kanban') { params.delete('page'); } else { params.set('page', page); }
    if (openCardId) { params.set('card', openCardId); } else { params.delete('card'); }
    if (page === 'dashboard' && dashFilter?.dept)  { params.set('dept',  dashFilter.dept);  } else { params.delete('dept'); }
    if (page === 'dashboard' && dashFilter?.owner) { params.set('owner', dashFilter.owner); } else { params.delete('owner'); }
    if (page === 'capacity' && adminTab !== 'capacity') { params.set('tab', adminTab); } else { params.delete('tab'); }
    const qs = params.toString();
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
  }, [page, openCardId, dashFilter, adminTab]);

  const openCard = cards.find(c => c.id === openCardId) ?? null;

  const onMove = useCallback((cardId: string, newStatus: string) => {
    const card = cards.find(c => c.id === cardId);
    if (!card || card.status === newStatus) return;
    const now = new Date();
    const pad = (x: number) => String(x).padStart(2, '0');
    const stamp = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const fromName = STATUSES.find(s => s.id === card.status)?.name ?? card.status;
    const toName = STATUSES.find(s => s.id === newStatus)?.name ?? newStatus;
    const act = { who: user?.name ?? '系統', msg: `將狀態從「${fromName}」移至「${toName}」`, t: stamp };
    updateCard(cardId, { status: newStatus as Card['status'], activity: [...(card.activity ?? []), act] }).catch(console.error);
  }, [updateCard, cards, user]);

  const onUpdate = useCallback((cardId: string, patch: Partial<Card>) => {
    updateCard(cardId, patch).catch(console.error);
  }, [updateCard]);

  const onDelete = useCallback((cardId: string) => {
    deleteCard(cardId).catch(console.error);
  }, [deleteCard]);

  const onClone = useCallback((override: { title: string; owner: string; requester?: string }) => {
    if (!openCard) return;
    const maxN = cards.reduce((m, c) => {
      const n = Number(c.id.split('-')[1]);
      return isNaN(n) ? m : Math.max(m, n);
    }, 0);
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const createdAt = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const nc: Card = {
      ...openCard,
      id: formatId(maxN + 1),
      title: override.title,
      owner: override.owner,
      requester: override.requester,
      actual: 0,
      timeLogs: [],
      comments: [],
      activity: [{ who: user?.name ?? '系統', msg: '複製並建立了此任務', t: createdAt }],
      status: 'belog',
      createdAt,
    };
    addCard(nc).catch(console.error);
  }, [openCard, cards, addCard]);

  const onCreate = useCallback((data: import('@/components/kanban/new-card-modal').NewCardData) => {
    const maxN = cards.reduce((m, c) => {
      const n = Number(c.id.split('-')[1]);
      return isNaN(n) ? m : Math.max(m, n);
    }, 0);
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const createdAt = `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const nc: Card = {
      ...data,
      requester: data.requesterName || undefined,
      id: formatId(maxN + 1),
      month: CURRENT_MONTH,
      est: 0,
      actual: 0,
      attach: 0,
      activity: [{ who: user?.name ?? '系統', msg: '建立了此任務', t: createdAt }],
      createdAt,
    };
    addCard(nc).catch(console.error);
  }, [cards, addCard]);

  const onUpdateUser = useCallback(async (uid: string, patch: Partial<AppUser>) => {
    if (patch.roles) {
      const currentUser = siteUsers.find(u => u.uid === uid);
      const wasMember = currentUser?.roles.includes('成員') ?? false;
      const becomesMember = patch.roles.includes('成員');
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const currentRealMonth = `${now.getFullYear()}/${pad(now.getMonth() + 1)}`;
      const today = now.getDate();
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

      if (!wasMember && becomesMember) {
        // 加入：從今天到月底的工作天
        const days = workingDaysBetween(currentRealMonth, today, lastDay, publicHolidays);
        await updateMemberDays(currentRealMonth, { ...(allMemberDays[currentRealMonth] ?? {}), [uid]: days });
      } else if (wasMember && !becomesMember) {
        // 離開：從月初到今天的工作天
        const days = workingDaysBetween(currentRealMonth, 1, today, publicHolidays);
        await updateMemberDays(currentRealMonth, { ...(allMemberDays[currentRealMonth] ?? {}), [uid]: days });
      }
    }

    const firestorePatch: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(patch)) {
      firestorePatch[k] = v === undefined ? deleteField() : v;
    }
    await updateDoc(doc(db, 'users', uid), firestorePatch);
  }, [siteUsers, allMemberDays, updateMemberDays, publicHolidays]);

  const currentSnapshot = useMemo(() => {
    const currentMonthCards = cards.filter(c => dueMonthOf(c) === CURRENT_MONTH);
    const totalEst = sum(currentMonthCards.map(c => c.est));
    const totalActual = sum(currentMonthCards.map(c => c.actual));
    const byDept = groupBy(currentMonthCards, 'dept');
    const topDept = Object.entries(byDept)
      .map(([d, xs]) => [d, sum(xs.map(c => c.est))] as [string, number])
      .sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
    return {
      month: CURRENT_MONTH,
      cards: currentMonthCards.length,
      totalEst,
      totalActual,
      capacity: totalCapacity,
      topDept,
    };
  }, [cards, totalCapacity]);

  const workspacePages = [
    { id: 'kanban' as Page,    name: '任務看板', icon: <LayoutGrid size={15} />, count: kanbanCards.length },
    { id: 'dashboard' as Page, name: 'Dashboard', icon: <BarChart2 size={15} /> },
    { id: 'history' as Page,   name: '歷史紀錄', icon: <Archive size={15} /> },
  ];
  const adminPages = [
    { id: 'capacity' as Page,     name: '量能管理', icon: <TrendingUp size={15} /> },
    { id: 'permissions' as Page,  name: '權限管理', icon: <Shield size={15} /> },
  ];

  if (loading || (user && !initialized)) return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--surface-2)' }}>
      <div style={{ fontSize: 13, color: 'var(--muted)' }}>載入中…</div>
    </div>
  );

  if (!user) return <LoginPage />;

  return (
    <div className="app">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sb-brand">
          <div className="sb-mark">C</div>
          <div>
            <div className="sb-brand-name">CMoneyDesign</div>
            <div className="sb-brand-sub">設計部工作看板</div>
          </div>
        </div>

        <div className="sb-group">
          <div className="sb-group-h">工作台</div>
          {workspacePages.map(p => (
            <button key={p.id} className="sb-item" data-on={page === p.id ? '1' : '0'}
                    onClick={() => { setPage(p.id); if (p.id !== 'dashboard') setDashFilter(null); }}>
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
          {user.photo
            ? <img src={user.photo} alt="" style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0 }} />
            : <div className="sb-avatar">{user.name[0]}</div>
          }
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sb-user" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
            <div className="sb-user-role">{user.roles.join(' · ')}</div>
          </div>
          <button onClick={signOutUser} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', color: 'var(--muted)', padding: '3px 8px', fontSize: 11.5, fontFamily: 'inherit', flexShrink: 0 }}>
            登出
          </button>
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
            {page === 'capacity' && (
              <div className="tb-crumb">{month}</div>
            )}
          </div>

          <span className="tb-spacer" />

          <div className="tb-tools">
            {page === 'kanban' && (
              <>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  {members.map(m => (
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
                      {m.photo
                        ? <img src={m.photo} alt={m.name} className="av av-sm" style={{ objectFit: 'cover' }} />
                        : <span className="av av-sm" style={{ background: hue(m.hue) }}>{m.initial}</span>}
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

            {(page === 'kanban' || (page === 'dashboard' && !dashFilter)) && (
              <select className="input" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
                <option value="">全部單位</option>
                {DEPTS.map(d => <option key={d} value={d}>{DEPT_SHORT[d] || d}</option>)}
              </select>
            )}

            {page === 'capacity' && (
              <div className="month-pill">
                <button onClick={() => setMonth(m => shiftMonth(m, -1))}><ChevronLeft size={14} /></button>
                <span className="month-pill-val">{month}</span>
                <button onClick={() => setMonth(m => shiftMonth(m, 1))}><ChevronRight size={14} /></button>
              </div>
            )}

            {page === 'kanban' && showAdmin && cards.length > 0 && (
              <button className="btn" style={{ color: 'var(--st-block)', borderColor: 'var(--st-block)' }}
                onClick={() => { if (window.confirm(`確定清空全部 ${cards.length} 張卡片？此操作無法復原。`)) clearAllCards(cards).catch(console.error); }}>
                清空所有卡片
              </button>
            )}
            {page === 'kanban' && (
              <button className="btn btn-primary"
                      onClick={() => { setNewCardDefaultStatus('belog'); setNewCardOpen(true); }}>
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
              cards={kanbanCards}
              query={query}
              filterMember={filterMember}
              filterDept={filterDept}
              onMove={onMove}
              onOpen={id => setOpenCardId(id)}
              onAddCard={status => { setNewCardDefaultStatus(status as CardStatus); setNewCardOpen(true); }}
              canEdit={isMember || showAdmin}
              memberById={memberById}
            />
          )}
          {page === 'dashboard' && (
            <Dashboard
              cards={kanbanCards}
              totalCapacity={totalCapacity}
              onOpenCard={card => setOpenCardId(card.id)}
              drillFilter={dashFilter}
              onDrill={f => setDashFilter(f)}
              members={capacityMembers}
              siteUsers={siteUsers}
            />
          )}
          {page === 'capacity' && showAdmin && (
            <Admin
              cards={monthCards}
              members={capacityMembers}
              memberRatios={memberRatios}
              setMemberRatios={setMemberRatios}
              memberDays={memberDays}
              setMemberDays={setMemberDays}
              leave={leave}
              setLeave={updateLeave}
              publicHolidays={publicHolidays}
              month={month}
              defaultWorkDays={defaultWorkDays}
              tab={adminTab}
              onTabChange={setAdminTab}
            />
          )}
          {page === 'history' && (
            <History
              archives={historyMonths}
              currentSnapshot={currentSnapshot}
              currentCards={cards}
              onOpenCard={card => setPreviewCard(card)}
              siteUsers={siteUsers}
            />
          )}
          {page === 'permissions' && showAdmin && (
            <Permissions users={siteUsers} currentUser={user} onUpdateUser={onUpdateUser} depts={depts} onUpdateDepts={updateDepts} />
          )}
        </div>
      </main>

      <CardDrawer card={openCard} onClose={() => setOpenCardId(null)} onUpdate={onUpdate} onDelete={onDelete} onClone={onClone} canEdit={isMember || showAdmin} currentUserName={user.name} siteUsers={siteUsers} members={members} />
      <CardDrawer card={previewCard} onClose={() => setPreviewCard(null)} onUpdate={() => {}} readOnly siteUsers={siteUsers} members={members} />
      <NewCardModal
        open={newCardOpen}
        onClose={() => setNewCardOpen(false)}
        onCreate={onCreate}
        defaultStatus={newCardDefaultStatus}
        currentUser={user}
        siteUsers={siteUsers}
        members={members}
        depts={depts}
      />

    </div>
  );
}
