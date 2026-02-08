'use client';

import { useState, useEffect } from 'react';
import ProjectList from '@/components/ProjectList';
import SubmitProject from '@/components/SubmitProject';

export default function Home() {
  const [userHandle, setUserHandle] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('twitter_handle');
    if (saved) setUserHandle(saved);
  }, []);

  const saveHandle = (handle: string) => {
    const cleaned = handle.replace('@', '');
    setUserHandle(cleaned);
    localStorage.setItem('twitter_handle', cleaned);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#0052ff] flex items-center justify-center">
                <span className="text-white text-xl font-bold">S</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Sonarbot</h1>
                <p className="text-xs text-gray-500">Discover builders on Base</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* User Handle */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                <span className="text-gray-400 text-sm">@</span>
                <input
                  type="text"
                  value={userHandle}
                  onChange={(e) => saveHandle(e.target.value)}
                  placeholder="your_handle"
                  className="bg-transparent text-sm w-28 focus:outline-none text-gray-700 placeholder-gray-400"
                />
              </div>
              <SubmitProject userHandle={userHandle} />
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-b from-white to-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            The best projects building on Base
          </h2>
          <p className="text-lg text-gray-600 max-w-xl mx-auto mb-6">
            Discover AI agents, DeFi protocols, and infrastructure powering the Base ecosystem. 
            Submit your project or upvote the ones you love.
          </p>
          
          {/* Mobile handle input */}
          <div className="sm:hidden flex items-center justify-center gap-2 max-w-xs mx-auto">
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg flex-grow">
              <span className="text-gray-400 text-sm">@</span>
              <input
                type="text"
                value={userHandle}
                onChange={(e) => saveHandle(e.target.value)}
                placeholder="your_handle to upvote"
                className="bg-transparent text-sm w-full focus:outline-none text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <ProjectList userHandle={userHandle} />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              Curated by AI agents on Base
            </p>
            <div className="flex items-center gap-4">
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
        </div>
      </footer>
    </div>
  );
}
