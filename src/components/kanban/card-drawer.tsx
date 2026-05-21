'use client';
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Card } from '@/lib/types';
import { STATUSES, MEMBER_BY_ID, DEPT_SHORT, DEPT_HUE } from '@/lib/data';
import { hue } from '@/lib/utils';

interface CardDrawerProps {
  card: Card | null;
  onClose: () => void;
  onUpdate: (id: string, patch: Partial<Card>) => void;
}

export default function CardDrawer({ card, onClose, onUpdate }: CardDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [displayCard, setDisplayCard] = useState<Card | null>(null);

  useEffect(() => {
    if (card) {
      setDisplayCard(card);
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

  const pct = c && c.est > 0 ? Math.min(1, c.actual / c.est) * 100 : 0;
  const isOver = c ? c.actual > c.est : false;
  const overPct = isOver && c
    ? ((c.actual - c.est) / c.est) * 100
    : 0;

  const deptColor = c ? hue(DEPT_HUE[c.dept] || 1) : 'var(--muted-2)';

  const priorityLabel: Record<string, string> = { high: '高', normal: '中', low: '低' };

  return (
    <>
      <div
        className={`drawer-scrim${isOpen ? ' open' : ''}`}
        onClick={onClose}
      />
      <div className={`drawer${isOpen ? ' open' : ''}`} role="dialog" aria-modal="true">
        {c && (
          <>
            <div className="drawer-h">
              <div>
                <div className="drawer-h-id">
                  {c.id} · {c.month}
                </div>
                <div className="drawer-h-title">{c.title}</div>
              </div>
              <button className="drawer-close" onClick={onClose} aria-label="關閉">
                <X size={16} />
              </button>
            </div>
            <div className="drawer-body">
              {/* Tags row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span className="kcard-cat" data-cat={c.cat}>
                  {c.cat}
                </span>
                <span className="dept-pill">
                  <span className="chip-dot" style={{ background: deptColor }} />
                  {DEPT_SHORT[c.dept] || c.dept}
                </span>
                <select
                  className="input"
                  value={c.status}
                  onChange={(e) => onUpdate(c.id, { status: e.target.value as Card['status'] })}
                  style={{ marginLeft: 'auto' }}
                >
                  {STATUSES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Meta dl */}
              <dl className="drawer-meta">
                <dt>受託人</dt>
                <dd>
                  {owner ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div
                        className="av av-sm"
                        style={{ background: hue(owner.hue) }}
                      >
                        {owner.initial}
                      </div>
                      <span>
                        {owner.name}{' '}
                        <span style={{ color: 'var(--muted)', fontSize: 11.5 }}>
                          · {owner.alias} · {owner.cat}
                        </span>
                      </span>
                    </div>
                  ) : (
                    '—'
                  )}
                </dd>

                <dt>到期日</dt>
                <dd>
                  <span className="mono tnum" style={{ fontSize: 12.5 }}>
                    {c.due}
                  </span>
                </dd>

                <dt>優先級</dt>
                <dd>{priorityLabel[c.prio] || c.prio}</dd>

                <dt>建立時間</dt>
                <dd>
                  <span className="mono tnum" style={{ fontSize: 12.5 }}>
                    2026/05/01
                  </span>
                </dd>
              </dl>

              {/* Hours section */}
              <div className="drawer-section">
                <h4>工時</h4>
                <div className="drawer-hours">
                  <div className="cell">
                    <div className="lbl">原始預估</div>
                    <div className="val">{c.est}</div>
                    <div className="delta">小時</div>
                  </div>
                  <div className="cell">
                    <div className="lbl">實際消耗</div>
                    <div className="val" style={isOver ? { color: 'var(--st-block)' } : {}}>
                      {c.actual}
                    </div>
                    <div className={`delta${isOver ? ' over' : ' under'}`}>
                      {isOver
                        ? `超出 ${c.actual - c.est}h`
                        : c.est > 0
                        ? `剩餘 ${c.est - c.actual}h`
                        : '尚未回報'}
                    </div>
                  </div>
                </div>
                <div className="drawer-progress">
                  <span
                    className="fill"
                    style={{ width: `${isOver ? 100 : pct}%` }}
                  />
                  {isOver && (
                    <span
                      className="over-fill"
                      style={{
                        left: '100%',
                        width: `${Math.min(overPct, 30)}%`,
                        position: 'absolute',
                      }}
                    />
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10.5, color: 'var(--muted)' }}>
                  <span>0h</span>
                  <span>{c.est}h</span>
                </div>
              </div>

              {/* Description section */}
              {c.desc && (
                <div className="drawer-section">
                  <h4>說明</h4>
                  <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6, margin: 0 }}>
                    {c.desc}
                  </p>
                </div>
              )}

              {/* Activity section */}
              {c.activity && c.activity.length > 0 && (
                <div className="drawer-section">
                  <h4>活動</h4>
                  <div className="timeline">
                    {card.activity.map((entry, i) => (
                      <div key={i} className="tl-row">
                        <div className="tl-dot" />
                        <div className="tl-msg">
                          <strong>{entry.who}</strong> {entry.msg}
                        </div>
                        <div className="tl-time mono">{entry.t}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
