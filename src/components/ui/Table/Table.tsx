import React from 'react';
import './Table.css';

export interface TableColumn<T = unknown> {
  key: string;
  header: React.ReactNode;
  align?: 'left' | 'right' | 'center';
  width?: string | number;
  minWidth?: string | number;
  render?: (row: T, index: number) => React.ReactNode;
  footer?: React.ReactNode;
}

export interface TableProps<T = unknown> {
  columns: TableColumn<T>[];
  rows: T[];
  getKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  isRowHighlighted?: (row: T) => boolean;
  emptyText?: string;
  maxHeight?: string | number;
  stickyHeader?: boolean;
  stickyFirstCol?: boolean;
  hasFooter?: boolean;
  className?: string;
}

export function Table<T = unknown>({
  columns,
  rows,
  getKey,
  onRowClick,
  isRowHighlighted,
  emptyText = '沒有資料',
  maxHeight,
  stickyHeader = true,
  stickyFirstCol = false,
  hasFooter,
  className,
}: TableProps<T>) {
  const showFooter = hasFooter ?? columns.some(c => c.footer !== undefined);

  return (
    <div
      className="ui-table-wrap"
      data-sticky-header={stickyHeader ? '1' : '0'}
      style={maxHeight ? { maxHeight } : undefined}
    >
      <table
        className={['ui-table', className].filter(Boolean).join(' ')}
        data-sticky-header={stickyHeader ? '1' : '0'}
        data-sticky-col={stickyFirstCol ? '1' : '0'}
      >
        <thead>
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                data-align={col.align ?? 'right'}
                style={{
                  width: col.width,
                  minWidth: col.minWidth,
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr className="ui-table-empty">
              <td colSpan={columns.length}>{emptyText}</td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr
                key={getKey(row)}
                data-clickable={onRowClick ? '1' : '0'}
                data-highlight={isRowHighlighted?.(row) ? '1' : '0'}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map(col => (
                  <td key={col.key} data-align={col.align ?? 'right'}>
                    {col.render ? col.render(row, i) : String((row as Record<string, unknown>)[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>

        {showFooter && (
          <tfoot>
            <tr>
              {columns.map(col => (
                <td key={col.key} data-align={col.align ?? 'right'}>
                  {col.footer ?? '—'}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
