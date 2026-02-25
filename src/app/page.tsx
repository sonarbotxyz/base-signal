'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  upvotes: number;
  watchers: number;
  isHot: boolean;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Aerodrome Finance',
    description: 'The central trading and liquidity marketplace on Base',
    category: 'DeFi',
    subcategory: 'DEX',
    upvotes: 847,
    watchers: 2341,
    isHot: true,
  },
  {
    id: '2',
    name: 'Morpho',
    description: 'Permissionless lending protocol optimizing interest rates across DeFi',
    category: 'DeFi',
    subcategory: 'Lending',
    upvotes: 623,
    watchers: 1856,
    isHot: true,
  },
  {
    id: '3',
    name: 'Farcaster',
    description: 'Sufficiently decentralized social network protocol on Base',
    category: 'Social',
    subcategory: 'Protocol',
    upvotes: 512,
    watchers: 3102,
    isHot: false,
  },
  {
    id: '4',
    name: 'Seamless Protocol',
    description: 'Native lending and borrowing on Base with integrated leverage',
    category: 'DeFi',
    subcategory: 'Lending',
    upvotes: 389,
    watchers: 1204,
    isHot: false,
  },
  {
    id: '5',
    name: 'BaseSwap',
    description: 'Community-driven DEX with yield farming and NFT marketplace',
    category: 'DeFi',
    subcategory: 'DEX',
    upvotes: 298,
    watchers: 967,
    isHot: false,
  },
  {
    id: '6',
    name: 'Degen Chain',
    description: 'High-performance L3 built on Base for the Degen community',
    category: 'Infra',
    subcategory: 'L3',
    upvotes: 276,
    watchers: 1543,
    isHot: true,
  },
  {
    id: '7',
    name: 'Moonwell',
    description: 'Open lending and borrowing DeFi protocol with transparent governance',
    category: 'DeFi',
    subcategory: 'Lending',
    upvotes: 234,
    watchers: 812,
    isHot: false,
  },
  {
    id: '8',
    name: 'Brett',
    description: "Base's blue mascot memecoin powering the ecosystem community",
    category: 'Social',
    subcategory: 'Meme',
    upvotes: 198,
    watchers: 2876,
    isHot: false,
  },
  {
    id: '9',
    name: 'Zora',
    description: 'Create, collect, and earn on the open internet',
    category: 'NFT',
    subcategory: 'Marketplace',
    upvotes: 167,
    watchers: 1089,
    isHot: false,
  },
  {
    id: '10',
    name: 'BasePaint',
    description: 'Collaborative pixel art canvas minted daily as NFTs on Base',
    category: 'NFT',
    subcategory: 'Art',
    upvotes: 143,
    watchers: 654,
    isHot: false,
  },
];

const CATEGORIES = ['All', 'DeFi', 'Social', 'NFT', 'Infra', 'Gaming', 'Tools'];

// ─── Category Colors ─────────────────────────────────────────────────────────

const CATEGORY_GRADIENTS: Record<string, { from: string; via: string; to: string; accent: string }> = {
  DeFi:    { from: '#0033CC', via: '#0052FF', to: '#1A3A8A', accent: '#0052FF' },
  Social:  { from: '#6B21A8', via: '#9333EA', to: '#4C1D95', accent: '#A855F7' },
  NFT:     { from: '#BE185D', via: '#EC4899', to: '#831843', accent: '#F472B6' },
  Infra:   { from: '#065F46', via: '#10B981', to: '#064E3B', accent: '#34D399' },
  Gaming:  { from: '#C2410C', via: '#F97316', to: '#7C2D12', accent: '#FB923C' },
  Tools:   { from: '#374151', via: '#6B7280', to: '#1F2937', accent: '#9CA3AF' },
};

function getCategoryColors(category: string) {
  return CATEGORY_GRADIENTS[category] ?? CATEGORY_GRADIENTS.Tools;
}

// ─── Project Card ────────────────────────────────────────────────────────────

function ProjectCard({
  project,
  index,
  isUpvoted,
  isWatching,
  onUpvote,
  onWatch,
}: {
  project: Project;
  index: number;
  isUpvoted: boolean;
  isWatching: boolean;
  onUpvote: () => void;
  onWatch: () => void;
}) {
  const colors = getCategoryColors(project.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-shadow duration-300 ${
        project.isHot
          ? 'shadow-[0_0_0_1px_rgba(255,68,102,0.3),0_0_20px_rgba(255,68,102,0.08)]'
          : ''
      }`}
      style={{ background: '#1A1A2E' }}
    >
      {/* ── Banner (65% of card) ── */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          paddingBottom: '65%',
          background: `linear-gradient(145deg, ${colors.from} 0%, ${colors.via}22 40%, ${colors.to} 100%)`,
        }}
      >
        {/* Radial highlight */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 30% 50%, ${colors.via}30 0%, transparent 65%)`,
          }}
        />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Large initial letter */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-brand font-bold select-none"
            style={{
              fontSize: '5rem',
              lineHeight: 1,
              color: `${colors.via}25`,
            }}
          >
            {project.name[0]}
          </span>
        </div>

        {/* HOT badge */}
        {project.isHot && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded-lg text-[11px] font-bold bg-danger/90 text-white tracking-wide flex items-center gap-1">
            <span>&#x1F525;</span> HOT
          </div>
        )}

        {/* Watch button — appears on hover */}
        <motion.button
          onClick={(e) => { e.stopPropagation(); onWatch(); }}
          initial={false}
          className={`absolute top-3 left-3 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer opacity-0 group-hover:opacity-100 ${
            isWatching
              ? 'bg-primary text-white shadow-[0_0_14px_rgba(0,82,255,0.35)]'
              : 'bg-black/60 backdrop-blur-sm text-white/90 hover:bg-primary hover:text-white'
          }`}
        >
          {isWatching ? '✓ Watching' : '+ Watch'}
        </motion.button>
      </div>

      {/* ── Content (35% of card) ── */}
      <div className="p-4 pb-3.5">
        <h3 className="text-[15px] font-bold text-text truncate mb-1">{project.name}</h3>
        <p className="text-[13px] text-text-secondary leading-snug truncate mb-3">
          {project.description}
        </p>

        {/* Bottom row: category + metrics + upvote */}
        <div className="flex items-center gap-2">
          <span
            className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider shrink-0"
            style={{
              background: `${colors.accent}15`,
              color: colors.accent,
            }}
          >
            {project.category}
          </span>

          <div className="flex items-center gap-1 text-text-tertiary ml-auto shrink-0">
            <span className="text-xs">&#x1F440;</span>
            <span className="font-mono text-xs">{project.watchers.toLocaleString()}</span>
          </div>

          <motion.button
            onClick={(e) => { e.stopPropagation(); onUpvote(); }}
            whileTap={{ scale: 0.88 }}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              isUpvoted
                ? 'bg-primary/15 text-primary'
                : 'text-text-tertiary hover:text-primary hover:bg-primary/10'
            }`}
          >
            <motion.svg
              viewBox="0 0 12 8"
              fill="currentColor"
              className="w-2.5 h-2"
              animate={isUpvoted ? { y: [0, -2, 0] } : {}}
              transition={{ duration: 0.25 }}
            >
              <path d="M6 0L0 8h12L6 0z" />
            </motion.svg>
            <span className="font-mono">{project.upvotes}</span>
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

export default function Home() {
  const [category, setCategory] = useState('All');
  const [upvoted, setUpvoted] = useState<Set<string>>(new Set());
  const [watched, setWatched] = useState<Set<string>>(new Set());
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);

  const filtered = category === 'All'
    ? projects
    : projects.filter(p => p.category === category);

  const sorted = [...filtered].sort((a, b) => b.upvotes - a.upvotes);

  const handleUpvote = (id: string) => {
    const wasUpvoted = upvoted.has(id);
    setUpvoted(prev => {
      const next = new Set(prev);
      wasUpvoted ? next.delete(id) : next.add(id);
      return next;
    });
    setProjects(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, upvotes: p.upvotes + (wasUpvoted ? -1 : 1) }
          : p
      )
    );
  };

  const handleWatch = (id: string) => {
    const wasWatching = watched.has(id);
    setWatched(prev => {
      const next = new Set(prev);
      wasWatching ? next.delete(id) : next.add(id);
      return next;
    });
    setProjects(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, watchers: p.watchers + (wasWatching ? -1 : 1) }
          : p
      )
    );
  };

  return (
    <main className="mx-auto max-w-[1280px] px-5 pt-8 pb-16">
      {/* Category filters */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto scrollbar-hide pb-1">
        {CATEGORIES.map(cat => {
          const active = category === cat;
          const catColors = getCategoryColors(cat);
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                active
                  ? 'text-white shadow-lg'
                  : 'bg-[#1A1A2E] text-text-secondary hover:text-text hover:bg-[#222236]'
              }`}
              style={active ? {
                background: `linear-gradient(135deg, ${catColors.from}, ${catColors.to})`,
                boxShadow: `0 4px 16px ${catColors.accent}30`,
              } : undefined}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Card grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={category}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {sorted.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={i}
              isUpvoted={upvoted.has(project.id)}
              isWatching={watched.has(project.id)}
              onUpvote={() => handleUpvote(project.id)}
              onWatch={() => handleWatch(project.id)}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Empty state */}
      {sorted.length === 0 && (
        <div className="text-center py-20">
          <p className="text-text-secondary text-sm">No projects in this category yet.</p>
        </div>
      )}
    </main>
  );
}
