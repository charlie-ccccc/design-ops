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
