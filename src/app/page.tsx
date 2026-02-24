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
  description?: string;
  logo_url?: string;
  website_url?: string;
  twitter_handle?: string;
  github_url?: string;
  category: string;
  upvotes: number;
  created_at: string;
}

const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '🔥' },
  { id: 'agents', label: 'AI Agents', emoji: '🤖' },
  { id: 'defi', label: 'DeFi', emoji: '💰' },
  { id: 'infrastructure', label: 'Infrastructure', emoji: '🔧' },
  { id: 'social', label: 'Social', emoji: '💬' },
  { id: 'gaming', label: 'Gaming', emoji: '🎮' },
  { id: 'tools', label: 'Tools', emoji: '⚡' },
  { id: 'consumer', label: 'Consumer', emoji: '📱' },
];

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [upvoted, setUpvoted] = useState<Set<string>>(new Set());
  const [voting, setVoting] = useState<Set<string>>(new Set());
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [showSubModal, setShowSubModal] = useState(false);
  const [rateLimitMsg, setRateLimitMsg] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'upvotes' | 'newest'>('upvotes');

  const { authenticated, getAccessToken } = usePrivy();
  const { initOAuth } = useLoginWithOAuth();

  useEffect(() => { fetchProjects(); }, [category, sortBy]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort: sortBy, limit: '30' });
      if (category !== 'all') params.append('category', category);
      const res = await fetch(`/api/projects?${params}`);
      const data = await res.json();
      const projs = data.projects || [];
      setProjects(projs);
      // Fetch comment counts
      projs.forEach((p: Project) => {
        fetch(`/api/projects/${p.id}/comments`).then(r => r.json()).then(d => {
          setCommentCounts(prev => ({ ...prev, [p.id]: (d.comments || []).length }));
        }).catch(() => {});
      });
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
        const data = await res.json().catch(() => ({}));
        setRateLimitMsg(data.limit || 'Rate limit exceeded');
        setShowSubModal(true);
      }
    } catch (e) { console.error(e); }
    setVoting(prev => { const n = new Set(prev); n.delete(projectId); return n; });
  };

  const hueFrom = (s: string) => s.charCodeAt(0) * 7 % 360;
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e4e4e7', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <Header />

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 20px 80px', display: 'flex', gap: 32 }}>
        {/* Left Sidebar - Categories */}
        <aside className="sidebar-left" style={{ width: 220, flexShrink: 0 }}>
          <div style={{ position: 'sticky', top: 80 }}>
            <h3 style={{ fontSize: 12, fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              Categories
            </h3>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: 'none',
                    background: category === cat.id ? 'rgba(0, 82, 255, 0.15)' : 'transparent',
                    color: category === cat.id ? '#3b82f6' : '#a1a1aa',
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: 16 }}>{cat.emoji}</span>
                  {cat.label}
                </button>
              ))}
            </nav>

            <div style={{ marginTop: 32, padding: 16, background: '#111118', borderRadius: 12, border: '1px solid #1e1e28' }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>🚀 Launch your product</h4>
              <p style={{ fontSize: 13, color: '#71717a', marginBottom: 12, lineHeight: 1.5 }}>
                Get your product in front of the Base community.
              </p>
              <Link href="/submit" style={{
                display: 'block',
                padding: '10px 16px',
                background: '#0052FF',
                color: '#fff',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
                textAlign: 'center',
              }}>
                Submit Product
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Feed */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {/* Date Header */}
          <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>{today}</h1>
              <p style={{ fontSize: 14, color: '#71717a', marginTop: 4 }}>Top products on Base today</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setSortBy('upvotes')}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: `1px solid ${sortBy === 'upvotes' ? '#0052FF' : '#27272a'}`,
                  background: sortBy === 'upvotes' ? 'rgba(0, 82, 255, 0.1)' : 'transparent',
                  color: sortBy === 'upvotes' ? '#3b82f6' : '#a1a1aa',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                🔥 Popular
              </button>
              <button
                onClick={() => setSortBy('newest')}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: `1px solid ${sortBy === 'newest' ? '#0052FF' : '#27272a'}`,
                  background: sortBy === 'newest' ? 'rgba(0, 82, 255, 0.1)' : 'transparent',
                  color: sortBy === 'newest' ? '#3b82f6' : '#a1a1aa',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                ✨ Newest
              </button>
            </div>
          </div>

          {/* Product List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {loading ? (
              <div style={{ padding: '60px 0', textAlign: 'center', color: '#71717a' }}>Loading products...</div>
            ) : projects.length === 0 ? (
              <div style={{ padding: '60px 0', textAlign: 'center', color: '#71717a' }}>No products in this category yet</div>
            ) : (
              projects.map((p, i) => {
                const hue = hueFrom(p.name);
                const isUpvoted = upvoted.has(p.id);
                const comments = commentCounts[p.id] || 0;
                const catInfo = CATEGORIES.find(c => c.id === p.category);

                return (
                  <div
                    key={p.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 16,
                      padding: 20,
                      background: '#111118',
                      borderRadius: 12,
                      border: '1px solid #1e1e28',
                      transition: 'border-color 0.15s, transform 0.15s',
                    }}
                    className="product-card"
                  >
                    {/* Rank */}
                    <span style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: i < 3 ? '#0052FF' : '#3f3f46',
                      width: 32,
                      textAlign: 'center',
                      flexShrink: 0,
                      paddingTop: 4,
                    }}>
                      {i + 1}
                    </span>

                    {/* Logo */}
                    <Link href={`/project/${p.id}`} style={{ flexShrink: 0 }}>
                      {p.logo_url ? (
                        <img src={p.logo_url} alt="" style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'cover' }} />
                      ) : (
                        <div style={{
                          width: 64, height: 64, borderRadius: 12,
                          background: `linear-gradient(135deg, hsl(${hue}, 40%, 18%), hsl(${hue}, 30%, 24%))`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <span style={{ fontSize: 26, fontWeight: 700, color: `hsl(${hue}, 50%, 60%)` }}>{p.name[0]}</span>
                        </div>
                      )}
                    </Link>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                        <Link href={`/project/${p.id}`} style={{ textDecoration: 'none' }}>
                          <h2 style={{ fontSize: 17, fontWeight: 600, color: '#f4f4f5', margin: 0 }}>{p.name}</h2>
                        </Link>
                        {catInfo && (
                          <span style={{
                            fontSize: 11,
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: 'rgba(255,255,255,0.06)',
                            color: '#a1a1aa',
                          }}>
                            {catInfo.emoji} {catInfo.label}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 14, color: '#a1a1aa', margin: '0 0 10px', lineHeight: 1.5 }}>{p.tagline}</p>
                      
                      {/* Meta row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                        <Link href={`/project/${p.id}`} style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#71717a', fontSize: 13, textDecoration: 'none' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                          {comments} comments
                        </Link>
                        {p.website_url && (
                          <a href={p.website_url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#71717a', fontSize: 13, textDecoration: 'none' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                            </svg>
                            Website
                          </a>
                        )}
                        {p.twitter_handle && (
                          <a href={`https://x.com/${p.twitter_handle}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#71717a', fontSize: 13, textDecoration: 'none' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                            @{p.twitter_handle}
                          </a>
                        )}
                        <span style={{ color: '#52525b', fontSize: 12 }}>{timeAgo(p.created_at)}</span>
                      </div>
                    </div>

                    {/* Upvote Button */}
                    <button
                      onClick={() => handleUpvote(p.id)}
                      disabled={voting.has(p.id)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 56,
                        height: 68,
                        border: `2px solid ${isUpvoted ? '#0052FF' : '#27272a'}`,
                        borderRadius: 10,
                        background: isUpvoted ? 'rgba(0, 82, 255, 0.12)' : 'transparent',
                        color: isUpvoted ? '#0052FF' : '#a1a1aa',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        flexShrink: 0,
                      }}
                      className="upvote-btn"
                    >
                      <svg width="14" height="10" viewBox="0 0 14 10" fill="none" style={{ marginBottom: 4 }}>
                        <path d="M7 0L0 8h14L7 0z" fill="currentColor" />
                      </svg>
                      <span style={{ fontSize: 15, fontWeight: 700 }}>{p.upvotes}</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="sidebar-right" style={{ width: 280, flexShrink: 0 }}>
          <div style={{ position: 'sticky', top: 80 }}>
            {/* Featured */}
            <div style={{ padding: 20, background: 'linear-gradient(135deg, #0a1628, #0d1f3c)', borderRadius: 12, border: '1px solid #1e3a5f', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 16 }}>🏆</span>
                <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Product of the Week</h3>
              </div>
              {projects[0] && (
                <Link href={`/project/${projects[0].id}`} style={{ textDecoration: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {projects[0].logo_url ? (
                      <img src={projects[0].logo_url} alt="" style={{ width: 40, height: 40, borderRadius: 8 }} />
                    ) : (
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: '#3b82f6' }}>{projects[0].name[0]}</span>
                      </div>
                    )}
                    <div>
                      <h4 style={{ fontSize: 14, fontWeight: 600, color: '#f4f4f5', margin: 0 }}>{projects[0].name}</h4>
                      <p style={{ fontSize: 12, color: '#71717a', margin: '2px 0 0' }}>{projects[0].upvotes} upvotes</p>
                    </div>
                  </div>
                </Link>
              )}
            </div>

            {/* Stats */}
            <div style={{ padding: 20, background: '#111118', borderRadius: 12, border: '1px solid #1e1e28', marginBottom: 20 }}>
              <h3 style={{ fontSize: 12, fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
                This Week
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#a1a1aa', fontSize: 13 }}>Products launched</span>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{projects.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#a1a1aa', fontSize: 13 }}>Total upvotes</span>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{projects.reduce((sum, p) => sum + p.upvotes, 0)}</span>
                </div>
              </div>
            </div>

            {/* Newsletter */}
            <div style={{ padding: 20, background: '#111118', borderRadius: 12, border: '1px solid #1e1e28' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>📬 Stay updated</h3>
              <p style={{ fontSize: 13, color: '#71717a', marginBottom: 12, lineHeight: 1.5 }}>
                Get the best new products on Base delivered to your inbox.
              </p>
              <a href="https://x.com/sonarbotxyz" target="_blank" rel="noopener noreferrer" style={{
                display: 'block',
                padding: '10px 16px',
                background: '#18181b',
                border: '1px solid #27272a',
                color: '#e4e4e7',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                textDecoration: 'none',
                textAlign: 'center',
              }}>
                Follow @sonarbotxyz
              </a>
            </div>
          </div>
        </aside>
      </div>

      <SubscriptionModal isOpen={showSubModal} onClose={() => setShowSubModal(false)} limitMessage={rateLimitMsg} getAccessToken={getAccessToken} />

      <style>{`
        .product-card:hover {
          border-color: #27272a !important;
          transform: translateY(-1px);
        }
        .upvote-btn:hover:not(:disabled) {
          border-color: #0052FF !important;
          color: #0052FF !important;
          background: rgba(0, 82, 255, 0.08) !important;
        }
        a:hover h2, a:hover h4 {
          color: #fff !important;
        }
        /* Hide sidebars on tablet/mobile */
        @media (max-width: 1024px) {
          .sidebar-right { display: none; }
        }
        @media (max-width: 768px) {
          .sidebar-left { display: none; }
        }
        /* Mobile product cards */
        @media (max-width: 640px) {
          .product-card {
            padding: 14px !important;
            gap: 12px !important;
          }
          .product-card > span:first-child {
            font-size: 14px !important;
            width: 24px !important;
          }
          .product-card img, .product-card > a > div {
            width: 48px !important;
            height: 48px !important;
          }
          .product-card .upvote-btn {
            width: 48px !important;
            height: 56px !important;
          }
        }
      `}</style>
    </div>
  );
}
