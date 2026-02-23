'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePrivy, useLoginWithOAuth } from '@privy-io/react-auth';
import { useTheme } from './ThemeProvider';

interface UserInfo {
  twitter_handle: string;
  name: string;
  avatar: string | null;
}

const TABS = [
  { href: '/', label: 'Products' },
  { href: '/upcoming', label: 'Upcoming' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/docs', label: 'Docs' },
];

export default function Header() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const pathname = usePathname();

  const { ready, authenticated, logout, getAccessToken } = usePrivy();
  const { initOAuth } = useLoginWithOAuth();
  const { theme, toggleTheme } = useTheme();

  // Close menus on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) setMobileMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch user info
  const fetchUserInfo = useCallback(async () => {
    if (!authenticated) { setUserInfo(null); return; }
    try {
      const token = await getAccessToken();
      if (!token) return;
      const res = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setUserInfo(await res.json());
    } catch (e) { console.error(e); }
  }, [authenticated, getAccessToken]);

  useEffect(() => {
    if (ready && authenticated) fetchUserInfo();
  }, [ready, authenticated, fetchUserInfo]);

  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);
  const activeIndex = TABS.findIndex(t => isActive(t.href));

  // Sliding indicator
  useEffect(() => {
    const updateIndicator = () => {
      const idx = activeIndex;
      if (idx < 0) return;
      const tab = tabRefs.current[idx];
      const nav = navRef.current;
      if (!tab || !nav) return;
      const navRect = nav.getBoundingClientRect();
      const tabRect = tab.getBoundingClientRect();
      setIndicatorStyle({
        left: tabRect.left - navRect.left,
        width: tabRect.width,
      });
    };
    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeIndex, pathname]);

  return (
    <div className="header-floating">
      <div className="header-glass">
        {/* Logo */}
        <Link href="/" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            background: 'var(--accent)',
            animation: 'pulse-glow 2.5s ease-out infinite',
          }} />
          <span style={{
            fontWeight: 800, fontSize: 16, lineHeight: 1,
            fontFamily: 'var(--font-mono)', letterSpacing: '-0.3px',
            background: 'var(--accent-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>sonarbot</span>
        </Link>

        {/* Nav Tabs */}
        <nav ref={navRef} className="nav-tabs desktop-only" style={{ marginLeft: 8 }}>
          <div
            className="nav-indicator"
            style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
          />
          {TABS.map((tab, i) => (
            <Link
              key={tab.href}
              href={tab.href}
              ref={el => { tabRefs.current[i] = el; }}
              className={`nav-tab${isActive(tab.href) ? ' active' : ''}`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        {/* Right section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
          {/* Search */}
          <button className="search-input desktop-only" style={{ border: 'none' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span>Search</span>
            <kbd className="search-kbd">&#8984;K</kbd>
          </button>

          {/* Theme toggle */}
          <button onClick={toggleTheme} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, borderRadius: 10,
            border: '1px solid var(--border)', background: 'transparent',
            cursor: 'pointer', fontSize: 15, flexShrink: 0,
            transition: 'all 0.2s ease',
          }}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* Launch button */}
          <Link href="/submit" className="btn-gradient desktop-only" style={{ padding: '8px 16px', fontSize: 13, borderRadius: 10, gap: 6, textDecoration: 'none' }}>
            Launch
          </Link>

          {/* Mobile burger */}
          <div ref={mobileRef} style={{ position: 'relative' }} className="mobile-only">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 36, height: 36, borderRadius: 10,
              border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            {mobileMenuOpen && (
              <div className="glass-card" style={{
                position: 'absolute', right: 0, top: 46,
                padding: 6, minWidth: 200, zIndex: 100,
              }}>
                {TABS.map(tab => (
                  <Link key={tab.href} href={tab.href} onClick={() => setMobileMenuOpen(false)} style={{
                    display: 'block', padding: '10px 14px', fontSize: 14, fontWeight: 500,
                    color: isActive(tab.href) ? 'var(--accent)' : 'var(--text)',
                    borderRadius: 8,
                    background: isActive(tab.href) ? 'var(--accent-glow)' : 'transparent',
                  }}>
                    {tab.label}
                  </Link>
                ))}
                <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0' }} />
                <Link href="/submit" onClick={() => setMobileMenuOpen(false)} style={{
                  display: 'block', padding: '10px 14px', fontSize: 14, fontWeight: 600,
                  color: 'var(--accent)', borderRadius: 8,
                }}>
                  Launch
                </Link>
              </div>
            )}
          </div>

          {/* Auth */}
          {ready && (
            authenticated && userInfo ? (
              <div ref={menuRef} style={{ position: 'relative', flexShrink: 0 }}>
                <button onClick={() => setMenuOpen(!menuOpen)} style={{
                  display: 'flex', alignItems: 'center', gap: 6, height: 36, padding: '0 10px',
                  borderRadius: 10, border: '1px solid var(--border)', background: 'transparent',
                  cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text)',
                  transition: 'all 0.2s ease',
                }}>
                  {userInfo.avatar
                    ? <img src={userInfo.avatar} alt="" style={{ width: 22, height: 22, borderRadius: '50%' }} />
                    : <div style={{
                        width: 22, height: 22, borderRadius: '50%',
                        background: 'var(--bg-secondary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
                      }}>{userInfo.twitter_handle[0]?.toUpperCase()}</div>
                  }
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>
                </button>
                {menuOpen && (
                  <div className="glass-card" style={{
                    position: 'absolute', right: 0, top: 44,
                    padding: 4, minWidth: 160, zIndex: 100,
                  }}>
                    <div style={{ padding: '8px 12px', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-mono)' }}>
                      @{userInfo.twitter_handle}
                    </div>
                    <button onClick={() => { logout(); setMenuOpen(false); }} style={{
                      width: '100%', padding: '8px 12px', fontSize: 13, fontWeight: 500,
                      color: '#ef4444', background: 'none', border: 'none',
                      cursor: 'pointer', textAlign: 'left', borderRadius: 6,
                    }}>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => initOAuth({ provider: 'twitter' })} style={{
                display: 'flex', alignItems: 'center', gap: 6, height: 36, padding: '0 14px',
                borderRadius: 10, border: '1px solid var(--border)', background: 'transparent',
                fontSize: 13, fontWeight: 600, color: 'var(--text)', cursor: 'pointer', flexShrink: 0,
                transition: 'all 0.2s ease',
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                Sign in
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
