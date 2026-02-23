'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePrivy, useLoginWithOAuth } from '@privy-io/react-auth';
import Header from '@/components/Header';
import SubscriptionModal from '@/components/SubscriptionModal';
import { useTheme } from '@/components/ThemeProvider';

interface Project {
  id: string;
  name: string;
  tagline: string;
  logo_url?: string;
  twitter_handle?: string;
  category: string;
  upvotes: number;
}

const CATEGORIES = ['All', 'AI Agents', 'DeFi', 'Infrastructure', 'Consumer', 'Gaming', 'Social', 'Tools'];
const CATEGORY_MAP: Record<string, string> = {
  'AI Agents': 'agents', 'DeFi': 'defi', 'Infrastructure': 'infrastructure',
  'Consumer': 'consumer', 'Gaming': 'gaming', 'Social': 'social', 'Tools': 'tools'
};
const REVERSE_CATEGORY_MAP: Record<string, string> = Object.fromEntries(Object.entries(CATEGORY_MAP).map(([k, v]) => [v, k]));

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [upvoted, setUpvoted] = useState<Set<string>>(new Set());
  const [voting, setVoting] = useState<Set<string>>(new Set());
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [showSubModal, setShowSubModal] = useState(false);
  const [rateLimitMsg, setRateLimitMsg] = useState('');
  
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'top' | 'new'>('top');

  const { authenticated, getAccessToken } = usePrivy();
  const { initOAuth } = useLoginWithOAuth();
  const { theme } = useTheme();

  useEffect(() => { fetchProjects(); }, [sortBy]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const sortParam = sortBy === 'top' ? 'upvotes' : 'newest';
      const res = await fetch(`/api/projects?sort=${sortParam}&limit=30`);
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

  const hueFrom = (s: string) => s.charCodeAt(0) * 7 % 360;

  const filteredProjects = projects.filter(p => activeCategory === 'All' || p.category === CATEGORY_MAP[activeCategory]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="max-w-5xl mx-auto px-5 pt-16 pb-24 w-full flex-1">
        
        {/* Hero Section */}
        <div className="text-center mb-16 animate-[fadeInUp_0.5s_ease-out]">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Discover what's launching on Base
          </h1>
          <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto">
            The launchpad for the next generation of onchain products. AI agents, DeFi protocols, and infrastructure.
          </p>
        </div>

        {/* Filters & Sorting */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 animate-[fadeInUp_0.6s_ease-out]">
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
            {CATEGORIES.map(c => (
              <button 
                key={c} 
                onClick={() => setActiveCategory(c)} 
                className={`filter-btn ${activeCategory === c ? 'active' : ''}`}
              >
                {c}
              </button>
            ))}
          </div>
          
          <div className="flex bg-[var(--bg-card)] rounded-full p-1 border border-[var(--border-primary)] flex-shrink-0 backdrop-blur-xl">
            <button 
              onClick={() => setSortBy('top')} 
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${sortBy === 'top' ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
            >
              Top
            </button>
            <button 
              onClick={() => setSortBy('new')} 
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${sortBy === 'new' ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
            >
              New
            </button>
          </div>
        </div>

        {/* Product List */}
        <div className="glass-card mb-20 min-h-[400px]">
          {loading ? (
            <div>
              {[1,2,3,4,5].map(i => (
                <div key={i} className="flex items-center gap-4 p-5 border-b border-[var(--border-primary)] last:border-0">
                  <div className="w-14 h-14 rounded-xl shimmer" />
                  <div className="flex-1">
                    <div className="w-32 h-5 rounded shimmer mb-2" />
                    <div className="w-64 h-4 rounded shimmer" />
                  </div>
                  <div className="w-14 h-16 rounded-xl shimmer" />
                </div>
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--border-primary)] flex items-center justify-center mb-4 text-2xl">🚀</div>
              <h3 className="text-lg font-semibold mb-1">No products found</h3>
              <p className="text-[var(--text-muted)] text-sm">Be the first to launch in this category.</p>
            </div>
          ) : (
            <div>
              {filteredProjects.map((p, i) => {
                const hue = hueFrom(p.name);
                const isUpvoted = upvoted.has(p.id);
                const cc = commentCounts[p.id] || 0;
                
                return (
                  <div key={p.id} className="product-row" style={{ animationDelay: `${i * 0.05}s` }}>
                    <Link href={`/project/${p.id}`} className="flex-shrink-0">
                      {p.logo_url ? (
                        <img src={p.logo_url} alt="" className="w-14 h-14 rounded-xl object-cover border border-[var(--border-primary)] shadow-sm" />
                      ) : (
                        <div className="w-14 h-14 rounded-xl border border-[var(--border-primary)] shadow-sm flex items-center justify-center"
                             style={{ background: theme === 'dark' ? `linear-gradient(135deg, hsl(${hue}, 40%, 15%), hsl(${hue}, 30%, 20%))` : `linear-gradient(135deg, hsl(${hue}, 60%, 90%), hsl(${hue}, 50%, 85%))` }}>
                          <span className="text-xl font-bold" style={{ color: theme === 'dark' ? `hsl(${hue}, 60%, 65%)` : `hsl(${hue}, 60%, 40%)` }}>
                            {p.name[0]}
                          </span>
                        </div>
                      )}
                    </Link>
                    
                    <div className="flex-1 min-w-0">
                      <Link href={`/project/${p.id}`} className="block group">
                        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-1 flex items-center gap-2 flex-wrap">
                          <span className="group-hover:text-[var(--accent)] transition-colors">{p.name}</span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-[var(--border-primary)] bg-[var(--bg-primary)] text-[var(--text-muted)] tracking-wide">
                            {REVERSE_CATEGORY_MAP[p.category] || p.category}
                          </span>
                        </h2>
                      </Link>
                      <p className="text-sm text-[var(--text-muted)] truncate">{p.tagline}</p>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                      <Link href={`/project/${p.id}`} className="flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors px-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        <span className="text-sm font-semibold">{cc}</span>
                      </Link>
                      
                      <button 
                        onClick={() => handleUpvote(p.id)}
                        className={`upvote-btn ${isUpvoted ? 'active' : ''}`}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mb-1">
                          <polyline points="18 15 12 9 6 15" />
                        </svg>
                        <span className="text-sm font-bold">{p.upvotes}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Section */}
        <div className="mt-16 animate-[fadeInUp_0.8s_ease-out]">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Upcoming Launches</h2>
            <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-[pulse-glow_2s_infinite]"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: "BaseAgent v2", desc: "Next-gen autonomous execution.", days: 2, icon: "🤖" },
              { title: "YieldFlow", desc: "Automated yield farming strategies.", days: 5, icon: "🌊" },
              { title: "SocialLink", desc: "Connect Farcaster with agent flows.", days: 8, icon: "🔗" }
            ].map((item, idx) => (
              <div key={idx} className="glass-card glass-card-hover p-5 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] flex items-center justify-center text-2xl shadow-sm">
                    {item.icon}
                  </div>
                  <div className="px-2.5 py-1 rounded-md bg-[var(--accent-glow)] border border-[var(--accent)] border-opacity-20 text-[var(--accent)] text-xs font-bold tracking-wide uppercase flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    {item.days} Days
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-1.5">{item.title}</h3>
                <p className="text-sm text-[var(--text-muted)] flex-1">{item.desc}</p>
                <div className="mt-4 pt-4 border-t border-[var(--border-primary)]">
                  <button className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors flex items-center gap-1">
                    Notify me <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border-primary)] bg-[var(--bg-card)] mt-auto backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-5 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <span className="font-bold text-[var(--accent)]">sonarbot</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/docs" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Docs</Link>
            <a href="https://x.com/sonarbotxyz" target="_blank" rel="noopener noreferrer" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Twitter</a>
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
