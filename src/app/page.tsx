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
  const [verified, setVerified] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [authError, setAuthError] = useState('');
  const [submitForm, setSubmitForm] = useState({ name: '', tagline: '', category: 'agents', website_url: '', twitter_handle: '' });
  const [submitting, setSubmitting] = useState(false);

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
    } catch (e) {
      setAuthError('Verification failed');
    }
    setVerifying(false);
  };

  const handleUpvote = async (id: string) => {
    if (!verified) { setShowAuth(true); return; }
    await fetch(`/api/projects/${id}/upvote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ twitter_handle: userHandle })
    });
    fetchProjects();
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-4 py-3 flex items-center justify-between max-w-2xl mx-auto">
        <Link href="/" className="w-10 h-10 rounded-full bg-[#0052ff] flex items-center justify-center">
          <span className="text-white text-lg font-bold">S</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => verified ? setShowSubmit(true) : setShowAuth(true)}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Submit
          </button>
          <button
            onClick={() => setShowAuth(true)}
            className="px-4 py-2 bg-[#0052ff] text-white rounded-full text-sm font-medium hover:bg-blue-600"
          >
            {verified ? `@${userHandle}` : 'Sign in'}
          </button>
        </div>
      </header>

      <div className="h-0.5 bg-[#0052ff]" />

      {/* Main */}
      <main className="px-4 py-8 max-w-2xl mx-auto">
        <h1 className="text-[22px] font-bold text-gray-900 mb-6">Top Projects on Base</h1>
        
        {loading ? (
          <div className="space-y-6">
            {[1,2,3].map(i => (
              <div key={i} className="animate-pulse flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg" />
                <div className="flex-1 pt-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-32" />
                  <div className="h-3 bg-gray-100 rounded w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-4">No projects yet</p>
            <button
              onClick={() => verified ? setShowSubmit(true) : setShowAuth(true)}
              className="text-[#0052ff] font-medium"
            >
              Be the first to submit →
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {projects.map((p, i) => (
              <div key={p.id} className="flex items-start gap-3">
                <Link href={`/project/${p.id}`} className="flex-shrink-0">
                  {p.logo_url ? (
                    <img src={p.logo_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                      <span className="text-white text-lg font-semibold">{p.name[0]}</span>
                    </div>
                  )}
                </Link>
                
                <div className="flex-1 min-w-0">
                  <Link href={`/project/${p.id}`}>
                    <h2 className="font-semibold text-gray-900 hover:text-[#0052ff]">
                      {i + 1}. {p.name}
                    </h2>
                  </Link>
                  <p className="text-[15px] text-gray-500 leading-snug">{p.tagline}</p>
                </div>
                
                <button
                  onClick={() => handleUpvote(p.id)}
                  className="flex-shrink-0 flex flex-col items-center pt-1 text-gray-400 hover:text-[#0052ff]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                  <span className="text-xs font-semibold mt-0.5">{p.upvotes}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-gray-100 mt-auto">
        <div className="px-4 py-5 max-w-2xl mx-auto flex justify-between text-sm text-gray-400">
          <span>Sonarbot</span>
          <a href="https://x.com/sonarbotxyz" target="_blank" className="hover:text-[#0052ff]">@sonarbotxyz</a>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowAuth(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-1">Sign in with X</h2>
            <p className="text-gray-500 text-sm mb-5">We'll verify your account exists</p>
            
            <div className="space-y-3">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                <input
                  type="text"
                  placeholder="yourhandle"
                  defaultValue={userHandle}
                  className="w-full pl-9 pr-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0052ff]"
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
                className="w-full py-3 bg-[#0052ff] text-white font-medium rounded-xl hover:bg-blue-600 disabled:opacity-50"
              >
                {verifying ? 'Verifying...' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Modal */}
      {showSubmit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowSubmit(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-1">Submit project</h2>
            <p className="text-gray-500 text-sm mb-5">as @{userHandle}</p>
            
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Project name"
                value={submitForm.name}
                onChange={e => setSubmitForm({...submitForm, name: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0052ff]"
              />
              <input
                type="text"
                required
                maxLength={100}
                placeholder="Tagline"
                value={submitForm.tagline}
                onChange={e => setSubmitForm({...submitForm, tagline: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0052ff]"
              />
              <select
                value={submitForm.category}
                onChange={e => setSubmitForm({...submitForm, category: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0052ff]"
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
                className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0052ff]"
              />
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
