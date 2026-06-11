import { HTMLAttributes } from 'react';
import './DonutCenterLockup.css';

type DonutCenterLockupProps = HTMLAttributes<HTMLDivElement> & {
  value: string | number;
  label?: string;
  className?: string;
};

export function DonutCenterLockup({ value, label, className, ...props }: DonutCenterLockupProps) {
  return (
    <div className={['ui-donut-center', className].filter(Boolean).join(' ')} {...props}>
      <div className="ui-donut-center__inner">
        <div className="ui-donut-center__value">{value}</div>
        {label && <div className="ui-donut-center__label">{label}</div>}
      </div>
    </div>
  );
}
