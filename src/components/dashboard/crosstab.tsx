'use client';
import React from 'react';
import type { Member } from '@/lib/types';
import { hue } from '@/lib/utils';

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
}

export default function Crosstab({
  rows,
  cols,
  getCell,
  getRowTotal,
  getColTotal,
  grandTotal,
  unit = 'h',
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
              <th key={col.id} title={col.full || col.name}>
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
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      className="av av-sm"
                      style={{ background: hue(row.hue) }}
                    >
                      {row.initial}
                    </div>
                    <span style={{ fontSize: 12.5 }}>{row.name}</span>
                  </div>
                </td>
                {cols.map((col) => {
                  const v = getCell(row, col);
                  const opacity = v > 0 ? 0.06 + (v / max) * 0.18 : 0;
                  return (
                    <td key={col.id} className={`cell-num heat${v === 0 ? ' zero' : ''}`}>
                      <div className="heat-bg" style={{ opacity }} />
                      <div className="heat-v">{v === 0 ? '—' : `${v}${unit}`}</div>
                    </td>
                  );
                })}
                <td className="cell-num">
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
