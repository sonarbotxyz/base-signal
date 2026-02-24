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
  title: string;
  description?: string;
  url: string;
  image_url?: string;
}

const FILTERS = ['All', 'Agents', 'DeFi', 'Infra', 'Social', 'Gaming', 'Tools'];

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
      const res = await fetch('/api/projects?sort=upvotes&limit=24');
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
    } catch (e) {}
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
          data.action === 'added' ? next.add(projectId) : next.delete(projectId);
          return next;
        });
      } else if (res.status === 429) {
        setRateLimitMsg('Rate limit reached');
        setShowSubModal(true);
      }
    } catch (e) {}
    setVoting(prev => { const n = new Set(prev); n.delete(projectId); return n; });
  };

  const hue = (s: string) => (s.charCodeAt(0) * 47) % 360;

  const filtered = filter === 'All' ? projects : projects.filter(p => {
    const map: Record<string, string> = { Agents: 'agents', DeFi: 'defi', Infra: 'infrastructure', Social: 'social', Gaming: 'gaming', Tools: 'tools' };
    return p.category === map[filter];
  });

  return (
    <div className="page">
      <Header />
      
      <main className="main">
        <div className="top-bar">
          <h1>Explore</h1>
          <div className="filters">
            {FILTERS.map(f => (
              <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid">
          {/* Sponsored Card */}
          <a href={sponsored?.url || '/submit'} target={sponsored ? '_blank' : '_self'} rel="noopener" className="card featured">
            <div className="card-visual featured-visual">
              {sponsored ? (
                <span className="featured-badge">AD</span>
              ) : (
                <span className="featured-badge">PROMO</span>
              )}
            </div>
            <div className="card-info">
              <h3>{sponsored?.title || 'Get Featured'}</h3>
              <p>{sponsored?.description || 'Promote your product to the Base community'}</p>
            </div>
            <div className="card-footer">
              <span className="cta-btn">{sponsored ? 'View' : 'Book Spot'}</span>
            </div>
          </a>

          {loading ? (
            Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="card skeleton" />
            ))
          ) : (
            filtered.map((p) => {
              const isUpvoted = upvoted.has(p.id);
              const h = hue(p.name);
              
              return (
                <div key={p.id} className="card">
                  <Link href={`/project/${p.id}`} className="card-visual">
                    {p.logo_url ? (
                      <img src={p.logo_url} alt="" />
                    ) : (
                      <div className="placeholder" style={{ background: `linear-gradient(135deg, hsl(${h},40%,25%), hsl(${h},35%,35%))` }}>
                        <span style={{ color: `hsl(${h},50%,65%)` }}>{p.name[0]}</span>
                      </div>
                    )}
                  </Link>
                  <div className="card-info">
                    <Link href={`/project/${p.id}`}>
                      <h3>{p.name}</h3>
                    </Link>
                    <p>{p.tagline.length > 50 ? p.tagline.slice(0, 50) + '...' : p.tagline}</p>
                  </div>
                  <div className="card-footer">
                    {p.twitter_handle && (
                      <a href={`https://x.com/${p.twitter_handle}`} target="_blank" rel="noopener" className="handle">
                        @{p.twitter_handle}
                      </a>
                    )}
                    <button className={`vote-btn ${isUpvoted ? 'voted' : ''}`} onClick={() => handleUpvote(p.id)} disabled={voting.has(p.id)}>
                      <svg viewBox="0 0 12 8" fill="currentColor"><path d="M6 0L0 8h12L6 0z"/></svg>
                      {p.upvotes}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      <SubscriptionModal isOpen={showSubModal} onClose={() => setShowSubModal(false)} limitMessage={rateLimitMsg} getAccessToken={getAccessToken} />

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #0c0c10;
          color: #eee;
        }
        .main {
          max-width: 1320px;
          margin: 0 auto;
          padding: 24px 20px 60px;
        }
        .top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 28px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .top-bar h1 {
          font-size: 26px;
          font-weight: 700;
          margin: 0;
        }
        .filters {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .filter-btn {
          padding: 7px 14px;
          border-radius: 6px;
          border: 1px solid #222;
          background: transparent;
          color: #777;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
        }
        .filter-btn:hover {
          border-color: #444;
          color: #aaa;
        }
        .filter-btn.active {
          background: #0052FF;
          border-color: #0052FF;
          color: #fff;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        @media (max-width: 1100px) { .grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 800px) { .grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 500px) { .grid { grid-template-columns: 1fr; } }
        
        .card {
          background: #131318;
          border: 1px solid #1e1e24;
          border-radius: 14px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform 0.2s, border-color 0.2s;
        }
        .card:hover {
          transform: translateY(-4px);
          border-color: #2a2a35;
        }
        .card.skeleton {
          min-height: 280px;
          background: linear-gradient(90deg, #131318 25%, #1a1a22 50%, #131318 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .card.featured {
          background: linear-gradient(145deg, #1a1000, #2a1800);
          border-color: #3d2800;
        }
        .card.featured:hover {
          border-color: #5a4000;
        }
        .card-visual {
          height: 160px;
          background: #1a1a22;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .card-visual img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .card-visual .placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .card-visual .placeholder span {
          font-size: 42px;
          font-weight: 700;
        }
        .featured-visual {
          background: linear-gradient(145deg, #FF8C00, #FF6B00);
        }
        .featured-badge {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          color: #000;
          background: rgba(0,0,0,0.2);
          padding: 4px 10px;
          border-radius: 4px;
        }
        .card-info {
          padding: 14px 16px 10px;
          flex: 1;
        }
        .card-info h3 {
          font-size: 15px;
          font-weight: 600;
          margin: 0 0 6px;
          color: #f0f0f0;
        }
        .card-info p {
          font-size: 13px;
          color: #666;
          margin: 0;
          line-height: 1.4;
        }
        .card-footer {
          padding: 10px 16px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .handle {
          font-size: 12px;
          color: #555;
          text-decoration: none;
        }
        .handle:hover {
          color: #888;
        }
        .vote-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 6px 12px;
          border-radius: 6px;
          border: 1px solid #2a2a35;
          background: #1a1a22;
          color: #888;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
        }
        .vote-btn svg {
          width: 10px;
          height: 8px;
        }
        .vote-btn:hover {
          border-color: #0052FF;
          color: #0052FF;
        }
        .vote-btn.voted {
          background: #0052FF;
          border-color: #0052FF;
          color: #fff;
        }
        .cta-btn {
          display: inline-block;
          padding: 8px 16px;
          background: rgba(0,0,0,0.25);
          border-radius: 6px;
          color: #000;
          font-size: 13px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
