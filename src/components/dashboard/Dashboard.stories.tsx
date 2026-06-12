import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import Dashboard, { type DashFilter } from './index';
import { MEMBERS } from '@/lib/data';
import type { Card } from '@/lib/types';
import { AppShellDecorator } from '@/stories/AppShellDecorator';

const MOCK_CARDS: Card[] = [
  { id: 'D-001', month: '2026-06', title: 'Money錢 APP 全新導覽流程 v2',     dept: '金融事業群-Money錢',            cat: 'UIUX',   owner: 'mia',     est: 32, actual: 18, status: 'designing', prio: 'high',   due: '06/28', desc: '', attach: 0, activity: [] },
  { id: 'D-002', month: '2026-06', title: '海外券商新客戶收款頁面改版',       dept: '全球金融事業群-海外券商',       cat: 'UIUX',   owner: 'annie',   est: 24, actual: 22, status: 'reviewing', prio: 'high',   due: '06/22', desc: '', attach: 0, activity: [] },
  { id: 'D-003', month: '2026-06', title: '同學會社群 Profile 頁改版',        dept: '金融事業群-流量事業-同學會',    cat: 'UIUX',   owner: 'charlie', est: 20, actual: 6,  status: 'designing', prio: 'normal', due: '06/30', desc: '', attach: 0, activity: [] },
  { id: 'D-004', month: '2026-06', title: '大眾事業 退休模擬器 互動',         dept: '金融事業群-大眾事業',           cat: 'UIUX',   owner: 'mia',     est: 16, actual: 0,  status: 'belog',     prio: 'normal', due: '07/03', desc: '', attach: 0, activity: [] },
  { id: 'D-005', month: '2026-06', title: '產品部 後台權限管理 IA 重構',      dept: '產品部',                        cat: 'UIUX',   owner: 'charlie', est: 12, actual: 14, status: 'done',      prio: 'normal', due: '06/14', desc: '', attach: 0, activity: [] },
  { id: 'D-006', month: '2026-06', title: 'Money錢 訂閱頁 A/B 測試版',       dept: '金融事業群-Money錢',            cat: 'UIUX',   owner: 'annie',   est: 8,  actual: 4,  status: 'designing', prio: 'low',    due: '06/26', desc: '', attach: 0, activity: [] },
  { id: 'G-001', month: '2026-06', title: '5 月季報 KV 主視覺',              dept: '總經理室',                      cat: '平面視覺', owner: 'shujuan', est: 12, actual: 11, status: 'reviewing', prio: 'high',   due: '06/22', desc: '', attach: 0, activity: [] },
  { id: 'G-002', month: '2026-06', title: '海外券商 EDM 系列 (6 套)',         dept: '全球金融事業群-海外券商',       cat: '平面視覺', owner: 'sunny',   est: 18, actual: 9,  status: 'designing', prio: 'normal', due: '06/27', desc: '', attach: 0, activity: [] },
  { id: 'G-003', month: '2026-06', title: 'Money錢 SocialKV 聯名合作版',    dept: '金融事業群-Money錢',            cat: '平面視覺', owner: 'baoxuan', est: 8,  actual: 8,  status: 'done',      prio: 'normal', due: '06/12', desc: '', attach: 0, activity: [] },
  { id: 'G-004', month: '2026-06', title: '人資 員工離退流程海報組',          dept: '人力資源部',                    cat: '平面視覺', owner: 'shujuan', est: 10, actual: 4,  status: 'designing', prio: 'normal', due: '06/28', desc: '', attach: 0, activity: [] },
  { id: 'G-005', month: '2026-06', title: '同學會 線上馬拉松主視覺',          dept: '金融事業群-流量事業-同學會',    cat: '平面視覺', owner: 'baoxuan', est: 14, actual: 14, status: 'reviewing', prio: 'high',   due: '06/21', desc: '', attach: 0, activity: [] },
  { id: 'G-006', month: '2026-06', title: '保險事業 新書宣傳長版',            dept: '合作夥伴事業群-保險事業',       cat: '平面視覺', owner: 'shujuan', est: 12, actual: 13, status: 'pending',   prio: 'low',    due: '06/15', desc: '', attach: 0, activity: [] },
];

const MOCK_SITE_USERS = MEMBERS.map(m => ({ uid: m.id, name: m.name, email: '' }));

const meta = {
  title: 'Pages/Dashboard',
  component: Dashboard,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Dashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

function DashboardWithState(props: Omit<React.ComponentProps<typeof Dashboard>, 'drillFilter' | 'onDrill'>) {
  const [drillFilter, setDrillFilter] = useState<DashFilter | null>(null);
  return (
    <Dashboard
      {...props}
      drillFilter={drillFilter}
      onDrill={setDrillFilter}
    />
  );
}

export const Overview: Story = {
  name: 'Overview',
  render: () => (
    <AppShellDecorator page="dashboard">
      <DashboardWithState
        cards={MOCK_CARDS}
        totalCapacity={480}
        members={MEMBERS}
        siteUsers={MOCK_SITE_USERS}
      />
    </AppShellDecorator>
  ),
};

export const FewCards: Story = {
  name: 'Few Cards (Light Load)',
  render: () => (
    <AppShellDecorator page="dashboard">
      <DashboardWithState
        cards={MOCK_CARDS.slice(0, 4)}
        totalCapacity={480}
        members={MEMBERS}
        siteUsers={MOCK_SITE_USERS}
      />
    </AppShellDecorator>
  ),
};

export const OverCapacity: Story = {
  name: 'Over Capacity',
  render: () => (
    <DashboardWithState
      cards={MOCK_CARDS}
      totalCapacity={200}
      members={MEMBERS}
      siteUsers={MOCK_SITE_USERS}
    />
  ),
};
