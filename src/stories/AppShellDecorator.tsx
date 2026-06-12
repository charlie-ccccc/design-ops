'use client';

import { useState } from 'react';
import { LayoutGrid, BarChart2, TrendingUp, Archive, Shield, Bell } from 'lucide-react';
import { AppTopbar, type AppTopbarProps, type AppTopbarPage } from '@/components/ui/AppTopbar/AppTopbar';

const MOCK_NOTIFICATION_SLOT = (
  <button className="btn notif-btn" style={{ position: 'relative' }}>
    <Bell size={16} />
    <span style={{
      position: 'absolute', top: 2, right: 2,
      width: 6, height: 6, borderRadius: '50%',
      background: '#ef4444', border: '1.5px solid var(--surface)',
    }} />
  </button>
);

type Props = {
  page: AppTopbarPage;
  topbarProps?: Omit<AppTopbarProps, 'page' | 'onMenuToggle'>;
  children: React.ReactNode;
};

const MOCK_USER = { name: '陳巧玲', role: 'Admin · 成員', initial: 'C' };

const NAV_WORKSPACE = [
  { id: 'kanban' as AppTopbarPage,    label: '任務看板',  icon: <LayoutGrid size={15} />, count: 6 },
  { id: 'dashboard' as AppTopbarPage, label: 'Dashboard', icon: <BarChart2 size={15} /> },
  { id: 'history' as AppTopbarPage,   label: '歷史紀錄',  icon: <Archive size={15} /> },
];
const NAV_ADMIN = [
  { id: 'capacity' as AppTopbarPage,    label: '量能管理', icon: <TrendingUp size={15} /> },
  { id: 'permissions' as AppTopbarPage, label: '權限管理', icon: <Shield size={15} /> },
];

export function AppShellDecorator({ page, topbarProps = {}, children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mergedTopbarProps = {
    notificationSlot: MOCK_NOTIFICATION_SLOT,
    ...topbarProps,
  };

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
          <div className="sb-avatar">{MOCK_USER.initial}</div>
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
        <AppTopbar
          page={page}
          onMenuToggle={() => setSidebarOpen(o => !o)}
          {...mergedTopbarProps}
        />
        <div className="body">
          {children}
        </div>
      </main>
    </div>
  );
}
