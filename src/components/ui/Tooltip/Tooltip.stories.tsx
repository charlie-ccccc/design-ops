import type { Meta, StoryObj } from '@storybook/react';
import { InfoTooltip } from './Tooltip';

const meta = {
  title: 'Components/Overlays/Tooltip',
  component: InfoTooltip,
} satisfies Meta<typeof InfoTooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Top: Story = {
  name: 'InfoTooltip — 上方',
  args: {
    content: '這是說明文字\n可以換行',
    position: 'top',
  },
  decorators: [Story => (
    <div style={{ padding: '80px 40px', display: 'flex', gap: 12, alignItems: 'center' }}>
      <span style={{ fontSize: 14 }}>月工時</span>
      <Story />
    </div>
  )],
};

export const Bottom: Story = {
  name: 'InfoTooltip — 下方',
  args: {
    content: '工作天 × 8 × 工時比例 − 請假',
    position: 'bottom',
  },
  decorators: [Story => (
    <div style={{ padding: '40px', display: 'flex', gap: 12, alignItems: 'center' }}>
      <span style={{ fontSize: 14 }}>月工時</span>
      <Story />
    </div>
  )],
};

export const WithFormula: Story = {
  name: 'InfoTooltip — 多行公式',
  args: {
    content: '本月承接 ÷ 可用工時 × 100%\n= 947h ÷ 573h × 100%',
    position: 'top',
  },
  decorators: [Story => (
    <div style={{ padding: '80px 40px', display: 'flex', gap: 8, alignItems: 'center' }}>
      <span style={{ fontSize: 13, color: 'var(--muted)' }}>整體量能使用率</span>
      <Story />
    </div>
  )],
};
