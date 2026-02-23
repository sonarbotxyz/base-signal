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
  const { theme, toggleTheme } = useTheme();

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
      <div className="max-w-5xl mx-auto px-5 h-16 flex items-center gap-4">
        
        <Link href="/" className="flex-shrink-0 flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--primary)', boxShadow: '0 0 12px var(--primary)' }} />
          <span className="font-bold text-lg tracking-tight" style={{ color: 'var(--foreground)' }}>sonarbot</span>
        </Link>
        
        <div className="flex-1" />

        <nav className="hidden md:flex items-center gap-1.5">
          {navLinks.map(link => {
            const isActive = pathname === link.href || (pathname !== '/' && link.href !== '/' && pathname?.startsWith(link.href));
            return (
              <Link key={link.label} href={link.href}
                className={`h-9 px-4 flex items-center rounded-full text-sm font-medium transition-all duration-150 ease-out`}
                style={{
                  background: isActive ? 'var(--foreground)' : 'transparent',
                  color: isActive ? 'var(--background)' : 'var(--muted-foreground)',
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <button onClick={toggleTheme}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors duration-150"
            style={{ border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}
          >
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>

          <Link href="/docs" className="hidden md:flex items-center justify-center h-9 px-4 rounded-lg bg-gradient-primary text-sm font-medium shadow-sm" style={{ color: 'var(--primary-foreground)' }}>
            Launch
          </Link>

          {ready && (
            authenticated && userInfo ? (
              <div ref={menuRef} className="relative">
                <button onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 h-9 px-2 rounded-lg transition-colors duration-150 cursor-pointer text-sm font-medium"
                  style={{ border: '1px solid var(--border)' }}
                >
                  {userInfo.avatar ? (
                    <img src={userInfo.avatar} alt="" className="w-5 h-5 rounded-full" />
                  ) : (
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: 'var(--border)' }}>
                      {userInfo.twitter_handle[0]?.toUpperCase()}
                    </div>
                  )}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-11 rounded-xl p-1 min-w-[160px] shadow-sm z-50 backdrop-blur-xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                    <div className="px-3 py-2 text-sm font-semibold" style={{ borderBottom: '1px solid var(--border)', color: 'var(--foreground)' }}>@{userInfo.twitter_handle}</div>
                    <button onClick={() => { logout(); setMenuOpen(false); }}
                      className="w-full mt-1 px-3 py-2 text-sm font-medium rounded-lg text-left transition-colors duration-150"
                      style={{ color: '#ef4444' }}
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => initOAuth({ provider: 'twitter' })}
                className="flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-sm font-medium transition-transform duration-150 hover:scale-105"
                style={{ background: 'var(--foreground)', color: 'var(--background)' }}
              >
                Sign in
              </button>
            )
          )}

          <div ref={mobileMenuRef} className="md:hidden relative ml-1">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors duration-150"
              style={{ border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            {mobileMenuOpen && (
              <div className="absolute right-0 top-11 rounded-xl p-2 min-w-[180px] shadow-sm z-50 flex flex-col gap-1 backdrop-blur-xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                {navLinks.map(link => (
                  <Link key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link href="/docs" onClick={() => setMobileMenuOpen(false)}
                  className="mt-2 block px-3 py-2.5 text-center text-sm font-medium rounded-lg bg-gradient-primary shadow-sm"
                  style={{ color: 'var(--primary-foreground)' }}
                >
                  Launch Product
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
