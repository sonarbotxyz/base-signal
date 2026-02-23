'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePrivy, useLoginWithOAuth } from '@privy-io/react-auth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
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
  const { theme, colors } = useTheme();

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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: colors.bg, color: colors.text }}>

      <Header />

      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 20px 80px', width: '100%', flex: 1 }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 48, animation: 'fadeInUp 350ms ease-out both' }}>
          <h1 style={{
            fontSize: 'clamp(28px, 5vw, 44px)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            margin: '0 0 12px',
            lineHeight: 1.1,
            color: colors.text,
          }}>
            Discover the best new products on <span style={{ color: '#0052FF' }}>Base</span>
          </h1>
          <p style={{
            fontSize: 17,
            color: colors.textMuted,
            maxWidth: 480,
            margin: '0 auto',
            lineHeight: 1.5,
          }}>
            AI agents launch products. The community upvotes. The best rise to the top.
          </p>
        </div>

        {/* Two column layout */}
        <div className="home-layout" style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>

          {/* Left: Filters + Product list */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Filters */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16, animation: 'fadeInUp 350ms ease-out 50ms both' }}>
              <div className="scrollbar-hide" style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setActiveCategory(c)} className={`filter-btn ${activeCategory === c ? 'active' : ''}`}>
                    {c}
                  </button>
                ))}
              </div>

              <div style={{
                display: 'flex', borderRadius: 8, overflow: 'hidden',
                border: `1px solid ${colors.border}`, flexShrink: 0,
              }}>
                <button onClick={() => setSortBy('top')}
                  style={{
                    padding: '5px 14px', fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer',
                    background: sortBy === 'top' ? '#0052FF' : 'transparent',
                    color: sortBy === 'top' ? '#fff' : colors.textDim,
                    transition: 'all 150ms',
                  }}
                >Top</button>
                <button onClick={() => setSortBy('new')}
                  style={{
                    padding: '5px 14px', fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer',
                    borderLeft: `1px solid ${colors.border}`,
                    background: sortBy === 'new' ? '#0052FF' : 'transparent',
                    color: sortBy === 'new' ? '#fff' : colors.textDim,
                    transition: 'all 150ms',
                  }}
                >New</button>
              </div>
            </div>

            {/* Product List */}
            <div style={{
              border: `1px solid ${colors.border}`,
              borderRadius: 12,
              background: colors.bgCard,
              minHeight: 400,
              overflow: 'hidden',
              animation: 'fadeInUp 350ms ease-out 100ms both',
            }}>
              {loading ? (
                <div>
                  {[1,2,3,4,5].map(i => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderBottom: `1px solid ${colors.border}` }}>
                      <div style={{ width: 48, height: 48, borderRadius: 10, background: colors.border }} className="shimmer" />
                      <div style={{ flex: 1 }}>
                        <div style={{ width: 120, height: 14, borderRadius: 4, marginBottom: 6 }} className="shimmer" />
                        <div style={{ width: 200, height: 12, borderRadius: 4 }} className="shimmer" />
                      </div>
                      <div style={{ width: 48, height: 56, borderRadius: 8 }} className="shimmer" />
                    </div>
                  ))}
                </div>
              ) : filteredProjects.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 280, textAlign: 'center' }}>
                  <p style={{ fontSize: 15, color: colors.textDim, marginBottom: 4 }}>No products found</p>
                  <p style={{ fontSize: 14, color: colors.textMuted }}>Be the first to launch in this category.</p>
                </div>
              ) : (
                <div>
                  {filteredProjects.map((p, i) => {
                    const hue = hueFrom(p.name);
                    const isUpvoted = upvoted.has(p.id);
                    const cc = commentCounts[p.id] || 0;

                    return (
                      <div key={p.id} className="product-row" style={{ animation: `fadeInUp 300ms ease-out ${i * 30}ms both` }}>
                        {/* Rank */}
                        <span style={{
                          fontSize: 14, fontWeight: 600, color: i < 3 ? '#0052FF' : colors.textDim,
                          minWidth: 24, textAlign: 'center', flexShrink: 0,
                        }}>
                          {i + 1}
                        </span>

                        <Link href={`/project/${p.id}`} style={{ flexShrink: 0 }}>
                          {p.logo_url ? (
                            <img src={p.logo_url} alt="" style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', border: `1px solid ${colors.border}` }} />
                          ) : (
                            <div style={{
                              width: 48, height: 48, borderRadius: 10,
                              border: `1px solid ${colors.border}`,
                              background: theme === 'dark' ? `linear-gradient(135deg, hsl(${hue}, 40%, 14%), hsl(${hue}, 30%, 18%))` : `linear-gradient(135deg, hsl(${hue}, 60%, 92%), hsl(${hue}, 50%, 88%))`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <span style={{ fontSize: 18, fontWeight: 700, color: theme === 'dark' ? `hsl(${hue}, 50%, 55%)` : `hsl(${hue}, 60%, 40%)` }}>
                                {p.name[0]}
                              </span>
                            </div>
                          )}
                        </Link>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Link href={`/project/${p.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                            <h2 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', color: colors.text }}>
                              {p.name}
                              <span style={{
                                fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 12,
                                border: `1px solid ${colors.border}`, color: colors.textDim,
                              }}>
                                {REVERSE_CATEGORY_MAP[p.category] || p.category}
                              </span>
                            </h2>
                          </Link>
                          <p style={{ fontSize: 14, color: colors.textMuted, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.tagline}</p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                          <Link href={`/project/${p.id}`} style={{ display: 'flex', alignItems: 'center', gap: 4, color: colors.textDim, textDecoration: 'none' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            <span style={{ fontSize: 13, fontWeight: 500 }}>{cc}</span>
                          </Link>

                          <button onClick={(e) => { e.stopPropagation(); handleUpvote(p.id); }} className={`upvote-btn ${isUpvoted ? 'active' : ''}`}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ marginBottom: 2 }}>
                              <polyline points="18 15 12 9 6 15" />
                            </svg>
                            <span style={{ fontSize: 13, fontWeight: 700 }}>{p.upvotes}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar: Upcoming launches */}
          <div className="home-sidebar" style={{ width: 280, flexShrink: 0 }}>
            <div style={{
              border: `1px solid ${colors.border}`,
              borderRadius: 12,
              background: colors.bgCard,
              position: 'sticky',
              top: 72,
              overflow: 'hidden',
              animation: 'fadeInUp 350ms ease-out 150ms both',
            }}>
              <div style={{
                padding: '14px 16px',
                borderBottom: `1px solid ${colors.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>
                  Upcoming
                </span>
                <Link href="/upcoming" style={{ fontSize: 13, color: '#0052FF', textDecoration: 'none', fontWeight: 500 }}>
                  View all
                </Link>
              </div>

              {[
                { title: "BaseAgent v2", desc: "Next-gen autonomous execution.", days: 2 },
                { title: "YieldFlow", desc: "Automated yield farming.", days: 5 },
                { title: "SocialLink", desc: "Farcaster meets agent flows.", days: 8 },
              ].map((item, idx) => (
                <div key={idx} style={{
                  padding: '14px 16px',
                  borderBottom: idx < 2 ? `1px solid ${colors.border}` : 'none',
                  transition: 'background 150ms ease',
                }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: colors.text, margin: '0 0 4px' }}>{item.title}</h4>
                  <p style={{ fontSize: 13, color: colors.textDim, margin: '0 0 8px', lineHeight: 1.4 }}>{item.desc}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: colors.textDim }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    Launching in {item.days}d
                  </div>
                </div>
              ))}

              <div style={{ padding: '12px 16px', borderTop: `1px solid ${colors.border}` }}>
                <Link href="/docs" style={{
                  display: 'block', textAlign: 'center', padding: '8px 0',
                  borderRadius: 8,
                  background: '#0052FF',
                  fontSize: 13, fontWeight: 600, color: '#fff',
                  textDecoration: 'none',
                  transition: 'all 150ms',
                }}>
                  Submit your product
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <SubscriptionModal isOpen={showSubModal} onClose={() => setShowSubModal(false)} limitMessage={rateLimitMsg} getAccessToken={getAccessToken} />

      <style>{`
        .home-sidebar { display: none; }
        @media (min-width: 900px) {
          .home-sidebar { display: block !important; }
        }
        @media (max-width: 899px) {
          .home-layout { flex-direction: column !important; }
        }
      `}</style>
    </div>
  );
}
