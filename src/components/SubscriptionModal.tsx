'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  limitMessage: string;
  getAccessToken?: () => Promise<string | null>;
}

const PAYMENT_WALLET = '0xE3aC289bC25404A2c66A02459aB99dcD746E52b2';
const SNR_CONTRACT = '0xE1231f809124e4Aa556cD9d8c28CB33f02c75b07';

export default function SubscriptionModal({ isOpen, onClose, limitMessage, getAccessToken }: SubscriptionModalProps) {
  const { theme } = useTheme();
  const [copied, setCopied] = useState<'wallet' | 'contract' | null>(null);
  const [snrAmount, setSnrAmount] = useState<string | null>(null);
  const [txHash, setTxHash] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const isDark = theme === 'dark';
  const accent = isDark ? '#4d7cff' : '#0044ff';
  const bg = isDark ? '#111827' : '#ffffff';
  const border = isDark ? '#232d3f' : '#e5e7eb';
  const text = isDark ? '#f1f5f9' : '#111827';
  const textMuted = isDark ? '#8892a4' : '#6b7280';
  const textDim = isDark ? '#4a5568' : '#9ca3af';
  const inputBg = isDark ? 'rgba(255,255,255,0.04)' : '#f9fafb';

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    setTxHash('');
    setResult(null);
    setSubmitting(false);
    if (getAccessToken) {
      getAccessToken().then(token => {
        if (!token) return;
        fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: '{}',
        })
          .then(r => r.ok ? r.json() : null)
          .then(d => { if (d?.snr_amount_required) setSnrAmount(d.snr_amount_required); })
          .catch(() => {});
      });
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, getAccessToken]);

  useEffect(() => {
    if (!isOpen) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isOpen, onClose]);

  const handleConfirm = async () => {
    if (!txHash.trim() || submitting || !getAccessToken) return;
    setSubmitting(true);
    setResult(null);
    try {
      const token = await getAccessToken();
      if (!token) { setResult({ ok: false, msg: 'Not authenticated' }); setSubmitting(false); return; }
      const res = await fetch('/api/subscribe/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tx_hash: txHash.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ ok: true, msg: `Premium activated until ${new Date(data.expires).toLocaleDateString()}` });
      } else {
        setResult({ ok: false, msg: data.error || data.details || 'Verification failed' });
      }
    } catch {
      setResult({ ok: false, msg: 'Network error — try again' });
    }
    setSubmitting(false);
  };

  if (!isOpen) return null;

  const copyText = (val: string, which: 'wallet' | 'contract') => {
    navigator.clipboard.writeText(val);
    setCopied(which);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
        animation: 'subModalFadeIn 0.2s ease-out',
        padding: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 448, borderRadius: 16, padding: 24, position: 'relative',
          background: bg,
          border: `1px solid ${border}`,
          boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.5)' : '0 20px 60px rgba(0,0,0,0.1)',
          animation: 'subModalSlideUp 0.25s ease-out',
        }}
      >
        {/* Close */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 14, right: 14, width: 30, height: 30, borderRadius: 8,
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: textDim, fontSize: 16, lineHeight: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>✕</button>

        {/* Title */}
        <h2 style={{ fontSize: 18, fontWeight: 700, color: text, margin: '0 0 4px' }}>
          Upgrade to Premium
        </h2>
        <p style={{ fontSize: 14, color: textMuted, margin: '0 0 4px' }}>
          Free tier: {limitMessage || 'limit reached'}
        </p>
        <p style={{ fontSize: 22, fontWeight: 700, color: text, margin: '0 0 20px' }}>
          {snrAmount ? `${snrAmount} $SNR` : '$SNR'}{' '}
          <span style={{ fontSize: 14, fontWeight: 500, color: textDim }}>/ 30 days</span>
        </p>

        {/* Steps */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20,
          padding: '16px', borderRadius: 12,
          background: isDark ? 'rgba(255,255,255,0.03)' : '#f9fafb',
          border: `1px solid ${border}`,
        }}>
          {/* Step 1 */}
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
              background: accent, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700,
            }}>1</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: text, margin: '0 0 4px' }}>Get $SNR on Base</p>
              <div
                onClick={() => copyText(SNR_CONTRACT, 'contract')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 10px', borderRadius: 8, cursor: 'pointer',
                  background: inputBg, border: `1px solid ${border}`,
                  fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
                  color: textMuted, wordBreak: 'break-all', lineHeight: 1.4,
                }}>
                <span style={{ flex: 1 }}>{SNR_CONTRACT}</span>
                <span style={{ flexShrink: 0, fontSize: 10, color: copied === 'contract' ? '#22c55e' : accent, fontWeight: 600 }}>
                  {copied === 'contract' ? '✓' : 'copy'}
                </span>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
              background: accent, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700,
            }}>2</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: text, margin: '0 0 4px' }}>Send to payment wallet</p>
              <div
                onClick={() => copyText(PAYMENT_WALLET, 'wallet')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 10px', borderRadius: 8, cursor: 'pointer',
                  background: inputBg, border: `1px solid ${border}`,
                  fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
                  color: textMuted, wordBreak: 'break-all', lineHeight: 1.4,
                }}>
                <span style={{ flex: 1 }}>{PAYMENT_WALLET}</span>
                <span style={{ flexShrink: 0, fontSize: 10, color: copied === 'wallet' ? '#22c55e' : accent, fontWeight: 600 }}>
                  {copied === 'wallet' ? '✓' : 'copy'}
                </span>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
              background: accent, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700,
            }}>3</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: text, margin: '0 0 4px' }}>Paste tx hash to confirm</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  value={txHash}
                  onChange={e => { setTxHash(e.target.value); setResult(null); }}
                  placeholder="0x..."
                  disabled={submitting || (result?.ok ?? false)}
                  style={{
                    flex: 1, padding: '8px 10px', borderRadius: 8,
                    background: inputBg, border: `1px solid ${border}`,
                    color: text, fontSize: 12, fontFamily: "'JetBrains Mono', monospace",
                    outline: 'none', transition: 'border-color 0.15s',
                  }}
                  onFocus={e => { e.target.style.borderColor = accent; }}
                  onBlur={e => { e.target.style.borderColor = border; }}
                />
                <button
                  onClick={handleConfirm}
                  disabled={!txHash.trim() || submitting || (result?.ok ?? false)}
                  style={{
                    padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: (!txHash.trim() || submitting || result?.ok) ? (isDark ? '#1e293b' : '#e2e8f0') : accent,
                    color: (!txHash.trim() || submitting || result?.ok) ? textDim : '#ffffff',
                    fontSize: 13, fontWeight: 700,
                    transition: 'background 0.15s',
                    flexShrink: 0,
                  }}
                >
                  {submitting ? '...' : result?.ok ? '✓' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Result message */}
        {result && (
          <div style={{
            padding: '10px 12px', borderRadius: 10, fontSize: 12, lineHeight: 1.5,
            background: result.ok
              ? (isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.06)')
              : (isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.06)'),
            border: `1px solid ${result.ok ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            color: result.ok ? '#22c55e' : '#ef4444',
            marginBottom: 16,
          }}>
            {result.msg}
          </div>
        )}

        {/* Benefits */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            'Unlimited upvotes, comments & submissions',
            'Earn weekly $SNR rewards by curating',
            'Support the platform & ecosystem',
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span style={{ fontSize: 13, color: textMuted }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes subModalFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes subModalSlideUp { from { opacity: 0; transform: translateY(12px) scale(0.98) } to { opacity: 1; transform: translateY(0) scale(1) } }
      `}</style>
    </div>
  );
}
