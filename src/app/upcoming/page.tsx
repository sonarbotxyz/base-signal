'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Eye, Bell, Check, Rocket } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface UpcomingProject {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  launchDate: Date;
  watchers: number;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(14, 0, 0, 0);
  return d;
}

const MOCK_UPCOMING: UpcomingProject[] = [
  {
    id: 'baseagent-v2', name: 'BaseAgent v2', tagline: 'Next-gen autonomous AI agents for on-chain operations',
    description: 'Autonomous AI agents with multi-step reasoning and wallet management. Supports batch transactions and MEV protection. Build complex on-chain workflows without code.',
    category: 'AI Agents', launchDate: daysFromNow(2), watchers: 1247,
  },
  {
    id: 'yieldflow', name: 'YieldFlow', tagline: 'Automated yield optimization across Base DeFi',
    description: 'Set-and-forget yield strategies that auto-rebalance across Aerodrome, Morpho, and Moonwell. Risk-adjusted portfolio management with one-click deployment.',
    category: 'DeFi', launchDate: daysFromNow(4), watchers: 892,
  },
  {
    id: 'nft-bridge', name: 'NFT Bridge', tagline: 'Cross-chain NFT transfers made simple',
    description: 'Bridge NFTs between Ethereum L1 and Base with one click. Supports ERC-721 and ERC-1155 standards. Trustless bridging with built-in provenance tracking.',
    category: 'Infra', launchDate: daysFromNow(6), watchers: 634,
  },
  {
    id: 'sociallink', name: 'SocialLink', tagline: 'Decentralized social graph protocol',
    description: 'Connecting on-chain identity with reputation scoring. Integrates Farcaster, Lens, and ENS into a unified social layer for Base applications.',
    category: 'Social', launchDate: daysFromNow(9), watchers: 1563,
  },
  {
    id: 'pixelvault', name: 'PixelVault', tagline: 'Fully on-chain gaming engine',
    description: 'Procedurally generated worlds with player-owned economies. Build multiplayer games without servers. All game state lives on Base — fully verifiable.',
    category: 'Gaming', launchDate: daysFromNow(12), watchers: 2104,
  },
  {
    id: 'chainoracle', name: 'ChainOracle', tagline: 'Sub-second oracle price feeds for Base',
    description: 'High-frequency oracle network providing sub-second price feeds for smart contracts. 99.99% uptime SLA with built-in circuit breakers and fallback routing.',
    category: 'Infra', launchDate: daysFromNow(18), watchers: 456,
  },
];

function generateHue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) * 47 + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

// ─── Countdown Hook ─────────────────────────────────────────────────────────

function useCountdown(targetDate: Date): { days: number; hours: number; mins: number; secs: number } {
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

// ─── Countdown Display ──────────────────────────────────────────────────────

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
      {segments.map((seg, i) => (
        <div key={seg.label} className="flex items-baseline gap-0.5">
          <span className="font-mono text-sm font-bold text-text tabular-nums">
            {String(seg.value).padStart(2, '0')}
          </span>
          <span className="text-[10px] text-text-tertiary font-medium">{seg.label}</span>
          {i < segments.length - 1 && (
            <span className="text-text-tertiary text-xs ml-0.5">:</span>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Project Card ───────────────────────────────────────────────────────────

function ProjectCard({ project, index }: { project: UpcomingProject; index: number }) {
  const [notified, setNotified] = useState(false);
  const [watcherCount, setWatcherCount] = useState(project.watchers);
  const hue = generateHue(project.name);

  const handleNotify = () => {
    setNotified(prev => !prev);
    setWatcherCount(prev => prev + (notified ? -1 : 1));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.06, duration: 0.3, ease: 'easeOut' }}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      className="rounded-xl bg-surface border border-border hover:border-border-light overflow-hidden transition-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] flex flex-col"
    >
      {/* Banner */}
      <div
        className="w-full h-28 sm:h-32 relative"
        style={{
          background: `linear-gradient(135deg, hsl(${hue}, 30%, 12%) 0%, hsl(${hue}, 25%, 8%) 100%)`,
        }}
      >
        <div className="absolute inset-0" style={{
          background: `radial-gradient(ellipse at 40% 60%, hsl(${hue}, 40%, 18%) 0%, transparent 70%)`,
        }} />
        {/* Logo overlay */}
        <div className="absolute bottom-3 left-4 flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center border border-white/10"
            style={{
              background: `linear-gradient(135deg, hsl(${hue}, 35%, 22%), hsl(${hue}, 30%, 30%))`,
            }}
          >
            <span className="font-brand text-base font-bold" style={{ color: `hsl(${hue}, 50%, 65%)` }}>
              {project.name[0]}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-black/40 text-white/80 uppercase tracking-wider backdrop-blur-sm">
            {project.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-[15px] font-bold text-text mb-1">{project.name}</h3>
        <p className="text-sm text-text-secondary mb-1.5">{project.tagline}</p>
        <p className="text-xs text-text-tertiary leading-relaxed mb-4 flex-1 line-clamp-2">
          {project.description}
        </p>

        {/* Countdown */}
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
          <Clock className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
          <CountdownDisplay targetDate={project.launchDate} />
        </div>

        {/* Bottom row: watchers + notify */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-text-secondary">
            <Eye className="w-3.5 h-3.5" />
            <span className="font-mono text-sm">{watcherCount.toLocaleString()}</span>
          </div>

          <motion.button
            onClick={handleNotify}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              notified
                ? 'bg-primary text-white shadow-[0_0_12px_rgba(0,82,255,0.25)]'
                : 'bg-transparent text-primary border border-primary/25 hover:bg-primary hover:text-white hover:shadow-[0_0_12px_rgba(0,82,255,0.25)]'
            }`}
          >
            {notified ? <Check className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
            {notified ? 'Notified' : 'Notify Me'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function UpcomingPage() {
  return (
    <main className="mx-auto max-w-[1000px] px-5 pt-8 pb-16">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_UPCOMING.map((project, i) => (
          <ProjectCard key={project.id} project={project} index={i} />
        ))}
      </div>
    </main>
  );
}
