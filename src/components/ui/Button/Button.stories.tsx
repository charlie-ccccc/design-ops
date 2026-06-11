import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    variant: { control: 'select', options: ['default', 'primary', 'ghost'] },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: '匯出',
    variant: 'default',
  },
};

export const Primary: Story = {
  args: {
    children: '新增任務',
    variant: 'primary',
  },
};

export const Ghost: Story = {
  args: {
    children: '取消',
    variant: 'ghost',
  },
};

export const AllVariants: Story = {
  name: 'All Variants',
  render: () => (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: 24, background: 'var(--md-sys-color-background)', flexWrap: 'wrap' }}>
      <Button variant="default">預設 Default</Button>
      <Button variant="primary">主要 Primary</Button>
      <Button variant="ghost">幽靈 Ghost</Button>
      <Button variant="default" disabled>Disabled</Button>
    </div>
  ),
};

export const WithIcons: Story = {
  name: 'With Icons',
  render: () => (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: 24, background: 'var(--md-sys-color-background)', flexWrap: 'wrap' }}>
      <Button
        variant="primary"
        leadingIcon={<span style={{ fontSize: 14, lineHeight: 1 }}>＋</span>}
      >
        新增任務
      </Button>
      <Button
        variant="default"
        leadingIcon={<span style={{ fontSize: 14, lineHeight: 1 }}>↑</span>}
      >
        匯出
      </Button>
      <Button variant="default" icon title="設定">
        ⚙
      </Button>
    </div>
  ),
};

export const Compact: Story = {
  name: 'Compact Density',
  render: () => (
    <div
      data-density="compact"
      style={{ display: 'flex', gap: 10, alignItems: 'center', padding: 24, background: 'var(--md-sys-color-background)' }}
    >
      <Button variant="default">預設</Button>
      <Button variant="primary">主要</Button>
      <Button variant="ghost">幽靈</Button>
    </div>
  ),
};
