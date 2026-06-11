'use client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Card, Member } from '@/lib/types';
import { DEPT_SHORT, DEPT_HUE } from '@/lib/data';
import { KanbanCard } from '@/components/ui/KanbanCard/KanbanCard';

interface KCardProps {
  card: Card;
  onOpen: () => void;
  memberById?: Record<string, Member>;
}

function isOverdue(due: string, status: string, cardMonth: string): boolean {
  if (status === 'done') return false;
  if (!due) return false;
  const [mm, dd] = due.split('/').map(Number);
  if (!mm || !dd) return false;
  const year = Number(cardMonth.split('/')[0]);
  return new Date(year, mm - 1, dd) < new Date(new Date().setHours(0, 0, 0, 0));
}

export default function KCard({ card, onOpen, memberById = {} }: KCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
  });

  const owner = card.owner ? memberById[card.owner] : undefined;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
    >
      <KanbanCard
        id={card.id}
        title={card.title}
        cat={card.cat as 'UIUX' | '平面視覺'}
        dept={DEPT_SHORT[card.dept] || card.dept}
        deptHue={DEPT_HUE[card.dept] || 1}
        priority={card.prio}
        due={card.due}
        est={card.est}
        actual={card.actual}
        owner={owner ? { initial: owner.initial, hue: owner.hue, name: owner.name, photo: owner.photo } : undefined}
        isDragging={isDragging}
        isOverdue={isOverdue(card.due, card.status, card.month)}
        onClick={onOpen}
      />
    </div>
  );
}
