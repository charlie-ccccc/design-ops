'use client';
import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { AppUser, Role, DesignCat } from '@/contexts/auth-context';
import { DEPTS } from '@/lib/data';

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
}

export default function Permissions({ users, currentUser, onUpdateUser }: PermissionsProps) {
  const [tab, setTab] = useState<'users' | 'depts'>('users');
  const [depts, setDepts] = useState<string[]>(DEPTS);
  const [newDept, setNewDept] = useState('');

  const isAdmin = currentUser.roles.includes('Admin');

  const sorted = [...users].sort((a, b) => {
    const rank = (u: AppUser) => u.roles.includes('Admin') ? 0 : u.roles.includes('成員') ? 1 : 2;
    return rank(a) - rank(b);
  });

  function addDept() {
    const d = newDept.trim();
    if (!d || depts.includes(d)) return;
    setDepts(prev => [...prev, d]);
    setNewDept('');
  }

  function removeDept(d: string) {
    setDepts(prev => prev.filter(x => x !== d));
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
    <div style={{ padding: '18px 22px' }}>
      <div className="panel">

        <div style={{ display: 'flex', borderBottom: '1px solid var(--divider)' }}>
          {(['users', 'depts'] as const).map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                appearance: 'none', border: 'none', background: 'none', cursor: 'pointer',
                padding: '11px 18px', fontSize: 13, fontWeight: tab === t ? 600 : 400,
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
            <div style={{ display: 'flex', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--divider)' }}>
              {(Object.entries(ROLE_DESC) as [Role, string][]).map(([role, desc]) => (
                <div key={role} style={{ flex: 1, padding: '8px 12px', background: 'var(--surface-2)', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 3 }}>{role}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>{desc}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: '4px 16px 8px', fontSize: 11.5, color: 'var(--muted)' }}>
              僅 @cmoney.com.tw 帳號可透過 Google 登入
              {!isAdmin && <span style={{ marginLeft: 8, color: 'var(--st-block)' }}>（需 Admin 權限才能修改角色）</span>}
            </div>
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
                  <tr key={u.uid} style={{ background: u.uid === currentUser.uid ? 'color-mix(in oklab, var(--accent-soft) 60%, transparent)' : undefined }}>
                    <td style={{ textAlign: 'left', fontFamily: 'inherit' }}>
                      {u.name}
                      {u.uid === currentUser.uid && <span style={{ fontSize: 10, color: 'var(--accent)', marginLeft: 5 }}>（你）</span>}
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
                                borderRadius: 6, padding: '3px 10px', fontSize: 12,
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
                          style={{ fontSize: 12 }}
                          value={u.cat ?? ''}
                          disabled={!isAdmin}
                          onChange={e => setUserCat(u.uid, e.target.value as DesignCat)}
                        >
                          <option value="">請選擇</option>
                          <option value="UIUX">UIUX</option>
                          <option value="平面視覺">平面視覺</option>
                        </select>
                      ) : (
                        <span style={{ color: 'var(--muted)', fontSize: 12 }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
                尚無用戶資料
              </div>
            )}
          </>
        )}

        {tab === 'depts' && (
          <>
            <div style={{ padding: '8px 16px 4px', fontSize: 11.5, color: 'var(--muted)' }}>
              新增需求單時的發起單位選項
            </div>
            <div style={{ padding: '8px 16px 18px', display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              {depts.map(d => (
                <span key={d} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '4px 10px 4px 12px', background: 'var(--surface-2)',
                  border: '1px solid var(--border)', borderRadius: 20, fontSize: 13,
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
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  className="input"
                  placeholder="新增單位名稱"
                  style={{ width: 150 }}
                  value={newDept}
                  onChange={e => setNewDept(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addDept()}
                />
                <button className="btn btn-primary" onClick={addDept} style={{ padding: '0 10px' }}>
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
