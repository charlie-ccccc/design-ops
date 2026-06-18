'use client';

import { useState } from 'react';
import { Menu, Search, Plus, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import type { Member } from '@/lib/types';
import { DEPTS, DEPT_SHORT } from '@/lib/data';
import { hue } from '@/lib/utils';

export type AppTopbarPage = 'kanban' | 'dashboard' | 'capacity' | 'history' | 'permissions';

const PAGE_TITLE: Record<AppTopbarPage, string> = {
  kanban: '任務看板',
  dashboard: 'Dashboard',
  capacity: '量能管理',
  history: '歷史紀錄',
  permissions: '權限管理',
};

export interface AppTopbarProps {
  page: AppTopbarPage;
  onMenuToggle: () => void;

  // Kanban
  members?: Member[];
  filterMembers?: string[];
  onFilterMember?: (id: string) => void;
  filterDept?: string;
  onFilterDept?: (dept: string) => void;
  query?: string;
  onQuery?: (q: string) => void;
  onNewCard?: () => void;
  onImportCsv?: () => void;

  // Dashboard
  hasDrillFilter?: boolean;
  onExport?: () => void;

  // Capacity
  month?: string;
  onMonthPrev?: () => void;
  onMonthNext?: () => void;

  // Notification panel (pass <NotificationPanel> from outside)
  notificationSlot?: React.ReactNode;
}

export function AppTopbar({
  page,
  onMenuToggle,
  members = [],
  filterMembers = [],
  onFilterMember,
  filterDept = '',
  onFilterDept,
  query = '',
  onQuery,
  onNewCard,
  onImportCsv,
  hasDrillFilter,
  onExport,
  month,
  onMonthPrev,
  onMonthNext,
  notificationSlot,
}: AppTopbarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const hasFilter = page === 'kanban' && !!(filterMembers.length || filterDept || query);

  return (
    <>
      <header className="topbar">
        {/* ── Left ── */}
        <div className="tb-left">
          <button className="sb-hamburger" onClick={onMenuToggle}>
            <Menu size={20} />
          </button>
          <div className="tb-title">
            {PAGE_TITLE[page]}
            {hasFilter && (
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--muted)', marginLeft: 8 }}>
                · 篩選中
              </span>
            )}
          </div>
          {page === 'capacity' && month && (
            <div className="month-pill tb-desktop-only">
              <button onClick={onMonthPrev}><ChevronLeft size={14} /></button>
              <span className="month-pill-val">{month}</span>
              <button onClick={onMonthNext}><ChevronRight size={14} /></button>
            </div>
          )}
        </div>

        <span className="tb-spacer" />

        {/* ── Desktop tools ── */}
        <div className="tb-tools tb-desktop-only">
          {page === 'kanban' && (
            <>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                {members.map(m => (
                  <button
                    key={m.id}
                    onClick={() => onFilterMember?.(m.id)}
                    title={m.name}
                    style={{
                      appearance: 'none', border: 'none', padding: 0, cursor: 'pointer',
                      width: 22, height: 22, borderRadius: '50%', background: 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden', flexShrink: 0,
                      opacity: filterMembers.length > 0 && !filterMembers.includes(m.id) ? 0.3 : 1,
                      boxShadow: filterMembers.includes(m.id)
                        ? `0 0 0 2px var(--surface), 0 0 0 3.5px ${hue(m.hue)}`
                        : 'none',
                      transition: 'opacity 0.15s, box-shadow 0.15s',
                    }}
                  >
                    {m.photo
                      ? <img src={m.photo} alt={m.name} style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
                      : <span className="av av-sm" style={{ background: hue(m.hue) }}>{m.initial}</span>}
                  </button>
                ))}
              </div>
              <div style={{ width: 1, height: 18, background: 'var(--border)', margin: '0 2px' }} />
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-2)', pointerEvents: 'none' }}>
                  <Search size={13} />
                </span>
                <input
                  className="input"
                  placeholder="搜尋標題 / ID"
                  style={{ paddingLeft: 26, width: 150 }}
                  value={query}
                  onChange={e => onQuery?.(e.target.value)}
                />
              </div>
              <select className="input" value={filterDept} onChange={e => onFilterDept?.(e.target.value)}>
                <option value="">全部單位</option>
                {DEPTS.map(d => <option key={d} value={d}>{DEPT_SHORT[d] || d}</option>)}
              </select>
            </>
          )}
          {page === 'dashboard' && !hasDrillFilter && (
            <select className="input" value={filterDept} onChange={e => onFilterDept?.(e.target.value)}>
              <option value="">全部單位</option>
              {DEPTS.map(d => <option key={d} value={d}>{DEPT_SHORT[d] || d}</option>)}
            </select>
          )}
        </div>

        {/* ── Right (always visible) ── */}
        <div className="tb-tools">
          {page === 'kanban' && (
            <>
              {onImportCsv && (
                <button className="btn tb-desktop-only" onClick={onImportCsv}>
                  匯入 CSV
                </button>
              )}
              <button className="btn btn-primary tb-desktop-only" onClick={onNewCard}>
                <Plus size={14} /> 新需求單
              </button>
              <button className="sb-hamburger tb-mobile-only" onClick={onNewCard}>
                <Plus size={20} />
              </button>
            </>
          )}
          {page === 'dashboard' && (
            <button className="btn tb-desktop-only" onClick={onExport}>
              <Download size={14} /> 匯出
            </button>
          )}
          {notificationSlot}
        </div>
      </header>

      {/* ── Kanban mobile filter bar ── */}
      {page === 'kanban' && (
        <div className="tb-mobile-filters">
          {searchOpen ? (
            <>
              <div className="tb-search-bar">
                <Search size={15} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                <input
                  placeholder="搜尋標題 / ID"
                  value={query}
                  onChange={e => onQuery?.(e.target.value)}
                  autoFocus
                />
              </div>
              <button className="tb-search-cancel" onClick={() => { setSearchOpen(false); onQuery?.(''); }}>
                取消
              </button>
            </>
          ) : (
            <>
              <button className="sb-hamburger tb-search-btn" onClick={() => setSearchOpen(true)}>
                <Search size={20} />
              </button>
              <select className="input" style={{ flex: 1 }} value={filterMembers[0] ?? ''} onChange={e => { const v = e.target.value; onFilterMember?.(v || (filterMembers[0] ?? '')); }}>
                <option value="">全部成員</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <select className="input" style={{ flex: 1 }} value={filterDept} onChange={e => onFilterDept?.(e.target.value)}>
                <option value="">全部單位</option>
                {DEPTS.map(d => <option key={d} value={d}>{DEPT_SHORT[d] || d}</option>)}
              </select>
            </>
          )}
        </div>
      )}

      {/* ── Capacity mobile month picker ── */}
      {page === 'capacity' && month && (
        <div className="cap-month-pill-mobile">
          <button onClick={onMonthPrev}><ChevronLeft size={16} /></button>
          <span style={{ flex: 1, textAlign: 'center', fontWeight: 500, fontSize: 14 }}>{month}</span>
          <button onClick={onMonthNext}><ChevronRight size={16} /></button>
        </div>
      )}
    </>
  );
}
