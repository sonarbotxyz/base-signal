'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  limitMessage: string;
}

export default function SubscriptionModal({ isOpen, onClose, limitMessage }: SubscriptionModalProps) {
  const { theme, colors } = useTheme();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const accent = colors.accent;

  const freeTier = [
    { label: '1 submission / week', limited: true },
    { label: '2 upvotes / day', limited: true },
    { label: '2 comments / day', limited: true },
  ];

  const premiumTier = [
    { label: 'Unlimited submissions', icon: '∞' },
    { label: 'Unlimited upvotes', icon: '∞' },
    { label: 'Unlimited comments', icon: '∞' },
    { label: 'Support development', icon: '✓' },
  ];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        animation: 'subModalFadeIn 0.25s ease-out',
        padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 480, borderRadius: 20, padding: 32, position: 'relative',
          background: theme === 'dark'
            ? 'linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(15, 20, 35, 0.98))'
            : '#ffffff',
          border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.08)' : colors.border}`,
          boxShadow: theme === 'dark'
            ? `0 24px 80px rgba(0,0,0,0.6), 0 0 40px ${accent}15`
            : '0 24px 80px rgba(0,0,0,0.12), 0 4px 20px rgba(0,0,0,0.06)',
          animation: 'subModalSlideUp 0.3s ease-out',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            width: 32, height: 32, borderRadius: 8,
            background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: colors.textDim, fontSize: 18, lineHeight: 1,
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={e => { (e.target as HTMLElement).style.background = theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'; }}
          onMouseLeave={e => { (e.target as HTMLElement).style.background = theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'; }}
        >
          ✕
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
            background: `${accent}15`, border: `1px solid ${accent}33`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <h2 style={{
            fontSize: 22, fontWeight: 700, color: colors.text, margin: '0 0 8px',
            fontFamily: "var(--font-outfit, 'Outfit', sans-serif)",
          }}>
            You{"'"}ve hit your limit
          </h2>
          <p style={{
            fontSize: 14, color: colors.textMuted, margin: 0, lineHeight: 1.5,
          }}>
            Free accounts are limited to <strong style={{ color: colors.text }}>{limitMessage || 'this action'}</strong>.
            <br />Upgrade to unlock unlimited access.
          </p>
        </div>

        {/* Comparison */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {/* Free tier */}
          <div style={{
            padding: '16px 18px', borderRadius: 14,
            background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.06)' : colors.border}`,
          }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: colors.textDim,
              textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10,
              fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
            }}>
              Free
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {freeTier.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: 6,
                    background: theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, color: colors.textDim, flexShrink: 0,
                  }}>
                    ✗
                  </span>
                  <span style={{ fontSize: 14, color: colors.textMuted }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Premium tier */}
          <div style={{
            padding: '16px 18px', borderRadius: 14,
            background: theme === 'dark'
              ? `linear-gradient(135deg, ${accent}08, ${accent}04)`
              : `linear-gradient(135deg, ${accent}06, ${accent}03)`,
            border: `1px solid ${accent}33`,
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, color: accent,
                textTransform: 'uppercase', letterSpacing: 1,
                fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
              }}>
                Premium
              </span>
              <span style={{
                fontSize: 14, fontWeight: 700, color: accent,
                fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
              }}>
                $9.99<span style={{ fontSize: 11, fontWeight: 500, color: colors.textMuted }}>/mo in $SNR</span>
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {premiumTier.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: 6,
                    background: `${accent}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: accent, flexShrink: 0,
                    fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
                  }}>
                    {item.icon}
                  </span>
                  <span style={{ fontSize: 14, color: colors.text, fontWeight: 500 }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/curation"
          onClick={onClose}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '100%', height: 50, borderRadius: 12, boxSizing: 'border-box',
            background: accent, color: '#ffffff',
            fontSize: 15, fontWeight: 700, textDecoration: 'none',
            boxShadow: `0 0 24px ${accent}4D, 0 4px 12px ${accent}33`,
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
            fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
          }}
        >
          Subscribe Now
        </Link>

        <p style={{
          textAlign: 'center', fontSize: 12, color: colors.textDim, margin: '12px 0 0',
        }}>
          Pay with $SNR tokens · Cancel anytime
        </p>
      </div>

      <style>{`
        @keyframes subModalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes subModalSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
