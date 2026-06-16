'use client';
import React, { useState, useMemo, useRef } from 'react';
import type { Card, Cat, CardStatus, Priority } from '@/lib/types';
import type { AppUser } from '@/contexts/auth-context';
import { formatId } from '@/lib/utils';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Modal } from '@/components/ui/Modal/Modal';
import { Table } from '@/components/ui/Table/Table';
import type { TableColumn } from '@/components/ui/Table/Table';

const VALID_PRIO: Priority[] = ['urgent', 'high', 'normal', 'low', 'lowest'];
const VALID_CAT: Cat[] = ['UIUX', '平面視覺'];

const COL_MAP: Record<string, string> = {
  '摘要': 'title', 'summary': 'title',
  '截止日期': 'dateRaw', 'due date': 'dateRaw', 'due': 'dateRaw',
  '受托人': 'ownerName', '受讓人': 'ownerName', 'assignee': 'ownerName',
  '回報者': 'requesterName', '報告人': 'requesterName', 'reporter': 'requesterName',
  '優先順序': 'jiraprio', 'priority': 'jiraprio', 'prio': 'jiraprio',
  '描述': 'desc', 'description': 'desc',
  '需求發起單位': 'dept',
  '需求執行單位': 'execUnit',
  'title': 'title', 'dept': 'dept', 'cat': 'cat', 'status': 'status',
  'est': 'est', 'actual': 'actual', 'requesterName': 'requesterName', 'ownerName': 'ownerName',
};

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQ && text[i + 1] === '"') { cur += '"'; i++; }
      else { inQ = !inQ; }
    } else if (ch === ',' && !inQ) {
      row.push(cur); cur = '';
    } else if ((ch === '\r' || ch === '\n') && !inQ) {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cur); cur = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else {
      cur += ch;
    }
  }
  row.push(cur);
  if (row.length > 1 || row[0] !== '') rows.push(row);
  return rows;
}

function parseFullDate(raw: string): { month: string; due: string } | null {
  const pad = (n: string) => n.padStart(2, '0');
  const slash = raw.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})/);
  if (slash) return { month: `${slash[1]}/${pad(slash[2])}`, due: `${pad(slash[2])}/${pad(slash[3])}` };
  const dash = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (dash) return { month: `${dash[1]}/${dash[2]}`, due: `${dash[2]}/${dash[3]}` };
  return null;
}

function mapPriority(raw: string): Priority {
  const p = raw.trim();
  if (['最高', 'highest'].includes(p)) return 'urgent';
  if (['高', 'high'].includes(p)) return 'high';
  if (['一般', '中', 'medium', 'normal', 'mid'].includes(p)) return 'normal';
  if (['低', 'low'].includes(p)) return 'low';
  if (['最低', 'lowest'].includes(p)) return 'lowest';
  return VALID_PRIO.includes(p as Priority) ? p as Priority : 'normal';
}

function chineseChars(s: string) {
  return s.replace(/[^一-鿿]/g, '');
}

function findDept(raw: string, depts: string[]): string {
  if (!raw || depts.includes(raw)) return raw;
  return depts.find(d => raw.includes(d) || d.includes(raw)) ?? raw;
}

function findOwner(name: string, users: AppUser[]): AppUser | null {
  if (!name) return null;
  const cn = chineseChars(name);
  return users.find(u => u.name === name)
    ?? users.find(u => name.includes(u.name) || u.name.includes(name))
    ?? (cn ? users.find(u => chineseChars(u.name) === cn) : null)
    ?? null;
}

interface ImportCsvModalProps {
  open: boolean;
  onClose: () => void;
  allCards: Card[];
  siteUsers: AppUser[];
  depts: string[];
  onImportCards: (cards: Card[]) => Promise<void>;
}

export function ImportCsvModal({ open, onClose, allCards, siteUsers, depts, onImportCards }: ImportCsvModalProps) {
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [batchDept, setBatchDept] = useState('');
  const [batchCat, setBatchCat] = useState<Cat>('UIUX');
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(0);
  const [fileName, setFileName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function reset() {
    setRawRows([]);
    setBatchDept('');
    setBatchCat('UIUX');
    setImporting(false);
    setImported(0);
    setFileName('');
    if (fileRef.current) fileRef.current.value = '';
  }

  function handleClose() {
    reset();
    onClose();
  }

function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = (ev.target?.result as string ?? '').replace(/^﻿/, '');
      const allRows = parseCSV(text);
      if (allRows.length < 2) { setRawRows([]); return; }
      const rawHeaders = allRows[0].map(h => h.trim());
      const mappedHeaders = rawHeaders.map(h => COL_MAP[h.toLowerCase()] ?? COL_MAP[h] ?? h);
      const dataRows = allRows.slice(1).map(vals =>
        Object.fromEntries(mappedHeaders.map((h, j) => [h, vals[j]?.trim() ?? '']))
      );
      setRawRows(dataRows);
      setFileName(file.name);
      setImported(0);
    };
    reader.readAsText(file, 'UTF-8');
  }

  const { preview, errors } = useMemo(() => {
    if (rawRows.length === 0) return { preview: [] as Card[], errors: [] as string[] };
    const errs: string[] = [];
    let maxN = allCards.reduce((m, c) => { const n = parseInt(c.id.replace('DESIGN-', ''), 10); return isNaN(n) ? m : Math.max(m, n); }, 0);
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const createdAt = `${now.getFullYear()}/${pad(now.getMonth()+1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const parsed: Card[] = [];

    rawRows.forEach((row, i) => {
      const rowNum = i + 2;
      const title = row.title;
      if (!title) { errs.push(`第 ${rowNum} 行：標題（摘要）為空，略過`); return; }

      const parsed_date = parseFullDate(row.dateRaw ?? '');
      if (!parsed_date) { errs.push(`第 ${rowNum} 行「${title}」：截止日期無法辨識（${row.dateRaw || '空白'}），略過`); return; }

      const dept = findDept(row.dept || batchDept, depts);

      const execUnit = row.execUnit ?? '';
      const cat: Cat = execUnit.includes('平面視覺') ? '平面視覺'
        : execUnit.includes('UIUX') ? 'UIUX'
        : VALID_CAT.includes(row.cat as Cat) ? row.cat as Cat
        : batchCat;

      const prio = row.jiraprio ? mapPriority(row.jiraprio) : (VALID_PRIO.includes(row.prio as Priority) ? row.prio as Priority : 'normal');
      const ownerUser = findOwner(row.ownerName ?? '', siteUsers);
      if (row.ownerName && !ownerUser) errs.push(`第 ${rowNum} 行「${title}」：受託人「${row.ownerName}」比對不到系統用戶，將留空`);

      maxN += 1;
      parsed.push({
        id: formatId(maxN),
        month: parsed_date.month,
        title,
        dept,
        cat,
        owner: ownerUser?.uid ?? '',
        est: parseFloat(row.est ?? '') || 0,
        actual: parseFloat(row.actual ?? '') || 0,
        requesterName: row.requesterName || '',
        status: 'belog' as CardStatus,
        prio,
        due: parsed_date.due,
        desc: row.desc || '',
        attach: 0,
        activity: [{ who: '系統', msg: '透過 CSV 匯入', t: createdAt }],
        createdAt,
      });
    });
    return { preview: parsed, errors: errs };
  }, [rawRows, batchDept, batchCat, siteUsers, depts, allCards]);

  async function handleImport() {
    setImporting(true);
    await onImportCards(preview);
    setImported(preview.length);
    setImporting(false);
    setRawRows([]);
    if (fileRef.current) fileRef.current.value = '';
  }

  const previewColumns: TableColumn<Card>[] = [
    { key: 'id', header: 'ID', minWidth: '90px', render: (c: Card) => <span style={{ fontSize: 12, fontFamily: 'var(--font-mono,monospace)', color: 'var(--md-sys-color-on-surface-secondary)' }}>{c.id}</span> },
    { key: 'title', header: '標題', align: 'left', minWidth: '180px' },
    { key: 'dept', header: '發起單位', align: 'left' },
    { key: 'cat', header: '類別' },
    { key: 'month', header: '月份' },
    { key: 'due', header: '截止日' },
    { key: 'owner', header: '受託人', align: 'left', render: (c: Card) => siteUsers.find(u => u.uid === c.owner)?.name ?? (c.owner ? <span style={{ color: 'var(--st-block)' }}>⚠</span> : '—') },
    { key: 'prio', header: '優先' },
  ];

  return (
    <Modal open={open} onClose={handleClose} title="匯入 CSV" size="lg">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} style={{ display: 'none' }} />
            <Button variant="ghost" onClick={() => fileRef.current?.click()}>選擇 CSV 檔案</Button>
            {fileName && (
              <span style={{ fontSize: 13, color: 'var(--md-sys-color-on-surface-muted)' }}>{fileName}</span>
            )}
          </div>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--md-sys-color-on-surface-muted)', lineHeight: 1.6 }}>
            從{' '}
            <a href="https://docs.google.com/spreadsheets/d/1vIrjarmRDNQG-E3TlEYlEHPIsoBxz0otwK-2q9eS2q0/edit?gid=0#gid=0" target="_blank" rel="noreferrer" style={{ color: 'var(--md-sys-color-primary)' }}>
              Google Sheets
            </a>
            {' '}匯出 CSV 後上傳，欄位自動對應，匯入後狀態為「待審核」。
          </p>
        </div>

        {rawRows.length > 0 && (
          <div style={{ padding: '14px 16px', background: 'var(--md-sys-color-surface-variant)', borderRadius: 10, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ fontSize: 13, fontWeight: 600, width: '100%', marginBottom: -4 }}>批次預設值（CSV 沒有的欄位，統一套用）</div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--md-sys-color-on-surface-muted)', marginBottom: 4 }}>發起單位 <span style={{ color: 'var(--st-block)' }}>*必填</span></div>
              <Input style={{ width: 140 }} value={batchDept} onChange={e => setBatchDept((e.target as HTMLInputElement).value)} placeholder="例：行銷" />
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--md-sys-color-on-surface-muted)', marginBottom: 4 }}>類別</div>
              <Input as="select" style={{ width: 120 }} value={batchCat} onChange={e => setBatchCat((e.target as HTMLSelectElement).value as Cat)}>
                <option value="UIUX">UIUX</option>
                <option value="平面視覺">平面視覺</option>
              </Input>
            </div>
            <div style={{ fontSize: 13, color: 'var(--md-sys-color-on-surface-muted)' }}>
              已讀入 {rawRows.length} 列 → 可匯入 {preview.length} 筆
            </div>
          </div>
        )}

        {errors.length > 0 && (
          <div style={{ padding: '10px 14px', background: 'color-mix(in oklab, var(--st-block) 10%, transparent)', borderRadius: 8, border: '1px solid color-mix(in oklab, var(--st-block) 25%, transparent)' }}>
            <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--st-block)', fontSize: 13 }}>⚠ {errors.length} 個問題</div>
            {errors.map((e, i) => <div key={i} style={{ fontSize: 13, color: 'var(--st-block)', lineHeight: 1.8 }}>{e}</div>)}
          </div>
        )}

        {preview.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>預覽 {preview.length} 筆</span>
              {importing
                ? <span style={{ fontSize: 13, color: 'var(--md-sys-color-on-surface-muted)' }}>匯入中…</span>
                : <Button variant="primary" onClick={handleImport}>確認匯入 {preview.length} 筆</Button>
              }
            </div>
            <Table columns={previewColumns} rows={preview} getKey={c => c.id} emptyText="無資料" />
          </div>
        )}

        {imported > 0 && !importing && (
          <div style={{ padding: '10px 14px', background: 'color-mix(in oklab, var(--st-done) 12%, transparent)', borderRadius: 8, border: '1px solid color-mix(in oklab, var(--st-done) 30%, transparent)', fontSize: 14 }}>
            ✓ 已成功匯入 {imported} 筆卡片
          </div>
        )}

      </div>
    </Modal>
  );
}
