'use client';
import { ReactNode, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

type ModalSize = 'default' | 'lg';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: ModalSize;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
  disableBackdropClose?: boolean;
};

export function Modal({
  open,
  onClose,
  title,
  size = 'default',
  children,
  footer,
  className,
  disableBackdropClose = false,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  return (
    <div
      className={['ui-modal-scrim', open && 'ui-modal-scrim--open'].filter(Boolean).join(' ')}
      onClick={(e) => { if (!disableBackdropClose && e.target === e.currentTarget) onClose(); }}
      aria-modal="true"
      role="dialog"
      aria-label={title}
    >
      <div
        ref={dialogRef}
        className={[
          'ui-modal',
          size === 'lg' && 'ui-modal--lg',
          className,
        ].filter(Boolean).join(' ')}
      >
        {title !== undefined && (
          <div className="ui-modal__header">
            <span className="ui-modal__title">{title}</span>
            <button
              className="ui-modal__close"
              onClick={onClose}
              aria-label="關閉"
            >
              <X size={16} />
            </button>
          </div>
        )}
        <div className="ui-modal__body">{children}</div>
        {footer && <div className="ui-modal__footer">{footer}</div>}
      </div>
    </div>
  );
}
