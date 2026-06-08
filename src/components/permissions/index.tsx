'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Info } from 'lucide-react';
import type { AppUser, Role, DesignCat } from '@/contexts/auth-context';

const ALL_ROLES: Role[] = ['Admin', '成員', '一般'];

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
}

export default function Permissions({ users, currentUser, onUpdateUser, depts, onUpdateDepts }: PermissionsProps) {
  const [tab, setTab] = useState<'users' | 'depts'>('users');
  const [newDept, setNewDept] = useState('');
  const [infoOpen, setInfoOpen] = useState(false);

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
    onUpdateUser(uid, {
      roles: next,
      cat: next.includes('成員') ? u.cat : undefined,
    });
  }

  function setUserCat(uid: string, cat: DesignCat) {
    if (!isAdmin) return;
    onUpdateUser(uid, { cat });
  }

  return (
    <div className="perm-wrap" style={{ padding: '18px 22px' }}>
      <div className="panel">

        <div className="perm-tab-bar" style={{ display: 'flex', borderBottom: '1px solid var(--divider)' }}>
          {(['users', 'depts'] as const).map((t, i) => (
            <button
              key={t}
              className="perm-tab"
              onClick={() => setTab(t)}
              style={{
                appearance: 'none', border: 'none', background: 'none', cursor: 'pointer',
                padding: '11px 18px', fontSize: 14, fontWeight: tab === t ? 600 : 400,
                color: tab === t ? 'var(--ink)' : 'var(--muted)',
                borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
                marginBottom: -1, transition: 'color 0.15s',
                fontFamily: 'inherit',
              }}
            >
              {i === 0 ? '使用者權限' : '需求發起單位'}
            </button>
          ))}
        </div>

        {tab === 'users' && (
          <>
            {!isAdmin && (
              <div style={{ padding: '6px 16px 6px', fontSize: 13, color: 'var(--st-block)' }}>
                需 Admin 權限才能修改角色
              </div>
            )}
            <div className="cap-table-wrap" style={{ overflowX: 'auto' }}>
              <table className="cap-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>姓名</th>
                    <th style={{ textAlign: 'left' }}>Email</th>
                    <th style={{ textAlign: 'left' }}>權限角色</th>
                    <th style={{ textAlign: 'left' }}>設計類別</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(u => (
                    <tr key={u.uid} style={{ background: u.uid === currentUser.uid ? 'color-mix(in oklab, var(--accent-soft) 60%, var(--surface))' : undefined }}>
                      <td style={{ textAlign: 'left', fontFamily: 'inherit' }}>
                        {u.name}
                        {u.uid === currentUser.uid && <span style={{ fontSize: 12, color: 'var(--accent)', marginLeft: 5 }}>（你）</span>}
                      </td>
                      <td style={{ textAlign: 'left', fontFamily: 'inherit', color: 'var(--muted)' }}>{u.email}</td>
                      <td style={{ textAlign: 'left' }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {ALL_ROLES.map(role => {
                            const active = u.roles.includes(role);
                            return (
                              <button
                                key={role}
                                onClick={() => toggleRole(u.uid, role)}
                                disabled={!isAdmin}
                                style={{
                                  appearance: 'none', border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                                  borderRadius: 6, padding: '3px 10px', fontSize: 13,
                                  cursor: isAdmin ? 'pointer' : 'default', fontFamily: 'inherit',
                                  background: active ? 'var(--accent-soft)' : 'none',
                                  color: active ? 'var(--accent)' : 'var(--muted)',
                                  fontWeight: active ? 600 : 400,
                                  transition: 'all 0.15s',
                                  opacity: !isAdmin ? 0.7 : 1,
                                }}
                              >
                                {role}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td style={{ textAlign: 'left' }}>
                        {u.roles.includes('成員') ? (
                          <select
                            className="input"
                            style={{ fontSize: 13 }}
                            value={u.cat ?? ''}
                            disabled={!isAdmin}
                            onChange={e => setUserCat(u.uid, e.target.value as DesignCat)}
                          >
                            <option value="">請選擇</option>
                            <option value="UIUX">UIUX</option>
                            <option value="平面視覺">平面視覺</option>
                          </select>
                        ) : (
                          <span style={{ color: 'var(--muted)', fontSize: 13 }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {users.length === 0 && (
              <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
                尚無用戶資料
              </div>
            )}
          </>
        )}

        {tab === 'depts' && (
          <>
            <div style={{ padding: '8px 16px 4px', fontSize: 13, color: 'var(--muted)' }}>
              新增需求單時的發起單位選項
            </div>
            <div style={{ display: 'flex', gap: 6, padding: '8px 16px 10px' }}>
              <input
                className="input"
                placeholder="新增單位名稱"
                style={{ flex: 1 }}
                value={newDept}
                onChange={e => setNewDept(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addDept()}
              />
              <button className="btn btn-primary" onClick={addDept} style={{ padding: '0 10px' }}>
                <Plus size={14} />
              </button>
            </div>
            <div style={{ padding: '0 16px 18px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {depts.map(d => (
                <span key={d} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '4px 10px 4px 12px', background: 'var(--surface-2)',
                  border: '1px solid var(--border)', borderRadius: 20, fontSize: 14,
                }}>
                  {d}
                  <button
                    onClick={() => removeDept(d)}
                    style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 1, color: 'var(--muted)', borderRadius: '50%' }}
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          </>
        )}

      </div>

      {/* ── Floating info button ── */}
      <button className="perm-info-btn" onClick={() => setInfoOpen(true)}>
        <span className="perm-info-icon"><Info size={14} strokeWidth={2.5} /></span>
        權限說明
      </button>

      {/* ── Info modal ── */}
      {infoOpen && (
        <div className="modal-scrim open" onClick={() => setInfoOpen(false)}>
          <div className="modal" style={{ width: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-h">
              <span className="modal-h-title">權限說明</span>
              <span style={{ flex: 1 }} />
              <button className="drawer-close" onClick={() => setInfoOpen(false)}><X size={16} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(Object.entries(ROLE_DESC) as [Role, string][]).map(([role, desc]) => (
                <div key={role} style={{ padding: '10px 14px', background: 'var(--surface-2)', borderRadius: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{role}</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>{desc}</div>
                </div>
              ))}
              <div style={{ fontSize: 13, color: 'var(--muted)', paddingTop: 4 }}>
                僅 @cmoney.com.tw 帳號可透過 Google 登入
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
