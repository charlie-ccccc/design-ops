import { NextResponse } from 'next/server';

interface DGPAEntry {
  date: string;            // "20260101"
  week: string;            // "一"~"日"
  isHoliday: boolean;
  holidayCategory: string; // "國定假日" | "星期六" | "星期日" | "補假" | "彈性放假" | ""
  description: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get('year') ?? String(new Date().getFullYear());

  const res = await fetch(
    `https://raw.githubusercontent.com/ruyut/TaiwanCalendar/main/data/${year}.json`,
    { next: { revalidate: 86400 } },
  );
  if (!res.ok) return NextResponse.json([], { status: 502 });

  const data: DGPAEntry[] = await res.json();

  const holidays = data
    .filter(d => d.isHoliday && d.holidayCategory !== '星期六' && d.holidayCategory !== '星期日')
    .map(d => ({
      date: `${d.date.slice(4, 6)}/${d.date.slice(6, 8)}`,
      name: d.description || d.holidayCategory,
    }));

  return NextResponse.json(holidays);
}
