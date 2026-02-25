import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-8 sm:py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Left: Brand */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="font-brand text-[15px] font-bold text-text tracking-[-0.02em]">
                Base Signal
              </span>
            </div>
            <p className="text-xs text-text-tertiary">
              Intelligence feed for the Base ecosystem
            </p>
          </div>

          {/* Center: Nav */}
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/submit" className="text-text-secondary hover:text-text transition-colors no-underline py-2">
              Submit
            </Link>
            <Link href="/upcoming" className="text-text-secondary hover:text-text transition-colors no-underline py-2">
              Upcoming
            </Link>
            <a
              href="https://x.com/basesignalxyz"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-text-secondary hover:text-text transition-colors no-underline py-2"
            >
              Twitter
              <ExternalLink className="w-3 h-3" />
            </a>
          </nav>

          {/* Right: Built on Base */}
          <div className="flex items-center gap-2 text-xs text-text-tertiary">
            <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            </div>
            <span>Built on Base</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
