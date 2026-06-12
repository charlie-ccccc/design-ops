'use client';
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Clock, MoreHorizontal, Pencil, Check } from 'lucide-react';
import RichTextEditor from '@/components/ui/rich-text-editor';
import type { Card, TimeLog, Comment, Member } from '@/lib/types';
import type { AppUser } from '@/contexts/auth-context';
import { STATUSES, MEMBERS, MEMBER_BY_ID, DEPTS, DEPT_SHORT, SITE_USERS, SiteUser } from '@/lib/data';
import { hue, sum } from '@/lib/utils';
import { createNotification } from '@/lib/notifications';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { MemberCell } from '@/components/ui/MemberCell/MemberCell';

interface CardDrawerProps {
  card: Card | null;
  onClose: () => void;
  onUpdate: (id: string, patch: Partial<Card>) => void;
  onDelete?: (id: string) => void;
  onClone?: (override: { title: string; owner: string; requester?: string }) => void;
  readOnly?: boolean;
  canEdit?: boolean;
  currentUserName?: string;
  currentUserUid?: string;
  siteUsers?: AppUser[];
  members?: Member[];
}

const URL_RE = /(https?:\/\/[^\s]+)/g;
function renderWithLinks(text: string) {
  return text.split(URL_RE).map((part, i) =>
    URL_RE.test(part)
      ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--md-sys-color-primary)', wordBreak: 'break-all' }}>{part}</a>
      : part
  );
}

function toDateInput(mmdd: string, cardMonth: string): string {
  if (!mmdd) return '';
  const year = cardMonth.split('/')[0];
  return `${year}-${mmdd.replace('/', '-')}`;
}
function fromDateInput(val: string): string {
  if (!val) return '';
  return val.slice(5).replace('-', '/');
}

type AnyUser = { id: string; name: string; initial: string; hue: number; photo?: string; sub?: string };
function toAnyUser(m: typeof MEMBERS[0]): AnyUser { return { id: m.id, name: m.name, initial: m.initial, hue: m.hue, photo: m.photo, sub: m.cat }; }
function siteToAnyUser(u: SiteUser): AnyUser { return { id: u.id, name: u.name, initial: u.initial, hue: u.hue, photo: u.photo, sub: u.dept }; }

function MemberPicker({ value, onChange, users, placeholder = '— 未指定 —' }: {
  value: string; onChange: (name: string, id: string) => void; users: AnyUser[]; placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const selected = users.find(u => u.name === value) ?? null;
  const filtered = q.trim() ? users.filter(u => u.name.includes(q) || (u.sub ?? '').includes(q)) : users;
  function openPicker() {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, left: r.left });
    }
    setOpen(o => !o); setQ('');
  }
  function pick(u: AnyUser) { onChange(u.name, u.id); setOpen(false); setQ(''); }
  function clear() { onChange('', ''); setOpen(false); setQ(''); }
  const dropdown = open ? createPortal(
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onClick={() => { setOpen(false); setQ(''); }} />
      <div style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999, background: 'var(--md-sys-color-surface)', border: '1px solid var(--md-sys-color-outline)', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,.18)', minWidth: 240, overflow: 'hidden' }}>
        <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--md-sys-color-outline-variant)' }}>
          <Input autoFocus placeholder="搜尋..." style={{ width: '100%', fontSize: 14 }}
            value={q} onChange={e => setQ((e.target as HTMLInputElement).value)} />
        </div>
        <div style={{ maxHeight: 240, overflowY: 'auto' }}>
          <button onClick={() => clear()}
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: 'none', border: 'none', padding: '8px 12px', cursor: 'pointer', fontSize: 14, color: 'var(--md-sys-color-on-surface-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--md-sys-color-surface-variant)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}>— 未指定 —</button>
          {filtered.map(u => (
            <button key={u.id} onClick={() => pick(u)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', border: 'none', padding: '8px 12px', cursor: 'pointer', fontSize: 14, textAlign: 'left', background: value === u.name ? 'color-mix(in oklab, var(--md-sys-color-primary) 12%, transparent)' : 'none' }}
              onMouseEnter={e => { if (value !== u.name) e.currentTarget.style.background = 'var(--md-sys-color-surface-variant)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = value === u.name ? 'color-mix(in oklab, var(--md-sys-color-primary) 12%, transparent)' : 'none'; }}>
              {u.photo ? <img src={u.photo} alt={u.name} className="av av-sm" style={{ objectFit: 'cover' }} /> : <div className="av av-sm" style={{ background: hue(u.hue) }}>{u.initial}</div>}
              <span style={{ fontWeight: 500 }}>{u.name}</span>
            </button>
          ))}
          {filtered.length === 0 && <div style={{ padding: '10px 12px', fontSize: 12, color: 'var(--md-sys-color-on-surface-muted)' }}>無符合結果</div>}
        </div>
      </div>
    </>,
    typeof document !== 'undefined' ? document.body : null as never
  ) : null;
  return (
    <div style={{ position: 'relative' }}>
      <button ref={btnRef} onClick={openPicker}
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--md-sys-color-surface-variant)', border: '1px solid var(--md-sys-color-outline)', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontSize: 14 }}>
        {selected ? (
          <>
            {selected.photo ? <img src={selected.photo} alt={selected.name} className="av av-sm" style={{ objectFit: 'cover' }} /> : <div className="av av-sm" style={{ background: hue(selected.hue) }}>{selected.initial}</div>}
            <span style={{ fontWeight: 500 }}>{selected.name}</span>
          </>
        ) : <span style={{ color: 'var(--md-sys-color-on-surface-muted)' }}>{placeholder}</span>}
        <span style={{ marginLeft: 4, color: 'var(--md-sys-color-on-surface-muted)', fontSize: 12 }}>▾</span>
      </button>
      {dropdown}
    </div>
  );
}

const STATIC_DESIGNER_USERS = MEMBERS.map(toAnyUser);
const STATIC_ALL_USERS = SITE_USERS.map(siteToAnyUser);

const tabStyle = (active: boolean): React.CSSProperties => ({
  appearance: 'none', border: 'none', background: 'none', cursor: 'pointer',
  padding: '8px 14px', fontSize: 14, fontFamily: 'inherit',
  fontWeight: active ? 600 : 400,
  color: active ? 'var(--md-sys-color-on-surface)' : 'var(--md-sys-color-on-surface-muted)',
  borderBottom: active ? '2px solid var(--md-sys-color-primary)' : '2px solid transparent',
  marginBottom: -1, transition: 'color 0.15s',
});

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2, '0')}:${m}`;
});

function roundToHalfHour(): string {
  const n = new Date();
  const h = n.getHours();
  const m = n.getMinutes() >= 30 ? 30 : 0;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

const EMPTY_LOG = { date: '', time: '', hours: 0, note: '' };
type BottomTab = 'activity' | 'comments' | 'timelogs';

export default function CardDrawer({ card, onClose, onUpdate, onDelete, onClone, readOnly, canEdit = true, currentUserName, currentUserUid, siteUsers: propSiteUsers, members: propMembers }: CardDrawerProps) {
  const DESIGNER_USERS = propMembers
    ? propMembers.map(m => ({ id: m.id, name: m.name, initial: m.initial, hue: m.hue, photo: m.photo, sub: m.cat } as AnyUser))
    : STATIC_DESIGNER_USERS;
  const ALL_USERS = propSiteUsers
    ? propSiteUsers.map(u => ({ id: u.uid, name: u.name, initial: u.initial ?? u.name[0], hue: u.hue ?? 1, photo: u.photo, sub: u.dept } as AnyUser))
    : STATIC_ALL_USERS;
  const [isOpen, setIsOpen] = useState(false);
  const [displayCard, setDisplayCard] = useState<Card | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [cloneOpen, setCloneOpen] = useState(false);
  const [cloneDraft, setCloneDraft] = useState({ title: '', ownerName: '', ownerId: '', requesterName: '' });
  const [bottomTab, setBottomTab] = useState<BottomTab>('activity');
  const [editingTitle, setEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [editingDesc, setEditingDesc] = useState(false);
  const [draftDesc, setDraftDesc] = useState('');
  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentDraft, setEditCommentDraft] = useState('');
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [mentionStart, setMentionStart] = useState(-1);
  const commentRef = useRef<HTMLTextAreaElement>(null);

  const [logModal, setLogModal] = useState(false);
  const [newLog, setNewLog] = useState(EMPTY_LOG);
  const [logKey, setLogKey] = useState(0);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editLogDraft, setEditLogDraft] = useState(EMPTY_LOG);
  const prevCardIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (card) {
      setDisplayCard(card);
      const isNewCard = card.id !== prevCardIdRef.current;
      if (isNewCard) {
        prevCardIdRef.current = card.id;
        setMoreOpen(false);
        setCopied(false);
        setConfirmDelete(false);
        setCloneOpen(false);
        setEditingTitle(false);
        setDraftTitle(card.title || '');
        setEditingDesc(false);
        setDraftDesc(card.desc || '');
        setCommentText('');
        setEditingCommentId(null);
        setBottomTab('activity');
        setLogModal(false);
        setNewLog(EMPTY_LOG);
        setEditingLogId(null);
      }
      const raf = requestAnimationFrame(() => setIsOpen(true));
      return () => cancelAnimationFrame(raf);
    } else {
      prevCardIdRef.current = null;
      setIsOpen(false);
      const t = window.setTimeout(() => setDisplayCard(null), 280);
      return () => window.clearTimeout(t);
    }
  }, [card]);

  const c = displayCard;
  const ownerUser = c ? (DESIGNER_USERS.find(u => u.id === c.owner) ?? (MEMBER_BY_ID[c.owner] ? { id: c.owner, name: MEMBER_BY_ID[c.owner].name, initial: MEMBER_BY_ID[c.owner].initial, hue: MEMBER_BY_ID[c.owner].hue } : null)) : null;
  const owner = c ? MEMBER_BY_ID[c.owner] : null;
  const timeLogs: TimeLog[] = c?.timeLogs ?? [];
  const comments: Comment[] = c?.comments ?? [];
  const computedActual = timeLogs.length > 0 ? sum(timeLogs.map(l => l.hours)) : (c?.actual ?? 0);
  const isOver = c ? computedActual > c.est : false;

  function nowStamp(): string {
    const n = new Date();
    const p = (x: number) => String(x).padStart(2, '0');
    return `${n.getFullYear()}/${p(n.getMonth() + 1)}/${p(n.getDate())} ${p(n.getHours())}:${p(n.getMinutes())}`;
  }

  function submitLog() {
    if (!c || !newLog.date || !newLog.time || newLog.hours <= 0) return;
    const entry: TimeLog = { id: Date.now().toString(), date: newLog.date, time: newLog.time || undefined, hours: newLog.hours, note: newLog.note };
    const updated = [...timeLogs, entry];
    const act = { who: currentUserName ?? '主設計師', msg: `回報實際工時 +${newLog.hours}h`, t: nowStamp() };
    onUpdate(c.id, { timeLogs: updated, actual: sum(updated.map(l => l.hours)), activity: [...(c.activity ?? []), act] });
    setNewLog(EMPTY_LOG);
    setLogModal(false);
    setBottomTab('timelogs');
  }

  function removeLog(id: string) {
    if (!c) return;
    const updated = timeLogs.filter(l => l.id !== id);
    onUpdate(c.id, { timeLogs: updated, actual: updated.length > 0 ? sum(updated.map(l => l.hours)) : 0 });
  }

  function saveLogEdit(id: string) {
    if (!c) return;
    const orig = timeLogs.find(l => l.id === id);
    const updated = timeLogs.map(l => l.id === id ? { ...l, date: editLogDraft.date || l.date, time: editLogDraft.time || undefined, hours: editLogDraft.hours > 0 ? editLogDraft.hours : l.hours, note: editLogDraft.note } : l);
    const newHours = editLogDraft.hours > 0 ? editLogDraft.hours : (orig?.hours ?? 0);
    const acts = orig && orig.hours !== newHours
      ? [...(c.activity ?? []), { who: currentUserName ?? '主設計師', msg: `修改工時紀錄：${orig.hours}h → ${newHours}h`, t: nowStamp() }]
      : c.activity;
    onUpdate(c.id, { timeLogs: updated, actual: sum(updated.map(l => l.hours)), activity: acts });
    setEditingLogId(null);
  }

  function handleCommentChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    setCommentText(val);
    const sel = e.target.selectionStart ?? val.length;
    const m = val.slice(0, sel).match(/@([^@\s]*)$/);
    if (m) {
      setMentionFilter(m[1]);
      setMentionStart(sel - m[0].length);
      setMentionOpen(true);
    } else {
      setMentionOpen(false);
    }
  }

  function insertMention(u: AppUser) {
    const ta = commentRef.current;
    if (!ta) return;
    const cursor = ta.selectionStart ?? commentText.length;
    const newText = `${commentText.slice(0, mentionStart)}@${u.name} ${commentText.slice(cursor)}`;
    setCommentText(newText);
    setMentionOpen(false);
    setTimeout(() => { ta.focus(); const pos = mentionStart + u.name.length + 2; ta.setSelectionRange(pos, pos); }, 0);
  }

  function addComment() {
    if (!c || !commentText.trim()) return;
    const stamp = nowStamp();
    const text = commentText.trim();
    const newComment = { id: Date.now().toString(), author: currentUserName ?? '主設計師', text, t: stamp };
    const act = { who: currentUserName ?? '主設計師', msg: '新增了留言', t: stamp };
    onUpdate(c.id, { comments: [...comments, newComment], activity: [...(c.activity ?? []), act] });

    void (async () => {
      const notified = new Set<string>();
      const mentionRe = /@([^\s@]+)/g;
      let m: RegExpExecArray | null;
      while ((m = mentionRe.exec(text)) !== null) {
        const mentioned = (propSiteUsers ?? []).find(u => u.name === m![1]);
        if (mentioned && mentioned.uid !== currentUserUid && !notified.has(mentioned.uid)) {
          notified.add(mentioned.uid);
          await createNotification({ uid: mentioned.uid, type: 'mention', cardId: c.id, cardTitle: c.title, from: currentUserName ?? '', message: `${currentUserName} 在「${c.title}」提到了你`, read: false, createdAt: Date.now() });
        }
      }
      for (const uid of [c.requester, c.owner]) {
        if (uid && uid !== currentUserUid && !notified.has(uid)) {
          notified.add(uid);
          await createNotification({ uid, type: 'comment', cardId: c.id, cardTitle: c.title, from: currentUserName ?? '', message: `${currentUserName} 在「${c.title}」留了言`, read: false, createdAt: Date.now() });
        }
      }
    })();

    setCommentText('');
    setMentionOpen(false);
    setBottomTab('comments');
  }

  function saveDesc() {
    if (!c) return;
    onUpdate(c.id, { desc: draftDesc });
    setEditingDesc(false);
  }

  function copyLink() {
    if (!c) return;
    const url = `${window.location.origin}${window.location.pathname}?card=${c.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setMoreOpen(false);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  function openClone() {
    if (!c) return;
    setCloneDraft({ title: `CLONE - ${c.title}`, ownerName: ownerUser?.name ?? '', ownerId: c.owner ?? '', requesterName: c.requester ?? '' });
    setCloneOpen(true);
    setMoreOpen(false);
  }

  function handleClone() {
    if (!c || !cloneDraft.title.trim()) return;
    onClone?.({ title: cloneDraft.title.trim(), owner: cloneDraft.ownerId || c.owner, requester: cloneDraft.requesterName || undefined });
    setCloneOpen(false);
  }

  const todayMMDD = (() => {
    const n = new Date();
    return `${String(n.getMonth() + 1).padStart(2, '0')}/${String(n.getDate()).padStart(2, '0')}`;
  })();

  function fmtLogDate(mmdd: string, cardMonth: string): string {
    if (!mmdd) return '—';
    const [year] = cardMonth.split('/');
    const [mm, dd] = mmdd.split('/');
    return `${year}/${parseInt(mm)}/${parseInt(dd)}`;
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 90, pointerEvents: 'none', overflow: 'hidden' }}>
      <div className={`drawer-scrim${isOpen ? ' open' : ''}`} style={{ position: 'absolute' }} onClick={onClose} />
      <div className={`drawer${isOpen ? ' open' : ''}`} style={{ position: 'absolute', pointerEvents: isOpen ? 'auto' : 'none' }} role="dialog" aria-modal="true">
        {c && (
          <>
            <div className="drawer-h" style={{ alignItems: 'center' }}>
              <div className="drawer-h-id">{c.id}</div>
              <span style={{ flex: 1 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {copied && <span style={{ fontSize: 12, color: 'var(--md-sys-color-primary)', fontWeight: 500 }}>已複製 ✓</span>}
                {!readOnly && (
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <button className="drawer-close" onClick={() => setMoreOpen(o => !o)} title="更多">
                      <MoreHorizontal size={16} />
                    </button>
                    {moreOpen && (
                      <>
                        <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setMoreOpen(false)} />
                        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 100, background: 'var(--md-sys-color-surface)', border: '1px solid var(--md-sys-color-outline)', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,.12)', minWidth: 140, overflow: 'hidden' }}>
                          {[
                            { label: '複製連結', action: copyLink },
                            { label: '複製任務', action: openClone },
                          ].map(item => (
                            <button key={item.label} onClick={item.action}
                              style={{ display: 'block', width: '100%', background: 'none', border: 'none', padding: '9px 14px', fontSize: 14, textAlign: 'left', cursor: 'pointer', color: 'var(--md-sys-color-on-surface)' }}
                              onMouseEnter={e => (e.currentTarget.style.background = 'var(--md-sys-color-surface-variant)')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                              {item.label}
                            </button>
                          ))}
                          {onDelete && (
                            <>
                              <div style={{ height: 1, background: 'var(--md-sys-color-outline-variant)', margin: '3px 0' }} />
                              <button onClick={() => { setConfirmDelete(true); setMoreOpen(false); }}
                                style={{ display: 'block', width: '100%', background: 'none', border: 'none', padding: '9px 14px', fontSize: 14, textAlign: 'left', cursor: 'pointer', color: 'var(--st-block)' }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'var(--md-sys-color-surface-variant)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                                刪除
                              </button>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
                <button className="drawer-close" onClick={onClose} aria-label="關閉"><X size={16} /></button>
              </div>
            </div>

            <div className="drawer-body">
              {/* Title + Status */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {!readOnly && editingTitle ? (
                    <Input
                      autoFocus
                      style={{ width: '100%', fontSize: 16, fontWeight: 700, padding: '3px 6px' }}
                      value={draftTitle}
                      onChange={e => setDraftTitle((e.target as HTMLInputElement).value)}
                      onKeyDown={(e: React.KeyboardEvent) => {
                        if (e.key === 'Enter') { onUpdate(c.id, { title: draftTitle.trim() || c.title }); setEditingTitle(false); }
                        if (e.key === 'Escape') setEditingTitle(false);
                      }}
                      onBlur={() => { onUpdate(c.id, { title: draftTitle.trim() || c.title }); setEditingTitle(false); }}
                    />
                  ) : (
                    <div
                      className="drawer-h-title"
                      style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.4, cursor: readOnly ? 'default' : 'text', wordBreak: 'break-word' }}
                      onClick={() => { if (!readOnly) { setDraftTitle(c.title); setEditingTitle(true); } }}
                    >
                      {c.title}
                    </div>
                  )}
                </div>
                <Input as="select" value={c.status} disabled={readOnly || !canEdit}
                  style={{ flexShrink: 0, width: 'auto' }}
                  onChange={e => onUpdate(c.id, { status: (e.target as HTMLSelectElement).value as Card['status'] })}>
                  {STATUSES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </Input>
              </div>

              {/* Meta fields */}
              <dl className="drawer-meta">
                <dt>到期日</dt>
                <dd>
                  {readOnly ? (
                    <span className="mono tnum" style={{ fontSize: 14 }}>{c.due || '—'}</span>
                  ) : (
                    <Input type="date" value={toDateInput(c.due, c.month)}
                      onChange={e => onUpdate(c.id, { due: fromDateInput((e.target as HTMLInputElement).value) })} />
                  )}
                </dd>

                <dt>類型</dt>
                <dd>
                  <span
                    className="kcard-cat"
                    data-cat={c.cat}
                    style={{ cursor: readOnly ? 'default' : 'pointer' }}
                    onClick={() => {
                      if (!readOnly) onUpdate(c.id, { cat: c.cat === 'UIUX' ? '平面視覺' : 'UIUX' });
                    }}
                    title={readOnly ? undefined : '點擊切換類型'}
                  >
                    {c.cat}
                  </span>
                </dd>

                <dt>需求發起單位</dt>
                <dd>
                  {readOnly ? (DEPT_SHORT[c.dept] || c.dept) : (
                    <Input as="select" value={c.dept} onChange={e => onUpdate(c.id, { dept: (e.target as HTMLSelectElement).value })}>
                      {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </Input>
                  )}
                </dd>

                <dt>委託人</dt>
                <dd>
                  {readOnly ? (
                    (() => {
                      const u = ALL_USERS.find(u => u.name === c.requester);
                      return u ? <MemberCell photo={u.photo} name={u.name} initial={u.initial} color={hue(u.hue)} /> : (c.requester || '—');
                    })()
                  ) : (
                    <MemberPicker value={c.requester || ''} users={ALL_USERS} onChange={(name) => onUpdate(c.id, { requester: name })} placeholder="開單人" />
                  )}
                </dd>

                <dt>優先級</dt>
                <dd>
                  {readOnly ? ({ high: '高', normal: '中', low: '低' }[c.prio] || c.prio) : (
                    <Input as="select" value={c.prio} onChange={e => onUpdate(c.id, { prio: (e.target as HTMLSelectElement).value as Card['prio'] })}>
                      <option value="high">高</option>
                      <option value="normal">中</option>
                      <option value="low">低</option>
                    </Input>
                  )}
                </dd>

                <dt>建立時間</dt>
                <dd><span className="mono tnum" style={{ fontSize: 14 }}>{c.createdAt ?? c.month ?? '—'}</span></dd>
              </dl>

              {/* Description */}
              <div className="drawer-section">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <h4 style={{ margin: 0 }}>說明</h4>
                  {!readOnly && !editingDesc && (
                    <Button variant="ghost" style={{ fontSize: 13, padding: '2px 8px' }}
                      onClick={() => { setDraftDesc(c.desc || ''); setEditingDesc(true); }}>編輯</Button>
                  )}
                  {!readOnly && editingDesc && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Button variant="ghost" style={{ fontSize: 13, padding: '2px 8px' }} onClick={() => setEditingDesc(false)}>取消</Button>
                      <Button variant="primary" style={{ fontSize: 13, padding: '2px 10px' }} onClick={saveDesc}>儲存</Button>
                    </div>
                  )}
                </div>
                {editingDesc ? (
                  <RichTextEditor value={draftDesc} onChange={setDraftDesc} minHeight={200} />
                ) : (
                  c.desc
                    ? <div className="prose-content" dangerouslySetInnerHTML={{ __html: c.desc }} />
                    : <p style={{ fontSize: 14, color: 'var(--md-sys-color-on-surface-muted)', margin: 0 }}>尚無說明</p>
                )}
              </div>

              {/* Assignee */}
              <div className="drawer-section">
                <h4>受託人</h4>
                {readOnly ? (
                  ownerUser ? <MemberCell photo={ownerUser.photo} name={ownerUser.name} initial={ownerUser.initial} color={hue(ownerUser.hue)} /> : <span style={{ fontSize: 14, color: 'var(--md-sys-color-on-surface-muted)' }}>—</span>
                ) : (
                  <MemberPicker value={ownerUser?.name ?? ''} users={DESIGNER_USERS}
                    onChange={(name, id) => {
                      const stamp = nowStamp();
                      const msg = id ? `指派「${name}」為受託人` : '移除受託人';
                      const act = { who: currentUserName ?? '', msg, t: stamp };
                      onUpdate(c.id, { owner: id, activity: [...(c.activity ?? []), act] });
                    }} />
                )}
              </div>

              {/* Hours */}
              <div className="drawer-section">
                <h4>工時</h4>
                <div className="drawer-hours">
                  <div className="cell">
                    <div className="lbl">原始預估</div>
                    {(readOnly || !canEdit) ? <div className="val">{c.est}</div> : (
                      <input type="number" min={0} className="val"
                        value={c.est} onChange={e => onUpdate(c.id, { est: Math.max(0, Number(e.target.value)) })} />
                    )}
                    <div className="delta">小時</div>
                  </div>
                  <div className="cell" style={{ cursor: (readOnly || !canEdit) ? 'default' : 'pointer', position: 'relative' }}
                    onClick={() => { if (!readOnly && canEdit) { setNewLog({ date: todayMMDD, time: roundToHalfHour(), hours: 0, note: '' }); setLogKey(k => k + 1); setLogModal(true); } }}>
                    <div className="lbl" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      實際消耗
                      {(!readOnly && canEdit) && <Clock size={10} style={{ color: 'var(--md-sys-color-primary)', opacity: 0.7 }} />}
                    </div>
                    <div className="val" style={isOver ? { color: 'var(--st-block)' } : {}}>{computedActual}</div>
                    <div className={`delta${isOver ? ' over' : ' under'}`}>
                      {isOver ? `超出 ${computedActual - c.est}h` : c.est > 0 ? `剩餘 ${c.est - computedActual}h` : canEdit ? '點擊記錄工時' : '—'}
                    </div>
                    {(!readOnly && canEdit) && (
                      <div style={{ position: 'absolute', bottom: 8, right: 10, fontSize: 12, color: 'var(--md-sys-color-primary)', fontWeight: 600 }}>
                        + 記錄
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom tabs */}
              <div className="drawer-section" style={{ paddingBottom: 0 }}>
                <div style={{ display: 'flex', borderBottom: '1px solid var(--md-sys-color-outline-variant)', marginBottom: 12 }}>
                  <button style={tabStyle(bottomTab === 'activity')} onClick={() => setBottomTab('activity')}>活動</button>
                  <button style={tabStyle(bottomTab === 'comments')} onClick={() => setBottomTab('comments')}>
                    留言{comments.length > 0 && <span style={{ marginLeft: 4, fontSize: 12, color: 'var(--md-sys-color-on-surface-muted)' }}>({comments.length})</span>}
                  </button>
                  <button style={tabStyle(bottomTab === 'timelogs')} onClick={() => setBottomTab('timelogs')}>
                    工作時間{timeLogs.length > 0 && <span style={{ marginLeft: 4, fontSize: 12, color: 'var(--md-sys-color-on-surface-muted)' }}>({timeLogs.length})</span>}
                  </button>
                </div>

                {bottomTab === 'activity' && (
                  c.activity && c.activity.length > 0 ? (
                    <div className="timeline">
                      {[...c.activity].reverse().map((entry, i) => (
                        <div key={i} className="tl-row">
                          <div className="tl-dot" />
                          <div className="tl-content">
                            <div className="tl-msg"><strong>{entry.who}</strong> {entry.msg}</div>
                            <div className="tl-time mono">{entry.t}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : <div style={{ fontSize: 12, color: 'var(--md-sys-color-on-surface-muted)', padding: '4px 0 12px' }}>尚無活動記錄</div>
                )}

                {bottomTab === 'comments' && (
                  <div>
                    {comments.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
                        {[...comments].reverse().map(cm => {
                          const isEditing = editingCommentId === cm.id;
                          const canEditThis = canEdit && cm.author === currentUserName;
                          return (
                            <div key={cm.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                              <div className="av av-sm" style={{ background: 'var(--md-sys-color-primary)', flexShrink: 0 }}>{cm.author[0]}</div>
                              <div style={{ flex: 1, background: 'var(--md-sys-color-surface-variant)', borderRadius: 8, padding: '8px 12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                  <span style={{ fontSize: 14, fontWeight: 600 }}>{cm.author}</span>
                                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                    <span style={{ fontSize: 12, color: 'var(--md-sys-color-on-surface-muted)' }}>{cm.t}</span>
                                    {canEditThis && !isEditing && (
                                      <button
                                        onClick={() => { setEditingCommentId(cm.id); setEditCommentDraft(cm.text); }}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--md-sys-color-on-surface-muted)', padding: 2, display: 'flex', borderRadius: 4 }}
                                        title="編輯留言"
                                      >
                                        <Pencil size={12} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                                {isEditing ? (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <textarea
                                      className="ui-input"
                                      style={{ width: '100%', minHeight: 72, resize: 'vertical', fontFamily: 'inherit', fontSize: 14 }}
                                      value={editCommentDraft}
                                      onChange={e => setEditCommentDraft(e.target.value)}
                                      autoFocus
                                    />
                                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                      <Button variant="ghost" style={{ fontSize: 13 }} onClick={() => setEditingCommentId(null)}>取消</Button>
                                      <Button variant="primary" style={{ fontSize: 13 }} disabled={!editCommentDraft.trim()}
                                        onClick={() => {
                                          if (!c || !editCommentDraft.trim()) return;
                                          const updated = comments.map(x => x.id === cm.id ? { ...x, text: editCommentDraft.trim() } : x);
                                          onUpdate(c.id, { comments: updated });
                                          setEditingCommentId(null);
                                        }}
                                      >
                                        <Check size={13} /> 儲存
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div style={{ fontSize: 14, color: 'var(--md-sys-color-on-surface)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{renderWithLinks(cm.text)}</div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : <div style={{ fontSize: 12, color: 'var(--md-sys-color-on-surface-muted)', padding: '4px 0 12px' }}>尚無留言</div>}
                    {!readOnly && (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                          {mentionOpen && (() => {
                            const candidates = (propSiteUsers ?? [])
                              .filter(u => u.uid !== currentUserUid && u.name.toLowerCase().includes(mentionFilter.toLowerCase()))
                              .slice(0, 6);
                            return candidates.length > 0 ? (
                              <div style={{
                                position: 'absolute', bottom: 'calc(100% + 4px)', left: 0, right: 0,
                                background: 'var(--md-sys-color-surface)', border: '1px solid var(--md-sys-color-outline)',
                                borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.12)', zIndex: 50, overflow: 'hidden',
                              }}>
                                {candidates.map(u => (
                                  <button key={u.uid} type="button"
                                    onMouseDown={e => { e.preventDefault(); insertMention(u); }}
                                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 12px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, textAlign: 'left' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--md-sys-color-surface-variant)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                                  >
                                    {u.photo
                                      ? <img src={u.photo} alt={u.name} className="av av-sm" style={{ objectFit: 'cover' }} />
                                      : <span className="av av-sm" style={{ background: hue(u.hue ?? 1), fontSize: 11 }}>{u.initial ?? u.name[0]}</span>}
                                    <span>{u.name}</span>
                                  </button>
                                ))}
                              </div>
                            ) : null;
                          })()}
                          <textarea
                            ref={commentRef}
                            className="ui-input"
                            placeholder="新增留言… 輸入 @ 提及成員"
                            style={{ width: '100%', minHeight: 64, resize: 'vertical', fontFamily: 'inherit', fontSize: 14 }}
                            value={commentText}
                            onChange={handleCommentChange}
                            onKeyDown={e => {
                              if (e.key === 'Escape') setMentionOpen(false);
                              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) addComment();
                            }}
                          />
                        </div>
                        <Button variant="primary" style={{ flexShrink: 0 }} onClick={addComment} disabled={!commentText.trim()}>送出</Button>
                      </div>
                    )}
                  </div>
                )}

                {bottomTab === 'timelogs' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 4 }}>
                    {timeLogs.length === 0 && (
                      <div style={{ fontSize: 12, color: 'var(--md-sys-color-on-surface-muted)', padding: '4px 0 10px' }}>
                        {canEdit ? '尚無工時記錄，點擊實際消耗卡片新增' : '尚無工時記錄'}
                      </div>
                    )}
                    {[...timeLogs].reverse().map(l => {
                      return editingLogId === l.id ? (
                        <div key={l.id} style={{ background: 'var(--md-sys-color-surface-variant)', border: '1px solid var(--md-sys-color-outline)', borderRadius: 10, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <div style={{ flex: '1 1 130px' }}>
                              <div style={{ fontSize: 12, color: 'var(--md-sys-color-on-surface-muted)', marginBottom: 4 }}>日期</div>
                              <Input type="date" style={{ width: '100%' }}
                                value={toDateInput(editLogDraft.date || l.date, c.month)}
                                onChange={e => setEditLogDraft(d => ({ ...d, date: fromDateInput((e.target as HTMLInputElement).value) }))} />
                            </div>
                            <div style={{ flex: '1 1 100px' }}>
                              <div style={{ fontSize: 12, color: 'var(--md-sys-color-on-surface-muted)', marginBottom: 4 }}>開始時間</div>
                              <Input as="select" style={{ width: '100%' }}
                                value={editLogDraft.time || l.time || roundToHalfHour()}
                                onChange={e => setEditLogDraft(d => ({ ...d, time: (e.target as HTMLSelectElement).value }))}>
                                {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                              </Input>
                            </div>
                            <div style={{ flex: '0 1 80px' }}>
                              <div style={{ fontSize: 12, color: 'var(--md-sys-color-on-surface-muted)', marginBottom: 4 }}>工時（小時）</div>
                              <Input type="number" style={{ width: '100%' }} min={0.5} step={0.5}
                                value={editLogDraft.hours}
                                onChange={e => setEditLogDraft(d => ({ ...d, hours: Number((e.target as HTMLInputElement).value) }))} />
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: 12, color: 'var(--md-sys-color-on-surface-muted)', marginBottom: 4 }}>工作內容</div>
                            <RichTextEditor value={editLogDraft.note} onChange={v => setEditLogDraft(d => ({ ...d, note: v }))} minHeight={72} maxHeight={200} />
                          </div>
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <Button variant="ghost" style={{ fontSize: 13 }} onClick={() => setEditingLogId(null)}>取消</Button>
                            <Button variant="primary" style={{ fontSize: 13 }} onClick={() => saveLogEdit(l.id)}>儲存</Button>
                          </div>
                        </div>
                      ) : (
                        <div key={l.id} style={{ background: 'var(--md-sys-color-surface-variant)', border: '1px solid var(--md-sys-color-outline)', borderRadius: 10, padding: '12px 14px' }}>
                          <div style={{ marginBottom: l.note ? 6 : 0, fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-mono), monospace' }}>
                            {fmtLogDate(l.date, c.month)}
                            {l.time && <span style={{ marginLeft: 6 }}>{l.time}</span>}
                            <span style={{ marginLeft: 8, color: 'var(--md-sys-color-primary)' }}>紀錄 {l.hours}H</span>
                          </div>
                          {l.note && (
                            <div className="prose-content" dangerouslySetInnerHTML={{ __html: l.note }} />
                          )}
                          {(!readOnly && canEdit) && (
                            <div style={{ display: 'flex', gap: 10, marginTop: 8, marginLeft: -8 }}>
                              <Button variant="ghost" style={{ fontSize: 13, padding: '2px 8px' }}
                                onClick={() => { setEditingLogId(l.id); setEditLogDraft({ date: l.date, time: l.time || roundToHalfHour(), hours: l.hours, note: l.note }); }}>
                                編輯
                              </Button>
                              <Button variant="ghost" style={{ fontSize: 13, padding: '2px 8px', color: 'var(--st-block)' }}
                                onClick={() => removeLog(l.id)}>
                                刪除
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Confirm delete overlay */}
            {confirmDelete && onDelete && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'inherit' }}>
                <div style={{ background: 'var(--md-sys-color-surface)', borderRadius: 12, padding: '20px 24px', width: 300, boxShadow: '0 12px 40px rgba(0,0,0,.2)', textAlign: 'center' }}>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>確定刪除這張卡片？</div>
                  <div style={{ fontSize: 13, color: 'var(--md-sys-color-on-surface-muted)', marginBottom: 20 }}>此操作無法復原</div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    <Button variant="ghost" onClick={() => setConfirmDelete(false)}>取消</Button>
                    <button style={{ background: 'var(--st-block)', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 16px', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}
                      onClick={() => { onDelete(c.id); onClose(); }}>確定刪除</button>
                  </div>
                </div>
              </div>
            )}

            {/* Clone overlay */}
            {cloneOpen && onClone && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'inherit' }}
                onClick={e => e.target === e.currentTarget && setCloneOpen(false)}>
                <div style={{ background: 'var(--md-sys-color-surface)', borderRadius: 12, padding: '20px 24px', width: 360, boxShadow: '0 12px 40px rgba(0,0,0,.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>複製任務</span>
                    <button onClick={() => setCloneOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--md-sys-color-on-surface-muted)', display: 'flex' }}><X size={15} /></button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--md-sys-color-on-surface-muted)', display: 'block', marginBottom: 4 }}>摘要 <span style={{ color: 'var(--st-block)' }}>*</span></label>
                      <Input style={{ width: '100%' }}
                        value={cloneDraft.title}
                        onChange={e => setCloneDraft(d => ({ ...d, title: (e.target as HTMLInputElement).value }))} />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--md-sys-color-on-surface-muted)', display: 'block', marginBottom: 4 }}>委託人</label>
                      <MemberPicker value={cloneDraft.requesterName} users={ALL_USERS}
                        onChange={(name) => setCloneDraft(d => ({ ...d, requesterName: name }))} />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--md-sys-color-on-surface-muted)', display: 'block', marginBottom: 4 }}>受託人</label>
                      <MemberPicker value={cloneDraft.ownerName} users={DESIGNER_USERS}
                        onChange={(name, id) => setCloneDraft(d => ({ ...d, ownerName: name, ownerId: id }))} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
                    <Button variant="ghost" onClick={() => setCloneOpen(false)}>取消</Button>
                    <Button variant="primary" onClick={handleClone} disabled={!cloneDraft.title.trim()}>複製</Button>
                  </div>
                </div>
              </div>
            )}

            {/* Time log modal */}
            {logModal && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'inherit' }}
                onClick={e => e.target === e.currentTarget && setLogModal(false)}>
                <div style={{ background: 'var(--md-sys-color-surface)', borderRadius: 12, padding: '20px 24px', width: 340, boxShadow: '0 12px 40px rgba(0,0,0,.2)', maxHeight: 'calc(100% - 40px)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>記錄工時</span>
                    <button onClick={() => setLogModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--md-sys-color-on-surface-muted)', display: 'flex' }}><X size={15} /></button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--md-sys-color-on-surface-muted)', display: 'block', marginBottom: 4 }}>日期</label>
                        <Input type="date" style={{ width: '100%' }}
                          value={toDateInput(newLog.date, c.month)}
                          onChange={e => setNewLog(l => ({ ...l, date: fromDateInput((e.target as HTMLInputElement).value) }))} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--md-sys-color-on-surface-muted)', display: 'block', marginBottom: 4 }}>開始時間</label>
                        <Input as="select" style={{ width: '100%' }}
                          value={newLog.time || '09:00'}
                          onChange={e => setNewLog(l => ({ ...l, time: (e.target as HTMLSelectElement).value }))}>
                          {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                        </Input>
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
                        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--md-sys-color-on-surface-muted)' }}>工時（小時）</label>
                        {c.est > 0 && (
                          <span style={{ fontSize: 12, color: (computedActual + (newLog.hours || 0)) >= c.est ? 'var(--st-block)' : 'var(--md-sys-color-on-surface-muted)' }}>
                            剩餘 {c.est - computedActual - (newLog.hours || 0)}h
                          </span>
                        )}
                      </div>
                      <Input type="number" style={{ width: '100%' }} min={0.5} step={0.5} placeholder="例：4"
                        value={newLog.hours || ''}
                        onChange={e => setNewLog(l => ({ ...l, hours: Number((e.target as HTMLInputElement).value) }))} />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--md-sys-color-on-surface-muted)', display: 'block', marginBottom: 4 }}>工作內容（選填）</label>
                      <RichTextEditor key={logKey} value={newLog.note} onChange={v => setNewLog(l => ({ ...l, note: v }))} minHeight={80} maxHeight={200} placeholder="簡述這段時間做了什麼..." />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
                    <Button variant="ghost" onClick={() => setLogModal(false)}>取消</Button>
                    <Button variant="primary" onClick={submitLog} disabled={!newLog.date || !newLog.time || newLog.hours <= 0}>新增記錄</Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
