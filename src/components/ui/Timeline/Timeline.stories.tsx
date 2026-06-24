import type { Meta, StoryObj } from '@storybook/react';
import { Timeline, TimelineItem } from './Timeline';

const meta = {
  title: 'Components/Data Display/Timeline',
  component: Timeline,
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

const SAMPLE_ENTRIES = [
  { id: '1', message: '吳奕蓁 更新了實際工時 → 18h', time: '今天 14:23' },
  { id: '2', message: '王映蓉 進行驗收', time: '今天 11:05' },
  { id: '3', message: '陳巧玲 將狀態改為「設計中」', time: '6/10 09:30' },
  { id: '4', message: '林俊宏 建立了此任務', time: '6/08 10:00' },
];

export const Default: Story = {
  name: 'Activity Feed',
  render: () => (
    <div style={{ width: 360, padding: 16 }}>
      <Timeline entries={SAMPLE_ENTRIES} />
    </div>
  ),
};

export const WithColorDots: Story = {
  name: 'Custom Dot Colors',
  render: () => (
    <div style={{ width: 360, padding: 16 }}>
      <Timeline entries={[
        { id: '1', message: '設計完成', time: '今天 14:23', dot: 'var(--md-sys-color-cat-2)' },
        { id: '2', message: '驗收中', time: '今天 11:05', dot: 'var(--md-sys-color-cat-7)' },
        { id: '3', message: '設計中', time: '6/10 09:30', dot: 'var(--md-sys-color-cat-3)' },
        { id: '4', message: '待處理', time: '6/08 10:00', dot: 'var(--md-sys-color-on-surface-faint)' },
      ]} />
    </div>
  ),
};

export const ComposedItems: Story = {
  name: 'Composed Items (rich content)',
  render: () => (
    <div style={{ width: 360, padding: 16 }}>
      <div className="ui-timeline" style={{ paddingLeft: 4 }}>
        <TimelineItem time="今天 14:23">
          <strong style={{ color: 'var(--md-sys-color-on-surface)' }}>吳奕蓁</strong>{' '}
          更新了實際工時{' '}
          <span style={{ color: 'var(--md-sys-color-on-surface-muted)' }}>14h → 18h</span>
        </TimelineItem>
        <TimelineItem time="今天 11:05" dot="var(--md-sys-color-cat-7)">
          <strong style={{ color: 'var(--md-sys-color-on-surface)' }}>王映蓉</strong>{' '}
          進行驗收
        </TimelineItem>
        <TimelineItem time="6/10 09:30" dot="var(--md-sys-color-cat-3)">
          <strong style={{ color: 'var(--md-sys-color-on-surface)' }}>陳巧玲</strong>{' '}
          建立了此任務
        </TimelineItem>
      </div>
    </div>
  ),
};

export const SingleEntry: Story = {
  name: 'Single Entry (no connector)',
  render: () => (
    <div style={{ width: 360, padding: 16 }}>
      <Timeline entries={[{ id: '1', message: '林俊宏 建立了此任務', time: '6/08 10:00' }]} />
    </div>
  ),
};
