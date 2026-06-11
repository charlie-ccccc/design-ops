'use client';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';

import { KanbanColumn } from '@/components/ui/KanbanColumn/KanbanColumn';

function DroppableKanbanColumn({ status, colCards, isOver, memberById, onOpen }: {
  status: { id: string; name: string; dot: string };
  colCards: Card[];
  isOver: boolean;
  memberById: Record<string, Member>;
  onOpen: (id: string) => void;
}) {
  const { setNodeRef } = useDroppable({ id: status.id });
  return (
    <KanbanColumn
      ref={setNodeRef}
      name={status.name}
      count={colCards.length}
      dotColor={status.dot}
      isOver={isOver}
      isEmpty={colCards.length === 0}
    >
      <SortableContext items={colCards.map(c => c.id)} strategy={verticalListSortingStrategy}>
        {colCards.map(card => (
          <KCard key={card.id} card={card} onOpen={() => onOpen(card.id)} memberById={memberById} />
        ))}
      </SortableContext>
    </KanbanColumn>
  );
}

import type { Card, Member } from '@/lib/types';
import { STATUSES } from '@/lib/data';
import KCard from './card';

// These columns sort by due date; manual reordering is disabled inside them
const FIXED_SORT = new Set(['done', 'pending']);

function buildColIds(status: string, cards: Card[], savedOrder: string[]): string[] {
  const inCol = cards.filter(c => c.status === status);
  if (FIXED_SORT.has(status)) {
    return [...inCol]
      .sort((a, b) => (a.due || '99/99').localeCompare(b.due || '99/99'))
      .map(c => c.id);
  }
  const inColSet = new Set(inCol.map(c => c.id));
  const ordered = savedOrder.filter(id => inColSet.has(id));
  const extras = inCol.filter(c => !ordered.includes(c.id)).map(c => c.id);
  return [...ordered, ...extras];
}

interface KanbanBoardProps {
  cards: Card[];
  onMove: (cardId: string, newStatus: string) => void;
  onReorder: (order: Record<string, string[]>) => void;
  onOpen: (id: string) => void;
  onAddCard: (status: string) => void;
  query: string;
  filterMember: string;
  filterDept: string;
  canEdit: boolean;
  memberById?: Record<string, Member>;
  cardOrder: Record<string, string[]>;
}

export default function KanbanBoard({
  cards,
  onMove,
  onReorder,
  onOpen,
  onAddCard,
  query,
  filterMember,
  filterDept,
  canEdit,
  memberById = {},
  cardOrder,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<string | null>(null);

  // items tracks display order per column; updated optimistically during drag
  const [items, setItems] = useState<Record<string, string[]>>(() => {
    const r: Record<string, string[]> = {};
    for (const s of STATUSES) r[s.id] = buildColIds(s.id, cards, cardOrder[s.id] ?? []);
    return r;
  });

  const dragging = useRef(false);

  // Sync from Firestore when not dragging
  useEffect(() => {
    if (dragging.current) return;
    setItems(() => {
      const r: Record<string, string[]> = {};
      for (const s of STATUSES) r[s.id] = buildColIds(s.id, cards, cardOrder[s.id] ?? []);
      return r;
    });
  }, [cards, cardOrder]);

  const allSensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  );
  const sensors = canEdit ? allSensors : useSensors();

  const cardMap = useMemo(() => Object.fromEntries(cards.map(c => [c.id, c])), [cards]);

  function passes(c: Card): boolean {
    if (filterMember && c.owner !== filterMember) return false;
    if (filterDept && c.dept !== filterDept) return false;
    if (query) {
      const q = query.toLowerCase();
      if (!c.title.toLowerCase().includes(q) && !c.id.toLowerCase().includes(q)) return false;
    }
    return true;
  }

  // Find which column a card ID currently lives in (by items state)
  function findColumn(id: string): string | undefined {
    return Object.entries(items).find(([, ids]) => ids.includes(id))?.[0];
  }

  function handleDragStart(event: DragStartEvent) {
    dragging.current = true;
    setActiveId(event.active.id as string);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) { setOverColumn(null); return; }

    const cardId = active.id as string;
    const overId = over.id as string;
    const sourceStatus = findColumn(cardId);
    if (!sourceStatus) return;

    const targetCol = STATUSES.find(s => s.id === overId)?.id ?? findColumn(overId);
    if (!targetCol) return;
    setOverColumn(targetCol);

    setItems(prev => {
      const next = { ...prev };

      if (sourceStatus === targetCol) {
        if (FIXED_SORT.has(targetCol)) return prev;
        const col = [...next[targetCol]];
        const from = col.indexOf(cardId);
        const to = col.indexOf(overId);
        if (from === -1 || to === -1 || from === to) return prev;
        next[targetCol] = arrayMove(col, from, to);
      } else {
        // Cross-column: remove from source, insert into target
        next[sourceStatus] = next[sourceStatus].filter(id => id !== cardId);
        const col = [...next[targetCol]];
        const insertAt = col.indexOf(overId);
        if (insertAt >= 0) col.splice(insertAt, 0, cardId);
        else col.push(cardId);
        next[targetCol] = col;
      }
      return next;
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    dragging.current = false;
    setActiveId(null);
    setOverColumn(null);

    const cardId = event.active.id as string;
    const sourceCard = cardMap[cardId];
    if (!sourceCard) return;

    const finalStatus = findColumn(cardId) ?? sourceCard.status;

    if (finalStatus !== sourceCard.status) {
      onMove(cardId, finalStatus);
    }

    // Save order for all manually-sorted columns
    const order: Record<string, string[]> = {};
    for (const s of STATUSES) {
      if (!FIXED_SORT.has(s.id)) order[s.id] = items[s.id] ?? [];
    }
    onReorder(order);
  }

  const activeCard = activeId ? cardMap[activeId] ?? null : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban">
        {STATUSES.map(status => {
          const colIds = items[status.id] ?? [];
          const colCards = colIds.map(id => cardMap[id]).filter((c): c is Card => !!c && passes(c));
          return (
            <DroppableKanbanColumn
              key={status.id}
              status={status}
              colCards={colCards}
              isOver={overColumn === status.id}
              memberById={memberById}
              onOpen={onOpen}
            />
          );
        })}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeCard ? (
          <div style={{ opacity: 0.85, transform: 'rotate(1.5deg)' }}>
            <KCard card={activeCard} onOpen={() => {}} memberById={memberById} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
