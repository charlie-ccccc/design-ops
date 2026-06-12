import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Bell } from 'lucide-react';
import { AppTopbar } from './AppTopbar';
import { MEMBERS } from '@/lib/data';

const meta = {
  title: 'Components/AppTopbar',
  component: AppTopbar,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AppTopbar>;

export default meta;
type Story = StoryObj<typeof meta>;

const MOCK_NOTIFICATION_SLOT = (
  <button className="btn notif-btn">
    <Bell size={16} />
  </button>
);

function TopbarDemo(props: React.ComponentProps<typeof AppTopbar>) {
  return (
    <div style={{ background: 'var(--bg)', minHeight: 120 }}>
      <AppTopbar {...props} />
    </div>
  );
}

// ── 看板 ──────────────────────────────────────────────────────────
export const Kanban: Story = {
  name: '任務看板',
  render: () => {
    const [filterMember, setFilterMember] = useState('');
    const [filterDept, setFilterDept]     = useState('');
    const [query, setQuery]               = useState('');

    return (
      <TopbarDemo
        page="kanban"
        onMenuToggle={() => {}}
        members={MEMBERS}
        filterMember={filterMember}
        onFilterMember={setFilterMember}
        filterDept={filterDept}
        onFilterDept={setFilterDept}
        query={query}
        onQuery={setQuery}
        onNewCard={() => {}}
        notificationSlot={MOCK_NOTIFICATION_SLOT}
      />
    );
  },
};

export const KanbanFiltered: Story = {
  name: '任務看板 (篩選中)',
  render: () => (
    <TopbarDemo
      page="kanban"
      onMenuToggle={() => {}}
      members={MEMBERS}
      filterMember="mia"
      onFilterMember={() => {}}
      filterDept=""
      onFilterDept={() => {}}
      query=""
      onQuery={() => {}}
      onNewCard={() => {}}
      notificationSlot={MOCK_NOTIFICATION_SLOT}
    />
  ),
};

// ── Dashboard ─────────────────────────────────────────────────────
export const Dashboard: Story = {
  name: 'Dashboard',
  render: () => {
    const [filterDept, setFilterDept] = useState('');
    return (
      <TopbarDemo
        page="dashboard"
        onMenuToggle={() => {}}
        filterDept={filterDept}
        onFilterDept={setFilterDept}
        onExport={() => {}}
        notificationSlot={MOCK_NOTIFICATION_SLOT}
      />
    );
  },
};

export const DashboardDrill: Story = {
  name: 'Dashboard (Drill 模式)',
  render: () => (
    <TopbarDemo
      page="dashboard"
      onMenuToggle={() => {}}
      hasDrillFilter
      onExport={() => {}}
      notificationSlot={MOCK_NOTIFICATION_SLOT}
    />
  ),
};

// ── 歷史紀錄 ──────────────────────────────────────────────────────
export const History: Story = {
  name: '歷史紀錄',
  render: () => (
    <TopbarDemo
      page="history"
      onMenuToggle={() => {}}
      notificationSlot={MOCK_NOTIFICATION_SLOT}
    />
  ),
};

// ── 量能管理 ──────────────────────────────────────────────────────
export const Capacity: Story = {
  name: '量能管理',
  render: () => {
    const [month, setMonth] = useState('2026/06');
    const shift = (m: string, d: number) => {
      const [y, mo] = m.split('/').map(Number);
      const next = new Date(y, mo - 1 + d, 1);
      return `${next.getFullYear()}/${String(next.getMonth() + 1).padStart(2, '0')}`;
    };
    return (
      <TopbarDemo
        page="capacity"
        onMenuToggle={() => {}}
        month={month}
        onMonthPrev={() => setMonth(m => shift(m, -1))}
        onMonthNext={() => setMonth(m => shift(m, 1))}
        notificationSlot={MOCK_NOTIFICATION_SLOT}
      />
    );
  },
};

// ── 權限管理 ──────────────────────────────────────────────────────
export const Permissions: Story = {
  name: '權限管理',
  render: () => (
    <TopbarDemo
      page="permissions"
      onMenuToggle={() => {}}
      notificationSlot={MOCK_NOTIFICATION_SLOT}
    />
  ),
};
