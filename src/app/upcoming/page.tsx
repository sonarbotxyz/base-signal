'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { useTheme } from '@/components/ThemeProvider';

interface UpcomingProject {
  id: string;
  name: string;
  tagline: string;
  logo_url?: string;
  category: string;
  scheduled_for: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  agents: 'AI Agents', defi: 'DeFi', infrastructure: 'Infrastructure',
  consumer: 'Consumer', gaming: 'Gaming', social: 'Social', tools: 'Tools', other: 'Other',
};

function Countdown({ target }: { target: string }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const diff = new Date(target).getTime() - now;
  if (diff <= 0) return <span className="status-badge-live">Live</span>;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);

  if (days > 0) return <span className="countdown-badge">{days}d {hours}h {mins}m</span>;
  if (hours > 0) return <span className="countdown-badge">{hours}h {mins}m {secs}s</span>;
  return <span className="countdown-badge">{mins}m {secs}s</span>;
}

export default function UpcomingPage() {
  const [projects, setProjects] = useState<UpcomingProject[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

  const isDark = theme === 'dark';
  const bg = isDark ? '#0B0F19' : '#F8FAFC';
  const text = isDark ? '#F8FAFC' : '#0F172A';
  const textMuted = isDark ? '#94A3B8' : '#475569';
  const textDim = isDark ? '#475569' : '#94A3B8';
  const border = isDark ? '#2D3748' : '#E2E8F0';
  const cardBg = isDark ? '#151B2B' : '#FFFFFF';

  useEffect(() => {
    fetch('/api/projects?status=upcoming&sort=launch_date&limit=50')
      .then(r => r.json())
      .then(data => setProjects(data.projects || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const hueFrom = (s: string) => s.charCodeAt(0) * 7 % 360;

  return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, maxWidth: 720, margin: '0 auto', padding: '32px 20px 80px', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B', boxShadow: '0 0 8px rgba(245,158,11,0.5)' }} />
          <h1 style={{ fontSize: 28, fontWeight: 700, color: text, margin: 0 }}>Incoming Signals</h1>
        </div>
        <p style={{ fontSize: 15, color: textMuted, margin: '0 0 32px' }}>Products launching soon on Base</p>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ padding: 20, borderRadius: 14, border: `1px solid ${border}`, background: cardBg }}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: isDark ? '#1E2638' : '#F1F5F9', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ width: 120, height: 14, borderRadius: 4, background: isDark ? '#1E2638' : '#F1F5F9', marginBottom: 8 }} />
                    <div style={{ width: 200, height: 12, borderRadius: 4, background: isDark ? '#1E2638' : '#F1F5F9' }} />
                  </div>
                </div>
                <div style={{ width: 80, height: 24, borderRadius: 6, background: isDark ? '#1E2638' : '#F1F5F9' }} />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            </div>
            <p style={{ fontSize: 16, fontWeight: 600, color: text, margin: '0 0 6px' }}>No upcoming signals scheduled</p>
            <p style={{ fontSize: 14, color: textMuted, margin: '0 0 20px' }}>The frequency is wide open.</p>
            <Link href="/submit" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10,
              background: '#0044FF', color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none',
            }}>
              Schedule a Launch
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {projects.map((p, i) => {
              const hue = hueFrom(p.name);
              const launchDate = new Date(p.scheduled_for);
              return (
                <Link key={p.id} href={`/project/${p.id}`} style={{ textDecoration: 'none' }}>
                  <div className="fade-in" style={{
                    animationDelay: `${i * 0.05}s`,
                    padding: 20, borderRadius: 14,
                    border: `1px solid ${border}`,
                    background: cardBg,
                    transition: 'all 0.15s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(245,158,11,0.4)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = border; }}
                  >
                    <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                      {p.logo_url ? (
                        <img src={p.logo_url} alt="" style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', border: `1px solid ${border}`, flexShrink: 0 }} />
                      ) : (
                        <div style={{
                          width: 48, height: 48, borderRadius: 10, flexShrink: 0,
                          background: isDark
                            ? `linear-gradient(135deg, hsl(${hue},40%,14%), hsl(${hue},30%,20%))`
                            : `linear-gradient(135deg, hsl(${hue},60%,92%), hsl(${hue},50%,85%))`,
                          border: `1px solid ${border}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <span style={{ fontSize: 18, fontWeight: 700, color: isDark ? `hsl(${hue},60%,60%)` : `hsl(${hue},60%,40%)` }}>
                            {p.name[0]}
                          </span>
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: text, margin: '0 0 3px', lineHeight: 1.3 }}>{p.name}</h3>
                        <p style={{ fontSize: 13, color: textMuted, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.tagline}</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="category-pill">{CATEGORY_LABELS[p.category] || p.category}</span>
                        <Countdown target={p.scheduled_for} />
                      </div>
                      <span style={{ fontSize: 12, color: textDim, fontFamily: "'JetBrains Mono', monospace" }}>
                        {launchDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {launchDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        onClick={e => { e.preventDefault(); e.stopPropagation(); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 5,
                          padding: '6px 12px', borderRadius: 8,
                          border: `1px solid ${border}`, background: 'transparent',
                          color: textMuted, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                        Notify Me
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
