'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Rocket, Eye, Bell, Check, Clock } from 'lucide-react';
import { getCategoryColors } from '@/components/ProjectCard';

// ─── Types ───────────────────────────────────────────────────────────────────

interface UpcomingProject {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  launchDate: Date;
  watchers: number;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(14, 0, 0, 0);
  return d;
}

const MOCK_UPCOMING: UpcomingProject[] = [
  {
    id: 'baseagent-v2', name: 'BaseAgent v2', tagline: 'Next-gen autonomous AI agents for on-chain operations',
    description: 'Autonomous AI agents with multi-step reasoning and wallet management. Supports batch transactions and MEV protection.',
    category: 'AI Agents', launchDate: daysFromNow(2), watchers: 1247,
  },
  {
    id: 'yieldflow', name: 'YieldFlow', tagline: 'Automated yield optimization across Base DeFi',
    description: 'Set-and-forget yield strategies that auto-rebalance across Aerodrome, Morpho, and Moonwell.',
    category: 'DeFi', launchDate: daysFromNow(4), watchers: 892,
  },
  {
    id: 'nft-bridge', name: 'NFT Bridge', tagline: 'Cross-chain NFT transfers made simple',
    description: 'Bridge NFTs between Ethereum L1 and Base with one click. Supports ERC-721 and ERC-1155.',
    category: 'Infra', launchDate: daysFromNow(6), watchers: 634,
  },
  {
    id: 'sociallink', name: 'SocialLink', tagline: 'Decentralized social graph protocol',
    description: 'Connecting on-chain identity with reputation scoring. Integrates Farcaster, Lens, and ENS.',
    category: 'Social', launchDate: daysFromNow(9), watchers: 1563,
  },
  {
    id: 'pixelvault', name: 'PixelVault', tagline: 'Fully on-chain gaming engine',
    description: 'Procedurally generated worlds with player-owned economies. All game state lives on Base.',
    category: 'Gaming', launchDate: daysFromNow(12), watchers: 2104,
  },
  {
    id: 'chainoracle', name: 'ChainOracle', tagline: 'Sub-second oracle price feeds for Base',
    description: 'High-frequency oracle network providing sub-second price feeds for smart contracts.',
    category: 'Infra', launchDate: daysFromNow(18), watchers: 456,
  },
];

// ─── Noise texture SVG ──────────────────────────────────────────────────────

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`;

// ─── Countdown Hook ──────────────────────────────────────────────────────────

function useCountdown(targetDate: Date) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const diff = Math.max(0, targetDate.getTime() - now.getTime());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    mins: Math.floor((diff / (1000 * 60)) % 60),
    secs: Math.floor((diff / 1000) % 60),
  };
}

// ─── Countdown Display ───────────────────────────────────────────────────────

function CountdownDisplay({ targetDate }: { targetDate: Date }) {
  const { days, hours, mins, secs } = useCountdown(targetDate);

  const segments = [
    { value: days, label: 'd' },
    { value: hours, label: 'h' },
    { value: mins, label: 'm' },
    { value: secs, label: 's' },
  ];

  return (
    <div className="flex items-center gap-1.5">
      <Clock className="w-3 h-3 text-text-tertiary" />
      {segments.map((seg, i) => (
        <div key={seg.label} className="flex items-baseline gap-0.5">
          <span className="font-mono text-sm font-bold text-text tabular-nums">
            {String(seg.value).padStart(2, '0')}
          </span>
          <span className="text-[10px] text-text-tertiary font-medium">{seg.label}</span>
          {i < segments.length - 1 && (
            <span className="text-text-tertiary text-[10px] ml-0.5">:</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Project Card ────────────────────────────────────────────────────────────

function UpcomingCard({ project, index }: { project: UpcomingProject; index: number }) {
  const [notified, setNotified] = useState(false);
  const [watcherCount, setWatcherCount] = useState(project.watchers);
  const colors = getCategoryColors(project.category);

  const handleNotify = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setNotified(prev => !prev);
    setWatcherCount(prev => prev + (notified ? -1 : 1));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 + index * 0.06, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative"
    >
      <Link
        href={`/project/${project.id}`}
        className="block rounded-2xl overflow-hidden no-underline transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]"
        style={{ background: '#16161A' }}
      >
        {/* ── Banner ── */}
        <div
          className="relative w-full overflow-hidden"
          style={{
            paddingBottom: '55%',
            background: `linear-gradient(145deg, ${colors.from} 0%, ${colors.via}22 40%, ${colors.to} 100%)`,
          }}
        >
          <div
            className="absolute inset-0"
            style={{ background: `radial-gradient(ellipse at 30% 50%, ${colors.via}30 0%, transparent 65%)` }}
          />

          {/* Noise texture */}
          <div
            className="absolute inset-0 opacity-60 mix-blend-overlay"
            style={{ backgroundImage: NOISE_SVG, backgroundSize: '128px 128px' }}
          />

          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '20px 20px',
            }}
          />

          {/* Large initial */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="font-brand font-bold select-none"
              style={{ fontSize: 'clamp(3rem, 7vw, 4.5rem)', lineHeight: 1, color: `${colors.via}20` }}
            >
              {project.name[0]}
            </span>
          </div>

          {/* Category badge */}
          <div className="absolute top-2.5 left-2.5">
            <span
              className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm"
              style={{ background: `${colors.accent}25`, color: colors.accent }}
            >
              {project.category}
            </span>
          </div>

          {/* Countdown overlay */}
          <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm">
            <CountdownDisplay targetDate={project.launchDate} />
          </div>
        </div>

        {/* ── Content ── */}
        <div className="p-4 pb-3.5 flex flex-col">
          <h3 className="text-[15px] font-bold text-text truncate mb-1">{project.name}</h3>
          <p className="text-[13px] text-text-secondary leading-snug mb-1">{project.tagline}</p>
          <p className="text-xs text-text-tertiary leading-relaxed mb-4 line-clamp-2">
            {project.description}
          </p>

          {/* Bottom row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-text-tertiary">
              <Eye className="w-3.5 h-3.5" />
              <span className="font-mono text-xs">{watcherCount.toLocaleString()}</span>
            </div>

            <button
              onClick={handleNotify}
              className={`flex items-center gap-1.5 px-3.5 py-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                notified
                  ? 'bg-primary text-white shadow-[0_0_14px_rgba(0,82,255,0.3)]'
                  : 'bg-surface-hover text-text-secondary hover:bg-primary hover:text-white hover:shadow-[0_0_14px_rgba(0,82,255,0.3)]'
              }`}
            >
              {notified ? (
                <>
                  <Check className="w-3 h-3" />
                  Notified
                </>
              ) : (
                <>
                  <Bell className="w-3 h-3" />
                  Notify Me
                </>
              )}
            </button>
          </div>
        </div>
      </Link>

      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ boxShadow: `0 8px 40px ${colors.accent}10, 0 0 0 1px ${colors.accent}12` }}
      />
    </motion.div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function UpcomingPage() {
  return (
    <main className="mx-auto max-w-[1280px] px-4 sm:px-6 pt-6 sm:pt-8 pb-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6 sm:mb-8"
      >
        <div className="flex items-center gap-2.5 mb-2">
          <Rocket className="w-5 h-5 text-primary" />
          <h1 className="text-xl sm:text-2xl font-bold text-text">Upcoming Launches</h1>
        </div>
        <p className="text-sm text-text-secondary max-w-[500px]">
          Projects preparing to launch on Base. Get notified when they go live.
        </p>
      </motion.div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_UPCOMING.map((project, i) => (
          <UpcomingCard key={project.id} project={project} index={i} />
        ))}
      </div>
    </main>
  );
}
