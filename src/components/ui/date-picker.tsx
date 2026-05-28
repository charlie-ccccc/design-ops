'use client';
import React, { useState, useEffect, useRef } from 'react';

interface DatePickerProps {
  value: string;           // "YYYY-MM-DD" or ""
  onChange: (val: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export function DatePicker({ value, onChange, disabled, placeholder = '選擇日期' }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const selectedDate = value ? new Date(value + 'T00:00:00') : null;
  const todayStr = (() => {
    const n = new Date();
    const p = (x: number) => String(x).padStart(2, '0');
    return `${n.getFullYear()}-${p(n.getMonth() + 1)}-${p(n.getDate())}`;
  })();

  useEffect(() => {
    if (value) {
      const parts = value.split('-');
      setViewYear(parseInt(parts[0]));
      setViewMonth(parseInt(parts[1]) - 1);
    }
  }, [value]);

  function openPicker() {
    if (disabled || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const left = Math.min(rect.left, window.innerWidth - 292);
    const top = rect.bottom + 6;
    setPos({ top, left });
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (
        btnRef.current?.contains(e.target as Node) ||
        popupRef.current?.contains(e.target as Node)
      ) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function pad(x: number) { return String(x).padStart(2, '0'); }

  function cellDateStr(day: number) {
    return `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}`;
  }

  function selectDay(day: number) {
    onChange(cellDateStr(day));
    setOpen(false);
  }

  function goToday() {
    const n = new Date();
    onChange(todayStr);
    setViewYear(n.getFullYear());
    setViewMonth(n.getMonth());
    setOpen(false);
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  const displayValue = selectedDate
    ? `${selectedDate.getFullYear()}/${pad(selectedDate.getMonth() + 1)}/${pad(selectedDate.getDate())}`
    : '';

  const navBtn: React.CSSProperties = {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--muted)', padding: '4px 10px', borderRadius: 6, fontSize: 16,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  };
  const footBtn: React.CSSProperties = {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--muted)', fontSize: 13, padding: '4px 8px', borderRadius: 6,
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className="input"
        disabled={disabled}
        onClick={openPicker}
        style={{
          cursor: disabled ? 'default' : 'pointer',
          textAlign: 'left',
          color: displayValue ? 'var(--ink)' : 'var(--muted-2)',
          userSelect: 'none',
        }}
      >
        {displayValue || placeholder}
      </button>

      {open && (
        <div
          ref={popupRef}
          style={{
            position: 'fixed',
            top: pos.top,
            left: pos.left,
            zIndex: 9000,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            boxShadow: '0 12px 40px rgba(0,0,0,.15)',
            padding: '14px 14px 10px',
            width: 280,
          }}
        >
          {/* Month nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <button onClick={prevMonth} style={navBtn}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}>‹</button>
            <span style={{ fontSize: 14, fontWeight: 600 }}>
              {viewYear}年 {viewMonth + 1}月
            </span>
            <button onClick={nextMonth} style={navBtn}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}>›</button>
          </div>

          {/* Weekday headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 4 }}>
            {WEEKDAYS.map(w => (
              <div key={w} style={{ textAlign: 'center', fontSize: 11, color: 'var(--muted)', padding: '2px 0' }}>{w}</div>
            ))}
          </div>

          {/* Day grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
            {cells.map((day, i) => {
              if (day === null) return <div key={`e${i}`} />;
              const ds = cellDateStr(day);
              const isSel = ds === value;
              const isToday = ds === todayStr;
              return (
                <button
                  key={day}
                  onClick={() => selectDay(day)}
                  style={{
                    border: 'none',
                    borderRadius: 7,
                    padding: '7px 0',
                    fontSize: 13,
                    cursor: 'pointer',
                    textAlign: 'center',
                    background: isSel ? 'var(--accent)' : 'none',
                    color: isSel ? '#fff' : isToday ? 'var(--accent)' : 'var(--ink)',
                    fontWeight: isSel || isToday ? 600 : 400,
                    outline: isToday && !isSel ? '1.5px solid var(--accent)' : 'none',
                    outlineOffset: -1.5,
                  }}
                  onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = 'var(--surface-2)'; }}
                  onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = 'none'; }}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--divider)' }}>
            <button onClick={() => { onChange(''); setOpen(false); }} style={footBtn}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--muted)')}>
              清除
            </button>
            <button onClick={goToday} style={{ ...footBtn, color: 'var(--accent)' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
              今天
            </button>
          </div>
        </div>
      )}
    </>
  );
}
