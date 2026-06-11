import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './Avatar';

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    hue: { control: { type: 'number', min: 1, max: 8, step: 1 } },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    initial: '蓁',
    hue: 1,
    size: 'sm',
  },
};

export const Sizes: Story = {
  name: 'All Sizes',
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 24, background: 'var(--md-sys-color-background)' }}>
      <Avatar initial="蓁" hue={1} size="sm" />
      <Avatar initial="蓉" hue={3} size="md" />
      <Avatar initial="安" hue={5} size="lg" />
    </div>
  ),
};

export const CategoricalHues: Story = {
  name: 'All 8 Categorical Hues',
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: 24, background: 'var(--md-sys-color-background)' }}>
      {Array.from({ length: 8 }, (_, i) => (
        <Avatar key={i} initial={String(i + 1)} hue={i + 1} size="md" />
      ))}
    </div>
  ),
};

export const WithPhoto: Story = {
  name: 'With Photo',
  args: {
    initial: '安',
    hue: 2,
    size: 'md',
    photo: 'https://i.pravatar.cc/56?img=4',
    alt: '王小安',
  },
};
