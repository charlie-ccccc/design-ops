'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Bell, AtSign, UserCheck, MessageSquare, Clock, CheckCheck, X } from 'lucide-react';
import type { AppNotification } from '@/lib/types';

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return '剛剛';
  if (m < 60) return `${m} 分鐘前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} 小時前`;
  return `${Math.floor(h / 24)} 天前`;
}

const TYPE_ICON: Record<AppNotification['type'], React.ReactNode> = {
  mention:  <AtSign size={14} />,
  assigned: <UserCheck size={14} />,
  comment:  <MessageSquare size={14} />,
  due:      <Clock size={14} />,
};

const TYPE_COLOR: Record<AppNotification['type'], string> = {
  mention:  'var(--accent)',
  assigned: '#22c55e',
  comment:  '#f59e0b',
  due:      '#ef4444',
};

const isTouch = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;

function NotifRow({ n, onMarkRead, onOpenCard, onDelete, setOpen }: {
  n: AppNotification;
  onMarkRead: (id: string) => void;
  onOpenCard: (cardId: string) => void;
  onDelete: (id: string) => void;
  setOpen: (v: boolean) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const showDelete = hovered || isTouch;
  return (
    <div
      onClick={() => { onMarkRead(n.id); onOpenCard(n.cardId); setOpen(false); }}
      style={{
        display: 'flex', gap: 10, padding: '10px 14px',
        borderBottom: '1px solid var(--border)',
        cursor: 'pointer',
        background: hovered ? 'var(--surface-2)' : n.read ? 'transparent' : 'var(--accent-soft)',
        transition: 'background 0.1s',
        position: 'relative',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        flexShrink: 0, width: 28, height: 28, borderRadius: '50%',
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: TYPE_COLOR[n.type],
      }}>
        {TYPE_ICON[n.type]}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.4, marginBottom: 2 }}>
          {n.message}
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)' }}>
          {timeAgo(n.createdAt)}
        </div>
      </div>
      {!n.read && !showDelete && (
        <div style={{ flexShrink: 0, width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', alignSelf: 'center' }} />
      )}
      {showDelete && (
        <button
          onClick={e => { e.stopPropagation(); onDelete(n.id); }}
          style={{
            flexShrink: 0, alignSelf: 'center',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--muted)', display: 'flex', borderRadius: 4, padding: 2,
          }}
          title="刪除通知"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}

interface Props {
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: (notifs: AppNotification[]) => void;
  onOpenCard: (cardId: string) => void;
  onDelete: (id: string) => void;
}

export default function NotificationPanel({ notifications, onMarkRead, onMarkAllRead, onOpenCard, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const unread = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      <button
        className="btn btn-ghost notif-btn"
        title="通知"
        onClick={() => setOpen(o => !o)}
        style={{ position: 'relative' }}
      >
        <Bell size={16} />
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: 2, right: 2,
            minWidth: 14, height: 14, borderRadius: 7, padding: '0 3px',
            background: 'var(--st-block)', color: '#fff',
            fontSize: 9, fontWeight: 700, lineHeight: '14px', textAlign: 'center',
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 6px)', zIndex: 200,
          width: 320,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column', maxHeight: 420,
        }}>
          {/* Header — sticky */}
          <div style={{
            flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 14px 8px',
            borderBottom: notifications.length > 0 ? '1px solid var(--border)' : 'none',
            background: 'var(--surface)',
          }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>通知</span>
            {unread > 0 && (
              <button
                onClick={() => onMarkAllRead(notifications)}
                style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <CheckCheck size={13} /> 全部已讀
              </button>
            )}
          </div>

          {/* Scrollable list */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '28px 14px', textAlign: 'center', fontSize: 13, color: 'var(--muted)' }}>
                沒有通知
              </div>
            ) : (
              notifications.map(n => (
                <NotifRow
                  key={n.id}
                  n={n}
                  onMarkRead={onMarkRead}
                  onOpenCard={onOpenCard}
                  onDelete={onDelete}
                  setOpen={setOpen}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
