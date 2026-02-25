'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Layers, Coins, Users, Cpu, Gamepad2, Wrench,
  Clock, ArrowUpRight, ChevronRight, Eye, Flame, Rocket,
  Bell, BarChart3,
} from 'lucide-react';
import { ProjectCard, getCategoryColors } from '@/components/ProjectCard';
import type { Project } from '@/components/ProjectCard';

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_PROJECTS: Project[] = [
  {
    id: '1', name: 'Aerodrome Finance',
    description: 'The central trading and liquidity marketplace on Base',
    category: 'DeFi', subcategory: 'DEX', upvotes: 847, watchers: 2341, isHot: true,
  },
  {
    id: '2', name: 'Morpho',
    description: 'Permissionless lending protocol optimizing interest rates across DeFi',
    category: 'DeFi', subcategory: 'Lending', upvotes: 623, watchers: 1856, isHot: true,
  },
  {
    id: '3', name: 'Farcaster',
    description: 'Sufficiently decentralized social network protocol on Base',
    category: 'Social', subcategory: 'Protocol', upvotes: 512, watchers: 3102, isHot: false,
  },
  {
    id: '4', name: 'Seamless Protocol',
    description: 'Native lending and borrowing on Base with integrated leverage',
    category: 'DeFi', subcategory: 'Lending', upvotes: 389, watchers: 1204, isHot: false,
  },
  {
    id: '5', name: 'BaseSwap',
    description: 'Community-driven DEX with yield farming and NFT marketplace',
    category: 'DeFi', subcategory: 'DEX', upvotes: 298, watchers: 967, isHot: false,
  },
  {
    id: '6', name: 'Degen Chain',
    description: 'High-performance L3 built on Base for the Degen community',
    category: 'Infra', subcategory: 'L3', upvotes: 276, watchers: 1543, isHot: true,
  },
  {
    id: '7', name: 'Moonwell',
    description: 'Open lending and borrowing DeFi protocol with transparent governance',
    category: 'DeFi', subcategory: 'Lending', upvotes: 234, watchers: 812, isHot: false,
  },
  {
    id: '8', name: 'Brett',
    description: "Base's blue mascot memecoin powering the ecosystem community",
    category: 'Social', subcategory: 'Meme', upvotes: 198, watchers: 2876, isHot: false,
  },
  {
    id: '9', name: 'Zora',
    description: 'Create, collect, and earn on the open internet',
    category: 'NFT', subcategory: 'Marketplace', upvotes: 167, watchers: 1089, isHot: false,
  },
  {
    id: '10', name: 'BasePaint',
    description: 'Collaborative pixel art canvas minted daily as NFTs on Base',
    category: 'NFT', subcategory: 'Art', upvotes: 143, watchers: 654, isHot: false,
  },
];

const UPCOMING_PREVIEW = [
  { id: 'baseagent-v2', name: 'BaseAgent v2', category: 'AI Agents', daysLeft: 2, watchers: 1247 },
  { id: 'yieldflow', name: 'YieldFlow', category: 'DeFi', daysLeft: 4, watchers: 892 },
  { id: 'sociallink', name: 'SocialLink', category: 'Social', daysLeft: 9, watchers: 1563 },
];

const CATEGORIES = [
  { key: 'All', label: 'All', icon: Layers },
  { key: 'DeFi', label: 'DeFi', icon: Coins },
  { key: 'Social', label: 'Social', icon: Users },
  { key: 'NFT', label: 'NFT', icon: Gamepad2 },
  { key: 'Infra', label: 'Infra', icon: Cpu },
  { key: 'Gaming', label: 'Gaming', icon: Gamepad2 },
  { key: 'Tools', label: 'Tools', icon: Wrench },
] as const;

// ─── Featured Project Card ──────────────────────────────────────────────────

function FeaturedCard({ project }: { project: Project }) {
  const colors = getCategoryColors(project.category);

  return (
    <Link
      href={`/project/${project.id}`}
      className="block no-underline"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative rounded-2xl overflow-hidden group transition-all duration-300 hover:-translate-y-1"
        style={{ background: '#16161A' }}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Banner side */}
          <div
            className="relative w-full sm:w-[45%] min-h-[180px] sm:min-h-[220px]"
            style={{
              background: `linear-gradient(145deg, ${colors.from} 0%, ${colors.via}22 40%, ${colors.to} 100%)`,
            }}
          >
            <div
              className="absolute inset-0"
              style={{ background: `radial-gradient(ellipse at 30% 50%, ${colors.via}30 0%, transparent 65%)` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-brand font-bold select-none" style={{ fontSize: '6rem', lineHeight: 1, color: `${colors.via}18` }}>
                {project.name[0]}
              </span>
            </div>
            {project.isHot && (
              <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold bg-danger/90 text-white">
                <Flame className="w-3 h-3" />
                HOT
              </div>
            )}
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider" style={{ background: `${colors.accent}20`, color: colors.accent }}>
                Featured
              </span>
            </div>
          </div>

          {/* Content side */}
          <div className="flex-1 p-5 sm:p-6 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider" style={{ background: `${colors.accent}15`, color: colors.accent }}>
                {project.category}
              </span>
              <span className="text-[10px] text-text-tertiary uppercase tracking-wider">{project.subcategory}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-text mb-2">{project.name}</h2>
            <p className="text-sm text-text-secondary leading-relaxed mb-4">
              {project.description}
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-text-secondary">
                <Eye className="w-3.5 h-3.5" />
                <span className="font-mono">{project.watchers.toLocaleString()}</span>
                <span className="text-text-tertiary text-xs">watching</span>
              </div>
              <div className="flex items-center gap-1.5 text-text-secondary">
                <ChevronRight className="w-3.5 h-3.5 rotate-[-90deg]" />
                <span className="font-mono">{project.upvotes}</span>
                <span className="text-text-tertiary text-xs">upvotes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hover glow */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ boxShadow: `0 8px 40px ${colors.accent}10, 0 0 0 1px ${colors.accent}12` }}
        />
      </motion.div>
    </Link>
  );
}

// ─── Sidebar Components ──────────────────────────────────────────────────────

function SidebarUpcoming() {
  return (
    <div className="rounded-xl bg-surface border border-border p-4">
      <div className="flex items-center gap-2 mb-4">
        <Rocket className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-text">Launching Soon</h3>
      </div>
      <div className="flex flex-col gap-3">
        {UPCOMING_PREVIEW.map(project => {
          const colors = getCategoryColors(project.category);
          return (
            <Link
              key={project.id}
              href="/upcoming"
              className="flex items-center gap-3 p-2.5 -mx-1 rounded-lg hover:bg-surface-hover transition-colors no-underline group"
            >
              <div
                className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${colors.from}80, ${colors.to}80)` }}
              >
                <span className="font-brand text-xs font-bold" style={{ color: colors.accent }}>
                  {project.name[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text truncate">{project.name}</p>
                <div className="flex items-center gap-2 text-[11px] text-text-tertiary">
                  <span>{project.category}</span>
                  <span className="w-0.5 h-0.5 rounded-full bg-text-tertiary" />
                  <Eye className="w-3 h-3" />
                  <span className="font-mono">{project.watchers.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Clock className="w-3 h-3 text-text-tertiary" />
                <span className="text-xs font-mono text-text-secondary">{project.daysLeft}d</span>
              </div>
            </Link>
          );
        })}
      </div>
      <Link
        href="/upcoming"
        className="flex items-center justify-center gap-1 mt-3 pt-3 border-t border-border text-xs text-primary font-medium no-underline hover:underline"
      >
        View all upcoming
        <ArrowUpRight className="w-3 h-3" />
      </Link>
    </div>
  );
}

function SidebarStats() {
  return (
    <div className="rounded-xl bg-surface border border-border p-4">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-4 h-4 text-text-tertiary" />
        <h3 className="text-sm font-semibold text-text">Base Ecosystem</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Projects', value: '147' },
          { label: 'This week', value: '+12' },
          { label: 'Watchers', value: '4.2K' },
          { label: 'Signals', value: '892' },
        ].map(stat => (
          <div key={stat.label}>
            <p className="font-mono text-base font-bold text-text">{stat.value}</p>
            <p className="text-[11px] text-text-tertiary">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SidebarSubmitCTA() {
  return (
    <Link
      href="/submit"
      className="block no-underline"
    >
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 hover:bg-primary/10 transition-colors">
        <div className="flex items-center gap-2 mb-2">
          <ArrowUpRight className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-primary">Submit a Project</h3>
        </div>
        <p className="text-xs text-text-secondary leading-relaxed">
          Building on Base? Get your project in front of the community.
        </p>
      </div>
    </Link>
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

  // Featured = first project (highest upvotes)
  const featured = sorted[0];
  const gridProjects = sorted.slice(1);

  const handleUpvote = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const wasUpvoted = upvoted.has(id);
    setUpvoted(prev => {
      const next = new Set(prev);
      wasUpvoted ? next.delete(id) : next.add(id);
      return next;
    });
    setProjects(prev =>
      prev.map(p =>
        p.id === id ? { ...p, upvotes: p.upvotes + (wasUpvoted ? -1 : 1) } : p
      )
    );
  };

  const handleWatch = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const wasWatching = watched.has(id);
    setWatched(prev => {
      const next = new Set(prev);
      wasWatching ? next.delete(id) : next.add(id);
      return next;
    });
    setProjects(prev =>
      prev.map(p =>
        p.id === id ? { ...p, watchers: p.watchers + (wasWatching ? -1 : 1) } : p
      )
    );
  };

  return (
    <main className="mx-auto max-w-[1280px] px-4 sm:px-6 pt-6 sm:pt-8 pb-16">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 sm:mb-10"
      >
        <h1 className="font-brand text-2xl sm:text-3xl font-bold text-text tracking-tight mb-2">
          Discover what&apos;s building on Base
        </h1>
        <p className="text-sm sm:text-base text-text-secondary mb-5 max-w-[500px]">
          Watch projects, track milestones, get notified. Your personal Base radar.
        </p>

        {/* Hero search bar - mobile only (desktop has header search) */}
        <div className="relative md:hidden">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none" />
          <input
            type="text"
            placeholder="Search projects..."
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface border border-border text-base text-text placeholder:text-text-tertiary focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
      </motion.section>

      {/* ── Featured Project ──────────────────────────────────────── */}
      {featured && category === 'All' && (
        <section className="mb-8">
          <FeaturedCard project={featured} />
        </section>
      )}

      {/* ── Category Filter Bar ───────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        {CATEGORIES.map(cat => {
          const active = category === cat.key;
          const catColors = getCategoryColors(cat.key);
          const Icon = cat.icon;
          return (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                active
                  ? 'text-white shadow-lg'
                  : 'bg-surface text-text-secondary hover:text-text hover:bg-surface-hover'
              }`}
              style={active ? {
                background: cat.key === 'All'
                  ? 'linear-gradient(135deg, #0052FF, #0040CC)'
                  : `linear-gradient(135deg, ${catColors.from}, ${catColors.to})`,
                boxShadow: `0 4px 16px ${cat.key === 'All' ? '#0052FF' : catColors.accent}30`,
              } : undefined}
            >
              <Icon className="w-3.5 h-3.5" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* ── Main Layout: Grid + Sidebar ───────────────────────────── */}
      <div className="flex gap-6">
        {/* Card Grid */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={category}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {gridProjects.map((project, i) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={i}
                  isUpvoted={upvoted.has(project.id)}
                  isWatching={watched.has(project.id)}
                  onUpvote={(e) => handleUpvote(project.id, e)}
                  onWatch={(e) => handleWatch(project.id, e)}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {gridProjects.length === 0 && (
            <div className="text-center py-16">
              <p className="text-text-secondary text-sm">No projects in this category yet.</p>
            </div>
          )}
        </div>

        {/* Sidebar - desktop only */}
        <aside className="hidden xl:flex flex-col gap-4 w-[280px] shrink-0">
          <SidebarUpcoming />
          <SidebarStats />
          <SidebarSubmitCTA />
        </aside>
      </div>

      {/* Sidebar content for mobile/tablet - below grid */}
      <div className="xl:hidden mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <SidebarUpcoming />
        <SidebarStats />
        <SidebarSubmitCTA />
      </div>
    </main>
  );
}
