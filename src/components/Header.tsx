'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePrivy, useLoginWithOAuth } from '@privy-io/react-auth';
import { useTheme } from './ThemeProvider';

interface UserInfo {
  twitter_handle: string;
  name: string;
  avatar: string | null;
}

export default function Header() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const { ready, authenticated, logout, getAccessToken } = usePrivy();
  const { initOAuth } = useLoginWithOAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) setMobileMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchUserInfo = async () => {
    if (!authenticated) { setUserInfo(null); return; }
    try {
      const token = await getAccessToken();
      if (!token) return;
      const res = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setUserInfo(await res.json());
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (ready && authenticated) fetchUserInfo();
  }, [ready, authenticated]);

  const isDark = theme === 'dark';
  const borderColor = isDark ? '#2D3748' : '#E2E8F0';
  const bg = isDark ? 'rgba(11, 15, 25, 0.92)' : 'rgba(248, 250, 252, 0.92)';
  const textMuted = isDark ? '#94A3B8' : '#475569';
  const textMain = isDark ? '#F8FAFC' : '#0F172A';
  const cardBg = isDark ? '#151B2B' : '#FFFFFF';
  const hoverBg = isDark ? '#1E2638' : '#F1F5F9';

  const tabs = [
    { href: '/', label: 'Products' },
    { href: '/upcoming', label: 'Upcoming' },
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/docs', label: 'Docs' },
  ];

  const isActiveTab = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 50 }}>
      {/* Main header bar */}
      <header style={{
        background: bg,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${borderColor}`,
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', height: 56, gap: 12 }}>

          {/* Logo */}
          <Link href="/" style={{ flexShrink: 0, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%', background: '#0044FF',
              boxShadow: '0 0 8px rgba(0, 68, 255, 0.6)',
              animation: 'sonarPulse 2.5s ease-out infinite',
            }} />
            <span style={{
              fontWeight: 800, fontSize: 16, color: '#0044FF', lineHeight: 1,
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: '-0.3px',
            }}>sonarbot</span>
          </Link>

          {/* Search input */}
          <div style={{ flex: 1, maxWidth: 320, margin: '0 auto' }} className="desktop-nav">
            <div style={{ position: 'relative' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={textMuted} strokeWidth="2" strokeLinecap="round" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search products..."
                style={{
                  width: '100%', height: 34, paddingLeft: 32, paddingRight: 12,
                  borderRadius: 8, border: `1px solid ${borderColor}`,
                  background: isDark ? '#1E2638' : '#FFFFFF',
                  color: textMain, fontSize: 13,
                  outline: 'none', fontFamily: 'inherit',
                }}
              />
            </div>
          </div>

          {/* Launch button */}
          <Link href="/submit" className="desktop-nav" style={{
            display: 'flex', alignItems: 'center', gap: 6, height: 34, padding: '0 14px',
            borderRadius: 8, background: '#0044FF', border: 'none',
            fontSize: 13, fontWeight: 600, color: '#fff', textDecoration: 'none',
            whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            Launch on sonarbot
          </Link>

          {/* Theme toggle */}
          <button onClick={toggleTheme} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 34, height: 34, borderRadius: 8,
            border: `1px solid ${borderColor}`, background: 'transparent',
            cursor: 'pointer', fontSize: 15, color: textMuted, flexShrink: 0,
          }}>
            {isDark ? '☀️' : '🌙'}
          </button>

          {/* Mobile menu */}
          <div ref={mobileRef} style={{ position: 'relative' }} className="mobile-nav">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 34, height: 34, borderRadius: 8,
              border: `1px solid ${borderColor}`, background: 'transparent', cursor: 'pointer',
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={textMuted} strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            {mobileMenuOpen && (
              <div style={{
                position: 'absolute', right: 0, top: 40,
                background: cardBg, border: `1px solid ${borderColor}`,
                borderRadius: 12, padding: 6, minWidth: 180,
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 100,
              }}>
                {tabs.map(tab => (
                  <Link key={tab.href} href={tab.href} onClick={() => setMobileMenuOpen(false)} style={{
                    display: 'block', padding: '10px 14px', fontSize: 14, fontWeight: 500,
                    color: isActiveTab(tab.href) ? '#0044FF' : textMain,
                    textDecoration: 'none', borderRadius: 8,
                    background: isActiveTab(tab.href) ? 'rgba(0,68,255,0.06)' : 'transparent',
                  }}>
                    {tab.label}
                  </Link>
                ))}
                <Link href="/submit" onClick={() => setMobileMenuOpen(false)} style={{
                  display: 'block', padding: '10px 14px', fontSize: 14, fontWeight: 600,
                  color: '#0044FF', textDecoration: 'none', borderRadius: 8,
                }}>
                  Launch on sonarbot
                </Link>
              </div>
            )}
          </div>

          {/* Auth */}
          {ready && (
            authenticated && userInfo ? (
              <div ref={menuRef} style={{ position: 'relative', flexShrink: 0 }}>
                <button onClick={() => setMenuOpen(!menuOpen)} style={{
                  display: 'flex', alignItems: 'center', gap: 6, height: 34, padding: '0 10px',
                  borderRadius: 8, border: `1px solid ${borderColor}`, background: 'transparent',
                  cursor: 'pointer', fontSize: 13, fontWeight: 600, color: textMain,
                }}>
                  {userInfo.avatar
                    ? <img src={userInfo.avatar} alt="" style={{ width: 22, height: 22, borderRadius: '50%' }} />
                    : <div style={{ width: 22, height: 22, borderRadius: '50%', background: borderColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: textMuted }}>{userInfo.twitter_handle[0]?.toUpperCase()}</div>
                  }
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={textMuted} strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>
                </button>
                {menuOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: 40,
                    background: cardBg, border: `1px solid ${borderColor}`,
                    borderRadius: 10, padding: 4, minWidth: 160,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 100,
                  }}>
                    <div style={{ padding: '8px 12px', fontSize: 12, fontWeight: 700, color: textMuted, borderBottom: `1px solid ${borderColor}`, fontFamily: "'JetBrains Mono', monospace" }}>@{userInfo.twitter_handle}</div>
                    <button onClick={() => { logout(); setMenuOpen(false); }} style={{ width: '100%', padding: '8px 12px', fontSize: 13, fontWeight: 500, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', borderRadius: 6 }}>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => initOAuth({ provider: 'twitter' })} style={{
                display: 'flex', alignItems: 'center', gap: 6, height: 34, padding: '0 14px',
                borderRadius: 8, border: `1px solid ${borderColor}`, background: 'transparent',
                fontSize: 13, fontWeight: 600, color: textMain, cursor: 'pointer',
                flexShrink: 0,
              }}>
                Sign in
              </button>
            )
          )}
        </div>
      </header>

      {/* Secondary tab bar */}
      <nav style={{
        background: bg,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${borderColor}`,
      }} className="desktop-nav">
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 0, height: 40 }}>
          {tabs.map(tab => {
            const active = isActiveTab(tab.href);
            return (
              <Link key={tab.href} href={tab.href} style={{
                padding: '0 14px', height: '100%', display: 'flex', alignItems: 'center',
                fontSize: 13, fontWeight: active ? 600 : 500,
                color: active ? '#0044FF' : textMuted,
                textDecoration: 'none',
                borderBottom: active ? '2px solid #0044FF' : '2px solid transparent',
                transition: 'all 0.15s ease',
              }}>
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <style jsx>{`
        .desktop-nav { display: flex; }
        .mobile-nav { display: none; }
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .mobile-nav { display: block; }
        }
      `}</style>
    </div>
  );
}
