'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Menu, X, Radio, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
  { href: '/', label: 'Trending' },
  { href: '/upcoming', label: 'Upcoming' },
  { href: '/submit', label: 'Submit' },
] as const;

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href) ?? false;
  };

  return (
    <>
      <header className="glass-header">
        <div className="mx-auto max-w-[1280px] h-[56px] sm:h-[60px] px-4 sm:px-6 flex items-center gap-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 no-underline">
            <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(0,82,255,0.5)]" />
            <span className="font-brand text-[17px] font-bold text-text tracking-[-0.02em]">
              Base Signal
            </span>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:block flex-1 max-w-[320px] ml-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary pointer-events-none" />
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full h-9 pl-9 pr-4 rounded-lg bg-surface border border-border text-sm text-text placeholder:text-text-tertiary focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 ml-auto">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors no-underline ${
                  isActive(link.href)
                    ? 'text-text bg-surface-hover'
                    : 'text-text-secondary hover:text-text'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* My Signal - Desktop */}
          <Link
            href="/my-signal"
            className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors no-underline ${
              isActive('/my-signal')
                ? 'text-primary bg-primary/10'
                : 'text-text-secondary hover:text-text'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>My Signal</span>
          </Link>

          {/* Connect Button - Desktop */}
          <button className="hidden sm:flex shrink-0 items-center gap-1.5 px-4 h-9 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors cursor-pointer">
            <Zap className="w-3.5 h-3.5" />
            Connect
          </button>

          {/* Mobile: Search toggle */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="md:hidden ml-auto w-10 h-10 flex items-center justify-center rounded-lg text-text-secondary hover:text-text hover:bg-surface-hover transition-colors cursor-pointer"
            aria-label="Search"
          >
            <Search className="w-[18px] h-[18px]" />
          </button>

          {/* Mobile: Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg text-text-secondary hover:text-text hover:bg-surface-hover transition-colors cursor-pointer"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Search Bar (slides down) */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t border-border"
            >
              <div className="px-4 py-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder="Search projects..."
                    className="w-full h-11 pl-10 pr-4 rounded-lg bg-surface border border-border text-base text-text placeholder:text-text-tertiary focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Slide-Out Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />

            {/* Panel */}
            <motion.div
              ref={menuRef}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-[280px] bg-bg border-l border-border flex flex-col md:hidden"
            >
              {/* Panel Header */}
              <div className="flex items-center justify-between px-5 h-[56px] border-b border-border">
                <span className="font-brand text-[15px] font-bold text-text">Menu</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-lg text-text-secondary hover:text-text hover:bg-surface-hover transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Nav Links */}
              <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
                {NAV_LINKS.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center h-12 px-4 rounded-lg text-[15px] font-medium transition-colors no-underline ${
                      isActive(link.href)
                        ? 'text-text bg-surface-hover'
                        : 'text-text-secondary hover:text-text hover:bg-surface'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="h-px bg-border my-2" />

                <Link
                  href="/my-signal"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 h-12 px-4 rounded-lg text-[15px] font-medium transition-colors no-underline ${
                    isActive('/my-signal')
                      ? 'text-primary bg-primary/10'
                      : 'text-text-secondary hover:text-text hover:bg-surface'
                  }`}
                >
                  <Radio className="w-4 h-4" />
                  My Signal
                </Link>
              </nav>

              {/* Connect Button */}
              <div className="px-4 pb-6 pt-2">
                <button className="w-full h-12 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors cursor-pointer flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4" />
                  Connect
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
