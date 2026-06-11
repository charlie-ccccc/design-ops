'use client';
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface LeaveCalendarDot {
  id: string;
  color: string;
}

export interface LeaveCalendarProps {
  year: number;
  month: number;
  holidays?: Set<string>;
  leaveDots?: Record<string, LeaveCalendarDot[]>;
  selectedDate?: string | null;
  onSelect?: (date: string | null) => void;
  showNav?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
}

const WEEKDAY_HDRS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function LeaveCalendar({
  year, month, holidays = new Set(), leaveDots = {},
  selectedDate, onSelect, showNav, onPrev, onNext,
}: LeaveCalendarProps) {
  const today = new Date();
  const isThisMonth = today.getFullYear() === year && today.getMonth() + 1 === month;
  const todayKey = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDow = new Date(year, month - 1, 1).getDay();
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7) cells.push(null);

  function dateKey(day: number) {
    return `${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
  }

  return (
    <div>
      {showNav && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 2px' }}>
          <button
            onClick={onPrev}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--md-sys-color-on-surface-secondary)', display: 'flex', padding: 4, borderRadius: 6 }}
          >
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: 14, fontWeight: 600 }}>
            {year}年 {month}月
          </span>
          <button
            onClick={onNext}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--md-sys-color-on-surface-secondary)', display: 'flex', padding: 4, borderRadius: 6 }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      <div className="cal-grid">
        {WEEKDAY_HDRS.map(d => (
          <div key={d} className="cal-hdr">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} />;
          const col = i % 7;
          const isWeekend = col === 0 || col === 6;
          const dk = dateKey(day);
          const isHoliday = holidays.has(dk);
          const isNonWorking = isWeekend || isHoliday;
          const isToday = isThisMonth && dk === todayKey;
          const isSel = selectedDate === dk;
          const dots = leaveDots[dk] ?? [];

          const cls = [
            'cal-day',
            isNonWorking ? 'weekend' : 'clickable',
            isToday ? 'today' : '',
            isSel ? 'selected' : '',
            isHoliday && !isWeekend ? 'holiday' : '',
          ].filter(Boolean).join(' ');

          return (
            <div
              key={i}
              className={cls}
              onClick={() => !isNonWorking && onSelect?.(isSel ? null : dk)}
            >
              <div className="cal-n">{day}</div>
              {dots.length > 0 && (
                <div className="cal-dots">
                  {dots.slice(0, 4).map((dot, j) => (
                    <div
                      key={j}
                      style={{ width: 4, height: 4, borderRadius: '50%', flexShrink: 0, background: dot.color }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export interface LeaveCalendarControlledProps extends Omit<LeaveCalendarProps, 'selectedDate' | 'onSelect' | 'showNav' | 'onPrev' | 'onNext'> {
  initialYear?: number;
  initialMonth?: number;
}

export function LeaveCalendarControlled({ initialYear, initialMonth, ...rest }: LeaveCalendarControlledProps) {
  const now = new Date();
  const [year, setYear] = useState(initialYear ?? now.getFullYear());
  const [month, setMonth] = useState(initialMonth ?? now.getMonth() + 1);
  const [selected, setSelected] = useState<string | null>(null);

  function prev() {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function next() {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  return (
    <LeaveCalendar
      {...rest}
      year={year}
      month={month}
      selectedDate={selected}
      onSelect={setSelected}
      showNav
      onPrev={prev}
      onNext={next}
    />
  );
}
