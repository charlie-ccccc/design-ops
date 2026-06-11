import { ReactNode, HTMLAttributes } from 'react';
import './Timeline.css';

type TimelineEntry = {
  id: string;
  message: string;
  time?: string;
  dot?: string;
};

type TimelineProps = HTMLAttributes<HTMLDivElement> & {
  entries: TimelineEntry[];
  className?: string;
};

export function Timeline({ entries, className, ...props }: TimelineProps) {
  return (
    <div className={['ui-timeline', className].filter(Boolean).join(' ')} {...props}>
      {entries.map((entry, i) => (
        <div key={entry.id} className="ui-timeline__row" data-last={i === entries.length - 1 ? '' : undefined}>
          <div className="ui-timeline__dot-wrap">
            <div
              className="ui-timeline__dot"
              style={entry.dot ? { background: entry.dot } : undefined}
            />
          </div>
          <div className="ui-timeline__content">
            <div className="ui-timeline__msg">{entry.message}</div>
            {entry.time && <div className="ui-timeline__time">{entry.time}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

type TimelineItemProps = HTMLAttributes<HTMLDivElement> & {
  time?: string;
  dot?: string;
  children: ReactNode;
};

export function TimelineItem({ time, dot, children, className, ...props }: TimelineItemProps) {
  return (
    <div className={['ui-timeline__row', className].filter(Boolean).join(' ')} {...props}>
      <div className="ui-timeline__dot-wrap">
        <div className="ui-timeline__dot" style={dot ? { background: dot } : undefined} />
      </div>
      <div className="ui-timeline__content">
        <div className="ui-timeline__msg">{children}</div>
        {time && <div className="ui-timeline__time">{time}</div>}
      </div>
    </div>
  );
}
