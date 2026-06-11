import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { MonthPillNavigator } from './MonthPillNavigator';

const meta = {
  title: 'Components/MonthPillNavigator',
  component: MonthPillNavigator,
} satisfies Meta<typeof MonthPillNavigator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: '2026年6月',
  },
};

export const DisabledNext: Story = {
  name: 'Disabled Next (current month)',
  args: {
    value: '2026年6月',
    disableNext: true,
  },
};

export const DisabledPrev: Story = {
  name: 'Disabled Prev (oldest month)',
  args: {
    value: '2026年1月',
    disablePrev: true,
  },
};

const MONTHS = ['2026年3月', '2026年4月', '2026年5月', '2026年6月'];

export const Interactive: Story = {
  name: 'Interactive Navigation',
  render: () => {
    const [idx, setIdx] = useState(3);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <MonthPillNavigator
          value={MONTHS[idx]}
          onPrev={() => setIdx(i => Math.max(0, i - 1))}
          onNext={() => setIdx(i => Math.min(MONTHS.length - 1, i + 1))}
          disablePrev={idx === 0}
          disableNext={idx === MONTHS.length - 1}
        />
        <p style={{ fontSize: 13, color: 'var(--md-sys-color-on-surface-muted)', margin: 0 }}>
          選擇的月份：{MONTHS[idx]}
        </p>
      </div>
    );
  },
};

export const InToolbar: Story = {
  name: 'In Toolbar',
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', background: 'var(--md-sys-color-surface)', borderBottom: '1px solid var(--md-sys-color-divider)' }}>
      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--md-sys-color-on-surface)' }}>工作概覽</span>
      <MonthPillNavigator value="2026年6月" disableNext />
    </div>
  ),
};
