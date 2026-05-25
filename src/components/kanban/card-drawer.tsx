'use client';
import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { Card, TimeLog, Comment } from '@/lib/types';
import { STATUSES, MEMBERS, MEMBER_BY_ID, DEPTS, DEPT_SHORT, SITE_USERS, SiteUser } from '@/lib/data';
import { hue, sum } from '@/lib/utils';

interface CardDrawerProps {
  card: Card | null;
  onClose: () => void;
  onUpdate: (id: string, patch: Partial<Card>) => void;
  readOnly?: boolean;
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

const EMPTY_LOG = { date: '', hours: 0, note: '' };

type BottomTab = 'activity' | 'comments' | 'timelogs';

type AnyUser = { id: string; name: string; initial: string; hue: number; sub?: string };

// sub = secondary label (cat for designers, dept for site users)
function toAnyUser(m: typeof MEMBERS[0]): AnyUser { return { id: m.id, name: m.name, initial: m.initial, hue: m.hue, sub: m.cat }; }
function siteToAnyUser(u: SiteUser): AnyUser { return { id: u.id, name: u.name, initial: u.initial, hue: u.hue, sub: u.dept }; }

// value is always stored as the user's name string
function MemberPicker({ value, onChange, users, placeholder = '— 未指定 —' }: {
  value: string;
  onChange: (name: string) => void;
  users: AnyUser[];
  placeholder?: string;
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
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontSize: 13 }}>
        {selected ? (
          <>
            <div className="av av-sm" style={{ background: hue(selected.hue) }}>{selected.initial}</div>
            <span style={{ fontWeight: 500 }}>{selected.name}</span>
            {selected.sub && <span style={{ color: 'var(--muted)', fontSize: 11.5 }}>· {selected.sub}</span>}
          </>
        ) : <span style={{ color: 'var(--muted)' }}>{placeholder}</span>}
        <span style={{ marginLeft: 4, color: 'var(--muted)', fontSize: 10 }}>▾</span>
      </button>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => { setOpen(false); setQ(''); }} />
          <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 100, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,.12)', minWidth: 240, overflow: 'hidden' }}>
            <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--divider)' }}>
              <input autoFocus className="input" placeholder="搜尋..." style={{ width: '100%', fontSize: 12.5 }}
                value={q} onChange={e => setQ(e.target.value)} />
            </div>
            <div style={{ maxHeight: 240, overflowY: 'auto' }}>
              <button onClick={clear} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: 'none', border: 'none', padding: '8px 12px', cursor: 'pointer', fontSize: 13, color: 'var(--muted)' }}>
                — 未指定 —
              </button>
              {filtered.map(u => (
                <button key={u.id} onClick={() => pick(u)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', border: 'none', padding: '8px 12px', cursor: 'pointer', fontSize: 13, textAlign: 'left', background: value === u.name ? 'var(--accent-soft)' : 'none' }}>
                  <div className="av av-sm" style={{ background: hue(u.hue) }}>{u.initial}</div>
                  <span style={{ fontWeight: 500 }}>{u.name}</span>
                  {u.sub && <span style={{ color: 'var(--muted)', fontSize: 11.5 }}>· {u.sub}</span>}
                </button>
              ))}
              {filtered.length === 0 && <div style={{ padding: '10px 12px', fontSize: 12.5, color: 'var(--muted)' }}>無符合結果</div>}
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
  padding: '8px 14px', fontSize: 12.5, fontFamily: 'inherit',
  fontWeight: active ? 600 : 400,
  color: active ? 'var(--ink)' : 'var(--muted)',
  borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
  marginBottom: -1, transition: 'color 0.15s',
});

export default function CardDrawer({ card, onClose, onUpdate, readOnly }: CardDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [displayCard, setDisplayCard] = useState<Card | null>(null);
  const [bottomTab, setBottomTab] = useState<BottomTab>('activity');

  // desc edit state
  const [editingDesc, setEditingDesc] = useState(false);
  const [draftDesc, setDraftDesc] = useState('');

  // new time log row
  const [newLog, setNewLog] = useState(EMPTY_LOG);

  // new comment
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    if (card) {
      setDisplayCard(card);
      setEditingDesc(false);
      setDraftDesc(card.desc || '');
      setNewLog(EMPTY_LOG);
      setCommentText('');
      setBottomTab('activity');
      const raf = requestAnimationFrame(() => setIsOpen(true));
      return () => cancelAnimationFrame(raf);
    } else {
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

  const pct = c && c.est > 0 ? Math.min(1, computedActual / c.est) * 100 : 0;
  const isOver = c ? computedActual > c.est : false;
  const overPct = isOver && c ? ((computedActual - c.est) / c.est) * 100 : 0;


  function addLog() {
    if (!c || !newLog.date || newLog.hours <= 0) return;
    const entry: TimeLog = { id: Date.now().toString(), date: newLog.date, hours: newLog.hours, note: newLog.note };
    const updated = [...timeLogs, entry];
    onUpdate(c.id, { timeLogs: updated, actual: sum(updated.map(l => l.hours)) });
    setNewLog(EMPTY_LOG);
  }

  function removeLog(id: string) {
    if (!c) return;
    const updated = timeLogs.filter(l => l.id !== id);
    onUpdate(c.id, { timeLogs: updated, actual: updated.length > 0 ? sum(updated.map(l => l.hours)) : 0 });
  }

  function addComment() {
    if (!c || !commentText.trim()) return;
    const now = new Date();
    const mmdd = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;
    const entry: Comment = { id: Date.now().toString(), author: '主設計師', text: commentText.trim(), t: mmdd };
    onUpdate(c.id, { comments: [...comments, entry] });
    setCommentText('');
  }

  function saveDesc() {
    if (!c) return;
    onUpdate(c.id, { desc: draftDesc });
    setEditingDesc(false);
  }

  return (
    <>
      <div className={`drawer-scrim${isOpen ? ' open' : ''}`} onClick={onClose} />
      <div className={`drawer${isOpen ? ' open' : ''}`} role="dialog" aria-modal="true">
        {c && (
          <>
            <div className="drawer-h">
              <div>
                <div className="drawer-h-id">{c.id} · {c.month}</div>
                <div className="drawer-h-title">{c.title}</div>
              </div>
              <button className="drawer-close" onClick={onClose} aria-label="關閉">
                <X size={16} />
              </button>
            </div>

            <div className="drawer-body">
              {/* Tags row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span className="kcard-cat" data-cat={c.cat}>{c.cat}</span>
                <select
                  className="input"
                  value={c.status}
                  disabled={readOnly}
                  onChange={e => onUpdate(c.id, { status: e.target.value as Card['status'] })}
                  style={{ marginLeft: 'auto' }}
                >
                  {STATUSES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              {/* Meta */}
              <dl className="drawer-meta">
                <dt>需求發起單位</dt>
                <dd>
                  {readOnly ? (
                    DEPT_SHORT[c.dept] || c.dept
                  ) : (
                    <select className="input" value={c.dept} onChange={e => onUpdate(c.id, { dept: e.target.value })}>
                      {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  )}
                </dd>

                <dt>受託人</dt>
                <dd>
                  {readOnly ? (
                    owner ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="av av-sm" style={{ background: hue(owner.hue) }}>{owner.initial}</div>
                        <span>{owner.name} <span style={{ color: 'var(--muted)', fontSize: 11.5 }}>· {owner.alias} · {owner.cat}</span></span>
                      </div>
                    ) : '—'
                  ) : (
                    <MemberPicker
                      value={owner?.name ?? ''}
                      users={DESIGNER_USERS}
                      onChange={name => {
                        const m = MEMBERS.find(m => m.name === name);
                        onUpdate(c.id, { owner: m?.id ?? '' });
                      }}
                    />
                  )}
                </dd>

                <dt>到期日</dt>
                <dd>
                  {readOnly ? (
                    <span className="mono tnum" style={{ fontSize: 12.5 }}>{c.due || '—'}</span>
                  ) : (
                    <input type="date" className="input" value={toDateInput(c.due, c.month)}
                      onChange={e => onUpdate(c.id, { due: fromDateInput(e.target.value) })} />
                  )}
                </dd>

                <dt>優先級</dt>
                <dd>
                  {readOnly ? (
                    ({ high: '高', normal: '中', low: '低' }[c.prio] || c.prio)
                  ) : (
                    <select className="input" value={c.prio} onChange={e => onUpdate(c.id, { prio: e.target.value as Card['prio'] })}>
                      <option value="high">高</option>
                      <option value="normal">中</option>
                      <option value="low">低</option>
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

                <dt>建立時間</dt>
                <dd><span className="mono tnum" style={{ fontSize: 12.5 }}>2026/05/01</span></dd>
              </dl>

              {/* Hours summary */}
              <div className="drawer-section">
                <h4>工時</h4>
                <div className="drawer-hours">
                  <div className="cell">
                    <div className="lbl">原始預估</div>
                    {readOnly ? (
                      <div className="val">{c.est}</div>
                    ) : (
                      <input
                        type="number" min={0} className="val"
                        style={{ width: '100%', background: 'none', border: 'none', outline: 'none', fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit', padding: 0, cursor: 'text' }}
                        value={c.est}
                        onChange={e => onUpdate(c.id, { est: Math.max(0, Number(e.target.value)) })}
                      />
                    )}
                    <div className="delta">小時</div>
                  </div>
                  <div className="cell">
                    <div className="lbl">實際消耗</div>
                    <div className="val" style={isOver ? { color: 'var(--st-block)' } : {}}>{computedActual}</div>
                    <div className={`delta${isOver ? ' over' : ' under'}`}>
                      {isOver ? `超出 ${computedActual - c.est}h` : c.est > 0 ? `剩餘 ${c.est - computedActual}h` : '尚未回報'}
                    </div>
                  </div>
                </div>
                <div className="drawer-progress">
                  <span className="fill" style={{ width: `${isOver ? 100 : pct}%` }} />
                  {isOver && <span className="over-fill" style={{ left: '100%', width: `${Math.min(overPct, 30)}%`, position: 'absolute' }} />}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10.5, color: 'var(--muted)' }}>
                  <span>0h</span><span>{c.est}h</span>
                </div>
              </div>

              {/* Description section */}
              <div className="drawer-section">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <h4 style={{ margin: 0 }}>說明</h4>
                  {!readOnly && !editingDesc && (
                    <button className="btn btn-ghost" style={{ fontSize: 11.5, padding: '2px 8px' }}
                      onClick={() => { setDraftDesc(c.desc || ''); setEditingDesc(true); }}>
                      編輯
                    </button>
                  )}
                  {!readOnly && editingDesc && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost" style={{ fontSize: 11.5, padding: '2px 8px' }} onClick={() => setEditingDesc(false)}>取消</button>
                      <button className="btn btn-primary" style={{ fontSize: 11.5, padding: '2px 10px' }} onClick={saveDesc}>儲存</button>
                    </div>
                  )}
                </div>
                {editingDesc ? (
                  <textarea className="input"
                    style={{ width: '100%', minHeight: 200, resize: 'vertical', fontFamily: 'inherit', fontSize: 13, lineHeight: 1.6 }}
                    value={draftDesc} onChange={e => setDraftDesc(e.target.value)} />
                ) : (
                  <p style={{ fontSize: 13, color: c.desc ? 'var(--ink-2)' : 'var(--muted)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                    {c.desc ? renderWithLinks(c.desc) : '尚無說明'}
                  </p>
                )}
              </div>

              {/* Bottom tabbed section */}
              <div className="drawer-section" style={{ paddingBottom: 0 }}>
                {/* Tab bar */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--divider)', marginBottom: 12 }}>
                  <button style={tabStyle(bottomTab === 'activity')} onClick={() => setBottomTab('activity')}>活動</button>
                  <button style={tabStyle(bottomTab === 'comments')} onClick={() => setBottomTab('comments')}>
                    留言{comments.length > 0 && <span style={{ marginLeft: 4, fontSize: 10.5, color: 'var(--muted)' }}>({comments.length})</span>}
                  </button>
                  <button style={tabStyle(bottomTab === 'timelogs')} onClick={() => setBottomTab('timelogs')}>
                    工作時間{timeLogs.length > 0 && <span style={{ marginLeft: 4, fontSize: 10.5, color: 'var(--muted)' }}>({timeLogs.length})</span>}
                  </button>
                </div>

                {/* 活動 */}
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
                  ) : (
                    <div style={{ fontSize: 12.5, color: 'var(--muted)', padding: '4px 0 12px' }}>尚無活動記錄</div>
                  )
                )}

                {/* 留言 */}
                {bottomTab === 'comments' && (
                  <div>
                    {comments.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
                        {comments.map(cm => (
                          <div key={cm.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                            <div className="av av-sm" style={{ background: 'var(--accent)', flexShrink: 0 }}>
                              {cm.author[0]}
                            </div>
                            <div style={{ flex: 1, background: 'var(--surface-2)', borderRadius: 8, padding: '8px 12px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span style={{ fontSize: 12, fontWeight: 600 }}>{cm.author}</span>
                                <span style={{ fontSize: 11, color: 'var(--muted)' }}>{cm.t}</span>
                              </div>
                              <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                                {renderWithLinks(cm.text)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: 12.5, color: 'var(--muted)', padding: '4px 0 12px' }}>尚無留言</div>
                    )}
                    {!readOnly && (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                        <textarea className="input" placeholder="新增留言..." style={{ flex: 1, minHeight: 64, resize: 'vertical', fontFamily: 'inherit', fontSize: 13 }}
                          value={commentText} onChange={e => setCommentText(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) addComment(); }} />
                        <button className="btn btn-primary" style={{ flexShrink: 0 }} onClick={addComment} disabled={!commentText.trim()}>
                          送出
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 工作時間紀錄 */}
                {bottomTab === 'timelogs' && (
                  <div>
                    {timeLogs.length > 0 && (
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, marginBottom: 10 }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--divider)' }}>
                            <th style={{ textAlign: 'left', padding: '4px 8px 6px 0', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>日期</th>
                            <th style={{ textAlign: 'right', padding: '4px 8px 6px', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>工時</th>
                            <th style={{ textAlign: 'left', padding: '4px 8px 6px', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>工作內容</th>
                            {!readOnly && <th style={{ width: 24 }} />}
                          </tr>
                        </thead>
                        <tbody>
                          {timeLogs.map(l => (
                            <tr key={l.id} style={{ borderBottom: '1px solid var(--divider)' }}>
                              <td style={{ padding: '7px 8px 7px 0', fontFamily: 'var(--font-mono), monospace', fontSize: 12, color: 'var(--ink-2)' }}>{l.date}</td>
                              <td style={{ padding: '7px 8px', textAlign: 'right', fontFamily: 'var(--font-mono), monospace', fontWeight: 600 }}>{l.hours}h</td>
                              <td style={{ padding: '7px 8px', color: 'var(--ink-2)' }}>{l.note || <span style={{ color: 'var(--muted)' }}>—</span>}</td>
                              {!readOnly && (
                                <td style={{ padding: '7px 0 7px 4px' }}>
                                  <button onClick={() => removeLog(l.id)} style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 2, borderRadius: 4 }}
                                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--st-block)')}
                                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}>
                                    <Trash2 size={12} />
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                    {timeLogs.length === 0 && (
                      <div style={{ fontSize: 12.5, color: 'var(--muted)', padding: '4px 0 10px' }}>尚無工時記錄</div>
                    )}
                    {!readOnly && (
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <input type="date" className="input" style={{ width: 130, fontSize: 12 }}
                          value={newLog.date ? toDateInput(newLog.date, c.month) : ''}
                          onChange={e => setNewLog(l => ({ ...l, date: fromDateInput(e.target.value) }))} />
                        <input type="number" className="input" placeholder="時數" min={0.5} step={0.5} style={{ width: 70, fontSize: 12 }}
                          value={newLog.hours || ''}
                          onChange={e => setNewLog(l => ({ ...l, hours: Number(e.target.value) }))} />
                        <input className="input" placeholder="工作內容（選填）" style={{ flex: 1, fontSize: 12 }}
                          value={newLog.note}
                          onChange={e => setNewLog(l => ({ ...l, note: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && addLog()} />
                        <button className="btn btn-primary" style={{ padding: '0 10px', flexShrink: 0 }}
                          onClick={addLog} disabled={!newLog.date || newLog.hours <= 0}>
                          <Plus size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          </>
        )}
      </div>
    </>
  );
}
