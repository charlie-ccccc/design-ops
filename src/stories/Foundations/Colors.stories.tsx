import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Foundations/Colors',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type SwatchProps = {
  token: string;
  role: string;
  hex?: string;
  sysToken?: string;
};

function Swatch({ token, role, hex, sysToken }: SwatchProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 6,
          background: `var(${token})`,
          border: '1px solid var(--md-sys-color-outline)',
          flexShrink: 0,
        }}
      />
      <div>
        <code style={{ fontSize: 11, fontFamily: 'monospace', display: 'block', color: 'var(--md-sys-color-on-surface)' }}>
          {token}
        </code>
        {sysToken && (
          <code style={{ fontSize: 10, fontFamily: 'monospace', display: 'block', color: 'var(--md-sys-color-on-surface-muted)' }}>
            ↳ {sysToken}
          </code>
        )}
        <span style={{ fontSize: 11, color: 'var(--md-sys-color-on-surface-secondary)', display: 'block' }}>
          {role}{hex && <span style={{ color: 'var(--md-sys-color-on-surface-faint)', marginLeft: 6 }}>{hex}</span>}
        </span>
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

export const WarmNeutralPalette: Story = {
  name: 'Warm Neutral',
  render: () => (
    <div style={{ padding: 32, background: 'var(--md-sys-color-background)', fontFamily: 'var(--md-sys-typescale-family)', minHeight: '100vh' }}>
      <Section title="Warm Neutral — 100 (lightest) → 10 (darkest)">
        <Swatch token="--md-ref-color-warm-100" hex="#FFFFFF" sysToken="--md-sys-color-surface" role="Pure white — card / panel surface" />
        <Swatch token="--md-ref-color-warm-97" hex="#FAFAF7" sysToken="--md-sys-color-background" role="Page background" />
        <Swatch token="--md-ref-color-warm-95" hex="#F7F6F2" sysToken="--md-sys-color-surface-variant" role="Secondary surface (input fill, column header)" />
        <Swatch token="--md-ref-color-warm-93" hex="#F4F3EE" sysToken="--md-sys-color-background-elevated" role="Elevated body region" />
        <Swatch token="--md-ref-color-warm-75" hex="#C7C5BF" sysToken="--md-sys-color-outline-faint" role="Faint — zero-value cells, empty state" />
        <Swatch token="--md-ref-color-warm-58" hex="#9A9893" sysToken="--md-sys-color-on-surface-faint" role="Disabled / placeholder text" />
        <Swatch token="--md-ref-color-warm-42" hex="#6B6864" sysToken="--md-sys-color-on-surface-muted" role="Muted foreground — metadata, captions" />
        <Swatch token="--md-ref-color-warm-18" hex="#2E2D29" sysToken="--md-sys-color-on-surface-secondary" role="Secondary foreground — icons, secondary text" />
        <Swatch token="--md-ref-color-warm-10" hex="#1A1A17" sysToken="--md-sys-color-on-surface" role="Primary foreground — body text" />
      </Section>

      <Section title="Outline & Divider">
        <Swatch token="--md-sys-color-outline" role="Card / input / panel border — rgba(28,25,23,0.08)" />
        <Swatch token="--md-sys-color-outline-strong" role="Hover / active emphasis border — rgba(28,25,23,0.16)" />
        <Swatch token="--md-sys-color-outline-faint" role="Faint border — zero cells, empty state" />
        <Swatch token="--md-sys-color-divider" role="Internal separator — rgba(28,25,23,0.06)" />
      </Section>
    </div>
  ),
};

export const AccentViolet: Story = {
  name: 'Accent / Primary',
  render: () => (
    <div style={{ padding: 32, background: 'var(--md-sys-color-background)', fontFamily: 'var(--md-sys-typescale-family)' }}>
      <Section title="Violet — 95 (lightest) → 28 (darkest)">
        <Swatch token="--md-ref-color-violet-95" hex="#EDE8FB" sysToken="--md-sys-color-primary-container" role="Soft accent fill — hover over drag column, calendar today" />
        <Swatch token="--md-ref-color-violet-74" hex="#8B83D4" role="Accent in dark mode" />
        <Swatch token="--md-ref-color-violet-66" hex="#7A71C6" role="Categorical violet (UIUX dept)" />
        <Swatch token="--md-ref-color-violet-52" hex="#5C4EC5" sysToken="--md-sys-color-primary" role="Primary accent (light mode) — CTA bg, active icon" />
        <Swatch token="--md-ref-color-violet-28" hex="#322A56" sysToken="--md-sys-color-primary-container (dark)" role="Primary container in dark mode" />
      </Section>
      <Section title="Primary Semantic">
        <Swatch token="--md-sys-color-primary" role="CTA background, avatar accent, active nav icon" />
        <Swatch token="--md-sys-color-on-primary" role="Text / icon on primary bg" />
        <Swatch token="--md-sys-color-primary-container" role="Soft accent fill" />
        <Swatch token="--md-sys-color-on-primary-container" role="Text on soft accent fill" />
      </Section>
    </div>
  ),
};

export const CategoricalColors: Story = {
  name: 'Categorical Hues',
  render: () => (
    <div style={{ padding: 32, background: 'var(--md-sys-color-background)', fontFamily: 'var(--md-sys-typescale-family)' }}>
      <Section title="Categorical Hues — 8 dept / member colors (uniform L≈0.66, C≈0.10–0.13)">
        <Swatch token="--md-sys-color-cat-1" role="violet — 設計部 UIUX" />
        <Swatch token="--md-sys-color-cat-2" role="amber — 總經理室" />
        <Swatch token="--md-sys-color-cat-3" role="cyan — 合夥-法人" />
        <Swatch token="--md-sys-color-cat-4" role="green — 人力資源部" />
        <Swatch token="--md-sys-color-cat-5" role="lime — 設計部平面視覺" />
        <Swatch token="--md-sys-color-cat-6" role="pink — 金融-券商" />
        <Swatch token="--md-sys-color-cat-7" role="blue — 金融-大眾" />
        <Swatch token="--md-sys-color-cat-8" role="chartreuse — 流量-同學會" />
      </Section>
      <Section title="On Categorical (text on hue bg)">
        <Swatch token="--md-sys-color-on-categorical" role="Avatar / badge label on hue background — always white" />
      </Section>
    </div>
  ),
};

export const StatusColors: Story = {
  name: 'Status Colors',
  render: () => (
    <div style={{ padding: 32, background: 'var(--md-sys-color-background)', fontFamily: 'var(--md-sys-typescale-family)' }}>
      <Section title="Status — 5 semantic states">
        <Swatch token="--md-sys-color-status-neutral" role="neutral — todo / default" />
        <Swatch token="--md-sys-color-status-info" role="info — in progress (designing)" />
        <Swatch token="--md-sys-color-status-warning" role="warning — review / caution" />
        <Swatch token="--md-sys-color-status-success" role="success — done / positive delta" />
        <Swatch token="--md-sys-color-status-error" role="error — blocked / overrun / overdue" />
      </Section>
    </div>
  ),
};

export const DarkModePalette: Story = {
  name: 'Dark Mode Palette',
  render: () => (
    <div
      data-theme="dark"
      style={{
        padding: 32,
        background: 'var(--md-sys-color-background)',
        fontFamily: 'var(--md-sys-typescale-family)',
        minHeight: '100vh',
      }}
    >
      <Section title="Cool-Dark palette — 93 (lightest) → 6 (darkest)">
        <Swatch token="--md-ref-color-dark-93" hex="#EDEDE9" sysToken="--md-sys-color-on-surface (dark)" role="Primary text in dark" />
        <Swatch token="--md-ref-color-dark-79" hex="#C9C8C3" sysToken="--md-sys-color-on-surface-secondary (dark)" role="Secondary text" />
        <Swatch token="--md-ref-color-dark-54" hex="#8B8985" sysToken="--md-sys-color-on-surface-muted (dark)" role="Muted text" />
        <Swatch token="--md-ref-color-dark-37" hex="#5F5E5A" sysToken="--md-sys-color-on-surface-faint (dark)" role="Faint text" />
        <Swatch token="--md-ref-color-dark-23" hex="#3C3B38" sysToken="--md-sys-color-outline-faint (dark)" role="Faint / empty state" />
        <Swatch token="--md-ref-color-dark-14" hex="#1F1F23" sysToken="--md-sys-color-surface-variant (dark)" role="Surface variant" />
        <Swatch token="--md-ref-color-dark-11" hex="#18181B" sysToken="--md-sys-color-surface (dark)" role="Surface" />
        <Swatch token="--md-ref-color-dark-9" hex="#161618" sysToken="--md-sys-color-background-elevated (dark)" role="Background elevated" />
        <Swatch token="--md-ref-color-dark-6" hex="#0E0E10" sysToken="--md-sys-color-background (dark)" role="Page background" />
      </Section>
      <Section title="Semantic roles (dark)">
        <Swatch token="--md-sys-color-background" role="Page background" />
        <Swatch token="--md-sys-color-surface" role="Card / panel surface" />
        <Swatch token="--md-sys-color-on-surface" role="Primary text" />
        <Swatch token="--md-sys-color-primary" role="Accent / CTA" />
        <Swatch token="--md-sys-color-outline" role="Border" />
      </Section>
    </div>
  ),
};
