import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DetailDrawer } from './DetailDrawer';
import { Button } from '../Button/Button';
import { Timeline } from '../Timeline/Timeline';
import { DeptPill, Tag } from '../Badge/Badge';

const meta = {
  title: 'Components/Overlays/DetailDrawer',
  component: DetailDrawer,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof DetailDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

const SAMPLE_ACTIVITY = [
  { id: '1', message: '吳奕蓁 更新了實際工時 → 18h', time: '今天 14:23' },
  { id: '2', message: '王映蓉 進行驗收', time: '今天 11:05' },
  { id: '3', message: '陳巧玲 建立了此任務', time: '6/10 09:30' },
];

function DrawerDemo({ id, title, children }: { id?: string; title?: string; children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ padding: 32 }}>
      <Button onClick={() => setOpen(true)}>開啟 Drawer</Button>
      <DetailDrawer open={open} onClose={() => setOpen(false)} id={id} title={title}>
        {children}
      </DetailDrawer>
    </div>
  );
}

export const Default: Story = {
  name: 'Default Drawer',
  render: () => (
    <DrawerDemo id="D-042" title="銀行活存定期利率研究">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <dl style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '0 14px', gridAutoRows: 'minmax(40px, auto)', margin: 0, fontSize: 14, alignItems: 'center' }}>
          <dt style={{ color: 'var(--md-sys-color-on-surface-muted)', fontWeight: 500 }}>狀態</dt>
          <dd style={{ margin: 0 }}><Tag>設計中</Tag></dd>
          <dt style={{ color: 'var(--md-sys-color-on-surface-muted)', fontWeight: 500 }}>部門</dt>
          <dd style={{ margin: 0 }}><DeptPill hue={5}>金融-大眾</DeptPill></dd>
          <dt style={{ color: 'var(--md-sys-color-on-surface-muted)', fontWeight: 500 }}>截止日期</dt>
          <dd style={{ margin: 0 }}>6/28</dd>
          <dt style={{ color: 'var(--md-sys-color-on-surface-muted)', fontWeight: 500 }}>原估工時</dt>
          <dd style={{ margin: 0 }}>32h</dd>
          <dt style={{ color: 'var(--md-sys-color-on-surface-muted)', fontWeight: 500 }}>實際工時</dt>
          <dd style={{ margin: 0, color: 'var(--md-sys-color-on-surface)' }}>18h</dd>
        </dl>
        <div>
          <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--md-sys-color-on-surface-muted)', margin: '0 0 8px' }}>活動紀錄</h4>
          <Timeline entries={SAMPLE_ACTIVITY} />
        </div>
      </div>
    </DrawerDemo>
  ),
};

export const OpenState: Story = {
  name: 'Open State (static)',
  render: () => (
    <div style={{ position: 'relative', height: 600, background: 'var(--md-sys-color-surface-variant)' }}>
      <DetailDrawer open onClose={() => {}} id="G-018" title="品牌手冊封面設計">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--md-sys-color-on-surface-secondary)', lineHeight: 1.6 }}>
            Drawer 開啟狀態靜態展示。Storybook 截圖用途。
          </p>
          <Timeline entries={SAMPLE_ACTIVITY} />
        </div>
      </DetailDrawer>
    </div>
  ),
};

export const NoId: Story = {
  name: 'No ID (title only)',
  render: () => (
    <DrawerDemo title="系統設定">
      <p style={{ margin: 0, fontSize: 14, color: 'var(--md-sys-color-on-surface-secondary)' }}>
        不帶 ID 的 Drawer，適用於非卡片相關的通用面板。
      </p>
    </DrawerDemo>
  ),
};
