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
  category: string;
  upvotes: number;
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [upvoted, setUpvoted] = useState<Set<string>>(new Set());
  const [voting, setVoting] = useState<Set<string>>(new Set());
  const [showSubModal, setShowSubModal] = useState(false);
  const [rateLimitMsg, setRateLimitMsg] = useState('');

  const { authenticated, getAccessToken } = usePrivy();
  const { initOAuth } = useLoginWithOAuth();
  const { theme, colors } = useTheme();

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/projects?sort=upvotes&limit=30');
      const data = await res.json();
      setProjects(data.projects || []);
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

  return (
    <div style={{ minHeight: '100vh', background: '#080810', color: '#e4e4e7', fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <Header />

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px 80px' }}>
        {/* Hero - minimal */}
        <div style={{ marginBottom: 48 }}>
          <h1 style={{ fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 700, margin: 0, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Find the <span style={{ color: '#0052FF' }}>signal</span>.
          </h1>
          <p style={{ fontSize: 18, color: '#71717a', marginTop: 12 }}>
            The best products on Base, ranked by the community.
          </p>
        </div>

        {/* Product List - flat, no cards */}
        <div>
          {loading ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#71717a' }}>Loading...</div>
          ) : projects.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#71717a' }}>No products yet</div>
          ) : (
            projects.map((p, i) => {
              const hue = hueFrom(p.name);
              const isUpvoted = upvoted.has(p.id);

              return (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px 0',
                    borderBottom: '1px solid #1e1e24',
                    gap: 16,
                  }}
                >
                  {/* Rank */}
                  <span style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: i < 3 ? '#0052FF' : '#52525b',
                    width: 28,
                    textAlign: 'center',
                    flexShrink: 0,
                  }}>
                    {i + 1}
                  </span>

                  {/* Logo */}
                  <Link href={`/project/${p.id}`} style={{ flexShrink: 0 }}>
                    {p.logo_url ? (
                      <img
                        src={p.logo_url}
                        alt=""
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 10,
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: 10,
                        background: `linear-gradient(135deg, hsl(${hue}, 40%, 15%), hsl(${hue}, 30%, 20%))`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <span style={{ fontSize: 20, fontWeight: 700, color: `hsl(${hue}, 50%, 55%)` }}>
                          {p.name[0]}
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* Name & Tagline */}
                  <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                    <Link href={`/project/${p.id}`} style={{ textDecoration: 'none' }}>
                      <h2 style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: '#e4e4e7',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {p.name}
                      </h2>
                    </Link>
                    <p style={{
                      fontSize: 14,
                      color: '#71717a',
                      margin: '4px 0 0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {p.tagline}
                    </p>
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
                      width: 52,
                      height: 60,
                      border: `1.5px solid ${isUpvoted ? '#0052FF' : '#27272a'}`,
                      borderRadius: 8,
                      background: isUpvoted ? 'rgba(0, 82, 255, 0.1)' : 'transparent',
                      color: isUpvoted ? '#0052FF' : '#a1a1aa',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      flexShrink: 0,
                    }}
                  >
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" style={{ marginBottom: 4 }}>
                      <path d="M6 0L0 6h12L6 0z" fill="currentColor" />
                    </svg>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>{p.upvotes}</span>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Submit CTA */}
        <div style={{ marginTop: 48, textAlign: 'center' }}>
          <Link
            href="/submit"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: '#0052FF',
              color: '#fff',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Submit your product
          </Link>
        </div>
      </main>

      <SubscriptionModal isOpen={showSubModal} onClose={() => setShowSubModal(false)} limitMessage={rateLimitMsg} getAccessToken={getAccessToken} />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        button:hover:not(:disabled) {
          border-color: #0052FF !important;
          color: #0052FF !important;
        }
        a:hover h2 {
          color: #fff !important;
        }
      `}</style>
    </div>
  );
}
