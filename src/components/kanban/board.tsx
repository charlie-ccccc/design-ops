'use client';
import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, MoreHorizontal } from 'lucide-react';
import type { Card, CardStatus } from '@/lib/types';
import { STATUSES } from '@/lib/data';
import KCard from './card';

interface KanbanBoardProps {
  cards: Card[];
  onMove: (cardId: string, newStatus: string) => void;
  onOpen: (id: string) => void;
  onAddCard: (status: string) => void;
  query: string;
  filterMember: string;
  filterDept: string;
  canEdit: boolean;
}

export default function KanbanBoard({
  cards,
  onMove,
  onOpen,
  onAddCard,
  query,
  filterMember,
  filterDept,
  canEdit,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<string | null>(null);

  const allSensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  );
  const noSensors = useSensors();
  const sensors = canEdit ? allSensors : noSensors;

  // Filter cards
  const filtered = cards.filter((c) => {
    if (filterMember && c.owner !== filterMember) return false;
    if (filterDept && c.dept !== filterDept) return false;
    if (query) {
      const q = query.toLowerCase();
      if (!c.title.toLowerCase().includes(q) && !c.id.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  // Group by status
  const grouped: Record<string, Card[]> = {};
  for (const s of STATUSES) {
    grouped[s.id] = filtered.filter((c) => c.status === s.id);
  }

  const activeCard = activeId ? cards.find((c) => c.id === activeId) ?? null : null;

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragOver(event: DragOverEvent) {
    const { over } = event;
    if (!over) {
      setOverColumn(null);
      return;
    }
    // over.id may be a column status id or a card id
    const overId = over.id as string;
    // Check if it's a column id
    const colStatus = STATUSES.find((s) => s.id === overId);
    if (colStatus) {
      setOverColumn(colStatus.id);
      return;
    }
    // Otherwise it's a card — find which column it belongs to
    const overCard = cards.find((c) => c.id === overId);
    if (overCard) {
      setOverColumn(overCard.status);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    setOverColumn(null);

    if (!over || !active) return;

    const cardId = active.id as string;
    const overId = over.id as string;

    // Determine target status
    const colStatus = STATUSES.find((s) => s.id === overId);
    if (colStatus) {
      onMove(cardId, colStatus.id);
      return;
    }
    // over is a card
    const overCard = cards.find((c) => c.id === overId);
    if (overCard) {
      onMove(cardId, overCard.status);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban">
        {STATUSES.map((status) => {
          const colCards = grouped[status.id] || [];
          const isOver = overColumn === status.id;

          return (
            <div key={status.id} className="kcol">
              <div className="kcol-h">
                <div className="kcol-dot" style={{ background: status.dot }} />
                <span className="kcol-name">{status.name}</span>
                <span className="kcol-count">{colCards.length}</span>
                <div className="kcol-tools">
                  {canEdit && (
                    <button
                      className="kcol-tool"
                      onClick={() => onAddCard(status.id)}
                      title="新增需求單"
                    >
                      <Plus size={14} />
                    </button>
                  )}
                  <button className="kcol-tool" title="更多">
                    <MoreHorizontal size={14} />
                  </button>
                </div>
              </div>
              <SortableContext
                items={colCards.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                <div
                  className={`kcol-body${isOver ? ' is-over' : ''}`}
                  data-status={status.id}
                >
                  {colCards.length === 0 ? (
                    <div className="kcol-empty">尚無任務</div>
                  ) : (
                    colCards.map((card) => (
                      <KCard
                        key={card.id}
                        card={card}
                        onOpen={() => onOpen(card.id)}
                      />
                    ))
                  )}
                </div>
              </SortableContext>
            </div>
          );
        })}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeCard ? (
          <div style={{ opacity: 0.85, transform: 'rotate(1.5deg)' }}>
            <KCard card={activeCard} onOpen={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
