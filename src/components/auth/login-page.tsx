'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';

function isInAppBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /Line\/|FBAN|FBAV|Instagram|MicroMessenger|Twitter|Snapchat/.test(ua);
}

export default function LoginPage() {
  const { signInWithGoogle, error, loading } = useAuth();
  const [inApp, setInApp] = useState(false);

  useEffect(() => { setInApp(isInAppBrowser()); }, []);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--surface-2)',
    }}>
      <div style={{
        background: 'var(--surface)', borderRadius: 16,
        boxShadow: '0 8px 40px rgba(0,0,0,.12)',
        padding: '48px 40px', width: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, background: 'var(--accent)',
            display: 'grid', placeItems: 'center',
            fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em',
          }}>C</div>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>CMoneyDesign</div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>設計部工作看板</div>
        </div>

        <div style={{ width: '100%', height: 1, background: 'var(--divider)' }} />

        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>請使用公司帳號登入</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
            僅限 @cmoney.com.tw 帳號存取
          </div>
        </div>

        {inApp && (
          <div style={{
            width: '100%', padding: '12px 14px', borderRadius: 8,
            background: 'color-mix(in oklab, #f59e0b 12%, transparent)',
            border: '1px solid color-mix(in oklab, #f59e0b 40%, transparent)',
            fontSize: 13, color: '#92400e', lineHeight: 1.6,
          }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>⚠️ 無法在 LINE 內登入</div>
            Google 不允許在 App 內建瀏覽器中登入。<br />
            請點右上角 <strong>「⋯」→「在瀏覽器中開啟」</strong>，再用 Safari 或 Chrome 登入。
          </div>
        )}

        {error && (
          <div style={{
            width: '100%', padding: '10px 14px', borderRadius: 8,
            background: 'color-mix(in oklab, var(--st-block) 10%, transparent)',
            border: '1px solid color-mix(in oklab, var(--st-block) 30%, transparent)',
            fontSize: 12.5, color: 'var(--st-block)', textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        <button
          onClick={signInWithGoogle}
          disabled={loading}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '11px 20px', borderRadius: 10, border: '1px solid var(--border)',
            background: 'var(--surface)', cursor: 'pointer', fontSize: 14, fontWeight: 500,
            fontFamily: 'inherit', color: 'var(--ink)', transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface)')}
        >
          {/* Google icon */}
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          使用 Google 帳號登入
        </button>
      </div>
    </div>
  );
}
