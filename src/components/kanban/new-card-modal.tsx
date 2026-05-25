'use client';
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Cat, Priority, CardStatus } from '@/lib/types';
import { DEPTS } from '@/lib/data';

const DESC_TEMPLATE = `– 此欄位用於請需求方填寫需求的完整資料，平面視覺與 UIUX 需要的資料不同，請自行刪除不需要的段落 –

．平面視覺
初稿交稿時間 :
最晚需提供時間 :
需求尺寸：
需求內容：
需求風格：
使用情境：
其他補充、附件說明：

．UI, UXR
初稿交稿時間 :
最晚需提供時間 :
目的：
做法：
原因：`;

export interface NewCardData {
  title: string;
  dept: string;
  cat: Cat;
  prio: Priority;
  due: string;
  desc: string;
  status: CardStatus;
}

interface NewCardModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: NewCardData) => void;
  defaultStatus: CardStatus;
}

const DEFAULT_FORM = {
  title: '',
  dept: '' as string,
  cat: '' as Cat | '',
  prio: '' as Priority | '',
  due: '',
  desc: DESC_TEMPLATE,
};

// MM/DD → YYYY-MM-DD for date input value
function toDateInputVal(mmdd: string): string {
  if (!mmdd) return '';
  const year = new Date().getFullYear();
  return `${year}-${mmdd.replace('/', '-')}`;
}

// YYYY-MM-DD → MM/DD for storage
function fromDateInput(val: string): string {
  if (!val) return '';
  return val.slice(5).replace('-', '/');
}

export default function NewCardModal({ open, onClose, onCreate, defaultStatus }: NewCardModalProps) {
  const [form, setForm] = useState(DEFAULT_FORM);

  useEffect(() => {
    if (open) setForm(DEFAULT_FORM);
  }, [open]);

  function set<K extends keyof typeof DEFAULT_FORM>(key: K, val: (typeof DEFAULT_FORM)[K]) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.dept || !form.cat || !form.prio) return;
    onCreate({ ...form, cat: form.cat as Cat, prio: form.prio as Priority, status: defaultStatus });
    onClose();
  }

  const canSubmit = form.title.trim() && form.dept && form.cat && form.prio && form.due;

  return (
    <div className={`modal-scrim${open ? ' open' : ''}`} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-h">
          <span className="modal-h-title">新增需求單</span>
          <span style={{ flex: 1 }} />
          <button className="drawer-close" onClick={onClose} aria-label="關閉" type="button">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* 標題 */}
            <div className="form-row">
              <label>標題 *</label>
              <input
                className="input"
                style={{ width: '100%' }}
                placeholder="需求單標題..."
                value={form.title}
                onChange={e => set('title', e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-grid">
              {/* 需求發起單位 */}
              <div className="form-row">
                <label>需求發起單位 *</label>
                <select className="input" style={{ width: '100%' }} value={form.dept} onChange={e => set('dept', e.target.value)}>
                  <option value="">請選擇</option>
                  {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              {/* 截止日 */}
              <div className="form-row">
                <label>截止日 *</label>
                <input
                  className="input"
                  style={{ width: '100%' }}
                  type="date"
                  value={toDateInputVal(form.due)}
                  onChange={e => set('due', fromDateInput(e.target.value))}
                />
              </div>

              {/* 需求執行單位 */}
              <div className="form-row">
                <label>需求執行單位 *</label>
                <select className="input" style={{ width: '100%' }} value={form.cat} onChange={e => set('cat', e.target.value as Cat)}>
                  <option value="">請選擇</option>
                  <option value="UIUX">UIUX</option>
                  <option value="平面視覺">平面視覺</option>
                </select>
              </div>

              {/* 優先級 */}
              <div className="form-row">
                <label>優先級 *</label>
                <select className="input" style={{ width: '100%' }} value={form.prio} onChange={e => set('prio', e.target.value as Priority)}>
                  <option value="">請選擇</option>
                  <option value="high">高</option>
                  <option value="normal">中</option>
                  <option value="low">低</option>
                </select>
              </div>
            </div>

            {/* 描述 */}
            <div className="form-row">
              <label>描述</label>
              <textarea
                className="input"
                style={{ width: '100%', minHeight: 220, resize: 'vertical', fontFamily: 'inherit', fontSize: 12.5, lineHeight: 1.7 }}
                value={form.desc}
                onChange={e => set('desc', e.target.value)}
              />
            </div>
          </div>

          <div className="modal-f">
            <button type="button" className="btn btn-ghost" onClick={onClose}>取消</button>
            <button type="submit" className="btn btn-primary" disabled={!canSubmit}>建立需求單</button>
          </div>
        </form>
      </div>
    </div>
  );
}
