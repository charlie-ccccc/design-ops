import type { Meta, StoryObj } from '@storybook/react';
import { BrandMark } from './BrandMark';

const meta = {
  title: 'Components/Shell/BrandMark',
  component: BrandMark,
  argTypes: {
    size: { control: 'radio', options: ['sm', 'lg'] },
    initial: { control: 'text' },
  },
} satisfies Meta<typeof BrandMark>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Small: Story = {
  name: 'Small (26px — sidebar)',
  args: {
    initial: 'D',
    size: 'sm',
  },
};

export const Large: Story = {
  name: 'Large (48px — login)',
  args: {
    initial: 'D',
    size: 'lg',
  },
};

export const InSidebarContext: Story = {
  name: 'In Sidebar Context',
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--md-sys-color-surface-variant)', width: 220, borderRadius: 'var(--md-sys-shape-corner-lg)' }}>
      <BrandMark initial="D" size="sm" />
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--md-sys-color-on-surface)' }}>Design Ops</span>
    </div>
  ),
};

export const InLoginContext: Story = {
  name: 'In Login Context',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 32, background: 'var(--md-sys-color-surface)', borderRadius: 'var(--md-sys-shape-corner-xl)', maxWidth: 320, boxShadow: 'var(--md-sys-elevation-lg)' }}>
      <BrandMark initial="D" size="lg" />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.01em', color: 'var(--md-sys-color-on-surface)' }}>Design Ops</div>
        <div style={{ fontSize: 13, color: 'var(--md-sys-color-on-surface-muted)', marginTop: 4 }}>請以 Google 帳戶登入</div>
      </div>
    </div>
  ),
};
