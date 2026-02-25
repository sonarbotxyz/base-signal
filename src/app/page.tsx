'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

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

function generateHue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) * 47 + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

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
    <main className="mx-auto max-w-[900px] px-5 pt-8 pb-16">
      {/* Category filters */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto scrollbar-hide pb-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3.5 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
              category === cat
                ? 'bg-primary text-white'
                : 'bg-surface border border-border text-text-secondary hover:text-text hover:border-border-light'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Feed list */}
      <div className="flex flex-col gap-1">
        {sorted.map((project, i) => {
          const hue = generateHue(project.name);
          const isUpvoted = upvoted.has(project.id);
          const isWatching = watched.has(project.id);

          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3, ease: 'easeOut' }}
              whileHover={{ y: -2, transition: { duration: 0.15 } }}
              className="flex items-center gap-4 px-4 py-4 rounded-xl border border-transparent hover:border-border hover:bg-surface/40 transition-all group hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)]"
            >
              {/* Rank */}
              <span className="w-6 text-center font-mono text-sm text-text-tertiary shrink-0">
                {i + 1}
              </span>

              {/* Logo placeholder */}
              <div
                className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, hsl(${hue}, 35%, 20%), hsl(${hue}, 30%, 28%))`,
                }}
              >
                <span
                  className="font-brand text-lg font-bold"
                  style={{ color: `hsl(${hue}, 45%, 60%)` }}
                >
                  {project.name[0]}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-[15px] font-semibold text-text truncate">
                    {project.name}
                  </h3>
                  {project.isHot && (
                    <span className="shrink-0 px-1.5 py-0.5 rounded text-[11px] font-semibold bg-danger/10 text-danger leading-none">
                      HOT
                    </span>
                  )}
                </div>
                <p className="text-sm text-text-secondary mt-0.5 truncate">
                  {project.description}
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-surface text-text-tertiary uppercase tracking-wider">
                    {project.category}
                  </span>
                  <span className="text-text-tertiary text-[10px]">&middot;</span>
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-surface text-text-tertiary uppercase tracking-wider">
                    {project.subcategory}
                  </span>
                </div>
              </div>

              {/* Watchers */}
              <div className="hidden sm:flex items-center gap-1.5 text-text-secondary shrink-0">
                <span className="text-sm leading-none">&#x1F440;</span>
                <span className="font-mono text-sm">{project.watchers.toLocaleString()}</span>
              </div>

              {/* Upvote */}
              <motion.button
                onClick={() => handleUpvote(project.id)}
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center gap-0.5 w-14 py-2 rounded-lg border text-center transition-all cursor-pointer shrink-0 ${
                  isUpvoted
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'bg-surface border-border text-text-secondary hover:border-primary/30 hover:text-primary'
                }`}
              >
                <motion.svg
                  viewBox="0 0 12 8"
                  fill="currentColor"
                  className="w-3 h-2"
                  animate={isUpvoted ? { y: [0, -3, 0] } : {}}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <path d="M6 0L0 8h12L6 0z" />
                </motion.svg>
                <span className="font-mono text-[13px] font-medium leading-none">{project.upvotes}</span>
              </motion.button>

              {/* Watch */}
              <motion.button
                onClick={() => handleWatch(project.id)}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer shrink-0 ${
                  isWatching
                    ? 'bg-primary text-white shadow-[0_0_12px_rgba(0,82,255,0.25)]'
                    : 'bg-transparent text-primary border border-primary/25 hover:bg-primary hover:text-white hover:shadow-[0_0_12px_rgba(0,82,255,0.25)]'
                }`}
              >
                {isWatching ? 'Watching' : 'Watch'}
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      {/* Empty state for filtered categories with no results */}
      {sorted.length === 0 && (
        <div className="text-center py-16">
          <p className="text-text-secondary text-sm">No projects in this category yet.</p>
        </div>
      )}
    </main>
  );
}
