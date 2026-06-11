import { ReactNode, HTMLAttributes } from 'react';
import './Badge.css';

type ChipProps = HTMLAttributes<HTMLSpanElement> & {
  dotColor?: string;
  children: ReactNode;
};

export function Chip({ dotColor, children, className, ...props }: ChipProps) {
  return (
    <span className={['ui-chip', className].filter(Boolean).join(' ')} {...props}>
      {dotColor !== undefined && (
        <span className="ui-chip__dot" style={{ background: dotColor }} aria-hidden="true" />
      )}
      {children}
    </span>
  );
}

type TagProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
};

export function Tag({ children, className, ...props }: TagProps) {
  return (
    <span className={['ui-tag', className].filter(Boolean).join(' ')} {...props}>
      {children}
    </span>
  );
}

type DeptPillProps = HTMLAttributes<HTMLSpanElement> & {
  hue?: number;
  children: ReactNode;
};

export function DeptPill({ hue, children, className, ...props }: DeptPillProps) {
  const hueIndex = hue !== undefined ? ((((hue - 1) % 8) + 8) % 8) + 1 : undefined;
  return (
    <span
      className={['ui-dept-pill', className].filter(Boolean).join(' ')}
      style={hueIndex ? { borderColor: `var(--md-sys-color-cat-${hueIndex})` } : undefined}
      {...props}
    >
      {hueIndex && (
        <span
          className="ui-dept-pill__dot"
          style={{ background: `var(--md-sys-color-cat-${hueIndex})` }}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
