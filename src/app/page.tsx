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
  created_at: string;
  submitted_by_twitter: string;
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
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const saveHandle = (handle: string) => {
    const clean = handle.replace('@', '').trim();
    setUserHandle(clean);
    if (clean) localStorage.setItem('sonarbot_handle', clean);
    setShowAuth(false);
  };

  const handleUpvote = async (id: string) => {
    if (!userHandle) { setShowAuth(true); return; }
    try {
      await fetch(`/api/projects/${id}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ twitter_handle: userHandle })
      });
      fetchProjects();
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userHandle) { setShowAuth(true); return; }
    setSubmitting(true);
    try {
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
    } catch (e) { console.error(e); }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#0052ff] flex items-center justify-center">
              <span className="text-white text-sm font-bold">S</span>
            </div>
            <span className="font-semibold text-gray-900 text-lg hidden sm:block">Sonarbot</span>
          </Link>
          <div className="flex items-center gap-3">
            {userHandle ? (
              <span className="text-sm text-gray-500">@{userHandle}</span>
            ) : (
              <button onClick={() => setShowAuth(true)} className="text-sm text-gray-600 hover:text-gray-900">
                Sign in
              </button>
            )}
            <button
              onClick={() => userHandle ? setShowSubmit(true) : setShowAuth(true)}
              className="bg-[#0052ff] text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-blue-600"
            >
              Submit
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Top Projects on Base</h1>
        
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="animate-pulse flex items-center gap-4 py-4">
                <div className="w-5 h-4 bg-gray-100 rounded" />
                <div className="w-12 h-12 bg-gray-100 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No projects yet</p>
            <button
              onClick={() => userHandle ? setShowSubmit(true) : setShowAuth(true)}
              className="mt-4 text-[#0052ff] text-sm font-medium hover:underline"
            >
              Be the first to submit →
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {projects.map((p, i) => (
              <div key={p.id} className="flex items-center gap-4 py-4 group">
                {/* Rank */}
                <span className="w-5 text-sm text-gray-400 text-right">{i + 1}</span>
                
                {/* Logo */}
                <Link href={`/project/${p.id}`}>
                  {p.logo_url ? (
                    <img src={p.logo_url} alt="" className="w-12 h-12 rounded-xl object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0052ff] to-blue-400 flex items-center justify-center">
                      <span className="text-white font-bold">{p.name[0]}</span>
                    </div>
                  )}
                </Link>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/project/${p.id}`} className="font-medium text-gray-900 hover:text-[#0052ff] block truncate">
                    {p.name}
                  </Link>
                  <p className="text-sm text-gray-500 truncate">{p.tagline}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400">{p.category}</span>
                    {p.twitter_handle && (
                      <>
                        <span className="text-gray-300">·</span>
                        <a href={`https://x.com/${p.twitter_handle}`} target="_blank" className="text-xs text-gray-400 hover:text-[#0052ff]">
                          @{p.twitter_handle}
                        </a>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Upvote */}
                <button
                  onClick={() => handleUpvote(p.id)}
                  className="flex flex-col items-center px-3 py-2 rounded-lg border border-gray-200 hover:border-[#0052ff] hover:text-[#0052ff] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  <span className="text-xs font-semibold">{p.upvotes}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 flex items-center justify-between text-sm text-gray-400">
          <span>Sonarbot — Discover builders on Base</span>
          <a href="https://x.com/sonarbotxyz" target="_blank" className="hover:text-[#0052ff]">@sonarbotxyz</a>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAuth(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-2">Sign in with X</h2>
            <p className="text-sm text-gray-500 mb-4">Enter your handle to upvote and submit projects.</p>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                <input
                  type="text"
                  placeholder="handle"
                  defaultValue={userHandle}
                  className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0052ff]"
                  onKeyDown={e => e.key === 'Enter' && saveHandle((e.target as HTMLInputElement).value)}
                  autoFocus
                />
              </div>
              <button
                onClick={e => {
                  const input = (e.target as HTMLElement).parentElement?.querySelector('input');
                  if (input) saveHandle(input.value);
                }}
                className="px-5 py-2.5 bg-[#0052ff] text-white font-medium rounded-xl hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Modal */}
      {showSubmit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowSubmit(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-1">Submit a project</h2>
            <p className="text-sm text-gray-500 mb-4">Submitting as @{userHandle}</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={submitForm.name}
                  onChange={e => setSubmitForm({...submitForm, name: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0052ff]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tagline *</label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  placeholder="Short description"
                  value={submitForm.tagline}
                  onChange={e => setSubmitForm({...submitForm, tagline: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0052ff]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={submitForm.category}
                  onChange={e => setSubmitForm({...submitForm, category: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0052ff]"
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
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Website</label>
                <input
                  type="url"
                  placeholder="https://"
                  value={submitForm.website_url}
                  onChange={e => setSubmitForm({...submitForm, website_url: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0052ff]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Project X handle</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                  <input
                    type="text"
                    placeholder="projecthandle"
                    value={submitForm.twitter_handle}
                    onChange={e => setSubmitForm({...submitForm, twitter_handle: e.target.value.replace('@', '')})}
                    className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0052ff]"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting || !submitForm.name || !submitForm.tagline}
                className="w-full py-3 bg-[#0052ff] text-white font-medium rounded-xl hover:bg-blue-600 disabled:opacity-50"
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
