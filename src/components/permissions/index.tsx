'use client';
import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { DEPTS } from '@/lib/data';

type Role = '一般' | '成員' | 'Admin';

interface SiteUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

const SEED_USERS: SiteUser[] = [
  { id: '1', name: '吳奕蓁', email: 'mia@cmoney.com.tw',     role: 'Admin' },
  { id: '2', name: '王映蓉', email: 'annie@cmoney.com.tw',   role: '成員' },
  { id: '3', name: '楊舒娟', email: 'shujuan@cmoney.com.tw', role: '成員' },
  { id: '4', name: '寶萱',   email: 'baoxuan@cmoney.com.tw', role: '成員' },
  { id: '5', name: '陳巧玲', email: 'charlie@cmoney.com.tw', role: 'Admin' },
  { id: '6', name: '熊禹晴', email: 'sunny@cmoney.com.tw',   role: '成員' },
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

  function setUserRole(id: string, role: Role) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
  }

  return (
    <div style={{ padding: '18px 22px', maxWidth: 800 }}>

      {/* ── Tab bar ── */}
      <div className="cap-side" style={{ marginBottom: 20 }}>
        <div className="cap-tabs">
          <button
            className="cap-tab"
            data-on={tab === 'users' ? '1' : '0'}
            onClick={() => setTab('users')}
          >
            使用者權限
          </button>
          <button
            className="cap-tab"
            data-on={tab === 'depts' ? '1' : '0'}
            onClick={() => setTab('depts')}
          >
            需求發起單位
          </button>
        </div>
      </div>

      {/* ── 使用者權限管理 ── */}
      {tab === 'users' && (
        <div className="panel">
          <div className="panel-h">
            <span className="panel-title">使用者權限管理</span>
            <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 8 }}>僅 @cmoney.com.tw 帳號可透過 Google 登入</span>
          </div>

          {/* 權限說明列 */}
          <div style={{ display: 'flex', gap: 12, padding: '10px 20px', borderBottom: '1px solid var(--divider)' }}>
            {(Object.entries(ROLE_DESC) as [Role, string][]).map(([role, desc]) => (
              <div key={role} style={{ flex: 1, padding: '8px 12px', background: 'var(--surface-2)', borderRadius: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 3 }}>{role}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5 }}>{desc}</div>
              </div>
            ))}
          </div>

          <table className="cap-table">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>姓名</th>
                <th style={{ textAlign: 'left' }}>Email</th>
                <th>權限角色</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ textAlign: 'left', fontFamily: 'inherit' }}>{u.name}</td>
                  <td style={{ textAlign: 'left', fontFamily: 'inherit', color: 'var(--muted)' }}>{u.email}</td>
                  <td>
                    <select
                      className="input"
                      style={{ width: 90 }}
                      value={u.role}
                      onChange={e => setUserRole(u.id, e.target.value as Role)}
                    >
                      <option value="一般">一般</option>
                      <option value="成員">成員</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── 需求單位管理 ── */}
      {tab === 'depts' && (
        <div className="panel">
          <div className="panel-h">
            <span className="panel-title">需求單位管理</span>
            <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 8 }}>新增需求單時的發起單位選項</span>
          </div>
          <div style={{ padding: '14px 20px', display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
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
        </div>
      )}
    </div>
  );
}
