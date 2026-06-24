import type { Meta, StoryObj } from '@storybook/react';
import { ArchiveCard } from './ArchiveCard';

const meta = {
  title: 'Components/Data Display/ArchiveCard',
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
      <ArchiveCard month="05月" stats={SAMPLE_STATS} onView={() => {}} />
    </div>
  ),
};

export const WithYearGroup: Story = {
  name: 'Year Group (as used in History page)',
  render: () => (
    <div style={{ width: 860, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="history-year-group">
        <div className="history-year-header" style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#999' }}>2026</div>
        <ArchiveCard month="06月" isLive stats={SAMPLE_STATS} onView={() => {}} onClick={() => {}} />
        <ArchiveCard month="05月" stats={[{ label: '需求單', value: 21, sub: '張' }, { label: '原始預估', value: 312, sub: 'h' }, { label: '實際消耗', value: 298, sub: 'h' }]} onView={() => {}} onClick={() => {}} />
      </div>
      <div className="history-year-group">
        <div className="history-year-header" style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#999' }}>2025</div>
        <ArchiveCard month="12月" stats={[{ label: '需求單', value: 15, sub: '張' }, { label: '原始預估', value: 220, sub: 'h' }, { label: '實際消耗', value: 195, sub: 'h' }]} onView={() => {}} onClick={() => {}} />
      </div>
    </div>
  ),
};

export const LiveBadge: Story = {
  name: 'Live Badge',
  render: () => (
    <div style={{ width: 860 }}>
      <ArchiveCard month="06月" stats={SAMPLE_STATS} isLive onView={() => {}} />
    </div>
  ),
};
