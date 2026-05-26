'use client';
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, Calendar, Flag } from 'lucide-react';
import type { Card } from '@/lib/types';
import { DEPT_SHORT, DEPT_HUE, MEMBER_BY_ID } from '@/lib/data';
import { hue } from '@/lib/utils';

interface KCardProps {
  card: Card;
  onOpen: () => void;
}

function isOverdue(due: string, status: string, cardMonth: string): boolean {
  if (status === 'done') return false;
  if (!due) return false;
  const [mm, dd] = due.split('/').map(Number);
  if (!mm || !dd) return false;
  const year = Number(cardMonth.split('/')[0]);
  const dueDate = new Date(year, mm - 1, dd);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dueDate < today;
}

export default function KCard({ card, onOpen }: KCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const owner = MEMBER_BY_ID[card.owner];
  const over = card.actual > card.est;
  const overdue = isOverdue(card.due, card.status, card.month);
  const deptColor = hue(DEPT_HUE[card.dept] || 1);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`kcard${isDragging ? ' dragging' : ''}`}
      onClick={onOpen}
    >
      <div className="kcard-row">
        <span className="kcard-id">{card.id}</span>
        <span className="kcard-cat" data-cat={card.cat}>
          {card.cat}
        </span>
        {card.prio === 'high' && (
          <span className="kcard-prio" style={{ color: 'var(--st-block)' }}>
            <Flag size={12} />
          </span>
        )}
      </div>
      <div className="kcard-title">{card.title}</div>
      <div className="kcard-dept">
        <span className="chip-dot" style={{ background: deptColor }} />
        {DEPT_SHORT[card.dept] || card.dept}
      </div>
      <div className="kcard-meta">
        <span className={`kcard-due${overdue ? ' overdue' : ''}`}>
          <Calendar size={12} />
          {card.due}
        </span>
        <span className={`kcard-hours${over ? ' over' : ''}`}>
          <Clock size={12} />
          {card.actual}
          <span className="ratio">/{card.est}h</span>
        </span>
        {owner && (
          <span
            className="kcard-avatar av av-sm"
            style={{ background: hue(owner.hue) }}
            title={owner.name}
          >
            {owner.initial}
          </span>
        )}
      </div>
    </div>
  );
}
