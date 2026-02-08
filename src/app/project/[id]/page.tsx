'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  tagline: string;
  description: string;
  website_url?: string;
  demo_url?: string;
  github_url?: string;
  logo_url?: string;
  twitter_handle?: string;
  category: string;
  upvotes: number;
  created_at: string;
  submitted_by_twitter: string;
}

interface Comment {
  id: string;
  twitter_handle: string;
  content: string;
  created_at: string;
}

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [userHandle, setUserHandle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [upvotes, setUpvotes] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('sonarbot_handle');
    if (saved) setUserHandle(saved);
  }, []);

  useEffect(() => {
    fetchProject();
    fetchComments();
  }, [id]);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      const data = await res.json();
      if (data.project) {
        setProject(data.project);
        setUpvotes(data.project.upvotes);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/projects/${id}/comments`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch (e) { console.error(e); }
  };

  const handleUpvote = async () => {
    if (!userHandle) return alert('Enter your X handle first');
    try {
      const res = await fetch(`/api/projects/${id}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ twitter_handle: userHandle })
      });
      const data = await res.json();
      if (data.success) setUpvotes(data.upvotes);
    } catch (e) { console.error(e); }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userHandle || !newComment.trim()) return;
    setSubmitting(true);
    try {
      await fetch(`/api/projects/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ twitter_handle: userHandle, content: newComment.trim() })
      });
      setNewComment('');
      fetchComments();
    } catch (e) { console.error(e); }
    setSubmitting(false);
  };

  const timeAgo = (date: string) => {
    const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)}m`;
    if (s < 86400) return `${Math.floor(s / 3600)}h`;
    return `${Math.floor(s / 86400)}d`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <p className="text-gray-500 text-lg">Project not found</p>
        <Link href="/" className="text-[#0052ff] mt-4 text-sm">← Back</Link>
      </div>
    );
  }

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
          <div className="flex items-center gap-2 text-sm">
            {userHandle ? (
              <span className="text-gray-500">@{userHandle}</span>
            ) : (
              <input
                type="text"
                placeholder="@handle"
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm w-28"
                onBlur={e => {
                  const v = e.target.value.replace('@', '').trim();
                  if (v) { setUserHandle(v); localStorage.setItem('sonarbot_handle', v); }
                }}
              />
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/" className="text-sm text-gray-400 hover:text-[#0052ff] mb-6 inline-block">← Back</Link>

        {/* Project Header */}
        <div className="flex items-start gap-4 mb-8">
          {project.logo_url ? (
            <img src={project.logo_url} alt="" className="w-16 h-16 rounded-2xl object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0052ff] to-blue-400 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">{project.name[0]}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-500 mt-1">{project.tagline}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-sm">
              <span className="text-gray-400">{project.category}</span>
              {project.twitter_handle && (
                <>
                  <span className="text-gray-300">·</span>
                  <a href={`https://x.com/${project.twitter_handle}`} target="_blank" className="text-gray-400 hover:text-[#0052ff]">
                    @{project.twitter_handle}
                  </a>
                </>
              )}
              <span className="text-gray-300">·</span>
              <span className="text-gray-400">by @{project.submitted_by_twitter}</span>
            </div>
          </div>
          <button
            onClick={handleUpvote}
            className="flex flex-col items-center px-4 py-3 rounded-xl border border-gray-200 hover:border-[#0052ff] hover:text-[#0052ff] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            <span className="text-sm font-bold">{upvotes}</span>
          </button>
        </div>

        {/* Links */}
        {(project.website_url || project.github_url) && (
          <div className="flex flex-wrap gap-2 mb-8">
            {project.website_url && (
              <a
                href={project.website_url}
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0052ff] text-white text-sm font-medium rounded-full hover:bg-blue-600"
              >
                Visit →
              </a>
            )}
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 text-sm rounded-full hover:border-[#0052ff] hover:text-[#0052ff]"
              >
                GitHub
              </a>
            )}
          </div>
        )}

        {/* Description */}
        {project.description && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">About</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{project.description}</p>
          </div>
        )}

        {/* Comments */}
        <div className="border-t border-gray-100 pt-8">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Discussion ({comments.length})</h2>
          
          {userHandle ? (
            <form onSubmit={handleComment} className="mb-6">
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Leave a comment..."
                rows={2}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#0052ff] text-sm"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className="px-4 py-2 bg-[#0052ff] text-white text-sm font-medium rounded-full hover:bg-blue-600 disabled:opacity-50"
                >
                  {submitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-gray-400 mb-6">Enter your X handle above to comment.</p>
          )}

          {comments.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">No comments yet</p>
          ) : (
            <div className="space-y-4">
              {comments.map(c => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-gray-500">{c.twitter_handle[0].toUpperCase()}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm">
                      <a href={`https://x.com/${c.twitter_handle}`} target="_blank" className="font-medium text-gray-900 hover:text-[#0052ff]">
                        @{c.twitter_handle}
                      </a>
                      <span className="text-gray-400">{timeAgo(c.created_at)}</span>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-8">
        <div className="max-w-3xl mx-auto px-4 py-6 flex items-center justify-between text-sm text-gray-400">
          <span>Sonarbot</span>
          <a href="https://x.com/sonarbotxyz" target="_blank" className="hover:text-[#0052ff]">@sonarbotxyz</a>
        </div>
      </footer>
    </div>
  );
}
