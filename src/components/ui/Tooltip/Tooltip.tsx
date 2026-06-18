'use client';
import { useState, useRef, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './Tooltip.css';

interface InfoTooltipProps {
  content: string;
  position?: 'top' | 'bottom';
}

interface BubbleState {
  triggerX: number;
  y: number;
  position: 'top' | 'bottom';
}

const PADDING = 8;
const ARROW_MIN_OFFSET = 14;

export function InfoTooltip({ content, position = 'top' }: InfoTooltipProps) {
  const [bubble, setBubble] = useState<BubbleState | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const [bubbleLeft, setBubbleLeft] = useState(0);
  const [arrowOffset, setArrowOffset] = useState(0);
  const [ready, setReady] = useState(false);

  const show = useCallback(() => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    setReady(false);
    setBubble({
      triggerX: r.left + r.width / 2,
      y: position === 'top' ? r.top : r.bottom,
      position,
    });
  }, [position]);

  const hide = useCallback(() => {
    setBubble(null);
    setReady(false);
  }, []);

  // After bubble renders, measure actual width and clamp
  useLayoutEffect(() => {
    if (!bubble || !bubbleRef.current) return;
    const w = bubbleRef.current.offsetWidth;
    const raw = bubble.triggerX - w / 2;
    const clamped = Math.max(PADDING, Math.min(raw, window.innerWidth - w - PADDING));
    const arrow = Math.max(ARROW_MIN_OFFSET, Math.min(bubble.triggerX - clamped, w - ARROW_MIN_OFFSET));
    setBubbleLeft(clamped);
    setArrowOffset(arrow);
    setReady(true);
  }, [bubble]);

  return (
    <span
      ref={triggerRef}
      className="ui-tooltip-wrap"
      onMouseEnter={show}
      onMouseLeave={hide}
      onClick={e => { e.stopPropagation(); bubble ? hide() : show(); }}
    >
      <span className="ui-tooltip-trigger" aria-label="說明">!</span>
      {bubble && createPortal(
        <span
          ref={bubbleRef}
          className={`ui-tooltip-bubble ui-tooltip-bubble--${bubble.position}`}
          style={{
            left: bubbleLeft,
            top: bubble.position === 'top' ? bubble.y - 8 : bubble.y + 8,
            transform: bubble.position === 'top' ? 'translateY(-100%)' : undefined,
            opacity: ready ? 1 : 0,
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
