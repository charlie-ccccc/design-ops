import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import NotificationPanel from './notification-panel';
import type { AppNotification } from '@/lib/types';

const meta = {
  title: 'Components/NotificationPanel',
  component: NotificationPanel,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof NotificationPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

const now = Date.now();
const min = 60_000;
const hr = 60 * min;
const day = 24 * hr;

const MOCK_NOTIFS: AppNotification[] = [
  { id: 'n1', uid: 'mia', type: 'mention',  cardId: 'D-001', cardTitle: 'Money錢 APP 全新導覽流程', from: 'Annie Wang',  message: 'Annie Wang 在「Money錢 APP 全新導覽流程」中提到了你',   read: false, createdAt: now - 5 * min },
  { id: 'n2', uid: 'mia', type: 'assigned', cardId: 'D-002', cardTitle: '海外券商新客戶收款頁面改版', from: 'Charlie',    message: 'Charlie 將「海外券商新客戶收款頁面改版」指派給你',       read: false, createdAt: now - 45 * min },
  { id: 'n3', uid: 'mia', type: 'comment',  cardId: 'G-001', cardTitle: '5 月季報 KV 主視覺',       from: 'Shujuan',    message: 'Shujuan 在「5 月季報 KV 主視覺」新增了留言',           read: false, createdAt: now - 2 * hr },
  { id: 'n4', uid: 'mia', type: 'due',      cardId: 'D-003', cardTitle: '同學會社群 Profile 頁改版', from: 'system',     message: '「同學會社群 Profile 頁改版」今天到期',                 read: true,  createdAt: now - 1 * day },
  { id: 'n5', uid: 'mia', type: 'mention',  cardId: 'G-002', cardTitle: '海外券商 EDM 系列',         from: 'Sunny',      message: 'Sunny 在「海外券商 EDM 系列」中提到了你',               read: true,  createdAt: now - 2 * day },
];

function Wrapper({ initial }: { initial: AppNotification[] }) {
  const [notifs, setNotifs] = useState(initial);
  return (
    <div style={{ padding: 16 }}>
      <NotificationPanel
        notifications={notifs}
        onMarkRead={id => setNotifs(ns => ns.map(n => n.id === id ? { ...n, read: true } : n))}
        onMarkAllRead={() => setNotifs(ns => ns.map(n => ({ ...n, read: true })))}
        onOpenCard={() => {}}
        onDelete={id => setNotifs(ns => ns.filter(n => n.id !== id))}
      />
    </div>
  );
}

export const WithUnread: Story = {
  name: 'With Unread Notifications',
  render: () => <Wrapper initial={MOCK_NOTIFS} />,
};

export const AllRead: Story = {
  name: 'All Read',
  render: () => <Wrapper initial={MOCK_NOTIFS.map(n => ({ ...n, read: true }))} />,
};

export const Empty: Story = {
  name: 'Empty',
  render: () => <Wrapper initial={[]} />,
};

export const SingleUnread: Story = {
  name: 'Single Unread',
  render: () => <Wrapper initial={[MOCK_NOTIFS[0]]} />,
};
