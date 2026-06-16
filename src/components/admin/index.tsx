'use client';
import React, { useState, useMemo, useRef } from 'react';
import { Trash2, X, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import type { Card, LeaveEntry, PublicHoliday, Cat, Member, CardStatus, Priority } from '@/lib/types';
import type { AppUser } from '@/contexts/auth-context';
import { DEPT_SHORT, DEPT_HUE } from '@/lib/data';
import { sum, hue, shiftMonth, formatId } from '@/lib/utils';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Modal } from '@/components/ui/Modal/Modal';
import { FormRow } from '@/components/ui/FormRow/FormRow';
import { Tag } from '@/components/ui/Badge/Badge';
import { Table } from '@/components/ui/Table/Table';
import type { TableColumn } from '@/components/ui/Table/Table';
import { LeaveCalendar } from '@/components/ui/LeaveCalendar/LeaveCalendar';
import type { LeaveCalendarDot } from '@/components/ui/LeaveCalendar/LeaveCalendar';
import { MemberCell } from '@/components/ui/MemberCell/MemberCell';

type CatFilter = 'all' | Cat;
type MainTab = 'capacity' | 'members' | 'leave' | 'import';

const TIME_SLOTS: { label: string; min: number }[] = [];
for (let m = 8 * 60 + 30; m <= 18 * 60; m += 30) {
  TIME_SLOTS.push({
    label: `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`,
    min: m,
  });
}

function dayHours(startMin: number, endMin: number): number {
  if (startMin >= endMin) return 0;
  const morning = Math.max(0, Math.min(endMin, 720) - startMin);
  const afternoon = Math.max(0, endMin - Math.max(startMin, 810));
  return (morning + afternoon) / 60;
}

function calcLeaveHours(
  startDate: string, startMin: number,
  endDate: string, endMin: number,
  holidays: Array<{ date: string }>,
  year: number,
): number {
  const [smo, sday] = startDate.split('/').map(Number);
  const [emo, eday] = endDate.split('/').map(Number);
  const start = new Date(year, smo - 1, sday);
  const end   = new Date(year, emo - 1, eday);
  if (start > end) return 0;
  const holSet = new Set(holidays.map(h => h.date));
  let total = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const dow = cur.getDay();
    const key = `${String(cur.getMonth() + 1).padStart(2, '0')}/${String(cur.getDate()).padStart(2, '0')}`;
    if (dow !== 0 && dow !== 6 && !holSet.has(key)) {
      const isFirst = cur.getTime() === start.getTime();
      const isLast  = cur.getTime() === end.getTime();
      total += dayHours(isFirst ? startMin : 510, isLast ? endMin : 1080);
    }
    cur.setDate(cur.getDate() + 1);
  }
  return Math.round(total * 10) / 10;
}

function dateRangeLabel(date: string, endDate?: string) {
  if (!endDate || endDate === date) return date;
  const [sm] = date.split('/');
  const [em, ed] = endDate.split('/');
  return sm === em ? `${date}→${ed}` : `${date}→${endDate}`;
}

// ── CSV Import ─────────────────────────────────────────────────
const VALID_STATUS: CardStatus[] = ['belog', 'todo', 'designing', 'reviewing', 'done', 'pending'];
const VALID_PRIO: Priority[]     = ['urgent', 'high', 'normal', 'low', 'lowest'];
const VALID_CAT: Cat[]           = ['UIUX', '平面視覺'];

// Jira 中文欄位名稱 → 我們的欄位名稱
const COL_MAP: Record<string, string> = {
  '摘要': 'title', 'summary': 'title',
  '截止日期': 'dateRaw', 'due date': 'dateRaw', 'due': 'dateRaw',
  '受托人': 'ownerName', '受讓人': 'ownerName', 'assignee': 'ownerName',
  '回報者': 'requesterName', '報告人': 'requesterName', 'reporter': 'requesterName',
  '優先順序': 'jiraprio', 'priority': 'jiraprio', 'prio': 'jiraprio',
  '描述': 'desc', 'description': 'desc',
  '需求發起單位': 'dept',
  '需求執行單位': 'execUnit',
  // 我們自己範本的欄位直接 pass-through
  'title': 'title', 'dept': 'dept', 'cat': 'cat', 'status': 'status',
  'est': 'est', 'actual': 'actual', 'requesterName': 'requesterName', 'ownerName': 'ownerName',
};

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQ = false;
  for (const ch of line) {
    if (ch === '"') { inQ = !inQ; }
    else if (ch === ',' && !inQ) { result.push(cur); cur = ''; }
    else { cur += ch; }
  }
  result.push(cur);
  return result;
}

// 解析 Jira 日期 "2026/6/24" 或 "2026-06-24" → { month: "2026/06", due: "06/24" }
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

// 模糊比對：「王映蒂Annie_Wei」→ 系統裡的「王映蒂」
function findOwner(name: string, users: AppUser[]): AppUser | null {
  if (!name) return null;
  return users.find(u => u.name === name)
    ?? users.find(u => name.includes(u.name) || u.name.includes(name))
    ?? null;
}

function ImportPanel({ allCards, siteUsers, onImportCards }: {
  allCards: Card[];
  siteUsers: AppUser[];
  onImportCards: (cards: Card[]) => Promise<void>;
}) {
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [batchDept, setBatchDept] = useState('');
  const [batchCat, setBatchCat] = useState<Cat>('UIUX');
  const [batchStatus, setBatchStatus] = useState<CardStatus>('belog');
  const [rowErrors, setRowErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  function downloadTemplate() {
    const headers = 'title,dept,cat,status,prio,due,est,actual,desc,requesterName,ownerName';
    const example = '設計新版首頁,行銷,UIUX,todo,normal,2026/06/24,8,0,需求說明,委託人姓名,受託人姓名';
    const csv = '﻿' + headers + '\n' + example;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'card-import-template.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = (ev.target?.result as string ?? '').replace(/^﻿/, '');
      const lines = text.trim().split(/\r?\n/);
      if (lines.length < 2) { setRowErrors(['CSV 格式錯誤或無資料']); setRawRows([]); return; }
      const rawHeaders = parseCSVLine(lines[0]).map(h => h.trim());
      const mappedHeaders = rawHeaders.map(h => COL_MAP[h.toLowerCase()] ?? COL_MAP[h] ?? h);
      const dataRows = lines.slice(1)
        .filter(l => l.trim() && !l.trim().startsWith('#'))
        .map(line => {
          const vals = parseCSVLine(line);
          return Object.fromEntries(mappedHeaders.map((h, j) => [h, vals[j]?.trim() ?? '']));
        });
      setRawRows(dataRows);
      setRowErrors([]);
      setImported(0);
    };
    reader.readAsText(file, 'UTF-8');
  }

  // 每次 rawRows 或批次設定改變都重新計算 preview
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

      const dateStr = row.dateRaw ?? '';
      const parsed_date = parseFullDate(dateStr);
      if (!parsed_date) { errs.push(`第 ${rowNum} 行「${title}」：截止日期格式無法辨識（${dateStr || '空白'}），略過`); return; }

      const dept = row.dept || batchDept;
      if (!dept) { errs.push(`第 ${rowNum} 行「${title}」：缺少 dept，請在下方填入批次預設值`); return; }

      const execUnit = row.execUnit ?? '';
      const cat: Cat = execUnit.includes('平面視覺') ? '平面視覺'
        : execUnit.includes('UIUX') ? 'UIUX'
        : VALID_CAT.includes(row.cat as Cat) ? row.cat as Cat
        : batchCat;
      const status: CardStatus = 'belog';
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
        status,
        prio,
        due: parsed_date.due,
        desc: row.desc || '',
        attach: 0,
        activity: [{ who: '系統', msg: '透過 CSV 匯入', t: createdAt }],
        createdAt,
      });
    });
    return { preview: parsed, errors: errs };
  }, [rawRows, batchDept, batchCat, batchStatus, siteUsers, allCards]);

  async function handleImport() {
    setImporting(true);
    await onImportCards(preview);
    setImported(preview.length);
    setImporting(false);
    setRawRows([]);
    setRowErrors([]);
    if (fileRef.current) fileRef.current.value = '';
  }

  const previewColumns = [
    { key: 'id', header: 'ID', minWidth: '90px', render: (c: Card) => <span style={{ fontSize: 12, fontFamily: 'var(--font-mono,monospace)', color: 'var(--md-sys-color-on-surface-secondary)' }}>{c.id}</span> },
    { key: 'title', header: '標題', align: 'left' as const, minWidth: '200px' },
    { key: 'dept', header: '發起單位', align: 'left' as const },
    { key: 'cat', header: '類別' },
    { key: 'status', header: '狀態' },
    { key: 'month', header: '月份' },
    { key: 'due', header: '截止日' },
    { key: 'owner', header: '受託人', align: 'left' as const, render: (c: Card) => siteUsers.find(u => u.uid === c.owner)?.name ?? (c.owner ? <span style={{ color: 'var(--st-block)' }}>⚠</span> : '—') },
    { key: 'prio', header: '優先' },
  ] as TableColumn<Card>[];

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* 下載範本 */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>下載範本（選用）</div>
        <div style={{ fontSize: 13, color: 'var(--md-sys-color-on-surface-muted)', marginBottom: 10, lineHeight: 1.6 }}>
          若從 Google Sheets Jira 匯出，直接上傳即可，不需要改欄位名稱。<br />
          欄位 <code style={{ fontFamily: 'var(--font-mono,monospace)' }}>摘要、截止日期、受托人、回報者、優先順序、描述</code> 會自動對應。
        </div>
        <Button variant="ghost" leadingIcon={<Download size={13} />} onClick={downloadTemplate}>下載 CSV 範本</Button>
      </div>

      {/* 上傳 */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>上傳 CSV</div>
        <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} style={{ fontSize: 13 }} />
      </div>

      {/* 批次預設值（上傳後顯示） */}
      {rawRows.length > 0 && (
        <div style={{ padding: '16px', background: 'var(--md-sys-color-surface-variant)', borderRadius: 10, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ fontSize: 13, fontWeight: 600, width: '100%', marginBottom: -8 }}>批次預設值（Jira 沒有的欄位，統一套用）</div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--md-sys-color-on-surface-muted)', marginBottom: 4 }}>發起單位 dept <span style={{ color: 'var(--st-block)' }}>*必填</span></div>
            <Input style={{ width: 140 }} value={batchDept} onChange={e => setBatchDept((e.target as HTMLInputElement).value)} placeholder="例：行銷" />
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--md-sys-color-on-surface-muted)', marginBottom: 4 }}>類別 cat</div>
            <Input as="select" style={{ width: 120 }} value={batchCat} onChange={e => setBatchCat((e.target as HTMLSelectElement).value as Cat)}>
              <option value="UIUX">UIUX</option>
              <option value="平面視覺">平面視覺</option>
            </Input>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--md-sys-color-on-surface-muted)', marginBottom: 4 }}>預設狀態</div>
            <Input as="select" style={{ width: 130 }} value={batchStatus} onChange={e => setBatchStatus((e.target as HTMLSelectElement).value as CardStatus)}>
              <option value="belog">需求審核完成</option>
              <option value="todo">待辦</option>
              <option value="designing">設計中</option>
              <option value="reviewing">驗收</option>
              <option value="done">完成</option>
              <option value="pending">Pending</option>
            </Input>
          </div>
          <div style={{ fontSize: 13, color: 'var(--md-sys-color-on-surface-muted)' }}>
            已讀入 {rawRows.length} 列 → 可匯入 {preview.length} 筆
          </div>
        </div>
      )}

      {/* 錯誤 */}
      {errors.length > 0 && (
        <div style={{ padding: '12px 16px', background: 'color-mix(in oklab, var(--st-block) 10%, transparent)', borderRadius: 8, border: '1px solid color-mix(in oklab, var(--st-block) 25%, transparent)' }}>
          <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--st-block)', fontSize: 13 }}>⚠ {errors.length} 個問題</div>
          {errors.map((e, i) => <div key={i} style={{ fontSize: 13, color: 'var(--st-block)', lineHeight: 1.8 }}>{e}</div>)}
        </div>
      )}

      {/* 預覽 + 匯入 */}
      {preview.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
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
        <div style={{ padding: '12px 16px', background: 'color-mix(in oklab, var(--st-done) 12%, transparent)', borderRadius: 8, border: '1px solid color-mix(in oklab, var(--st-done) 30%, transparent)', fontSize: 14 }}>
          ✓ 已成功匯入 {imported} 筆卡片
        </div>
      )}
    </div>
  );
}

interface AdminProps {
  cards: Card[];
  members: Member[];
  memberRatios: Record<string, number>;
  setMemberRatios: (r: Record<string, number>) => void;
  memberDays: Record<string, number>;
  setMemberDays: (d: Record<string, number>) => void;
  leave: LeaveEntry[];
  setLeave: (l: LeaveEntry[]) => void;
  publicHolidays: PublicHoliday[];
  month: string;
  defaultWorkDays: number;
  onMonthChange: (m: string) => void;
  deptColors?: Record<string, string>;
  tab: MainTab;
  onTabChange: (t: MainTab) => void;
  siteUsers?: AppUser[];
  onImportCards?: (cards: Card[]) => Promise<void>;
}

function capColor(pct: number) {
  return pct > 100 ? 'var(--st-block)' : pct > 85 ? 'var(--st-review)' : 'var(--md-sys-color-primary)';
}
function capClass(pct: number) { return pct > 100 ? 'over' : pct > 85 ? 'warn' : 'ok'; }

type MemberRow = {
  m: Member; days: number; ratio: number;
  lv: number; monthHours: number; load: number; pct: number;
};

export default function Admin({
  cards, members, memberRatios, setMemberRatios, memberDays, setMemberDays,
  leave, setLeave, publicHolidays, month, onMonthChange, deptColors = {}, defaultWorkDays, tab, onTabChange: setTab, siteUsers = [], onImportCards,
}: AdminProps) {
  const memberById = Object.fromEntries(members.map(m => [m.id, m]));
  const year = Number(month.split('/')[0]);
  const [catFilter, setCatFilter] = useState<CatFilter>('all');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [draftDays, setDraftDays] = useState<Record<string, string>>({});
  const [draftRatios, setDraftRatios] = useState<Record<string, string>>({});
  const [leaveModal, setLeaveModal] = useState(false);
  const [newLeave, setNewLeave] = useState({
    member: '',
    startDate: '', startMin: 510,
    endDate:   '', endMin:   1080,
  });

  const newLeaveHours = useMemo(() => {
    if (!newLeave.startDate.trim() || !newLeave.endDate.trim()) return 0;
    return calcLeaveHours(newLeave.startDate, newLeave.startMin, newLeave.endDate, newLeave.endMin, publicHolidays, year);
  }, [newLeave, publicHolidays, year]);

  const currentMM = month.slice(5, 7);
  const leaveInMonth = useMemo(() =>
    leave.filter(l => l.date.slice(0, 2) === currentMM || (l.endDate || l.date).slice(0, 2) === currentMM),
    [leave, currentMM]);

  const leaveByMember = useMemo(() =>
    Object.fromEntries(members.map(m => [m.id,
      sum(leaveInMonth.filter(l => l.member === m.id).map(l => l.hours))])),
    [members, leaveInMonth]);

  const memberRows = useMemo(() => members.map(m => {
    const days  = memberDays[m.id]   ?? defaultWorkDays;
    const ratio = memberRatios[m.id] ?? m.ratio;
    const lv = leaveByMember[m.id] || 0;
    const monthHours = Math.max(0, Math.round(days * 8 * ratio) - lv);
    const load = sum(cards.filter(c => c.owner === m.id).map(c => c.est));
    const pct = monthHours > 0 ? Math.round((load / monthHours) * 100) : 0;
    return { m, days, ratio, lv, monthHours, load, pct };
  }), [memberDays, memberRatios, leaveByMember, cards, defaultWorkDays]);

  const filteredRows  = catFilter === 'all' ? memberRows : memberRows.filter(r => r.m.cat === catFilter);
  const filteredCards = catFilter === 'all' ? cards : cards.filter(c => c.cat === catFilter);
  const filteredMonthHours = sum(filteredRows.map(r => r.monthHours));
  const filteredLoad  = sum(filteredCards.map(c => c.est));
  const filteredLeave = sum(filteredRows.map(r => r.lv));
  const filteredPct   = filteredMonthHours > 0 ? Math.round((filteredLoad / filteredMonthHours) * 100) : 0;

  const deptMap: Record<string, number> = {};
  for (const c of filteredCards) deptMap[c.dept] = (deptMap[c.dept] || 0) + c.est;
  const deptLoads = Object.entries(deptMap).sort((a, b) => b[1] - a[1]);
  const maxDeptLoad = Math.max(...deptLoads.map(d => d[1]), 1);

  const totalMonthHours = sum(memberRows.map(r => r.monthHours));
  const totalLoad       = sum(memberRows.map(r => r.load));
  const totalLeaveHours = sum(memberRows.map(r => r.lv));
  const totalPct        = totalMonthHours > 0 ? Math.round((totalLoad / totalMonthHours) * 100) : 0;

  const visibleLeave = (selectedDate
    ? leaveInMonth.filter(l => {
        const end = l.endDate || l.date;
        return l.date <= selectedDate && selectedDate <= end;
      })
    : leaveInMonth
  ).slice().sort((a, b) => a.date.localeCompare(b.date));

  const catLabel = catFilter === 'all' ? '整體' : catFilter;

  function addLeave() {
    if (!newLeave.startDate.trim() || !newLeave.endDate.trim() || newLeaveHours <= 0 || !newLeave.member) return;
    const entry: LeaveEntry = {
      id: `lv${Date.now()}`,
      member: newLeave.member,
      date: newLeave.startDate,
      hours: newLeaveHours,
    };
    if (newLeave.startDate !== newLeave.endDate) entry.endDate = newLeave.endDate;
    setLeave([...leave, entry]);
    setNewLeave(p => ({ ...p, startDate: '', endDate: '', startMin: 510, endMin: 1080 }));
    setLeaveModal(false);
  }

  // Build LeaveCalendar data
  const calHolidays = useMemo(() => new Set(publicHolidays.map(h => h.date)), [publicHolidays]);
  const calLeaveDots = useMemo(() => {
    const mo = Number(month.split('/')[1]);
    const dots: Record<string, LeaveCalendarDot[]> = {};
    for (const l of leave) {
      const end = l.endDate || l.date;
      const [smo2, sday2] = l.date.split('/').map(Number);
      const [emo2, eday2] = end.split('/').map(Number);
      const cur = new Date(year, smo2 - 1, sday2);
      const endD = new Date(year, emo2 - 1, eday2);
      while (cur <= endD) {
        if (cur.getMonth() + 1 === mo) {
          const key = `${String(cur.getMonth() + 1).padStart(2, '0')}/${String(cur.getDate()).padStart(2, '0')}`;
          const mb = memberById[l.member];
          (dots[key] ??= []).push({ id: l.id, color: mb ? hue(mb.hue) : 'var(--md-sys-color-on-surface-muted)' });
        }
        cur.setDate(cur.getDate() + 1);
      }
    }
    return dots;
  }, [leave, year, month, memberById]);

  // Members table columns
  const memberColumns: TableColumn<MemberRow>[] = [
    {
      key: 'member', header: '成員', align: 'left',
      render: ({ m }) => <MemberCell photo={m.photo} name={m.name} initial={m.initial} color={hue(m.hue)} sub={m.cat} />,
      footer: <span style={{ fontWeight: 600 }}>合計</span>,
    },
    {
      key: 'days', header: '工作天',
      render: ({ m, days }) => (
        <input className="num-input" type="number" min={0} max={31}
          value={draftDays[m.id] ?? days}
          onChange={e => setDraftDays(d => ({ ...d, [m.id]: e.target.value }))}
          onBlur={() => {
            const v = Number(draftDays[m.id] ?? days);
            setDraftDays(d => { const c = { ...d }; delete c[m.id]; return c; });
            setMemberDays({ ...memberDays, [m.id]: v });
          }} />
      ),
      footer: '—',
    },
    {
      key: 'ratio', header: '工時比例(%)',
      render: ({ m, ratio }) => (
        <input className="num-input" type="number" min={10} max={100} step={0.5}
          value={draftRatios[m.id] ?? Math.round(ratio * 1000) / 10}
          onChange={e => setDraftRatios(r => ({ ...r, [m.id]: e.target.value }))}
          onBlur={() => {
            const v = Number(draftRatios[m.id] ?? Math.round(ratio * 1000) / 10);
            setDraftRatios(r => { const c = { ...r }; delete c[m.id]; return c; });
            setMemberRatios({ ...memberRatios, [m.id]: v / 100 });
          }} />
      ),
      footer: '—',
    },
    {
      key: 'lv', header: '請假(h)',
      render: ({ lv }) => lv,
      footer: totalLeaveHours,
    },
    {
      key: 'monthHours', header: '月工時',
      render: ({ monthHours }) => <span style={{ fontWeight: 600 }}>{monthHours}</span>,
      footer: <span style={{ fontWeight: 600 }}>{totalMonthHours}</span>,
    },
    {
      key: 'load', header: '承接(h)',
      render: ({ load }) => load,
      footer: totalLoad,
    },
    {
      key: 'pct', header: '量能%',
      render: ({ pct }) => (
        <div className="cap-bar">
          <div className="track"><span style={{ width: `${Math.min(pct, 100)}%`, background: capColor(pct) }} /></div>
          <span className={`cap-pct ${capClass(pct)}`}>{pct}%</span>
        </div>
      ),
      footer: (
        <div className="cap-bar">
          <div className="track"><span style={{ width: `${Math.min(totalPct, 100)}%`, background: capColor(totalPct) }} /></div>
          <span className={`cap-pct ${capClass(totalPct)}`}>{totalPct}%</span>
        </div>
      ),
    },
  ];

  const TABS: { id: MainTab; label: string }[] = [
    { id: 'capacity', label: '設計量能' },
    { id: 'members',  label: '成員工時表' },
    { id: 'leave',    label: '請假紀錄' },
    { id: 'import',   label: '匯入 CSV' },
  ];

  const calMonth = Number(month.split('/')[1]);

  return (
    <div className="admin-wrap" style={{ padding: '18px 22px' }}>
      <div className="panel">

        {/* Mobile-only month switcher */}
        <div className="cap-month-pill-mobile">
          <button onClick={() => onMonthChange(shiftMonth(month, -1))}><ChevronLeft size={14} /></button>
          <span className="cap-month-val">{month}</span>
          <button onClick={() => onMonthChange(shiftMonth(month, 1))}><ChevronRight size={14} /></button>
        </div>

        {/* Tab bar */}
        <div className="admin-tab-bar" style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--md-sys-color-outline-variant)' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              className="admin-tab"
              onClick={() => setTab(t.id)}
              style={{
                appearance: 'none', border: 'none', background: 'none', cursor: 'pointer',
                padding: '11px 18px', fontSize: 14, fontWeight: tab === t.id ? 600 : 400,
                color: tab === t.id ? 'var(--md-sys-color-on-surface)' : 'var(--md-sys-color-on-surface-muted)',
                borderBottom: tab === t.id ? '2px solid var(--md-sys-color-primary)' : '2px solid transparent',
                marginBottom: -1, transition: 'color 0.15s', fontFamily: 'inherit',
              }}
            >
              {t.label}
            </button>
          ))}

          <span className="admin-tab-spacer" style={{ flex: 1 }} />

          {tab === 'members' && (
            <span className="cap-formula-hint" style={{ fontSize: 13, color: 'var(--md-sys-color-on-surface-muted)', marginRight: 16 }}>
              工作天 × 8 × 工時比例 − 請假
            </span>
          )}
          {tab === 'leave' && selectedDate && (
            <Button variant="ghost" style={{ fontSize: 13, padding: '2px 8px', gap: 4, marginRight: 16 }}
                    onClick={() => setSelectedDate(null)}>
              {selectedDate} <X size={11} />
            </Button>
          )}
        </div>

        {/* ── 設計量能 ── */}
        {tab === 'capacity' && (
          <div style={{ padding: '20px 24px 28px' }}>
            <div className="layout-pick" style={{ marginBottom: 20 }}>
              {([['all', 'Total'], ['UIUX', 'UIUX'], ['平面視覺', '平面視覺']] as [CatFilter, string][]).map(([v, lbl]) => (
                <button key={v} data-on={catFilter === v ? '1' : '0'} onClick={() => setCatFilter(v)}>{lbl}</button>
              ))}
            </div>

            <div className="cap-overview-layout" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 32, alignItems: 'start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--md-sys-color-on-surface-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  量能總覽
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ font: `600 64px/1 var(--font-mono), monospace`, letterSpacing: '-0.03em', color: capColor(filteredPct) }}>
                    {filteredPct}%
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--md-sys-color-on-surface-muted)', marginTop: 8 }}>{catLabel}量能使用率</div>
                  <div style={{ height: 6, borderRadius: 99, background: 'var(--md-sys-color-surface-variant)', overflow: 'hidden', marginTop: 12 }}>
                    <div style={{ width: `${Math.min(filteredPct, 100)}%`, height: '100%', borderRadius: 99, background: capColor(filteredPct), transition: 'width 0.3s ease' }} />
                  </div>
                </div>
                <div className="cap-stat-row">
                  {[
                    { l: '可用工時', v: `${filteredMonthHours}h` },
                    { l: '本月承接', v: `${filteredLoad}h` },
                    { l: '請假工時', v: `${filteredLeave}h` },
                  ].map((s, i) => (
                    <div key={i} className="cap-stat-card" style={{ background: 'var(--md-sys-color-surface-variant)', borderRadius: 'var(--r)', padding: '14px 18px' }}>
                      <div style={{ fontSize: 12, color: 'var(--md-sys-color-on-surface-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{s.l}</div>
                      <div className="cap-stat-v" style={{ font: `600 26px/1 var(--font-mono), monospace`, color: 'var(--md-sys-color-on-surface)', marginTop: 6 }}>{s.v}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--md-sys-color-on-surface-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>
                  承接分佈
                  <Tag style={{ fontSize: 12, marginLeft: 8 }}>{deptLoads.length} 部門</Tag>
                </div>
                {deptLoads.length === 0 ? (
                  <div style={{ fontSize: 13, color: 'var(--md-sys-color-on-surface-muted)' }}>無資料</div>
                ) : deptLoads.map(([dept, load]) => {
                  const pct = (load / maxDeptLoad) * 100;
                  const color = deptColors[dept] ?? hue(DEPT_HUE[dept] || 1);
                  return (
                    <div key={dept} className="dept-bar-row">
                      <div className="name" title={dept}>
                        <span className="chip-dot" style={{ background: color, display: 'inline-block', marginRight: 6 }} />
                        {DEPT_SHORT[dept] || dept}
                      </div>
                      <div className="v">{load}h</div>
                      <div className="bar"><span style={{ width: `${pct}%`, background: color }} /></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── 成員工時表 ── */}
        {tab === 'members' && (
          <Table
            className="cap-table"
            columns={memberColumns}
            rows={memberRows}
            getKey={r => r.m.id}
            hasFooter
          />
        )}

        {/* ── 請假紀錄 ── */}
        {tab === 'leave' && (
          <div className="cap-leave-layout" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 0, alignItems: 'start' }}>
            <div className="cap-leave-cal" style={{ borderRight: '1px solid var(--md-sys-color-outline-variant)', padding: '16px 0' }}>
              <LeaveCalendar
                year={year}
                month={calMonth}
                holidays={calHolidays}
                leaveDots={calLeaveDots}
                selectedDate={selectedDate}
                onSelect={setSelectedDate}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 10px' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--md-sys-color-on-surface)' }}>
                  {selectedDate ? `${selectedDate} 請假` : '所有請假記錄'}
                  {selectedDate && (
                    <Button variant="ghost" style={{ fontSize: 12, padding: '2px 7px', marginLeft: 8 }}
                            onClick={() => setSelectedDate(null)}>
                      清除 <X size={10} />
                    </Button>
                  )}
                </span>
                <Button variant="primary" style={{ fontSize: 13, padding: '4px 12px' }}
                        onClick={() => {
                          setNewLeave(p => ({ ...p, startDate: selectedDate ?? '', endDate: selectedDate ?? '', member: p.member || (members[0]?.id ?? '') }));
                          setLeaveModal(true);
                        }}>
                  <span style={{ fontSize: 15, lineHeight: 1, marginRight: 2 }}>+</span> 新增
                </Button>
              </div>

              <div className="leave-list" style={{ flex: 1, minHeight: 200 }}>
                {visibleLeave.length === 0 ? (
                  <div style={{ padding: '24px 18px', fontSize: 13, color: 'var(--md-sys-color-on-surface-muted)', textAlign: 'center' }}>
                    {selectedDate ? '當日無請假記錄' : '尚無請假記錄'}
                  </div>
                ) : visibleLeave.map(entry => {
                  const mb = memberById[entry.member];
                  return (
                    <div key={entry.id} className="leave-row">
                      <div className="who">
                        {mb
                          ? <MemberCell photo={mb.photo} name={mb.name} initial={mb.initial} color={hue(mb.hue)} />
                          : <span>{entry.member}</span>}
                      </div>
                      <span className="date">{dateRangeLabel(entry.date, entry.endDate)}</span>
                      <span className="hrs">{entry.hours}h</span>
                      <button className="del" onClick={() => setLeave(leave.filter(l => l.id !== entry.id))} title="刪除">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Add leave modal */}
      <Modal
        open={leaveModal}
        onClose={() => setLeaveModal(false)}
        title="新增請假"
        footer={
          <>
            <Button variant="ghost" onClick={() => setLeaveModal(false)}>取消</Button>
            <Button variant="primary" onClick={addLeave}
                    disabled={!newLeave.startDate.trim() || !newLeave.endDate.trim() || newLeaveHours <= 0}>
              儲存
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <FormRow label="成員">
            <Input as="select" style={{ width: '100%' }} value={newLeave.member}
                   onChange={e => setNewLeave(p => ({ ...p, member: (e.target as HTMLSelectElement).value }))}>
              {!newLeave.member && <option value="">請選擇成員</option>}
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </Input>
          </FormRow>
          <FormRow label="開始">
            <div style={{ display: 'flex', gap: 8, width: '100%' }}>
              <Input type="date" style={{ width: 150 }}
                     value={newLeave.startDate ? `${year}-${newLeave.startDate.replace('/', '-')}` : ''}
                     onChange={e => {
                       const v = (e.target as HTMLInputElement).value ? (e.target as HTMLInputElement).value.slice(5).replace('-', '/') : '';
                       setNewLeave(p => ({ ...p, startDate: v, endDate: (!p.endDate || v > p.endDate) ? v : p.endDate }));
                     }} />
              <Input as="select" style={{ flex: 1 }} value={newLeave.startMin}
                     onChange={e => setNewLeave(p => ({ ...p, startMin: Number((e.target as HTMLSelectElement).value) }))}>
                {TIME_SLOTS.map(s => <option key={s.min} value={s.min}>{s.label}</option>)}
              </Input>
            </div>
          </FormRow>
          <FormRow label="結束">
            <div style={{ display: 'flex', gap: 8, width: '100%' }}>
              <Input type="date" style={{ width: 150 }}
                     value={newLeave.endDate ? `${year}-${newLeave.endDate.replace('/', '-')}` : ''}
                     onChange={e => {
                       const v = (e.target as HTMLInputElement).value ? (e.target as HTMLInputElement).value.slice(5).replace('-', '/') : '';
                       setNewLeave(p => ({ ...p, endDate: v }));
                     }} />
              <Input as="select" style={{ flex: 1 }} value={newLeave.endMin}
                     onChange={e => setNewLeave(p => ({ ...p, endMin: Number((e.target as HTMLSelectElement).value) }))}>
                {TIME_SLOTS.map(s => <option key={s.min} value={s.min}>{s.label}</option>)}
              </Input>
            </div>
          </FormRow>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--md-sys-color-surface-variant)', borderRadius: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--md-sys-color-on-surface-muted)' }}>計算工時</span>
            <span style={{ fontFamily: 'var(--font-mono), monospace', fontWeight: 700, fontSize: 16, color: newLeaveHours > 0 ? 'var(--md-sys-color-on-surface)' : 'var(--md-sys-color-on-surface-muted)', marginLeft: 'auto' }}>
              {newLeaveHours > 0 ? `${newLeaveHours} h` : '—'}
            </span>
          </div>
        </div>
      </Modal>

      {/* ── 匯入 CSV ── */}
      {tab === 'import' && onImportCards && (
        <ImportPanel allCards={cards} siteUsers={siteUsers} onImportCards={onImportCards} />
      )}
      {tab === 'import' && !onImportCards && (
        <div style={{ padding: 24, color: 'var(--md-sys-color-on-surface-muted)', fontSize: 14 }}>匯入功能未啟用</div>
      )}
    </div>
  );
}
