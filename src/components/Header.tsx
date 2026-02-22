'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePrivy, useLoginWithOAuth } from '@privy-io/react-auth';
import { useTheme } from './ThemeProvider';

interface UserInfo {
  twitter_handle: string;
  name: string;
  avatar: string | null;
}

interface HeaderProps {
  activePage?: string;
}

export default function Header({ activePage }: HeaderProps) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);

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

  const navLinks = [
    { href: '/', label: 'Products', key: 'home' },
    { href: '/leaderboard', label: 'Leaderboard', key: 'leaderboard' },
    { href: '/docs', label: 'Docs', key: 'docs' },
  ];

  const isDark = theme === 'dark';
  const borderColor = isDark ? '#232d3f' : '#e5e7eb';
  const bg = isDark ? 'rgba(15, 17, 23, 0.92)' : 'rgba(255,255,255,0.92)';
  const textMuted = isDark ? '#8892a4' : '#6b7280';
  const textMain = isDark ? '#f1f5f9' : '#111827';
  const cardBg = isDark ? '#1a2235' : '#ffffff';

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: bg,
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${borderColor}`,
    }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', height: 56, gap: 8 }}>

        {/* Logo */}
        <Link href="/" style={{ flexShrink: 0, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%', background: '#0044ff',
            boxShadow: '0 0 8px rgba(0, 68, 255, 0.6)',
            animation: 'sonarPulse 2.5s ease-out infinite',
          }} />
          <span style={{
            fontWeight: 800, fontSize: 16, color: '#0044ff', lineHeight: 1,
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '-0.3px',
          }}>sonarbot</span>
        </Link>

        <div style={{ flex: 1 }} />

        {/* Desktop nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 2 }} className="desktop-nav">
          {navLinks.map(link => (
            <Link key={link.key} href={link.href} style={{
              padding: '5px 12px', borderRadius: 6, fontSize: 14, fontWeight: 500,
              color: activePage === link.key ? '#0044ff' : textMuted,
              textDecoration: 'none',
              background: activePage === link.key ? 'rgba(0,68,255,0.06)' : 'transparent',
              transition: 'all 0.15s ease',
            }}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Theme toggle */}
        <button onClick={toggleTheme} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 32, height: 32, borderRadius: 6,
          border: `1px solid ${borderColor}`, background: 'transparent',
          cursor: 'pointer', fontSize: 15, color: textMuted,
        }}>
          {isDark ? '☀️' : '🌙'}
        </button>

        {/* Mobile menu */}
        <div ref={mobileRef} style={{ position: 'relative' }} className="mobile-nav">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, borderRadius: 6,
            border: `1px solid ${borderColor}`, background: 'transparent', cursor: 'pointer',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={textMuted} strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          {mobileMenuOpen && (
            <div style={{
              position: 'absolute', right: 0, top: 38,
              background: cardBg, border: `1px solid ${borderColor}`,
              borderRadius: 12, padding: 6, minWidth: 160,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 100,
            }}>
              {navLinks.map(link => (
                <Link key={link.key} href={link.href} onClick={() => setMobileMenuOpen(false)} style={{
                  display: 'block', padding: '10px 14px', fontSize: 14, fontWeight: 500,
                  color: activePage === link.key ? '#0044ff' : textMain,
                  textDecoration: 'none', borderRadius: 8,
                  background: activePage === link.key ? 'rgba(0,68,255,0.06)' : 'transparent',
                }}>
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Auth */}
        {ready && (
          authenticated && userInfo ? (
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button onClick={() => setMenuOpen(!menuOpen)} style={{
                display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 10px',
                borderRadius: 6, border: `1px solid ${borderColor}`, background: 'transparent',
                cursor: 'pointer', fontSize: 13, fontWeight: 600, color: textMain,
              }}>
                {userInfo.avatar
                  ? <img src={userInfo.avatar} alt="" style={{ width: 20, height: 20, borderRadius: '50%' }} />
                  : <div style={{ width: 20, height: 20, borderRadius: '50%', background: borderColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: textMuted }}>{userInfo.twitter_handle[0]?.toUpperCase()}</div>
                }
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={textMuted} strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>
              </button>
              {menuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 38,
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
              display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 14px',
              borderRadius: 6, background: '#0044ff', border: 'none',
              fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,68,255,0.3)',
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#fff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              Sign in
            </button>
          )
        )}
      </div>

      <style jsx>{`
        .desktop-nav { display: flex; }
        .mobile-nav { display: none; }
        @media (max-width: 640px) {
          .desktop-nav { display: none; }
          .mobile-nav { display: block; }
        }
      `}</style>
    </header>
  );
}
