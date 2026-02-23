'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useTheme } from '@/components/ThemeProvider';

interface Project {
  id: string;
  name: string;
  tagline: string;
  logo_url?: string;
  category: string;
  upvotes: number;
  created_at: string;
}

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
  const [loading, setLoading] = useState(true);
  const { theme, colors } = useTheme();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentWeek = getWeekNumber(now);

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects?sort=upvotes&limit=100');
      const data = await res.json();
      setProjects(data.projects || []);
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
    <div style={{ minHeight: '100vh', background: colors.bg, display: 'flex', flexDirection: 'column' }}>

      <Header />

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px 80px', flex: 1, width: '100%', boxSizing: 'border-box' }}>

        {/* Title */}
        <div style={{ marginBottom: 32, animation: 'fadeInUp 350ms ease-out both' }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: colors.text, margin: '0 0 6px' }}>
            Weekly Rankings
          </h1>
          <p style={{ fontSize: 15, color: colors.textMuted, margin: 0 }}>
            Top products by upvotes this week
          </p>
        </div>

        {/* Week selector */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap',
          animation: 'fadeInUp 350ms ease-out 50ms both',
        }}>
          <button onClick={goToPrevWeek} style={{
            width: 36, height: 36, borderRadius: 8,
            border: `1px solid ${colors.border}`, background: colors.bgCard,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          </button>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 17, fontWeight: 700, color: colors.text }}>
              Week {selectedWeek}
            </span>
            <span style={{ fontSize: 14, color: colors.textDim }}>
              {formatDateShort(weekStart)} – {formatDateShort(weekEnd)}, {selectedYear}
            </span>
            {isCurrentWeek && (
              <span style={{
                fontSize: 11, fontWeight: 600, color: '#22c55e',
                background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)',
                padding: '2px 10px', borderRadius: 12,
              }}>
                Live
              </span>
            )}
          </div>

          <button onClick={goToNextWeek} disabled={!canGoNext} style={{
            width: 36, height: 36, borderRadius: 8,
            border: `1px solid ${colors.border}`,
            background: canGoNext ? colors.bgCard : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: canGoNext ? 'pointer' : 'default', opacity: canGoNext ? 1 : 0.3,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>

        {/* Clean table */}
        <div style={{
          border: `1px solid ${colors.border}`, borderRadius: 12,
          background: colors.bgCard, overflow: 'hidden',
          animation: 'fadeInUp 350ms ease-out 100ms both',
        }}>
          {/* Table header */}
          <div style={{
            display: 'flex', alignItems: 'center', padding: '10px 20px',
            borderBottom: `1px solid ${colors.border}`,
            fontSize: 12, fontWeight: 600, color: colors.textDim, textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            <span style={{ width: 48 }}>#</span>
            <span style={{ flex: 1 }}>Product</span>
            <span style={{ width: 80, textAlign: 'right' }}>Upvotes</span>
          </div>

          {loading ? (
            <div>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: `1px solid ${colors.border}` }}>
                  <div style={{ width: 24, height: 16, borderRadius: 3 }} className="shimmer" />
                  <div style={{ width: 40, height: 40, borderRadius: 10 }} className="shimmer" />
                  <div style={{ flex: 1 }}>
                    <div style={{ width: 140, height: 14, borderRadius: 3 }} className="shimmer" />
                  </div>
                  <div style={{ width: 40, height: 16, borderRadius: 3 }} className="shimmer" />
                </div>
              ))}
            </div>
          ) : weekProjects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <p style={{ fontSize: 15, color: colors.textDim, marginBottom: 4 }}>No products this week</p>
              <p style={{ fontSize: 14, color: colors.textMuted }}>
                {isCurrentWeek ? 'Products will appear here as they get upvoted.' : 'Try a different week.'}
              </p>
            </div>
          ) : (
            <div>
              {weekProjects.map((p, i) => {
                const hue = hueFrom(p.name);
                const rank = i + 1;
                return (
                  <div key={p.id} style={{
                    display: 'flex', alignItems: 'center', padding: '12px 20px',
                    borderBottom: `1px solid ${colors.border}`,
                    transition: 'background 150ms ease',
                    animation: `fadeInUp 300ms ease-out ${i * 30}ms both`,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = colors.bgCardHover)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Rank */}
                    <span style={{
                      width: 48, fontSize: 14, fontWeight: 700, flexShrink: 0,
                      color: rank <= 3 ? '#0052FF' : colors.textDim,
                    }}>
                      {rank}
                    </span>

                    {/* Product */}
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                      <Link href={`/project/${p.id}`} style={{ flexShrink: 0 }}>
                        {p.logo_url ? (
                          <img src={p.logo_url} alt="" style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover', border: `1px solid ${colors.border}` }} />
                        ) : (
                          <div style={{
                            width: 40, height: 40, borderRadius: 10,
                            background: theme === 'dark' ? `linear-gradient(135deg, hsl(${hue}, 40%, 14%), hsl(${hue}, 30%, 18%))` : `linear-gradient(135deg, hsl(${hue}, 50%, 92%), hsl(${hue}, 40%, 85%))`,
                            border: `1px solid ${colors.border}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <span style={{ fontSize: 15, fontWeight: 700, color: theme === 'dark' ? `hsl(${hue}, 55%, 55%)` : `hsl(${hue}, 60%, 40%)` }}>{p.name[0]}</span>
                          </div>
                        )}
                      </Link>
                      <Link href={`/project/${p.id}`} style={{ textDecoration: 'none', minWidth: 0 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: colors.text, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</h3>
                        <p style={{ fontSize: 13, color: colors.textMuted, margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.tagline}</p>
                      </Link>
                    </div>

                    {/* Upvotes */}
                    <span style={{
                      width: 80, textAlign: 'right', fontSize: 15, fontWeight: 700, flexShrink: 0,
                      color: rank <= 3 ? '#0052FF' : colors.text,
                      display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4,
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ opacity: 0.6 }}>
                        <polyline points="18 15 12 9 6 15" />
                      </svg>
                      {p.upvotes}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
