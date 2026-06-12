import type { Meta, StoryObj } from '@storybook/react';
import History from './index';
import { MEMBERS, MEMBER_BY_ID } from '@/lib/data';
import { AppShellDecorator } from '@/stories/AppShellDecorator';
import type { Card, HistoryMonth } from '@/lib/types';

const MOCK_CURRENT_CARDS: Card[] = [
  { id: 'D-001', month: '2026/06', title: 'Money錢 APP 全新導覽流程 v2', dept: '金融事業群-Money錢', cat: 'UIUX', owner: 'mia', est: 32, actual: 18, status: 'designing', prio: 'high', due: '06/28', desc: '', attach: 0, activity: [] },
  { id: 'D-002', month: '2026/06', title: '海外券商新客戶收款頁面改版', dept: '全球金融事業群-海外券商', cat: 'UIUX', owner: 'annie', est: 24, actual: 22, status: 'reviewing', prio: 'high', due: '06/22', desc: '', attach: 0, activity: [] },
  { id: 'D-003', month: '2026/06', title: '同學會社群 Profile 頁改版', dept: '金融事業群-流量事業-同學會', cat: 'UIUX', owner: 'charlie', est: 20, actual: 6, status: 'designing', prio: 'normal', due: '06/30', desc: '', attach: 0, activity: [] },
  { id: 'G-001', month: '2026/06', title: '5 月季報 KV 主視覺', dept: '總經理室', cat: '平面視覺', owner: 'shujuan', est: 12, actual: 11, status: 'reviewing', prio: 'high', due: '06/22', desc: '', attach: 0, activity: [] },
  { id: 'G-002', month: '2026/06', title: '海外券商 EDM 系列 (6 套)', dept: '全球金融事業群-海外券商', cat: '平面視覺', owner: 'sunny', est: 18, actual: 9, status: 'designing', prio: 'normal', due: '06/27', desc: '', attach: 0, activity: [] },
];

const MOCK_ARCHIVES: HistoryMonth[] = [
  {
    month: '2026/05',
    cards: 18,
    totalEst: 284,
    totalActual: 271,
    capacity: 336,
    topDept: '金融事業群-Money錢',
    deptTotals: { '金融事業群-Money錢': 92, '全球金融事業群-海外券商': 68, '消費事業群': 54 },
    memberTotals: { mia: 88, annie: 72, charlie: 64, shujuan: 60 },
    cardList: [],
  },
  {
    month: '2026/04',
    cards: 21,
    totalEst: 312,
    totalActual: 298,
    capacity: 336,
    topDept: '消費事業群',
    deptTotals: { '消費事業群': 88, '金融事業群-Money錢': 76, '總經理室': 48 },
    memberTotals: { mia: 96, annie: 80, charlie: 72, shujuan: 64 },
    cardList: [],
  },
  {
    month: '2026/03',
    cards: 15,
    totalEst: 220,
    totalActual: 195,
    capacity: 336,
    topDept: '金融事業群-大眾事業',
    deptTotals: { '金融事業群-大眾事業': 72, '全球金融事業群-海外券商': 60 },
    memberTotals: { mia: 72, annie: 60, charlie: 48 },
    cardList: [],
  },
];

const MOCK_SITE_USERS = MEMBERS.map(m => ({ uid: m.id, name: m.name, email: '' }));

const meta = {
  title: 'Pages/History',
  component: History,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof History>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'History Page',
  render: () => (
    <AppShellDecorator page="history">
      <History
        archives={MOCK_ARCHIVES}
        currentSnapshot={{
          month: '2026/06',
          cards: MOCK_CURRENT_CARDS.length,
          totalEst: MOCK_CURRENT_CARDS.reduce((s, c) => s + c.est, 0),
          totalActual: MOCK_CURRENT_CARDS.reduce((s, c) => s + c.actual, 0),
          capacity: 336,
          topDept: '金融事業群-Money錢',
        }}
        currentCards={MOCK_CURRENT_CARDS}
        onOpenCard={() => {}}
        siteUsers={MOCK_SITE_USERS}
      />
    </AppShellDecorator>
  ),
};

export const NoArchives: Story = {
  name: 'No Past Archives',
  render: () => (
    <AppShellDecorator page="history">
      <History
        archives={[]}
        currentSnapshot={{
          month: '2026/06',
          cards: 5,
          totalEst: 106,
          totalActual: 66,
          capacity: 336,
          topDept: '金融事業群-Money錢',
        }}
        currentCards={MOCK_CURRENT_CARDS}
        onOpenCard={() => {}}
        siteUsers={MOCK_SITE_USERS}
      />
    </AppShellDecorator>
  ),
};
