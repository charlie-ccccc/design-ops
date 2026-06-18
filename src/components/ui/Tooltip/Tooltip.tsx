'use client';
import { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './Tooltip.css';

interface InfoTooltipProps {
  content: string;
  position?: 'top' | 'bottom';
}

export function InfoTooltip({ content, position = 'top' }: InfoTooltipProps) {
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);

  const show = useCallback(() => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setCoords({ x: r.left + r.width / 2, y: position === 'top' ? r.top : r.bottom });
  }, [position]);

  const hide = useCallback(() => setCoords(null), []);

  return (
    <span
      ref={triggerRef}
      className="ui-tooltip-wrap"
      onMouseEnter={show}
      onMouseLeave={hide}
      onClick={e => { e.stopPropagation(); coords ? hide() : show(); }}
    >
      <span className="ui-tooltip-trigger" aria-label="說明">!</span>
      {coords && createPortal(
        <span
          className={`ui-tooltip-bubble ui-tooltip-bubble--${position}`}
          style={position === 'top'
            ? { left: coords.x, top: coords.y - 8, transform: 'translateX(-50%) translateY(-100%)' }
            : { left: coords.x, top: coords.y + 8, transform: 'translateX(-50%)' }
          }
        >
          {content}
        </span>,
        document.body,
      )}
    </span>
  );
}
