import type { Meta, StoryObj } from '@storybook/react';
import { KanbanCard } from './KanbanCard';

const meta = {
  title: 'Components/Kanban/KanbanCard',
  component: KanbanCard,
  argTypes: {
    priority: { control: 'select', options: ['urgent', 'high', 'normal', 'low', 'lowest'] },
    isDragging: { control: 'boolean' },
    isOverdue: { control: 'boolean' },
  },
} satisfies Meta<typeof KanbanCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const SAMPLE_OWNER = { initial: '蓁', hue: 1, name: '林蓁蓁' };

export const Default: Story = {
  args: {
    id: 'D-042',
    title: '銀行活存定期利率研究',
    cat: 'UIUX',
    dept: 'UI',
    deptHue: 1,
    due: '6/20',
    est: 20,
    actual: 14,
    owner: SAMPLE_OWNER,
    priority: 'normal',
  },
};

export const UrgentPriority: Story = {
  name: 'Urgent Priority (最高)',
  args: {
    id: 'D-099',
    title: '緊急！官網首頁 DOWN 機修復',
    cat: 'UIUX',
    dept: 'UI',
    deptHue: 1,
    due: '6/12',
    est: 4,
    actual: 1,
    owner: SAMPLE_OWNER,
    priority: 'urgent',
  },
};

export const HighPriority: Story = {
  name: 'High Priority (高)',
  args: {
    id: 'D-051',
    title: '行動版設計規範更新',
    cat: 'UIUX',
    dept: 'UI',
    deptHue: 1,
    due: '6/15',
    est: 8,
    actual: 9,
    owner: SAMPLE_OWNER,
    priority: 'high',
    isOverdue: true,
  },
};

export const Graphic: Story = {
  name: '平面視覺 Category',
  args: {
    id: 'G-018',
    title: '品牌手冊封面設計',
    cat: '平面視覺',
    dept: 'GD',
    deptHue: 5,
    due: '7/01',
    est: 12,
    actual: 6,
    owner: { initial: '蓉', hue: 3, name: '王蓉蓉' },
    priority: 'normal',
  },
};

export const Dragging: Story = {
  name: 'Dragging State',
  args: {
    id: 'D-042',
    title: '銀行活存定期利率研究',
    cat: 'UIUX',
    dept: 'UI',
    deptHue: 1,
    due: '6/20',
    est: 20,
    actual: 14,
    owner: SAMPLE_OWNER,
    isDragging: true,
  },
};

export const NoOwner: Story = {
  name: 'No Owner',
  args: {
    id: 'D-060',
    title: '待分派任務',
    cat: 'UIUX',
    dept: 'HR',
    deptHue: 4,
    due: '6/30',
    est: 4,
    actual: 0,
    priority: 'low',
  },
};

export const CardColumn: Story = {
  name: 'Column of Cards',
  render: () => (
    <div
      style={{
        width: 296,
        padding: 10,
        background: 'var(--md-sys-color-surface-variant)',
        borderRadius: 'var(--md-sys-shape-corner-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--md-comp-kanban-card-stack-gap)',
      }}
    >
      <KanbanCard
        id="D-042"
        title="銀行活存定期利率研究"
        cat="UIUX"
        dept="UI"
        deptHue={1}
        due="6/20"
        est={20}
        actual={14}
        owner={SAMPLE_OWNER}
      />
      <KanbanCard
        id="G-018"
        title="品牌手冊封面設計"
        cat="平面視覺"
        dept="GD"
        deptHue={5}
        due="6/15"
        est={12}
        actual={13}
        owner={{ initial: '蓉', hue: 3, name: '王蓉蓉' }}
        isOverdue
        priority="high"
      />
      <KanbanCard
        id="D-051"
        title="看板任務介面行動版適配"
        cat="UIUX"
        dept="UI"
        deptHue={1}
        due="7/01"
        est={8}
        actual={2}
        owner={{ initial: '安', hue: 7, name: '陳小安' }}
      />
    </div>
  ),
};
