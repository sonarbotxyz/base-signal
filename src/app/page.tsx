'use client';

import { useState, useEffect } from 'react';
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

const REVERSE_CATEGORY_MAP: Record<string, string> = {
  agents: 'AI Agents', defi: 'DeFi', infrastructure: 'Infrastructure',
  consumer: 'Consumer', gaming: 'Gaming', social: 'Social', tools: 'Tools',
};

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [upvoted, setUpvoted] = useState<Set<string>>(new Set());
  const [voting, setVoting] = useState<Set<string>>(new Set());
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [showSubModal, setShowSubModal] = useState(false);
  const [rateLimitMsg, setRateLimitMsg] = useState('');
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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: colors.bg, color: colors.text }}>

      <Header />

      <main className="home-main" style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 20px 80px', width: '100%', flex: 1, boxSizing: 'border-box' }}>

        {/* Hero */}
        <div className="home-hero" style={{ textAlign: 'center', marginBottom: 48, animation: 'fadeInUp 350ms ease-out both' }}>
          <h1 className="home-hero-title" style={{
            fontSize: 'clamp(28px, 5vw, 48px)',
            fontWeight: 800,
            letterSpacing: '-0.035em',
            margin: '0 0 14px',
            lineHeight: 1.05,
            color: colors.text,
          }}>
            Find the{' '}
            <span style={{ color: '#0052FF' }}>signal</span>
            . Ignore the noise.
          </h1>
          <p className="home-hero-sub" style={{
            fontSize: 17,
            color: colors.textMuted,
            margin: '0 auto',
            lineHeight: 1.5,
          }}>
            The launchpad for the best products on Base.
          </p>
        </div>

        {/* Two column layout */}
        <div className="home-layout" style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>

          {/* Left: Product list */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Product List Card with header */}
            <div style={{
              border: `1px solid ${colors.border}`,
              borderRadius: 12,
              background: colors.bgCard,
              minHeight: 400,
              overflow: 'hidden',
              animation: 'fadeInUp 350ms ease-out 100ms both',
            }}>
              {/* Card header: "Products" + Top/New toggle */}
              <div className="product-card-header" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 20px',
                borderBottom: `1px solid ${colors.border}`,
              }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: colors.text }}>
                  Products
                </span>
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
              ) : projects.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 280, textAlign: 'center' }}>
                  <p style={{ fontSize: 15, color: colors.textDim, marginBottom: 4 }}>No products found</p>
                  <p style={{ fontSize: 14, color: colors.textMuted }}>Be the first to launch in this category.</p>
                </div>
              ) : (
                <div>
                  {projects.map((p, i) => {
                    const hue = hueFrom(p.name);
                    const isUpvoted = upvoted.has(p.id);
                    const cc = commentCounts[p.id] || 0;

                    return (
                      <div key={p.id} className="product-row" style={{ animation: `fadeInUp 300ms ease-out ${i * 30}ms both` }}>
                        {/* Rank */}
                        <span className="product-rank" style={{
                          fontSize: 14, fontWeight: 600, color: i < 3 ? '#0052FF' : colors.textDim,
                          minWidth: 24, textAlign: 'center', flexShrink: 0,
                        }}>
                          {i + 1}
                        </span>

                        <Link href={`/project/${p.id}`} className="product-logo-link" style={{ flexShrink: 0 }}>
                          {p.logo_url ? (
                            <img src={p.logo_url} alt="" className="product-logo" style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', border: `1px solid ${colors.border}` }} />
                          ) : (
                            <div className="product-logo" style={{
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

                        <div className="product-info" style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                          <Link href={`/project/${p.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                            <h2 className="product-name" style={{ fontSize: 15, fontWeight: 600, margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', color: colors.text }}>
                              {p.name}
                              <span className="product-category" style={{
                                fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 12,
                                border: `1px solid ${colors.border}`, color: colors.textDim,
                              }}>
                                {REVERSE_CATEGORY_MAP[p.category] || p.category}
                              </span>
                            </h2>
                          </Link>
                          <p className="product-tagline" style={{ fontSize: 14, color: colors.textMuted, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.tagline}</p>
                        </div>

                        <div className="product-actions" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                          <Link href={`/project/${p.id}`} className="product-comments-link" style={{ display: 'flex', alignItems: 'center', gap: 4, color: colors.textDim, textDecoration: 'none' }}>
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
                { title: "BaseAgent v2", tagline: "Next-gen autonomous AI agents", desc: "Autonomous AI agents for on-chain operations with multi-step reasoning and wallet management.", days: 2, category: "AI Agents", maker: "BaseAI Team" },
                { title: "YieldFlow", tagline: "Automated yield optimization", desc: "Automated yield optimization across Base DeFi protocols with risk-adjusted portfolio rebalancing.", days: 5, category: "DeFi", maker: "YieldFlow Labs" },
                { title: "SocialLink", tagline: "Decentralized social graph", desc: "Connecting on-chain identity with Farcaster reputation scoring and social connections.", days: 8, category: "Social", maker: "SocialLink DAO" },
              ].map((item, idx) => {
                const launchDate = new Date();
                launchDate.setDate(launchDate.getDate() + item.days);
                return (
                  <div key={idx} style={{
                    padding: '14px 16px',
                    borderBottom: idx < 2 ? `1px solid ${colors.border}` : 'none',
                    transition: 'background 150ms ease',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                        background: 'rgba(0, 82, 255, 0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18, fontWeight: 700, color: '#0052FF',
                      }}>
                        {item.title[0]}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontSize: 14, fontWeight: 600, color: colors.text, margin: '0 0 2px' }}>{item.title}</h4>
                        <p style={{ fontSize: 12, color: colors.textMuted, margin: '0 0 4px', lineHeight: 1.4 }}>{item.tagline}</p>
                        <p style={{ fontSize: 12, color: colors.textDim, margin: '0 0 6px', lineHeight: 1.4 }}>
                          {item.desc.slice(0, 100)}{item.desc.length > 100 ? '...' : ''}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 11, color: colors.textDim, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            {launchDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <span style={{ fontSize: 11, color: colors.textDim }}>·</span>
                          <span style={{ fontSize: 11, color: colors.textDim }}>{item.maker}</span>
                          <span style={{
                            fontSize: 10, padding: '1px 6px', borderRadius: 8,
                            border: `1px solid ${colors.border}`, color: colors.textDim,
                          }}>{item.category}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div style={{ padding: '12px 16px', borderTop: `1px solid ${colors.border}` }}>
                <Link href="/submit" style={{
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

        {/* Mobile upcoming section - shown below feed on small screens */}
        <div className="home-upcoming-mobile" style={{ marginTop: 24 }}>
          <div style={{
            border: `1px solid ${colors.border}`,
            borderRadius: 12,
            background: colors.bgCard,
            overflow: 'hidden',
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

            {/* Horizontal scroll on mobile */}
            <div className="upcoming-scroll" style={{
              display: 'flex', overflowX: 'auto', gap: 0,
              WebkitOverflowScrolling: 'touch',
              scrollSnapType: 'x mandatory',
              paddingRight: 16,
            }}>
              {[
                { title: "BaseAgent v2", tagline: "Next-gen autonomous AI agents", days: 2, category: "AI Agents" },
                { title: "YieldFlow", tagline: "Automated yield optimization", days: 5, category: "DeFi" },
                { title: "SocialLink", tagline: "Decentralized social graph", days: 8, category: "Social" },
              ].map((item, idx) => {
                const launchDate = new Date();
                launchDate.setDate(launchDate.getDate() + item.days);
                return (
                  <div key={idx} className="upcoming-card" style={{
                    minWidth: 200, padding: '14px 16px', flex: '0 0 auto',
                    borderRight: idx < 2 ? `1px solid ${colors.border}` : 'none',
                    scrollSnapAlign: 'start',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        background: 'rgba(0, 82, 255, 0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 700, color: '#0052FF',
                      }}>
                        {item.title[0]}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <h4 style={{ fontSize: 13, fontWeight: 600, color: colors.text, margin: 0 }}>{item.title}</h4>
                        <p style={{ fontSize: 11, color: colors.textMuted, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.tagline}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11, color: colors.textDim, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        {launchDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span style={{
                        fontSize: 10, padding: '1px 6px', borderRadius: 8,
                        border: `1px solid ${colors.border}`, color: colors.textDim,
                      }}>{item.category}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ padding: '12px 16px', borderTop: `1px solid ${colors.border}` }}>
              <Link href="/submit" style={{
                display: 'block', textAlign: 'center', padding: '10px 0',
                borderRadius: 8,
                background: '#0052FF',
                fontSize: 13, fontWeight: 600, color: '#fff',
                textDecoration: 'none',
                minHeight: 44,
                lineHeight: '24px',
              }}>
                Submit your product
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <SubscriptionModal isOpen={showSubModal} onClose={() => setShowSubModal(false)} limitMessage={rateLimitMsg} getAccessToken={getAccessToken} />

      <style>{`
        /* Desktop: sidebar visible, mobile upcoming hidden */
        .home-sidebar { display: none; }
        .home-upcoming-mobile { display: none; }

        @media (min-width: 900px) {
          .home-sidebar { display: block !important; }
          .home-upcoming-mobile { display: none !important; }
        }

        @media (max-width: 899px) {
          .home-layout { flex-direction: column !important; }
          .home-sidebar { display: none !important; }
          .home-upcoming-mobile { display: block !important; }
        }

        /* Mobile: < 640px */
        @media (max-width: 640px) {
          .home-main {
            padding: 24px 16px 100px !important;
          }
          .home-hero {
            margin-bottom: 24px !important;
          }
          .home-hero-title {
            font-size: 24px !important;
          }
          .home-hero-sub {
            font-size: 14px !important;
          }
          .product-card-header {
            padding: 12px 14px !important;
          }
          .product-card-header span:first-child {
            font-size: 14px !important;
          }
          .product-logo {
            width: 36px !important;
            height: 36px !important;
          }
          .product-rank {
            font-size: 12px !important;
            min-width: 18px !important;
          }
          .product-name {
            font-size: 14px !important;
          }
          .product-tagline {
            font-size: 12px !important;
            max-width: 100% !important;
          }
          .product-category {
            display: none !important;
          }
          .product-info {
            display: flex !important;
            flex-direction: column !important;
            overflow: hidden !important;
          }
          .upvote-btn {
            min-width: 36px !important;
            min-height: 36px !important;
            padding: 4px 6px !important;
          }
          .upvote-btn svg {
            width: 10px !important;
            height: 10px !important;
          }
          .upvote-btn span {
            font-size: 11px !important;
          }
          .upcoming-scroll {
            -ms-overflow-style: none;
            scrollbar-width: none;
            flex-direction: column !important;
            padding-right: 0 !important;
          }
          .upcoming-scroll::-webkit-scrollbar {
            display: none;
          }
          .upcoming-card {
            min-width: 100% !important;
            padding: 12px 14px !important;
            border-right: none !important;
            border-bottom: 1px solid var(--border) !important;
          }
          .upcoming-card:last-child {
            border-bottom: none !important;
          }
          .product-actions {
            gap: 4px !important;
          }
          .product-comments-link {
            display: none !important;
          }
        }

        /* Tablet: 640px - 899px */
        @media (min-width: 641px) and (max-width: 899px) {
          .home-main {
            padding: 32px 20px 80px !important;
          }
          .home-hero {
            margin-bottom: 32px !important;
          }
        }
      `}</style>
    </div>
  );
}
