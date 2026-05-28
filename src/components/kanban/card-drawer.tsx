'use client';
import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Clock, MoreHorizontal } from 'lucide-react';
import type { Card, TimeLog, Comment } from '@/lib/types';
import { STATUSES, MEMBERS, MEMBER_BY_ID, DEPTS, DEPT_SHORT, SITE_USERS, SiteUser } from '@/lib/data';
import { hue, sum } from '@/lib/utils';

interface CardDrawerProps {
  card: Card | null;
  onClose: () => void;
  onUpdate: (id: string, patch: Partial<Card>) => void;
  onDelete?: (id: string) => void;
  onClone?: (override: { title: string; owner: string; requester?: string }) => void;
  readOnly?: boolean;   // full lock (history preview)
  canEdit?: boolean;    // 成員/Admin: can change status + log time (default true)
  currentUserName?: string;
}

const URL_RE = /(https?:\/\/[^\s]+)/g;
function renderWithLinks(text: string) {
  return text.split(URL_RE).map((part, i) =>
    URL_RE.test(part)
      ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', wordBreak: 'break-all' }}>{part}</a>
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

type AnyUser = { id: string; name: string; initial: string; hue: number; sub?: string };
function toAnyUser(m: typeof MEMBERS[0]): AnyUser { return { id: m.id, name: m.name, initial: m.initial, hue: m.hue, sub: m.cat }; }
function siteToAnyUser(u: SiteUser): AnyUser { return { id: u.id, name: u.name, initial: u.initial, hue: u.hue, sub: u.dept }; }

function MemberPicker({ value, onChange, users, placeholder = '— 未指定 —' }: {
  value: string; onChange: (name: string) => void; users: AnyUser[]; placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const selected = users.find(u => u.name === value) ?? null;
  const filtered = q.trim() ? users.filter(u => u.name.includes(q) || (u.sub ?? '').includes(q)) : users;
  function pick(u: AnyUser) { onChange(u.name); setOpen(false); setQ(''); }
  function clear() { onChange(''); setOpen(false); setQ(''); }
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => { setOpen(o => !o); setQ(''); }}
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontSize: 14 }}>
        {selected ? (
          <>
            <div className="av av-sm" style={{ background: hue(selected.hue) }}>{selected.initial}</div>
            <span style={{ fontWeight: 500 }}>{selected.name}</span>
          </>
        ) : <span style={{ color: 'var(--muted)' }}>{placeholder}</span>}
        <span style={{ marginLeft: 4, color: 'var(--muted)', fontSize: 12 }}>▾</span>
      </button>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => { setOpen(false); setQ(''); }} />
          <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 100, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,.12)', minWidth: 240, overflow: 'hidden' }}>
            <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--divider)' }}>
              <input autoFocus className="input" placeholder="搜尋..." style={{ width: '100%', fontSize: 14 }}
                value={q} onChange={e => setQ(e.target.value)} />
            </div>
            <div style={{ maxHeight: 240, overflowY: 'auto' }}>
              <button onClick={clear} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: 'none', border: 'none', padding: '8px 12px', cursor: 'pointer', fontSize: 14, color: 'var(--muted)' }}>— 未指定 —</button>
              {filtered.map(u => (
                <button key={u.id} onClick={() => pick(u)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', border: 'none', padding: '8px 12px', cursor: 'pointer', fontSize: 14, textAlign: 'left', background: value === u.name ? 'var(--accent-soft)' : 'none' }}>
                  <div className="av av-sm" style={{ background: hue(u.hue) }}>{u.initial}</div>
                  <span style={{ fontWeight: 500 }}>{u.name}</span>
                </button>
              ))}
              {filtered.length === 0 && <div style={{ padding: '10px 12px', fontSize: 12, color: 'var(--muted)' }}>無符合結果</div>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const DESIGNER_USERS = MEMBERS.map(toAnyUser);
const ALL_USERS = SITE_USERS.map(siteToAnyUser);

const tabStyle = (active: boolean): React.CSSProperties => ({
  appearance: 'none', border: 'none', background: 'none', cursor: 'pointer',
  padding: '8px 14px', fontSize: 14, fontFamily: 'inherit',
  fontWeight: active ? 600 : 400,
  color: active ? 'var(--ink)' : 'var(--muted)',
  borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
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

export default function CardDrawer({ card, onClose, onUpdate, onDelete, onClone, readOnly, canEdit = true, currentUserName }: CardDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [displayCard, setDisplayCard] = useState<Card | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [cloneOpen, setCloneOpen] = useState(false);
  const [cloneDraft, setCloneDraft] = useState({ title: '', ownerName: '', requesterName: '' });
  const [bottomTab, setBottomTab] = useState<BottomTab>('activity');
  const [editingTitle, setEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [editingDesc, setEditingDesc] = useState(false);
  const [draftDesc, setDraftDesc] = useState('');
  const [commentText, setCommentText] = useState('');

  // Time log modal state
  const [logModal, setLogModal] = useState(false);
  const [newLog, setNewLog] = useState(EMPTY_LOG);

  // Inline edit for time log entries in tab
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
  const owner = c ? MEMBER_BY_ID[c.owner] : null;
  const timeLogs: TimeLog[] = c?.timeLogs ?? [];
  const comments: Comment[] = c?.comments ?? [];
  const computedActual = timeLogs.length > 0 ? sum(timeLogs.map(l => l.hours)) : (c?.actual ?? 0);
  const isOver = c ? computedActual > c.est : false;

  function nowStamp(): string {
    const n = new Date();
    const p = (x: number) => String(x).padStart(2, '0');
    return `${p(n.getMonth() + 1)}/${p(n.getDate())} ${p(n.getHours())}:${p(n.getMinutes())}`;
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
    const updated = timeLogs.map(l => l.id === id ? { ...l, date: editLogDraft.date || l.date, time: editLogDraft.time || undefined, hours: editLogDraft.hours || l.hours, note: editLogDraft.note } : l);
    onUpdate(c.id, { timeLogs: updated, actual: sum(updated.map(l => l.hours)) });
    setEditingLogId(null);
  }

  function addComment() {
    if (!c || !commentText.trim()) return;
    const stamp = nowStamp();
    const mmdd = stamp.slice(0, 5);
    const newComment = { id: Date.now().toString(), author: currentUserName ?? '主設計師', text: commentText.trim(), t: mmdd };
    const act = { who: currentUserName ?? '主設計師', msg: '新增了留言', t: stamp };
    onUpdate(c.id, { comments: [...comments, newComment], activity: [...(c.activity ?? []), act] });
    setCommentText('');
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
    const ownerMember = MEMBER_BY_ID[c.owner];
    setCloneDraft({ title: `CLONE - ${c.title}`, ownerName: ownerMember?.name ?? '', requesterName: c.requester ?? '' });
    setCloneOpen(true);
    setMoreOpen(false);
  }

  function handleClone() {
    if (!c || !cloneDraft.title.trim()) return;
    const ownerMember = MEMBERS.find(m => m.name === cloneDraft.ownerName);
    onClone?.({ title: cloneDraft.title.trim(), owner: ownerMember?.id ?? c.owner, requester: cloneDraft.requesterName || undefined });
    setCloneOpen(false);
  }

  // Today as MM/DD for default log date
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
    <>
      <div className={`drawer-scrim${isOpen ? ' open' : ''}`} onClick={onClose} />
      <div className={`drawer${isOpen ? ' open' : ''}`} role="dialog" aria-modal="true">
        {c && (
          <>
            <div className="drawer-h" style={{ alignItems: 'center' }}>
              <div className="drawer-h-id">{c.id}</div>
              <span style={{ flex: 1 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {copied && <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 500 }}>已複製 ✓</span>}
                {!readOnly && (
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <button className="drawer-close" onClick={() => setMoreOpen(o => !o)} title="更多">
                      <MoreHorizontal size={16} />
                    </button>
                    {moreOpen && (
                      <>
                        <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setMoreOpen(false)} />
                        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 100, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,.12)', minWidth: 140, overflow: 'hidden' }}>
                          {[
                            { label: '複製連結', action: copyLink },
                            { label: '複製任務', action: openClone },
                          ].map(item => (
                            <button key={item.label} onClick={item.action}
                              style={{ display: 'block', width: '100%', background: 'none', border: 'none', padding: '9px 14px', fontSize: 14, textAlign: 'left', cursor: 'pointer', color: 'var(--ink)' }}
                              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                              {item.label}
                            </button>
                          ))}
                          {onDelete && (
                            <>
                              <div style={{ height: 1, background: 'var(--divider)', margin: '3px 0' }} />
                              <button onClick={() => { setConfirmDelete(true); setMoreOpen(false); }}
                                style={{ display: 'block', width: '100%', background: 'none', border: 'none', padding: '9px 14px', fontSize: 14, textAlign: 'left', cursor: 'pointer', color: 'var(--st-block)' }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
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
              {/* Title */}
              {/* Title row + Status */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {!readOnly && editingTitle ? (
                    <input
                      autoFocus
                      className="input"
                      style={{ width: '100%', fontSize: 16, fontWeight: 700, padding: '3px 6px' }}
                      value={draftTitle}
                      onChange={e => setDraftTitle(e.target.value)}
                      onKeyDown={e => {
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
                <select className="input" value={c.status} disabled={readOnly || !canEdit}
                  style={{ flexShrink: 0 }}
                  onChange={e => onUpdate(c.id, { status: e.target.value as Card['status'] })}>
                  {STATUSES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              {/* Meta fields */}
              <dl className="drawer-meta">
                <dt>到期日</dt>
                <dd>
                  {readOnly ? (
                    <span className="mono tnum" style={{ fontSize: 14 }}>{c.due || '—'}</span>
                  ) : (
                    <input type="date" className="input" value={toDateInput(c.due, c.month)}
                      onChange={e => onUpdate(c.id, { due: fromDateInput(e.target.value) })} />
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
                    <select className="input" value={c.dept} onChange={e => onUpdate(c.id, { dept: e.target.value })}>
                      {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  )}
                </dd>

                <dt>委託人</dt>
                <dd>
                  {readOnly ? (
                    (() => {
                      const u = ALL_USERS.find(u => u.name === c.requester);
                      return u ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="av av-sm" style={{ background: hue(u.hue) }}>{u.initial}</div>
                          <span>{u.name}</span>
                        </div>
                      ) : (c.requester || '—');
                    })()
                  ) : (
                    <MemberPicker value={c.requester || ''} users={ALL_USERS} onChange={name => onUpdate(c.id, { requester: name })} placeholder="開單人" />
                  )}
                </dd>

                <dt>受託人</dt>
                <dd>
                  {readOnly ? (
                    owner ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="av av-sm" style={{ background: hue(owner.hue) }}>{owner.initial}</div>
                        <span>{owner.name}</span>
                      </div>
                    ) : <span style={{ color: 'var(--muted)' }}>—</span>
                  ) : (
                    <MemberPicker value={owner?.name ?? ''} users={DESIGNER_USERS}
                      onChange={name => { const m = MEMBERS.find(m => m.name === name); onUpdate(c.id, { owner: m?.id ?? '' }); }} />
                  )}
                </dd>

                <dt>優先級</dt>
                <dd>
                  {readOnly ? ({ high: '高', normal: '中', low: '低' }[c.prio] || c.prio) : (
                    <select className="input" value={c.prio} onChange={e => onUpdate(c.id, { prio: e.target.value as Card['prio'] })}>
                      <option value="high">高</option>
                      <option value="normal">中</option>
                      <option value="low">低</option>
                    </select>
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
                    <button className="btn btn-ghost" style={{ fontSize: 13, padding: '2px 8px' }}
                      onClick={() => { setDraftDesc(c.desc || ''); setEditingDesc(true); }}>編輯</button>
                  )}
                  {!readOnly && editingDesc && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost" style={{ fontSize: 13, padding: '2px 8px' }} onClick={() => setEditingDesc(false)}>取消</button>
                      <button className="btn btn-primary" style={{ fontSize: 13, padding: '2px 10px' }} onClick={saveDesc}>儲存</button>
                    </div>
                  )}
                </div>
                {editingDesc ? (
                  <textarea className="input" style={{ width: '100%', minHeight: 200, resize: 'vertical', fontFamily: 'inherit', fontSize: 14, lineHeight: 1.6 }}
                    value={draftDesc} onChange={e => setDraftDesc(e.target.value)} />
                ) : (
                  <p style={{ fontSize: 14, color: c.desc ? 'var(--ink-2)' : 'var(--muted)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                    {c.desc ? renderWithLinks(c.desc) : '尚無說明'}
                  </p>
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
                    onClick={() => { if (!readOnly && canEdit) { setNewLog({ date: todayMMDD, time: roundToHalfHour(), hours: 0, note: '' }); setLogModal(true); } }}>
                    <div className="lbl" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      實際消耗
                      {(!readOnly && canEdit) && <Clock size={10} style={{ color: 'var(--accent)', opacity: 0.7 }} />}
                    </div>
                    <div className="val" style={isOver ? { color: 'var(--st-block)' } : {}}>{computedActual}</div>
                    <div className={`delta${isOver ? ' over' : ' under'}`}>
                      {isOver ? `超出 ${computedActual - c.est}h` : c.est > 0 ? `剩餘 ${c.est - computedActual}h` : canEdit ? '點擊記錄工時' : '—'}
                    </div>
                    {(!readOnly && canEdit) && (
                      <div style={{ position: 'absolute', bottom: 8, right: 10, fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>
                        + 記錄
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom tabs */}
              <div className="drawer-section" style={{ paddingBottom: 0 }}>
                <div style={{ display: 'flex', borderBottom: '1px solid var(--divider)', marginBottom: 12 }}>
                  <button style={tabStyle(bottomTab === 'activity')} onClick={() => setBottomTab('activity')}>活動</button>
                  <button style={tabStyle(bottomTab === 'comments')} onClick={() => setBottomTab('comments')}>
                    留言{comments.length > 0 && <span style={{ marginLeft: 4, fontSize: 12, color: 'var(--muted)' }}>({comments.length})</span>}
                  </button>
                  <button style={tabStyle(bottomTab === 'timelogs')} onClick={() => setBottomTab('timelogs')}>
                    工作時間{timeLogs.length > 0 && <span style={{ marginLeft: 4, fontSize: 12, color: 'var(--muted)' }}>({timeLogs.length})</span>}
                  </button>
                </div>

                {bottomTab === 'activity' && (
                  c.activity && c.activity.length > 0 ? (
                    <div className="timeline">
                      {c.activity.map((entry, i) => (
                        <div key={i} className="tl-row">
                          <div className="tl-dot" />
                          <div className="tl-msg"><strong>{entry.who}</strong> {entry.msg}</div>
                          <div className="tl-time mono">{entry.t}</div>
                        </div>
                      ))}
                    </div>
                  ) : <div style={{ fontSize: 12, color: 'var(--muted)', padding: '4px 0 12px' }}>尚無活動記錄</div>
                )}

                {bottomTab === 'comments' && (
                  <div>
                    {comments.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
                        {comments.map(cm => (
                          <div key={cm.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                            <div className="av av-sm" style={{ background: 'var(--accent)', flexShrink: 0 }}>{cm.author[0]}</div>
                            <div style={{ flex: 1, background: 'var(--surface-2)', borderRadius: 8, padding: '8px 12px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span style={{ fontSize: 14, fontWeight: 600 }}>{cm.author}</span>
                                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{cm.t}</span>
                              </div>
                              <div style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{renderWithLinks(cm.text)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : <div style={{ fontSize: 12, color: 'var(--muted)', padding: '4px 0 12px' }}>尚無留言</div>}
                    {!readOnly && (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                        <textarea className="input" placeholder="新增留言..." style={{ flex: 1, minHeight: 64, resize: 'vertical', fontFamily: 'inherit', fontSize: 14 }}
                          value={commentText} onChange={e => setCommentText(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) addComment(); }} />
                        <button className="btn btn-primary" style={{ flexShrink: 0 }} onClick={addComment} disabled={!commentText.trim()}>送出</button>
                      </div>
                    )}
                  </div>
                )}

                {bottomTab === 'timelogs' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 4 }}>
                    {timeLogs.length === 0 && (
                      <div style={{ fontSize: 12, color: 'var(--muted)', padding: '4px 0 10px' }}>
                        {canEdit ? '尚無工時記錄，點擊實際消耗卡片新增' : '尚無工時記錄'}
                      </div>
                    )}
                    {timeLogs.map(l => {
                      return editingLogId === l.id ? (
                        <div key={l.id} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <div style={{ flex: '1 1 130px' }}>
                              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>日期</div>
                              <input type="date" className="input" style={{ width: '100%' }}
                                value={toDateInput(editLogDraft.date || l.date, c.month)}
                                onChange={e => setEditLogDraft(d => ({ ...d, date: fromDateInput(e.target.value) }))} />
                            </div>
                            <div style={{ flex: '1 1 100px' }}>
                              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>開始時間</div>
                              <select className="input" style={{ width: '100%' }}
                                value={editLogDraft.time || l.time || roundToHalfHour()}
                                onChange={e => setEditLogDraft(d => ({ ...d, time: e.target.value }))}>
                                {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                            </div>
                            <div style={{ flex: '0 1 80px' }}>
                              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>工時（小時）</div>
                              <input type="number" className="input" style={{ width: '100%' }} min={0.5} step={0.5}
                                value={editLogDraft.hours || l.hours}
                                onChange={e => setEditLogDraft(d => ({ ...d, hours: Number(e.target.value) }))} />
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>工作內容</div>
                            <textarea className="input" style={{ width: '100%', minHeight: 60, resize: 'vertical', fontFamily: 'inherit', fontSize: 14 }}
                              value={editLogDraft.note}
                              onChange={e => setEditLogDraft(d => ({ ...d, note: e.target.value }))} />
                          </div>
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <button className="btn btn-ghost" style={{ fontSize: 13 }} onClick={() => setEditingLogId(null)}>取消</button>
                            <button className="btn btn-primary" style={{ fontSize: 13 }} onClick={() => saveLogEdit(l.id)}>儲存</button>
                          </div>
                        </div>
                      ) : (
                        <div key={l.id} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
                          <div style={{ marginBottom: l.note ? 6 : 0, fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-mono), monospace' }}>
                            {fmtLogDate(l.date, c.month)}
                            {l.time && <span style={{ marginLeft: 6 }}>{l.time}</span>}
                            <span style={{ marginLeft: 8, color: 'var(--accent)' }}>紀錄 {l.hours}H</span>
                          </div>
                          {l.note && (
                            <div style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.5 }}>{l.note}</div>
                          )}
                          {(!readOnly && canEdit) && (
                            <div style={{ display: 'flex', gap: 10, marginTop: 8, marginLeft: -8 }}>
                              <button className="btn btn-ghost" style={{ fontSize: 13, padding: '2px 8px' }}
                                onClick={() => { setEditingLogId(l.id); setEditLogDraft({ date: l.date, time: l.time || roundToHalfHour(), hours: l.hours, note: l.note }); }}>
                                編輯
                              </button>
                              <button className="btn btn-ghost" style={{ fontSize: 13, padding: '2px 8px', color: 'var(--st-block)' }}
                                onClick={() => removeLog(l.id)}>
                                刪除
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Time log modal */}
            {confirmDelete && onDelete && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'inherit' }}>
                <div style={{ background: 'var(--surface)', borderRadius: 12, padding: '20px 24px', width: 300, boxShadow: '0 12px 40px rgba(0,0,0,.2)', textAlign: 'center' }}>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>確定刪除這張卡片？</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>此操作無法復原</div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    <button className="btn btn-ghost" onClick={() => setConfirmDelete(false)}>取消</button>
                    <button className="btn" style={{ background: 'var(--st-block)', color: '#fff', border: 'none' }}
                      onClick={() => { onDelete(c.id); onClose(); }}>確定刪除</button>
                  </div>
                </div>
              </div>
            )}

            {cloneOpen && onClone && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'inherit' }}
                onClick={e => e.target === e.currentTarget && setCloneOpen(false)}>
                <div style={{ background: 'var(--surface)', borderRadius: 12, padding: '20px 24px', width: 360, boxShadow: '0 12px 40px rgba(0,0,0,.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>複製任務</span>
                    <button onClick={() => setCloneOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex' }}><X size={15} /></button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>摘要 <span style={{ color: 'var(--st-block)' }}>*</span></label>
                      <input className="input" style={{ width: '100%' }}
                        value={cloneDraft.title}
                        onChange={e => setCloneDraft(d => ({ ...d, title: e.target.value }))} />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>受託人</label>
                      <MemberPicker value={cloneDraft.ownerName} users={DESIGNER_USERS}
                        onChange={name => setCloneDraft(d => ({ ...d, ownerName: name }))} />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>委託人</label>
                      <MemberPicker value={cloneDraft.requesterName} users={ALL_USERS}
                        onChange={name => setCloneDraft(d => ({ ...d, requesterName: name }))} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
                    <button className="btn btn-ghost" onClick={() => setCloneOpen(false)}>取消</button>
                    <button className="btn btn-primary" onClick={handleClone} disabled={!cloneDraft.title.trim()}>複製</button>
                  </div>
                </div>
              </div>
            )}

            {logModal && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'inherit' }}
                onClick={e => e.target === e.currentTarget && setLogModal(false)}>
                <div style={{ background: 'var(--surface)', borderRadius: 12, padding: '20px 24px', width: 340, boxShadow: '0 12px 40px rgba(0,0,0,.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>記錄工時</span>
                    <button onClick={() => setLogModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex' }}><X size={15} /></button>
                  </div>
                  {c.est > 0 && (
                    <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                      <div style={{ flex: 1, background: 'var(--surface-2)', borderRadius: 8, padding: '8px 12px' }}>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>耗費時間</div>
                        <div style={{ fontSize: 16, fontWeight: 600 }}>{computedActual}h</div>
                      </div>
                      <div style={{ flex: 1, background: 'var(--surface-2)', borderRadius: 8, padding: '8px 12px' }}>
                        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>剩餘時間</div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: computedActual >= c.est ? 'var(--st-block)' : 'var(--ink)' }}>
                          {c.est - computedActual}h
                        </div>
                      </div>
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>日期</label>
                        <input type="date" className="input" style={{ width: '100%' }}
                          value={toDateInput(newLog.date, c.month)}
                          onChange={e => setNewLog(l => ({ ...l, date: fromDateInput(e.target.value) }))} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>開始時間</label>
                        <select className="input" style={{ width: '100%' }}
                          value={newLog.time || '09:00'}
                          onChange={e => setNewLog(l => ({ ...l, time: e.target.value }))}>
                          {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>工時（小時）</label>
                      <input type="number" className="input" style={{ width: '100%' }} min={0.5} step={0.5} placeholder="例：4"
                        value={newLog.hours || ''}
                        onChange={e => setNewLog(l => ({ ...l, hours: Number(e.target.value) }))} />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: 4 }}>工作內容（選填）</label>
                      <textarea className="input" style={{ width: '100%', minHeight: 72, resize: 'vertical', fontFamily: 'inherit', fontSize: 14 }}
                        placeholder="簡述這段時間做了什麼..."
                        value={newLog.note}
                        onChange={e => setNewLog(l => ({ ...l, note: e.target.value }))}
                        onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submitLog(); }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
                    <button className="btn btn-ghost" onClick={() => setLogModal(false)}>取消</button>
                    <button className="btn btn-primary" onClick={submitLog} disabled={!newLog.date || !newLog.time || newLog.hours <= 0}>新增記錄</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
