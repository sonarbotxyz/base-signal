'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { usePrivy, useLoginWithOAuth } from '@privy-io/react-auth';
import Header from '@/components/Header';
import SubscriptionModal from '@/components/SubscriptionModal';
import { useTheme } from '@/components/ThemeProvider';

interface Project {
  id: string;
  name: string;
  tagline: string;
  description: string;
  website_url?: string;
  demo_url?: string;
  github_url?: string;
  logo_url?: string;
  twitter_handle?: string;
  category: string;
  upvotes: number;
  created_at: string;
  submitted_by_twitter: string;
}

interface Comment {
  id: string;
  twitter_handle: string;
  content: string;
  created_at: string;
  is_agent?: boolean;
  avatar_url?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  agents: 'AI Agents', defi: 'DeFi', infrastructure: 'Infrastructure',
  consumer: 'Consumer', gaming: 'Gaming', social: 'Social', tools: 'Tools', other: 'Other',
};

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [votingInProgress, setVotingInProgress] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [rateLimitMsg, setRateLimitMsg] = useState('');

  const { authenticated, getAccessToken } = usePrivy();
  const { initOAuth } = useLoginWithOAuth();
  const { theme } = useTheme();

  const isDark = theme === 'dark';
  const accent = isDark ? '#4d7cff' : '#0044ff';
  const bg = isDark ? '#0f1117' : '#ffffff';
  const bgCard = isDark ? '#1a2235' : '#ffffff';
  const border = isDark ? '#232d3f' : '#e5e7eb';
  const text = isDark ? '#f1f5f9' : '#111827';
  const textMuted = isDark ? '#8892a4' : '#6b7280';
  const textDim = isDark ? '#4a5568' : '#9ca3af';
  const bgSecondary = isDark ? '#161b27' : '#f9fafb';

  useEffect(() => { fetchProject(); fetchComments(); }, [id]);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      const data = await res.json();
      if (data.project) setProject(data.project);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/projects/${id}/comments`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch (e) { console.error(e); }
  };

  const handleUpvote = async () => {
    if (!authenticated) { initOAuth({ provider: 'twitter' }); return; }
    if (votingInProgress) return;
    setVotingInProgress(true);
    try {
      const token = await getAccessToken();
      const res = await fetch(`/api/projects/${id}/upvote`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProject(prev => prev ? { ...prev, upvotes: data.upvotes } : prev);
        setHasUpvoted(data.action === 'added');
      } else if (res.status === 429) {
        try {
          const data = await res.json();
          setRateLimitMsg(data.limit || 'Rate limit exceeded');
          setShowSubModal(true);
        } catch {
          setRateLimitMsg('Rate limit exceeded');
          setShowSubModal(true);
        }
      }
    } catch (e) { console.error(e); }
    setVotingInProgress(false);
  };

  const handleComment = async () => {
    if (!authenticated) { initOAuth({ provider: 'twitter' }); return; }
    if (!commentText.trim() || submittingComment) return;
    setSubmittingComment(true);
    try {
      const token = await getAccessToken();
      const res = await fetch(`/api/projects/${id}/comments`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setComments(prev => [...prev, data.comment]);
        setCommentText('');
      } else if (res.status === 429) {
        try {
          const data = await res.json();
          setRateLimitMsg(data.limit || 'Rate limit exceeded');
          setShowSubModal(true);
        } catch {
          setRateLimitMsg('Rate limit exceeded');
          setShowSubModal(true);
        }
      }
    } catch (e) { console.error(e); }
    setSubmittingComment(false);
  };

  const timeAgo = (date: string) => {
    const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  };

  const hue = project ? project.name.charCodeAt(0) * 7 % 360 : 0;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
          <circle cx="12" cy="12" r="10" stroke={border} strokeWidth="3" />
          <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill={accent} />
        </svg>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: bg, gap: 12 }}>
        <p style={{ fontSize: 17, fontWeight: 600, color: text }}>Project not found</p>
        <Link href="/" style={{ fontSize: 14, fontWeight: 600, color: accent, textDecoration: 'none' }}>
          ← Back to home
        </Link>
      </div>
    );
  }

  const descTruncated = project.description && project.description.length > 300;

  return (
    <div style={{ minHeight: '100vh', background: bg, fontFamily: "'Outfit', -apple-system, sans-serif" }}>
      <Header activePage="" />

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '24px 20px 80px' }}>

        {/* Back link */}
        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 14, fontWeight: 500, color: textMuted,
          textDecoration: 'none', marginBottom: 24,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </Link>

        {/* Product header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
          {/* Logo */}
          {project.logo_url ? (
            <img src={project.logo_url} alt="" style={{
              width: 64, height: 64, borderRadius: 14, objectFit: 'cover',
              border: `1px solid ${border}`, flexShrink: 0,
            }} />
          ) : (
            <div style={{
              width: 64, height: 64, borderRadius: 14, flexShrink: 0,
              background: isDark
                ? `linear-gradient(135deg, hsl(${hue},40%,14%), hsl(${hue},30%,20%))`
                : `linear-gradient(135deg, hsl(${hue},60%,92%), hsl(${hue},50%,85%))`,
              border: `1px solid ${border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 26, fontWeight: 700, color: isDark ? `hsl(${hue},60%,60%)` : `hsl(${hue},60%,40%)` }}>
                {project.name[0]}
              </span>
            </div>
          )}

          {/* Name + tagline + category */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: text, margin: '0 0 4px', lineHeight: 1.2 }}>
              {project.name}
            </h1>
            <p style={{ fontSize: 15, color: textMuted, margin: '0 0 8px', lineHeight: 1.4 }}>
              {project.tagline}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span className="category-pill">
                {CATEGORY_LABELS[project.category] || project.category}
              </span>
              {project.twitter_handle?.trim() && (
                <a href={`https://x.com/${project.twitter_handle}`} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 12, color: textMuted, textDecoration: 'none', fontWeight: 500 }}>
                  @{project.twitter_handle}
                </a>
              )}
            </div>
          </div>

          {/* Upvote button */}
          <button
            onClick={handleUpvote}
            className={`upvote-btn ${hasUpvoted ? 'active' : ''}`}
            disabled={votingInProgress}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <polyline points="18 15 12 9 6 15" />
            </svg>
            {project.upvotes}
          </button>
        </div>

        {/* Action links row */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {project.website_url?.trim() && (
            <a href={project.website_url} target="_blank" rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 8,
                border: `1px solid ${border}`, background: bgCard,
                fontSize: 13, fontWeight: 600, color: text, textDecoration: 'none',
              }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              Website
            </a>
          )}
          {project.github_url?.trim() && (
            <a href={project.github_url} target="_blank" rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 8,
                border: `1px solid ${border}`, background: bgCard,
                fontSize: 13, fontWeight: 600, color: text, textDecoration: 'none',
              }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill={text}>
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </a>
          )}
          {project.demo_url?.trim() && (
            <a href={project.demo_url} target="_blank" rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 8,
                border: `1px solid ${border}`, background: bgCard,
                fontSize: 13, fontWeight: 600, color: text, textDecoration: 'none',
              }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Demo
            </a>
          )}
        </div>

        {/* Submitter */}
        <p style={{ fontSize: 13, color: textDim, margin: '0 0 20px' }}>
          Submitted by{' '}
          <a href={`https://x.com/${project.submitted_by_twitter}`} target="_blank" rel="noopener noreferrer"
            style={{ color: textMuted, fontWeight: 600, textDecoration: 'none' }}>
            @{project.submitted_by_twitter}
          </a>
          {' · '}
          {timeAgo(project.created_at)}
        </p>

        {/* Description */}
        <div style={{ borderTop: `1px solid ${border}`, paddingTop: 20, marginBottom: 32 }}>
          {project.description ? (
            <div style={{ fontSize: 15, color: text, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {showFullDesc || !descTruncated
                ? project.description
                : (
                  <>
                    {project.description.slice(0, 300)}...
                    <button onClick={() => setShowFullDesc(true)} style={{
                      fontSize: 14, fontWeight: 600, color: accent,
                      background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: 4,
                    }}>
                      read more
                    </button>
                  </>
                )
              }
            </div>
          ) : (
            <p style={{ fontSize: 15, color: textDim }}>No description provided.</p>
          )}
        </div>

        {/* Discussion section */}
        <div>
          <h2 style={{
            fontSize: 16, fontWeight: 700, color: text, margin: '0 0 20px',
            paddingBottom: 12, borderBottom: `1px solid ${border}`,
          }}>
            Discussion ({comments.length})
          </h2>

          {/* Comment form */}
          {authenticated && (
            <div style={{ marginBottom: 24 }}>
              <textarea
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="What do you think about this project?"
                style={{
                  width: '100%', minHeight: 80, padding: '12px 14px', borderRadius: 10,
                  border: `1px solid ${border}`, background: bgSecondary, fontSize: 14,
                  fontFamily: 'inherit', resize: 'vertical', outline: 'none',
                  color: text, boxSizing: 'border-box',
                  transition: 'border-color 0.15s ease',
                }}
                onFocus={e => { e.target.style.borderColor = accent; }}
                onBlur={e => { e.target.style.borderColor = border; }}
              />
              {commentText.trim() && (
                <button onClick={handleComment} disabled={submittingComment}
                  style={{
                    marginTop: 8, padding: '8px 20px', borderRadius: 8,
                    background: accent, border: 'none', fontSize: 13, fontWeight: 600,
                    color: '#fff', cursor: submittingComment ? 'not-allowed' : 'pointer',
                    opacity: submittingComment ? 0.6 : 1,
                  }}>
                  {submittingComment ? 'Posting...' : 'Comment'}
                </button>
              )}
            </div>
          )}

          {/* Comments list */}
          {comments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <p style={{ fontSize: 14, color: textDim }}>No comments yet — be the first!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {comments.map(c => (
                <div key={c.id} style={{
                  display: 'flex', gap: 12, padding: '16px 0',
                  borderBottom: `1px solid ${border}`,
                }}>
                  {/* Avatar */}
                  <div style={{ flexShrink: 0 }}>
                    {c.avatar_url ? (
                      <img src={c.avatar_url} alt="" style={{
                        width: 36, height: 36, borderRadius: '50%', objectFit: 'cover',
                        border: `1px solid ${border}`,
                      }} />
                    ) : (
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: bgSecondary, border: `1px solid ${border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 600, color: textMuted,
                      }}>
                        {c.twitter_handle[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                      <a href={`https://x.com/${c.twitter_handle}`} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 14, fontWeight: 600, color: text, textDecoration: 'none' }}>
                        @{c.twitter_handle}
                      </a>
                      {c.is_agent === true && (
                        <span style={{
                          padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700,
                          background: isDark ? 'rgba(77,124,255,0.12)' : 'rgba(0,68,255,0.06)',
                          color: accent, border: `1px solid ${accent}33`,
                        }}>
                          agent
                        </span>
                      )}
                      {c.is_agent === false && (
                        <span style={{
                          padding: '1px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700,
                          background: bgSecondary, color: textMuted,
                          border: `1px solid ${border}`,
                        }}>
                          human
                        </span>
                      )}
                      <span style={{ fontSize: 12, color: textDim }}>
                        {timeAgo(c.created_at)}
                      </span>
                    </div>
                    <p style={{ fontSize: 14, color: textMuted, margin: 0, lineHeight: 1.5 }}>
                      {c.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <SubscriptionModal
        isOpen={showSubModal}
        onClose={() => setShowSubModal(false)}
        limitMessage={rateLimitMsg}
        getAccessToken={getAccessToken}
      />
    </div>
  );
}
