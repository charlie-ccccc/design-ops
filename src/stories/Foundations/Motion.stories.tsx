import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

const meta = {
  title: 'Foundations/Motion',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const tokenRows = [
  {
    token: '--md-sys-motion-duration-press',
    ref: '--md-ref-duration-050',
    value: '0.05s',
    easing: 'standard',
    role: 'Button press transform — micro tactile feedback',
  },
  {
    token: '--md-sys-motion-duration-sm',
    ref: '--md-ref-duration-120',
    value: '0.12s',
    easing: 'standard',
    role: 'Hover bg, border transitions',
  },
  {
    token: '--md-sys-motion-duration-md',
    ref: '--md-ref-duration-180',
    value: '0.18s',
    easing: 'standard',
    role: 'Scrim fade, popover appear',
  },
  {
    token: '--md-sys-motion-duration-lg',
    ref: '--md-ref-duration-280',
    value: '0.28s',
    easing: 'standard',
    role: 'Drawer slide, overlay enter',
  },
];

function TokenRow({ token, ref: refToken, value, role }: (typeof tokenRows)[0]) {
  const [running, setRunning] = useState(false);

  function trigger() {
    setRunning(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setRunning(true)));
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '220px 80px 1fr 140px',
        gap: 16,
        alignItems: 'center',
        paddingBottom: 20,
        marginBottom: 20,
        borderBottom: '1px solid var(--md-sys-color-divider)',
      }}
    >
      <div>
        <code style={{ fontSize: 10, fontFamily: 'monospace', display: 'block', color: 'var(--md-sys-color-on-surface)' }}>{token}</code>
        <code style={{ fontSize: 10, fontFamily: 'monospace', display: 'block', color: 'var(--md-sys-color-on-surface-muted)', marginTop: 2 }}>↳ {refToken}</code>
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--md-sys-typescale-family)', color: 'var(--md-sys-color-on-surface)' }}>{value}</span>
      <span style={{ fontSize: 12, color: 'var(--md-sys-color-on-surface-secondary)', fontFamily: 'var(--md-sys-typescale-family)' }}>{role}</span>
      <button
        onClick={trigger}
        style={{
          padding: '6px 14px',
          borderRadius: 'var(--md-sys-shape-corner-md)',
          background: 'var(--md-sys-color-primary-container)',
          color: 'var(--md-sys-color-on-primary-container)',
          border: 'none',
          cursor: 'pointer',
          fontSize: 12,
          fontFamily: 'var(--md-sys-typescale-family)',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            opacity: running ? 0.3 : 1,
            transform: running ? 'none' : 'none',
            transition: running
              ? `opacity ${token === '--md-sys-motion-duration-press' ? '0.05s' : token === '--md-sys-motion-duration-sm' ? '0.12s' : token === '--md-sys-motion-duration-md' ? '0.18s' : '0.28s'} cubic-bezier(0.25,0.46,0.45,0.94)`
              : 'none',
          }}
        >
          Preview ▶
        </span>
      </button>
    </div>
  );
}

function PressDemo() {
  const [pressed, setPressed] = useState(false);

  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <button
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onMouseLeave={() => setPressed(false)}
        style={{
          padding: '10px 20px',
          borderRadius: 'var(--md-sys-shape-corner-md)',
          background: pressed ? 'color-mix(in oklab, var(--md-sys-color-primary) 85%, black)' : 'var(--md-sys-color-primary)',
          color: 'var(--md-sys-color-on-primary)',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'var(--md-sys-typescale-family)',
          fontSize: 'var(--md-sys-typescale-body-medium-size)',
          fontWeight: 'var(--md-sys-typescale-body-medium-weight)',
          transform: pressed ? 'var(--md-sys-motion-press-transform)' : 'none',
          transition: `transform var(--md-sys-motion-duration-press) var(--md-sys-motion-easing-standard),
                       background var(--md-sys-motion-duration-sm) var(--md-sys-motion-easing-standard)`,
          userSelect: 'none',
        }}
      >
        按住我 Hold me
      </button>
      <span style={{ fontSize: 12, color: 'var(--md-sys-color-on-surface-muted)', fontFamily: 'var(--md-sys-typescale-family)' }}>
        {pressed ? `translateY(0.5px) — press` : 'press transform demo'}
      </span>
    </div>
  );
}

function HoverDemo() {
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          padding: '10px 20px',
          borderRadius: 'var(--md-sys-shape-corner-md)',
          background: hovered ? 'var(--md-sys-color-primary-container)' : 'var(--md-sys-color-surface-variant)',
          border: `1.5px solid ${hovered ? 'var(--md-sys-color-primary)' : 'transparent'}`,
          transition: `background var(--md-sys-motion-duration-sm) var(--md-sys-motion-easing-standard),
                       border-color var(--md-sys-motion-duration-sm) var(--md-sys-motion-easing-standard)`,
          fontFamily: 'var(--md-sys-typescale-family)',
          fontSize: 'var(--md-sys-typescale-body-medium-size)',
          color: 'var(--md-sys-color-on-surface)',
          cursor: 'default',
          userSelect: 'none',
        }}
      >
        Hover me — 0.12s
      </div>
      <span style={{ fontSize: 12, color: 'var(--md-sys-color-on-surface-muted)', fontFamily: 'var(--md-sys-typescale-family)' }}>
        bg + border transition at duration-sm
      </span>
    </div>
  );
}

function DrawerDemo() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <button
        onClick={() => setOpen((p) => !p)}
        style={{
          padding: '10px 20px',
          borderRadius: 'var(--md-sys-shape-corner-md)',
          background: 'var(--md-sys-color-surface-variant)',
          color: 'var(--md-sys-color-on-surface)',
          border: '1px solid var(--md-sys-color-outline)',
          cursor: 'pointer',
          fontFamily: 'var(--md-sys-typescale-family)',
          fontSize: 12,
        }}
      >
        {open ? 'Close ✕' : 'Open drawer ▶'}
      </button>
      <div
        style={{
          width: open ? 220 : 0,
          overflow: 'hidden',
          transition: `width var(--md-sys-motion-duration-lg) var(--md-sys-motion-easing-standard)`,
          background: 'var(--md-sys-color-surface)',
          borderRadius: 'var(--md-sys-shape-corner-lg)',
          border: open ? '1px solid var(--md-sys-color-outline)' : '0px solid transparent',
        }}
      >
        <div style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontFamily: 'var(--md-sys-typescale-family)', fontSize: 12, color: 'var(--md-sys-color-on-surface)' }}>
          Drawer panel — 0.28s slide
        </div>
      </div>
    </div>
  );
}

export const DurationTokens: Story = {
  name: 'Duration Tokens',
  render: () => (
    <div style={{ padding: 32, background: 'var(--md-sys-color-background)', fontFamily: 'var(--md-sys-typescale-family)' }}>
      <h3
        style={{
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--md-sys-color-on-surface-muted)',
          marginBottom: 24,
          marginTop: 0,
        }}
      >
        Motion — duration tokens
      </h3>

      <div style={{ marginBottom: 8, display: 'grid', gridTemplateColumns: '220px 80px 1fr 140px', gap: 16 }}>
        {['Token', 'Value', 'Role', ''].map((h) => (
          <span key={h} style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--md-sys-color-on-surface-faint)' }}>{h}</span>
        ))}
      </div>

      {tokenRows.map((row) => (
        <TokenRow key={row.token} {...row} />
      ))}

      <div style={{ marginTop: 8 }}>
        <code style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--md-sys-color-on-surface)' }}>--md-sys-motion-easing-standard</code>
        <span style={{ fontSize: 11, color: 'var(--md-sys-color-on-surface-muted)', marginLeft: 12 }}>cubic-bezier(0.25, 0.46, 0.45, 0.94)</span>
      </div>
    </div>
  ),
};

export const LiveDemos: Story = {
  name: 'Live Demos',
  render: () => (
    <div style={{ padding: 32, background: 'var(--md-sys-color-background)', fontFamily: 'var(--md-sys-typescale-family)', display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div>
        <h4 style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--md-sys-color-on-surface-muted)', marginBottom: 16, marginTop: 0 }}>
          Press transform — 0.05s (duration-press)
        </h4>
        <PressDemo />
      </div>

      <div>
        <h4 style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--md-sys-color-on-surface-muted)', marginBottom: 16, marginTop: 0 }}>
          Hover bg + border — 0.12s (duration-sm)
        </h4>
        <HoverDemo />
      </div>

      <div>
        <h4 style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--md-sys-color-on-surface-muted)', marginBottom: 16, marginTop: 0 }}>
          Drawer slide — 0.28s (duration-lg)
        </h4>
        <DrawerDemo />
      </div>
    </div>
  ),
};
