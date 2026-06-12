import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import Admin from './index';
import { MEMBERS } from '@/lib/data';
import type { Card, LeaveEntry, PublicHoliday } from '@/lib/types';
import { AppShellDecorator } from '@/stories/AppShellDecorator';

const meta = {
  title: 'Pages/Admin',
  component: Admin,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Admin>;

export default meta;
type Story = StoryObj<typeof meta>;

const CARDS: Card[] = [
  { id: 'D-001', month: '2026/06', title: 'Money錢 APP 全新導覽流程 v2', dept: '金融事業群-Money錢',         cat: 'UIUX',    owner: 'mia',     est: 32, actual: 18, status: 'designing', prio: 'high',   due: '06/28', desc: '', attach: 0, activity: [] },
  { id: 'D-002', month: '2026/06', title: '海外券商新客戶收款頁面改版',   dept: '全球金融事業群-海外券商',  cat: 'UIUX',    owner: 'annie',   est: 24, actual: 22, status: 'reviewing', prio: 'high',   due: '06/22', desc: '', attach: 0, activity: [] },
  { id: 'D-003', month: '2026/06', title: '同學會社群 Profile 頁改版',     dept: '金融事業群-流量事業-同學會', cat: 'UIUX',  owner: 'charlie', est: 20, actual: 6,  status: 'designing', prio: 'normal', due: '06/30', desc: '', attach: 0, activity: [] },
  { id: 'G-001', month: '2026/06', title: '5 月季報 KV 主視覺',           dept: '總經理室',                 cat: '平面視覺', owner: 'shujuan', est: 12, actual: 11, status: 'reviewing', prio: 'high',   due: '06/22', desc: '', attach: 0, activity: [] },
  { id: 'G-002', month: '2026/06', title: '海外券商 EDM 系列 (6 套)',       dept: '全球金融事業群-海外券商',  cat: '平面視覺', owner: 'sunny',  est: 18, actual: 9,  status: 'designing', prio: 'normal', due: '06/27', desc: '', attach: 0, activity: [] },
  { id: 'G-003', month: '2026/06', title: '消費事業群品牌海報 Q2',          dept: '消費事業群',               cat: '平面視覺', owner: 'baoxuan', est: 16, actual: 4,  status: 'todo',      prio: 'normal', due: '06/25', desc: '', attach: 0, activity: [] },
  { id: 'D-004', month: '2026/06', title: '大眾銀行 APP 首頁改版',          dept: '金融事業群-大眾事業',      cat: 'UIUX',    owner: 'mia',     est: 28, actual: 0,  status: 'todo',      prio: 'high',   due: '06/30', desc: '', attach: 0, activity: [] },
];

const LEAVE: LeaveEntry[] = [
  { id: 'lv1', member: 'mia',     date: '06/03', endDate: '06/04', hours: 16, reason: '年假' },
  { id: 'lv2', member: 'charlie', date: '06/10', hours: 8,         reason: '事假' },
  { id: 'lv3', member: 'shujuan', date: '06/17', endDate: '06/18', hours: 16, reason: '年假' },
  { id: 'lv4', member: 'annie',   date: '06/24', hours: 4,         reason: '半天假' },
];

const HOLIDAYS: PublicHoliday[] = [
  { date: '06/12', name: '端午節' },
  { date: '06/13', name: '端午節補假' },
];

function AdminWrapper({ defaultTab }: { defaultTab: 'capacity' | 'members' | 'leave' }) {
  const [tab, setTab] = useState<'capacity' | 'members' | 'leave'>(defaultTab);
  const [memberRatios, setMemberRatios] = useState<Record<string, number>>({});
  const [memberDays, setMemberDays] = useState<Record<string, number>>({});
  const [leave, setLeave] = useState<LeaveEntry[]>(LEAVE);

  return (
    <Admin
      cards={CARDS}
      members={MEMBERS}
      memberRatios={memberRatios}
      setMemberRatios={setMemberRatios}
      memberDays={memberDays}
      setMemberDays={setMemberDays}
      leave={leave}
      setLeave={setLeave}
      publicHolidays={HOLIDAYS}
      month="2026/06"
      defaultWorkDays={22}
      onMonthChange={() => {}}
      tab={tab}
      onTabChange={setTab}
    />
  );
}

export const CapacityOverview: Story = {
  name: 'Capacity Overview',
  render: () => (
    <AppShellDecorator page="capacity">
      <AdminWrapper defaultTab="capacity" />
    </AppShellDecorator>
  ),
};

export const MembersTable: Story = {
  name: 'Members Capacity Table',
  render: () => (
    <AppShellDecorator page="capacity">
      <AdminWrapper defaultTab="members" />
    </AppShellDecorator>
  ),
};

export const LeaveCalendar: Story = {
  name: 'Leave Calendar',
  render: () => (
    <AppShellDecorator page="capacity">
      <AdminWrapper defaultTab="leave" />
    </AppShellDecorator>
  ),
};
