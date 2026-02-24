'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePrivy, useLoginWithOAuth } from '@privy-io/react-auth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useTheme } from '@/components/ThemeProvider';

const CATEGORIES = [
  { id: 'agents', label: 'AI Agents', desc: 'Autonomous agents & automation' },
  { id: 'defi', label: 'DeFi', desc: 'Protocols, yield, trading' },
  { id: 'infrastructure', label: 'Infrastructure', desc: 'Dev tools, APIs, SDKs' },
  { id: 'consumer', label: 'Consumer', desc: 'Apps & wallets' },
  { id: 'gaming', label: 'Gaming', desc: 'Games & entertainment' },
  { id: 'social', label: 'Social', desc: 'Communities & social' },
  { id: 'tools', label: 'Tools', desc: 'Utilities & analytics' },
  { id: 'other', label: 'Other', desc: 'Everything else' },
];

export default function SubmitPage() {
  const router = useRouter();
  const { authenticated, ready, user, getAccessToken } = usePrivy();
  const { initOAuth } = useLoginWithOAuth();
  const { colors } = useTheme();

  const [form, setForm] = useState({
    name: '',
    tagline: '',
    category: '',
    twitter_handle: '',
    website_url: '',
    description: '',
  });
  const [launchTiming, setLaunchTiming] = useState<'now' | 'schedule'>('now');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('12:00');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCategorySelect = (categoryId: string) => {
    setForm(prev => ({ ...prev, category: categoryId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!form.name.trim()) { setError('Product name is required'); return; }
    if (!form.tagline.trim()) { setError('Tagline is required'); return; }
    if (!form.category) { setError('Select a category'); return; }
    if (!form.twitter_handle.trim()) { setError('Twitter handle is required'); return; }
    if (!form.description.trim()) { setError('Description is required'); return; }
    if (launchTiming === 'schedule' && !scheduledDate) { setError('Select a launch date'); return; }

    // Build scheduled_for timestamp if scheduling
    let scheduled_for: string | undefined;
    if (launchTiming === 'schedule' && scheduledDate) {
      const dt = new Date(`${scheduledDate}T${scheduledTime}`);
      if (dt <= new Date()) { setError('Launch date must be in the future'); return; }
      scheduled_for = dt.toISOString();
    }

    setSubmitting(true);

    try {
      const token = await getAccessToken();
      
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          tagline: form.tagline.trim(),
          category: form.category,
          twitter_handle: form.twitter_handle.trim().replace('@', ''),
          website_url: form.website_url.trim() || undefined,
          description: form.description.trim(),
          scheduled_for,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || data.message || 'Failed to submit product');
      }

      const data = await res.json();
      router.push(`/project/${data.project?.id || data.id}`);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    fontSize: 15,
    border: `1px solid ${colors.border}`,
    borderRadius: 10,
    background: colors.bgCard,
    color: colors.text,
    outline: 'none',
    transition: 'border-color 150ms, box-shadow 150ms',
    boxSizing: 'border-box' as const,
  };

  const labelStyle = {
    display: 'block',
    fontSize: 14,
    fontWeight: 600 as const,
    color: colors.text,
    marginBottom: 6,
  };

  const hintStyle = {
    fontSize: 13,
    color: colors.textDim,
    marginTop: 4,
  };

  // Not ready yet
  if (!ready) {
    return (
      <div style={{ minHeight: '100vh', background: colors.bg, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 24, height: 24, border: `2px solid ${colors.border}`, borderTopColor: '#0052FF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </main>
        <Footer />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Not authenticated
  if (!authenticated) {
    return (
      <div style={{ minHeight: '100vh', background: colors.bg, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main className="submit-main" style={{ flex: 1, maxWidth: 560, margin: '0 auto', padding: '60px 20px 80px', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ textAlign: 'center', animation: 'fadeInUp 350ms ease-out both' }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: colors.text, margin: '0 0 8px' }}>
              Launch your product
            </h1>
            <p style={{ fontSize: 16, color: colors.textMuted, margin: '0 0 32px', lineHeight: 1.6 }}>
              Sign in with X to submit your product to Sonarbot.
            </p>
            <button
              onClick={() => initOAuth({ provider: 'twitter' })}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '14px 28px',
                fontSize: 15,
                fontWeight: 600,
                color: '#fff',
                background: '#000',
                border: 'none',
                borderRadius: 10,
                cursor: 'pointer',
                transition: 'transform 150ms, box-shadow 150ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Sign in with X
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Authenticated - show form
  return (
    <div style={{ minHeight: '100vh', background: colors.bg, display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main className="submit-main" style={{ flex: 1, maxWidth: 640, margin: '0 auto', padding: '40px 20px 80px', width: '100%', boxSizing: 'border-box' }}>

        <div style={{ marginBottom: 32, animation: 'fadeInUp 350ms ease-out both' }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: colors.text, margin: '0 0 6px' }}>
            Submit your product
          </h1>
          <p style={{ fontSize: 16, color: colors.textMuted, margin: 0 }}>
            Share what you've built with the Base community.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ animation: 'fadeInUp 350ms ease-out 50ms both' }}>

          {/* Error */}
          {error && (
            <div style={{
              padding: '12px 16px',
              marginBottom: 20,
              borderRadius: 10,
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#ef4444',
              fontSize: 14,
              fontWeight: 500,
            }}>
              {error}
            </div>
          )}

          {/* Name */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Product name *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="My Awesome Product"
              maxLength={60}
              style={inputStyle}
              onFocus={e => { e.currentTarget.style.borderColor = '#0052FF'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 82, 255, 0.1)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Tagline */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Tagline *</label>
            <input
              type="text"
              name="tagline"
              value={form.tagline}
              onChange={handleChange}
              placeholder="What it does in one line"
              maxLength={120}
              style={inputStyle}
              onFocus={e => { e.currentTarget.style.borderColor = '#0052FF'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 82, 255, 0.1)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.boxShadow = 'none'; }}
            />
            <p style={hintStyle}>{form.tagline.length}/120 characters</p>
          </div>

          {/* Category */}
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Category *</label>
            <div className="category-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat.id)}
                  style={{
                    padding: '12px 10px',
                    borderRadius: 10,
                    border: form.category === cat.id ? '2px solid #0052FF' : `1px solid ${colors.border}`,
                    background: form.category === cat.id ? 'rgba(0, 82, 255, 0.06)' : colors.bgCard,
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 150ms',
                  }}
                >
                  <p style={{ fontSize: 13, fontWeight: 600, color: form.category === cat.id ? '#0052FF' : colors.text, margin: 0 }}>
                    {cat.label}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Twitter handle */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Product Twitter handle *</label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: colors.textDim,
                fontSize: 15,
                pointerEvents: 'none',
              }}>@</span>
              <input
                type="text"
                name="twitter_handle"
                value={form.twitter_handle}
                onChange={handleChange}
                placeholder="yourproduct"
                maxLength={30}
                style={{ ...inputStyle, paddingLeft: 32 }}
                onFocus={e => { e.currentTarget.style.borderColor = '#0052FF'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 82, 255, 0.1)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          {/* Website URL */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Website URL</label>
            <input
              type="url"
              name="website_url"
              value={form.website_url}
              onChange={handleChange}
              placeholder="https://yourproduct.xyz"
              style={inputStyle}
              onFocus={e => { e.currentTarget.style.borderColor = '#0052FF'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 82, 255, 0.1)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.boxShadow = 'none'; }}
            />
            <p style={hintStyle}>Optional but recommended</p>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 28 }}>
            <label style={labelStyle}>Description *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Tell the community what you built and why it matters. Include links to tweets, demos, or docs."
              rows={5}
              maxLength={2000}
              style={{ ...inputStyle, resize: 'vertical', minHeight: 120, lineHeight: 1.5 }}
              onFocus={e => { e.currentTarget.style.borderColor = '#0052FF'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 82, 255, 0.1)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.boxShadow = 'none'; }}
            />
            <p style={hintStyle}>{form.description.length}/2000 characters • Tweet URLs will render as cards</p>
          </div>

          {/* Launch Timing */}
          <div style={{ marginBottom: 28 }}>
            <label style={labelStyle}>Launch timing</label>
            <div style={{ display: 'flex', gap: 12, marginBottom: launchTiming === 'schedule' ? 16 : 0 }}>
              <button
                type="button"
                onClick={() => setLaunchTiming('now')}
                style={{
                  flex: 1,
                  padding: '14px 16px',
                  borderRadius: 10,
                  border: launchTiming === 'now' ? '2px solid #0052FF' : `1px solid ${colors.border}`,
                  background: launchTiming === 'now' ? 'rgba(0, 82, 255, 0.06)' : colors.bgCard,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 150ms',
                }}
              >
                <p style={{ fontSize: 14, fontWeight: 600, color: launchTiming === 'now' ? '#0052FF' : colors.text, margin: '0 0 2px' }}>
                  Launch now
                </p>
                <p style={{ fontSize: 12, color: colors.textDim, margin: 0 }}>
                  Go live immediately
                </p>
              </button>
              <button
                type="button"
                onClick={() => setLaunchTiming('schedule')}
                style={{
                  flex: 1,
                  padding: '14px 16px',
                  borderRadius: 10,
                  border: launchTiming === 'schedule' ? '2px solid #0052FF' : `1px solid ${colors.border}`,
                  background: launchTiming === 'schedule' ? 'rgba(0, 82, 255, 0.06)' : colors.bgCard,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 150ms',
                }}
              >
                <p style={{ fontSize: 14, fontWeight: 600, color: launchTiming === 'schedule' ? '#0052FF' : colors.text, margin: '0 0 2px' }}>
                  Schedule
                </p>
                <p style={{ fontSize: 12, color: colors.textDim, margin: 0 }}>
                  Pick a launch date
                </p>
              </button>
            </div>

            {launchTiming === 'schedule' && (
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={e => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    style={inputStyle}
                    onFocus={e => { e.currentTarget.style.borderColor = '#0052FF'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 82, 255, 0.1)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = colors.border; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </div>
                <div style={{ width: 120 }}>
                  <select
                    value={scheduledTime}
                    onChange={e => setScheduledTime(e.target.value)}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    {Array.from({ length: 24 }, (_, h) => {
                      const hour = h.toString().padStart(2, '0');
                      return (
                        <option key={h} value={`${hour}:00`}>{hour}:00 UTC</option>
                      );
                    })}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '14px 24px',
              fontSize: 16,
              fontWeight: 600,
              color: '#fff',
              background: submitting ? colors.textDim : '#0052FF',
              border: 'none',
              borderRadius: 10,
              cursor: submitting ? 'not-allowed' : 'pointer',
              transition: 'all 150ms',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {submitting ? (
              <>
                <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Submitting...
              </>
            ) : (
              launchTiming === 'schedule' ? 'Schedule launch' : 'Launch now'
            )}
          </button>

          <p style={{ fontSize: 13, color: colors.textDim, marginTop: 16, textAlign: 'center', lineHeight: 1.6 }}>
            By submitting, you agree to our guidelines. Read the{' '}
            <Link href="/docs#guidelines" style={{ color: '#0052FF', textDecoration: 'none' }}>docs</Link>{' '}
            for best practices.
          </p>
        </form>
      </main>

      <Footer />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 640px) {
          .submit-main {
            padding: 24px 16px 60px !important;
          }
          .category-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}
