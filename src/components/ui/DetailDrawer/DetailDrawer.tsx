'use client';
import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import './DetailDrawer.css';

type DetailDrawerProps = {
  open: boolean;
  onClose: () => void;
  id?: string;
  title?: string;
  children?: ReactNode;
  className?: string;
};

export function DetailDrawer({
  open,
  onClose,
  id,
  title,
  children,
  className,
}: DetailDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  return (
    <>
      <div
        className={['ui-drawer-scrim', open && 'ui-drawer-scrim--open'].filter(Boolean).join(' ')}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={['ui-drawer', open && 'ui-drawer--open', className].filter(Boolean).join(' ')}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="ui-drawer__header">
          <div className="ui-drawer__header-text">
            {id && <div className="ui-drawer__id">{id}</div>}
            {title && <div className="ui-drawer__title">{title}</div>}
          </div>
          <button
            className="ui-drawer__close"
            onClick={onClose}
            aria-label="關閉"
          >
            <X size={16} />
          </button>
        </div>
        <div className="ui-drawer__body">{children}</div>
      </div>
    </>
  );
}
