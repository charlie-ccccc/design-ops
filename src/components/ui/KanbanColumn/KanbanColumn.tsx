import { ReactNode, HTMLAttributes, forwardRef } from 'react';
import './KanbanColumn.css';

type KanbanColumnProps = HTMLAttributes<HTMLDivElement> & {
  name: string;
  count?: number;
  dotColor?: string;
  tools?: ReactNode;
  isEmpty?: boolean;
  isOver?: boolean;
  children?: ReactNode;
  className?: string;
};

export const KanbanColumn = forwardRef<HTMLDivElement, KanbanColumnProps>(function KanbanColumn({
  name,
  count,
  dotColor,
  tools,
  isEmpty = false,
  isOver = false,
  children,
  className,
  ...props
}, ref) {
  return (
    <div ref={ref} className={['ui-kcol', className].filter(Boolean).join(' ')} {...props}>
      <div className="ui-kcol__header">
        {dotColor && (
          <span className="ui-kcol__dot" style={{ background: dotColor }} aria-hidden="true" />
        )}
        <span className="ui-kcol__name">{name}</span>
        {count !== undefined && (
          <span className="ui-kcol__count">{count}</span>
        )}
        {tools && <div className="ui-kcol__tools">{tools}</div>}
      </div>
      <div className={['ui-kcol__body', isOver && 'ui-kcol__body--over'].filter(Boolean).join(' ')}>
        {isEmpty ? (
          <div className="ui-kcol__empty">尚無任務</div>
        ) : children}
      </div>
    </div>
  );
});
