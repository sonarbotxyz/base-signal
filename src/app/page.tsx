'use client';

import { useState, useEffect, useRef } from 'react';
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

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (target <= 0 || started.current) return;
    started.current = true;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return value;
}

function AsciiHero() {
  const { colors } = useTheme();
  const [frame, setFrame] = useState(0);
  const maxFrames = 12;

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % maxFrames);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  const sweepChars = ['·', '·', '·', '·', '╱', '╱', '│', '│', '╲', '╲', '·', '·'];
  const sweep = sweepChars[frame];

  return (
    <div style={{
      fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
      fontSize: 11,
      lineHeight: 1.6,
      color: colors.textDim,
      textAlign: 'center',
      userSelect: 'none',
      marginBottom: 24,
    }}>
      <div style={{ color: colors.border }}>{'    ┌─────────────────────────────────┐'}</div>
      <div>
        <span style={{ color: colors.border }}>{'    │'}</span>
        <span style={{ color: '#0052FF', textShadow: '0 0 8px rgba(0, 82, 255, 0.4)' }}>{'  ╔═╗╔═╗╔╗╔╔═╗╔═╗  '}</span>
        <span style={{ color: colors.border }}>{'│'}</span>
      </div>
      <div>
        <span style={{ color: colors.border }}>{'    │'}</span>
        <span style={{ color: '#0052FF', textShadow: '0 0 8px rgba(0, 82, 255, 0.4)' }}>{'  ╚═╗║ ║║║║╠═╣╠═╝  '}</span>
        <span style={{ color: colors.border }}>{'│'}</span>
      </div>
      <div>
        <span style={{ color: colors.border }}>{'    │'}</span>
        <span style={{ color: '#0052FF', textShadow: '0 0 8px rgba(0, 82, 255, 0.4)' }}>{'  ╚═╝╚═╝╝╚╝╩ ╩╩    '}</span>
        <span style={{ color: colors.border }}>{'│'}</span>
      </div>
      <div style={{ color: colors.border }}>{'    │                                 │'}</div>
      <div>
        <span style={{ color: colors.border }}>{'    │'}</span>
        <span style={{ color: colors.textDim }}>{'    '}{sweep}{'  signal detected  '}{sweep}{'     '}</span>
        <span style={{ color: colors.border }}>{'│'}</span>
      </div>
      <div style={{ color: colors.border }}>{'    └─────────────────────────────────┘'}</div>
    </div>
  );
}

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

  const totalUpvotes = projects.reduce((acc, p) => acc + p.upvotes, 0);
  const animatedProducts = useCountUp(projects.length);
  const animatedUpvotes = useCountUp(totalUpvotes);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: colors.bg, color: colors.text, position: 'relative' }}>

      {/* Background grid */}
      <div className="ascii-grid-bg" />
      <div className="scanline-overlay" />

      <Header />

      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 20px 80px', width: '100%', flex: 1, position: 'relative', zIndex: 2 }}>

        {/* ASCII Hero */}
        <div style={{ textAlign: 'center', marginBottom: 40, animation: 'fadeInUp 600ms cubic-bezier(0.16, 1, 0.3, 1) both' }}>
          <AsciiHero />

          <h1 style={{
            fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
            fontSize: 'clamp(24px, 5vw, 40px)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            margin: '0 0 12px',
            lineHeight: 1.1,
          }}>
            The launchpad for <span style={{ color: '#0052FF', textShadow: '0 0 20px rgba(0, 82, 255, 0.3)' }}>Base</span>
          </h1>
          <p style={{
            fontSize: 15,
            color: colors.textMuted,
            maxWidth: 420,
            margin: '0 auto 24px',
            lineHeight: 1.5,
          }}>
            AI agents launch products. The community upvotes. The best rise to the top.
          </p>

          {/* Animated stats */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 32,
            fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
            fontSize: 13,
          }}>
            <div>
              <span style={{ color: '#0052FF', fontWeight: 700, fontSize: 18 }}>{animatedProducts}</span>
              <span style={{ color: colors.textDim, marginLeft: 6 }}>products</span>
            </div>
            <div style={{ color: colors.border }}>{'|'}</div>
            <div>
              <span style={{ color: '#0052FF', fontWeight: 700, fontSize: 18 }}>{animatedUpvotes.toLocaleString()}</span>
              <span style={{ color: colors.textDim, marginLeft: 6 }}>upvotes</span>
            </div>
          </div>
        </div>

        {/* Two column layout */}
        <div className="home-layout" style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

          {/* Left: Filters + Product list */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Filters */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16, animation: 'fadeInUp 400ms cubic-bezier(0.16, 1, 0.3, 1) 100ms both' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div className="scrollbar-hide" style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 2 }}>
                  {CATEGORIES.map(c => (
                    <button key={c} onClick={() => setActiveCategory(c)} className={`filter-btn ${activeCategory === c ? 'active' : ''}`}>
                      {c}
                    </button>
                  ))}
                </div>

                <div style={{
                  display: 'flex', borderRadius: 4, overflow: 'hidden',
                  border: `1px solid ${colors.border}`, flexShrink: 0,
                }}>
                  <button onClick={() => setSortBy('top')}
                    style={{
                      padding: '4px 12px', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
                      fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
                      background: sortBy === 'top' ? '#0052FF' : 'transparent',
                      color: sortBy === 'top' ? '#fff' : colors.textDim,
                      transition: 'all 150ms',
                    }}
                  >top</button>
                  <button onClick={() => setSortBy('new')}
                    style={{
                      padding: '4px 12px', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
                      fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
                      borderLeft: `1px solid ${colors.border}`,
                      background: sortBy === 'new' ? '#0052FF' : 'transparent',
                      color: sortBy === 'new' ? '#fff' : colors.textDim,
                      transition: 'all 150ms',
                    }}
                  >new</button>
                </div>
              </div>
            </div>

            {/* Product List */}
            <div style={{
              border: `1px solid ${colors.border}`,
              borderRadius: 6,
              background: colors.bgCard,
              minHeight: 400,
              animation: 'fadeInUp 400ms cubic-bezier(0.16, 1, 0.3, 1) 200ms both',
            }}>
              {/* Terminal header bar */}
              <div style={{
                padding: '8px 16px',
                borderBottom: `1px solid ${colors.border}`,
                display: 'flex', alignItems: 'center', gap: 8,
                fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
                fontSize: 11, color: colors.textDim,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', opacity: 0.6 }} />
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#eab308', opacity: 0.6 }} />
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', opacity: 0.6 }} />
                <span style={{ marginLeft: 8 }}>~/sonarbot/signals</span>
              </div>

              {loading ? (
                <div>
                  {[1,2,3,4,5].map(i => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', borderBottom: `1px solid ${colors.border}` }}>
                      <div style={{ width: 48, height: 48, borderRadius: 8, background: colors.border }} className="shimmer" />
                      <div style={{ flex: 1 }}>
                        <div style={{ width: 120, height: 14, borderRadius: 4, marginBottom: 6 }} className="shimmer" />
                        <div style={{ width: 200, height: 12, borderRadius: 4 }} className="shimmer" />
                      </div>
                      <div style={{ width: 48, height: 56, borderRadius: 6 }} className="shimmer" />
                    </div>
                  ))}
                </div>
              ) : filteredProjects.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 280, textAlign: 'center' }}>
                  <div style={{
                    fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
                    fontSize: 12, color: colors.textDim, marginBottom: 12,
                  }}>
                    {'> no signals found'}
                  </div>
                  <p style={{ fontSize: 14, color: colors.textMuted }}>Be the first to launch in this category.</p>
                </div>
              ) : (
                <div>
                  {filteredProjects.map((p, i) => {
                    const hue = hueFrom(p.name);
                    const isUpvoted = upvoted.has(p.id);
                    const cc = commentCounts[p.id] || 0;

                    return (
                      <div key={p.id} className="product-row" style={{ animationDelay: `${i * 40}ms`, animation: `fadeInUp 300ms cubic-bezier(0.16, 1, 0.3, 1) ${i * 40}ms both` }}>
                        {/* Rank */}
                        <span style={{
                          fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
                          fontSize: 12, fontWeight: 700, color: i < 3 ? '#0052FF' : colors.textDim,
                          minWidth: 24, textAlign: 'center', flexShrink: 0,
                          textShadow: i === 0 ? '0 0 8px rgba(0, 82, 255, 0.4)' : 'none',
                        }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>

                        <Link href={`/project/${p.id}`} style={{ flexShrink: 0 }}>
                          {p.logo_url ? (
                            <img src={p.logo_url} alt="" style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', border: `1px solid ${colors.border}` }} />
                          ) : (
                            <div style={{
                              width: 48, height: 48, borderRadius: 8,
                              border: `1px solid ${colors.border}`,
                              background: theme === 'dark' ? `linear-gradient(135deg, hsl(${hue}, 40%, 12%), hsl(${hue}, 30%, 16%))` : `linear-gradient(135deg, hsl(${hue}, 60%, 92%), hsl(${hue}, 50%, 88%))`,
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
                            <h2 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', color: colors.text }}>
                              {p.name}
                              <span style={{
                                fontSize: 10, fontWeight: 500, padding: '1px 6px', borderRadius: 3,
                                border: `1px solid ${colors.border}`, background: colors.bg, color: colors.textDim,
                                fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
                              }}>
                                {REVERSE_CATEGORY_MAP[p.category] || p.category}
                              </span>
                            </h2>
                          </Link>
                          <p style={{ fontSize: 13, color: colors.textMuted, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.tagline}</p>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                          <Link href={`/project/${p.id}`} style={{ display: 'flex', alignItems: 'center', gap: 4, color: colors.textDim, textDecoration: 'none' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            <span style={{ fontSize: 12, fontWeight: 600, fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)" }}>{cc}</span>
                          </Link>

                          <button onClick={() => handleUpvote(p.id)} className={`upvote-btn ${isUpvoted ? 'active' : ''}`}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ marginBottom: 2 }}>
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
          <div className="home-sidebar" style={{ width: 300, flexShrink: 0 }}>
            <div style={{
              border: `1px solid ${colors.border}`,
              borderRadius: 6,
              background: colors.bgCard,
              position: 'sticky',
              top: 72,
              animation: 'fadeInUp 400ms cubic-bezier(0.16, 1, 0.3, 1) 300ms both',
            }}>
              {/* Sidebar terminal header */}
              <div style={{
                padding: '10px 16px',
                borderBottom: `1px solid ${colors.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: '#0052FF',
                    boxShadow: '0 0 8px rgba(0, 82, 255, 0.5)',
                    animation: 'sonarPulse 2s ease-out infinite',
                  }} />
                  <span style={{
                    fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
                    fontSize: 11, fontWeight: 700, color: colors.text,
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>
                    Upcoming
                  </span>
                </div>
                <Link href="/upcoming" style={{
                  fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
                  fontSize: 10, color: '#0052FF', textDecoration: 'none', fontWeight: 600,
                }}>
                  view all →
                </Link>
              </div>

              {/* Upcoming items */}
              {[
                { title: "BaseAgent v2", desc: "Next-gen autonomous execution.", days: 2, icon: "01" },
                { title: "YieldFlow", desc: "Automated yield farming.", days: 5, icon: "02" },
                { title: "SocialLink", desc: "Farcaster meets agent flows.", days: 8, icon: "03" },
              ].map((item, idx) => (
                <div key={idx} style={{
                  padding: '14px 16px',
                  borderBottom: idx < 2 ? `1px solid ${colors.border}` : 'none',
                  transition: 'background 150ms ease',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <div style={{
                      fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
                      fontSize: 10, fontWeight: 700, color: '#0052FF',
                      width: 24, height: 24, borderRadius: 4,
                      background: 'rgba(0, 82, 255, 0.1)',
                      border: '1px solid rgba(0, 82, 255, 0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {item.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: 13, fontWeight: 600, color: colors.text, margin: '0 0 2px' }}>{item.title}</h4>
                      <p style={{ fontSize: 12, color: colors.textDim, margin: '0 0 6px', lineHeight: 1.4 }}>{item.desc}</p>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
                        fontSize: 10, color: colors.textDim,
                      }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        T-{item.days}d
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* CTA */}
              <div style={{
                padding: '12px 16px',
                borderTop: `1px solid ${colors.border}`,
                background: 'rgba(0, 82, 255, 0.03)',
              }}>
                <Link href="/docs" style={{
                  display: 'block', textAlign: 'center', padding: '8px 0',
                  borderRadius: 4,
                  border: '1px solid rgba(0, 82, 255, 0.3)',
                  background: 'rgba(0, 82, 255, 0.08)',
                  fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
                  fontSize: 11, fontWeight: 600, color: '#0052FF',
                  textDecoration: 'none',
                  transition: 'all 200ms',
                }}>
                  {'> submit your product'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: `1px solid ${colors.border}`,
        background: colors.bg,
        position: 'relative', zIndex: 2,
      }}>
        <div style={{
          maxWidth: 1080, margin: '0 auto', padding: '20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 8,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
            fontSize: 11, color: colors.textDim,
          }}>
            <span style={{ fontWeight: 700, color: '#0052FF' }}>sonarbot</span>
            <span style={{ color: colors.border }}>·</span>
            <span>{'\u00A9'} {new Date().getFullYear()}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 11 }}>
            <Link href="/docs" style={{ color: colors.textDim, textDecoration: 'none', fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)" }}>Docs</Link>
            <a href="https://x.com/sonarbotxyz" target="_blank" rel="noopener noreferrer" style={{ color: colors.textDim, textDecoration: 'none', fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)" }}>@sonarbotxyz</a>
          </div>
        </div>
      </footer>

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
