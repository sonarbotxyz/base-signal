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
    { href: '/', label: 'Products' },
    { href: '/upcoming', label: 'Upcoming' },
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/docs', label: 'Docs' },
  ];

  return (
    <header className="glass-header">
      <div className="max-w-5xl mx-auto px-5 h-16 flex items-center gap-4">
        
        {/* Logo */}
        <Link href="/" className="flex-shrink-0 flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] shadow-[0_0_12px_rgba(59,130,246,0.6)] animate-[pulse-glow_2s_infinite]" />
          <span className="font-bold text-lg tracking-tight">sonarbot</span>
        </Link>
        
        <div className="flex-1" />

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5">
          {navLinks.map(link => {
            const isActive = pathname === link.href || (pathname !== '/' && link.href !== '/' && pathname?.startsWith(link.href));
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`h-9 px-3.5 flex items-center rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--border-primary)]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-lg border border-[var(--border-primary)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--border-primary)] transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>

          {/* Launch Button */}
          <Link href="/docs" className="hidden md:flex items-center justify-center h-9 px-4 rounded-lg bg-gradient-primary text-white text-sm font-medium shadow-[0_2px_10px_rgba(59,130,246,0.3)] hover:opacity-90 transition-opacity">
            Launch
          </Link>

          {/* Auth button */}
          {ready && (
            authenticated && userInfo ? (
              <div ref={menuRef} className="relative">
                <button onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 h-9 px-2 rounded-lg border border-[var(--border-primary)] hover:bg-[var(--border-primary)] transition-colors cursor-pointer text-sm font-medium"
                >
                  {userInfo.avatar ? (
                    <img src={userInfo.avatar} alt="" className="w-5 h-5 rounded-full" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-[var(--border-primary)] flex items-center justify-center text-[10px] font-bold">
                      {userInfo.twitter_handle[0]?.toUpperCase()}
                    </div>
                  )}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-11 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-1 min-w-[160px] shadow-[var(--card-shadow)] z-50 backdrop-blur-xl">
                    <div className="px-3 py-2 text-sm font-semibold border-b border-[var(--border-primary)]">@{userInfo.twitter_handle}</div>
                    <button onClick={() => { logout(); setMenuOpen(false); }}
                      className="w-full mt-1 px-3 py-2 text-sm font-medium text-red-500 hover:bg-[var(--border-primary)] rounded-lg text-left transition-colors">
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => initOAuth({ provider: 'twitter' })}
                className="flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-[var(--text-primary)] text-[var(--bg-primary)] text-sm font-medium transition-transform hover:scale-105"
              >
                Sign in
              </button>
            )
          )}

          {/* Mobile Menu Toggle */}
          <div ref={mobileMenuRef} className="md:hidden relative ml-1">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-[var(--border-primary)] text-[var(--text-muted)]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            {mobileMenuOpen && (
              <div className="absolute right-0 top-11 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-2 min-w-[180px] shadow-[var(--card-shadow)] z-50 flex flex-col gap-1 backdrop-blur-xl">
                {navLinks.map(link => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-[var(--border-primary)] transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link href="/docs" onClick={() => setMobileMenuOpen(false)} className="mt-2 block px-3 py-2.5 text-center text-sm font-medium rounded-lg bg-gradient-primary text-white shadow-sm">
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
