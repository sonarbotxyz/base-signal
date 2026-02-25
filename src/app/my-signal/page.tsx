'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Radio, Bell, Eye, Settings, ChevronRight, Zap,
  TrendingUp, Handshake, Gem, Flame,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface Alert {
  id: string;
  projectName: string;
  projectId: string;
  message: string;
  type: 'metrics' | 'feature' | 'partnership' | 'token';
  timeAgo: string;
}

interface WatchedProject {
  id: string;
  name: string;
  category: string;
  newActivity: number;
  status: 'active' | 'quiet' | 'hot' | 'launching';
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_ALERTS: Alert[] = [
  { id: 'a1', projectName: 'Aerodrome Finance', projectId: '1', message: 'TVL crossed $500M — a milestone you\'re tracking', type: 'metrics', timeAgo: '2 hours ago' },
  { id: 'a2', projectName: 'Morpho', projectId: '2', message: 'Launched Morpho Blue v2 with new risk parameters', type: 'feature', timeAgo: '5 hours ago' },
  { id: 'a3', projectName: 'Farcaster', projectId: '3', message: 'Integration with Coinbase Wallet announced', type: 'partnership', timeAgo: '1 day ago' },
  { id: 'a4', projectName: 'Degen Chain', projectId: '6', message: '$DEGEN listed on 3 new exchanges this week', type: 'token', timeAgo: '2 days ago' },
  { id: 'a5', projectName: 'BaseSwap', projectId: '5', message: 'Hit 10K unique traders milestone', type: 'metrics', timeAgo: '3 days ago' },
  { id: 'a6', projectName: 'Seamless Protocol', projectId: '4', message: 'v3.0 launched with integrated leverage vaults', type: 'feature', timeAgo: '4 days ago' },
];

const MOCK_WATCHED: WatchedProject[] = [
  { id: '1', name: 'Aerodrome Finance', category: 'DeFi', newActivity: 3, status: 'hot' },
  { id: '2', name: 'Morpho', category: 'DeFi', newActivity: 1, status: 'active' },
  { id: '3', name: 'Farcaster', category: 'Social', newActivity: 2, status: 'active' },
  { id: '4', name: 'Seamless Protocol', category: 'DeFi', newActivity: 0, status: 'quiet' },
  { id: '5', name: 'BaseSwap', category: 'DeFi', newActivity: 1, status: 'active' },
  { id: '6', name: 'Degen Chain', category: 'Infra', newActivity: 0, status: 'quiet' },
  { id: '7', name: 'Moonwell', category: 'DeFi', newActivity: 0, status: 'quiet' },
  { id: '8', name: 'Zora', category: 'NFT', newActivity: 4, status: 'hot' },
];

const ALERT_TYPE_CONFIG: Record<Alert['type'], { icon: typeof Zap; color: string; bg: string }> = {
  metrics: { icon: TrendingUp, color: 'text-success', bg: 'bg-success/10' },
  feature: { icon: Zap, color: 'text-primary', bg: 'bg-primary/10' },
  partnership: { icon: Handshake, color: 'text-gold', bg: 'bg-gold/10' },
  token: { icon: Gem, color: 'text-danger', bg: 'bg-danger/10' },
};

function generateHue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) * 47 + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

// ─── Login CTA ──────────────────────────────────────────────────────────────

function LoginCTA() {
  return (
    <main className="mx-auto max-w-[600px] px-4 sm:px-6 pt-16 sm:pt-20 pb-16 text-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center gap-5"
      >
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Radio className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text mb-2">Your personal signal feed</h1>
          <p className="text-text-secondary text-sm leading-relaxed max-w-[400px] mx-auto">
            Watch projects, choose your milestones, and get notified when things happen. Your Base radar, personalized.
          </p>
        </div>
        <button className="px-8 py-3 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary-hover transition-colors cursor-pointer">
          Connect to get started
        </button>
        <p className="text-xs text-text-tertiary">
          Free to use. No wallet required — sign in with email or social.
        </p>
      </motion.div>
    </main>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────

export default function MySignalPage() {
  const [isLoggedIn] = useState(true);
  const [notifSettings, setNotifSettings] = useState({
    telegram: true,
    email: false,
    inApp: true,
    weeklyDigest: true,
  });

  if (!isLoggedIn) return <LoginCTA />;

  return (
    <main className="mx-auto max-w-[1000px] px-4 sm:px-6 pt-6 sm:pt-8 pb-16">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between mb-6 sm:mb-8"
      >
        <div className="flex items-center gap-3">
          <Radio className="w-5 h-5 text-primary" />
          <h1 className="text-xl sm:text-2xl font-bold text-text">My Signal</h1>
        </div>
        <span className="text-xs text-text-tertiary font-mono">Updated 2m ago</span>
      </motion.div>

      {/* ─── Recent Alerts ─────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.3 }}
        className="mb-8 sm:mb-10"
      >
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-text-tertiary" />
          <h2 className="text-sm font-semibold text-text uppercase tracking-wider">Recent Alerts</h2>
        </div>

        <div className="flex flex-col gap-2">
          {MOCK_ALERTS.map((alert, i) => {
            const config = ALERT_TYPE_CONFIG[alert.type];
            const Icon = config.icon;
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.04, duration: 0.25 }}
              >
                <Link
                  href={`/project/${alert.projectId}`}
                  className="flex items-start gap-3 p-3 sm:p-4 rounded-xl bg-surface border border-border hover:border-border-light transition-all group no-underline"
                >
                  <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                      <span className="text-sm font-semibold text-text">{alert.projectName}</span>
                      <span className="text-xs text-text-tertiary">{alert.timeAgo}</span>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed">{alert.message}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-tertiary shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* ─── Watched Projects Grid ─────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.3 }}
        className="mb-8 sm:mb-10"
      >
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-4 h-4 text-text-tertiary" />
          <h2 className="text-sm font-semibold text-text uppercase tracking-wider">
            Watching ({MOCK_WATCHED.length} projects)
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {MOCK_WATCHED.map((project, i) => {
            const hue = generateHue(project.name);
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.04, duration: 0.25 }}
                className="group"
              >
                <Link
                  href={`/project/${project.id}`}
                  className="block p-3 sm:p-4 rounded-xl bg-surface border border-border hover:border-border-light hover:-translate-y-0.5 transition-all no-underline"
                >
                  {/* Mini banner */}
                  <div
                    className="w-full h-10 sm:h-12 rounded-lg mb-3"
                    style={{
                      background: `linear-gradient(135deg, hsl(${hue}, 30%, 14%), hsl(${hue}, 25%, 10%))`,
                    }}
                  />

                  {/* Logo + Name */}
                  <div className="flex items-center gap-2 sm:gap-2.5 mb-2">
                    <div
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg shrink-0 flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, hsl(${hue}, 35%, 20%), hsl(${hue}, 30%, 28%))`,
                      }}
                    >
                      <span
                        className="font-brand text-xs sm:text-sm font-bold"
                        style={{ color: `hsl(${hue}, 45%, 60%)` }}
                      >
                        {project.name[0]}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-text truncate">{project.name}</p>
                      <p className="text-[10px] sm:text-[11px] text-text-tertiary uppercase tracking-wider">{project.category}</p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-1.5">
                    {project.newActivity > 0 ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        <span className="text-xs font-medium text-success">
                          {project.newActivity} new
                        </span>
                      </>
                    ) : project.status === 'hot' ? (
                      <>
                        <Flame className="w-3 h-3 text-danger" />
                        <span className="text-xs font-medium text-danger">hot</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-text-tertiary" />
                        <span className="text-xs text-text-tertiary">quiet</span>
                      </>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* ─── Notification Preferences ──────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-4 h-4 text-text-tertiary" />
          <h2 className="text-sm font-semibold text-text uppercase tracking-wider">Notification Preferences</h2>
        </div>

        <div className="rounded-xl bg-surface border border-border divide-y divide-border">
          {[
            { key: 'telegram' as const, label: 'Telegram alerts', desc: 'Get real-time pings via Telegram bot' },
            { key: 'email' as const, label: 'Email notifications', desc: 'Receive alerts to your email' },
            { key: 'inApp' as const, label: 'In-app notifications', desc: 'See alerts in your dashboard feed' },
            { key: 'weeklyDigest' as const, label: 'Weekly digest', desc: 'Summary of all watched project activity' },
          ].map(pref => (
            <div key={pref.key} className="flex items-center justify-between p-3 sm:p-4">
              <div className="mr-4">
                <p className="text-sm font-medium text-text">{pref.label}</p>
                <p className="text-xs text-text-tertiary mt-0.5">{pref.desc}</p>
              </div>
              <button
                onClick={() => setNotifSettings(prev => ({ ...prev, [pref.key]: !prev[pref.key] }))}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${
                  notifSettings[pref.key] ? 'bg-primary' : 'bg-border'
                }`}
              >
                <motion.div
                  animate={{ x: notifSettings[pref.key] ? 20 : 2 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="absolute top-1 w-4 h-4 rounded-full bg-white"
                />
              </button>
            </div>
          ))}
        </div>
      </motion.section>
    </main>
  );
}
