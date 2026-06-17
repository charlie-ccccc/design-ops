'use client';
import React, { useState, useEffect } from 'react';
import RichTextEditor from '@/components/ui/rich-text-editor';
import type { Cat, Priority, CardStatus, Member } from '@/lib/types';
import type { AppUser } from '@/contexts/auth-context';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { FormRow, FormGrid } from '@/components/ui/FormRow/FormRow';
import { Modal } from '@/components/ui/Modal/Modal';

function plainToHtml(text: string): string {
  if (!text) return '';
  if (/<[a-z]/i.test(text)) return text;
  return text.split(/\n{2,}/).map(para =>
    `<p>${para.replace(/\n/g, '<br>')}</p>`
  ).join('');
}

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
  requester: string;
  requesterName: string;
  cat: Cat;
  prio: Priority;
  due: string;
  owner: string;
  desc: string;
  status: CardStatus;
}

interface NewCardModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: NewCardData) => void;
  defaultStatus: CardStatus;
  currentUser: AppUser;
  siteUsers: AppUser[];
  members: Member[];
  depts: string[];
}

const makeDefaultForm = (currentUser: AppUser) => ({
  title: '',
  dept: '' as string,
  requester: currentUser.uid,
  requesterName: currentUser.name,
  cat: '' as Cat | '',
  prio: 'normal' as Priority | '',
  due: '',
  owner: '',
  desc: DESC_TEMPLATE,
});

function toDateInputVal(mmdd: string): string {
  if (!mmdd) return '';
  const year = new Date().getFullYear();
  return `${year}-${mmdd.replace('/', '-')}`;
}

function fromDateInput(val: string): string {
  if (!val) return '';
  return val.slice(5).replace('-', '/');
}

const DRAFT_KEY = 'new-card-draft';

export default function NewCardModal({ open, onClose, onCreate, defaultStatus, currentUser, siteUsers, members, depts }: NewCardModalProps) {
  const [form, setForm] = useState(() => makeDefaultForm(currentUser));
  const [openCount, setOpenCount] = useState(0);

  useEffect(() => {
    if (!open) return;
    setOpenCount(c => c + 1);
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try { setForm(JSON.parse(saved)); return; } catch {}
    }
    setForm(makeDefaultForm(currentUser));
  }, [open, currentUser]);

  useEffect(() => {
    if (open) localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
  }, [form, open]);

  function set<K extends keyof ReturnType<typeof makeDefaultForm>>(key: K, val: ReturnType<typeof makeDefaultForm>[K]) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function handleClose() {
    localStorage.removeItem(DRAFT_KEY);
    onClose();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.dept || !form.cat || !form.prio) return;
    onCreate({ ...form, cat: form.cat as Cat, prio: form.prio as Priority, requesterName: form.requesterName, status: defaultStatus });
    localStorage.removeItem(DRAFT_KEY);
    onClose();
  }

  const canSubmit = form.title.trim() && form.dept && form.cat && form.prio && form.due;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="新增需求單"
      disableBackdropClose
      size="lg"
      footer={
        <>
          <Button variant="ghost" type="button" onClick={handleClose}>取消</Button>
          <Button variant="primary" type="submit" form="new-card-form" disabled={!canSubmit}>建立需求單</Button>
        </>
      }
    >
      <form id="new-card-form" onSubmit={handleSubmit}>
        <FormRow label="標題 *">
          <Input
            style={{ width: '100%' }}
            placeholder="需求單標題..."
            value={form.title}
            onChange={e => set('title', (e.target as HTMLInputElement).value)}
            autoFocus
          />
        </FormRow>

        <FormGrid cols={2}>
          <FormRow label="需求發起單位 *">
            <Input as="select" style={{ width: '100%' }} value={form.dept}
              onChange={e => set('dept', (e.target as HTMLSelectElement).value)}>
              <option value="">請選擇</option>
              {depts.map((d: string) => <option key={d} value={d}>{d}</option>)}
            </Input>
          </FormRow>

          <FormRow label="委託人">
            {currentUser.roles.includes('一般') ? (
              <Input style={{ width: '100%', color: 'var(--md-sys-color-on-surface-muted)' }} value={form.requesterName} disabled />
            ) : (
              <Input as="select" style={{ width: '100%' }} value={form.requester}
                onChange={e => {
                  const uid = (e.target as HTMLSelectElement).value;
                  const u = siteUsers.find(x => x.uid === uid);
                  set('requester', uid);
                  set('requesterName', u?.name ?? '');
                }}>
                <option value="">未指定</option>
                {siteUsers.map(u => <option key={u.uid} value={u.uid}>{u.name}</option>)}
              </Input>
            )}
          </FormRow>

          <FormRow label="截止日 *">
            <Input type="date" style={{ width: '100%' }}
              value={toDateInputVal(form.due)}
              onChange={e => set('due', fromDateInput((e.target as HTMLInputElement).value))} />
          </FormRow>

          <FormRow label="優先級 *">
            <Input as="select" style={{ width: '100%' }} value={form.prio}
              onChange={e => set('prio', (e.target as HTMLSelectElement).value as Priority)}>
              <option value="">請選擇</option>
              <option value="urgent">最高</option>
              <option value="high">高</option>
              <option value="normal">一般</option>
              <option value="low">低</option>
              <option value="lowest">最低</option>
            </Input>
          </FormRow>

          <FormRow label="類別 *">
            <Input as="select" style={{ width: '100%' }} value={form.cat}
              onChange={e => set('cat', (e.target as HTMLSelectElement).value as Cat)}>
              <option value="">請選擇</option>
              <option value="UIUX">UIUX</option>
              <option value="平面視覺">平面視覺</option>
            </Input>
          </FormRow>

          <FormRow label="受託人">
            <Input as="select" style={{ width: '100%' }} value={form.owner}
              onChange={e => set('owner', (e.target as HTMLSelectElement).value)}>
              <option value="">未指定</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </Input>
          </FormRow>
        </FormGrid>

        <FormRow label="描述">
          <RichTextEditor
            key={openCount}
            value={plainToHtml(form.desc)}
            onChange={v => set('desc', v)}
            minHeight={220}
          />
        </FormRow>
      </form>
    </Modal>
  );
}
