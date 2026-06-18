'use client';
import { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './Tooltip.css';

interface InfoTooltipProps {
  content: string;
  position?: 'top' | 'bottom';
}

interface BubbleState {
  triggerX: number;   // trigger center X in viewport
  bubbleLeft: number; // clamped bubble left edge
  y: number;
}

const BUBBLE_MAX_W = 240;
const ARROW_MIN_OFFSET = 14; // min px from bubble edge to arrow center

export function InfoTooltip({ content, position = 'top' }: InfoTooltipProps) {
  const [state, setState] = useState<BubbleState | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);

  const show = useCallback(() => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const triggerX = r.left + r.width / 2;
    const estimatedW = Math.min(BUBBLE_MAX_W, content.length * 7 + 24);
    const raw = triggerX - estimatedW / 2;
    const bubbleLeft = Math.max(8, Math.min(raw, window.innerWidth - estimatedW - 8));
    setState({
      triggerX,
      bubbleLeft,
      y: position === 'top' ? r.top : r.bottom,
    });
  }, [position, content]);

  const hide = useCallback(() => setState(null), []);

  // arrow offset: where the trigger center falls within the bubble
  const arrowOffset = state
    ? Math.max(ARROW_MIN_OFFSET, Math.min(state.triggerX - state.bubbleLeft, BUBBLE_MAX_W - ARROW_MIN_OFFSET))
    : 0;

  return (
    <span
      ref={triggerRef}
      className="ui-tooltip-wrap"
      onMouseEnter={show}
      onMouseLeave={hide}
      onClick={e => { e.stopPropagation(); state ? hide() : show(); }}
    >
      <span className="ui-tooltip-trigger" aria-label="說明">!</span>
      {state && createPortal(
        <span
          className={`ui-tooltip-bubble ui-tooltip-bubble--${position}`}
          style={{
            left: state.bubbleLeft,
            top: position === 'top' ? state.y - 8 : state.y + 8,
            transform: position === 'top' ? 'translateY(-100%)' : undefined,
            ['--arrow-offset' as string]: `${arrowOffset}px`,
          }}
        >
          {content}
        </span>,
        document.body,
      )}
    </span>
  );
}
