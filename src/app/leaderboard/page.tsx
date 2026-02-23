'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { useTheme } from '@/components/ThemeProvider';

interface Project {
  id: string;
  name: string;
  tagline: string;
  logo_url?: string;
  twitter_handle?: string;
  category: string;
  upvotes: number;
  created_at: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  agents: 'AI Agents', defi: 'DeFi', infrastructure: 'Infrastructure',
  consumer: 'Consumer', gaming: 'Gaming', social: 'Social', tools: 'Tools', other: 'Other',
};

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function getWeekRange(year: number, week: number): { start: Date; end: Date } {
  const jan1 = new Date(Date.UTC(year, 0, 1));
  const jan1Day = jan1.getUTCDay() || 7;
  const startOfWeek1 = new Date(jan1);
  startOfWeek1.setUTCDate(jan1.getUTCDate() - jan1Day + 1);
  const start = new Date(startOfWeek1);
  start.setUTCDate(startOfWeek1.getUTCDate() + (week - 1) * 7);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  return { start, end };
}

function formatDateShort(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const ASCII_TROPHY = `     ___________
    '._==_==_=_.'
    .-\\:      /-.
   | (|:.     |) |
    '-|:.     |-'
      \\::.    /
       '::. .'
         ) (
       _.' '._
      \`───────\``;

export default function LeaderboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const { theme, colors } = useTheme();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentWeek = getWeekNumber(now);

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects?sort=upvotes&limit=100');
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

  const weekProjects = useMemo(() => {
    const { start, end } = getWeekRange(selectedYear, selectedWeek);
    const endOfDay = new Date(end);
    endOfDay.setUTCHours(23, 59, 59, 999);
    const filtered = projects.filter(p => {
      const created = new Date(p.created_at);
      return created >= start && created <= endOfDay;
    });
    return filtered.sort((a, b) => b.upvotes - a.upvotes);
  }, [projects, selectedYear, selectedWeek]);

  const { start: weekStart, end: weekEnd } = getWeekRange(selectedYear, selectedWeek);

  const goToPrevWeek = () => {
    if (selectedWeek <= 1) { setSelectedYear(selectedYear - 1); setSelectedWeek(52); }
    else { setSelectedWeek(selectedWeek - 1); }
  };

  const goToNextWeek = () => {
    if (selectedYear === currentYear && selectedWeek >= currentWeek) return;
    if (selectedWeek >= 52) { setSelectedYear(selectedYear + 1); setSelectedWeek(1); }
    else { setSelectedWeek(selectedWeek + 1); }
  };

  const isCurrentWeek = selectedYear === currentYear && selectedWeek === currentWeek;
  const canGoNext = !(selectedYear === currentYear && selectedWeek >= currentWeek);
  const hueFrom = (s: string) => s.charCodeAt(0) * 7 % 360;

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, display: 'flex', flexDirection: 'column', position: 'relative' }}>

      <div className="ascii-grid-bg" />
      <div className="scanline-overlay" />

      <Header />

      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 20px 80px', flex: 1, width: '100%', boxSizing: 'border-box', position: 'relative', zIndex: 2 }}>

        {/* ASCII Trophy + Title */}
        <div style={{ textAlign: 'center', marginBottom: 32, animation: 'fadeInUp 400ms cubic-bezier(0.16, 1, 0.3, 1) both' }}>
          <pre style={{
            fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
            fontSize: 10, lineHeight: 1.4,
            color: '#0052FF',
            textShadow: '0 0 8px rgba(0, 82, 255, 0.3)',
            margin: '0 auto 16px',
            display: 'inline-block',
            userSelect: 'none',
          }}>
            {ASCII_TROPHY}
          </pre>
          <h1 style={{
            fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
            fontSize: 24, fontWeight: 700, color: colors.text, margin: '0 0 4px',
          }}>
            Weekly Rankings
          </h1>
          <p style={{ fontSize: 14, color: colors.textMuted, margin: 0 }}>
            Top signals by upvotes, ranked weekly
          </p>
        </div>

        {/* Week selector - terminal style */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap',
          animation: 'fadeInUp 400ms cubic-bezier(0.16, 1, 0.3, 1) 100ms both',
        }}>
          <button onClick={goToPrevWeek} style={{
            width: 32, height: 32, borderRadius: 4,
            border: `1px solid ${colors.border}`, background: colors.bgCard,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>

          <div style={{
            display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap',
            fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
          }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: colors.text }}>
              Week {selectedWeek}
            </span>
            <span style={{ fontSize: 12, color: colors.textDim }}>
              {formatDateShort(weekStart)} – {formatDateShort(weekEnd)}, {selectedYear}
            </span>
            {isCurrentWeek && (
              <span style={{
                fontSize: 10, fontWeight: 700, color: '#22c55e',
                background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)',
                padding: '2px 8px', borderRadius: 3,
                textTransform: 'uppercase', letterSpacing: 0.5,
              }}>
                Live
              </span>
            )}
          </div>

          <button onClick={goToNextWeek} disabled={!canGoNext} style={{
            width: 32, height: 32, borderRadius: 4,
            border: `1px solid ${colors.border}`,
            background: canGoNext ? colors.bgCard : colors.borderLight,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: canGoNext ? 'pointer' : 'default', opacity: canGoNext ? 1 : 0.4,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>

        {/* Product list */}
        <div style={{
          border: `1px solid ${colors.border}`, borderRadius: 6,
          background: colors.bgCard, overflow: 'hidden',
          animation: 'fadeInUp 400ms cubic-bezier(0.16, 1, 0.3, 1) 200ms both',
        }}>
          {/* Terminal header */}
          <div style={{
            padding: '8px 16px', borderBottom: `1px solid ${colors.border}`,
            display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
            fontSize: 11, color: colors.textDim,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', opacity: 0.6 }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#eab308', opacity: 0.6 }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', opacity: 0.6 }} />
            <span style={{ marginLeft: 8 }}>~/sonarbot/leaderboard --week={selectedWeek}</span>
          </div>

          {loading ? (
            <div>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderBottom: `1px solid ${colors.border}` }}>
                  <div style={{ width: 28, height: 16, borderRadius: 3 }} className="shimmer" />
                  <div style={{ width: 44, height: 44, borderRadius: 8 }} className="shimmer" />
                  <div style={{ flex: 1 }}>
                    <div style={{ width: 160, height: 14, borderRadius: 3, marginBottom: 6 }} className="shimmer" />
                    <div style={{ width: 220, height: 12, borderRadius: 3 }} className="shimmer" />
                  </div>
                  <div style={{ width: 48, height: 48, borderRadius: 6 }} className="shimmer" />
                </div>
              ))}
            </div>
          ) : weekProjects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{
                fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
                fontSize: 12, color: colors.textDim, marginBottom: 8,
              }}>
                {'> no signals this week'}
              </div>
              <p style={{ fontSize: 14, color: colors.textMuted }}>
                {isCurrentWeek ? 'Products launched this week will appear here.' : 'Try scanning a different week.'}
              </p>
            </div>
          ) : (
            <div>
              {weekProjects.map((p, i) => {
                const hue = hueFrom(p.name);
                const rank = i + 1;
                return (
                  <div key={p.id} style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                    borderBottom: `1px solid ${colors.border}`,
                    transition: 'background 150ms ease',
                    animation: `fadeInUp 300ms cubic-bezier(0.16, 1, 0.3, 1) ${i * 50}ms both`,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0, 82, 255, 0.03)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Rank */}
                    <span style={{
                      fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
                      fontSize: rank <= 3 ? 16 : 13, fontWeight: 700,
                      color: rank === 1 ? '#0052FF' : rank <= 3 ? colors.text : colors.textDim,
                      minWidth: 28, textAlign: 'center', flexShrink: 0,
                      textShadow: rank === 1 ? '0 0 12px rgba(0, 82, 255, 0.5)' : 'none',
                    }}>
                      {String(rank).padStart(2, '0')}
                    </span>

                    {/* Logo */}
                    <Link href={`/project/${p.id}`} style={{ flexShrink: 0 }}>
                      {p.logo_url ? (
                        <img src={p.logo_url} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', border: `1px solid ${colors.border}` }} />
                      ) : (
                        <div style={{
                          width: 44, height: 44, borderRadius: 8,
                          background: theme === 'dark' ? `linear-gradient(135deg, hsl(${hue}, 40%, 12%), hsl(${hue}, 30%, 16%))` : `linear-gradient(135deg, hsl(${hue}, 50%, 92%), hsl(${hue}, 40%, 85%))`,
                          border: `1px solid ${colors.border}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <span style={{ fontSize: 16, fontWeight: 700, color: theme === 'dark' ? `hsl(${hue}, 55%, 55%)` : `hsl(${hue}, 60%, 40%)` }}>{p.name[0]}</span>
                        </div>
                      )}
                    </Link>

                    {/* Name + tagline */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link href={`/project/${p.id}`} style={{ textDecoration: 'none' }}>
                        <h3 style={{ fontSize: 14, fontWeight: 600, color: colors.text, margin: 0, lineHeight: 1.3 }}>{p.name}</h3>
                      </Link>
                      <p style={{ fontSize: 12, color: colors.textMuted, margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.tagline}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        <span style={{
                          fontSize: 10, color: colors.textDim, padding: '1px 6px', borderRadius: 3,
                          border: `1px solid ${colors.border}`, background: colors.bg,
                          fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
                        }}>
                          {CATEGORY_LABELS[p.category] || p.category}
                        </span>
                        {p.twitter_handle && (
                          <span style={{ fontSize: 11, color: colors.textDim, fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)" }}>@{p.twitter_handle}</span>
                        )}
                      </div>
                    </div>

                    {/* Comments */}
                    <Link href={`/project/${p.id}`} style={{
                      flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      width: 44, height: 48, color: colors.textDim, textDecoration: 'none', gap: 3,
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      <span style={{ fontSize: 11, fontWeight: 600, fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)" }}>{commentCounts[p.id] || 0}</span>
                    </Link>

                    {/* Upvote count */}
                    <div style={{
                      flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      width: 48, height: 48, borderRadius: 6,
                      border: rank === 1 ? '1px solid rgba(0, 82, 255, 0.4)' : `1px solid ${colors.border}`,
                      background: rank === 1 ? 'rgba(0, 82, 255, 0.1)' : colors.bg,
                      boxShadow: rank === 1 ? '0 0 12px rgba(0, 82, 255, 0.2)' : 'none',
                    }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={rank === 1 ? '#0052FF' : colors.textMuted} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="18 15 12 9 6 15" />
                      </svg>
                      <span style={{
                        fontSize: 13, fontWeight: 700, lineHeight: 1,
                        color: rank === 1 ? '#0052FF' : colors.text,
                        fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
                      }}>{p.upvotes}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${colors.border}`, background: colors.bg, padding: 20, position: 'relative', zIndex: 2 }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: colors.textDim, fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)" }}>
            <span style={{ fontWeight: 700, color: '#0052FF' }}>sonarbot</span>
            <span style={{ color: colors.border }}>·</span>
            <span>{'\u00A9'} {new Date().getFullYear()}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 11, color: colors.textDim, fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)" }}>
            <Link href="/docs" style={{ color: colors.textDim, textDecoration: 'none' }}>Docs</Link>
            <Link href="/curation" style={{ color: colors.textDim, textDecoration: 'none' }}>Curation</Link>
            <a href="https://x.com/sonarbotxyz" target="_blank" rel="noopener noreferrer" style={{ color: colors.textDim, textDecoration: 'none' }}>@sonarbotxyz</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
