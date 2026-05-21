'use client';
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Cat, Priority } from '@/lib/types';
import { DEPTS, MEMBERS } from '@/lib/data';

interface NewCardData {
  title: string;
  dept: string;
  cat: Cat;
  owner: string;
  prio: Priority;
  est: number;
  due: string;
  status: import('@/lib/types').CardStatus;
  actual: number;
}

interface NewCardModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: NewCardData) => void;
  defaultStatus: import('@/lib/types').CardStatus;
}

const DEFAULT_FORM = {
  title: '',
  dept: DEPTS[0],
  cat: 'UIUX' as Cat,
  owner: 'mia',
  prio: 'normal' as Priority,
  est: 8,
  due: '',
};

export default function NewCardModal({
  open,
  onClose,
  onCreate,
  defaultStatus,
}: NewCardModalProps) {
  const [form, setForm] = useState(DEFAULT_FORM);

  // Reset title when open state changes
  useEffect(() => {
    setForm((f) => ({ ...f, title: '' }));
  }, [open]);

  function set<K extends keyof typeof DEFAULT_FORM>(key: K, val: (typeof DEFAULT_FORM)[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    onCreate({
      ...form,
      status: defaultStatus,
      actual: 0,
    });
    onClose();
  }

  return (
    <div className={`modal-scrim${open ? ' open' : ''}`} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-h">
          <span className="modal-h-title">新增需求單</span>
          <span style={{ flex: 1 }} />
          <button
            className="drawer-close"
            onClick={onClose}
            aria-label="關閉"
            type="button"
          >
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Title — full width */}
            <div className="form-row">
              <label>標題 *</label>
              <input
                className="input"
                style={{ width: '100%' }}
                placeholder="需求單標題..."
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-grid">
              {/* Dept */}
              <div className="form-row">
                <label>部門</label>
                <select
                  className="input"
                  style={{ width: '100%' }}
                  value={form.dept}
                  onChange={(e) => set('dept', e.target.value)}
                >
                  {DEPTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cat */}
              <div className="form-row">
                <label>類別</label>
                <select
                  className="input"
                  style={{ width: '100%' }}
                  value={form.cat}
                  onChange={(e) => set('cat', e.target.value as Cat)}
                >
                  <option value="UIUX">UIUX</option>
                  <option value="平面視覺">平面視覺</option>
                </select>
              </div>

              {/* Owner */}
              <div className="form-row">
                <label>受託人</label>
                <select
                  className="input"
                  style={{ width: '100%' }}
                  value={form.owner}
                  onChange={(e) => set('owner', e.target.value)}
                >
                  {MEMBERS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.alias})
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div className="form-row">
                <label>優先級</label>
                <select
                  className="input"
                  style={{ width: '100%' }}
                  value={form.prio}
                  onChange={(e) => set('prio', e.target.value as Priority)}
                >
                  <option value="high">高</option>
                  <option value="normal">中</option>
                  <option value="low">低</option>
                </select>
              </div>

              {/* Estimate */}
              <div className="form-row">
                <label>預估工時 (h)</label>
                <input
                  className="input"
                  style={{ width: '100%' }}
                  type="number"
                  min={1}
                  max={999}
                  value={form.est}
                  onChange={(e) => set('est', Number(e.target.value))}
                />
              </div>

              {/* Due date */}
              <div className="form-row">
                <label>到期日 (MM/DD)</label>
                <input
                  className="input"
                  style={{ width: '100%' }}
                  placeholder="06/30"
                  value={form.due}
                  onChange={(e) => set('due', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="modal-f">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="btn btn-primary">
              建立需求單
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
