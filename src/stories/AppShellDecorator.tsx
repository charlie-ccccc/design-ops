'use client';

import { useState } from 'react';
import { LayoutGrid, BarChart2, TrendingUp, Archive, Shield, Menu } from 'lucide-react';

type ShellPage = 'kanban' | 'dashboard' | 'capacity' | 'history' | 'permissions';

type Props = {
  page: ShellPage;
  /** Tools shown on desktop topbar (tb-desktop-only) */
  topbarDesktopTools?: React.ReactNode;
  /** Tools always visible on right side of topbar (new card btn, notification, etc.) */
  topbarTools?: React.ReactNode;
  /** Mobile-only filter bar rendered below the topbar */
  mobileFilters?: React.ReactNode;
  children: React.ReactNode;
};

const MOCK_USER = { name: '陳巧玲', role: 'Admin · 成員', initial: 'Charlie' };

const NAV_WORKSPACE = [
  { id: 'kanban' as ShellPage,    label: '任務看板',  icon: <LayoutGrid size={15} />, count: 6 },
  { id: 'dashboard' as ShellPage, label: 'Dashboard', icon: <BarChart2 size={15} /> },
  { id: 'history' as ShellPage,   label: '歷史紀錄',  icon: <Archive size={15} /> },
];
const NAV_ADMIN = [
  { id: 'capacity' as ShellPage,    label: '量能管理', icon: <TrendingUp size={15} /> },
  { id: 'permissions' as ShellPage, label: '權限管理', icon: <Shield size={15} /> },
];
const PAGE_TITLE: Record<ShellPage, string> = {
  kanban: '任務看板',
  dashboard: 'Dashboard',
  capacity: '量能管理',
  history: '歷史紀錄',
  permissions: '權限管理',
};

export function AppShellDecorator({ page, topbarDesktopTools, topbarTools, mobileFilters, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app">
      <div className={`sb-overlay${sidebarOpen ? ' open' : ''}`} onClick={() => setSidebarOpen(false)} />

      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="sb-brand">
          <div className="sb-mark">C</div>
          <div>
            <div className="sb-brand-name">CMoneyDesign</div>
            <div className="sb-brand-sub">設計部工作看板</div>
          </div>
        </div>

        <div className="sb-group">
          <div className="sb-group-h">工作台</div>
          {NAV_WORKSPACE.map(p => (
            <button key={p.id} className="sb-item" data-on={page === p.id ? '1' : '0'}>
              {p.icon}
              <span>{p.label}</span>
              {p.count != null && <span className="sb-item-tag">{p.count}</span>}
            </button>
          ))}
        </div>

        <div className="sb-group">
          <div className="sb-group-h">管理</div>
          {NAV_ADMIN.map(p => (
            <button key={p.id} className="sb-item" data-on={page === p.id ? '1' : '0'}>
              {p.icon}
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        <div className="sb-bottom">
          <div className="sb-avatar">{MOCK_USER.initial[0]}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sb-user" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{MOCK_USER.name}</div>
            <div className="sb-user-role">{MOCK_USER.role}</div>
          </div>
          <button style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', color: 'var(--muted)', padding: '3px 8px', fontSize: 11.5, fontFamily: 'inherit', flexShrink: 0 }}>
            登出
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="tb-left">
            <button className="sb-hamburger" onClick={() => setSidebarOpen(o => !o)}>
              <Menu size={20} />
            </button>
            <div className="tb-title">{PAGE_TITLE[page]}</div>
          </div>

          <span className="tb-spacer" />

          {topbarDesktopTools && (
            <div className="tb-tools tb-desktop-only">
              {topbarDesktopTools}
            </div>
          )}

          {topbarTools && (
            <div className="tb-tools">
              {topbarTools}
            </div>
          )}
        </header>

        {mobileFilters && (
          <div className="tb-mobile-filters">
            {mobileFilters}
          </div>
        )}

        <div className="body">
          {children}
        </div>
      </main>
    </div>
  );
}
