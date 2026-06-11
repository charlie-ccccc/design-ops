import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.css';

type ButtonVariant = 'default' | 'primary' | 'ghost';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  icon?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  children?: ReactNode;
};

export function Button({
  variant = 'default',
  icon = false,
  leadingIcon,
  trailingIcon,
  children,
  className,
  ...props
}: ButtonProps) {
  const cls = [
    'ui-button',
    variant !== 'default' && `ui-button--${variant}`,
    icon && 'ui-button--icon',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={cls} {...props}>
      {leadingIcon}
      {children}
      {trailingIcon}
    </button>
  );
}
