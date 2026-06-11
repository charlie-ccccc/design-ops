import { HTMLAttributes } from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '../Button/Button';
import './ArchiveCard.css';

type ArchiveStat = {
  label: string;
  value: string | number;
  sub?: string;
};

type ArchiveCardProps = HTMLAttributes<HTMLDivElement> & {
  year: string;
  month: string;
  stats: ArchiveStat[];
  onView?: () => void;
  isLive?: boolean;
  className?: string;
};

export function ArchiveCard({
  year,
  month,
  stats,
  onView,
  isLive = false,
  className,
  onClick,
  ...props
}: ArchiveCardProps) {
  return (
    <div
      className={['ui-archive-card', (onClick || onView) && 'ui-archive-card--clickable', className].filter(Boolean).join(' ')}
      onClick={onClick}
      {...props}
    >
      <div className="ui-archive-card__month">
        <span className="ui-archive-card__year">{year}</span>
        {month}
      </div>

      <div className="ui-archive-card__stats">
        {stats.map((s, i) => (
          <div key={i} className="ui-archive-card__stat">
            <div className="ui-archive-card__stat-label">{s.label}</div>
            <div className="ui-archive-card__stat-value">
              {s.value}
              {s.sub && <span className="ui-archive-card__stat-sub">{s.sub}</span>}
            </div>
          </div>
        ))}
      </div>

      {onView && (
        <div className="ui-archive-card__action">
          <Button variant="ghost" onClick={(e) => { e.stopPropagation(); onView(); }} trailingIcon={<ChevronRight size={14} />}>
            <span className="ui-archive-card__view-text">查看</span>
          </Button>
        </div>
      )}
    </div>
  );
}
