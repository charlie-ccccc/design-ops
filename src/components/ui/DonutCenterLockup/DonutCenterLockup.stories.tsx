import type { Meta, StoryObj } from '@storybook/react';
import { DonutCenterLockup } from './DonutCenterLockup';

const meta = {
  title: 'Components/Data Display/DonutCenterLockup',
  component: DonutCenterLockup,
  argTypes: {
    value: { control: 'text' },
    label: { control: 'text' },
  },
} satisfies Meta<typeof DonutCenterLockup>;

export default meta;
type Story = StoryObj<typeof meta>;

function DonutShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'relative', width: 180, height: 180 }}>
      <svg viewBox="0 0 180 180" style={{ position: 'absolute', inset: 0 }}>
        <circle cx="90" cy="90" r="72" fill="none" stroke="var(--md-sys-color-surface-variant)" strokeWidth="18" />
        <circle cx="90" cy="90" r="72" fill="none"
          stroke="var(--md-sys-color-primary)" strokeWidth="18"
          strokeDasharray={`${72 * 2 * Math.PI * 0.65} ${72 * 2 * Math.PI}`}
          strokeDashoffset={72 * 2 * Math.PI * 0.25}
          strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '90px 90px' }}
        />
      </svg>
      {children}
    </div>
  );
}

export const Default: Story = {
  name: 'Hours Value',
  args: {
    value: '284h',
    label: '總預估',
  },
  render: (args) => (
    <DonutShell>
      <DonutCenterLockup {...args} />
    </DonutShell>
  ),
};

export const Percentage: Story = {
  name: 'Percentage',
  args: {
    value: '84%',
    label: '量能',
  },
  render: (args) => (
    <DonutShell>
      <DonutCenterLockup {...args} />
    </DonutShell>
  ),
};

export const Count: Story = {
  name: 'Count (no label)',
  args: {
    value: '18',
  },
  render: (args) => (
    <DonutShell>
      <DonutCenterLockup {...args} />
    </DonutShell>
  ),
};

export const TokensOnly: Story = {
  name: 'Text Tokens (standalone)',
  render: () => (
    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', padding: 20 }}>
      {[
        { value: '284h', label: '總預估' },
        { value: '271h', label: '實際' },
        { value: '84%', label: '量能' },
      ].map((item) => (
        <div key={item.label} style={{ position: 'relative', width: 120, height: 120 }}>
          <svg viewBox="0 0 120 120" style={{ position: 'absolute', inset: 0, opacity: 0.12 }}>
            <circle cx="60" cy="60" r="48" fill="none" stroke="var(--md-sys-color-outline-strong)" strokeWidth="2" strokeDasharray="4 4" />
          </svg>
          <DonutCenterLockup value={item.value} label={item.label} />
        </div>
      ))}
    </div>
  ),
};
