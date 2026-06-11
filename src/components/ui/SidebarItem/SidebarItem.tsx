import { ReactNode, ButtonHTMLAttributes } from 'react';
import './SidebarItem.css';

type SidebarGroupProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

export function SidebarGroup({ label, children, className }: SidebarGroupProps) {
  return (
    <div className={['ui-sidebar-group', className].filter(Boolean).join(' ')}>
      <div className="ui-sidebar-group__heading">{label}</div>
      {children}
    </div>
  );
}

type SidebarItemProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  label: string;
  tag?: string | number;
  active?: boolean;
  className?: string;
};

export function SidebarItem({
  icon,
  label,
  tag,
  active = false,
  className,
  ...props
}: SidebarItemProps) {
  return (
    <button
      className={['ui-sidebar-item', className].filter(Boolean).join(' ')}
      data-on={active ? '1' : undefined}
      aria-current={active ? 'page' : undefined}
      {...props}
    >
      {icon && <span className="ui-sidebar-item__icon" aria-hidden="true">{icon}</span>}
      <span className="ui-sidebar-item__label">{label}</span>
      {tag !== undefined && (
        <span className="ui-sidebar-item__tag">{tag}</span>
      )}
    </button>
  );
}
