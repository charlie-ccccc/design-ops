import type { Meta, StoryObj } from '@storybook/react';
import { ArchiveCard } from './ArchiveCard';

const meta = {
  title: 'Components/ArchiveCard',
  component: ArchiveCard,
} satisfies Meta<typeof ArchiveCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const SAMPLE_STATS = [
  { label: '需求單', value: 18, sub: '張' },
  { label: '原始預估', value: '284h' },
  { label: '實際消耗', value: '271h' },
  { label: '量能使用', value: '84%' },
];

export const Default: Story = {
  name: 'Archive Card',
  render: () => (
    <div style={{ width: 860 }}>
      <ArchiveCard
        year="2026"
        month="05月"
        stats={SAMPLE_STATS}
        onView={() => {}}
      />
    </div>
  ),
};

export const Clickable: Story = {
  name: 'Clickable (hover effect)',
  render: () => (
    <div style={{ width: 860, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[
        { year: '2026', month: '05月', stats: SAMPLE_STATS },
        { year: '2026', month: '04月', stats: [{ label: '需求單', value: 21, sub: '張' }, { label: '原始預估', value: '312h' }, { label: '實際消耗', value: '298h' }, { label: '量能使用', value: '92%' }] },
        { year: '2026', month: '03月', stats: [{ label: '需求單', value: 15, sub: '張' }, { label: '原始預估', value: '220h' }, { label: '實際消耗', value: '195h' }, { label: '量能使用', value: '68%' }] },
      ].map((item) => (
        <ArchiveCard
          key={item.month}
          year={item.year}
          month={item.month}
          stats={item.stats}
          onView={() => {}}
          onClick={() => {}}
        />
      ))}
    </div>
  ),
};

export const NoAction: Story = {
  name: 'No View Action',
  render: () => (
    <div style={{ width: 860 }}>
      <ArchiveCard year="2026" month="06月" stats={SAMPLE_STATS} isLive />
    </div>
  ),
};
