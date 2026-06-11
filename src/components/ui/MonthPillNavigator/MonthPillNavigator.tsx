import { HTMLAttributes } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './MonthPillNavigator.css';

type MonthPillNavigatorProps = HTMLAttributes<HTMLDivElement> & {
  value: string;
  onPrev?: () => void;
  onNext?: () => void;
  disablePrev?: boolean;
  disableNext?: boolean;
  className?: string;
};

export function MonthPillNavigator({
  value,
  onPrev,
  onNext,
  disablePrev = false,
  disableNext = false,
  className,
  ...props
}: MonthPillNavigatorProps) {
  return (
    <div className={['ui-month-pill', className].filter(Boolean).join(' ')} {...props}>
      <button
        className="ui-month-pill__btn"
        onClick={onPrev}
        disabled={disablePrev}
        aria-label="上個月"
      >
        <ChevronLeft size={14} />
      </button>
      <span className="ui-month-pill__val">{value}</span>
      <button
        className="ui-month-pill__btn"
        onClick={onNext}
        disabled={disableNext}
        aria-label="下個月"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
