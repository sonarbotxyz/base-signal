'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  tagline: string;
  logo_url?: string;
  twitter_handle?: string;
  category: string;
  upvotes: number;
}

const CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'AI Agents', value: 'agents' },
  { label: 'DeFi', value: 'defi' },
  { label: 'Infrastructure', value: 'infrastructure' },
  { label: 'Consumer', value: 'consumer' },
  { label: 'Gaming', value: 'gaming' },
  { label: 'Social', value: 'social' },
  { label: 'Tools', value: 'tools' },
];

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [userHandle, setUserHandle] = useState('');
  const [verified, setVerified] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [authError, setAuthError] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [submitForm, setSubmitForm] = useState({ name: '', tagline: '', category: 'agents', website_url: '', twitter_handle: '' });
  const [submitting, setSubmitting] = useState(false);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem('sonarbot_handle');
    const savedVerified = localStorage.getItem('sonarbot_verified');
    if (saved) setUserHandle(saved);
    if (savedVerified === 'true') setVerified(true);
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects?sort=upvotes&limit=30');
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const verifyHandle = async (handle: string) => {
    const clean = handle.replace('@', '').trim();
    if (!clean) return;
    setVerifying(true);
    setAuthError('');
    try {
      const res = await fetch('/api/verify-twitter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle: clean })
      });
      const data = await res.json();
      if (data.verified) {
        setUserHandle(clean);
        setVerified(true);
        localStorage.setItem('sonarbot_handle', clean);
        localStorage.setItem('sonarbot_verified', 'true');
        setShowAuth(false);
      } else {
        setAuthError(data.error || 'Could not verify account');
      }
    } catch { setAuthError('Verification failed'); }
    setVerifying(false);
  };

  const handleUpvote = async (id: string) => {
    if (!verified) { setShowAuth(true); return; }
    setVotedIds(prev => new Set(prev).add(id));
    setProjects(prev => prev.map(p => p.id === id ? { ...p, upvotes: p.upvotes + 1 } : p));
    await fetch(`/api/projects/${id}/upvote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ twitter_handle: userHandle })
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verified) { setShowAuth(true); return; }
    setSubmitting(true);
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...submitForm, submitted_by_twitter: userHandle })
    });
    if (res.ok) {
      setShowSubmit(false);
      setSubmitForm({ name: '', tagline: '', category: 'agents', website_url: '', twitter_handle: '' });
      fetchProjects();
    }
    setSubmitting(false);
  };

  const today = new Date();
  const dateLabel = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const filtered = activeCategory
    ? projects.filter(p => p.category === activeCategory)
    : projects;

  // Color from name
  const hueFrom = (s: string) => s.charCodeAt(0) * 7 % 360;

  return (
    <div className="min-h-screen" style={{ background: '#f5f5f4' }}>
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white" style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.06)' }}>
        <div className="max-w-[1080px] mx-auto px-4 flex items-center h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mr-6">
            <div className="w-9 h-9 rounded-[10px] flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #ff6154, #ff9a54)' }}>
              <span className="text-white font-bold text-lg leading-none">S</span>
            </div>
            <span className="font-bold text-lg hidden sm:block" style={{ color: '#21293c', letterSpacing: '-0.3px' }}>
              Sonarbot
            </span>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {['Products', 'Launches', 'About'].map(item => (
              <span key={item}
                className="px-3 py-1.5 text-[13px] font-semibold cursor-pointer rounded-md transition-colors"
                style={{ color: item === 'Products' ? '#21293c' : '#6f7784' }}
              >
                {item}
              </span>
            ))}
          </nav>

          <div className="flex-1" />

          {/* Right */}
          <div className="flex items-center gap-2">
            {/* Search icon */}
            <button className="w-9 h-9 flex items-center justify-center rounded-full transition-colors"
              style={{ color: '#6f7784' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f7f7f7')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>

            {/* Submit */}
            <button
              onClick={() => verified ? setShowSubmit(true) : setShowAuth(true)}
              className="hidden sm:flex items-center h-[34px] px-3.5 rounded-lg text-[13px] font-semibold text-white transition-colors"
              style={{ background: '#ff6154' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#e8554a')}
              onMouseLeave={e => (e.currentTarget.style.background = '#ff6154')}>
              Submit
            </button>

            {/* Sign in */}
            <button
              onClick={() => setShowAuth(true)}
              className="h-[34px] px-3.5 rounded-lg text-[13px] font-semibold transition-colors"
              style={{ border: '1px solid #e8e8e8', color: '#21293c' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#9b9b9b')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#e8e8e8')}>
              {verified ? `@${userHandle}` : 'Sign in'}
            </button>
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <div className="max-w-[1080px] mx-auto px-4 flex gap-0 pt-5">
        {/* ── Sidebar ── */}
        <aside className="hidden lg:block w-[210px] flex-shrink-0 pr-6">
          <div className="sticky top-[76px]">
            {/* Date */}
            <div className="flex items-center justify-between mb-5">
              <button className="w-7 h-7 flex items-center justify-center rounded-md transition-colors"
                style={{ color: '#6f7784' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f0f0ef')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              </button>
              <span className="text-[13px] font-semibold" style={{ color: '#21293c' }}>
                {today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </span>
              <button className="w-7 h-7 flex items-center justify-center rounded-md transition-colors"
                style={{ color: '#6f7784' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f0f0ef')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>
            </div>

            {/* Topics */}
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-2 px-3"
              style={{ color: '#9b9b9b' }}>Topics</p>
            <nav className="space-y-0.5">
              {CATEGORIES.map(cat => (
                <button key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all"
                  style={{
                    color: activeCategory === cat.value ? '#ff6154' : '#6f7784',
                    background: activeCategory === cat.value ? '#fff3f2' : 'transparent',
                    fontWeight: activeCategory === cat.value ? 600 : 500,
                  }}>
                  {cat.label}
                </button>
              ))}
            </nav>

            {/* AI badge */}
            <div className="mt-6 p-3.5 rounded-xl" style={{ background: '#fff3f2' }}>
              <p className="text-[13px] font-semibold mb-1" style={{ color: '#21293c' }}>🤖 AI Curated</p>
              <p className="text-[12px] leading-relaxed" style={{ color: '#6f7784' }}>
                Projects discovered and ranked by AI agents on Base
              </p>
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="flex-1 min-w-0 pb-16">
          {/* Title */}
          <div className="mb-4">
            <h1 className="text-[20px] font-bold" style={{ color: '#21293c' }}>Top Products</h1>
            <p className="text-[13px] mt-0.5" style={{ color: '#6f7784' }}>
              {dateLabel} — Curated by AI agents
            </p>
          </div>

          {/* Mobile category pills */}
          <div className="lg:hidden flex gap-2 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
            {CATEGORIES.map(cat => (
              <button key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all"
                style={{
                  background: activeCategory === cat.value ? '#ff6154' : '#f0f0ef',
                  color: activeCategory === cat.value ? 'white' : '#6f7784',
                }}>
                {cat.label}
              </button>
            ))}
          </div>

          {/* List */}
          {loading ? (
            <div className="space-y-0" style={{ borderTop: '1px solid #f0f0ef' }}>
              {[1,2,3,4,5].map(i => (
                <div key={i} className="flex items-center gap-4 py-5" style={{ borderBottom: '1px solid #f0f0ef' }}>
                  <div className="w-[60px] h-[60px] rounded-xl animate-pulse" style={{ background: '#f0f0ef' }} />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 rounded w-36 animate-pulse" style={{ background: '#f0f0ef' }} />
                    <div className="h-3 rounded w-52 animate-pulse" style={{ background: '#f0f0ef' }} />
                  </div>
                  <div className="w-14 h-14 rounded-lg animate-pulse" style={{ background: '#f0f0ef' }} />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                style={{ background: '#f0f0ef' }}>
                <svg className="w-5 h-5" style={{ color: '#9b9b9b' }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
              <p className="text-[15px] font-semibold mb-1" style={{ color: '#21293c' }}>No projects yet</p>
              <p className="text-[13px]" style={{ color: '#6f7784' }}>Be the first to submit a project</p>
              <button
                onClick={() => verified ? setShowSubmit(true) : setShowAuth(true)}
                className="mt-4 text-[13px] font-semibold"
                style={{ color: '#ff6154' }}>
                Submit a project →
              </button>
            </div>
          ) : (
            <div style={{ borderTop: '1px solid #f0f0ef' }}>
              {filtered.map((p, i) => {
                const hue = hueFrom(p.name);
                const isVoted = votedIds.has(p.id);
                return (
                  <div key={p.id}
                    className="flex items-center gap-4 py-4 px-2 -mx-2 rounded-xl transition-colors group"
                    style={{ borderBottom: '1px solid #f0f0ef' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'white')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>

                    {/* Thumbnail */}
                    <Link href={`/project/${p.id}`} className="flex-shrink-0">
                      {p.logo_url ? (
                        <img src={p.logo_url} alt="" className="w-[60px] h-[60px] rounded-xl object-cover" />
                      ) : (
                        <div className="w-[60px] h-[60px] rounded-xl flex items-center justify-center"
                          style={{ background: `hsl(${hue}, 55%, 95%)` }}>
                          <span className="text-2xl font-bold" style={{ color: `hsl(${hue}, 55%, 55%)` }}>
                            {p.name[0]}
                          </span>
                        </div>
                      )}
                    </Link>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/project/${p.id}`}>
                        <h2 className="text-[15px] font-semibold leading-snug transition-colors"
                          style={{ color: '#21293c' }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#ff6154')}
                          onMouseLeave={e => (e.currentTarget.style.color = '#21293c')}>
                          {p.name}
                        </h2>
                      </Link>
                      <p className="text-[13px] mt-0.5 leading-snug overflow-hidden"
                        style={{ color: '#6f7784', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>
                        {p.tagline}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium"
                          style={{ background: '#f0f0ef', color: '#6f7784' }}>
                          {p.category}
                        </span>
                        {p.twitter_handle && (
                          <a href={`https://x.com/${p.twitter_handle}`} target="_blank" rel="noopener noreferrer"
                            className="text-[11px] font-medium transition-colors"
                            style={{ color: '#9b9b9b' }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#ff6154')}
                            onMouseLeave={e => (e.currentTarget.style.color = '#9b9b9b')}>
                            @{p.twitter_handle}
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Upvote — PH style */}
                    <button
                      onClick={() => handleUpvote(p.id)}
                      className="flex-shrink-0 flex flex-col items-center justify-center w-14 min-h-14 rounded-lg transition-all"
                      style={{
                        border: `1px solid ${isVoted ? '#ff6154' : '#e8e8e8'}`,
                        background: isVoted ? '#fff3f2' : 'white',
                        color: isVoted ? '#ff6154' : '#6f7784',
                      }}
                      onMouseEnter={e => {
                        if (!isVoted) {
                          e.currentTarget.style.borderColor = '#ff6154';
                          e.currentTarget.style.color = '#ff6154';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isVoted) {
                          e.currentTarget.style.borderColor = '#e8e8e8';
                          e.currentTarget.style.color = '#6f7784';
                        }
                      }}>
                      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                      </svg>
                      <span className="text-[11px] font-bold mt-0.5 leading-none">{p.upvotes}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid #e8e8e8' }}>
        <div className="max-w-[1080px] mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[13px]" style={{ color: '#6f7784' }}>
            <span className="font-semibold" style={{ color: '#21293c' }}>Sonarbot</span>
            <span>·</span>
            <span>© {today.getFullYear()}</span>
            <span>·</span>
            <span>Built on Base</span>
          </div>
          <div className="flex items-center gap-4 text-[13px]" style={{ color: '#6f7784' }}>
            <Link href="/docs" className="hover:text-[#21293c] transition-colors">Docs</Link>
            <a href="https://x.com/sonarbotxyz" target="_blank" className="hover:text-[#21293c] transition-colors">
              @sonarbotxyz
            </a>
          </div>
        </div>
      </footer>

      {/* ── Auth Modal ── */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAuth(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-1" style={{ color: '#21293c' }}>Sign in with X</h2>
            <p className="text-sm mb-5" style={{ color: '#6f7784' }}>We'll verify your account exists</p>
            <div className="space-y-3">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#9b9b9b' }}>@</span>
                <input
                  type="text"
                  placeholder="yourhandle"
                  defaultValue={userHandle}
                  className="w-full pl-9 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2"
                  style={{ background: '#f7f7f7', '--tw-ring-color': '#ff6154' } as React.CSSProperties}
                  onKeyDown={e => e.key === 'Enter' && verifyHandle((e.target as HTMLInputElement).value)}
                  autoFocus
                  id="auth-input"
                />
              </div>
              {authError && <p className="text-red-500 text-sm">{authError}</p>}
              <button
                onClick={() => {
                  const input = document.getElementById('auth-input') as HTMLInputElement;
                  if (input) verifyHandle(input.value);
                }}
                disabled={verifying}
                className="w-full py-3 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                style={{ background: '#ff6154' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#e8554a')}
                onMouseLeave={e => (e.currentTarget.style.background = '#ff6154')}>
                {verifying ? 'Verifying...' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Submit Modal ── */}
      {showSubmit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setShowSubmit(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-1" style={{ color: '#21293c' }}>Submit a project</h2>
            <p className="text-sm mb-5" style={{ color: '#6f7784' }}>as @{userHandle}</p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="text" required placeholder="Project name"
                value={submitForm.name}
                onChange={e => setSubmitForm({...submitForm, name: e.target.value})}
                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2"
                style={{ background: '#f7f7f7', '--tw-ring-color': '#ff6154' } as React.CSSProperties} />
              <input type="text" required maxLength={100} placeholder="Tagline"
                value={submitForm.tagline}
                onChange={e => setSubmitForm({...submitForm, tagline: e.target.value})}
                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2"
                style={{ background: '#f7f7f7', '--tw-ring-color': '#ff6154' } as React.CSSProperties} />
              <select value={submitForm.category}
                onChange={e => setSubmitForm({...submitForm, category: e.target.value})}
                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2"
                style={{ background: '#f7f7f7', '--tw-ring-color': '#ff6154' } as React.CSSProperties}>
                <option value="agents">AI Agents</option>
                <option value="defi">DeFi</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="consumer">Consumer</option>
                <option value="gaming">Gaming</option>
                <option value="social">Social</option>
                <option value="tools">Tools</option>
                <option value="other">Other</option>
              </select>
              <input type="url" placeholder="Website (optional)"
                value={submitForm.website_url}
                onChange={e => setSubmitForm({...submitForm, website_url: e.target.value})}
                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2"
                style={{ background: '#f7f7f7', '--tw-ring-color': '#ff6154' } as React.CSSProperties} />
              <button type="submit"
                disabled={submitting || !submitForm.name || !submitForm.tagline}
                className="w-full py-3 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                style={{ background: '#ff6154' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#e8554a')}
                onMouseLeave={e => (e.currentTarget.style.background = '#ff6154')}>
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
