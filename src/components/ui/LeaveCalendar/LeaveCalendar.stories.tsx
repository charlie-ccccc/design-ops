import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { LeaveCalendar, LeaveCalendarControlled } from './LeaveCalendar';
import { MEMBERS } from '@/lib/data';
import { hue } from '@/lib/utils';

const meta = {
  title: 'Components/LeaveCalendar',
  component: LeaveCalendar,
} satisfies Meta<typeof LeaveCalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

const HOLIDAYS = new Set(['06/12', '06/13']);

const LEAVE_DOTS = {
  '06/03': [
    { id: 'mia',     color: hue(MEMBERS[0].hue) },
    { id: 'annie',   color: hue(MEMBERS[1].hue) },
  ],
  '06/04': [
    { id: 'mia',     color: hue(MEMBERS[0].hue) },
    { id: 'annie',   color: hue(MEMBERS[1].hue) },
  ],
  '06/10': [
    { id: 'charlie', color: hue(MEMBERS[4].hue) },
  ],
  '06/17': [
    { id: 'shujuan', color: hue(MEMBERS[2].hue) },
    { id: 'baoxuan', color: hue(MEMBERS[3].hue) },
    { id: 'sunny',   color: hue(MEMBERS[5].hue) },
  ],
  '06/18': [
    { id: 'shujuan', color: hue(MEMBERS[2].hue) },
  ],
  '06/25': [
    { id: 'mia',     color: hue(MEMBERS[0].hue) },
    { id: 'charlie', color: hue(MEMBERS[4].hue) },
    { id: 'shujuan', color: hue(MEMBERS[2].hue) },
    { id: 'baoxuan', color: hue(MEMBERS[3].hue) },
    { id: 'sunny',   color: hue(MEMBERS[5].hue) },
  ],
};

export const Default: Story = {
  name: 'June 2026 (with leave + holidays)',
  render: () => {
    const [selected, setSelected] = useState<string | null>(null);
    return (
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, minWidth: 400 }}>
        <LeaveCalendar
          year={2026}
          month={6}
          holidays={HOLIDAYS}
          leaveDots={LEAVE_DOTS}
          selectedDate={selected}
          onSelect={setSelected}
        />
        {selected && (
          <div style={{ padding: '8px 20px 14px', fontSize: 13, color: 'var(--muted)' }}>
            選取：{selected}
          </div>
        )}
      </div>
    );
  },
};

export const WithNav: Story = {
  name: 'With Month Navigation',
  render: () => (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, minWidth: 400 }}>
      <LeaveCalendarControlled
        initialYear={2026}
        initialMonth={6}
        holidays={HOLIDAYS}
        leaveDots={LEAVE_DOTS}
      />
    </div>
  ),
};

export const NoLeave: Story = {
  name: 'No Leave Dots',
  render: () => (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, minWidth: 400 }}>
      <LeaveCalendarControlled
        initialYear={2026}
        initialMonth={6}
        holidays={HOLIDAYS}
      />
    </div>
  ),
};

export const DenseDots: Story = {
  name: 'Dense (all days filled)',
  render: () => {
    const denseDots: typeof LEAVE_DOTS = {};
    for (let d = 1; d <= 30; d++) {
      const key = `06/${String(d).padStart(2, '0')}`;
      denseDots[key] = MEMBERS.slice(0, (d % 4) + 1).map(m => ({ id: m.id, color: hue(m.hue) }));
    }
    return (
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, minWidth: 400 }}>
        <LeaveCalendarControlled
          initialYear={2026}
          initialMonth={6}
          holidays={HOLIDAYS}
          leaveDots={denseDots}
        />
      </div>
    );
  },
};
