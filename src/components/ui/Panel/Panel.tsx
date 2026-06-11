import { ReactNode, HTMLAttributes } from 'react';
import './Panel.css';

type PanelProps = HTMLAttributes<HTMLDivElement> & {
  header?: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Panel({
  header,
  title,
  subtitle,
  actions,
  children,
  className,
  ...props
}: PanelProps) {
  const hasHeader = header !== undefined || title !== undefined;

  return (
    <div className={['ui-panel', className].filter(Boolean).join(' ')} {...props}>
      {hasHeader && (
        <div className="ui-panel__header">
          {header ?? (
            <>
              <div className="ui-panel__header-text">
                {title && <span className="ui-panel__title">{title}</span>}
                {subtitle && <span className="ui-panel__subtitle">{subtitle}</span>}
              </div>
              {actions && <div className="ui-panel__actions">{actions}</div>}
            </>
          )}
        </div>
      )}
      <div className="ui-panel__body">{children}</div>
    </div>
  );
}
