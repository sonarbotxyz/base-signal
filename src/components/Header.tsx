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
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const { ready, authenticated, logout, getAccessToken } = usePrivy();
  const { initOAuth } = useLoginWithOAuth();
  const { theme, toggleTheme, colors } = useTheme();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) setMobileMenuOpen(false);
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
    { href: '/', label: 'Products' },
    { href: '/upcoming', label: 'Upcoming' },
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/docs', label: 'Docs' },
  ];

  return (
    <header className="glass-header">
      <div className="header-inner" style={{ maxWidth: 1080, margin: '0 auto', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', gap: 16 }}>

        {/* Logo */}
        <Link href="/" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#0052FF',
          }} />
          <span style={{
            fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em',
            color: colors.text,
          }}>
            sonarbot
          </span>
        </Link>

        <div style={{ flex: 1 }} />

        {/* Desktop nav */}
        <nav style={{ alignItems: 'center', gap: 4 }} className="header-desktop-nav">
          {navLinks.map(link => {
            const isActive = pathname === link.href || (pathname !== '/' && link.href !== '/' && pathname?.startsWith(link.href));
            return (
              <Link key={link.label} href={link.href}
                style={{
                  display: 'flex', alignItems: 'center',
                  height: 32, padding: '0 12px',
                  borderRadius: 6,
                  fontSize: 14, fontWeight: 500,
                  textDecoration: 'none',
                  transition: 'all 150ms ease-out',
                  background: isActive ? colors.accentGlow : 'transparent',
                  color: isActive ? '#0052FF' : colors.textMuted,
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Theme toggle */}
          <button onClick={toggleTheme}
            style={{
              width: 32, height: 32, borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1px solid ${colors.border}`, background: 'transparent',
              color: colors.textDim, cursor: 'pointer',
              transition: 'all 150ms ease-out',
            }}
          >
            {theme === 'dark' ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>

          {/* Launch button - desktop */}
          <Link href="/docs" className="header-desktop-launch" style={{
            alignItems: 'center', justifyContent: 'center',
            height: 32, padding: '0 16px', borderRadius: 6,
            background: '#0052FF', color: '#fff',
            fontSize: 13, fontWeight: 600,
            textDecoration: 'none',
            transition: 'all 150ms ease-out',
          }}>
            Launch
          </Link>

          {/* Auth */}
          {ready && (
            authenticated && userInfo ? (
              <div ref={menuRef} style={{ position: 'relative' }}>
                <button onClick={() => setMenuOpen(!menuOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    height: 32, padding: '0 10px', borderRadius: 6,
                    border: `1px solid ${colors.border}`, background: 'transparent',
                    cursor: 'pointer', fontSize: 13, fontWeight: 500,
                    color: colors.textMuted,
                  }}
                >
                  {userInfo.avatar ? (
                    <img src={userInfo.avatar} alt="" style={{ width: 20, height: 20, borderRadius: '50%' }} />
                  ) : (
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700, background: colors.border, color: colors.text,
                    }}>
                      {userInfo.twitter_handle[0]?.toUpperCase()}
                    </div>
                  )}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                </button>
                {menuOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: 40,
                    borderRadius: 8, padding: 4, minWidth: 160,
                    background: colors.bgCard, border: `1px solid ${colors.border}`,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                    zIndex: 50,
                  }}>
                    <div style={{
                      padding: '8px 12px', fontSize: 13, fontWeight: 600,
                      borderBottom: `1px solid ${colors.border}`,
                      color: colors.text,
                    }}>
                      @{userInfo.twitter_handle}
                    </div>
                    <button onClick={() => { logout(); setMenuOpen(false); }}
                      style={{
                        width: '100%', marginTop: 4, padding: '8px 12px',
                        fontSize: 13, fontWeight: 500, borderRadius: 6,
                        border: 'none', background: 'transparent',
                        textAlign: 'left', cursor: 'pointer',
                        color: '#ef4444',
                      }}
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => initOAuth({ provider: 'twitter' })}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  height: 32, padding: '0 14px', borderRadius: 6,
                  fontSize: 13, fontWeight: 600,
                  background: colors.text, color: colors.bg,
                  border: 'none', cursor: 'pointer',
                  transition: 'all 150ms ease-out',
                }}
              >
                Sign in
              </button>
            )
          )}

          {/* Mobile menu */}
          <div ref={mobileMenuRef} className="header-mobile-menu" style={{ position: 'relative', marginLeft: 4 }}>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 6, border: `1px solid ${colors.border}`,
                background: 'transparent', color: colors.textMuted, cursor: 'pointer',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            {mobileMenuOpen && (
              <div style={{
                position: 'absolute', right: 0, top: 40,
                borderRadius: 8, padding: 4, minWidth: 180,
                background: colors.bgCard, border: `1px solid ${colors.border}`,
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                zIndex: 50,
                display: 'flex', flexDirection: 'column', gap: 2,
              }}>
                {navLinks.map(link => (
                  <Link key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'block', padding: '12px 14px', borderRadius: 6,
                      fontSize: 15, fontWeight: 500, minHeight: 44,
                      textDecoration: 'none', color: colors.text,
                      lineHeight: '20px',
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
                <div style={{ borderTop: `1px solid ${colors.border}`, marginTop: 4, paddingTop: 4 }}>
                  <Link href="/docs" onClick={() => setMobileMenuOpen(false)}
                    style={{
                      display: 'block', padding: '12px 14px', borderRadius: 6,
                      textAlign: 'center', fontSize: 14, fontWeight: 600, minHeight: 44,
                      background: '#0052FF', color: '#fff', textDecoration: 'none',
                      lineHeight: '20px',
                    }}
                  >
                    Launch
                  </Link>
                </div>
              </div>
            )}
          </div>

          <style>{`
            .header-inner {
              padding: 0 16px;
              gap: 10px;
            }
            .header-desktop-nav { display: none; }
            .header-desktop-launch { display: none; }
            .header-mobile-menu { display: block; }
            @media (min-width: 640px) {
              .header-inner {
                padding: 0 20px;
                gap: 16px;
              }
            }
            @media (min-width: 768px) {
              .header-desktop-nav { display: flex !important; }
              .header-desktop-launch { display: flex !important; }
              .header-mobile-menu { display: none !important; }
            }
          `}</style>
        </div>
      </div>
    </header>
  );
}
