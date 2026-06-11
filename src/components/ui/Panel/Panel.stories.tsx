import type { Meta, StoryObj } from '@storybook/react';
import { Panel } from './Panel';
import { Button } from '../Button/Button';

const meta = {
  title: 'Components/Panel',
  component: Panel,
} satisfies Meta<typeof Panel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: '面板標題',
    children: (
      <p style={{ margin: 0, fontSize: 14, color: 'var(--md-sys-color-on-surface-secondary)' }}>
        面板內容區域，可放置任何子元素。
      </p>
    ),
  },
  render: (args) => (
    <div style={{ width: 400 }}>
      <Panel {...args} />
    </div>
  ),
};

export const WithSubtitle: Story = {
  name: 'With Subtitle',
  args: {
    title: '工時統計',
    subtitle: '本週累計',
    children: (
      <p style={{ margin: 0, fontSize: 14, color: 'var(--md-sys-color-on-surface-secondary)' }}>
        各成員本週工時詳情...
      </p>
    ),
  },
  render: (args) => (
    <div style={{ width: 400 }}>
      <Panel {...args} />
    </div>
  ),
};

export const WithActions: Story = {
  name: 'With Header Actions',
  render: () => (
    <div style={{ width: 400 }}>
      <Panel
        title="任務列表"
        subtitle="進行中 12 項"
        actions={<Button variant="ghost">查看全部</Button>}
      >
        <p style={{ margin: 0, fontSize: 14, color: 'var(--md-sys-color-on-surface-secondary)' }}>
          任務項目清單...
        </p>
      </Panel>
    </div>
  ),
};

export const NoHeader: Story = {
  name: 'No Header',
  render: () => (
    <div style={{ width: 400 }}>
      <Panel>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--md-sys-color-on-surface-secondary)' }}>
          無標題的純內容面板，常用於資料卡片或統計顯示。
        </p>
      </Panel>
    </div>
  ),
};

export const CustomHeader: Story = {
  name: 'Custom Header Slot',
  render: () => (
    <div style={{ width: 400 }}>
      <Panel
        header={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>自訂標頭</span>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--md-sys-color-on-surface-muted)' }}>更新於 3 分鐘前</span>
          </div>
        }
      >
        <p style={{ margin: 0, fontSize: 14 }}>支援完全自訂的標頭插槽。</p>
      </Panel>
    </div>
  ),
};

export const PanelGrid: Story = {
  name: 'Panel Grid',
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 820 }}>
      {['UI 設計', '平面視覺', '行銷', '產品管理'].map((dept) => (
        <Panel key={dept} title={dept} subtitle="本月任務">
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--md-sys-color-on-surface)' }}>
            {Math.floor(Math.random() * 20 + 5)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--md-sys-color-on-surface-muted)', marginTop: 4 }}>
            完成 {Math.floor(Math.random() * 10)} 項
          </div>
        </Panel>
      ))}
    </div>
  ),
};
