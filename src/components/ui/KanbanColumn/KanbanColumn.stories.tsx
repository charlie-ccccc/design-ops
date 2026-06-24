import type { Meta, StoryObj } from '@storybook/react';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from '../KanbanCard/KanbanCard';

const meta = {
  title: 'Components/Kanban/KanbanColumn',
  component: KanbanColumn,
  argTypes: {
    isOver: { control: 'boolean' },
    isEmpty: { control: 'boolean' },
  },
} satisfies Meta<typeof KanbanColumn>;

export default meta;
type Story = StoryObj<typeof meta>;

const SAMPLE_CARDS = [
  { id: 'D-001', title: 'Money錢 APP 全新導覽流程 v2', cat: 'UIUX' as const, dept: '金融', deptHue: 5, due: '6/28', est: 32, actual: 18, owner: { initial: '蓁', hue: 1 }, priority: 'high' as const },
  { id: 'D-003', title: '同學會社群 Profile 頁改版', cat: 'UIUX' as const, dept: '流量', deptHue: 8, due: '6/30', est: 20, actual: 6, owner: { initial: '巧', hue: 4 } },
  { id: 'D-006', title: 'Money錢 訂閱頁 A/B 測試版', cat: 'UIUX' as const, dept: '金融', deptHue: 5, due: '6/26', est: 8, actual: 4, owner: { initial: '蓉', hue: 3 } },
];

export const Default: Story = {
  name: 'Designing Column',
  args: {
    name: '設計中',
    dotColor: 'var(--md-sys-color-cat-3)',
    count: 3,
  },
  render: (args) => (
    <div style={{ height: 480, display: 'flex' }}>
      <KanbanColumn {...args}>
        {SAMPLE_CARDS.map(card => <KanbanCard key={card.id} {...card} />)}
      </KanbanColumn>
    </div>
  ),
};

export const Empty: Story = {
  name: 'Empty Column',
  args: {
    name: 'Belog',
    dotColor: 'var(--md-sys-color-cat-5)',
    count: 0,
    isEmpty: true,
  },
  render: (args) => (
    <div style={{ height: 300, display: 'flex' }}>
      <KanbanColumn {...args} />
    </div>
  ),
};

export const DragOver: Story = {
  name: 'Drag-Over State',
  args: {
    name: '待處理',
    dotColor: 'var(--md-sys-color-on-surface-faint)',
    count: 1,
    isOver: true,
  },
  render: (args) => (
    <div style={{ height: 300, display: 'flex' }}>
      <KanbanColumn {...args}>
        <KanbanCard id="D-004" title="大眾事業 退休模擬器 互動" cat="UIUX" dept="金融" deptHue={7} due="7/03" est={16} actual={0} />
      </KanbanColumn>
    </div>
  ),
};

export const AllColumns: Story = {
  name: 'All Status Columns',
  render: () => (
    <div style={{ display: 'flex', gap: 12, height: 520, overflow: 'auto' }}>
      <KanbanColumn name="Belog" dotColor="var(--md-sys-color-cat-5)" count={1} isEmpty>
        <KanbanCard id="D-004" title="大眾事業 退休模擬器 互動" cat="UIUX" dept="金融" deptHue={7} due="7/03" est={16} actual={0} />
      </KanbanColumn>
      <KanbanColumn name="待處理" dotColor="var(--md-sys-color-on-surface-faint)" count={1}>
        <KanbanCard id="D-006" title="Money錢 訂閱頁 A/B 測試版" cat="UIUX" dept="金融" deptHue={5} due="6/26" est={8} actual={4} owner={{ initial: '蓉', hue: 3 }} />
      </KanbanColumn>
      <KanbanColumn name="設計中" dotColor="var(--md-sys-color-cat-3)" count={3}>
        {SAMPLE_CARDS.map(card => <KanbanCard key={card.id} {...card} />)}
      </KanbanColumn>
      <KanbanColumn name="驗收" dotColor="var(--md-sys-color-cat-7)" count={1}>
        <KanbanCard id="D-002" title="海外券商新客戶收款頁面改版" cat="UIUX" dept="海外" deptHue={3} due="6/22" est={24} actual={22} owner={{ initial: '蓉', hue: 3 }} priority="high" />
      </KanbanColumn>
      <KanbanColumn name="設計完成" dotColor="var(--md-sys-color-cat-2)" count={1}>
        <KanbanCard id="D-005" title="產品部 後台權限管理 IA 重構" cat="UIUX" dept="產品" deptHue={7} due="6/14" est={12} actual={14} owner={{ initial: '巧', hue: 4 }} isOverdue />
      </KanbanColumn>
    </div>
  ),
};
