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
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const { ready, authenticated, logout, getAccessToken } = usePrivy();
  const { initOAuth } = useLoginWithOAuth();
  const { theme, colors, toggleTheme } = useTheme();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchUserInfo = async () => {
    if (!authenticated) {
      setUserInfo(null);
      return;
    }
    try {
      const token = await getAccessToken();
      if (!token) return;
      const res = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setUserInfo(await res.json());
    } catch (e) { 
      console.error(e); 
    }
  };

  useEffect(() => {
    if (ready && authenticated) fetchUserInfo();
  }, [ready, authenticated]);

  const navLinks = [
    { href: '/leaderboard', label: 'Leaderboard', key: 'leaderboard' },
    { href: '/curation', label: 'Curation', key: 'curation' },
    { href: '/docs', label: 'Docs', key: 'docs' },
  ];

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: colors.headerBg,
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: `1px solid ${colors.border}60`,
    }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', height: 56, gap: 10 }}>
        
        {/* Logo */}
        <Link href="/" style={{ flexShrink: 0, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%', background: colors.accent,
            boxShadow: `0 0 8px ${colors.accent}99`,
            animation: 'sonarPulse 2s ease-out infinite',
          }} />
          <span style={{
            fontWeight: 800, fontSize: 18, color: colors.accent, lineHeight: 1, whiteSpace: 'nowrap',
            fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
            letterSpacing: '-0.5px',
          }}>sonarbot</span>
        </Link>
        
        <div style={{ flex: 1 }} />

        {/* Desktop Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Desktop nav links - hidden on mobile */}
          <div className="desktop-nav">
            {navLinks.map(link => (
              <Link
                key={link.key}
                href={link.href}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  height: 34, 
                  padding: '0 14px', 
                  borderRadius: 8, 
                  border: activePage === link.key ? `1px solid ${colors.accent}` : '1px solid transparent',
                  background: activePage === link.key ? colors.accentGlow : 'transparent',
                  fontSize: 13, 
                  fontWeight: 600, 
                  color: activePage === link.key ? colors.accent : colors.textMuted,
                  textDecoration: 'none', 
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                  fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
                  letterSpacing: '0.3px',
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile burger menu button - visible on mobile only */}
          <div ref={mobileMenuRef} style={{ position: 'relative' }} className="mobile-nav">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 34,
                height: 34,
                border: `1px solid ${colors.border}`,
                borderRadius: 8,
                background: colors.bgCard,
                cursor: 'pointer'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>

            {/* Mobile dropdown menu */}
            {mobileMenuOpen && (
              <div style={{ 
                position: 'absolute', 
                right: 0, 
                top: 40, 
                background: colors.bgCard, 
                border: `1px solid ${colors.border}`, 
                borderRadius: 12, 
                padding: 8, 
                minWidth: 180, 
                boxShadow: theme === 'dark' ? '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 16px rgba(0, 68, 255, 0.1)' : '0 8px 32px rgba(0, 0, 0, 0.12), 0 0 16px rgba(0, 0, 255, 0.05)', 
                zIndex: 100 
              }}>
                {navLinks.map(link => (
                  <Link
                    key={link.key}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'block',
                      padding: '12px 16px',
                      fontSize: 14,
                      fontWeight: 600,
                      color: activePage === link.key ? colors.accent : colors.text,
                      textDecoration: 'none',
                      borderRadius: 8,
                      background: activePage === link.key ? colors.accentGlow : 'transparent',
                      fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* Auth button - always visible */}
          {ready && (
            authenticated && userInfo ? (
              <div ref={menuRef} style={{ position: 'relative' }}>
                <button onClick={() => setMenuOpen(!menuOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, height: 34, padding: '0 10px',
                    borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.bgCard,
                    cursor: 'pointer', fontSize: 13, fontWeight: 600, color: colors.text,
                    fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
                  }}>
                  {userInfo.avatar ? (
                    <img src={userInfo.avatar} alt="" style={{ width: 22, height: 22, borderRadius: '50%' }} />
                  ) : (
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: colors.border, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: colors.textMuted }}>
                      {userInfo.twitter_handle[0]?.toUpperCase()}
                    </div>
                  )}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </button>
                {menuOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: 40, background: colors.bgCard,
                    border: `1px solid ${colors.border}`, borderRadius: 12, padding: 4, minWidth: 160,
                    boxShadow: theme === 'dark' ? '0 8px 32px rgba(0, 0, 0, 0.5)' : '0 8px 32px rgba(0, 0, 0, 0.12)', zIndex: 100,
                  }}>
                    <div style={{ padding: '8px 12px', fontSize: 13, fontWeight: 600, color: colors.text, borderBottom: `1px solid ${colors.border}`, fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)" }}>@{userInfo.twitter_handle}</div>
                    <button onClick={() => { logout(); setMenuOpen(false); }}
                      style={{ width: '100%', padding: '8px 12px', fontSize: 13, fontWeight: 500, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', borderRadius: 8 }}>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => initOAuth({ provider: 'twitter' })}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, height: 34, padding: '0 14px',
                  borderRadius: 8, background: colors.accent, border: 'none',
                  fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', whiteSpace: 'nowrap',
                  boxShadow: `0 0 16px ${colors.accent}4D`,
                  transition: 'all 0.2s ease',
                  fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
                }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                Sign in
              </button>
            )
          )}
        </div>
      </div>

      {/* CSS for mobile responsive behavior */}
      <style jsx>{`
        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .mobile-nav {
          display: none;
        }
        @media (max-width: 768px) {
          .desktop-nav {
            display: none;
          }
          .mobile-nav {
            display: block;
          }
        }
      `}</style>
    </header>
  );
}
