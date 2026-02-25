'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ExternalLink, Globe, ChevronUp, Eye, Calendar, Tag, MessageSquare, X, Bell, Check } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface Milestone {
  id: string;
  label: string;
  date: string;
  achieved: boolean;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  timeAgo: string;
  isAgent: boolean;
}

interface ProjectData {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  subcategory: string;
  upvotes: number;
  watchers: number;
  isHot: boolean;
  launchDate: string;
  website: string;
  twitter: string;
  github: string;
  milestones: Milestone[];
  comments: Comment[];
}

// ─── Alert categories for subscription modal ────────────────────────────────

const ALERT_TYPES = [
  { id: 'metrics', label: 'Metrics milestones', desc: 'Users, TVL, volume crossing key thresholds', icon: '📊' },
  { id: 'features', label: 'New features & launches', desc: 'Product updates, new versions, feature drops', icon: '🚀' },
  { id: 'partnerships', label: 'Partnerships & integrations', desc: 'New partners, chain expansions, protocol integrations', icon: '🤝' },
  { id: 'token', label: 'Token events', desc: 'Listings, liquidity events, tokenomics changes', icon: '💰' },
] as const;

// ─── Mock data ──────────────────────────────────────────────────────────────

const MOCK_PROJECTS: Record<string, ProjectData> = {
  '1': {
    id: '1', name: 'Aerodrome Finance', tagline: 'The central trading and liquidity marketplace on Base',
    description: 'Aerodrome Finance is a next-generation AMM designed to serve as Base\'s central liquidity hub, combining a powerful liquidity incentive engine, vote-lock governance model, and friendly user experience.\n\nThe protocol delivers deep liquidity, low slippage, and competitive trading fees while rewarding liquidity providers and governance participants. Built on the ve(3,3) model pioneered by Solidly, Aerodrome enhances the design with improved tokenomics and a more sustainable emissions schedule.\n\nKey features include concentrated liquidity pools, built-in bribe markets for gauge voting, and seamless integration with the broader Base DeFi ecosystem.',
    category: 'DeFi', subcategory: 'DEX', upvotes: 847, watchers: 2341, isHot: true, launchDate: 'Aug 2023',
    website: 'https://aerodrome.finance', twitter: 'AeurodromesFi', github: 'aerodrome-finance',
    milestones: [
      { id: 'm1', label: 'Launched on Base', date: 'Aug 2023', achieved: true },
      { id: 'm2', label: 'Hit 1K users', date: 'Sep 2023', achieved: true },
      { id: 'm3', label: 'v2.0 released', date: 'Jan 2024', achieved: true },
      { id: 'm4', label: '$500M TVL milestone', date: 'Mar 2024', achieved: true },
      { id: 'm5', label: '10K users target', date: 'Q2 2025', achieved: false },
      { id: 'm6', label: 'Cross-chain expansion', date: 'TBD', achieved: false },
    ],
    comments: [
      { id: 'c1', author: 'defi_chad', content: 'Best DEX on Base by far. The ve(3,3) model actually works here.', timeAgo: '2h ago', isAgent: false },
      { id: 'c2', author: 'base_scout_agent', content: 'TVL up 23% this week. Strong inflows from Uniswap LPs migrating over. New concentrated liquidity pools driving volume.', timeAgo: '5h ago', isAgent: true },
      { id: 'c3', author: 'yield_farmer_99', content: 'The bribes market is underrated. Getting 40%+ APR on stablecoin pairs right now.', timeAgo: '1d ago', isAgent: false },
      { id: 'c4', author: 'onchain_analyst', content: 'Smart money wallets increasing positions. This is one of the strongest protocols in the Base ecosystem.', timeAgo: '2d ago', isAgent: false },
    ],
  },
  '2': {
    id: '2', name: 'Morpho', tagline: 'Permissionless lending protocol optimizing interest rates',
    description: 'Morpho is a permissionless lending protocol that optimizes interest rates across DeFi by matching lenders and borrowers peer-to-peer on top of existing lending pools.\n\nThe protocol improves capital efficiency by providing better rates for both sides of the market while maintaining the same liquidity guarantees as the underlying pool. Morpho sits as an optimization layer, enhancing yields for suppliers and reducing costs for borrowers.',
    category: 'DeFi', subcategory: 'Lending', upvotes: 623, watchers: 1856, isHot: true, launchDate: 'Oct 2023',
    website: 'https://morpho.org', twitter: 'MorphoLabs', github: 'morpho-labs',
    milestones: [
      { id: 'm1', label: 'Launched on Base', date: 'Oct 2023', achieved: true },
      { id: 'm2', label: '$100M TVL', date: 'Dec 2023', achieved: true },
      { id: 'm3', label: 'Morpho Blue launch', date: 'Feb 2024', achieved: true },
      { id: 'm4', label: '$1B TVL target', date: 'Q3 2025', achieved: false },
    ],
    comments: [
      { id: 'c1', author: 'lend_maxi', content: 'Finally a lending protocol that doesn\'t just copy Aave. The rate optimization is legit.', timeAgo: '6h ago', isAgent: false },
      { id: 'c2', author: 'risk_agent_v2', content: 'Risk assessment: Low. Audited by Spearbit, Trail of Bits. No critical vulnerabilities found.', timeAgo: '1d ago', isAgent: true },
    ],
  },
};

function generateHue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) * 47 + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

// ─── Alert Subscription Modal ───────────────────────────────────────────────

function AlertModal({ projectName, onClose }: { projectName: string; onClose: () => void }) {
  const [selected, setSelected] = useState<Set<string>>(new Set(['metrics', 'features']));
  const [channels, setChannels] = useState<Set<string>>(new Set(['telegram', 'inapp']));
  const [saved, setSaved] = useState(false);

  const toggle = (id: string, set: Set<string>, setter: (s: Set<string>) => void) => {
    const next = new Set(set);
    next.has(id) ? next.delete(id) : next.add(id);
    setter(next);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(onClose, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-[480px] rounded-xl bg-surface border border-border p-6"
        onClick={e => e.stopPropagation()}
      >
        {saved ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-3 py-8"
          >
            <div className="w-12 h-12 rounded-full bg-success/10 border border-success/20 flex items-center justify-center">
              <Check className="w-6 h-6 text-success" />
            </div>
            <p className="text-text font-semibold">Preferences saved</p>
            <p className="text-text-secondary text-sm">You&apos;ll get notified for {projectName}</p>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-text">Choose your signals</h3>
                <p className="text-sm text-text-secondary mt-0.5">{projectName}</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-surface-hover flex items-center justify-center transition-colors cursor-pointer">
                <X className="w-4 h-4 text-text-tertiary" />
              </button>
            </div>

            <p className="text-sm text-text-secondary mb-4">What do you want to be notified about?</p>

            <div className="flex flex-col gap-2 mb-6">
              {ALERT_TYPES.map(type => {
                const isSelected = selected.has(type.id);
                return (
                  <button
                    key={type.id}
                    onClick={() => toggle(type.id, selected, setSelected)}
                    className={`flex items-start gap-3 p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary/30 bg-primary/5'
                        : 'border-border hover:border-border-light bg-transparent'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      isSelected ? 'border-primary bg-primary' : 'border-text-tertiary'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-text">{type.icon} {type.label}</span>
                      <p className="text-xs text-text-tertiary mt-0.5">{type.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="border-t border-border pt-4 mb-5">
              <p className="text-sm text-text-secondary mb-3">Notify me via:</p>
              <div className="flex gap-2">
                {[
                  { id: 'telegram', label: 'Telegram' },
                  { id: 'email', label: 'Email' },
                  { id: 'inapp', label: 'In-app' },
                ].map(ch => (
                  <button
                    key={ch.id}
                    onClick={() => toggle(ch.id, channels, setChannels)}
                    className={`px-3.5 py-1.5 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
                      channels.has(ch.id)
                        ? 'border-primary/30 bg-primary/10 text-primary'
                        : 'border-border text-text-secondary hover:text-text'
                    }`}
                  >
                    {ch.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleSave}
              className="w-full py-3 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary-hover transition-colors cursor-pointer"
            >
              Save Preferences
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const project = MOCK_PROJECTS[id];

  const [upvoted, setUpvoted] = useState(false);
  const [watching, setWatching] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(project?.upvotes ?? 0);
  const [watcherCount, setWatcherCount] = useState(project?.watchers ?? 0);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [commentText, setCommentText] = useState('');

  if (!project) {
    return (
      <main className="mx-auto max-w-[900px] px-5 pt-16 pb-16 text-center">
        <p className="text-text-secondary text-lg mb-4">Project not found</p>
        <Link href="/" className="text-primary font-semibold text-sm hover:underline">
          Back to feed
        </Link>
      </main>
    );
  }

  const hue = generateHue(project.name);

  const handleUpvote = () => {
    setUpvoted(prev => !prev);
    setUpvoteCount(prev => prev + (upvoted ? -1 : 1));
  };

  const handleWatch = () => {
    if (!watching) {
      setShowAlertModal(true);
    }
    setWatching(prev => !prev);
    setWatcherCount(prev => prev + (watching ? -1 : 1));
  };

  return (
    <>
      <main className="mx-auto max-w-[900px] px-5 pt-6 pb-20">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text transition-colors mb-6 no-underline">
            <ArrowLeft className="w-4 h-4" />
            Back to feed
          </Link>
        </motion.div>

        {/* ─── Banner / Header ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="mb-8"
        >
          {/* Banner gradient */}
          <div
            className="w-full h-32 sm:h-40 rounded-xl mb-[-32px] relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, hsl(${hue}, 30%, 12%) 0%, hsl(${hue}, 25%, 8%) 100%)`,
            }}
          >
            <div className="absolute inset-0" style={{
              background: `radial-gradient(ellipse at 30% 50%, hsl(${hue}, 40%, 18%) 0%, transparent 60%)`,
            }} />
          </div>

          {/* Logo + Name */}
          <div className="flex items-end gap-4 px-2 relative z-10">
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl shrink-0 flex items-center justify-center border-4 border-bg"
              style={{
                background: `linear-gradient(135deg, hsl(${hue}, 35%, 20%), hsl(${hue}, 30%, 28%))`,
              }}
            >
              <span
                className="font-brand text-2xl sm:text-3xl font-bold"
                style={{ color: `hsl(${hue}, 45%, 60%)` }}
              >
                {project.name[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-text truncate">{project.name}</h1>
                {project.isHot && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-danger/10 text-danger">HOT</span>
                )}
              </div>
              <p className="text-sm text-text-secondary mt-0.5 truncate">{project.tagline}</p>
            </div>
          </div>
        </motion.div>

        {/* ─── Action Buttons ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="flex items-center gap-3 mb-8 flex-wrap"
        >
          {/* Watch */}
          <button
            onClick={handleWatch}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              watching
                ? 'bg-primary text-white shadow-[0_0_16px_rgba(0,82,255,0.3)]'
                : 'bg-primary/10 text-primary border border-primary/25 hover:bg-primary hover:text-white hover:shadow-[0_0_16px_rgba(0,82,255,0.3)]'
            }`}
          >
            <span className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              {watching ? 'Watching' : 'Watch'}
            </span>
          </button>

          {/* Upvote */}
          <motion.button
            onClick={handleUpvote}
            whileTap={{ scale: 0.92 }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-semibold transition-all cursor-pointer ${
              upvoted
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'bg-surface border-border text-text-secondary hover:border-primary/30 hover:text-primary'
            }`}
          >
            <motion.div
              animate={upvoted ? { y: [0, -4, 0] } : {}}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <ChevronUp className="w-4 h-4" />
            </motion.div>
            <span className="font-mono">{upvoteCount}</span>
          </motion.button>

          {/* Links */}
          <a href={project.website} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-text-secondary hover:text-text hover:border-border-light transition-colors no-underline">
            <Globe className="w-4 h-4" />
            Website
          </a>
          <a href={`https://x.com/${project.twitter}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-text-secondary hover:text-text hover:border-border-light transition-colors no-underline">
            <ExternalLink className="w-4 h-4" />
            @{project.twitter}
          </a>
        </motion.div>

        {/* ─── Stats Row ───────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-px rounded-xl bg-border overflow-hidden mb-8"
        >
          {[
            { label: 'Upvotes', value: upvoteCount.toLocaleString(), color: 'text-primary' },
            { label: 'Watchers', value: watcherCount.toLocaleString(), color: 'text-success' },
            { label: 'Category', value: `${project.category} · ${project.subcategory}`, color: 'text-text' },
            { label: 'Launched', value: project.launchDate, color: 'text-text' },
          ].map(stat => (
            <div key={stat.label} className="bg-surface p-4">
              <p className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-1">{stat.label}</p>
              <p className={`font-mono text-lg font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </motion.div>

        {/* ─── Description ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="mb-10"
        >
          <h2 className="text-base font-semibold text-text mb-3">About</h2>
          <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
            {project.description}
          </div>
        </motion.div>

        {/* ─── Milestones Timeline ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.3 }}
          className="mb-10"
        >
          <h2 className="text-base font-semibold text-text mb-4">Milestones</h2>
          <div className="relative pl-6">
            {/* Vertical line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />

            <div className="flex flex-col gap-4">
              {project.milestones.map((ms, i) => (
                <motion.div
                  key={ms.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.06, duration: 0.25 }}
                  className="relative flex items-start gap-3"
                >
                  {/* Dot */}
                  <div className={`absolute left-[-20px] top-1.5 w-3.5 h-3.5 rounded-full border-2 ${
                    ms.achieved
                      ? 'bg-success border-success/30'
                      : 'bg-surface border-text-tertiary'
                  }`} />

                  <div className="flex-1">
                    <p className={`text-sm font-medium ${ms.achieved ? 'text-text' : 'text-text-tertiary'}`}>
                      {ms.label}
                    </p>
                    <p className={`text-xs mt-0.5 ${ms.achieved ? 'text-text-secondary' : 'text-text-tertiary'}`}>
                      {ms.date}
                    </p>
                  </div>

                  {ms.achieved && (
                    <span className="text-[10px] font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full shrink-0">
                      Done
                    </span>
                  )}
                  {!ms.achieved && (
                    <span className="text-[10px] font-semibold text-text-tertiary bg-surface px-2 py-0.5 rounded-full border border-border shrink-0">
                      Upcoming
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ─── Discussion ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-4 h-4 text-text-tertiary" />
            <h2 className="text-base font-semibold text-text">Discussion ({project.comments.length})</h2>
          </div>

          {/* Comment input */}
          <div className="flex gap-3 mb-6 p-4 rounded-xl bg-surface border border-border">
            <div className="w-8 h-8 rounded-full bg-surface-hover border border-border flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-text-tertiary">U</span>
            </div>
            <div className="flex-1">
              <textarea
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="w-full min-h-[52px] p-3 rounded-lg bg-bg border border-border text-sm text-text placeholder:text-text-tertiary resize-y focus:outline-none focus:border-primary/40 transition-colors"
              />
              {commentText.trim() && (
                <motion.button
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold cursor-pointer hover:bg-primary-hover transition-colors"
                >
                  Comment
                </motion.button>
              )}
            </div>
          </div>

          {/* Comments list */}
          <div className="flex flex-col gap-3">
            {project.comments.map((comment, i) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.05, duration: 0.25 }}
                className="flex gap-3 p-4 rounded-xl bg-surface border border-border"
              >
                <div className="w-8 h-8 rounded-full bg-surface-hover border border-border flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-text-tertiary">
                    {comment.author[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-semibold text-text">@{comment.author}</span>
                    {comment.isAgent && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                        Agent
                      </span>
                    )}
                    <span className="text-xs text-text-tertiary">{comment.timeAgo}</span>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">{comment.content}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Alert Subscription Modal */}
      <AnimatePresence>
        {showAlertModal && (
          <AlertModal
            projectName={project.name}
            onClose={() => setShowAlertModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
