export const sum = (arr: number[]): number => arr.reduce((a, b) => a + b, 0);

export function groupBy<T>(arr: T[], key: keyof T | ((item: T) => string)): Record<string, T[]> {
  return arr.reduce((acc: Record<string, T[]>, x) => {
    const k = typeof key === 'function' ? key(x) : String(x[key]);
    if (!acc[k]) acc[k] = [];
    acc[k].push(x);
    return acc;
  }, {});
}

export const hue = (i: number): string => `var(--hue-c${((i - 1) % 8) + 1})`;

export const formatId = (n: number): string => `DESIGN-${String(n).padStart(4, '0')}`;

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('/').map(Number);
  let ny = y, nm = m + delta;
  if (nm < 1) { nm = 12; ny -= 1; }
  if (nm > 12) { nm = 1; ny += 1; }
  return `${ny}/${String(nm).padStart(2, '0')}`;
}

export function workingDaysInMonth(month: string, holidays: Array<{ date: string }>): number {
  const [y, mo] = month.split('/').map(Number);
  const total = new Date(y, mo, 0).getDate();
  const holidaySet = new Set(holidays.map(h => h.date));
  let count = 0;
  for (let d = 1; d <= total; d++) {
    const dow = new Date(y, mo - 1, d).getDay();
    if (dow === 0 || dow === 6) continue;
    const key = `${String(mo).padStart(2, '0')}/${String(d).padStart(2, '0')}`;
    if (holidaySet.has(key)) continue;
    count++;
  }
  return count;
}
