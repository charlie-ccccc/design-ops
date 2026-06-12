import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import CardDrawer from './card-drawer';
import { MEMBERS, MEMBER_BY_ID } from '@/lib/data';
import type { Card } from '@/lib/types';
import { AppShellDecorator } from '@/stories/AppShellDecorator';

const SAMPLE_CARD: Card = {
  id: 'D-042',
  month: '2026/06',
  title: 'Money錢 APP 全新導覽流程 v2',
  dept: '金融事業群-Money錢',
  cat: 'UIUX',
  owner: 'mia',
  est: 32,
  actual: 18,
  status: 'designing',
  prio: 'high',
  due: '06/28',
  desc: '## 需求背景\n重新設計 Money錢 APP 的導覽流程，提升用戶轉換率。\n\n## 驗收條件\n- [ ] 完成所有頁面 wireframe\n- [ ] 通過設計 review\n- [ ] 交付可點擊原型',
  attach: 2,
  requester: '林奕文',
  activity: [
    { who: '吳奕蓁', msg: '更新了實際工時 → 18h', t: '2026/06/10 14:23' },
    { who: '王映蓉', msg: '將狀態從「待辦」移至「設計中」', t: '2026/06/08 11:05' },
    { who: '林奕文', msg: '建立了此任務', t: '2026/06/01 09:30' },
  ],
  timeLogs: [
    { id: 'tl-1', date: '06/08', time: '09:00', hours: 8, note: '整體架構規劃' },
    { id: 'tl-2', date: '06/09', time: '09:30', hours: 6, note: '首頁 + Tab Bar 設計' },
    { id: 'tl-3', date: '06/10', time: '10:00', hours: 4, note: '元件庫整理' },
  ],
  comments: [
    { id: 'cm-1', author: '王映蓉', text: '首頁動線的部分可以參考競品 A 的方式，我覺得比較直覺。', t: '2026/06/09 15:30' },
    { id: 'cm-2', author: '吳奕蓁', text: '好的，我這邊再研究一下，下午可以開個小 sync。', t: '2026/06/09 16:02' },
  ],
};

const meta = {
  title: 'Pages/CardDrawer',
  component: CardDrawer,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof CardDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

function DrawerDemo({ card }: { card: Card }) {
  const [open, setOpen] = useState(false);
  const [c, setC] = useState<Card>(card);

  return (
    <AppShellDecorator page="kanban">
      <div style={{ padding: 32, display: 'flex', gap: 12 }}>
        <button className="btn btn-primary" onClick={() => setOpen(true)}>
          開啟卡片 {card.id}
        </button>
      </div>
      <CardDrawer
        card={open ? c : null}
        onClose={() => setOpen(false)}
        onUpdate={(id, patch) => setC(prev => ({ ...prev, ...patch }))}
        canEdit
        currentUserName="吳奕蓁"
        currentUserUid="mia"
        members={MEMBERS}
      />
    </AppShellDecorator>
  );
}

export const Default: Story = {
  name: 'Card Drawer (可互動)',
  render: () => <DrawerDemo card={SAMPLE_CARD} />,
};

export const ReadOnly: Story = {
  name: 'Card Drawer (唯讀)',
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <AppShellDecorator page="kanban">
        <CardDrawer
          card={open ? SAMPLE_CARD : null}
          onClose={() => setOpen(false)}
          onUpdate={() => {}}
          readOnly
          members={MEMBERS}
        />
      </AppShellDecorator>
    );
  },
};
