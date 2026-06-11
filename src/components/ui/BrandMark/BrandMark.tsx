import { HTMLAttributes } from 'react';
import './BrandMark.css';

type BrandMarkSize = 'sm' | 'lg';

type BrandMarkProps = HTMLAttributes<HTMLDivElement> & {
  initial?: string;
  size?: BrandMarkSize;
  className?: string;
};

export function BrandMark({
  initial = 'D',
  size = 'sm',
  className,
  ...props
}: BrandMarkProps) {
  return (
    <div
      className={['ui-brand-mark', `ui-brand-mark--${size}`, className].filter(Boolean).join(' ')}
      role="img"
      aria-label="Brand mark"
      {...props}
    >
      {initial}
    </div>
  );
}
