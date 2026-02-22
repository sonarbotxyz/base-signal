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

interface UpcomingProject {
  id: string;
  name: string;
  tagline: string;
  logo_url?: string;
  category: string;
  scheduled_for: string;
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

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'agents', label: 'AI Agents' },
  { key: 'defi', label: 'DeFi' },
  { key: 'infrastructure', label: 'Infrastructure' },
  { key: 'consumer', label: 'Consumer' },
  { key: 'gaming', label: 'Gaming' },
  { key: 'social', label: 'Social' },
  { key: 'tools', label: 'Tools' },
  { key: 'other', label: 'Other' },
];

const CATEGORY_LABELS: Record<string, string> = {
  agents: 'AI Agents', defi: 'DeFi', infrastructure: 'Infrastructure',
  consumer: 'Consumer', gaming: 'Gaming', social: 'Social', tools: 'Tools', other: 'Other',
};

function UpcomingCountdown({ target }: { target: string }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const diff = new Date(target).getTime() - now;
  if (diff <= 0) return <span className="status-badge-live">Live</span>;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return <span className="countdown-badge">{days}d {hours}h</span>;
  return <span className="countdown-badge">{hours}h {mins}m</span>;
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [upvoted, setUpvoted] = useState<Set<string>>(new Set());
  const [voting, setVoting] = useState<Set<string>>(new Set());
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [sponsoredBanner, setSponsoredBanner] = useState<SponsoredSpot | null>(null);
  const [showSubModal, setShowSubModal] = useState(false);
  const [rateLimitMsg, setRateLimitMsg] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sort, setSort] = useState<'upvotes' | 'newest'>('upvotes');

  const { authenticated, getAccessToken } = usePrivy();
  const { initOAuth } = useLoginWithOAuth();
  const { theme } = useTheme();

  const isDark = theme === 'dark';
  const border = isDark ? '#2D3748' : '#E2E8F0';
  const textMuted = isDark ? '#94A3B8' : '#475569';
  const textDim = isDark ? '#475569' : '#94A3B8';
  const textMain = isDark ? '#F8FAFC' : '#0F172A';
  const bgSecondary = isDark ? '#1E2638' : '#F1F5F9';
  const cardBg = isDark ? '#151B2B' : '#FFFFFF';

  useEffect(() => { fetchProjects(); fetchSponsoredBanner(); fetchUpcoming(); }, [sort]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects?sort=${sort}&limit=50`);
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

  const fetchUpcoming = async () => {
    try {
      const res = await fetch('/api/projects?status=upcoming&sort=launch_date&limit=6');
      const data = await res.json();
      setUpcoming(data.projects || []);
    } catch {}
  };

  const fetchSponsoredBanner = async () => {
    try {
      const res = await fetch('/api/sponsored?type=homepage_inline');
      const data = await res.json();
      if (data.active_spot) setSponsoredBanner(data.active_spot);
    } catch {}
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

  const filteredProjects = activeCategory === 'all'
    ? projects
    : projects.filter(p => p.category === activeCategory);

  const renderSponsor = () => {
    const spot = sponsoredBanner;
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 8px', borderBottom: `1px solid ${border}`,
      }}>
        <div style={{ width: 24, textAlign: 'right', flexShrink: 0 }} />
        <div style={{
          width: 56, height: 56, borderRadius: 12, flexShrink: 0,
          background: isDark ? 'rgba(0,68,255,0.1)' : 'rgba(0,68,255,0.06)',
          border: `1px solid ${isDark ? 'rgba(0,68,255,0.2)' : 'rgba(0,68,255,0.12)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {spot?.image_url
            ? <img src={spot.image_url} alt="" style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover' }} />
            : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0044FF" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: textMain }}>
              {spot ? spot.title : 'Promote your product here'}
            </span>
            <span style={{
              fontSize: 10, fontWeight: 700, color: textDim,
              padding: '1px 6px', borderRadius: 4,
              border: `1px solid ${border}`, letterSpacing: 0.5,
            }}>AD</span>
          </div>
          <p style={{ fontSize: 13, color: textMuted, margin: 0 }}>
            {spot ? spot.description : 'Reach Base ecosystem builders. Available via API or DM @sonarbotxyz'}
          </p>
        </div>
        <a
          href={spot ? spot.url : '/docs'}
          target={spot ? '_blank' : undefined}
          rel="noopener noreferrer"
          style={{
            flexShrink: 0, padding: '6px 14px', borderRadius: 8,
            border: `1px solid ${isDark ? 'rgba(0,68,255,0.3)' : 'rgba(0,68,255,0.25)'}`,
            color: '#0044FF', fontSize: 13, fontWeight: 600,
            textDecoration: 'none', whiteSpace: 'nowrap',
          }}
        >
          {spot ? 'Visit' : 'Learn more'}
        </a>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: isDark ? '#0B0F19' : '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '24px 20px 80px', flex: 1, width: '100%' }}>

        {/* Section title */}
        <h1 style={{ fontSize: 22, fontWeight: 700, color: textMain, margin: '0 0 16px' }}>Today on Base</h1>

        {/* Category filters + sort */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 12, marginBottom: 20, flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`filter-btn ${activeCategory === cat.key ? 'active' : ''}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <button onClick={() => setSort('upvotes')} className={`sort-btn ${sort === 'upvotes' ? 'active' : ''}`}>Top</button>
            <button onClick={() => setSort('newest')} className={`sort-btn ${sort === 'newest' ? 'active' : ''}`}>New</button>
          </div>
        </div>

        {/* Feed */}
        <div style={{ borderTop: `1px solid ${border}` }}>
          {loading ? (
            [1,2,3,4,5].map(i => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 8px', borderBottom: `1px solid ${border}` }}>
                <div style={{ width: 24 }} />
                <div style={{ width: 56, height: 56, borderRadius: 12, background: bgSecondary, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ width: 140, height: 14, borderRadius: 4, background: bgSecondary, marginBottom: 8 }} />
                  <div style={{ width: 220, height: 12, borderRadius: 4, background: bgSecondary }} />
                </div>
                <div style={{ width: 56, height: 64, borderRadius: 12, background: bgSecondary, flexShrink: 0 }} />
              </div>
            ))
          ) : filteredProjects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: textMuted }}>
              <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, color: textMain }}>No products yet</p>
              <p style={{ fontSize: 14, margin: '0 0 20px' }}>Be the first to launch on Base today.</p>
              <Link href="/submit" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10,
                background: '#0044FF', color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none',
              }}>
                Launch on sonarbot
              </Link>
            </div>
          ) : (
            filteredProjects.map((p, i) => {
              const hue = hueFrom(p.name);
              const isUpvoted = upvoted.has(p.id);
              const cc = commentCounts[p.id] || 0;
              return (
                <div key={p.id}>
                  <div className="product-row fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
                    {/* Rank */}
                    <div style={{ width: 24, textAlign: 'right', flexShrink: 0, fontSize: 13, fontWeight: 500, color: textDim }}>
                      {i + 1}
                    </div>

                    {/* Logo */}
                    <Link href={`/project/${p.id}`} style={{ flexShrink: 0 }}>
                      {p.logo_url ? (
                        <img src={p.logo_url} alt="" style={{
                          width: 56, height: 56, borderRadius: 12, objectFit: 'cover',
                          border: `1px solid ${border}`,
                        }} />
                      ) : (
                        <div style={{
                          width: 56, height: 56, borderRadius: 12,
                          background: isDark
                            ? `linear-gradient(135deg, hsl(${hue},40%,14%), hsl(${hue},30%,20%))`
                            : `linear-gradient(135deg, hsl(${hue},60%,92%), hsl(${hue},50%,85%))`,
                          border: `1px solid ${border}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <span style={{ fontSize: 22, fontWeight: 700, color: isDark ? `hsl(${hue},60%,60%)` : `hsl(${hue},60%,40%)` }}>
                            {p.name[0]}
                          </span>
                        </div>
                      )}
                    </Link>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link href={`/project/${p.id}`} style={{ textDecoration: 'none' }}>
                        <h2 style={{ fontSize: 15, fontWeight: 600, color: textMain, margin: '0 0 3px', lineHeight: 1.3 }}>
                          {p.name}
                        </h2>
                      </Link>
                      <p style={{ fontSize: 13, color: textMuted, margin: '0 0 7px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.tagline}
                      </p>
                      <span className="category-pill">{CATEGORY_LABELS[p.category] || p.category}</span>
                    </div>

                    {/* Comment count */}
                    <Link href={`/project/${p.id}`} className="comment-btn">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      {cc}
                    </Link>

                    {/* Upvote */}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleUpvote(p.id); }}
                      className={`upvote-btn ${isUpvoted ? 'active' : ''}`}
                      disabled={voting.has(p.id)}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                        <polyline points="18 15 12 9 6 15" />
                      </svg>
                      {p.upvotes}
                    </button>
                  </div>

                  {/* Sponsored slot after position 3 */}
                  {i === 2 && renderSponsor()}
                </div>
              );
            })
          )}
        </div>

        {/* Incoming Signals section */}
        {upcoming.length > 0 && (
          <section style={{ marginTop: 48 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B', boxShadow: '0 0 8px rgba(245,158,11,0.5)' }} />
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Incoming Signals</h2>
              </div>
              <Link href="/upcoming" style={{ fontSize: 13, fontWeight: 600, color: '#0044FF', textDecoration: 'none' }}>
                View all →
              </Link>
            </div>

            <div style={{
              display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8,
              scrollbarWidth: 'none',
            }}>
              {upcoming.map((p, i) => {
                const hue = hueFrom(p.name);
                return (
                  <Link key={p.id} href={`/project/${p.id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
                    <div className="fade-in" style={{
                      animationDelay: `${i * 0.06}s`,
                      width: 240, padding: 16, borderRadius: 14,
                      border: '1px solid var(--border)', background: 'var(--bg-card)',
                      transition: 'border-color 0.15s ease',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(245,158,11,0.4)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'; }}
                    >
                      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                        {p.logo_url ? (
                          <img src={p.logo_url} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border)' }} />
                        ) : (
                          <div style={{
                            width: 36, height: 36, borderRadius: 8,
                            background: isDark
                              ? `linear-gradient(135deg, hsl(${hue},40%,14%), hsl(${hue},30%,20%))`
                              : `linear-gradient(135deg, hsl(${hue},60%,92%), hsl(${hue},50%,85%))`,
                            border: '1px solid var(--border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: isDark ? `hsl(${hue},60%,60%)` : `hsl(${hue},60%,40%)` }}>
                              {p.name[0]}
                            </span>
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', margin: '0 0 2px', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</h3>
                          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.tagline}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <UpcomingCountdown target={p.scheduled_for} />
                        <button
                          onClick={e => { e.preventDefault(); e.stopPropagation(); }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            padding: '4px 8px', borderRadius: 6,
                            border: '1px solid var(--border)', background: 'transparent',
                            color: 'var(--text-dim)', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                          }}
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                          Notify
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <footer style={{
        borderTop: `1px solid ${border}`,
        padding: '20px',
        textAlign: 'center',
        fontSize: 13,
        color: textDim,
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700, color: '#0044FF', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>sonarbot</span>
            <span>·</span>
            <span>The launchpad for Base</span>
            <span>·</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <Link href="/docs" style={{ color: textDim, textDecoration: 'none' }}>Docs</Link>
            <a href="https://x.com/sonarbotxyz" target="_blank" rel="noopener noreferrer" style={{ color: textDim, textDecoration: 'none' }}>@sonarbotxyz</a>
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
