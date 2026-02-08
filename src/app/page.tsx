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

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [userHandle, setUserHandle] = useState('');
  const [showAuth, setShowAuth] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [submitForm, setSubmitForm] = useState({ name: '', tagline: '', category: 'agents', website_url: '', twitter_handle: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sonarbot_handle');
    if (saved) setUserHandle(saved);
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

  const saveHandle = (handle: string) => {
    const clean = handle.replace('@', '').trim();
    setUserHandle(clean);
    if (clean) localStorage.setItem('sonarbot_handle', clean);
    setShowAuth(false);
  };

  const handleUpvote = async (id: string) => {
    if (!userHandle) { setShowAuth(true); return; }
    await fetch(`/api/projects/${id}/upvote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ twitter_handle: userHandle })
    });
    fetchProjects();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userHandle) { setShowAuth(true); return; }
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-4 py-3 flex items-center justify-between">
        <Link href="/" className="w-10 h-10 rounded-full bg-[#0052ff] flex items-center justify-center">
          <span className="text-white text-lg font-bold">S</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => userHandle ? setShowSubmit(true) : setShowAuth(true)}
            className="px-4 py-2 border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Submit
          </button>
          <button
            onClick={() => setShowAuth(true)}
            className="px-4 py-2 bg-[#0052ff] text-white rounded-full text-sm font-medium hover:bg-blue-600"
          >
            {userHandle ? `@${userHandle}` : 'Sign in'}
          </button>
        </div>
      </header>

      {/* Blue accent line */}
      <div className="h-1 bg-gradient-to-r from-[#0052ff] to-blue-400" />

      {/* Main */}
      <main className="px-4 py-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Top Projects on Base</h1>
        
        {loading ? (
          <div className="space-y-8">
            {[1,2,3].map(i => (
              <div key={i} className="animate-pulse flex items-start gap-4">
                <div className="w-14 h-14 bg-gray-100 rounded-xl" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-5 bg-gray-100 rounded w-1/3" />
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">No projects yet</p>
            <button
              onClick={() => userHandle ? setShowSubmit(true) : setShowAuth(true)}
              className="text-[#0052ff] font-medium hover:underline"
            >
              Be the first to submit →
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {projects.map((p, i) => (
              <div key={p.id} className="flex items-start gap-4">
                {/* Logo */}
                <Link href={`/project/${p.id}`} className="flex-shrink-0">
                  {p.logo_url ? (
                    <img src={p.logo_url} alt="" className="w-14 h-14 rounded-xl object-cover" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0052ff] to-blue-400 flex items-center justify-center">
                      <span className="text-white text-xl font-bold">{p.name[0]}</span>
                    </div>
                  )}
                </Link>
                
                {/* Info */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <Link href={`/project/${p.id}`} className="group">
                    <h2 className="text-lg font-semibold text-gray-900 group-hover:text-[#0052ff]">
                      {i + 1}. {p.name}
                    </h2>
                  </Link>
                  <p className="text-gray-500 mt-0.5 leading-snug">{p.tagline}</p>
                </div>
                
                {/* Upvote */}
                <button
                  onClick={() => handleUpvote(p.id)}
                  className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-xl border border-gray-200 hover:border-[#0052ff] transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                  </svg>
                  <span className="text-sm font-semibold text-gray-700 mt-0.5">{p.upvotes}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-100">
        <div className="px-4 py-6 max-w-2xl mx-auto flex items-center justify-between text-sm text-gray-400">
          <span>Sonarbot</span>
          <a href="https://x.com/sonarbotxyz" target="_blank" rel="noopener" className="hover:text-[#0052ff]">@sonarbotxyz</a>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowAuth(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-1">Sign in</h2>
            <p className="text-gray-500 text-sm mb-5">Enter your X handle to continue</p>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                <input
                  type="text"
                  placeholder="handle"
                  defaultValue={userHandle}
                  className="w-full pl-9 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0052ff]"
                  onKeyDown={e => e.key === 'Enter' && saveHandle((e.target as HTMLInputElement).value)}
                  autoFocus
                />
              </div>
              <button
                onClick={e => {
                  const input = (e.target as HTMLElement).parentElement?.querySelector('input');
                  if (input) saveHandle(input.value);
                }}
                className="px-6 py-3 bg-[#0052ff] text-white font-medium rounded-xl hover:bg-blue-600"
              >
                Go
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Modal */}
      {showSubmit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowSubmit(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-1">Submit project</h2>
            <p className="text-gray-500 text-sm mb-5">as @{userHandle}</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                required
                placeholder="Project name"
                value={submitForm.name}
                onChange={e => setSubmitForm({...submitForm, name: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0052ff]"
              />
              <input
                type="text"
                required
                maxLength={100}
                placeholder="Tagline — what does it do?"
                value={submitForm.tagline}
                onChange={e => setSubmitForm({...submitForm, tagline: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0052ff]"
              />
              <select
                value={submitForm.category}
                onChange={e => setSubmitForm({...submitForm, category: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0052ff] text-gray-700"
              >
                <option value="agents">AI Agents</option>
                <option value="defi">DeFi</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="consumer">Consumer</option>
                <option value="gaming">Gaming</option>
                <option value="social">Social</option>
                <option value="tools">Tools</option>
                <option value="other">Other</option>
              </select>
              <input
                type="url"
                placeholder="Website (optional)"
                value={submitForm.website_url}
                onChange={e => setSubmitForm({...submitForm, website_url: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0052ff]"
              />
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                <input
                  type="text"
                  placeholder="Project X handle (optional)"
                  value={submitForm.twitter_handle}
                  onChange={e => setSubmitForm({...submitForm, twitter_handle: e.target.value.replace('@', '')})}
                  className="w-full pl-9 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0052ff]"
                />
              </div>
              <button
                type="submit"
                disabled={submitting || !submitForm.name || !submitForm.tagline}
                className="w-full py-3.5 bg-[#0052ff] text-white font-semibold rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
