import './Avatar.css';

type AvatarSize = 'sm' | 'md' | 'lg';

type AvatarProps = {
  initial: string;
  hue?: number;
  photo?: string;
  size?: AvatarSize;
  alt?: string;
  className?: string;
};

export function Avatar({ initial, hue = 1, photo, size = 'sm', alt, className }: AvatarProps) {
  const hueIndex = ((((hue - 1) % 8) + 8) % 8) + 1;
  const style = { '--_av-bg': `var(--md-sys-color-cat-${hueIndex})` } as React.CSSProperties;

  return (
    <span
      className={['ui-avatar', `ui-avatar--${size}`, className].filter(Boolean).join(' ')}
      style={{ ...style, background: `var(--md-sys-color-cat-${hueIndex})` }}
      aria-label={alt ?? initial}
      role="img"
    >
      {photo ? (
        <img src={photo} alt={alt ?? initial} />
      ) : (
        initial
      )}
    </span>
  );
}
