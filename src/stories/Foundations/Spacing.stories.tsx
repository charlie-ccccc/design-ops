import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Foundations/Spacing & Shape',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function SpacingBar({ token, label }: { token: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
      <div
        style={{
          width: `var(${token})`,
          height: 24,
          background: 'var(--md-sys-color-primary)',
          opacity: 0.7,
          borderRadius: 3,
          flexShrink: 0,
          minWidth: 2,
        }}
      />
      <code style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--md-sys-color-on-surface)' }}>{token}</code>
      <span style={{ fontSize: 11, color: 'var(--md-sys-color-on-surface-muted)' }}>{label}</span>
    </div>
  );
}

function RadiusSwatch({ token, label }: { token: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
      <div
        style={{
          width: 52,
          height: 52,
          background: 'var(--md-sys-color-primary-container)',
          border: '1.5px solid var(--md-sys-color-primary)',
          borderRadius: `var(${token})`,
          flexShrink: 0,
        }}
      />
      <div>
        <code style={{ fontSize: 11, fontFamily: 'monospace', display: 'block', color: 'var(--md-sys-color-on-surface)' }}>{token}</code>
        <span style={{ fontSize: 11, color: 'var(--md-sys-color-on-surface-muted)' }}>{label}</span>
      </div>
    </div>
  );
}

function ElevationSwatch({ token, label }: { token: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
      <div
        style={{
          width: 80,
          height: 60,
          background: 'var(--md-sys-color-surface)',
          borderRadius: 8,
          boxShadow: `var(${token})`,
          flexShrink: 0,
        }}
      />
      <div>
        <code style={{ fontSize: 11, fontFamily: 'monospace', display: 'block', color: 'var(--md-sys-color-on-surface)' }}>{token}</code>
        <span style={{ fontSize: 11, color: 'var(--md-sys-color-on-surface-muted)' }}>{label}</span>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <h3
        style={{
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--md-sys-color-on-surface-muted)',
          marginBottom: 16,
          marginTop: 0,
          fontFamily: 'inherit',
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

export const SpacingScale: Story = {
  name: 'Spacing Scale',
  render: () => (
    <div style={{ padding: 32, background: 'var(--md-sys-color-background)', fontFamily: 'var(--md-sys-typescale-family)' }}>
      <Section title="Spacing — gap tokens">
        <SpacingBar token="--md-sys-spacing-gap-xs" label="4px — icon-dot, min gap" />
        <SpacingBar token="--md-sys-spacing-gap-sm" label="6px — icon-label inline gap" />
        <SpacingBar token="--md-sys-spacing-gap-md" label="8px — card stack gap" />
        <SpacingBar token="--md-sys-spacing-gap-lg" label="10px — sidebar item gap" />
        <SpacingBar token="--md-sys-spacing-section-gap" label="14px — dashboard section gap" />
        <SpacingBar token="--md-sys-spacing-page-gutter" label="22px — horizontal page gutter" />
        <SpacingBar token="--md-sys-spacing-page-top" label="18px — vertical page top" />
      </Section>

      <Section title="Inset — padding tokens">
        <SpacingBar token="--md-sys-spacing-inset-sm" label="10px — compact inner padding" />
        <SpacingBar token="--md-sys-spacing-inset-md" label="12px — section inner padding" />
        <SpacingBar token="--md-sys-spacing-inset-lg" label="16px — component inner padding" />
        <SpacingBar token="--md-sys-spacing-inset-xl" label="20px — drawer / overlay horizontal" />
      </Section>

      <Section title="Density (adapts with data-density=&quot;compact&quot;)">
        <SpacingBar token="--md-sys-density-pad" label="16px default / 10px compact — component internal padding" />
        <SpacingBar token="--md-sys-density-row" label="36px default / 28px compact — control / row height" />
        <SpacingBar token="--md-sys-density-inner" label="14px default / 10px compact — card / list inner padding" />
      </Section>

      <Section title="App Shell Sizing">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <code style={{ fontSize: 11, fontFamily: 'monospace' }}>--md-sys-size-side-panel-width</code>
          <span style={{ fontSize: 11, color: 'var(--md-sys-color-on-surface-muted)' }}>232px — sidebar nav</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <code style={{ fontSize: 11, fontFamily: 'monospace' }}>--md-sys-size-topbar-height</code>
          <span style={{ fontSize: 11, color: 'var(--md-sys-color-on-surface-muted)' }}>56px — topbar</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <code style={{ fontSize: 11, fontFamily: 'monospace' }}>--md-sys-size-kanban-col</code>
          <span style={{ fontSize: 11, color: 'var(--md-sys-color-on-surface-muted)' }}>296px — kanban column</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <code style={{ fontSize: 11, fontFamily: 'monospace' }}>--md-sys-size-drawer-width</code>
          <span style={{ fontSize: 11, color: 'var(--md-sys-color-on-surface-muted)' }}>460px — detail drawer</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <code style={{ fontSize: 11, fontFamily: 'monospace' }}>--md-sys-size-overlay-max</code>
          <span style={{ fontSize: 11, color: 'var(--md-sys-color-on-surface-muted)' }}>520px — modal max width</span>
        </div>
      </Section>
    </div>
  ),
};

export const ShapeTokens: Story = {
  name: 'Shape & Radius',
  render: () => (
    <div style={{ padding: 32, background: 'var(--md-sys-color-background)', fontFamily: 'var(--md-sys-typescale-family)' }}>
      <Section title="Corner Radius">
        <RadiusSwatch token="--md-sys-shape-corner-sm" label="6px — chips, icon buttons, heat cells" />
        <RadiusSwatch token="--md-sys-shape-corner-md" label="9px — buttons, inputs, nav items, kanban card" />
        <RadiusSwatch token="--md-sys-shape-corner-lg" label="12px — panels, kanban columns" />
        <RadiusSwatch token="--md-sys-shape-corner-xl" label="16px — modals, brand mark" />
        <RadiusSwatch token="--md-sys-shape-corner-full" label="99px — pill / badge / avatar circle" />
      </Section>
    </div>
  ),
};

export const ElevationTokens: Story = {
  name: 'Elevation',
  render: () => (
    <div style={{ padding: 32, background: 'var(--md-sys-color-background)', fontFamily: 'var(--md-sys-typescale-family)' }}>
      <Section title="Elevation — light mode">
        <ElevationSwatch token="--md-sys-elevation-sm" label="sm — kanban card hover, popover" />
        <ElevationSwatch token="--md-sys-elevation-md" label="md — floating card, tooltip" />
        <ElevationSwatch token="--md-sys-elevation-lg" label="lg — modal, drawer" />
      </Section>

      <Section title="Opacity">
        {[
          ['--md-ref-opacity-06', '0.06', 'divider / hover tint'],
          ['--md-ref-opacity-08', '0.08', 'outline border'],
          ['--md-ref-opacity-16', '0.16', 'outline-strong'],
          ['--md-ref-opacity-32', '0.32', 'panel scrim'],
          ['--md-ref-opacity-36', '0.36', 'modal overlay scrim'],
          ['--md-ref-opacity-40', '0.40', 'drag-dim (dragging card)'],
        ].map(([token, value, role]) => (
          <div key={token} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div
              style={{
                width: 36,
                height: 24,
                borderRadius: 4,
                background: `rgba(28,25,23, ${value})`,
                border: '1px solid var(--md-sys-color-outline)',
              }}
            />
            <code style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--md-sys-color-on-surface)' }}>{token}</code>
            <span style={{ fontSize: 11, color: 'var(--md-sys-color-on-surface-muted)' }}>{value} — {role}</span>
          </div>
        ))}
      </Section>
    </div>
  ),
};
