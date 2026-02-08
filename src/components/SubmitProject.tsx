'use client';

import { useState, useEffect } from 'react';

interface SubmitProjectProps {
  onSuccess?: () => void;
  userHandle?: string;
}

const CATEGORIES = [
  { id: 'agents', label: 'AI Agents' },
  { id: 'defi', label: 'DeFi' },
  { id: 'infrastructure', label: 'Infrastructure' },
  { id: 'consumer', label: 'Consumer' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'social', label: 'Social' },
  { id: 'tools', label: 'Tools' },
  { id: 'other', label: 'Other' }
];

export default function SubmitProject({ onSuccess, userHandle: propHandle }: SubmitProjectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [userHandle, setUserHandle] = useState(propHandle || '');

  useEffect(() => {
    if (propHandle) {
      setUserHandle(propHandle);
    } else {
      const saved = localStorage.getItem('sonarbot_handle');
      if (saved) setUserHandle(saved);
    }
  }, [propHandle]);

  const [form, setForm] = useState({
    name: '',
    tagline: '',
    description: '',
    website_url: '',
    demo_url: '',
    github_url: '',
    twitter_handle: '',
    category: 'agents'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userHandle) {
      setError('Please sign in with your X handle first');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          submitted_by_twitter: userHandle
        })
      });
      
      const data = await res.json();
      
      if (data.success || data.project) {
        setSuccess(true);
        setTimeout(() => {
          setIsOpen(false);
          setSuccess(false);
          setForm({
            name: '',
            tagline: '',
            description: '',
            website_url: '',
            demo_url: '',
            github_url: '',
            twitter_handle: '',
            category: 'agents'
          });
          onSuccess?.();
        }, 1500);
      } else {
        setError(data.error || 'Failed to submit project');
      }
    } catch (err) {
      setError('Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpen = () => {
    if (!userHandle) {
      // Let the parent handle showing the sign-in modal
      const saved = localStorage.getItem('sonarbot_handle');
      if (!saved) {
        setError('Please sign in first');
        return;
      }
      setUserHandle(saved);
    }
    setIsOpen(true);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="px-4 py-1.5 bg-[#0052ff] text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
      >
        Submit
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Submit a Project</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {success ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-gray-900">Project submitted!</p>
                  <p className="text-gray-500 text-sm mt-1">Your project is now live</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Submitting as */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    Submitting as @{userHandle}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      placeholder="My Awesome Project"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0052ff] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tagline <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.tagline}
                      onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                      placeholder="A short description (max 100 chars)"
                      required
                      maxLength={100}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0052ff] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-400 mt-1">{form.tagline.length}/100</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0052ff] focus:border-transparent"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={form.website_url}
                      onChange={(e) => setForm({ ...form, website_url: e.target.value })}
                      placeholder="https://yourproject.xyz"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0052ff] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project X Handle
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                      <input
                        type="text"
                        value={form.twitter_handle}
                        onChange={(e) => setForm({ ...form, twitter_handle: e.target.value.replace('@', '') })}
                        placeholder="projecthandle"
                        className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0052ff] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Tell us more about your project..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0052ff] focus:border-transparent resize-none"
                    />
                  </div>

                  {error && (
                    <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || !form.name || !form.tagline}
                    className="w-full py-3 bg-[#0052ff] text-white font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Project'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
