import type { Card, CardStatus, Member, Status, LeaveEntry, HistoryMonth } from './types';
import { formatId } from './utils';

export const DEPTS = [
  '設計部-平面視覺', '設計部-UIUX', '總經理室', '人力資源部',
  '合作夥伴事業群-法人事業', '金融事業群-大眾事業', '金融事業群-大眾事業(券商)',
  '金融事業群-流量事業-同學會', '金融事業群-流量事業-網站', '金融事業群-Money錢',
  '合作夥伴事業群-保險事業', '全球金融事業群-海外券商', '消費事業群', '通用工程', '產品部',
];

export const DEPT_SHORT: Record<string, string> = {
  '設計部-平面視覺': '平面', '設計部-UIUX': 'UIUX', '總經理室': '總經理室',
  '人力資源部': '人資', '合作夥伴事業群-法人事業': '合夥-法人',
  '金融事業群-大眾事業': '金融-大眾', '金融事業群-大眾事業(券商)': '金融-券商',
  '金融事業群-流量事業-同學會': '流量-同學會', '金融事業群-流量事業-網站': '流量-網站',
  '金融事業群-Money錢': 'Money錢', '合作夥伴事業群-保險事業': '合夥-保險',
  '全球金融事業群-海外券商': '海外券商', '消費事業群': '消費', '通用工程': '通用工程', '產品部': '產品部',
};

export const DEPT_HUE: Record<string, number> = {
  '設計部-平面視覺': 5, '設計部-UIUX': 1, '總經理室': 2, '人力資源部': 4,
  '合作夥伴事業群-法人事業': 3, '金融事業群-大眾事業': 7, '金融事業群-大眾事業(券商)': 6,
  '金融事業群-流量事業-同學會': 8, '金融事業群-流量事業-網站': 1, '金融事業群-Money錢': 5,
  '合作夥伴事業群-保險事業': 2, '全球金融事業群-海外券商': 3, '消費事業群': 6, '通用工程': 4, '產品部': 7,
};

export const MEMBERS: Member[] = [
  { id: 'mia',     name: '吳奕蓁', alias: 'Mia',         initial: '蓁', cat: 'UIUX',   hue: 1, base: 168 },
  { id: 'annie',   name: '王映蓉', alias: 'Annie Wang',  initial: '蓉', cat: 'UIUX',   hue: 3, base: 168 },
  { id: 'shujuan', name: '楊舒娟', alias: 'Shujuan',     initial: '娟', cat: '平面視覺', hue: 5, base: 168 },
  { id: 'baoxuan', name: '寶萱',   alias: 'Bao',         initial: '寶', cat: '平面視覺', hue: 6, base: 168 },
  { id: 'charlie', name: '陳巧玲', alias: 'Charlie',     initial: '巧', cat: 'UIUX',   hue: 4, base: 152 },
  { id: 'sunny',   name: '熊禹晴', alias: 'Sunny',       initial: '禹', cat: '平面視覺', hue: 2, base: 168 },
];

export const MEMBER_BY_ID: Record<string, Member> = Object.fromEntries(MEMBERS.map(m => [m.id, m]));

export const STATUSES: Status[] = [
  { id: 'belog',     name: 'Belog',   dot: 'var(--hue-c3)' },
  { id: 'todo',      name: '待處理',  dot: 'var(--muted-2)' },
  { id: 'designing', name: '設計中',  dot: 'var(--st-progress)' },
  { id: 'reviewing', name: '審核中',  dot: 'var(--st-review)' },
  { id: 'done',      name: '設計完成', dot: 'var(--st-done)' },
  { id: 'pending',   name: 'Pending', dot: 'var(--st-block)' },
];

export const PRIORITY_LABEL: Record<string, string> = { high: '高', normal: '中', low: '低' };

const SEED: Omit<Card, 'id' | 'month' | 'desc' | 'attach' | 'activity'>[] = [
  { title: 'Money錢 APP 全新導覽流程 v2',     dept: '金融事業群-Money錢',            cat: 'UIUX',   owner: 'mia',     est: 32, actual: 18, status: 'designing', prio: 'high',   due: '05/28' },
  { title: '海外券商新客戶收款頁面改版',       dept: '全球金融事業群-海外券商',       cat: 'UIUX',   owner: 'annie',   est: 24, actual: 22, status: 'reviewing', prio: 'high',   due: '05/22' },
  { title: '同學會社群 Profile 頁改版',        dept: '金融事業群-流量事業-同學會',    cat: 'UIUX',   owner: 'charlie', est: 20, actual: 6,  status: 'designing', prio: 'normal', due: '05/30' },
  { title: '大眾事業 退休模擬器 互動',         dept: '金融事業群-大眾事業',           cat: 'UIUX',   owner: 'mia',     est: 16, actual: 0,  status: 'belog',     prio: 'normal', due: '06/03' },
  { title: '產品部 後台權限管理 IA 重構',      dept: '產品部',                        cat: 'UIUX',   owner: 'charlie', est: 12, actual: 14, status: 'done',      prio: 'normal', due: '05/14' },
  { title: 'Money錢 訂閱頁 A/B 測試版',       dept: '金融事業群-Money錢',            cat: 'UIUX',   owner: 'annie',   est: 8,  actual: 4,  status: 'designing', prio: 'low',    due: '05/26' },
  { title: '通用工程 內部工單系統 v1',         dept: '通用工程',                      cat: 'UIUX',   owner: 'mia',     est: 18, actual: 0,  status: 'belog',     prio: 'normal', due: '06/06' },
  { title: '網站事業群 SEO 選股頁改版',        dept: '金融事業群-流量事業-網站',      cat: 'UIUX',   owner: 'annie',   est: 14, actual: 13, status: 'done',      prio: 'normal', due: '05/10' },
  { title: '消費事業群 電商服務中心',          dept: '消費事業群',                    cat: 'UIUX',   owner: 'charlie', est: 22, actual: 8,  status: 'designing', prio: 'high',   due: '05/29' },
  { title: '5 月季報 KV 主視覺',              dept: '總經理室',                      cat: '平面視覺', owner: 'shujuan', est: 12, actual: 11, status: 'reviewing', prio: 'high',   due: '05/22' },
  { title: '海外券商 EDM 系列 (6 套)',         dept: '全球金融事業群-海外券商',       cat: '平面視覺', owner: 'sunny',   est: 18, actual: 9,  status: 'designing', prio: 'normal', due: '05/27' },
  { title: 'Money錢 SocialKV - 聯名合作版',  dept: '金融事業群-Money錢',            cat: '平面視覺', owner: 'baoxuan', est: 8,  actual: 8,  status: 'done',      prio: 'normal', due: '05/12' },
  { title: '人資 員工離退流程海報組',          dept: '人力資源部',                    cat: '平面視覺', owner: 'shujuan', est: 10, actual: 4,  status: 'designing', prio: 'normal', due: '05/28' },
  { title: '金融大眾 季刊封面 + 拉頁',        dept: '金融事業群-大眾事業',           cat: '平面視覺', owner: 'sunny',   est: 16, actual: 0,  status: 'belog',     prio: 'normal', due: '06/02' },
  { title: '同學會 線上馬拉松主視覺',          dept: '金融事業群-流量事業-同學會',    cat: '平面視覺', owner: 'baoxuan', est: 14, actual: 14, status: 'reviewing', prio: 'high',   due: '05/21' },
  { title: '保險事業 新書宣傳長版',            dept: '合作夥伴事業群-保險事業',       cat: '平面視覺', owner: 'shujuan', est: 12, actual: 13, status: 'pending',   prio: 'low',    due: '05/15' },
  { title: '法人事業 簡報模板 重製',           dept: '合作夥伴事業群-法人事業',       cat: '平面視覺', owner: 'sunny',   est: 20, actual: 7,  status: 'designing', prio: 'normal', due: '05/30' },
  { title: '券商 週年紀念 行銷貼圖',           dept: '金融事業群-大眾事業(券商)',     cat: '平面視覺', owner: 'baoxuan', est: 6,  actual: 5,  status: 'reviewing', prio: 'normal', due: '05/22' },
  { title: '消費事業群 KOL 合作貼文模板',      dept: '消費事業群',                    cat: '平面視覺', owner: 'baoxuan', est: 10, actual: 0,  status: 'todo',      prio: 'low',    due: '06/05' },
  { title: '網站 首頁 Banner 改版 (6 款)',    dept: '金融事業群-流量事業-網站',      cat: '平面視覺', owner: 'sunny',   est: 14, actual: 0,  status: 'todo',      prio: 'normal', due: '06/04' },
  { title: 'Money錢 數位徽章 16 款',          dept: '金融事業群-Money錢',            cat: '平面視覺', owner: 'shujuan', est: 24, actual: 12, status: 'designing', prio: 'normal', due: '05/31' },
  { title: '通用工程 Onboarding 文宣',         dept: '通用工程',                      cat: '平面視覺', owner: 'baoxuan', est: 8,  actual: 0,  status: 'todo',      prio: 'low',    due: '06/06' },
  { title: '總經理室 年中策略會議 ppt',        dept: '總經理室',                      cat: '平面視覺', owner: 'sunny',   est: 16, actual: 6,  status: 'designing', prio: 'high',   due: '05/29' },
  { title: '產品部 ProductCon 活動視覺',       dept: '產品部',                        cat: '平面視覺', owner: 'shujuan', est: 14, actual: 0,  status: 'todo',      prio: 'normal', due: '06/02' },
  { title: '海外券商 6 月主題日曆組',          dept: '全球金融事業群-海外券商',       cat: '平面視覺', owner: 'baoxuan', est: 10, actual: 4,  status: 'designing', prio: 'normal', due: '05/28' },
];

function seedActivity(card: Omit<Card, 'id' | 'month' | 'desc' | 'attach' | 'activity'>) {
  const owner = MEMBER_BY_ID[card.owner].name;
  const out = [{ who: '系統', msg: `${owner} 接下此單`, t: '5/06 10:12' }];
  if (card.actual > 0) out.push({ who: owner, msg: `回報實際工時 +${Math.round(card.actual * 0.6)}h`, t: '5/12 14:30' });
  if (card.status === 'reviewing' || card.status === 'done' || card.status === 'pending') out.push({ who: owner, msg: '送出審核', t: '5/19 09:48' });
  if (card.status === 'done') out.push({ who: 'Lead', msg: '結案，已存入 5 月結算', t: '5/20 17:05' });
  if (card.status === 'pending') out.push({ who: '系統', msg: '需求單位取消需求，移至 Pending 保留工時', t: '5/20 11:20' });
  return out;
}

export const CURRENT_CARDS: Card[] = SEED.map((c, i) => ({
  ...c,
  id: formatId(i + 1),
  month: '2026/05',
  desc: c.cat === 'UIUX'
    ? '本單為 UIUX 設計需求，交付物含 Figma 原型、規格、互動 demo 影片。'
    : '本單為平面視覺需求，交付物含主視覺、延伸 SocialKV、可編輯原始檔。',
  attach: 2 + (i % 4),
  activity: seedActivity(c),
}));

function makeHistoryCards(month: string, count: number, seed: number): Card[] {
  const prefix = month.replace('/', '');
  const [, mon] = month.split('/');
  return Array.from({ length: count }, (_, i) => {
    const s = SEED[i % SEED.length];
    const r = (seed * 31 + i * 17) % 100;
    const est = Math.max(4, Math.round(s.est * (0.7 + (r % 5) * 0.08)));
    const actual = Math.max(1, Math.round(s.actual > 0 ? s.actual * (0.65 + (r % 4) * 0.1) : est * 0.8));
    const status: CardStatus = i % 7 === 0 ? 'pending' : 'done';
    const owner = MEMBER_BY_ID[s.owner].name;
    return {
      ...s,
      id: `${prefix}-${formatId(i + 1)}`,
      month,
      status,
      est,
      actual,
      desc: s.cat === 'UIUX'
        ? '本單為 UIUX 設計需求，交付物含 Figma 原型、規格、互動 demo 影片。'
        : '本單為平面視覺需求，交付物含主視覺、延伸 SocialKV、可編輯原始檔。',
      attach: 2 + (i % 4),
      activity: [
        { who: '系統', msg: `${owner} 接下此單`, t: `${mon}/06 10:12` },
        { who: owner, msg: `回報實際工時 +${Math.round(actual * 0.6)}h`, t: `${mon}/14 15:20` },
        { who: owner, msg: '送出審核', t: `${mon}/22 09:48` },
        status === 'done'
          ? { who: 'Lead', msg: '結案，已存入結算', t: `${mon}/28 17:05` }
          : { who: '系統', msg: '需求單位取消需求，移至 Pending 保留工時', t: `${mon}/28 11:20` },
      ],
    };
  });
}

export const HISTORY: HistoryMonth[] = [
  {
    month: '2026/04', cards: 31, totalEst: 412, totalActual: 438, capacity: 1008,
    topDept: '金融事業群-Money錢',
    deptTotals: { '金融事業群-Money錢': 78, '金融事業群-流量事業-同學會': 56, '全球金融事業群-海外券商': 48, '金融事業群-大眾事業': 42, '總經理室': 36, '消費事業群': 34, '產品部': 28, '人力資源部': 22, '通用工程': 18, '金融事業群-流量事業-網站': 16, '合作夥伴事業群-法人事業': 14, '合作夥伴事業群-保險事業': 12, '金融事業群-大眾事業(券商)': 8 },
    memberTotals: { mia: 88, annie: 76, charlie: 62, shujuan: 78, baoxuan: 60, sunny: 74 },
    cardList: makeHistoryCards('2026/04', 31, 7),
  },
  {
    month: '2026/03', cards: 28, totalEst: 396, totalActual: 372, capacity: 984,
    topDept: '金融事業群-大眾事業',
    deptTotals: { '金融事業群-大眾事業': 64, '金融事業群-Money錢': 58, '產品部': 48, '全球金融事業群-海外券商': 42, '總經理室': 36, '消費事業群': 32, '金融事業群-流量事業-網站': 30, '人力資源部': 24, '通用工程': 22, '金融事業群-大眾事業(券商)': 14, '合作夥伴事業群-法人事業': 12, '合作夥伴事業群-保險事業': 8 },
    memberTotals: { mia: 82, annie: 68, charlie: 58, shujuan: 64, baoxuan: 54, sunny: 70 },
    cardList: makeHistoryCards('2026/03', 28, 13),
  },
  {
    month: '2026/02', cards: 24, totalEst: 334, totalActual: 318, capacity: 936,
    topDept: '金融事業群-Money錢',
    deptTotals: { '金融事業群-Money錢': 62, '金融事業群-流量事業-同學會': 52, '金融事業群-大眾事業': 44, '產品部': 38, '總經理室': 32, '消費事業群': 28, '通用工程': 20, '人力資源部': 18, '金融事業群-流量事業-網站': 16, '合作夥伴事業群-法人事業': 10, '全球金融事業群-海外券商': 14 },
    memberTotals: { mia: 68, annie: 60, charlie: 48, shujuan: 56, baoxuan: 48, sunny: 54 },
    cardList: makeHistoryCards('2026/02', 24, 3),
  },
];

export const DEFAULT_LEAVE: LeaveEntry[] = [
  { id: 'lv1', member: 'mia',     date: '05/12', hours: 8,  reason: '特休' },
  { id: 'lv2', member: 'annie',   date: '05/19', hours: 4,  reason: '個人事假' },
  { id: 'lv3', member: 'shujuan', date: '05/06', hours: 16, reason: '特休 (2 天)' },
  { id: 'lv4', member: 'charlie', date: '05/22', hours: 8,  reason: '公假 - 教育訓練' },
];

export const DEFAULT_BASE: Record<string, number> = Object.fromEntries(MEMBERS.map(m => [m.id, m.base]));
