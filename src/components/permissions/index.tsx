'use client';
import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { Cat } from '@/lib/types';
import { DEPTS } from '@/lib/data';

type Role = '一般' | '成員' | 'Admin';
const ALL_ROLES: Role[] = ['一般', '成員', 'Admin'];

interface SiteUser {
  id: string;
  name: string;
  email: string;
  roles: Role[];
  cat?: Cat; // 設計類別，只有具備「成員」角色時有意義
}

const SEED_USERS: SiteUser[] = [
  { id: '1', name: '吳奕蓁', email: 'mia@cmoney.com.tw',     roles: ['成員', 'Admin'], cat: 'UIUX' },
  { id: '2', name: '王映蓉', email: 'annie@cmoney.com.tw',   roles: ['成員'],          cat: 'UIUX' },
  { id: '3', name: '楊舒娟', email: 'shujuan@cmoney.com.tw', roles: ['成員'],          cat: '平面視覺' },
  { id: '4', name: '寶萱',   email: 'baoxuan@cmoney.com.tw', roles: ['成員'],          cat: '平面視覺' },
  { id: '5', name: '陳巧玲', email: 'charlie@cmoney.com.tw', roles: ['成員', 'Admin'], cat: 'UIUX' },
  { id: '6', name: '熊禹晴', email: 'sunny@cmoney.com.tw',   roles: ['成員'],          cat: '平面視覺' },
];

const ROLE_DESC: Record<Role, string> = {
  一般:  '開單、看單子、修改自己的單、留言',
  成員:  '移動單子、修改所有內容、記錄工時、留言',
  Admin: '成員功能 + 調整權限、封存、量能管理',
};

export default function Permissions() {
  const [tab, setTab] = useState<'users' | 'depts'>('users');
  const [depts, setDepts] = useState<string[]>(DEPTS);
  const [newDept, setNewDept] = useState('');
  const [users, setUsers] = useState<SiteUser[]>(SEED_USERS);

  function addDept() {
    const d = newDept.trim();
    if (!d || depts.includes(d)) return;
    setDepts(prev => [...prev, d]);
    setNewDept('');
  }

  function removeDept(d: string) {
    setDepts(prev => prev.filter(x => x !== d));
  }

  function toggleRole(id: string, role: Role) {
    setUsers(prev => prev.map(u => {
      if (u.id !== id) return u;
      const has = u.roles.includes(role);
      const next = has ? u.roles.filter(r => r !== role) : [...u.roles, role];
      // clear cat if 成員 was removed
      return { ...u, roles: next, cat: next.includes('成員') ? u.cat : undefined };
    }));
  }

  function setUserCat(id: string, cat: Cat) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, cat } : u));
  }

  return (
    <div style={{ padding: '18px 22px', maxWidth: 800 }}>
      <div className="panel">

        {/* ── Tab bar in panel header ── */}
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

        {/* ── 使用者權限管理 ── */}
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
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={{ textAlign: 'left', fontFamily: 'inherit' }}>{u.name}</td>
                    <td style={{ textAlign: 'left', fontFamily: 'inherit', color: 'var(--muted)' }}>{u.email}</td>
                    <td style={{ textAlign: 'left' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {ALL_ROLES.map(role => {
                          const active = u.roles.includes(role);
                          return (
                            <button key={role} onClick={() => toggleRole(u.id, role)} style={{
                              appearance: 'none', border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                              borderRadius: 6, padding: '3px 10px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                              background: active ? 'var(--accent-soft)' : 'none',
                              color: active ? 'var(--accent)' : 'var(--muted)',
                              fontWeight: active ? 600 : 400,
                              transition: 'all 0.15s',
                            }}>
                              {role}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      {u.roles.includes('成員') ? (
                        <select className="input" style={{ fontSize: 12 }}
                          value={u.cat ?? ''}
                          onChange={e => setUserCat(u.id, e.target.value as Cat)}>
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
          </>
        )}

        {/* ── 需求單位管理 ── */}
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
