'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePrivy, useLoginWithOAuth } from '@privy-io/react-auth';

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

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) setMobileMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (ready && authenticated) {
      getAccessToken().then(token => {
        if (!token) return;
        fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
          .then(res => res.ok && res.json().then(setUserInfo))
          .catch(console.error);
      });
    } else {
      setUserInfo(null);
    }
  }, [ready, authenticated, getAccessToken]);

  const navLinks = [
    { href: '/', label: 'Products', key: 'home' },
    { href: '/leaderboard', label: 'Leaderboard', key: 'leaderboard' },
    { href: '/docs', label: 'Docs', key: 'docs' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-md border-b border-[var(--border-primary)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0 flex items-center gap-2 no-underline">
          <div className="w-2 h-2 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent-glow)] animate-sonarPulse" />
          <span className="font-extrabold text-[17px] text-[var(--accent)] leading-none tracking-tight font-mono">
            sonarbot
          </span>
        </Link>
        
        {/* Center Nav (Desktop) */}
        <nav className="hidden md:flex items-center gap-6 flex-1 justify-center">
          {navLinks.map(link => (
            <Link
              key={link.key}
              href={link.href}
              className={`text-[14px] font-medium transition-colors ${
                activePage === link.key ? 'text-[var(--text-primary)] font-semibold' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Submit Button */}
          <Link href="/docs" className="hidden md:flex items-center justify-center h-9 px-4 rounded-md bg-[var(--accent)] hover:bg-blue-700 text-white text-[13px] font-semibold transition-colors shadow-sm">
            Submit
          </Link>

          {/* Mobile Menu Toggle */}
          <div ref={mobileMenuRef} className="md:hidden relative">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center justify-center w-9 h-9 border border-[var(--border-primary)] rounded-md bg-[var(--bg-card)] text-[var(--text-muted)]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            {mobileMenuOpen && (
              <div className="absolute right-0 top-11 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-2 min-w-[180px] shadow-lg z-50">
                {navLinks.map(link => (
                  <Link
                    key={link.key}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 text-sm font-semibold rounded-lg ${
                      activePage === link.key ? 'text-[var(--accent)] bg-[var(--accent-glow)]' : 'text-[var(--text-primary)]'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link href="/docs" className="block px-4 py-3 text-sm font-semibold rounded-lg text-white bg-[var(--accent)] mt-2">
                  Submit Product
                </Link>
              </div>
            )}
          </div>

          {/* Auth */}
          {ready && (
            authenticated && userInfo ? (
              <div ref={menuRef} className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-1.5 h-9 px-2 rounded-md border border-[var(--border-primary)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] transition-colors"
                >
                  {userInfo.avatar ? (
                    <img src={userInfo.avatar} alt="" className="w-5 h-5 rounded-full" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-[var(--border-primary)] flex items-center justify-center text-[10px] font-bold text-[var(--text-muted)]">
                      {userInfo.twitter_handle[0]?.toUpperCase()}
                    </div>
                  )}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-muted)]">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-11 bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-1 min-w-[160px] shadow-lg z-50">
                    <div className="px-3 py-2 text-sm font-semibold text-[var(--text-primary)] border-b border-[var(--border-primary)] mb-1">
                      @{userInfo.twitter_handle}
                    </div>
                    <button
                      onClick={() => { logout(); setMenuOpen(false); }}
                      className="w-full px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 text-left rounded-lg transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => initOAuth({ provider: 'twitter' })}
                className="flex items-center justify-center h-9 px-4 rounded-md bg-transparent hover:bg-[var(--bg-secondary)] text-[13px] font-semibold text-[var(--text-primary)] transition-colors"
              >
                Sign in
              </button>
            )
          )}
        </div>
      </div>
    </header>
  );
}
