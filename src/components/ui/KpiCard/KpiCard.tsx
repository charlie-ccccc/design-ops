import type { HTMLAttributes, ReactNode } from 'react';
import './KpiCard.css';

type DeltaDirection = 'up' | 'down' | 'neutral';

type KpiCardProps = HTMLAttributes<HTMLDivElement> & {
  label: string;
  value: string | number;
  unit?: string;
  delta?: ReactNode;
  deltaDirection?: DeltaDirection;
};

export function KpiCard({ label, value, unit, delta, deltaDirection = 'neutral', className, ...props }: KpiCardProps) {
  const deltaCls = [
    'ui-kpi-card__delta',
    deltaDirection === 'up' && 'ui-kpi-card__delta--up',
    deltaDirection === 'down' && 'ui-kpi-card__delta--down',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={['ui-kpi-card', className].filter(Boolean).join(' ')} {...props}>
      <span className="ui-kpi-card__label">{label}</span>
      <div className="ui-kpi-card__value-row">
        <span className="ui-kpi-card__value">{value}</span>
        {unit && <span className="ui-kpi-card__unit">{unit}</span>}
      </div>
      {delta !== undefined && (
        <span className={deltaCls}>{delta}</span>
      )}
    </div>
  );
}
