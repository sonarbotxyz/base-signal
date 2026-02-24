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
  description?: string;
  logo_url?: string;
  website_url?: string;
  twitter_handle?: string;
  category: string;
  upvotes: number;
  created_at: string;
  submitted_by_twitter?: string;
}

interface SponsoredSpot {
  id: string;
  title: string;
  description?: string;
  url: string;
  image_url?: string;
}

const CATEGORIES = ['All', 'AI Agents', 'DeFi', 'Infrastructure', 'Social', 'Gaming', 'Tools'];

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [upvoted, setUpvoted] = useState<Set<string>>(new Set());
  const [voting, setVoting] = useState<Set<string>>(new Set());
  const [showSubModal, setShowSubModal] = useState(false);
  const [rateLimitMsg, setRateLimitMsg] = useState('');
  const [filter, setFilter] = useState('All');
  const [sponsored, setSponsored] = useState<SponsoredSpot | null>(null);

  const { authenticated, getAccessToken } = usePrivy();
  const { initOAuth } = useLoginWithOAuth();

  useEffect(() => {
    fetchProjects();
    fetchSponsored();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/projects?sort=upvotes&limit=30');
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchSponsored = async () => {
    try {
      const res = await fetch('/api/sponsored?type=homepage_card');
      const data = await res.json();
      if (data.active_spot) setSponsored(data.active_spot);
    } catch (e) { console.error(e); }
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
  
  const filteredProjects = filter === 'All' 
    ? projects 
    : projects.filter(p => {
        const catMap: Record<string, string> = {
          'AI Agents': 'agents', 'DeFi': 'defi', 'Infrastructure': 'infrastructure',
          'Social': 'social', 'Gaming': 'gaming', 'Tools': 'tools'
        };
        return p.category === catMap[filter];
      });

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d12', color: '#fff', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <Header />

      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px 80px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>
            Explore 🔥
          </h1>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 10,
            background: '#1a1a24', border: '1px solid #2a2a3a',
            color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/>
              <line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/>
            </svg>
            Filter
          </button>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32, overflowX: 'auto', paddingBottom: 8 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                border: 'none',
                background: filter === cat ? '#0052FF' : '#1a1a24',
                color: filter === cat ? '#fff' : '#888',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 20,
        }}>
          {/* Sponsored Card - First Position */}
          {sponsored ? (
            <a
              href={sponsored.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'linear-gradient(135deg, #FF6B00, #FF9500)',
                borderRadius: 16,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: 320,
                textDecoration: 'none',
                color: '#000',
                position: 'relative',
                overflow: 'hidden',
              }}
              className="card-hover"
            >
              <div>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 10px',
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  marginBottom: 16,
                  color: '#000',
                }}>
                  ⚡ SPONSORED
                </span>
                <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{sponsored.title}</h3>
                <p style={{ fontSize: 14, opacity: 0.8, lineHeight: 1.5 }}>{sponsored.description}</p>
              </div>
              <button style={{
                marginTop: 20,
                padding: '12px 20px',
                background: 'rgba(0,0,0,0.15)',
                border: '2px solid rgba(0,0,0,0.2)',
                borderRadius: 10,
                color: '#000',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}>
                ✨ Check it out
              </button>
            </a>
          ) : (
            <Link
              href="/docs"
              style={{
                background: 'linear-gradient(135deg, #0052FF, #0066FF)',
                borderRadius: 16,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: 320,
                textDecoration: 'none',
                color: '#fff',
              }}
              className="card-hover"
            >
              <div>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 10px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                  marginBottom: 16,
                }}>
                  🚀 PROMOTE
                </span>
                <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Get Featured</h3>
                <p style={{ fontSize: 14, opacity: 0.85, lineHeight: 1.5 }}>
                  Put your product in front of thousands of Base builders. First spot = max visibility.
                </p>
              </div>
              <button style={{
                marginTop: 20,
                padding: '12px 20px',
                background: 'rgba(255,255,255,0.15)',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: 10,
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}>
                Book this spot →
              </button>
            </Link>
          )}

          {/* Product Cards */}
          {loading ? (
            Array.from({ length: 7 }).map((_, i) => (
              <div key={i} style={{
                background: '#15151f',
                borderRadius: 16,
                minHeight: 320,
                animation: 'pulse 1.5s infinite',
              }} />
            ))
          ) : filteredProjects.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 60, color: '#666' }}>
              No products in this category yet
            </div>
          ) : (
            filteredProjects.map((p, i) => {
              const hue = hueFrom(p.name);
              const isUpvoted = upvoted.has(p.id);

              return (
                <div
                  key={p.id}
                  style={{
                    background: '#15151f',
                    borderRadius: 16,
                    overflow: 'hidden',
                    border: '1px solid #222230',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                  className="card-hover"
                >
                  {/* Thumbnail */}
                  <Link href={`/project/${p.id}`} style={{ display: 'block', position: 'relative' }}>
                    <div style={{
                      height: 180,
                      background: p.logo_url 
                        ? `url(${p.logo_url}) center/cover`
                        : `linear-gradient(135deg, hsl(${hue}, 50%, 20%), hsl(${hue}, 40%, 30%))`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {!p.logo_url && (
                        <span style={{ fontSize: 48, fontWeight: 700, color: `hsl(${hue}, 60%, 60%)`, opacity: 0.8 }}>
                          {p.name[0]}
                        </span>
                      )}
                    </div>
                    {/* Rank Badge */}
                    {i < 3 && (
                      <div style={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        background: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : '#CD7F32',
                        color: '#000',
                        padding: '4px 10px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 700,
                      }}>
                        #{i + 1}
                      </div>
                    )}
                  </Link>

                  {/* Content */}
                  <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Link href={`/project/${p.id}`} style={{ textDecoration: 'none' }}>
                      <h3 style={{ fontSize: 16, fontWeight: 600, color: '#fff', margin: '0 0 6px' }}>{p.name}</h3>
                    </Link>
                    <p style={{ fontSize: 13, color: '#888', margin: '0 0 12px', lineHeight: 1.4, flex: 1 }}>
                      {p.tagline.length > 60 ? p.tagline.slice(0, 60) + '...' : p.tagline}
                    </p>
                    
                    {/* Footer */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {p.twitter_handle && (
                          <a 
                            href={`https://x.com/${p.twitter_handle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#666', fontSize: 12, textDecoration: 'none' }}
                          >
                            @{p.twitter_handle}
                          </a>
                        )}
                      </div>
                      <button
                        onClick={() => handleUpvote(p.id)}
                        disabled={voting.has(p.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '8px 14px',
                          borderRadius: 8,
                          border: 'none',
                          background: isUpvoted ? '#0052FF' : '#252530',
                          color: isUpvoted ? '#fff' : '#aaa',
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                        className="upvote-btn"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 8" fill="currentColor">
                          <path d="M6 0L0 8h12L6 0z" />
                        </svg>
                        {p.upvotes}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Load More / Submit CTA */}
        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <Link
            href="/submit"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 28px',
              background: '#0052FF',
              color: '#fff',
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            🚀 Launch your product
          </Link>
        </div>
      </main>

      <SubscriptionModal isOpen={showSubModal} onClose={() => setShowSubModal(false)} limitMessage={rateLimitMsg} getAccessToken={getAccessToken} />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .card-hover {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.4);
        }
        .upvote-btn:hover:not(:disabled) {
          background: #0052FF !important;
          color: #fff !important;
        }
        /* Mobile */
        @media (max-width: 640px) {
          main {
            padding: 20px 16px 60px !important;
          }
          h1 {
            font-size: 22px !important;
          }
        }
      `}</style>
    </div>
  );
}
