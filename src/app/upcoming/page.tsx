'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Rocket } from 'lucide-react';

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

// ─── Category Colors ─────────────────────────────────────────────────────────

const CATEGORY_GRADIENTS: Record<string, { from: string; via: string; to: string; accent: string }> = {
  DeFi:       { from: '#0033CC', via: '#0052FF', to: '#1A3A8A', accent: '#0052FF' },
  Social:     { from: '#6B21A8', via: '#9333EA', to: '#4C1D95', accent: '#A855F7' },
  NFT:        { from: '#BE185D', via: '#EC4899', to: '#831843', accent: '#F472B6' },
  Infra:      { from: '#065F46', via: '#10B981', to: '#064E3B', accent: '#34D399' },
  Gaming:     { from: '#C2410C', via: '#F97316', to: '#7C2D12', accent: '#FB923C' },
  Tools:      { from: '#374151', via: '#6B7280', to: '#1F2937', accent: '#9CA3AF' },
  'AI Agents': { from: '#6D28D9', via: '#8B5CF6', to: '#4C1D95', accent: '#A78BFA' },
};

function getCategoryColors(category: string) {
  return CATEGORY_GRADIENTS[category] ?? CATEGORY_GRADIENTS.Tools;
}

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
    <div className="flex items-center gap-1">
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

function ProjectCard({ project, index }: { project: UpcomingProject; index: number }) {
  const [notified, setNotified] = useState(false);
  const [watcherCount, setWatcherCount] = useState(project.watchers);
  const colors = getCategoryColors(project.category);

  const handleNotify = () => {
    setNotified(prev => !prev);
    setWatcherCount(prev => prev + (notified ? -1 : 1));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 + index * 0.06, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative rounded-2xl overflow-hidden flex flex-col transition-shadow duration-300"
      style={{ background: '#1A1A2E' }}
    >
      {/* ── Banner (65%) ── */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          paddingBottom: '55%',
          background: `linear-gradient(145deg, ${colors.from} 0%, ${colors.via}22 40%, ${colors.to} 100%)`,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 30% 50%, ${colors.via}30 0%, transparent 65%)`,
          }}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Large initial */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-brand font-bold select-none"
            style={{ fontSize: '4.5rem', lineHeight: 1, color: `${colors.via}25` }}
          >
            {project.name[0]}
          </span>
        </div>

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span
            className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider"
            style={{ background: `${colors.accent}20`, color: colors.accent }}
          >
            {project.category}
          </span>
        </div>

        {/* Countdown overlay */}
        <div className="absolute bottom-3 left-3 px-2.5 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm">
          <CountdownDisplay targetDate={project.launchDate} />
        </div>
      </div>

      {/* ── Content ── */}
      <div className="p-4 pb-3.5 flex-1 flex flex-col">
        <h3 className="text-[15px] font-bold text-text truncate mb-1">{project.name}</h3>
        <p className="text-[13px] text-text-secondary leading-snug mb-1">{project.tagline}</p>
        <p className="text-xs text-text-tertiary leading-relaxed mb-4 flex-1 line-clamp-2">
          {project.description}
        </p>

        {/* Bottom row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-text-tertiary">
            <span className="text-xs">&#x1F440;</span>
            <span className="font-mono text-xs">{watcherCount.toLocaleString()}</span>
          </div>

          <motion.button
            onClick={handleNotify}
            whileTap={{ scale: 0.93 }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              notified
                ? 'bg-primary text-white shadow-[0_0_14px_rgba(0,82,255,0.3)]'
                : 'bg-[#252540] text-text-secondary hover:bg-primary hover:text-white hover:shadow-[0_0_14px_rgba(0,82,255,0.3)]'
            }`}
          >
            {notified ? '✓ Notified' : '🔔 Notify Me'}
          </motion.button>
        </div>
      </div>

      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          boxShadow: `0 8px 40px ${colors.accent}12, 0 0 0 1px ${colors.accent}15`,
        }}
      />
    </motion.div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function UpcomingPage() {
  return (
    <main className="mx-auto max-w-[1280px] px-5 pt-8 pb-16">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2.5 mb-2">
          <Rocket className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-text">Upcoming Launches</h1>
        </div>
        <p className="text-sm text-text-secondary">
          Projects preparing to launch on Base. Get notified when they go live.
        </p>
      </motion.div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {MOCK_UPCOMING.map((project, i) => (
          <ProjectCard key={project.id} project={project} index={i} />
        ))}
      </div>
    </main>
  );
}
