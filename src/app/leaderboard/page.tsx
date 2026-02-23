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

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function getDateKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function isFuture(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  d.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return d > now;
}

export default function CalendarPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme, colors } = useTheme();

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects?sort=newest&limit=200');
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const { upcoming, past } = useMemo(() => {
    const up: Project[] = [];
    const pa: Project[] = [];
    for (const p of projects) {
      if (isFuture(p.created_at)) up.push(p);
      else pa.push(p);
    }
    // Upcoming: sorted by date ascending (soonest first)
    up.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    // Past: sorted by date descending (most recent first)
    pa.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return { upcoming: up, past: pa };
  }, [projects]);

  function groupByDate(items: Project[]): { dateKey: string; label: string; projects: Project[] }[] {
    const map = new Map<string, Project[]>();
    for (const p of items) {
      const key = getDateKey(p.created_at);
      const existing = map.get(key) || [];
      existing.push(p);
      map.set(key, existing);
    }
    return Array.from(map.entries()).map(([key, prods]) => ({
      dateKey: key,
      label: formatDateLabel(prods[0].created_at),
      projects: prods,
    }));
  }

  const upcomingGroups = groupByDate(upcoming);
  const pastGroups = groupByDate(past);

  const hueFrom = (s: string) => s.charCodeAt(0) * 7 % 360;

  function renderProduct(p: Project, i: number) {
    const hue = hueFrom(p.name);
    const launchDate = new Date(p.created_at);

    return (
      <div
        key={p.id}
        className="cal-row"
        style={{
          display: 'flex', alignItems: 'center', padding: '12px 20px', gap: 14,
          borderBottom: `1px solid ${colors.border}`,
          transition: 'background 150ms ease',
          animation: `fadeInUp 300ms ease-out ${i * 30}ms both`,
        }}
        onMouseEnter={e => (e.currentTarget.style.background = colors.bgCardHover)}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        {/* Logo */}
        <Link href={`/project/${p.id}`} style={{ flexShrink: 0 }}>
          {p.logo_url ? (
            <img src={p.logo_url} alt="" className="cal-logo" style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', border: `1px solid ${colors.border}` }} />
          ) : (
            <div className="cal-logo" style={{
              width: 44, height: 44, borderRadius: 10,
              background: theme === 'dark' ? `linear-gradient(135deg, hsl(${hue}, 40%, 14%), hsl(${hue}, 30%, 18%))` : `linear-gradient(135deg, hsl(${hue}, 50%, 92%), hsl(${hue}, 40%, 85%))`,
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

        {/* Date */}
        <span className="cal-date" style={{ fontSize: 12, color: colors.textDim, flexShrink: 0, whiteSpace: 'nowrap' }}>
          {launchDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>

        {/* Upvotes */}
        <span className="cal-upvotes" style={{
          display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
          fontSize: 14, fontWeight: 700, color: colors.text,
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ opacity: 0.6 }}>
            <polyline points="18 15 12 9 6 15" />
          </svg>
          {p.upvotes}
        </span>
      </div>
    );
  }

  function renderSection(title: string, subtitle: string, groups: { dateKey: string; label: string; projects: Project[] }[], emptyMsg: string) {
    return (
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: colors.text, margin: 0 }}>{title}</h2>
          <span style={{ fontSize: 13, color: colors.textDim }}>{subtitle}</span>
        </div>

        <div style={{
          border: `1px solid ${colors.border}`, borderRadius: 12,
          background: colors.bgCard, overflow: 'hidden',
        }}>
          {groups.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px' }}>
              <p style={{ fontSize: 15, color: colors.textDim, margin: 0 }}>{emptyMsg}</p>
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.dateKey}>
                {/* Date header */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 20px',
                  background: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                  borderBottom: `1px solid ${colors.border}`,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.textDim} strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <span style={{ fontSize: 13, fontWeight: 600, color: colors.textDim }}>
                    {group.label}
                  </span>
                  {isToday(group.projects[0].created_at) && (
                    <span style={{
                      fontSize: 10, fontWeight: 600, color: '#22c55e',
                      background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)',
                      padding: '1px 8px', borderRadius: 10, marginLeft: 4,
                    }}>
                      Today
                    </span>
                  )}
                </div>
                {/* Products for this date */}
                {group.projects.map((p, i) => renderProduct(p, i))}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, display: 'flex', flexDirection: 'column' }}>

      <Header />

      <main className="cal-main" style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 20px 80px', flex: 1, width: '100%', boxSizing: 'border-box' }}>

        {/* Title */}
        <div style={{ marginBottom: 32, animation: 'fadeInUp 350ms ease-out both' }}>
          <h1 className="cal-title" style={{ fontSize: 28, fontWeight: 700, color: colors.text, margin: '0 0 6px' }}>
            Launch Calendar
          </h1>
          <p style={{ fontSize: 15, color: colors.textMuted, margin: 0 }}>
            Past and upcoming launches on Base
          </p>
        </div>

        {loading ? (
          <div style={{
            border: `1px solid ${colors.border}`, borderRadius: 12,
            background: colors.bgCard, overflow: 'hidden',
          }}>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: `1px solid ${colors.border}` }}>
                <div style={{ width: 44, height: 44, borderRadius: 10 }} className="shimmer" />
                <div style={{ flex: 1 }}>
                  <div style={{ width: 140, height: 14, borderRadius: 3, marginBottom: 6 }} className="shimmer" />
                  <div style={{ width: 200, height: 12, borderRadius: 3 }} className="shimmer" />
                </div>
                <div style={{ width: 50, height: 14, borderRadius: 3 }} className="shimmer" />
                <div style={{ width: 40, height: 16, borderRadius: 3 }} className="shimmer" />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ animation: 'fadeInUp 350ms ease-out 100ms both' }}>
            {renderSection(
              'Upcoming Launches',
              `${upcoming.length} scheduled`,
              upcomingGroups,
              'No upcoming launches scheduled yet.'
            )}
            {renderSection(
              'Past Launches',
              `${past.length} launched`,
              pastGroups,
              'No past launches yet.'
            )}
          </div>
        )}
      </main>

      <Footer />

      <style>{`
        @media (max-width: 640px) {
          .cal-main {
            padding: 24px 16px 60px !important;
          }
          .cal-title {
            font-size: 24px !important;
          }
          .cal-row {
            padding: 10px 14px !important;
            gap: 10px !important;
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
        }
      `}</style>
    </div>
  );
}
