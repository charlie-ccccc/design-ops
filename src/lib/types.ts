export type CardStatus = 'belog' | 'todo' | 'designing' | 'reviewing' | 'done' | 'pending';
export type Cat = 'UIUX' | '平面視覺';
export type Priority = 'urgent' | 'high' | 'normal' | 'low' | 'lowest';
export type DashLayout = 'classic' | 'focus' | 'grid';
export type ChartType = 'donut' | 'pie' | 'bars';

export interface ActivityEntry {
  who: string;
  msg: string;
  t: string;
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  t: string;
}

export interface TimeLog {
  id: string;
  date: string;   // MM/DD
  time?: string;  // HH:MM (24h)
  hours: number;
  note: string;
}

export interface Card {
  id: string;
  month: string;
  title: string;
  dept: string;
  cat: Cat;
  owner: string;
  est: number;
  actual: number;
  requester?: string;
  requesterName?: string;
  timeLogs?: TimeLog[];
  comments?: Comment[];
  status: CardStatus;
  prio: Priority;
  due: string;
  desc: string;
  attach: number;
  activity: ActivityEntry[];
  createdAt?: string;
}

export interface Member {
  id: string;
  name: string;
  alias: string;
  initial: string;
  cat: Cat;
  hue: number;
  base: number;
  ratio: number; // work hour ratio: 0.625 (manager) or 0.875 (regular)
  photo?: string;
}

export interface PublicHoliday {
  date: string; // MM/DD
  name: string;
}

export interface Status {
  id: CardStatus;
  name: string;
  dot: string;
}

export interface LeaveEntry {
  id: string;
  member: string;
  date: string;      // start date MM/DD
  endDate?: string;  // end date MM/DD (omit if same day)
  hours: number;
  reason?: string;
}

export interface HistoryMonth {
  month: string;
  cards: number;
  totalEst: number;
  totalActual: number;
  capacity: number;       // raw available hours (not a percentage)
  topDept: string;
  deptTotals: Record<string, number>;
  memberTotals: Record<string, number>;
  cardList: Card[];
}

export interface AppNotification {
  id: string;
  uid: string;           // recipient user ID
  type: 'mention' | 'assigned' | 'comment' | 'due';
  cardId: string;
  cardTitle: string;
  from: string;          // who triggered (name string)
  message: string;
  read: boolean;
  createdAt: number;     // Date.now()
}

export interface ChartDataItem {
  name: string;
  full?: string;
  value: number;
  color: string;
}
