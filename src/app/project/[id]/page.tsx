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
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [upvotes, setUpvotes] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('twitter_handle');
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
    } catch (error) {
      console.error('Failed to fetch project:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/projects/${id}/comments`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handleUpvote = async () => {
    if (!userHandle) {
      alert('Enter your X handle to upvote');
      return;
    }
    
    try {
      const res = await fetch(`/api/projects/${id}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ twitter_handle: userHandle })
      });
      
      const data = await res.json();
      if (data.success) {
        setUpvotes(data.upvotes);
        setHasUpvoted(data.action === 'added');
      }
    } catch (error) {
      console.error('Upvote failed:', error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userHandle || !newComment.trim()) return;
    
    setSubmitting(true);
    try {
      const res = await fetch(`/api/projects/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          twitter_handle: userHandle,
          content: newComment.trim()
        })
      });
      
      const data = await res.json();
      if (data.success) {
        setNewComment('');
        fetchComments();
      }
    } catch (error) {
      console.error('Comment failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const saveHandle = (handle: string) => {
    setUserHandle(handle);
    localStorage.setItem('twitter_handle', handle);
  };

  const categoryColors: Record<string, string> = {
    defi: 'bg-green-100 text-green-800',
    agents: 'bg-purple-100 text-purple-800',
    infrastructure: 'bg-blue-100 text-blue-800',
    consumer: 'bg-pink-100 text-pink-800',
    gaming: 'bg-yellow-100 text-yellow-800',
    social: 'bg-orange-100 text-orange-800',
    tools: 'bg-gray-100 text-gray-800',
    other: 'bg-gray-100 text-gray-600'
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-gray-500 text-lg">Project not found</p>
        <Link href="/" className="text-[#0052ff] mt-4 hover:underline">
          ← Back to projects
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-lg bg-[#0052ff] flex items-center justify-center">
                <span className="text-white text-xl font-bold">S</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Sonarbot</h1>
                <p className="text-xs text-gray-500">Discover builders on Base</p>
              </div>
            </Link>
            
            {/* User Handle */}
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">@</span>
              <input
                type="text"
                value={userHandle}
                onChange={(e) => saveHandle(e.target.value.replace('@', ''))}
                placeholder="your_handle"
                className="px-2 py-1 text-sm border border-gray-200 rounded-lg w-32 focus:outline-none focus:border-[#0052ff]"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link href="/" className="text-sm text-gray-500 hover:text-[#0052ff] mb-6 inline-block">
          ← Back to all projects
        </Link>

        {/* Project Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-start gap-6">
            {/* Logo */}
            {project.logo_url ? (
              <img 
                src={project.logo_url} 
                alt={project.name}
                className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#0052ff] to-blue-400 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-3xl font-bold">
                  {project.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            {/* Info */}
            <div className="flex-grow min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                  <p className="text-gray-600 mt-1">{project.tagline}</p>
                </div>
                
                {/* Upvote Button */}
                <button
                  onClick={handleUpvote}
                  className={`flex flex-col items-center justify-center px-6 py-3 rounded-lg border-2 transition-all ${
                    hasUpvoted 
                      ? 'border-[#0052ff] bg-[#0052ff] text-white' 
                      : 'border-gray-200 hover:border-[#0052ff] text-gray-600 hover:text-[#0052ff]'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  <span className="text-lg font-bold">{upvotes}</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-4">
                <span className={`text-sm px-3 py-1 rounded-full ${categoryColors[project.category] || categoryColors.other}`}>
                  {project.category}
                </span>
                {project.twitter_handle && (
                  <a 
                    href={`https://x.com/${project.twitter_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-500 hover:text-[#0052ff]"
                  >
                    @{project.twitter_handle}
                  </a>
                )}
                <span className="text-sm text-gray-400">
                  Submitted by @{project.submitted_by_twitter}
                </span>
                <span className="text-sm text-gray-400">
                  {formatDate(project.created_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-100">
            {project.website_url && (
              <a
                href={project.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0052ff] text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Visit Website
              </a>
            )}
            {project.demo_url && (
              <a
                href={project.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:border-[#0052ff] hover:text-[#0052ff] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Demo
              </a>
            )}
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:border-[#0052ff] hover:text-[#0052ff] transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                GitHub
              </a>
            )}
          </div>

          {/* Description */}
          {project.description && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">About</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{project.description}</p>
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Discussion ({comments.length})
          </h2>

          {/* Comment Form */}
          <form onSubmit={handleComment} className="mb-6">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <span className="text-gray-500 text-sm font-medium">
                  {userHandle ? userHandle.charAt(0).toUpperCase() : '?'}
                </span>
              </div>
              <div className="flex-grow">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={userHandle ? "Share your thoughts..." : "Enter your X handle above to comment"}
                  disabled={!userHandle}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-[#0052ff] disabled:bg-gray-50 disabled:cursor-not-allowed"
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={!userHandle || !newComment.trim() || submitting}
                    className="px-4 py-2 bg-[#0052ff] text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Comments List */}
          {comments.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No comments yet. Be the first to share your thoughts!</p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-500 text-sm font-medium">
                      {comment.twitter_handle.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center gap-2">
                      <a 
                        href={`https://x.com/${comment.twitter_handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-gray-900 hover:text-[#0052ff]"
                      >
                        @{comment.twitter_handle}
                      </a>
                      <span className="text-sm text-gray-400">{timeAgo(comment.created_at)}</span>
                    </div>
                    <p className="text-gray-600 mt-1">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">Curated by AI agents on Base</p>
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
