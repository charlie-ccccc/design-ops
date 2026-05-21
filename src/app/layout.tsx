import type { Metadata } from 'next';
import { Noto_Sans_TC } from 'next/font/google';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';

const notoSansTC = Noto_Sans_TC({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-noto',
  display: 'swap',
});

const jetBrainsMono = JetBrains_Mono({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DesignOps · 設計部產能管理',
  description: '設計團隊任務看板、產能分析、歷史封存系統',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant" className={`${notoSansTC.variable} ${jetBrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
