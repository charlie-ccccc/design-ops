import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import Permissions from './index';
import { DEPTS } from '@/lib/data';
import type { AppUser } from '@/contexts/auth-context';
import { AppShellDecorator } from '@/stories/AppShellDecorator';

const meta = {
  title: 'Pages/Permissions',
  component: Permissions,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Permissions>;

export default meta;
type Story = StoryObj<typeof meta>;

const MOCK_USERS: AppUser[] = [
  { uid: 'mia',     email: 'mia_wu@cmoney.com.tw',        name: '吳奕萃 Mia',           roles: ['Admin', '成員'], cat: 'UIUX',    hue: 1 },
  { uid: 'charlie', email: 'charlie_chen@cmoney.com.tw',   name: '陳巧玲 Charlie',        roles: ['Admin', '成員'], cat: 'UIUX',    hue: 4 },
  { uid: 'joanne',  email: 'joanne_chien@cmoney.com.tw',   name: '簡潔安 Joanne',         roles: ['成員'],          cat: 'UIUX',    hue: 7 },
  { uid: 'sunny',   email: 'sunny_hsiung@cmoney.com.tw',   name: '熊禹晴 Sunny',          roles: ['成員'],          cat: '平面視覺', hue: 2 },
  { uid: 'scarlett',email: 'scarlett_hsu@cmoney.com.tw',   name: '徐寶萱 Scarlett',       roles: ['成員'],          cat: '平面視覺', hue: 9 },
  { uid: 'debby',   email: 'debby_yang@cmoney.com.tw',     name: '楊舒娟 Debby',          roles: ['成員'],          cat: 'UIUX',    hue: 5 },
  { uid: 'annie',   email: 'annie_wang@cmoney.com.tw',     name: '王映蓉 Annie',          roles: ['成員'],          cat: '平面視覺', hue: 3 },
  { uid: 'ning',    email: 'ning_hsiao@cmoney.com.tw',     name: '蕭又寧 Ning',           roles: ['成員'],          cat: 'UIUX',    hue: 6 },
  { uid: 'min',     email: 'min_chen@cmoney.com.tw',       name: '陳鈺閔 Min',            roles: ['成員'],          cat: 'UIUX',    hue: 8 },
  { uid: 'una',     email: 'una_wang@cmoney.com.tw',       name: '王詩婷 Una',            roles: ['一般'],                          hue: 10 },
];

const CURRENT_USER = MOCK_USERS[1]; // 陳巧玲 Charlie (你)
const CURRENT_USER_READONLY = MOCK_USERS[2]; // 非 Admin — 唯讀視角

const MOCK_DEPT_COLORS: Record<string, string> = {
  '金融事業群-Money錢': '#7c6ee0',
  '全球金融事業群-海外券商': '#5090ce',
  '金融事業群-流量事業-同學會': '#3cb8ca',
  '金融事業群-大眾事業': '#5cb478',
  '產品部': '#b8ba3a',
  '通用工程': '#e07c50',
  '總經理室': '#d05060',
  '人力資源部': '#d868a0',
  '合作夥伴事業群-保險事業': '#a48ee8',
};

function PermissionsWrapper({
  currentUser,
  defaultTab = 'users',
}: {
  currentUser: AppUser;
  defaultTab?: 'users' | 'depts';
}) {
  const [users, setUsers] = useState<AppUser[]>(MOCK_USERS);
  const [tab, setTab] = useState<'users' | 'depts'>(defaultTab);
  const [depts, setDepts] = useState<string[]>(DEPTS);
  const [deptColors, setDeptColors] = useState<Record<string, string>>(MOCK_DEPT_COLORS);

  return (
    <Permissions
      users={users}
      currentUser={currentUser}
      onUpdateUser={(uid, patch) =>
        setUsers(prev => prev.map(u => u.uid === uid ? { ...u, ...patch } : u))
      }
      depts={depts}
      onUpdateDepts={setDepts}
      deptColors={deptColors}
      onUpdateDeptColors={setDeptColors}
      tab={tab}
      onTabChange={setTab}
    />
  );
}

export const UsersTab: Story = {
  name: '使用者權限',
  render: () => (
    <AppShellDecorator page="permissions">
      <PermissionsWrapper currentUser={CURRENT_USER} defaultTab="users" />
    </AppShellDecorator>
  ),
};

export const DeptsTab: Story = {
  name: '需求發起單位',
  render: () => (
    <AppShellDecorator page="permissions">
      <PermissionsWrapper currentUser={CURRENT_USER} defaultTab="depts" />
    </AppShellDecorator>
  ),
};

export const ReadOnly: Story = {
  name: '唯讀 (非 Admin)',
  render: () => (
    <AppShellDecorator page="permissions">
      <PermissionsWrapper currentUser={CURRENT_USER_READONLY} defaultTab="users" />
    </AppShellDecorator>
  ),
};
