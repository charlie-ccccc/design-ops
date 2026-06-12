import { Calendar, Clock, ChevronsUp, ChevronUp, ChevronDown, ChevronsDown } from 'lucide-react';
import { Avatar } from '../Avatar/Avatar';
import './KanbanCard.css';

type KanbanCardPriority = 'urgent' | 'high' | 'normal' | 'low' | 'lowest';
type KanbanCardCat = 'UIUX' | '平面視覺';

type KanbanCardOwner = {
  initial: string;
  hue: number;
  name?: string;
  photo?: string;
};

type KanbanCardProps = {
  id: string;
  title: string;
  cat: KanbanCardCat;
  dept: string;
  deptHue: number;
  priority?: KanbanCardPriority;
  due?: string;
  est?: number;
  actual?: number;
  owner?: KanbanCardOwner;
  isDragging?: boolean;
  isOverdue?: boolean;
  className?: string;
  onClick?: () => void;
};

export function KanbanCard({
  id,
  title,
  cat,
  dept,
  deptHue,
  priority = 'normal',
  due,
  est,
  actual,
  owner,
  isDragging = false,
  isOverdue = false,
  className,
  onClick,
}: KanbanCardProps) {
  const hoursOver = actual !== undefined && est !== undefined && actual > est;

  const cls = [
    'ui-kanban-card',
    isDragging && 'ui-kanban-card--dragging',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cls} onClick={onClick} role="listitem" aria-label={`${id}: ${title}`}>
      <div className="ui-kanban-card__header">
        <span className="ui-kanban-card__id">{id}</span>
        <span className="ui-kanban-card__cat" data-cat={cat}>{cat}</span>
        {priority === 'urgent' && <span className="ui-kanban-card__prio ui-kanban-card__prio--urgent" aria-label="最高"><ChevronsUp size={12} /></span>}
        {priority === 'high'   && <span className="ui-kanban-card__prio ui-kanban-card__prio--high"   aria-label="高"><ChevronUp size={12} /></span>}
        {priority === 'low'    && <span className="ui-kanban-card__prio ui-kanban-card__prio--low"    aria-label="低"><ChevronDown size={12} /></span>}
        {priority === 'lowest' && <span className="ui-kanban-card__prio ui-kanban-card__prio--lowest" aria-label="最低"><ChevronsDown size={12} /></span>}
      </div>

      <div className="ui-kanban-card__title">{title}</div>

      <div className="ui-kanban-card__dept">
        <span
          className="ui-kanban-card__dept-dot"
          style={{ background: `var(--md-sys-color-cat-${((((deptHue - 1) % 8) + 8) % 8) + 1})` }}
        />
        {dept}
      </div>

      {(due !== undefined || est !== undefined || owner) && (
        <div className="ui-kanban-card__meta">
          {due && (
            <span className={`ui-kanban-card__due${isOverdue ? ' ui-kanban-card__due--overdue' : ''}`}>
              <Calendar size={12} aria-hidden="true" />
              {due}
            </span>
          )}
          {est !== undefined && actual !== undefined && (
            <span className={`ui-kanban-card__hours${hoursOver ? ' ui-kanban-card__hours--over' : ''}`}>
              <Clock size={12} aria-hidden="true" />
              {actual}
              <span className="ui-kanban-card__hours-ratio">/{est}h</span>
            </span>
          )}
          {owner && (
            <span className="ui-kanban-card__avatar">
              <Avatar
                initial={owner.initial}
                hue={owner.hue}
                photo={owner.photo}
                size="sm"
                alt={owner.name}
              />
            </span>
          )}
        </div>
      )}
    </div>
  );
}
