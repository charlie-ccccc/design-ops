import type { Meta, StoryObj } from '@storybook/react';
import { Chip, Tag, DeptPill } from './Badge';

const meta = {
  title: 'Components/Badge',
  component: Chip,
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ChipDefault: Story = {
  name: 'Chip — Default',
  args: {
    children: '進行中',
  },
};

export const ChipWithDot: Story = {
  name: 'Chip — With Color Dot',
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Chip dotColor="var(--md-sys-color-cat-1)">UIUX</Chip>
      <Chip dotColor="var(--md-sys-color-cat-5)">平面視覺</Chip>
      <Chip dotColor="var(--md-sys-color-cat-3)">行銷</Chip>
    </div>
  ),
};

export const TagDefault: Story = {
  name: 'Tag — Square Label',
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Tag>待辦</Tag>
      <Tag>進行中</Tag>
      <Tag>已完成</Tag>
      <Tag>已封鎖</Tag>
    </div>
  ),
};

export const DeptPillDefault: Story = {
  name: 'DeptPill — Department',
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <DeptPill hue={1}>UI</DeptPill>
      <DeptPill hue={5}>GD</DeptPill>
      <DeptPill hue={3}>MG</DeptPill>
      <DeptPill hue={7}>PM</DeptPill>
      <DeptPill>其他</DeptPill>
    </div>
  ),
};

export const AllVariants: Story = {
  name: 'All Variants',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <div style={{ fontSize: 12, color: 'var(--md-sys-color-on-surface-muted)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Chip (pill border)</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Chip>全部</Chip>
          <Chip dotColor="var(--md-sys-color-cat-1)">UIUX</Chip>
          <Chip dotColor="var(--md-sys-color-cat-5)">平面視覺</Chip>
        </div>
      </div>
      <div>
        <div style={{ fontSize: 12, color: 'var(--md-sys-color-on-surface-muted)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tag (square fill)</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Tag>待辦</Tag>
          <Tag>進行中</Tag>
          <Tag>已完成</Tag>
        </div>
      </div>
      <div>
        <div style={{ fontSize: 12, color: 'var(--md-sys-color-on-surface-muted)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>DeptPill (pill fill + hue border)</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <DeptPill hue={1}>UI</DeptPill>
          <DeptPill hue={5}>GD</DeptPill>
          <DeptPill hue={3}>MG</DeptPill>
          <DeptPill hue={7}>PM</DeptPill>
        </div>
      </div>
    </div>
  ),
};
