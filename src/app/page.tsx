'use client';

import { useState, useEffect, useCallback } from 'react';
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

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
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
  const border = isDark ? '#232d3f' : '#e5e7eb';
  const textMuted = isDark ? '#8892a4' : '#6b7280';
  const textDim = isDark ? '#4a5568' : '#9ca3af';
  const textMain = isDark ? '#f1f5f9' : '#111827';
  const bgSecondary = isDark ? '#161b27' : '#f9fafb';
  const bgCard = isDark ? '#1a2235' : '#ffffff';

  useEffect(() => { fetchProjects(); fetchSponsoredBanner(); }, [sort]);

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
          background: isDark ? 'rgba(77,124,255,0.12)' : 'rgba(0,68,255,0.06)',
          border: `1px solid ${isDark ? 'rgba(77,124,255,0.2)' : 'rgba(0,68,255,0.12)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {spot?.image_url
            ? <img src={spot.image_url} alt="" style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover' }} />
            : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0044ff" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
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
            flexShrink: 0, padding: '6px 14px', borderRadius: 6,
            border: `1px solid ${isDark ? 'rgba(77,124,255,0.3)' : 'rgba(0,68,255,0.25)'}`,
            color: '#0044ff', fontSize: 13, fontWeight: 600,
            textDecoration: 'none', whiteSpace: 'nowrap',
          }}
        >
          {spot ? 'Visit' : 'Learn more'}
        </a>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: isDark ? '#0f1117' : '#fff', display: 'flex', flexDirection: 'column' }}>
      <Header activePage="home" />

      <main style={{ maxWidth: 960, margin: '0 auto', padding: '24px 20px 80px', flex: 1, width: '100%' }}>

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
                <div style={{ width: 52, height: 56, borderRadius: 10, background: bgSecondary, flexShrink: 0 }} />
              </div>
            ))
          ) : filteredProjects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: textMuted }}>
              <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, color: textMain }}>No products yet</p>
              <p style={{ fontSize: 14, margin: 0 }}>Submit via the API — check Docs to get started</p>
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
                    <Link href={`/project/${p.id}`} style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      gap: 3, color: textDim, textDecoration: 'none', flexShrink: 0,
                      fontSize: 12, fontWeight: 600, padding: '4px 8px',
                    }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      {cc}
                    </Link>

                    {/* Upvote */}
                    <button
                      onClick={() => handleUpvote(p.id)}
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
      </main>

      <footer style={{
        borderTop: `1px solid ${border}`,
        padding: '20px',
        textAlign: 'center',
        fontSize: 13,
        color: textDim,
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700, color: '#0044ff', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>sonarbot</span>
            <span>·</span>
            <span>Product Hunt for Base</span>
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
