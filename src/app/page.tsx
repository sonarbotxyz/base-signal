'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SubmitProject from '@/components/SubmitProject';

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

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'agents', label: 'AI Agents' },
  { id: 'defi', label: 'DeFi' },
  { id: 'infrastructure', label: 'Infrastructure' },
  { id: 'consumer', label: 'Consumer' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'social', label: 'Social' },
  { id: 'tools', label: 'Tools' },
];

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [userHandle, setUserHandle] = useState('');
  const [showHandleInput, setShowHandleInput] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sonarbot_handle');
    if (saved) setUserHandle(saved);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [category]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ category, sort: 'upvotes', limit: '30' });
      const res = await fetch(`/api/projects?${params}`);
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveHandle = (handle: string) => {
    const cleaned = handle.replace('@', '').trim();
    setUserHandle(cleaned);
    if (cleaned) {
      localStorage.setItem('sonarbot_handle', cleaned);
    }
    setShowHandleInput(false);
  };

  const handleUpvote = async (projectId: string) => {
    if (!userHandle) {
      setShowHandleInput(true);
      return;
    }
    
    try {
      const res = await fetch(`/api/projects/${projectId}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ twitter_handle: userHandle })
      });
      
      if (res.ok) {
        fetchProjects();
      }
    } catch (error) {
      console.error('Upvote failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Left: Logo */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0052ff] flex items-center justify-center">
                  <span className="text-white text-sm font-bold">S</span>
                </div>
                <span className="font-semibold text-gray-900 hidden sm:block">Sonarbot</span>
              </Link>
              
              {/* Nav */}
              <nav className="hidden md:flex items-center gap-1">
                {CATEGORIES.slice(0, 5).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      category === cat.id
                        ? 'bg-gray-100 text-gray-900 font-medium'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {userHandle ? (
                <button
                  onClick={() => setShowHandleInput(true)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  @{userHandle}
                </button>
              ) : (
                <button
                  onClick={() => setShowHandleInput(true)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Sign in
                </button>
              )}
              <SubmitProject userHandle={userHandle} onSuccess={fetchProjects} />
            </div>
          </div>
        </div>
      </header>

      {/* Handle Input Modal */}
      {showHandleInput && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Enter your X handle</h3>
            <p className="text-sm text-gray-500 mb-4">
              Your handle is used to track your upvotes and submissions.
            </p>
            <div className="flex gap-2">
              <div className="flex-grow relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                <input
                  type="text"
                  defaultValue={userHandle}
                  placeholder="yourhandle"
                  className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0052ff]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      saveHandle((e.target as HTMLInputElement).value);
                    }
                  }}
                  autoFocus
                />
              </div>
              <button
                onClick={(e) => {
                  const input = (e.target as HTMLElement).parentElement?.querySelector('input');
                  if (input) saveHandle(input.value);
                }}
                className="px-4 py-2 bg-[#0052ff] text-white rounded-lg hover:bg-blue-600"
              >
                Save
              </button>
            </div>
            <button
              onClick={() => setShowHandleInput(false)}
              className="mt-3 text-sm text-gray-500 hover:text-gray-700 w-full text-center"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-grow">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold text-gray-900">
                {category === 'all' ? 'Top Projects on Base' : CATEGORIES.find(c => c.id === category)?.label}
              </h1>
              
              {/* Mobile Category Filter */}
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="md:hidden text-sm border border-gray-200 rounded-lg px-3 py-1.5"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Project List */}
            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className="p-4 animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-6 text-center text-gray-300">{i + 1}</div>
                      <div className="w-12 h-12 bg-gray-100 rounded-lg" />
                      <div className="flex-grow">
                        <div className="h-4 bg-gray-100 rounded w-1/3 mb-2" />
                        <div className="h-3 bg-gray-100 rounded w-2/3" />
                      </div>
                      <div className="w-12 h-12 bg-gray-100 rounded-lg" />
                    </div>
                  </div>
                ))
              ) : projects.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-gray-500">No projects yet</p>
                  <p className="text-sm text-gray-400 mt-1">Be the first to submit!</p>
                </div>
              ) : (
                projects.map((project, index) => (
                  <div key={project.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div className="w-6 text-center text-sm font-medium text-gray-400">
                        {index + 1}
                      </div>
                      
                      {/* Logo */}
                      <Link href={`/project/${project.id}`}>
                        {project.logo_url ? (
                          <img 
                            src={project.logo_url} 
                            alt={project.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#0052ff] to-blue-400 flex items-center justify-center">
                            <span className="text-white text-lg font-bold">
                              {project.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </Link>

                      {/* Content */}
                      <div className="flex-grow min-w-0">
                        <Link 
                          href={`/project/${project.id}`}
                          className="font-medium text-gray-900 hover:text-[#0052ff] transition-colors block truncate"
                        >
                          {project.name}
                        </Link>
                        <p className="text-sm text-gray-500 truncate">{project.tagline}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                            {project.category}
                          </span>
                          {project.twitter_handle && (
                            <a 
                              href={`https://x.com/${project.twitter_handle}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-gray-400 hover:text-[#0052ff]"
                            >
                              @{project.twitter_handle}
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Upvote Button */}
                      <button
                        onClick={() => handleUpvote(project.id)}
                        className="flex flex-col items-center justify-center w-14 h-14 rounded-lg border border-gray-200 hover:border-[#0052ff] hover:bg-blue-50 transition-all group"
                      >
                        <svg 
                          className="w-4 h-4 text-gray-400 group-hover:text-[#0052ff]" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                        <span className="text-sm font-semibold text-gray-700 group-hover:text-[#0052ff]">
                          {project.upvotes}
                        </span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            {/* About */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">About Sonarbot</h3>
              <p className="text-sm text-gray-600 mb-3">
                Discover the best projects building on Base. Submit your project, upvote favorites, 
                and help surface the next big thing.
              </p>
              <a 
                href="https://x.com/sonarbotxyz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#0052ff] hover:underline"
              >
                Follow @sonarbotxyz →
              </a>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
              <div className="space-y-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                      category === cat.id
                        ? 'bg-[#0052ff] text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-8">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#0052ff] flex items-center justify-center">
                <span className="text-white text-xs font-bold">S</span>
              </div>
              <span className="text-sm text-gray-500">Sonarbot — Discover builders on Base</span>
            </div>
            <a 
              href="https://x.com/sonarbotxyz" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-[#0052ff]"
            >
              @sonarbotxyz
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
