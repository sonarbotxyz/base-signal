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

const TROPHIES = ['🥇', '🥈', '🥉'];

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

export default function LeaderboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentWeek = getWeekNumber(now);

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);

  const isDark = theme === 'dark';
  const border = isDark ? '#232d3f' : '#e5e7eb';
  const textMuted = isDark ? '#8892a4' : '#6b7280';
  const textDim = isDark ? '#4a5568' : '#9ca3af';
  const textMain = isDark ? '#f1f5f9' : '#111827';
  const bgSecondary = isDark ? '#161b27' : '#f9fafb';

  useEffect(() => { fetchProjects(); }, []);

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
    return projects
      .filter(p => { const c = new Date(p.created_at); return c >= start && c <= endOfDay; })
      .sort((a, b) => b.upvotes - a.upvotes);
  }, [projects, selectedYear, selectedWeek]);

  const { start: weekStart, end: weekEnd } = getWeekRange(selectedYear, selectedWeek);
  const isCurrentWeek = selectedYear === currentYear && selectedWeek === currentWeek;
  const canGoNext = !(selectedYear === currentYear && selectedWeek >= currentWeek);

  const goToPrevWeek = () => {
    if (selectedWeek <= 1) { setSelectedYear(y => y - 1); setSelectedWeek(52); }
    else setSelectedWeek(w => w - 1);
  };

  const goToNextWeek = () => {
    if (!canGoNext) return;
    if (selectedWeek >= 52) { setSelectedYear(y => y + 1); setSelectedWeek(1); }
    else setSelectedWeek(w => w + 1);
  };

  const hueFrom = (s: string) => s.charCodeAt(0) * 7 % 360;

  return (
    <div style={{ minHeight: '100vh', background: isDark ? '#0f1117' : '#fff', display: 'flex', flexDirection: 'column' }}>
      <Header activePage="leaderboard" />

      <main style={{ maxWidth: 960, margin: '0 auto', padding: '32px 20px 80px', flex: 1, width: '100%' }}>

        {/* Header row */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: textMain, margin: '0 0 6px' }}>Weekly Rankings</h1>
          <p style={{ fontSize: 14, color: textMuted, margin: '0 0 20px' }}>Top products by upvotes, ranked per week</p>

          {/* Week nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={goToPrevWeek} style={{
              width: 34, height: 34, borderRadius: 8, border: `1px solid ${border}`,
              background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={textMuted} strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: textMain }}>
                Week {selectedWeek}, {selectedYear}
              </span>
              <span style={{ fontSize: 13, color: textDim }}>
                {formatDateShort(weekStart)} – {formatDateShort(weekEnd)}
              </span>
              {isCurrentWeek && (
                <span style={{
                  fontSize: 10, fontWeight: 700, color: '#22c55e',
                  background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                  padding: '2px 7px', borderRadius: 20, letterSpacing: 0.5,
                }}>LIVE</span>
              )}
            </div>

            <button onClick={goToNextWeek} disabled={!canGoNext} style={{
              width: 34, height: 34, borderRadius: 8, border: `1px solid ${border}`,
              background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: canGoNext ? 'pointer' : 'default', opacity: canGoNext ? 1 : 0.35,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={textMuted} strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
        </div>

        {/* List */}
        <div style={{ borderTop: `1px solid ${border}` }}>
          {loading ? (
            [1,2,3,4,5].map(i => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 8px', borderBottom: `1px solid ${border}` }}>
                <div style={{ width: 28 }} />
                <div style={{ width: 52, height: 52, borderRadius: 12, background: bgSecondary, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ width: 160, height: 14, borderRadius: 4, background: bgSecondary, marginBottom: 8 }} />
                  <div style={{ width: 240, height: 12, borderRadius: 4, background: bgSecondary }} />
                </div>
                <div style={{ width: 52, height: 52, borderRadius: 10, background: bgSecondary, flexShrink: 0 }} />
              </div>
            ))
          ) : weekProjects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: textMuted }}>
              <p style={{ fontSize: 16, fontWeight: 600, color: textMain, marginBottom: 4 }}>No products this week</p>
              <p style={{ fontSize: 14, margin: 0 }}>{isCurrentWeek ? 'Products submitted this week will appear here.' : 'Try a different week.'}</p>
            </div>
          ) : (
            weekProjects.map((p, i) => {
              const hue = hueFrom(p.name);
              const rank = i + 1;
              const trophy = TROPHIES[i];

              return (
                <div key={p.id} className="product-row fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
                  {/* Rank / Trophy */}
                  <div style={{ width: 28, textAlign: 'center', flexShrink: 0, fontSize: trophy ? 20 : 13, fontWeight: 500, color: textDim }}>
                    {trophy || rank}
                  </div>

                  {/* Logo */}
                  <Link href={`/project/${p.id}`} style={{ flexShrink: 0 }}>
                    {p.logo_url ? (
                      <img src={p.logo_url} alt="" style={{ width: 52, height: 52, borderRadius: 12, objectFit: 'cover', border: `1px solid ${border}` }} />
                    ) : (
                      <div style={{
                        width: 52, height: 52, borderRadius: 12,
                        background: isDark ? `linear-gradient(135deg, hsl(${hue},40%,14%), hsl(${hue},30%,20%))` : `linear-gradient(135deg, hsl(${hue},60%,92%), hsl(${hue},50%,85%))`,
                        border: `1px solid ${border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span style={{ fontSize: 20, fontWeight: 700, color: isDark ? `hsl(${hue},60%,60%)` : `hsl(${hue},60%,40%)` }}>{p.name[0]}</span>
                      </div>
                    )}
                  </Link>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link href={`/project/${p.id}`} style={{ textDecoration: 'none' }}>
                      <h3 style={{ fontSize: 15, fontWeight: 600, color: textMain, margin: '0 0 3px' }}>{p.name}</h3>
                    </Link>
                    <p style={{ fontSize: 13, color: textMuted, margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.tagline}</p>
                    <span className="category-pill">{CATEGORY_LABELS[p.category] || p.category}</span>
                  </div>

                  {/* Comments */}
                  <Link href={`/project/${p.id}`} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: 3, color: textDim, textDecoration: 'none', flexShrink: 0,
                    fontSize: 12, fontWeight: 600, padding: '4px 8px',
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    {commentCounts[p.id] || 0}
                  </Link>

                  {/* Upvote count (read-only on leaderboard) */}
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    width: 52, minHeight: 52, borderRadius: 10, flexShrink: 0,
                    border: rank === 1 ? '1.5px solid #0044ff' : `1.5px solid ${border}`,
                    background: rank === 1 ? (isDark ? 'rgba(77,124,255,0.12)' : 'rgba(0,68,255,0.06)') : 'transparent',
                    color: rank === 1 ? '#0044ff' : textDim,
                    gap: 3, padding: '8px 4px',
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{p.upvotes}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      <footer style={{ borderTop: `1px solid ${border}`, padding: '20px', textAlign: 'center', fontSize: 13, color: textDim }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700, color: '#0044ff', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>sonarbot</span>
            <span>·</span><span>Product Hunt for Base</span><span>·</span><span>© {new Date().getFullYear()}</span>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <Link href="/docs" style={{ color: textDim, textDecoration: 'none' }}>Docs</Link>
            <a href="https://x.com/sonarbotxyz" target="_blank" rel="noopener noreferrer" style={{ color: textDim, textDecoration: 'none' }}>@sonarbotxyz</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
