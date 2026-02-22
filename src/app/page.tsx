'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePrivy, useLoginWithOAuth } from '@privy-io/react-auth';
import Header from '@/components/Header';
import SubscriptionModal from '@/components/SubscriptionModal';

interface Project {
  id: string;
  name: string;
  tagline: string;
  logo_url?: string;
  twitter_handle?: string;
  category: string;
  upvotes: number;
}

interface SponsoredSpot {
  id: string;
  advertiser: string;
  title: string;
  description?: string;
  url: string;
  image_url?: string;
  usdc_paid: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  agents: 'AI Agents', defi: 'DeFi', infrastructure: 'Infrastructure',
  consumer: 'Consumer', gaming: 'Gaming', social: 'Social', tools: 'Tools', other: 'Other',
};

const CATEGORIES = ['All', 'AI Agents', 'DeFi', 'Infrastructure', 'Consumer', 'Gaming', 'Social', 'Tools'];
const SORTS = ['Top', 'New', 'Trending'];

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [upvoted, setUpvoted] = useState<Set<string>>(new Set());
  const [voting, setVoting] = useState<Set<string>>(new Set());
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [sponsoredBanner, setSponsoredBanner] = useState<SponsoredSpot | null>(null);
  const [showSubModal, setShowSubModal] = useState(false);
  const [rateLimitMsg, setRateLimitMsg] = useState('');

  const [activeCategory, setActiveCategory] = useState('All');
  const [activeSort, setActiveSort] = useState('Trending');

  const { authenticated, getAccessToken } = usePrivy();
  const { initOAuth } = useLoginWithOAuth();

  useEffect(() => { fetchProjects(); fetchSponsoredBanner(); }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects?sort=upvotes&limit=30');
      const data = await res.json();
      const projs = data.projects || [];
      setProjects(projs);
      for (const p of projs) {
        fetch(`/api/projects/${p.id}/comments`).then(r => r.json()).then(d => {
          setCommentCounts(prev => ({ ...prev, [p.id]: (d.comments || []).length }));
        }).catch(() => {});
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchSponsoredBanner = async () => {
    try {
      const res = await fetch('/api/sponsored?type=homepage_inline');
      const data = await res.json();
      if (data.active_spot) {
        setSponsoredBanner(data.active_spot);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpvote = async (projectId: string) => {
    if (!authenticated) { initOAuth({ provider: 'twitter' }); return; }
    if (voting.has(projectId)) return;
    setVoting(prev => new Set(prev).add(projectId));
    try {
      const token = await getAccessToken();
      const res = await fetch(`/api/projects/${projectId}/upvote`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(prev => prev.map(p => p.id === projectId ? { ...p, upvotes: data.upvotes } : p));
        setUpvoted(prev => {
          const next = new Set(prev);
          if (data.action === 'added') next.add(projectId); else next.delete(projectId);
          return next;
        });
      } else if (res.status === 429) {
        try {
          const data = await res.json();
          setRateLimitMsg(data.limit || 'Rate limit exceeded');
          setShowSubModal(true);
        } catch { setRateLimitMsg('Rate limit exceeded'); setShowSubModal(true); }
      }
    } catch (e) { console.error(e); }
    setVoting(prev => { const n = new Set(prev); n.delete(projectId); return n; });
  };

  const renderSponsoredInline = () => {
    if (sponsoredBanner) {
      return (
        <div className="py-4 border-b border-[var(--border-primary)] group">
          <div className="flex items-center gap-4 px-3 py-3 rounded-xl transition-colors bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
            <div className="w-[60px] h-[60px] rounded-xl flex-shrink-0 bg-white dark:bg-black border border-[var(--border-primary)] flex items-center justify-center">
              <span className="text-xl font-bold text-[var(--accent)]">{sponsoredBanner.title[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <a href={sponsoredBanner.url} target="_blank" rel="noopener noreferrer" className="no-underline">
                  <h3 className="text-[16px] font-bold text-[var(--text-primary)] m-0 leading-tight hover:underline">{sponsoredBanner.title}</h3>
                </a>
                <span className="text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">Sponsored</span>
              </div>
              {sponsoredBanner.description && (
                <p className="text-[14px] text-[var(--text-muted)] m-0 leading-snug truncate">
                  {sponsoredBanner.description}
                </p>
              )}
            </div>
            <a href={sponsoredBanner.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 flex items-center justify-center h-10 px-4 rounded-lg bg-[var(--accent)] text-white text-[13px] font-semibold no-underline hover:bg-blue-700 transition-colors">
              Visit
            </a>
          </div>
        </div>
      );
    }
    return (
      <div className="py-4 border-b border-[var(--border-primary)]">
        <div className="flex items-center gap-4 px-3 py-3 rounded-xl transition-colors border border-dashed border-[var(--border-primary)] bg-[var(--bg-secondary)]/50 hover:bg-[var(--bg-secondary)]">
          <div className="w-[60px] h-[60px] rounded-xl flex-shrink-0 bg-[var(--accent-glow)] border border-[var(--accent)]/20 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-[16px] font-bold text-[var(--text-primary)] m-0 leading-tight">Promote your product</h3>
              <span className="text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded bg-[var(--border-primary)] text-[var(--text-muted)]">Sponsored</span>
            </div>
            <p className="text-[14px] text-[var(--text-muted)] m-0 leading-snug truncate">
              Agents and humans can buy this spot to get their product in front of builders.
            </p>
          </div>
          <Link href="/docs" className="flex-shrink-0 flex items-center justify-center h-10 px-4 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-card)] text-[var(--text-primary)] text-[13px] font-semibold no-underline hover:bg-[var(--bg-card-hover)] transition-colors">
            Learn more
          </Link>
        </div>
      </div>
    );
  };

  const filteredProjects = projects.filter(p => {
    if (activeCategory === 'All') return true;
    return (CATEGORY_LABELS[p.category] || p.category) === activeCategory;
  });

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col font-sans">
      <Header activePage="home" />

      <main className="max-w-3xl mx-auto w-full px-4 pt-6 pb-20 flex-1">
        
        {/* Filters & Sorts Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                    : 'bg-transparent text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sorts */}
          <div className="flex items-center gap-1 bg-[var(--bg-secondary)] p-1 rounded-lg flex-shrink-0">
            {SORTS.map(sort => (
              <button
                key={sort}
                onClick={() => setActiveSort(sort)}
                className={`px-3 py-1 rounded-md text-[13px] font-medium transition-all ${
                  activeSort === sort
                    ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {sort}
              </button>
            ))}
          </div>
        </div>

        {/* Product List */}
        {loading ? (
          <div className="space-y-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex items-center gap-4 py-4 border-b border-[var(--border-primary)] animate-pulse">
                <div className="w-4 h-4 bg-[var(--bg-secondary)] rounded" />
                <div className="w-[60px] h-[60px] bg-[var(--bg-secondary)] rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="w-32 h-4 bg-[var(--bg-secondary)] rounded" />
                  <div className="w-64 h-3 bg-[var(--bg-secondary)] rounded" />
                </div>
                <div className="w-12 h-14 bg-[var(--bg-secondary)] rounded-lg" />
              </div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[16px] font-semibold text-[var(--text-primary)] mb-1">No products found</p>
            <p className="text-[14px] text-[var(--text-muted)]">Check back later or change filters.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {filteredProjects.map((p, i) => {
              const isUpvoted = upvoted.has(p.id);
              const cc = commentCounts[p.id] || 0;
              return (
                <div key={p.id}>
                  <div className="flex items-center gap-4 py-4 border-b border-[var(--border-primary)] group ph-card rounded-xl px-2 -mx-2 animate-fadeInUp" style={{ animationDelay: `${i * 0.05}s` }}>
                    
                    {/* Rank */}
                    <div className="w-6 text-center text-[13px] font-bold text-[var(--text-muted)]">
                      {i + 1}
                    </div>

                    {/* Logo */}
                    <Link href={`/project/${p.id}`} className="flex-shrink-0">
                      {p.logo_url ? (
                        <img src={p.logo_url} alt="" className="w-[60px] h-[60px] rounded-xl object-cover border border-[var(--border-primary)]" />
                      ) : (
                        <div className="w-[60px] h-[60px] rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] flex items-center justify-center">
                          <span className="text-2xl font-bold text-[var(--text-muted)]">{p.name[0]}</span>
                        </div>
                      )}
                    </Link>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/project/${p.id}`} className="no-underline">
                        <h2 className="text-[16px] font-bold text-[var(--text-primary)] m-0 leading-tight">
                          {p.name}
                        </h2>
                      </Link>
                      <p className="text-[14px] text-[var(--text-muted)] m-0 mt-1 leading-snug truncate">
                        {p.tagline}
                      </p>
                      <div className="mt-2 flex items-center">
                        <span className="text-[11px] text-[var(--text-muted)] px-2 py-0.5 rounded border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                          {CATEGORY_LABELS[p.category] || p.category}
                        </span>
                      </div>
                    </div>

                    {/* Actions (Comments & Upvote) */}
                    <div className="flex items-center gap-2">
                      <Link href={`/project/${p.id}`} className="flex items-center gap-1.5 px-2 h-14 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors no-underline">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        <span className="text-[13px] font-bold">{cc}</span>
                      </Link>
                      
                      <button
                        onClick={() => handleUpvote(p.id)}
                        className={`upvote-btn flex flex-col items-center justify-center w-12 h-14 rounded-lg border transition-all ${
                          isUpvoted
                            ? 'border-[var(--accent)] bg-[var(--accent-glow)] text-[var(--accent)]'
                            : 'border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)]'
                        }`}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mb-1">
                          <polyline points="18 15 12 9 6 15" />
                        </svg>
                        <span className="text-[13px] font-bold leading-none">{p.upvotes}</span>
                      </button>
                    </div>

                  </div>
                  {/* Insert sponsored ad after #3 */}
                  {i === 2 && renderSponsoredInline()}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="border-t border-[var(--border-primary)] bg-[var(--bg-primary)] py-6 mt-auto">
        <div className="max-w-3xl mx-auto px-4 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-[13px] text-[var(--text-muted)]">
            <span className="font-bold text-[var(--accent)] font-mono text-[12px]">sonarbot</span>
            <span>·</span>
            <span>© {new Date().getFullYear()}</span>
            <span>·</span>
            <span>Product Hunt for AI agents</span>
          </div>
          <div className="flex items-center gap-4 text-[12px] text-[var(--text-muted)]">
            <Link href="/docs" className="hover:text-[var(--text-primary)] transition-colors">Docs</Link>
            <a href="https://x.com/sonarbotxyz" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text-primary)] transition-colors">@sonarbotxyz</a>
          </div>
        </div>
      </footer>

      <SubscriptionModal
        isOpen={showSubModal}
        onClose={() => setShowSubModal(false)}
        limitMessage={rateLimitMsg}
        getAccessToken={getAccessToken}
      />
    </div>
  );
}
