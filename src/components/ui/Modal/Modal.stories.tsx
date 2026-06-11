import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from '../Button/Button';
import { Input } from '../Input/Input';

const meta = {
  title: 'Components/Modal',
  component: Modal,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

function ModalDemo({ title, size, children, footer }: { title?: string; size?: 'default' | 'lg'; children?: React.ReactNode; footer?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ padding: 32 }}>
      <Button onClick={() => setOpen(true)}>開啟 Modal</Button>
      <Modal open={open} onClose={() => setOpen(false)} title={title} size={size} footer={footer}>
        {children}
      </Modal>
    </div>
  );
}

export const Default: Story = {
  name: 'Default Modal',
  render: () => (
    <ModalDemo
      title="確認操作"
      footer={
        <>
          <Button variant="ghost">取消</Button>
          <Button variant="primary">確認</Button>
        </>
      }
    >
      <p style={{ margin: 0, fontSize: 14, color: 'var(--md-sys-color-on-surface-secondary)' }}>
        此操作將永久刪除所選任務，無法復原。確定要繼續嗎？
      </p>
    </ModalDemo>
  ),
};

export const FormModal: Story = {
  name: 'Form Modal',
  render: () => (
    <ModalDemo
      title="新增任務"
      size="lg"
      footer={
        <>
          <Button variant="ghost">取消</Button>
          <Button variant="primary">建立</Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--md-sys-color-on-surface-muted)' }}>任務標題</label>
          <Input type="text" placeholder="輸入任務標題..." />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--md-sys-color-on-surface-muted)' }}>部門</label>
            <Input as="select">
              <option value="">選擇部門</option>
              <option value="ui">UI 設計</option>
              <option value="gd">平面視覺</option>
            </Input>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--md-sys-color-on-surface-muted)' }}>預估工時</label>
            <Input type="number" placeholder="0" />
          </div>
        </div>
      </div>
    </ModalDemo>
  ),
};

export const NoFooter: Story = {
  name: 'No Footer',
  render: () => (
    <ModalDemo title="說明">
      <p style={{ margin: 0, fontSize: 14, color: 'var(--md-sys-color-on-surface-secondary)', lineHeight: 1.6 }}>
        這是一個不帶底部操作列的 Modal，適用於資訊展示或說明型彈窗。
      </p>
    </ModalDemo>
  ),
};

export const OpenByDefault: Story = {
  name: 'Open State (static)',
  render: () => (
    <div style={{ position: 'relative', height: 600, background: 'var(--md-sys-color-surface-variant)' }}>
      <Modal open onClose={() => {}} title="靜態展示" footer={<><Button variant="ghost">取消</Button><Button variant="primary">確認</Button></>}>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--md-sys-color-on-surface-secondary)' }}>
          Modal 開啟狀態的靜態展示，用於 Storybook 截圖與視覺驗收。
        </p>
      </Modal>
    </div>
  ),
};
