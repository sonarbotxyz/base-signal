'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, ChevronUp, Flame } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  upvotes: number;
  watchers: number;
  isHot: boolean;
}

// ─── Category Colors ─────────────────────────────────────────────────────────

export const CATEGORY_GRADIENTS: Record<string, { from: string; via: string; to: string; accent: string }> = {
  DeFi:       { from: '#0033CC', via: '#0052FF', to: '#1A3A8A', accent: '#0052FF' },
  Social:     { from: '#6B21A8', via: '#9333EA', to: '#4C1D95', accent: '#A855F7' },
  NFT:        { from: '#BE185D', via: '#EC4899', to: '#831843', accent: '#F472B6' },
  Infra:      { from: '#065F46', via: '#10B981', to: '#064E3B', accent: '#34D399' },
  Gaming:     { from: '#C2410C', via: '#F97316', to: '#7C2D12', accent: '#FB923C' },
  Tools:      { from: '#374151', via: '#6B7280', to: '#1F2937', accent: '#9CA3AF' },
  'AI Agents': { from: '#6D28D9', via: '#8B5CF6', to: '#4C1D95', accent: '#A78BFA' },
};

export function getCategoryColors(category: string) {
  return CATEGORY_GRADIENTS[category] ?? CATEGORY_GRADIENTS.Tools;
}

// ─── Noise texture SVG data URI ──────────────────────────────────────────────

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`;

// Generate slight hue shift from project ID for visual variety
function idHueShift(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) * 31 + ((hash << 5) - hash);
  }
  return (Math.abs(hash) % 20) - 10; // -10 to +10 degree shift
}

// ─── Project Card ────────────────────────────────────────────────────────────

export function ProjectCard({
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
  onUpvote: (e: React.MouseEvent) => void;
  onWatch: (e: React.MouseEvent) => void;
}) {
  const colors = getCategoryColors(project.category);
  const hueShift = idHueShift(project.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative"
    >
      <Link
        href={`/project/${project.id}`}
        className="block rounded-2xl overflow-hidden no-underline transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] group-hover:shadow-lg"
        style={{
          background: '#16161A',
          boxShadow: project.isHot
            ? `0 0 0 1px rgba(255,68,102,0.2), 0 0 20px rgba(255,68,102,0.06)`
            : undefined,
        }}
      >
        {/* ── Banner (65% aspect) ── */}
        <div
          className="relative w-full overflow-hidden"
          style={{
            paddingBottom: '62%',
            background: `linear-gradient(${145 + hueShift}deg, ${colors.from} 0%, ${colors.via}22 40%, ${colors.to} 100%)`,
          }}
        >
          {/* Radial highlight */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at ${30 + hueShift}% 50%, ${colors.via}30 0%, transparent 65%)`,
            }}
          />

          {/* Noise texture overlay */}
          <div
            className="absolute inset-0 opacity-60 mix-blend-overlay"
            style={{ backgroundImage: NOISE_SVG, backgroundSize: '128px 128px' }}
          />

          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '20px 20px',
            }}
          />

          {/* Large initial letter (watermark) */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="font-brand font-bold select-none"
              style={{
                fontSize: 'clamp(3.5rem, 8vw, 5rem)',
                lineHeight: 1,
                color: `${colors.via}20`,
              }}
            >
              {project.name[0]}
            </span>
          </div>

          {/* HOT badge - Flame icon, no emoji */}
          {project.isHot && (
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold bg-danger/90 text-white tracking-wide">
              <Flame className="w-3 h-3" />
              HOT
            </div>
          )}

          {/* Category badge */}
          <div className="absolute top-2.5 left-2.5">
            <span
              className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm"
              style={{ background: `${colors.accent}25`, color: colors.accent }}
            >
              {project.category}
            </span>
          </div>

          {/* Watch button - visible on hover (desktop) or always (mobile) */}
          <button
            onClick={onWatch}
            className={`absolute bottom-2.5 right-2.5 flex items-center gap-1.5 px-3.5 py-2 sm:px-3 sm:py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer opacity-100 md:opacity-0 md:group-hover:opacity-100 ${
              isWatching
                ? 'bg-primary text-white shadow-[0_0_14px_rgba(0,82,255,0.35)]'
                : 'bg-black/60 backdrop-blur-sm text-white/90 hover:bg-primary hover:text-white'
            }`}
          >
            <Eye className="w-3 h-3" />
            {isWatching ? 'Watching' : 'Watch'}
          </button>
        </div>

        {/* ── Content (35%) ── */}
        <div className="p-4 pb-3.5">
          <h3 className="text-[15px] font-bold text-text truncate mb-1">{project.name}</h3>
          <p className="text-[13px] text-text-secondary leading-snug truncate mb-3">
            {project.description}
          </p>

          {/* Bottom row: subcategory + watchers + upvote */}
          <div className="flex items-center gap-2">
            {project.subcategory && (
              <span className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider">
                {project.subcategory}
              </span>
            )}

            <div className="flex items-center gap-1 text-text-tertiary ml-auto shrink-0">
              <Eye className="w-3 h-3" />
              <span className="font-mono text-xs">{project.watchers.toLocaleString()}</span>
            </div>

            <button
              onClick={onUpvote}
              className={`inline-btn flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                isUpvoted
                  ? 'bg-primary/15 text-primary'
                  : 'text-text-tertiary hover:text-primary hover:bg-primary/10'
              }`}
            >
              <ChevronUp className="w-3 h-3" />
              <span className="font-mono">{project.upvotes}</span>
            </button>
          </div>
        </div>
      </Link>

      {/* Hover glow border */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          boxShadow: `0 8px 40px ${colors.accent}10, 0 0 0 1px ${colors.accent}12`,
        }}
      />
    </motion.div>
  );
}
