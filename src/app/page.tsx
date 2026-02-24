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

const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '🔥' },
  { id: 'agents', label: 'AI Agents', emoji: '🤖' },
  { id: 'defi', label: 'DeFi', emoji: '💰' },
  { id: 'infrastructure', label: 'Infra', emoji: '🏗️' },
  { id: 'social', label: 'Social', emoji: '👥' },
  { id: 'gaming', label: 'Gaming', emoji: '🎮' },
  { id: 'tools', label: 'Tools', emoji: '🛠️' },
];

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [upvoted, setUpvoted] = useState<Set<string>>(new Set());
  const [voting, setVoting] = useState<Set<string>>(new Set());
  const [showSubModal, setShowSubModal] = useState(false);
  const [rateLimitMsg, setRateLimitMsg] = useState('');
  const [filter, setFilter] = useState('all');
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

  const generateGradient = (name: string) => {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = hash % 360;
    return `linear-gradient(145deg, hsl(${hue}, 45%, 18%) 0%, hsl(${(hue + 40) % 360}, 35%, 12%) 100%)`;
  };

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(p => p.category === filter);

  return (
    <div className="app-container">
      <Header />

      <main className="main-content">
        {/* Hero Section */}
        <div className="page-header">
          <div className="header-left">
            <h1 className="page-title">Explore</h1>
            <span className="title-accent">🔥</span>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="category-pills">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`pill ${filter === cat.id ? 'active' : ''}`}
            >
              <span className="pill-emoji">{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Card Grid */}
        <div className="card-grid">
          {/* Featured/Sponsored Card - Always First */}
          {sponsored ? (
            <a
              href={sponsored.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card sponsored-card"
            >
              <div className="sponsored-badge">⚡ FEATURED</div>
              {sponsored.image_url && (
                <div 
                  className="sponsored-image"
                  style={{ backgroundImage: `url(${sponsored.image_url})` }}
                />
              )}
              <div className="sponsored-content">
                <h3 className="sponsored-title">{sponsored.title}</h3>
                <p className="sponsored-desc">{sponsored.description}</p>
              </div>
              <button className="sponsored-cta">
                <span>✨</span> Check it out
              </button>
            </a>
          ) : (
            <Link href="/docs" className="card sponsored-card promo-card">
              <div className="sponsored-badge">🚀 PROMOTE</div>
              <div className="promo-graphic">
                <div className="promo-icon">📢</div>
              </div>
              <div className="sponsored-content">
                <h3 className="sponsored-title">Get Featured</h3>
                <p className="sponsored-desc">
                  Put your product in front of thousands of Base builders. First spot = max visibility.
                </p>
              </div>
              <button className="sponsored-cta promo-cta">
                Book this spot →
              </button>
            </Link>
          )}

          {/* Product Cards */}
          {loading ? (
            Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="card skeleton-card">
                <div className="skeleton-thumb" />
                <div className="skeleton-content">
                  <div className="skeleton-title" />
                  <div className="skeleton-text" />
                </div>
              </div>
            ))
          ) : filteredProjects.length === 0 ? (
            <div className="empty-state">
              <span className="empty-emoji">🔍</span>
              <p>No products in this category yet</p>
              <Link href="/submit" className="empty-cta">Be the first →</Link>
            </div>
          ) : (
            filteredProjects.map((project, index) => {
              const isUpvoted = upvoted.has(project.id);
              const isTop3 = index < 3;

              return (
                <div key={project.id} className="card product-card">
                  {/* Thumbnail */}
                  <Link href={`/project/${project.id}`} className="card-thumb-link">
                    <div 
                      className="card-thumbnail"
                      style={{
                        backgroundImage: project.logo_url 
                          ? `url(${project.logo_url})`
                          : 'none',
                        background: project.logo_url 
                          ? `url(${project.logo_url}) center/cover`
                          : generateGradient(project.name),
                      }}
                    >
                      {!project.logo_url && (
                        <span className="thumb-letter">{project.name[0].toUpperCase()}</span>
                      )}
                      {isTop3 && (
                        <div className={`rank-badge rank-${index + 1}`}>
                          #{index + 1}
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Card Body */}
                  <div className="card-body">
                    <Link href={`/project/${project.id}`} className="card-title-link">
                      <h3 className="card-title">{project.name}</h3>
                    </Link>
                    <p className="card-tagline">
                      {project.tagline.length > 55 
                        ? project.tagline.slice(0, 55) + '...' 
                        : project.tagline}
                    </p>

                    {/* Card Footer */}
                    <div className="card-footer">
                      <div className="card-meta">
                        {project.twitter_handle && (
                          <a 
                            href={`https://x.com/${project.twitter_handle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="twitter-link"
                          >
                            @{project.twitter_handle}
                          </a>
                        )}
                      </div>
                      <button
                        onClick={() => handleUpvote(project.id)}
                        disabled={voting.has(project.id)}
                        className={`upvote-btn ${isUpvoted ? 'upvoted' : ''}`}
                      >
                        <svg 
                          width="10" 
                          height="8" 
                          viewBox="0 0 10 8" 
                          fill="currentColor"
                        >
                          <path d="M5 0L0 8h10L5 0z" />
                        </svg>
                        <span>{project.upvotes}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Submit CTA */}
        <div className="submit-cta-section">
          <Link href="/submit" className="submit-cta-btn">
            <span>🚀</span> Launch your product
          </Link>
          <p className="submit-subtext">Join the Based ecosystem</p>
        </div>
      </main>

      <SubscriptionModal 
        isOpen={showSubModal} 
        onClose={() => setShowSubModal(false)} 
        limitMessage={rateLimitMsg} 
        getAccessToken={getAccessToken} 
      />

      <style>{`
        .app-container {
          min-height: 100vh;
          background: #111118;
          color: #fff;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .main-content {
          max-width: 1320px;
          margin: 0 auto;
          padding: 32px 24px 80px;
        }

        /* Page Header */
        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 28px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .page-title {
          font-size: 32px;
          font-weight: 700;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .title-accent {
          font-size: 28px;
        }

        /* Category Pills */
        .category-pills {
          display: flex;
          gap: 10px;
          margin-bottom: 32px;
          overflow-x: auto;
          padding-bottom: 8px;
          -webkit-overflow-scrolling: touch;
        }

        .category-pills::-webkit-scrollbar {
          display: none;
        }

        .pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 18px;
          border-radius: 100px;
          border: 1px solid #2a2a3a;
          background: #1a1a24;
          color: #888;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .pill:hover {
          border-color: #3a3a4a;
          color: #aaa;
        }

        .pill.active {
          background: #0052FF;
          border-color: #0052FF;
          color: #fff;
        }

        .pill-emoji {
          font-size: 14px;
        }

        /* Card Grid - 4 columns desktop, 2 tablet, 1 mobile */
        .card-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        @media (max-width: 1100px) {
          .card-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 600px) {
          .card-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Base Card */
        .card {
          background: #1a1a24;
          border-radius: 16px;
          border: 1px solid #252532;
          overflow: hidden;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
        }

        /* Sponsored/Featured Card */
        .sponsored-card {
          background: linear-gradient(145deg, #FF8C00 0%, #FF5500 50%, #E64500 100%);
          border: none;
          padding: 20px;
          display: flex;
          flex-direction: column;
          min-height: 360px;
          text-decoration: none;
          color: #000;
          position: relative;
        }

        .promo-card {
          background: linear-gradient(145deg, #0066FF 0%, #0044DD 50%, #0033BB 100%);
          color: #fff;
        }

        .sponsored-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          width: fit-content;
          margin-bottom: 16px;
        }

        .promo-card .sponsored-badge {
          background: rgba(255, 255, 255, 0.2);
        }

        .sponsored-image {
          width: 100%;
          height: 120px;
          background-size: cover;
          background-position: center;
          border-radius: 12px;
          margin-bottom: 16px;
        }

        .promo-graphic {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100px;
          margin-bottom: 16px;
        }

        .promo-icon {
          font-size: 64px;
          filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3));
        }

        .sponsored-content {
          flex: 1;
        }

        .sponsored-title {
          font-size: 22px;
          font-weight: 700;
          margin: 0 0 8px;
        }

        .sponsored-desc {
          font-size: 14px;
          line-height: 1.5;
          opacity: 0.85;
          margin: 0;
        }

        .sponsored-cta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 14px;
          margin-top: 20px;
          background: rgba(0, 0, 0, 0.15);
          border: 2px solid rgba(0, 0, 0, 0.2);
          border-radius: 12px;
          color: inherit;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .sponsored-cta:hover {
          background: rgba(0, 0, 0, 0.25);
        }

        .promo-cta {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.25);
        }

        .promo-cta:hover {
          background: rgba(255, 255, 255, 0.25);
        }

        /* Product Cards */
        .product-card {
          display: flex;
          flex-direction: column;
        }

        .card-thumb-link {
          display: block;
          text-decoration: none;
        }

        .card-thumbnail {
          width: 100%;
          height: 180px;
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .thumb-letter {
          font-size: 56px;
          font-weight: 800;
          color: rgba(255, 255, 255, 0.6);
          text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .rank-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          padding: 5px 10px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
        }

        .rank-1 {
          background: linear-gradient(135deg, #FFD700, #FFA500);
          color: #000;
          box-shadow: 0 2px 8px rgba(255, 215, 0, 0.4);
        }

        .rank-2 {
          background: linear-gradient(135deg, #E8E8E8, #A0A0A0);
          color: #000;
        }

        .rank-3 {
          background: linear-gradient(135deg, #CD7F32, #A0522D);
          color: #fff;
        }

        .card-body {
          padding: 16px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .card-title-link {
          text-decoration: none;
        }

        .card-title {
          font-size: 16px;
          font-weight: 600;
          color: #fff;
          margin: 0 0 8px;
          transition: color 0.2s;
        }

        .card-title-link:hover .card-title {
          color: #0066FF;
        }

        .card-tagline {
          font-size: 13px;
          color: #777;
          line-height: 1.45;
          margin: 0 0 16px;
          flex: 1;
        }

        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
        }

        .card-meta {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .twitter-link {
          font-size: 12px;
          color: #555;
          text-decoration: none;
          transition: color 0.2s;
        }

        .twitter-link:hover {
          color: #1DA1F2;
        }

        .upvote-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 10px;
          border: none;
          background: #252532;
          color: #888;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .upvote-btn:hover:not(:disabled) {
          background: #0052FF;
          color: #fff;
        }

        .upvote-btn.upvoted {
          background: #0052FF;
          color: #fff;
        }

        .upvote-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Skeleton Loading */
        .skeleton-card {
          min-height: 300px;
        }

        .skeleton-thumb {
          height: 180px;
          background: linear-gradient(90deg, #1a1a24 25%, #252532 50%, #1a1a24 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        .skeleton-content {
          padding: 16px;
        }

        .skeleton-title {
          height: 18px;
          width: 60%;
          background: #252532;
          border-radius: 4px;
          margin-bottom: 12px;
        }

        .skeleton-text {
          height: 14px;
          width: 90%;
          background: #252532;
          border-radius: 4px;
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        /* Empty State */
        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 80px 20px;
          color: #555;
        }

        .empty-emoji {
          font-size: 48px;
          display: block;
          margin-bottom: 16px;
        }

        .empty-state p {
          font-size: 16px;
          margin: 0 0 16px;
        }

        .empty-cta {
          color: #0052FF;
          text-decoration: none;
          font-weight: 500;
        }

        .empty-cta:hover {
          text-decoration: underline;
        }

        /* Submit CTA Section */
        .submit-cta-section {
          text-align: center;
          margin-top: 60px;
        }

        .submit-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 32px;
          background: linear-gradient(135deg, #0052FF 0%, #0066FF 100%);
          color: #fff;
          border-radius: 14px;
          font-size: 16px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.25s ease;
          box-shadow: 0 4px 20px rgba(0, 82, 255, 0.3);
        }

        .submit-cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 82, 255, 0.4);
        }

        .submit-subtext {
          margin-top: 12px;
          font-size: 14px;
          color: #555;
        }

        /* Mobile Adjustments */
        @media (max-width: 600px) {
          .main-content {
            padding: 20px 16px 60px;
          }

          .page-title {
            font-size: 26px;
          }

          .pill {
            padding: 8px 14px;
            font-size: 12px;
          }

          .card-thumbnail {
            height: 160px;
          }

          .sponsored-card {
            min-height: 320px;
          }
        }
      `}</style>
    </div>
  );
}
