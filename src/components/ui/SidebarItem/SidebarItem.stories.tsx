import type { Meta, StoryObj } from '@storybook/react';
import { LayoutDashboard, Kanban, History, Settings, Bell } from 'lucide-react';
import { SidebarItem, SidebarGroup } from './SidebarItem';

const meta = {
  title: 'Components/Shell/SidebarItem',
  component: SidebarItem,
  argTypes: {
    active: { control: 'boolean' },
  },
} satisfies Meta<typeof SidebarItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: <LayoutDashboard size={16} />,
    label: '工作概覽',
    active: false,
  },
  render: (args) => (
    <div style={{ width: 220, padding: 8, background: 'var(--md-sys-color-surface-variant)', borderRadius: 'var(--md-sys-shape-corner-lg)' }}>
      <SidebarItem {...args} />
    </div>
  ),
};

export const Active: Story = {
  args: {
    icon: <Kanban size={16} />,
    label: '看板',
    active: true,
  },
  render: (args) => (
    <div style={{ width: 220, padding: 8, background: 'var(--md-sys-color-surface-variant)', borderRadius: 'var(--md-sys-shape-corner-lg)' }}>
      <SidebarItem {...args} />
    </div>
  ),
};

export const WithTag: Story = {
  name: 'With Notification Tag',
  args: {
    icon: <Bell size={16} />,
    label: '通知',
    tag: 3,
    active: false,
  },
  render: (args) => (
    <div style={{ width: 220, padding: 8, background: 'var(--md-sys-color-surface-variant)', borderRadius: 'var(--md-sys-shape-corner-lg)' }}>
      <SidebarItem {...args} />
    </div>
  ),
};

export const FullNav: Story = {
  name: 'Full Navigation',
  render: () => (
    <div style={{ width: 220, padding: 8, background: 'var(--md-sys-color-surface-variant)', borderRadius: 'var(--md-sys-shape-corner-lg)', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <SidebarGroup label="主選單">
        <SidebarItem icon={<LayoutDashboard size={16} />} label="工作概覽" />
        <SidebarItem icon={<Kanban size={16} />} label="看板" active tag={12} />
        <SidebarItem icon={<History size={16} />} label="歷程" />
      </SidebarGroup>
      <SidebarGroup label="系統">
        <SidebarItem icon={<Settings size={16} />} label="設定" />
      </SidebarGroup>
    </div>
  ),
};

export const NoIcon: Story = {
  name: 'No Icon',
  args: {
    label: '純文字項目',
    active: false,
  },
  render: (args) => (
    <div style={{ width: 220, padding: 8, background: 'var(--md-sys-color-surface-variant)', borderRadius: 'var(--md-sys-shape-corner-lg)' }}>
      <SidebarItem {...args} />
    </div>
  ),
};
