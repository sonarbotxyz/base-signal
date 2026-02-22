'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy, useLoginWithOAuth } from '@privy-io/react-auth';
import Header from '@/components/Header';
import { useTheme } from '@/components/ThemeProvider';

const CATEGORIES = [
  { value: 'defi', label: 'DeFi' },
  { value: 'agents', label: 'AI Agents' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'consumer', label: 'Consumer' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'social', label: 'Social' },
  { value: 'tools', label: 'Tools' },
  { value: 'other', label: 'Other' },
];

interface UserInfo {
  twitter_handle: string;
}

export default function SubmitPage() {
  const router = useRouter();
  const { ready, authenticated, getAccessToken } = usePrivy();
  const { initOAuth } = useLoginWithOAuth();
  const { theme } = useTheme();

  const isDark = theme === 'dark';
  const bg = isDark ? '#0B0F19' : '#F8FAFC';
  const text = isDark ? '#F8FAFC' : '#0F172A';
  const textMuted = isDark ? '#94A3B8' : '#475569';
  const textDim = isDark ? '#475569' : '#94A3B8';
  const border = isDark ? '#2D3748' : '#E2E8F0';
  const cardBg = isDark ? '#151B2B' : '#FFFFFF';
  const inputBg = isDark ? '#1E2638' : '#FFFFFF';

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [twitterHandle, setTwitterHandle] = useState('');
  const [category, setCategory] = useState('other');
  const [logoUrl, setLogoUrl] = useState('');
  const [launchMode, setLaunchMode] = useState<'now' | 'schedule'>('now');
  const [scheduledFor, setScheduledFor] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [projectId, setProjectId] = useState('');

  useEffect(() => {
    if (ready && authenticated) {
      getAccessToken().then(token => {
        if (!token) return;
        fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
          .then(r => r.json())
          .then(data => {
            setUserInfo(data);
            if (data.twitter_handle && !twitterHandle) {
              setTwitterHandle(data.twitter_handle);
            }
          })
          .catch(() => {});
      });
    }
  }, [ready, authenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authenticated) return;
    setError('');
    setSubmitting(true);

    try {
      const token = await getAccessToken();
      if (!token) { setError('Failed to get auth token'); setSubmitting(false); return; }

      const body: Record<string, string | undefined> = {
        name: name.trim(),
        tagline: tagline.trim(),
        description: description.trim() || undefined,
        website_url: websiteUrl.trim() || undefined,
        twitter_handle: twitterHandle.trim() || undefined,
        category,
        logo_url: logoUrl.trim() || undefined,
      };

      if (launchMode === 'schedule' && scheduledFor) {
        body.scheduled_for = new Date(scheduledFor).toISOString();
      }

      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to submit');
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      setProjectId(data.project?.id || '');
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setSubmitting(false);
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 10,
    border: `1px solid ${border}`,
    background: inputBg,
    color: text,
    fontSize: 14,
    fontFamily: 'inherit',
    outline: 'none',
  };

  const labelStyle = {
    fontSize: 13,
    fontWeight: 600 as const,
    color: text,
    marginBottom: 6,
    display: 'block' as const,
  };

  const counterStyle = (current: number, max: number) => ({
    fontSize: 11,
    color: current > max ? '#ef4444' : textDim,
    textAlign: 'right' as const,
    marginTop: 4,
    fontFamily: "'JetBrains Mono', monospace",
  });

  // Not authenticated
  if (ready && !authenticated) {
    return (
      <div style={{ minHeight: '100vh', background: bg, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ textAlign: 'center', maxWidth: 400 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(0,68,255,0.1)', border: '1px solid rgba(0,68,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0044FF" strokeWidth="2" strokeLinecap="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: text, margin: '0 0 8px' }}>Sign in to launch</h1>
            <p style={{ fontSize: 15, color: textMuted, margin: '0 0 24px', lineHeight: 1.5 }}>
              Connect your Twitter account to submit a product on Sonarbot.
            </p>
            <button onClick={() => initOAuth({ provider: 'twitter' })} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px',
              borderRadius: 10, background: '#0044FF', border: 'none',
              fontSize: 15, fontWeight: 600, color: '#fff', cursor: 'pointer',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              Sign in with Twitter
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: bg, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ textAlign: 'center', maxWidth: 400 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: text, margin: '0 0 8px' }}>
              {launchMode === 'schedule' ? 'Signal Scheduled' : 'Signal Broadcasted'}
            </h1>
            <p style={{ fontSize: 15, color: textMuted, margin: '0 0 24px', lineHeight: 1.5 }}>
              {launchMode === 'schedule'
                ? 'Your product is scheduled and will appear in Upcoming until launch time.'
                : 'Your product is now live on Sonarbot.'}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              {projectId && (
                <button onClick={() => router.push(`/project/${projectId}`)} style={{
                  padding: '10px 20px', borderRadius: 10, background: '#0044FF', border: 'none',
                  fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer',
                }}>
                  View Product
                </button>
              )}
              <button onClick={() => router.push('/')} style={{
                padding: '10px 20px', borderRadius: 10, border: `1px solid ${border}`, background: cardBg,
                fontSize: 14, fontWeight: 600, color: text, cursor: 'pointer',
              }}>
                Back to Feed
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, maxWidth: 560, margin: '0 auto', padding: '32px 20px 80px', width: '100%' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: text, margin: '0 0 4px' }}>Broadcast Signal</h1>
        <p style={{ fontSize: 15, color: textMuted, margin: '0 0 32px' }}>Launch your product on Base</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Name */}
          <div>
            <label style={labelStyle}>Name <span style={{ color: '#ef4444' }}>*</span></label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value.slice(0, 40))}
              placeholder="Your product name"
              required
              maxLength={40}
              style={inputStyle}
            />
            <div style={counterStyle(name.length, 40)}>{name.length}/40</div>
          </div>

          {/* Tagline */}
          <div>
            <label style={labelStyle}>Tagline <span style={{ color: '#ef4444' }}>*</span></label>
            <input
              type="text"
              value={tagline}
              onChange={e => setTagline(e.target.value.slice(0, 60))}
              placeholder="What does it do? One line."
              required
              maxLength={60}
              style={inputStyle}
            />
            <div style={counterStyle(tagline.length, 60)}>{tagline.length}/60</div>
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value.slice(0, 500))}
              placeholder="Tell people about your product..."
              rows={4}
              maxLength={500}
              style={{ ...inputStyle, resize: 'vertical' as const, minHeight: 100 }}
            />
            <div style={counterStyle(description.length, 500)}>{description.length}/500</div>
          </div>

          {/* Website URL */}
          <div>
            <label style={labelStyle}>Website URL</label>
            <input
              type="url"
              value={websiteUrl}
              onChange={e => setWebsiteUrl(e.target.value)}
              placeholder="https://myproduct.xyz"
              style={inputStyle}
            />
          </div>

          {/* Twitter Handle */}
          <div>
            <label style={labelStyle}>Twitter Handle</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: textDim, fontSize: 14 }}>@</span>
              <input
                type="text"
                value={twitterHandle}
                onChange={e => setTwitterHandle(e.target.value.replace(/^@/, ''))}
                placeholder="yourproduct"
                style={{ ...inputStyle, paddingLeft: 28 }}
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label style={labelStyle}>Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' as const, backgroundImage: 'none' }}
            >
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Logo URL */}
          <div>
            <label style={labelStyle}>Logo URL</label>
            <input
              type="url"
              value={logoUrl}
              onChange={e => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
              style={inputStyle}
            />
            <p style={{ fontSize: 12, color: textDim, margin: '4px 0 0' }}>Direct link to a square image (PNG, JPG)</p>
          </div>

          {/* Launch timing */}
          <div>
            <label style={labelStyle}>Launch Timing</label>
            <div style={{ display: 'flex', borderRadius: 10, border: `1px solid ${border}`, overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => setLaunchMode('now')}
                style={{
                  flex: 1, padding: '10px 0', border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600,
                  background: launchMode === 'now' ? '#0044FF' : 'transparent',
                  color: launchMode === 'now' ? '#fff' : textMuted,
                  transition: 'all 0.15s ease',
                }}
              >
                Launch Now
              </button>
              <button
                type="button"
                onClick={() => setLaunchMode('schedule')}
                style={{
                  flex: 1, padding: '10px 0', border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600,
                  background: launchMode === 'schedule' ? '#0044FF' : 'transparent',
                  color: launchMode === 'schedule' ? '#fff' : textMuted,
                  borderLeft: `1px solid ${border}`,
                  transition: 'all 0.15s ease',
                }}
              >
                Schedule
              </button>
            </div>
            {launchMode === 'schedule' && (
              <div style={{ marginTop: 12 }}>
                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={e => setScheduledFor(e.target.value)}
                  min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                  required={launchMode === 'schedule'}
                  style={inputStyle}
                />
                <p style={{ fontSize: 12, color: textDim, margin: '4px 0 0' }}>Your product will appear in Upcoming until this date</p>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: 13, fontWeight: 500 }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !name.trim() || !tagline.trim()}
            style={{
              padding: '14px 0', borderRadius: 10, border: 'none',
              background: submitting || !name.trim() || !tagline.trim() ? (isDark ? '#2D3748' : '#E2E8F0') : '#0044FF',
              color: submitting || !name.trim() || !tagline.trim() ? textDim : '#fff',
              fontSize: 15, fontWeight: 700, cursor: submitting ? 'wait' : 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {submitting ? 'Broadcasting...' : 'Broadcast Signal'}
          </button>
        </form>
      </main>
    </div>
  );
}
