import type { Meta, StoryObj } from '@storybook/react';
import { Table } from './Table';
import type { TableColumn } from './Table';
import { MEMBERS, STATUSES, DEPT_SHORT } from '@/lib/data';
import { hue } from '@/lib/utils';

const meta = {
  title: 'Components/Data Display/Table',
  component: Table,
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ─────────────────────────────────────────
   1. Card table  (Dashboard / History)
───────────────────────────────────────── */
interface CardRow {
  id: string; title: string; dept: string; cat: string;
  owner: string; est: number; actual: number; status: string;
}

const CARDS: CardRow[] = [
  { id: 'D-001', title: 'Money錢 APP 全新導覽流程 v2',    dept: '金融事業群-Money錢',          cat: 'UIUX',    owner: '吳奕蓁', est: 32, actual: 18, status: 'designing' },
  { id: 'D-002', title: '海外券商新客戶收款頁面改版',      dept: '全球金融事業群-海外券商',      cat: 'UIUX',    owner: '王映蓉', est: 24, actual: 22, status: 'reviewing' },
  { id: 'D-003', title: '同學會社群 Profile 頁改版',       dept: '金融事業群-流量事業-同學會',   cat: 'UIUX',    owner: '陳巧玲', est: 20, actual: 6,  status: 'designing' },
  { id: 'G-001', title: '5 月季報 KV 主視覺',             dept: '總經理室',                     cat: '平面視覺', owner: '楊舒娟', est: 12, actual: 11, status: 'reviewing' },
  { id: 'G-002', title: '海外券商 EDM 系列 (6 套)',         dept: '全球金融事業群-海外券商',      cat: '平面視覺', owner: '熊禹晴', est: 18, actual: 9,  status: 'designing' },
  { id: 'G-003', title: '消費事業群品牌海報 Q2',           dept: '消費事業群',                   cat: '平面視覺', owner: '寶萱',   est: 16, actual: 0,  status: 'todo'      },
];

const STATUS_MAP = Object.fromEntries(STATUSES.map(s => [s.id, s]));

const CARD_COLUMNS: TableColumn<CardRow>[] = [
  {
    key: 'id', header: 'ID', align: 'left', minWidth: '70px',
    render: r => (
      <span style={{ fontSize: 12, fontFamily: 'var(--font-mono), monospace', letterSpacing: '0.02em', color: 'var(--md-sys-color-on-surface-secondary)' }}>
        {r.id}
      </span>
    ),
  },
  {
    key: 'title', header: '標題', align: 'left', minWidth: '200px',
    render: r => r.title,
  },
  {
    key: 'dept', header: '需求發起單位', align: 'left',
    render: r => (
      <span className="dept-pill" style={{ fontSize: 12 }}>
        {DEPT_SHORT[r.dept] ?? r.dept}
      </span>
    ),
  },
  {
    key: 'cat', header: '類別', align: 'left',
    render: r => (
      <span className="kcard-cat" data-cat={r.cat}>{r.cat}</span>
    ),
  },
  { key: 'owner', header: '受託人', align: 'left' },
  { key: 'est',   header: '原估(h)' },
  {
    key: 'actual', header: '實際(h)',
    render: r => (
      <span style={{ color: r.actual > r.est ? 'var(--st-block)' : undefined }}>
        {r.actual}
      </span>
    ),
  },
  {
    key: 'status', header: '狀態', align: 'left',
    render: r => {
      const s = STATUS_MAP[r.status];
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: s?.dot, flexShrink: 0 }} />
          {s?.name ?? r.status}
        </span>
      );
    },
  },
];

export const CardTable: Story = {
  name: 'Card Table (Dashboard / History)',
  render: () => (
    <div style={{ padding: 16 }}>
      <Table
        columns={CARD_COLUMNS}
        rows={CARDS}
        getKey={r => r.id}
        stickyFirstCol
        onRowClick={r => alert(`開啟：${r.title}`)}
      />
    </div>
  ),
};

/* ─────────────────────────────────────────
   2. Capacity Table  (Admin > Members)
───────────────────────────────────────── */
interface CapRow {
  id: string; name: string; cat: string; hueVal: number;
  days: number; ratio: number; leave: number; monthHours: number; load: number; pct: number;
}

const CAP_ROWS: CapRow[] = MEMBERS.map(m => {
  const days = 22; const ratio = m.ratio; const leave = m.id === 'mia' ? 16 : m.id === 'charlie' ? 8 : 0;
  const monthHours = Math.max(0, Math.round(days * 8 * ratio) - leave);
  const load = m.id === 'mia' ? 60 : m.id === 'annie' ? 24 : m.id === 'charlie' ? 20 : m.id === 'shujuan' ? 12 : m.id === 'sunny' ? 18 : 16;
  const pct = monthHours > 0 ? Math.round((load / monthHours) * 100) : 0;
  return { id: m.id, name: m.name, cat: m.cat, hueVal: m.hue, days, ratio, leave, monthHours, load, pct };
});

function capColor(pct: number) {
  return pct > 100 ? 'var(--st-block)' : pct > 85 ? 'var(--st-review)' : 'var(--md-sys-color-primary)';
}

function CapBar({ pct }: { pct: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontVariantNumeric: 'tabular-nums' }}>
      <span style={{ width: 80, height: 5, borderRadius: 99, background: 'var(--md-sys-color-surface-variant)', position: 'relative', overflow: 'hidden', display: 'inline-block' }}>
        <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.min(pct, 100)}%`, borderRadius: 99, background: capColor(pct) }} />
      </span>
      <span style={{ color: capColor(pct), fontWeight: pct > 85 ? 600 : 400 }}>{pct}%</span>
    </span>
  );
}

const totalMonthHours = CAP_ROWS.reduce((s, r) => s + r.monthHours, 0);
const totalLoad       = CAP_ROWS.reduce((s, r) => s + r.load, 0);
const totalLeave      = CAP_ROWS.reduce((s, r) => s + r.leave, 0);
const totalPct        = totalMonthHours > 0 ? Math.round((totalLoad / totalMonthHours) * 100) : 0;

const CAP_COLUMNS: TableColumn<CapRow>[] = [
  {
    key: 'name', header: '成員', align: 'left', minWidth: '140px',
    render: r => (
      <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 28, height: 28, borderRadius: '50%', background: hue(r.hueVal), flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff', fontWeight: 600 }}>
          {r.name[0]}
        </span>
        <span>
          <div style={{ fontSize: 14 }}>{r.name}</div>
          <div style={{ fontSize: 12, color: 'var(--md-sys-color-on-surface-muted)' }}>{r.cat}</div>
        </span>
      </span>
    ),
    footer: '合計',
  },
  { key: 'days',       header: '工作天',      footer: '—' },
  { key: 'ratio',      header: '工時比例(%)',  render: r => `${Math.round(r.ratio * 100)}%`, footer: '—' },
  { key: 'leave',      header: '請假(h)',      footer: totalLeave },
  { key: 'monthHours', header: '月工時',       render: r => <strong>{r.monthHours}</strong>, footer: <strong>{totalMonthHours}</strong> },
  { key: 'load',       header: '承接(h)',      footer: totalLoad },
  { key: 'pct',        header: '量能%',        render: r => <CapBar pct={r.pct} />, footer: <CapBar pct={totalPct} /> },
];

export const CapacityTable: Story = {
  name: 'Capacity Table (Admin > Members)',
  render: () => (
    <div style={{ padding: 16, minWidth: 700 }}>
      <Table
        columns={CAP_COLUMNS}
        rows={CAP_ROWS}
        getKey={r => r.id}
        hasFooter
      />
    </div>
  ),
};

/* ─────────────────────────────────────────
   3. Permissions Table
───────────────────────────────────────── */
interface UserRow {
  uid: string; name: string; email: string; roles: string[]; cat: string; isMe: boolean;
}

const USERS: UserRow[] = [
  { uid: 'mia',     name: '吳奕蓁', email: 'mia@example.com',     roles: ['Admin', '成員'], cat: 'UIUX',    isMe: true  },
  { uid: 'annie',   name: '王映蓉', email: 'annie@example.com',   roles: ['成員'],          cat: 'UIUX',    isMe: false },
  { uid: 'charlie', name: '陳巧玲', email: 'charlie@example.com', roles: ['成員'],          cat: 'UIUX',    isMe: false },
  { uid: 'shujuan', name: '楊舒娟', email: 'shujuan@example.com', roles: ['成員'],          cat: '平面視覺', isMe: false },
  { uid: 'su1',     name: '林俊宏', email: 'su1@example.com',     roles: ['發案'],          cat: '',        isMe: false },
  { uid: 'su2',     name: '陳怡君', email: 'su2@example.com',     roles: ['發案'],          cat: '',        isMe: false },
];

const ALL_ROLES = ['Admin', '成員', '發案'];

const PERM_COLUMNS: TableColumn<UserRow>[] = [
  {
    key: 'name', header: '姓名', align: 'left',
    render: r => (
      <span>
        {r.name}
        {r.isMe && <span style={{ fontSize: 12, color: 'var(--md-sys-color-primary)', marginLeft: 5 }}>（你）</span>}
      </span>
    ),
  },
  {
    key: 'email', header: 'Email', align: 'left',
    render: r => <span style={{ color: 'var(--md-sys-color-on-surface-secondary)' }}>{r.email}</span>,
  },
  {
    key: 'roles', header: '權限角色', align: 'left',
    render: r => (
      <span style={{ display: 'flex', gap: 4 }}>
        {ALL_ROLES.map(role => {
          const active = r.roles.includes(role);
          return (
            <span key={role} style={{
              border: `1px solid ${active ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-outline)'}`,
              borderRadius: 6, padding: '2px 10px', fontSize: 13,
              background: active ? 'color-mix(in oklab, var(--md-sys-color-primary) 10%, transparent)' : 'none',
              color: active ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-on-surface-muted)',
              fontWeight: active ? 600 : 400,
            }}>
              {role}
            </span>
          );
        })}
      </span>
    ),
  },
  {
    key: 'cat', header: '設計類別', align: 'left',
    render: r => r.cat
      ? <span className="chip">{r.cat}</span>
      : <span style={{ color: 'var(--md-sys-color-on-surface-muted)' }}>—</span>,
  },
];

export const PermissionsTable: Story = {
  name: 'Permissions Table',
  render: () => (
    <div style={{ padding: 16, minWidth: 640 }}>
      <Table
        columns={PERM_COLUMNS}
        rows={USERS}
        getKey={r => r.uid}
        isRowHighlighted={r => r.isMe}
      />
    </div>
  ),
};

/* ─────────────────────────────────────────
   4. Empty state
───────────────────────────────────────── */
export const EmptyState: Story = {
  name: 'Empty State',
  render: () => (
    <div style={{ padding: 16 }}>
      <Table
        columns={CARD_COLUMNS}
        rows={[]}
        getKey={r => r.id}
        emptyText="沒有符合條件的卡片"
      />
    </div>
  ),
};
