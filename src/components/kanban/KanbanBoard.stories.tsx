import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import KanbanBoard from './board';
import CardDrawer from './card-drawer';
import { MEMBERS, MEMBER_BY_ID } from '@/lib/data';
import type { Card, CardStatus } from '@/lib/types';
import { AppShellDecorator } from '@/stories/AppShellDecorator';

const MOCK_CARDS: Card[] = [
  { id: 'D-001', month: '2026-06', title: 'Money錢 APP 全新導覽流程 v2',     dept: '金融事業群-Money錢',         cat: 'UIUX',   owner: 'mia',     est: 32, actual: 18, status: 'designing', prio: 'high',   due: '06/28', desc: '', attach: 0, activity: [] },
  { id: 'D-002', month: '2026-06', title: '海外券商新客戶收款頁面改版',       dept: '全球金融事業群-海外券商',    cat: 'UIUX',   owner: 'annie',   est: 24, actual: 22, status: 'reviewing', prio: 'high',   due: '06/22', desc: '', attach: 0, activity: [] },
  { id: 'D-003', month: '2026-06', title: '同學會社群 Profile 頁改版',        dept: '金融事業群-流量事業-同學會', cat: 'UIUX',   owner: 'charlie', est: 20, actual: 6,  status: 'designing', prio: 'normal', due: '06/30', desc: '', attach: 0, activity: [] },
  { id: 'D-004', month: '2026-06', title: '大眾事業 退休模擬器 互動',         dept: '金融事業群-大眾事業',        cat: 'UIUX',   owner: 'mia',     est: 16, actual: 0,  status: 'belog',     prio: 'normal', due: '07/03', desc: '', attach: 0, activity: [] },
  { id: 'D-005', month: '2026-06', title: '產品部 後台權限管理 IA 重構',      dept: '產品部',                     cat: 'UIUX',   owner: 'charlie', est: 12, actual: 14, status: 'done',      prio: 'normal', due: '06/14', desc: '', attach: 0, activity: [] },
  { id: 'D-006', month: '2026-06', title: 'Money錢 訂閱頁 A/B 測試版',       dept: '金融事業群-Money錢',         cat: 'UIUX',   owner: 'annie',   est: 8,  actual: 4,  status: 'todo',      prio: 'low',    due: '06/26', desc: '', attach: 0, activity: [] },
  { id: 'D-007', month: '2026-06', title: '通用工程 內部工單系統 v1',         dept: '通用工程',                   cat: 'UIUX',   owner: 'mia',     est: 18, actual: 0,  status: 'belog',     prio: 'normal', due: '07/06', desc: '', attach: 0, activity: [] },
  { id: 'G-001', month: '2026-06', title: '5 月季報 KV 主視覺',              dept: '總經理室',                   cat: '平面視覺', owner: 'shujuan', est: 12, actual: 11, status: 'reviewing', prio: 'high',   due: '06/22', desc: '', attach: 0, activity: [] },
  { id: 'G-002', month: '2026-06', title: '海外券商 EDM 系列 (6 套)',         dept: '全球金融事業群-海外券商',    cat: '平面視覺', owner: 'sunny',   est: 18, actual: 9,  status: 'designing', prio: 'normal', due: '06/27', desc: '', attach: 0, activity: [] },
  { id: 'G-003', month: '2026-06', title: 'Money錢 SocialKV 聯名合作版',    dept: '金融事業群-Money錢',         cat: '平面視覺', owner: 'baoxuan', est: 8,  actual: 8,  status: 'done',      prio: 'normal', due: '06/12', desc: '', attach: 0, activity: [] },
  { id: 'G-004', month: '2026-06', title: '人資 員工離退流程海報組',          dept: '人力資源部',                 cat: '平面視覺', owner: 'shujuan', est: 10, actual: 4,  status: 'todo',      prio: 'normal', due: '06/28', desc: '', attach: 0, activity: [] },
  { id: 'G-005', month: '2026-06', title: '同學會 線上馬拉松主視覺',          dept: '金融事業群-流量事業-同學會', cat: '平面視覺', owner: 'baoxuan', est: 14, actual: 14, status: 'reviewing', prio: 'high',   due: '06/21', desc: '', attach: 0, activity: [] },
  { id: 'G-006', month: '2026-06', title: '保險事業 新書宣傳長版',            dept: '合作夥伴事業群-保險事業',    cat: '平面視覺', owner: 'shujuan', est: 12, actual: 13, status: 'pending',   prio: 'low',    due: '06/15', desc: '', attach: 0, activity: [] },
];

const meta = {
  title: 'Pages/KanbanBoard',
  component: KanbanBoard,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof KanbanBoard>;

export default meta;
type Story = StoryObj<typeof meta>;

function KanbanWithState(props: Partial<React.ComponentProps<typeof KanbanBoard>>) {
  const [cards, setCards] = useState<Card[]>(MOCK_CARDS);
  const [cardOrder, setCardOrder] = useState<Record<string, string[]>>({});
  const [openCardId, setOpenCardId] = useState<string | null>(null);
  const openCard = cards.find(c => c.id === openCardId) ?? null;

  function handleMove(cardId: string, newStatus: string) {
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, status: newStatus as Card['status'] } : c));
  }

  return (
    <AppShellDecorator page="kanban">
      <KanbanBoard
        cards={cards}
        onMove={handleMove}
        onReorder={setCardOrder}
        onOpen={id => setOpenCardId(id)}
        onAddCard={(status) => { void status; }}
        query=""
        filterMember=""
        filterDept=""
        canEdit
        memberById={MEMBER_BY_ID}
        cardOrder={cardOrder}
        {...props}
      />
      <CardDrawer
        card={openCard}
        onClose={() => setOpenCardId(null)}
        onUpdate={(id, patch) => setCards(prev => prev.map(c => c.id === id ? { ...c, ...patch } : c))}
        canEdit
        currentUserName="吳奕蓁"
        currentUserUid="mia"
      />
    </AppShellDecorator>
  );
}

export const Default: Story = {
  name: 'Full Board',
  render: () => <KanbanWithState />,
};

export const ReadOnly: Story = {
  name: 'Read-Only (no drag)',
  render: () => <KanbanWithState canEdit={false} />,
};

export const FilteredByMember: Story = {
  name: 'Filtered by Member',
  render: () => <KanbanWithState filterMember="mia" />,
};

export const FilteredByDept: Story = {
  name: 'Filtered by Dept',
  render: () => <KanbanWithState filterDept="金融事業群-Money錢" />,
};
