import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DatePicker } from './date-picker';

const meta = {
  title: 'Components/DatePicker',
  component: DatePicker,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

function Wrapper({ initial = '', disabled }: { initial?: string; disabled?: boolean }) {
  const [value, setValue] = useState(initial);
  return (
    <div style={{ padding: 16, minWidth: 240 }}>
      <DatePicker value={value} onChange={setValue} disabled={disabled} />
      {value && (
        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--muted)' }}>
          選取：{value}
        </div>
      )}
    </div>
  );
}

export const Default: Story = {
  name: 'Empty (no selection)',
  render: () => <Wrapper />,
};

export const WithValue: Story = {
  name: 'With Pre-selected Date',
  render: () => <Wrapper initial="2026-06-28" />,
};

export const Disabled: Story = {
  name: 'Disabled',
  render: () => <Wrapper initial="2026-06-15" disabled />,
};

export const InFormRow: Story = {
  name: 'In Form Context',
  render: () => {
    const [start, setStart] = useState('2026-06-01');
    const [due, setDue] = useState('2026-06-28');
    return (
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, minWidth: 280 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>開始日期</div>
          <DatePicker value={start} onChange={setStart} />
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>截止日期</div>
          <DatePicker value={due} onChange={setDue} />
        </div>
      </div>
    );
  },
};
