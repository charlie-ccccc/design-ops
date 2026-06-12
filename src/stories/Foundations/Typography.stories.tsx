import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Foundations/Typography',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type ScaleRowProps = {
  name: string;
  sizeToken: string;
  weightToken: string;
  leadingToken?: string;
  trackingToken?: string;
  sampleZh: string;
  sampleEn: string;
  note?: string;
};

function ScaleRow({ name, sizeToken, weightToken, leadingToken, trackingToken, sampleZh, sampleEn, note }: ScaleRowProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '140px 1fr',
        gap: 24,
        alignItems: 'start',
        paddingBottom: 24,
        marginBottom: 24,
        borderBottom: '1px solid var(--md-sys-color-divider)',
      }}
    >
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--md-sys-color-on-surface-muted)', marginBottom: 6 }}>
          {name}
        </div>
        <code style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--md-sys-color-on-surface-faint)', display: 'block' }}>{sizeToken}</code>
        <code style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--md-sys-color-on-surface-faint)', display: 'block' }}>{weightToken}</code>
        {leadingToken && <code style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--md-sys-color-on-surface-faint)', display: 'block' }}>{leadingToken}</code>}
        {trackingToken && <code style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--md-sys-color-on-surface-faint)', display: 'block' }}>{trackingToken}</code>}
        {note && <span style={{ fontSize: 10, color: 'var(--md-sys-color-status-info)', display: 'block', marginTop: 4 }}>{note}</span>}
      </div>
      <div>
        <div
          style={{
            fontFamily: 'var(--md-sys-typescale-family)',
            fontSize: `var(${sizeToken})`,
            fontWeight: `var(${weightToken})`,
            lineHeight: leadingToken ? `var(${leadingToken})` : undefined,
            letterSpacing: trackingToken ? `var(${trackingToken})` : undefined,
            color: 'var(--md-sys-color-on-surface)',
            marginBottom: 4,
          }}
        >
          {sampleZh}
        </div>
        <div
          style={{
            fontFamily: 'var(--md-sys-typescale-family)',
            fontSize: `var(${sizeToken})`,
            fontWeight: `var(${weightToken})`,
            lineHeight: leadingToken ? `var(${leadingToken})` : undefined,
            letterSpacing: trackingToken ? `var(${trackingToken})` : undefined,
            color: 'var(--md-sys-color-on-surface-secondary)',
          }}
        >
          {sampleEn}
        </div>
      </div>
    </div>
  );
}

export const TypeScale: Story = {
  name: 'Type Scale',
  render: () => (
    <div
      style={{
        padding: 32,
        background: 'var(--md-sys-color-background)',
        fontFamily: 'var(--md-sys-typescale-family)',
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--md-sys-color-on-surface-muted)',
          marginBottom: 32,
        }}
      >
        Noto Sans TC — font-feature-settings: &quot;ss01&quot; &quot;cv11&quot;
      </div>

      <ScaleRow
        name="display-numeric"
        sizeToken="--md-sys-typescale-display-size"
        weightToken="--md-sys-typescale-display-weight"
        leadingToken="--md-sys-typescale-display-leading"
        trackingToken="--md-sys-typescale-display-tracking"
        sampleZh="2,847 件"
        sampleEn="1,234.5 H"
        note="KPI value, large stat number"
      />

      <ScaleRow
        name="title-lg"
        sizeToken="--md-sys-typescale-title-lg-size"
        weightToken="--md-sys-typescale-title-lg-weight"
        leadingToken="--md-sys-typescale-title-lg-leading"
        trackingToken="--md-sys-typescale-title-lg-tracking"
        sampleZh="168.5 H"
        sampleEn="March 2025"
        note="Archive month, drawer hours value"
      />

      <ScaleRow
        name="title"
        sizeToken="--md-sys-typescale-title-size"
        weightToken="--md-sys-typescale-title-weight"
        leadingToken="--md-sys-typescale-title-leading"
        trackingToken="--md-sys-typescale-title-tracking"
        sampleZh="銀行活存專案重設計"
        sampleEn="Redesign Banking Flow"
        note="Drawer card title"
      />

      <ScaleRow
        name="title-sm"
        sizeToken="--md-sys-typescale-title-sm-size"
        weightToken="--md-sys-typescale-title-sm-weight"
        leadingToken="--md-sys-typescale-title-sm-leading"
        trackingToken="--md-sys-typescale-title-sm-tracking"
        sampleZh="看板任務"
        sampleEn="Kanban Board"
        note="Topbar page title, panel header"
      />

      <ScaleRow
        name="body"
        sizeToken="--md-sys-typescale-body-size"
        weightToken="--md-sys-typescale-body-weight"
        leadingToken="--md-sys-typescale-body-leading"
        trackingToken="--md-sys-typescale-body-tracking"
        sampleZh="這是主要內文樣式，適用於一般段落和說明文字。"
        sampleEn="This is the base body style for prose and general content."
        note="Base body, prose"
      />

      <ScaleRow
        name="body-medium"
        sizeToken="--md-sys-typescale-body-medium-size"
        weightToken="--md-sys-typescale-body-medium-weight"
        leadingToken="--md-sys-typescale-body-medium-leading"
        trackingToken="--md-sys-typescale-body-medium-tracking"
        sampleZh="銀行活存定期利率研究"
        sampleEn="Research banking deposit rates"
        note="Card title, nav item, button label"
      />

      <ScaleRow
        name="body-semibold"
        sizeToken="--md-sys-typescale-body-semibold-size"
        weightToken="--md-sys-typescale-body-semibold-weight"
        leadingToken="--md-sys-typescale-body-semibold-leading"
        trackingToken="--md-sys-typescale-body-semibold-tracking"
        sampleZh="分析師看板"
        sampleEn="Analyst Panel"
        note="Panel headers, sidebar brand name"
      />

      <ScaleRow
        name="label"
        sizeToken="--md-sys-typescale-label-size"
        weightToken="--md-sys-typescale-label-weight"
        leadingToken="--md-sys-typescale-label-leading"
        trackingToken="--md-sys-typescale-label-tracking"
        sampleZh="本月工時"
        sampleEn="TOTAL HOURS"
        note="Data column headers, KPI label — uppercase only"
      />

      <ScaleRow
        name="meta"
        sizeToken="--md-sys-typescale-meta-size"
        weightToken="--md-sys-typescale-meta-weight"
        leadingToken="--md-sys-typescale-meta-leading"
        trackingToken="--md-sys-typescale-meta-tracking"
        sampleZh="D-042 · 3/15 · 14.5/20h"
        sampleEn="D-042 · 14.5/20h"
        note="Card ID, hours, badge text — not uppercase"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 24 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--md-sys-color-on-surface-muted)', marginBottom: 6 }}>annotation-sm/md</div>
          <code style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--md-sys-color-on-surface-faint)', display: 'block' }}>--md-sys-typescale-annotation-sm-size (10px)</code>
          <code style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--md-sys-color-on-surface-faint)', display: 'block' }}>--md-sys-typescale-annotation-md-size (11px)</code>
          <span style={{ fontSize: 10, color: 'var(--md-sys-color-status-info)', display: 'block', marginTop: 4 }}>Avatar initial, sidebar user role</span>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: 'var(--md-sys-color-cat-1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--md-sys-color-on-categorical)',
              fontSize: 'var(--md-sys-typescale-annotation-sm-size)',
              fontWeight: 'var(--md-sys-typescale-annotation-sm-weight)',
              fontFamily: 'var(--md-sys-typescale-family)',
            }}
          >
            蓁
          </div>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'var(--md-sys-color-cat-3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--md-sys-color-on-categorical)',
              fontSize: 'var(--md-sys-typescale-annotation-md-size)',
              fontWeight: 'var(--md-sys-typescale-annotation-md-weight)',
              fontFamily: 'var(--md-sys-typescale-family)',
            }}
          >
            蓉
          </div>
        </div>
      </div>
    </div>
  ),
};
