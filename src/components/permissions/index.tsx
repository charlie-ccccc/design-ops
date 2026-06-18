'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Info, Palette } from 'lucide-react';
import type { AppUser, Role, DesignCat } from '@/contexts/auth-context';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Modal } from '@/components/ui/Modal/Modal';
import { Table } from '@/components/ui/Table/Table';
import type { TableColumn } from '@/components/ui/Table/Table';

const ALL_ROLES: Role[] = ['Admin', '成員', '一般'];

const DEPT_COLOR_PALETTE = [
  '#7c6ee0', '#a48ee8', '#5549bf',
  '#5090ce', '#3b70b4', '#6eb2e8',
  '#3cb8ca', '#2d9cb0', '#5ed2c4',
  '#5cb478', '#48966a', '#84cc6a',
  '#b8ba3a', '#8e9a28',
  '#e07c50', '#c8682e',
  '#d05060', '#b83040',
  '#d868a0', '#c04882',
];

const ROLE_DESC: Record<Role, string> = {
  Admin: '看板全功能 + 調整權限、量能管理（不計入受託人與工時）',
  成員:  '看板全功能 + 計入受託人、工時表、量能計算',
  一般:  '開單、看單子、修改自己的單、留言',
};

interface PermissionsProps {
  users: AppUser[];
  currentUser: AppUser;
  onUpdateUser: (uid: string, patch: Partial<AppUser>) => void;
  depts: string[];
  onUpdateDepts: (depts: string[]) => void;
  deptColors: Record<string, string>;
  onUpdateDeptColors: (colors: Record<string, string>) => void;
  tab: 'users' | 'depts';
  onTabChange: (t: 'users' | 'depts') => void;
}

export default function Permissions({ users, currentUser, onUpdateUser, depts, onUpdateDepts, deptColors, onUpdateDeptColors, tab, onTabChange: setTab }: PermissionsProps) {
  const [newDept, setNewDept] = useState('');
  const [infoOpen, setInfoOpen] = useState(false);
  const [pickerDept, setPickerDept] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all');

  const isAdmin = currentUser.roles.includes('Admin');
  const rank = (u: AppUser) => u.roles.includes('Admin') ? 0 : u.roles.includes('成員') ? 1 : 2;

  const [displayOrder, setDisplayOrder] = useState<string[]>(() =>
    [...users].sort((a, b) => rank(a) - rank(b)).map(u => u.uid)
  );
  const orderRef = useRef(displayOrder);

  useEffect(() => {
    const userUids = new Set(users.map(u => u.uid));
    const current = orderRef.current;
    const membershipChanged =
      users.some(u => !new Set(current).has(u.uid)) ||
      current.some(uid => !userUids.has(uid));
    if (membershipChanged) {
      const next = [...users].sort((a, b) => rank(a) - rank(b)).map(u => u.uid);
      orderRef.current = next;
      setDisplayOrder(next);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users]);

  const sorted = displayOrder
    .map(uid => users.find(u => u.uid === uid))
    .filter((u): u is AppUser => u !== undefined);

  const filtered = roleFilter === 'all'
    ? sorted
    : sorted.filter(u => u.roles.includes(roleFilter));

  function addDept() {
    const d = newDept.trim();
    if (!d || depts.includes(d)) return;
    onUpdateDepts([...depts, d]);
    setNewDept('');
  }

  function removeDept(d: string) {
    onUpdateDepts(depts.filter(x => x !== d));
  }

  function toggleRole(uid: string, role: Role) {
    if (!isAdmin) return;
    const u = users.find(x => x.uid === uid);
    if (!u) return;
    const has = u.roles.includes(role);
    const next: Role[] = has ? u.roles.filter(r => r !== role) : [...u.roles, role];
    onUpdateUser(uid, { roles: next });
  }

  function setUserCat(uid: string, cat: DesignCat) {
    if (!isAdmin) return;
    onUpdateUser(uid, { cat });
  }

  React.useEffect(() => {
    if (!pickerDept) return;
    const close = () => setPickerDept(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [pickerDept]);

  const columns: TableColumn<AppUser>[] = [
    {
      key: 'name', header: '姓名', align: 'left',
      render: u => (
        <>
          {u.name}
          {u.uid === currentUser.uid && <span style={{ fontSize: 12, color: 'var(--md-sys-color-primary)', marginLeft: 5 }}>（你）</span>}
        </>
      ),
    },
    {
      key: 'email', header: 'Email', align: 'left',
      render: u => <span style={{ color: 'var(--md-sys-color-on-surface-muted)' }}>{u.email}</span>,
    },
    {
      key: 'roles', header: '權限角色', align: 'left',
      render: u => (
        <div style={{ display: 'flex', gap: 4 }}>
          {ALL_ROLES.map(role => {
            const active = u.roles.includes(role);
            return (
              <button
                key={role}
                onClick={() => toggleRole(u.uid, role)}
                disabled={!isAdmin}
                style={{
                  appearance: 'none',
                  border: `1px solid ${active ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-outline)'}`,
                  borderRadius: 6, padding: '3px 10px', fontSize: 13,
                  cursor: isAdmin ? 'pointer' : 'default', fontFamily: 'inherit',
                  background: active ? 'color-mix(in oklab, var(--md-sys-color-primary) 12%, transparent)' : 'none',
                  color: active ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface-muted)',
                  fontWeight: active ? 600 : 400, transition: 'all 0.15s',
                  opacity: !isAdmin ? 0.7 : 1,
                }}
              >
                {role}
              </button>
            );
          })}
        </div>
      ),
    },
    {
      key: 'cat', header: '設計類別', align: 'left',
      render: u => u.roles.includes('成員') ? (
        <Input as="select" style={{ fontSize: 13 }} value={u.cat ?? ''} disabled={!isAdmin}
          onChange={e => setUserCat(u.uid, (e.target as HTMLSelectElement).value as DesignCat)}>
          <option value="">請選擇</option>
          <option value="UIUX">UIUX</option>
          <option value="平面視覺">平面視覺</option>
        </Input>
      ) : (
        <span style={{ color: 'var(--md-sys-color-on-surface-muted)', fontSize: 13 }}>—</span>
      ),
    },
  ];

  const filterOptions: { value: Role | 'all'; label: string }[] = [
    { value: 'all',  label: '全部' },
    { value: 'Admin', label: 'Admin' },
    { value: '成員',  label: '成員' },
    { value: '一般',  label: '一般' },
  ];

  return (
    <div className="perm-wrap" style={{ padding: '18px 22px' }}>
      <div className="panel">

        <div className="perm-tab-bar" style={{ display: 'flex', borderBottom: '1px solid var(--md-sys-color-outline-variant)' }}>
          {(['users', 'depts'] as const).map((t, i) => (
            <button
              key={t}
              className="perm-tab"
              onClick={() => setTab(t)}
              style={{
                appearance: 'none', border: 'none', background: 'none', cursor: 'pointer',
                padding: '11px 18px', fontSize: 14, fontWeight: tab === t ? 600 : 400,
                color: tab === t ? 'var(--md-sys-color-on-surface)' : 'var(--md-sys-color-on-surface-muted)',
                borderBottom: tab === t ? '2px solid var(--md-sys-color-primary)' : '2px solid transparent',
                marginBottom: -1, transition: 'color 0.15s', fontFamily: 'inherit',
              }}
            >
              {i === 0 ? '使用者權限' : '需求發起單位'}
            </button>
          ))}
        </div>

        {tab === 'users' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px 8px' }}>
              {filterOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setRoleFilter(opt.value)}
                  style={{
                    appearance: 'none', fontFamily: 'inherit', cursor: 'pointer',
                    fontSize: 13, padding: '3px 12px', borderRadius: 20,
                    border: `1px solid ${roleFilter === opt.value ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-outline)'}`,
                    background: roleFilter === opt.value ? 'color-mix(in oklab, var(--md-sys-color-primary) 12%, transparent)' : 'none',
                    color: roleFilter === opt.value ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface-muted)',
                    fontWeight: roleFilter === opt.value ? 600 : 400,
                    transition: 'all 0.15s',
                  }}
                >
                  {opt.label}
                  <span style={{ marginLeft: 5, fontSize: 12, opacity: 0.7 }}>
                    {opt.value === 'all'
                      ? sorted.length
                      : sorted.filter(u => u.roles.includes(opt.value as Role)).length}
                  </span>
                </button>
              ))}
              {!isAdmin && (
                <span style={{ marginLeft: 8, fontSize: 13, color: 'var(--st-block)' }}>
                  需 Admin 權限才能修改角色
                </span>
              )}
            </div>
            <Table
              columns={columns}
              rows={filtered}
              getKey={u => u.uid}
              isRowHighlighted={u => u.uid === currentUser.uid}
              emptyText="沒有符合的使用者"
            />
          </>
        )}

        {tab === 'depts' && (
          <>
            <div style={{ padding: '8px 16px 4px', fontSize: 13, color: 'var(--md-sys-color-on-surface-muted)' }}>
              新增需求單時的發起單位選項
            </div>
            <div style={{ display: 'flex', gap: 6, padding: '8px 16px 10px' }}>
              <Input
                style={{ flex: 1 }}
                placeholder="新增單位名稱"
                value={newDept}
                onChange={e => setNewDept((e.target as HTMLInputElement).value)}
                onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && addDept()}
              />
              <Button variant="primary" onClick={addDept} style={{ padding: '0 10px' }}>
                <Plus size={14} />
              </Button>
            </div>
            <div style={{ padding: '0 16px 18px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {depts.map(d => (
                <span key={d} className="dept-color-tag">
                  <button
                    className="dept-color-dot"
                    style={{ background: deptColors[d] ?? 'transparent', color: deptColors[d] ? '#fff' : 'var(--md-sys-color-on-surface-muted)' }}
                    onClick={e => { e.stopPropagation(); setPickerDept(pickerDept === d ? null : d); }}
                    title="選擇顏色"
                  >
                    <Palette size={11} strokeWidth={2} />
                  </button>
                  {pickerDept === d && (
                    <div className="dept-color-picker" onClick={e => e.stopPropagation()}>
                      {DEPT_COLOR_PALETTE.map(c => (
                        <button
                          key={c}
                          className="dept-color-swatch"
                          style={{ background: c, outline: deptColors[d] === c ? `2px solid ${c}` : 'none', outlineOffset: 2 }}
                          onClick={() => { onUpdateDeptColors({ ...deptColors, [d]: c }); setPickerDept(null); }}
                        />
                      ))}
                    </div>
                  )}
                  {d}
                  <button
                    onClick={() => removeDept(d)}
                    style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 1, color: 'var(--md-sys-color-on-surface-muted)', borderRadius: '50%' }}
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          </>
        )}

      </div>

      <button className="perm-info-btn" onClick={() => setInfoOpen(true)}>
        <span className="perm-info-icon"><Info size={14} strokeWidth={2.5} /></span>
        權限說明
      </button>

      <Modal open={infoOpen} onClose={() => setInfoOpen(false)} title="權限說明">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(Object.entries(ROLE_DESC) as [Role, string][]).map(([role, desc]) => (
            <div key={role} style={{ padding: '10px 14px', background: 'var(--md-sys-color-surface-variant)', borderRadius: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{role}</div>
              <div style={{ fontSize: 13, color: 'var(--md-sys-color-on-surface-muted)', lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
          <div style={{ fontSize: 13, color: 'var(--md-sys-color-on-surface-muted)', paddingTop: 4 }}>
            僅 @cmoney.com.tw 帳號可透過 Google 登入
          </div>
        </div>
      </Modal>
    </div>
  );
}
