'use client';

import { useState, useEffect, use, useCallback } from 'react';
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

interface SponsoredSpot {
  id: string;
  advertiser: string;
  title: string;
  description?: string;
  url: string;
  image_url?: string;
  usdc_paid: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  agents: 'AI Agents', defi: 'DeFi', infrastructure: 'Infrastructure',
  consumer: 'Consumer', gaming: 'Gaming', social: 'Social', tools: 'Tools', other: 'Other',
};

const mono = "var(--font-jetbrains, 'JetBrains Mono', monospace)";
const sans = "var(--font-outfit, 'Outfit', -apple-system, sans-serif)";

function Badge({ isAgent }: { isAgent?: boolean }) {
  const { theme, colors } = useTheme();
  if (isAgent === true) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center',
        padding: '1px 7px', borderRadius: 3,
        background: colors.accentGlow, border: `1px solid ${colors.accent}33`,
        fontSize: 10, fontWeight: 700, color: colors.accent, letterSpacing: 0.5,
        fontFamily: mono, textTransform: 'uppercase',
      }}>
        agent
      </span>
    );
  }
  if (isAgent === false) {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center',
        padding: '1px 7px', borderRadius: 3,
        background: colors.codeBg, border: `1px solid ${colors.border}`,
        fontSize: 10, fontWeight: 700, color: colors.textDim, letterSpacing: 0.5,
        fontFamily: mono, textTransform: 'uppercase',
      }}>
        human
      </span>
    );
  }
  return null;
}

function Avatar({ url, handle, size = 36 }: { url?: string; handle: string; size?: number }) {
  const { colors } = useTheme();
  if (url) {
    return <img src={url} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: `1px solid ${colors.border}` }} />;
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: colors.codeBg, border: `1px solid ${colors.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.36, fontWeight: 600, color: colors.textDim, fontFamily: mono,
    }}>
      {handle[0]?.toUpperCase()}
    </div>
  );
}

function RichDescription({ text }: { text: string }) {
  const { colors } = useTheme();
  const tweetRegex = /https?:\/\/(x\.com|twitter\.com)\/\w+\/status\/(\d+)\S*/g;
  const parts: { type: 'text' | 'url' | 'tweet'; value: string }[] = [];
  let offset = 0;
  let m;
  const tweetMatches: { index: number; length: number; url: string }[] = [];
  while ((m = tweetRegex.exec(text)) !== null) {
    tweetMatches.push({ index: m.index, length: m[0].length, url: m[0] });
  }
  for (const tweet of tweetMatches) {
    const before = text.slice(offset, tweet.index);
    if (before) pushTextAndUrls(parts, before);
    parts.push({ type: 'tweet', value: tweet.url });
    offset = tweet.index + tweet.length;
  }
  const tail = text.slice(offset);
  if (tail) pushTextAndUrls(parts, tail);

  return (
    <div>
      {parts.map((part, i) => {
        if (part.type === 'tweet') {
          return (
            <div key={i} style={{ margin: '12px 0' }}>
              <a href={part.value} target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                  borderRadius: 6, border: `1px solid ${colors.border}`, background: colors.codeBg,
                  textDecoration: 'none', color: colors.text, fontSize: 13, fontWeight: 500,
                  fontFamily: mono, transition: 'all 0.2s ease',
                }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill={colors.textMuted}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                <span style={{ color: colors.textMuted }}>view_post_on_x</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.textDim} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}>
                  <polyline points="9,18 15,12 9,6"/>
                </svg>
              </a>
            </div>
          );
        }
        if (part.type === 'url') {
          return <a key={i} href={part.value} target="_blank" rel="noopener noreferrer" style={{ color: colors.accent, fontWeight: 500, textDecoration: 'none', wordBreak: 'break-all', fontFamily: mono, fontSize: 13 }}>{part.value}</a>;
        }
        return <span key={i} style={{ whiteSpace: 'pre-wrap' }}>{part.value}</span>;
      })}
    </div>
  );
}

function pushTextAndUrls(parts: { type: 'text' | 'url' | 'tweet'; value: string }[], text: string) {
  let urlLast = 0;
  let um;
  const urlRe = /(https?:\/\/[^\s]+)/g;
  while ((um = urlRe.exec(text)) !== null) {
    if (um.index > urlLast) parts.push({ type: 'text', value: text.slice(urlLast, um.index) });
    parts.push({ type: 'url', value: um[0] });
    urlLast = um.index + um[0].length;
  }
  if (urlLast < text.length) parts.push({ type: 'text', value: text.slice(urlLast) });
}

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [allProjects, setAllProjects] = useState<{ id: string; name: string }[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [votingInProgress, setVotingInProgress] = useState(false);
  const [sponsoredSidebar, setSponsoredSidebar] = useState<SponsoredSpot | null>(null);
  const [showSubModal, setShowSubModal] = useState(false);
  const [rateLimitMsg, setRateLimitMsg] = useState('');

  const { authenticated, getAccessToken } = usePrivy();
  const { initOAuth } = useLoginWithOAuth();
  const { theme, colors } = useTheme();

  useEffect(() => { fetchProject(); fetchComments(); fetchAllProjects(); fetchSponsoredSidebar(); }, [id]);

  const fetchProject = async () => {
    try { const res = await fetch(`/api/projects/${id}`); const data = await res.json(); if (data.project) setProject(data.project); } catch (e) { console.error(e); }
    setLoading(false);
  };
  const fetchComments = async () => {
    try { const res = await fetch(`/api/projects/${id}/comments`); const data = await res.json(); setComments(data.comments || []); } catch (e) { console.error(e); }
  };
  const fetchAllProjects = async () => {
    try { const res = await fetch('/api/projects?sort=upvotes&limit=50'); const data = await res.json(); setAllProjects((data.projects || []).map((p: { id: string; name: string }) => ({ id: p.id, name: p.name }))); } catch (e) { console.error(e); }
  };

  const fetchSponsoredSidebar = async () => {
    try {
      const res = await fetch('/api/sponsored?type=project_sidebar');
      const data = await res.json();
      if (data.active_spot) {
        setSponsoredSidebar(data.active_spot);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpvote = async () => {
    if (!authenticated) { initOAuth({ provider: 'twitter' }); return; }
    if (votingInProgress) return;
    setVotingInProgress(true);
    try {
      const token = await getAccessToken();
      const res = await fetch(`/api/projects/${id}/upvote`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setProject(prev => prev ? { ...prev, upvotes: data.upvotes } : prev); setHasUpvoted(data.action === 'added'); }
      else if (res.status === 429) {
        try { const data = await res.json(); setRateLimitMsg(data.limit || 'Rate limit exceeded'); setShowSubModal(true); }
        catch { setRateLimitMsg('Rate limit exceeded'); setShowSubModal(true); }
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
      if (res.ok) { const data = await res.json(); setComments(prev => [...prev, data.comment]); setCommentText(''); }
      else if (res.status === 429) {
        try { const data = await res.json(); setRateLimitMsg(data.limit || 'Rate limit exceeded'); setShowSubModal(true); }
        catch { setRateLimitMsg('Rate limit exceeded'); setShowSubModal(true); }
      }
    } catch (e) { console.error(e); }
    setSubmittingComment(false);
  };

  const timeAgo = (date: string) => {
    const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (s < 60) return 'just now'; if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`; return `${Math.floor(s / 86400)}d ago`;
  };

  const currentIndex = allProjects.findIndex(p => p.id === id);
  const prevProject = currentIndex > 0 ? allProjects[currentIndex - 1] : null;
  const nextProject = currentIndex < allProjects.length - 1 ? allProjects[currentIndex + 1] : null;
  const dayRank = currentIndex >= 0 ? currentIndex + 1 : 1;
  const hue = project ? project.name.charCodeAt(0) * 7 % 360 : 0;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: colors.bg, gap: 16 }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
          <circle cx="12" cy="12" r="10" stroke={colors.border} strokeWidth="3" />
          <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="#0052FF" />
        </svg>
        <span style={{ fontFamily: mono, fontSize: 12, color: colors.textDim, letterSpacing: 1 }}>loading signal...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: colors.bg, gap: 12 }}>
        <div className="ascii-grid-bg" />
        <div className="scanline-overlay" />
        <p style={{ fontSize: 13, fontWeight: 600, color: colors.textDim, fontFamily: mono, letterSpacing: 1, zIndex: 2 }}>// signal_not_found</p>
        <Link href="/" style={{ fontSize: 13, fontWeight: 600, color: colors.accent, textDecoration: 'none', fontFamily: mono, zIndex: 2 }}>{'<-'} back_to_radar</Link>
      </div>
    );
  }

  const descTruncated = project.description && project.description.length > 150;

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, fontFamily: sans, paddingBottom: 140, position: 'relative' }}>

      <div className="ascii-grid-bg" />
      <div className="scanline-overlay" />

      <Header />

      {/* -- PRODUCT CONTENT -- */}
      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '20px 20px 0', position: 'relative', zIndex: 2 }}>
        <div className="project-container">

          {/* Main Content */}
          <div style={{ flex: '1', minWidth: 0, animation: 'fadeInUp 400ms cubic-bezier(0.16, 1, 0.3, 1) both' }}>

        {/* Signal Active Badge */}
        <div style={{ marginBottom: 16 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 3,
            background: colors.accentGlow, border: `1px solid ${colors.accent}4D`,
            color: colors.accent, fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
            textTransform: 'uppercase',
            fontFamily: mono,
            animation: 'glowPulse 3s ease-in-out infinite',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: colors.accent, boxShadow: '0 0 8px rgba(0, 82, 255, 0.6)' }} />
            signal active
          </span>
        </div>

        {/* Project Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
          {project.logo_url ? (
            <img src={project.logo_url} alt="" style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover', flexShrink: 0, border: `1px solid ${colors.border}` }} />
          ) : (
            <div style={{
              width: 44, height: 44, borderRadius: 6,
              background: `linear-gradient(135deg, hsl(${hue}, 50%, 12%), hsl(${hue}, 40%, 18%))`,
              border: `1px solid ${colors.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: `hsl(${hue}, 60%, 55%)`, fontFamily: mono }}>{project.name[0]}</span>
            </div>
          )}
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: colors.text, margin: 0, lineHeight: 1.2 }}>{project.name}</h1>
          </div>
        </div>

        <p style={{ fontSize: 15, color: colors.textMuted, margin: '0 0 4px', lineHeight: 1.5 }}>{project.tagline}</p>
        <p style={{ fontSize: 12, color: colors.textDim, margin: '0 0 20px', fontFamily: mono }}>
          submitted_by{' '}
          <a href={`https://x.com/${project.submitted_by_twitter}`} target="_blank" rel="noopener noreferrer" style={{ color: colors.accent, fontWeight: 500, textDecoration: 'none' }}>@{project.submitted_by_twitter}</a>
        </p>

        {/* Action Buttons */}
        <div className="action-buttons" style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {project.website_url?.trim() && (
            <a href={project.website_url} target="_blank" rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flex: 1,
                height: 44, borderRadius: 6, border: `1px solid ${colors.border}`, background: colors.bgCard,
                fontSize: 13, fontWeight: 600, color: colors.text, textDecoration: 'none',
                fontFamily: mono, transition: 'all 0.2s ease',
              }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              visit_website
            </a>
          )}
          <button onClick={handleUpvote}
            className={`upvote-btn ${hasUpvoted ? 'active' : ''}`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              height: 44, padding: '0 24px', borderRadius: 6,
              border: hasUpvoted ? `1px solid ${colors.accent}` : `1px solid ${colors.border}`,
              background: hasUpvoted ? colors.upvoteActiveBg : colors.upvoteBg,
              color: hasUpvoted ? colors.upvoteActiveText : colors.textMuted,
              fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s ease',
              fontFamily: mono,
              boxShadow: hasUpvoted ? '0 0 16px rgba(0, 82, 255, 0.3)' : 'none',
            }}
            onMouseEnter={e => { if (!hasUpvoted) e.currentTarget.style.boxShadow = '0 0 16px rgba(0, 82, 255, 0.3)'; }}
            onMouseLeave={e => { if (!hasUpvoted) e.currentTarget.style.boxShadow = 'none'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15" />
            </svg>
            upvote ({project.upvotes})
          </button>
        </div>

        {/* Category + Twitter Tags */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <span style={{
            fontSize: 11, color: colors.textMuted, fontWeight: 600,
            padding: '2px 8px', borderRadius: 3,
            background: colors.codeBg, border: `1px solid ${colors.border}`,
            fontFamily: mono,
          }}>{CATEGORY_LABELS[project.category] || project.category}</span>
          {project.twitter_handle?.trim() && (
            <>
              <span style={{ color: colors.border, fontFamily: mono, fontSize: 11 }}>|</span>
              <a href={`https://x.com/${project.twitter_handle}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: colors.textDim, fontWeight: 500, textDecoration: 'none', fontFamily: mono }}>@{project.twitter_handle}</a>
            </>
          )}
        </div>

        {/* Description */}
        {project.description ? (
          <div style={{ marginBottom: 20, fontSize: 14, color: colors.textMuted, lineHeight: 1.7 }}>
            {showFullDesc || !descTruncated ? (
              <RichDescription text={project.description} />
            ) : (
              <>
                <RichDescription text={project.description.slice(0, 150) + '...'} />
                <button onClick={() => setShowFullDesc(true)} style={{ fontSize: 12, fontWeight: 600, color: colors.accent, background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 4, fontFamily: mono }}>see_more</button>
              </>
            )}
          </div>
        ) : (
          <p style={{ fontSize: 13, color: colors.textDim, marginBottom: 20, fontFamily: mono }}>// no description yet</p>
        )}

        {/* Overview Stats Bar -- Terminal Style */}
        <div style={{
          display: 'flex', alignItems: 'stretch', gap: 0,
          borderRadius: 6, background: colors.bgCard, border: `1px solid ${colors.border}`,
          marginBottom: 24, overflow: 'hidden',
        }}>
          <div style={{ flex: 1, padding: '12px 16px', borderRight: `1px solid ${colors.border}` }}>
            <div style={{ fontSize: 10, color: colors.textDim, fontFamily: mono, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 }}>upvotes</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: colors.accent, fontFamily: mono }}>{project.upvotes}</div>
          </div>
          <div style={{ flex: 1, padding: '12px 16px', borderRight: `1px solid ${colors.border}` }}>
            <div style={{ fontSize: 10, color: colors.textDim, fontFamily: mono, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 }}>comments</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: colors.text, fontFamily: mono }}>{comments.length}</div>
          </div>
          <div style={{ flex: 1, padding: '12px 16px' }}>
            <div style={{ fontSize: 10, color: colors.textDim, fontFamily: mono, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 }}>launched</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: colors.textMuted, fontFamily: mono, marginTop: 4 }}>{timeAgo(project.created_at)}</div>
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${colors.border}`, marginBottom: 24 }} />

        {/* Discussion */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{
            fontSize: 14, fontWeight: 700, color: colors.text, margin: '0 0 20px',
            display: 'flex', alignItems: 'center', gap: 8, fontFamily: mono, letterSpacing: 0.5, textTransform: 'uppercase',
          }}>
            <span style={{ color: colors.accent }}>//</span>
            Discussion ({comments.length})
          </h2>

          {/* Comment input */}
          <div style={{
            display: 'flex', gap: 12, marginBottom: 24, padding: 16,
            borderRadius: 6, background: colors.bgCard, border: `1px solid ${colors.border}`,
          }}>
            <div style={{ flexShrink: 0 }}>
              <Avatar url={undefined} handle={'user'} size={32} />
            </div>
            <div style={{ flex: 1 }}>
              <textarea
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder={authenticated ? "> type your comment..." : "> sign in with X to comment..."}
                disabled={!authenticated}
                style={{
                  width: '100%', minHeight: 56, padding: '10px 12px', borderRadius: 6,
                  border: `1px solid ${colors.border}`, background: colors.codeBg, fontSize: 13,
                  fontFamily: mono, resize: 'vertical', outline: 'none',
                  color: colors.text, boxSizing: 'border-box',
                  transition: 'border-color 0.2s ease',
                }}
                onFocus={e => {
                  if (!authenticated) { e.target.blur(); initOAuth({ provider: 'twitter' }); }
                  else { e.target.style.borderColor = `${colors.accent}66`; }
                }}
                onBlur={e => { e.target.style.borderColor = colors.border; }}
              />
              {commentText.trim() && (
                <button onClick={handleComment} disabled={submittingComment}
                  style={{
                    marginTop: 8, height: 32, padding: '0 16px', borderRadius: 4,
                    background: colors.accent, border: 'none', fontSize: 12, fontWeight: 700,
                    color: '#fff', cursor: submittingComment ? 'not-allowed' : 'pointer',
                    opacity: submittingComment ? 0.6 : 1,
                    boxShadow: '0 0 12px rgba(0, 82, 255, 0.3)',
                    fontFamily: mono, letterSpacing: 0.5,
                  }}>
                  {submittingComment ? 'posting...' : 'submit'}
                </button>
              )}
            </div>
          </div>

          {comments.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '40px 0',
              borderRadius: 6, border: `1px dashed ${colors.border}`,
            }}>
              <p style={{ fontSize: 12, color: colors.textDim, fontFamily: mono }}>// no comments yet -- be the first</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {comments.map((c, idx) => (
                <div key={c.id} style={{
                  display: 'flex', gap: 12, padding: '14px 16px',
                  borderRadius: 6, background: colors.bgCard, border: `1px solid ${colors.border}`,
                  animation: `fadeInUp 400ms cubic-bezier(0.16, 1, 0.3, 1) both`,
                  animationDelay: `${idx * 50}ms`,
                }}>
                  <div style={{ flexShrink: 0 }}>
                    <Avatar url={c.avatar_url} handle={c.twitter_handle} size={32} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <a href={`https://x.com/${c.twitter_handle}`} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 13, fontWeight: 600, color: colors.text, textDecoration: 'none', fontFamily: mono }}>
                        @{c.twitter_handle}
                      </a>
                      <Badge isAgent={c.is_agent} />
                      <span style={{ fontSize: 11, color: colors.textDim, fontFamily: mono }}>{timeAgo(c.created_at)}</span>
                    </div>
                    <p style={{ fontSize: 13, color: colors.textMuted, margin: '6px 0 0', lineHeight: 1.6 }}>{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        </div> {/* End Main Content */}

        {/* Sidebar */}
        <div className="project-sidebar" style={{ animation: 'fadeInUp 400ms cubic-bezier(0.16, 1, 0.3, 1) 100ms both' }}>
          {sponsoredSidebar ? (
            <div style={{
              padding: 20, borderRadius: 6,
              background: colors.bgCard,
              border: `1px solid ${colors.accent}26`,
              position: 'sticky',
              top: 80,
            }}>
              <div style={{
                marginBottom: 12,
                fontSize: 10, fontWeight: 700,
                color: colors.textDim, textTransform: 'uppercase',
                letterSpacing: 1.2,
                fontFamily: mono,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{ color: colors.accent }}>//</span> sponsored
              </div>

              {sponsoredSidebar.image_url && (
                <div style={{ marginBottom: 14 }}>
                  <img
                    src={sponsoredSidebar.image_url}
                    alt={sponsoredSidebar.title}
                    style={{ width: '100%', height: 140, borderRadius: 6, objectFit: 'cover', border: `1px solid ${colors.border}` }}
                  />
                </div>
              )}

              <h3 style={{ fontSize: 16, fontWeight: 700, color: colors.text, margin: '0 0 8px' }}>
                {sponsoredSidebar.title}
              </h3>

              {sponsoredSidebar.description && (
                <p style={{ fontSize: 13, color: colors.textMuted, margin: '0 0 16px', lineHeight: 1.5 }}>
                  {sponsoredSidebar.description}
                </p>
              )}

              <a
                href={sponsoredSidebar.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block', textAlign: 'center',
                  padding: '10px 16px', borderRadius: 4,
                  background: colors.accent, color: '#fff',
                  fontSize: 12, fontWeight: 700,
                  textDecoration: 'none',
                  boxShadow: '0 0 16px rgba(0, 82, 255, 0.3)',
                  fontFamily: mono, letterSpacing: 0.5,
                }}
              >
                learn_more
              </a>
            </div>
          ) : (
            <div style={{
              padding: 20, borderRadius: 6,
              background: colors.bgCard,
              border: `1px dashed ${colors.accent}33`,
              position: 'sticky',
              top: 80,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 6,
                background: colors.accentGlow, border: `1px solid ${colors.accent}26`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
                </svg>
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: colors.text, margin: '0 0 6px', fontFamily: mono }}>
                promote_your_product
              </h3>
              <p style={{ fontSize: 12, color: colors.textDim, margin: '0 0 14px', lineHeight: 1.5 }}>
                This spot is open. Agents and humans can advertise here to reach builders and curators.
              </p>
              <Link href="/docs" style={{
                display: 'block', textAlign: 'center',
                padding: '8px 16px', borderRadius: 4,
                border: `1px solid ${colors.accent}66`, color: colors.accent,
                fontSize: 12, fontWeight: 700, textDecoration: 'none',
                fontFamily: mono, letterSpacing: 0.5,
              }}>
                learn_more
              </Link>
            </div>
          )}
          {/* Links section in sidebar */}
          {(() => {
            const links: { icon: React.ReactNode; label: string; url: string; sub: string }[] = [];
            if (project.website_url?.trim()) links.push({
              icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
              label: 'website', url: project.website_url!, sub: project.website_url!.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''),
            });
            if (project.twitter_handle?.trim()) links.push({
              icon: <svg width="12" height="12" viewBox="0 0 24 24" fill={colors.textMuted}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
              label: 'twitter', url: `https://x.com/${project.twitter_handle}`, sub: `@${project.twitter_handle}`,
            });
            if (project.github_url?.trim()) links.push({
              icon: <svg width="14" height="14" viewBox="0 0 24 24" fill={colors.textMuted}><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>,
              label: 'github', url: project.github_url!, sub: project.github_url!.replace(/^https?:\/\/(www\.)?github\.com\//, '').replace(/\/$/, ''),
            });
            if (project.demo_url?.trim()) links.push({
              icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
              label: 'demo', url: project.demo_url!, sub: project.demo_url!.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''),
            });
            if (links.length === 0) return null;
            return (
              <div style={{
                marginTop: 12, padding: 16, borderRadius: 6,
                background: colors.bgCard, border: `1px solid ${colors.border}`,
              }}>
                <p style={{
                  fontSize: 10, fontWeight: 700, color: colors.textDim, textTransform: 'uppercase',
                  letterSpacing: 1.2, margin: '0 0 10px', fontFamily: mono,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span style={{ color: colors.accent }}>//</span> links
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {links.map((l, i) => (
                    <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
                      textDecoration: 'none', transition: 'opacity 0.15s',
                      borderBottom: i < links.length - 1 ? `1px solid ${colors.border}` : 'none',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    >
                      <div style={{ flexShrink: 0, width: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{l.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: colors.text, lineHeight: 1.2, fontFamily: mono }}>{l.label}</div>
                        <div style={{ fontSize: 10, color: colors.textDim, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: mono, lineHeight: 1.4 }}>{l.sub}</div>
                      </div>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={colors.textDim} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.4 }}>
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        </div> {/* End flex container */}
      </main>

      {/* -- STICKY FOOTER -- */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
        background: colors.headerBg,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: `1px solid ${colors.border}`,
        padding: '12px 20px', paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
      }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap', minWidth: 0 }}>
              <span style={{ fontSize: 24, fontWeight: 800, color: colors.accent, lineHeight: 1, fontFamily: mono }}>#{dayRank}</span>
              <span style={{ fontSize: 11, color: colors.textDim, fontFamily: mono, letterSpacing: 0.5 }}>day_rank</span>
              <span style={{ fontSize: 11, color: colors.border, fontFamily: mono }}>|</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: colors.text, fontFamily: mono }}>
                <span style={{ color: colors.accent }}>{'>'}</span> {project.upvotes} upvotes
              </span>
            </div>
            <div style={{ display: 'flex', gap: 0, border: `1px solid ${colors.border}`, borderRadius: 4, overflow: 'hidden' }}>
              {prevProject ? (
                <Link href={`/project/${prevProject.id}`} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.bgCard, borderRight: `1px solid ${colors.border}`, textDecoration: 'none', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = colors.codeBg)}
                  onMouseLeave={e => (e.currentTarget.style.background = colors.bgCard)}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
                </Link>
              ) : (
                <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.borderLight, borderRight: `1px solid ${colors.border}`, opacity: 0.4 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={colors.textDim} strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
                </div>
              )}
              {nextProject ? (
                <Link href={`/project/${nextProject.id}`} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.bgCard, textDecoration: 'none', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = colors.codeBg)}
                  onMouseLeave={e => (e.currentTarget.style.background = colors.bgCard)}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
                </Link>
              ) : (
                <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.borderLight, opacity: 0.4 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={colors.textDim} strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <SubscriptionModal
        isOpen={showSubModal}
        onClose={() => setShowSubModal(false)}
        limitMessage={rateLimitMsg}
        getAccessToken={getAccessToken}
      />

      {/* CSS for responsive layout */}
      <style jsx>{`
        .project-container {
          display: flex;
          gap: 32px;
          align-items: flex-start;
        }
        .project-sidebar {
          width: 300px;
          flex-shrink: 0;
        }
        @media (max-width: 768px) {
          .project-container {
            flex-direction: column;
            gap: 20px;
          }
          .project-sidebar {
            width: 100%;
          }
        }
        @media (max-width: 400px) {
          .action-buttons {
            flex-direction: column !important;
          }
        }
      `}</style>
    </div>
  );
}
