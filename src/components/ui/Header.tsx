'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Radio } from 'lucide-react';

const NAV_TABS = [
  { key: 'trending', label: 'Trending' },
  { key: 'new', label: 'New' },
  { key: 'upcoming', label: 'Upcoming' },
] as const;

export function Header() {
  const [activeTab, setActiveTab] = useState<string>('trending');

  return (
    <header className="glass-header">
      <div className="mx-auto max-w-[1200px] px-5 h-[60px] flex items-center gap-4 lg:gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 no-underline">
          <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(0,82,255,0.5)]" />
          <span className="font-brand text-xl font-bold text-text tracking-[-0.02em]">
            Base Signal
          </span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-[340px] relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
          <input
            type="text"
            placeholder="Search projects..."
            className="w-full h-9 pl-9 pr-4 rounded-lg bg-surface border border-border text-sm text-text placeholder:text-text-tertiary focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Nav Tabs */}
        <nav className="hidden sm:flex items-center gap-1 ml-auto">
          {NAV_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                activeTab === tab.key
                  ? 'text-text bg-surface-hover'
                  : 'text-text-secondary hover:text-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* My Signal */}
        <Link
          href="/my-signal"
          className="hidden lg:flex items-center gap-1.5 text-sm text-text-secondary hover:text-text transition-colors no-underline"
        >
          <Radio className="w-4 h-4" />
          <span>My Signal</span>
        </Link>

        {/* Connect Wallet */}
        <button className="shrink-0 ml-auto sm:ml-0 px-4 h-9 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors cursor-pointer">
          Connect
        </button>
      </div>
    </header>
  );
}
