'use client';
import React from 'react';
import type { Member } from '@/lib/types';
import { hue } from '@/lib/utils';
import { MemberCell } from '@/components/ui/MemberCell/MemberCell';

interface ColDef {
  id: string;
  name: string;
  full?: string;
}

interface CrosstabProps {
  rows: Member[];
  cols: ColDef[];
  getCell: (row: Member, col: ColDef) => number;
  getRowTotal: (row: Member) => number;
  getColTotal: (col: ColDef) => number;
  grandTotal: number;
  unit?: string;
  onCellClick?: (row: Member, col: ColDef) => void;
  onRowClick?: (row: Member) => void;
  onColClick?: (col: ColDef) => void;
}

export default function Crosstab({
  rows,
  cols,
  getCell,
  getRowTotal,
  getColTotal,
  grandTotal,
  unit = 'h',
  onCellClick,
  onRowClick,
  onColClick,
}: CrosstabProps) {
  // Find max cell value for heatmap
  let max = 1;
  for (const row of rows) {
    for (const col of cols) {
      const v = getCell(row, col);
      if (v > max) max = v;
    }
  }

  return (
    <div className="xtab-wrap">
      <table className="xtab">
        <thead>
          <tr>
            <th>成員</th>
            {cols.map((col) => (
              <th key={col.id} title={col.full || col.name}
                style={onColClick ? { cursor: 'pointer' } : undefined}
                onClick={() => onColClick?.(col)}>
                {col.name}
              </th>
            ))}
            <th>合計</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const rowTotal = getRowTotal(row);
            return (
              <tr key={row.id}>
                <td style={onRowClick ? { cursor: 'pointer' } : undefined}
                  onClick={() => onRowClick?.(row)}>
                  <MemberCell photo={row.photo} name={row.name} initial={row.initial} color={hue(row.hue)} />
                </td>
                {cols.map((col) => {
                  const v = getCell(row, col);
                  const opacity = v > 0 ? 0.06 + (v / max) * 0.18 : 0;
                  return (
                    <td key={col.id} className={`cell-num heat${v === 0 ? ' zero' : ''}`}
                      style={onCellClick && v > 0 ? { cursor: 'pointer' } : undefined}
                      onClick={() => v > 0 && onCellClick?.(row, col)}>
                      <div className="heat-bg" style={{ opacity }} />
                      <div className="heat-v">{v === 0 ? '—' : `${v}${unit}`}</div>
                    </td>
                  );
                })}
                <td className="cell-num" style={onRowClick ? { cursor: 'pointer' } : undefined}
                  onClick={() => onRowClick?.(row)}>
                  {rowTotal > 0 ? `${rowTotal}${unit}` : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td>合計</td>
            {cols.map((col) => {
              const v = getColTotal(col);
              return (
                <td key={col.id}>
                  {v > 0 ? `${v}${unit}` : '—'}
                </td>
              );
            })}
            <td>{grandTotal > 0 ? `${grandTotal}${unit}` : '—'}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
