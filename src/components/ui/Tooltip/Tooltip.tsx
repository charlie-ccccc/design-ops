'use client';
import { useState } from 'react';
import './Tooltip.css';

interface InfoTooltipProps {
  content: string;
  position?: 'top' | 'bottom';
}

export function InfoTooltip({ content, position = 'top' }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className="ui-tooltip-wrap"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
    >
      <span className="ui-tooltip-trigger" aria-label="說明">!</span>
      <span className={['ui-tooltip-bubble', `ui-tooltip-bubble--${position}`, open && 'ui-tooltip-bubble--open'].filter(Boolean).join(' ')}>
        {content}
      </span>
    </span>
  );
}
