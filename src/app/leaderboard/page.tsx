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

// ── Week helpers ──────────────────────────────────────────────

/** Return Monday 00:00 of the week containing `date`. */
function getMonday(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=Sun … 6=Sat
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  d.setDate(d.getDate() + diff);
  return d;
}

/** Return Sunday 23:59:59 of the same week. */
function getSunday(monday: Date): Date {
  const d = new Date(monday);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

/** Format: "Feb 17" */
function shortDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Format: "Week of Feb 17 – Feb 23, 2026" */
function weekLabel(monday: Date): string {
  const sunday = getSunday(monday);
  const mStr = shortDate(monday);
  const sStr = shortDate(sunday);
  return `Week of ${mStr} – ${sStr}, ${sunday.getFullYear()}`;
}

/** Check if two dates fall in the same week (same Monday). */
function sameWeek(a: Date, b: Date): boolean {
  const ma = getMonday(a);
  const mb = getMonday(b);
  return ma.getTime() === mb.getTime();
}

/** Is the given Monday the current week? */
function isCurrentWeek(monday: Date): boolean {
  return sameWeek(monday, new Date());
}

// ── Component ─────────────────────────────────────────────────

export default function CalendarPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0); // 0 = this week, -1 = last, +1 = next
  const { theme, colors } = useTheme();

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects?sort=newest&limit=500');
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  // Current week's Monday based on offset
  const currentMonday = useMemo(() => {
    const m = getMonday(new Date());
    m.setDate(m.getDate() + weekOffset * 7);
    return m;
  }, [weekOffset]);

  const currentSunday = useMemo(() => getSunday(currentMonday), [currentMonday]);

  // Filter & sort products for the selected week
  const weekProjects = useMemo(() => {
    const start = currentMonday.getTime();
    const end = currentSunday.getTime();
    return projects
      .filter((p) => {
        const t = new Date(p.created_at).getTime();
        return t >= start && t <= end;
      })
      .sort((a, b) => b.upvotes - a.upvotes); // rank by upvotes
  }, [projects, currentMonday, currentSunday]);

  const hueFrom = (s: string) => s.charCodeAt(0) * 7 % 360;

  // ── Render ────────────────────────────────────────────────

  function renderProduct(p: Project, rank: number) {
    const hue = hueFrom(p.name);
    const launchDate = new Date(p.created_at);

    return (
      <div
        key={p.id}
        className="cal-row"
        style={{
          display: 'flex', alignItems: 'center', padding: '14px 20px', gap: 14,
          borderBottom: `1px solid ${colors.border}`,
          transition: 'background 150ms ease',
          animation: `fadeInUp 300ms ease-out ${rank * 40}ms both`,
        }}
        onMouseEnter={e => (e.currentTarget.style.background = colors.bgCardHover)}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        {/* Rank */}
        <span className="cal-rank" style={{
          fontSize: 14, fontWeight: 700, color: colors.textDim,
          width: 24, textAlign: 'center', flexShrink: 0,
        }}>
          {rank + 1}
        </span>

        {/* Logo */}
        <Link href={`/project/${p.id}`} style={{ flexShrink: 0 }}>
          {p.logo_url ? (
            <img src={p.logo_url} alt="" className="cal-logo" style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', border: `1px solid ${colors.border}` }} />
          ) : (
            <div className="cal-logo" style={{
              width: 44, height: 44, borderRadius: 10,
              background: theme === 'dark'
                ? `linear-gradient(135deg, hsl(${hue}, 40%, 14%), hsl(${hue}, 30%, 18%))`
                : `linear-gradient(135deg, hsl(${hue}, 50%, 92%), hsl(${hue}, 40%, 85%))`,
              border: `1px solid ${colors.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: theme === 'dark' ? `hsl(${hue}, 55%, 55%)` : `hsl(${hue}, 60%, 40%)` }}>{p.name[0]}</span>
            </div>
          )}
        </Link>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link href={`/project/${p.id}`} style={{ textDecoration: 'none' }}>
            <h3 className="cal-name" style={{ fontSize: 15, fontWeight: 600, color: colors.text, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</h3>
            <p className="cal-tagline" style={{ fontSize: 13, color: colors.textMuted, margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.tagline}</p>
          </Link>
        </div>

        {/* Launch date */}
        <span className="cal-date" style={{ fontSize: 12, color: colors.textDim, flexShrink: 0, whiteSpace: 'nowrap' }}>
          {launchDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>

        {/* Upvotes */}
        <span style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0,
          fontSize: 14, fontWeight: 700, color: colors.text,
          border: `1px solid ${colors.border}`, borderRadius: 8,
          padding: '4px 10px', minWidth: 44,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ opacity: 0.5 }}>
            <polyline points="18 15 12 9 6 15" />
          </svg>
          {p.upvotes}
        </span>
      </div>
    );
  }

  const live = isCurrentWeek(currentMonday);

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, display: 'flex', flexDirection: 'column' }}>

      <Header />

      <main className="cal-main" style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 20px 80px', flex: 1, width: '100%', boxSizing: 'border-box' }}>

        {/* Title */}
        <div style={{ marginBottom: 28, animation: 'fadeInUp 350ms ease-out both' }}>
          <h1 className="cal-title" style={{ fontSize: 28, fontWeight: 700, color: colors.text, margin: '0 0 6px' }}>
            Launch Calendar
          </h1>
          <p style={{ fontSize: 15, color: colors.textMuted, margin: 0 }}>
            Weekly launches ranked by upvotes
          </p>
        </div>

        {/* ── Week navigator ────────────────────────────── */}
        <div className="cal-nav" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 20, animation: 'fadeInUp 350ms ease-out 60ms both',
          background: colors.bgCard, border: `1px solid ${colors.border}`,
          borderRadius: 12, padding: '12px 16px',
        }}>
          {/* Prev */}
          <button
            onClick={() => setWeekOffset(o => o - 1)}
            style={{
              background: 'none', border: `1px solid ${colors.border}`, borderRadius: 8,
              color: colors.text, cursor: 'pointer', padding: '6px 12px',
              display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 500,
              transition: 'background 150ms',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = colors.bgCardHover)}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
            <span className="cal-nav-text">Prev</span>
          </button>

          {/* Label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, textAlign: 'center' }}>
            <span className="cal-week-label" style={{ fontSize: 15, fontWeight: 600, color: colors.text }}>
              {weekLabel(currentMonday)}
            </span>
            {live && (
              <span style={{
                fontSize: 10, fontWeight: 700, letterSpacing: 0.5, color: '#22c55e',
                background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)',
                padding: '2px 8px', borderRadius: 10, textTransform: 'uppercase',
              }}>
                LIVE
              </span>
            )}
          </div>

          {/* Next */}
          <button
            onClick={() => setWeekOffset(o => o + 1)}
            style={{
              background: 'none', border: `1px solid ${colors.border}`, borderRadius: 8,
              color: colors.text, cursor: 'pointer', padding: '6px 12px',
              display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 500,
              transition: 'background 150ms',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = colors.bgCardHover)}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <span className="cal-nav-text">Next</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </div>

        {/* "This Week" quick-jump */}
        {weekOffset !== 0 && (
          <div style={{ marginBottom: 16, animation: 'fadeInUp 200ms ease-out both' }}>
            <button
              onClick={() => setWeekOffset(0)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: colors.accent, fontSize: 13, fontWeight: 600, padding: 0,
              }}
            >
              ← Back to this week
            </button>
          </div>
        )}

        {/* ── Product list ──────────────────────────────── */}
        {loading ? (
          <div style={{
            border: `1px solid ${colors.border}`, borderRadius: 12,
            background: colors.bgCard, overflow: 'hidden',
          }}>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: `1px solid ${colors.border}` }}>
                <div style={{ width: 24, height: 14, borderRadius: 3 }} className="shimmer" />
                <div style={{ width: 44, height: 44, borderRadius: 10 }} className="shimmer" />
                <div style={{ flex: 1 }}>
                  <div style={{ width: 140, height: 14, borderRadius: 3, marginBottom: 6 }} className="shimmer" />
                  <div style={{ width: 200, height: 12, borderRadius: 3 }} className="shimmer" />
                </div>
                <div style={{ width: 50, height: 14, borderRadius: 3 }} className="shimmer" />
                <div style={{ width: 44, height: 32, borderRadius: 8 }} className="shimmer" />
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            border: `1px solid ${colors.border}`, borderRadius: 12,
            background: colors.bgCard, overflow: 'hidden',
            animation: 'fadeInUp 350ms ease-out 100ms both',
          }}>
            {/* Week header bar */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 20px',
              background: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
              borderBottom: `1px solid ${colors.border}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.textDim} strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span style={{ fontSize: 13, fontWeight: 600, color: colors.textDim }}>
                  {weekProjects.length} product{weekProjects.length !== 1 ? 's' : ''} launched
                </span>
              </div>
              <span style={{ fontSize: 12, color: colors.textDim }}>
                Ranked by upvotes
              </span>
            </div>

            {weekProjects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '56px 20px' }}>
                <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.4 }}>📅</div>
                <p style={{ fontSize: 15, color: colors.textDim, margin: '0 0 4px', fontWeight: 500 }}>
                  No launches this week
                </p>
                <p style={{ fontSize: 13, color: colors.textDim, margin: 0, opacity: 0.7 }}>
                  {weekOffset > 0 ? 'Check back later for upcoming launches' : 'Try browsing another week'}
                </p>
              </div>
            ) : (
              weekProjects.map((p, i) => renderProduct(p, i))
            )}
          </div>
        )}
      </main>

      <Footer />

      <style>{`
        @media (max-width: 640px) {
          .cal-main {
            padding: 24px 16px 100px !important;
          }
          .cal-title {
            font-size: 24px !important;
          }
          .cal-row {
            padding: 10px 14px !important;
            gap: 10px !important;
          }
          .cal-rank {
            width: 18px !important;
            font-size: 12px !important;
          }
          .cal-logo {
            width: 36px !important;
            height: 36px !important;
          }
          .cal-name {
            font-size: 14px !important;
          }
          .cal-tagline {
            font-size: 12px !important;
          }
          .cal-date {
            display: none !important;
          }
          .cal-nav {
            padding: 10px 12px !important;
          }
          .cal-nav-text {
            display: none !important;
          }
          .cal-week-label {
            font-size: 13px !important;
          }
        }
      `}</style>
    </div>
  );
}
