import type { Meta, StoryObj } from '@storybook/react';
import Crosstab from './crosstab';
import { MEMBERS } from '@/lib/data';

const meta = {
  title: 'Components/Data Display/CrosstabTable',
  component: Crosstab,
} satisfies Meta<typeof Crosstab>;

export default meta;
type Story = StoryObj<typeof meta>;

const COLS = [
  { id: '金融事業群-Money錢', name: 'Money錢' },
  { id: '全球金融事業群-海外券商', name: '海外券商' },
  { id: '金融事業群-大眾事業', name: '金融-大眾' },
  { id: '消費事業群', name: '消費' },
  { id: '總經理室', name: '總經理室' },
];

const CELL_DATA: Record<string, Record<string, number>> = {
  mia:     { '金融事業群-Money錢': 32, '全球金融事業群-海外券商': 0,  '金融事業群-大眾事業': 16, '消費事業群': 0,  '總經理室': 0 },
  annie:   { '金融事業群-Money錢': 8,  '全球金融事業群-海外券商': 24, '金融事業群-大眾事業': 0,  '消費事業群': 0,  '總經理室': 0 },
  charlie: { '金融事業群-Money錢': 0,  '全球金融事業群-海外券商': 0,  '金融事業群-大眾事業': 0,  '消費事業群': 22, '總經理室': 0 },
  shujuan: { '金融事業群-Money錢': 0,  '全球金融事業群-海外券商': 0,  '金融事業群-大眾事業': 0,  '消費事業群': 0,  '總經理室': 12 },
  sunny:   { '金融事業群-Money錢': 0,  '全球金融事業群-海外券商': 18, '金融事業群-大眾事業': 0,  '消費事業群': 0,  '總經理室': 0 },
  baoxuan: { '金融事業群-Money錢': 8,  '全球金融事業群-海外券商': 0,  '金融事業群-大眾事業': 0,  '消費事業群': 0,  '總經理室': 0 },
};

function getCell(row: (typeof MEMBERS)[0], col: (typeof COLS)[0]) {
  return CELL_DATA[row.id]?.[col.id] ?? 0;
}
function getRowTotal(row: (typeof MEMBERS)[0]) {
  return Object.values(CELL_DATA[row.id] ?? {}).reduce((a, b) => a + b, 0);
}
function getColTotal(col: (typeof COLS)[0]) {
  return MEMBERS.reduce((sum, m) => sum + (CELL_DATA[m.id]?.[col.id] ?? 0), 0);
}
const grandTotal = MEMBERS.reduce((s, m) => s + getRowTotal(m), 0);

export const Default: Story = {
  name: 'Member × Dept (Hours)',
  render: () => (
    <div style={{ padding: 16 }}>
      <Crosstab
        rows={MEMBERS}
        cols={COLS}
        getCell={getCell}
        getRowTotal={getRowTotal}
        getColTotal={getColTotal}
        grandTotal={grandTotal}
      />
    </div>
  ),
};

export const Clickable: Story = {
  name: 'With Click Handlers',
  render: () => (
    <div style={{ padding: 16 }}>
      <Crosstab
        rows={MEMBERS}
        cols={COLS}
        getCell={getCell}
        getRowTotal={getRowTotal}
        getColTotal={getColTotal}
        grandTotal={grandTotal}
        onCellClick={(row, col) => alert(`${row.name} × ${col.name}`)}
        onRowClick={(row) => alert(`成員: ${row.name}`)}
        onColClick={(col) => alert(`部門: ${col.name}`)}
      />
    </div>
  ),
};
