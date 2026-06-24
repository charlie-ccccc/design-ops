import type { Meta, StoryObj } from '@storybook/react';
import { KpiCard } from './KpiCard';

const meta = {
  title: 'Components/Data Display/KpiCard',
  component: KpiCard,
  argTypes: {
    deltaDirection: { control: 'select', options: ['neutral', 'up', 'down'] },
  },
} satisfies Meta<typeof KpiCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: '本月工時',
    value: 168.5,
    unit: 'H',
    delta: '較上月 +12.5H',
    deltaDirection: 'up',
  },
};

export const DeltaDown: Story = {
  name: 'Delta — Down',
  args: {
    label: '完成率',
    value: '72',
    unit: '%',
    delta: '↓ 較上月 −6%',
    deltaDirection: 'down',
  },
};

export const NoDelta: Story = {
  name: 'No Delta',
  args: {
    label: '任務數',
    value: 47,
    unit: '件',
  },
};

export const DashboardGrid: Story = {
  name: 'Dashboard Grid',
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 12,
        padding: 24,
        background: 'var(--md-sys-color-background)',
      }}
    >
      <KpiCard label="任務數" value={47} unit="件" delta="↑ +5件" deltaDirection="up" />
      <KpiCard label="本月工時" value={168.5} unit="H" delta="較上月 +12.5H" deltaDirection="up" />
      <KpiCard label="完成率" value={72} unit="%" delta="↓ −6%" deltaDirection="down" />
      <KpiCard label="超時任務" value={3} unit="件" delta="持平" deltaDirection="neutral" />
    </div>
  ),
};
