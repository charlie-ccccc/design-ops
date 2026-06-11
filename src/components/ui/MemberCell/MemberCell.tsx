import './MemberCell.css';

type MemberCellProps = {
  name: string;
  initial?: string;
  photo?: string;
  color?: string;
  sub?: string;
  size?: 'sm' | 'md';
};

export function MemberCell({ name, initial, photo, color, sub, size = 'sm' }: MemberCellProps) {
  const avatarClass = `ui-member-cell__avatar ui-member-cell__avatar--${size}`;
  return (
    <div className="ui-member-cell">
      {photo
        ? <img src={photo} alt={name} className={avatarClass} />
        : <div className={avatarClass} style={{ background: color }}>{initial ?? name[0]}</div>}
      <div className="ui-member-cell__info">
        <span className="ui-member-cell__name">{name}</span>
        {sub && <span className="ui-member-cell__sub">{sub}</span>}
      </div>
    </div>
  );
}
