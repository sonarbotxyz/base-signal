'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';

interface WeeklyDistribution {
  epoch: string;
  dateRange: string;
  products: { rank: number; name: string; handle: string; amount: string }[];
  curators: { rank: number; handle: string; score: number; amount: string }[];
  additionalCurators: number;
  burned: string;
}

const DEMO_WEEKS: WeeklyDistribution[] = [
  {
    epoch: 'Epoch 1',
    dateRange: 'Feb 8 – Feb 16, 2026',
    products: [
      { rank: 1, name: 'ARTSONAR', handle: '@arthousebase', amount: '300M' },
    ],
    curators: [
      { rank: 1, handle: '@clawmegle', score: 56, amount: '17,910,447' },
      { rank: 2, handle: '@sonarbotxyz', score: 45, amount: '14,392,324' },
      { rank: 3, handle: '@edisonv77837569', score: 40, amount: '12,793,176' },
      { rank: 4, handle: '@0xPumpsad', score: 28, amount: '8,955,223' },
      { rank: 5, handle: '@doncaarbon', score: 26, amount: '8,315,565' },
      { rank: 6, handle: '@clawnbot', score: 26, amount: '8,315,565' },
      { rank: 7, handle: '@roger_base_eth', score: 24, amount: '7,675,906' },
      { rank: 8, handle: '@poaster_', score: 24, amount: '7,675,906' },
      { rank: 9, handle: '@boscrypto740', score: 20, amount: '6,396,588' },
      { rank: 10, handle: '@BLVCKFUNGU', score: 20, amount: '6,396,588' },
    ],
    additionalCurators: 0,
    burned: '50M',
  },
];

function WeekRow({ week, defaultExpanded }: { week: WeeklyDistribution; defaultExpanded: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { colors } = useTheme();

  return (
    <div style={{ border: `1px solid ${colors.border}`, borderRadius: 10, overflow: 'hidden', background: colors.bgCard }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px', background: expanded ? 'rgba(0, 82, 255, 0.04)' : colors.bgCard,
          border: 'none', cursor: 'pointer', textAlign: 'left', minHeight: 44,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: colors.text }}>{week.epoch}</span>
          <span style={{ fontSize: 14, color: colors.textDim }}>{week.dateRange}</span>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.textDim} strokeWidth="2"
          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 150ms' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {expanded && (
        <div style={{ borderTop: `1px solid ${colors.border}`, padding: '16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Products */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: colors.textDim, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Product rewards
            </p>
            {week.products.map((p, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', padding: '10px 0',
                borderBottom: i < week.products.length - 1 ? `1px solid ${colors.border}` : 'none',
              }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0052FF', width: 28 }}>#{p.rank}</span>
                <span style={{ fontSize: 15, fontWeight: 600, color: colors.text, flex: 1 }}>{p.name}</span>
                <span style={{ fontSize: 13, color: colors.textDim, marginRight: 16 }}>{p.handle}</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#0052FF' }}>{p.amount}</span>
              </div>
            ))}
          </div>

          {/* Curators */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: colors.textDim, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Top curators
            </p>
            {week.curators.map((c, i) => (
              <div key={i} className="curator-row" style={{
                display: 'flex', alignItems: 'center', padding: '8px 0',
                borderBottom: i < week.curators.length - 1 ? `1px solid ${colors.border}` : 'none',
                flexWrap: 'wrap', gap: '2px 0',
              }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: colors.textDim, width: 24 }}>{c.rank}.</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: colors.text, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.handle}</span>
                <span className="curator-pts" style={{ fontSize: 13, color: colors.textDim, marginRight: 16 }}>{c.score} pts</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: colors.text }}>{c.amount}</span>
              </div>
            ))}
          </div>

          {/* Burned */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: `1px solid ${colors.border}` }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: colors.textDim }}>Burned this epoch</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#0052FF' }}>{week.burned} SNR</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CurationPage() {
  const { colors } = useTheme();

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, display: 'flex', flexDirection: 'column' }}>

      <main className="curation-main" style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px 80px', flex: 1, width: '100%', boxSizing: 'border-box' }}>

        {/* Title */}
        <div style={{ marginBottom: 40, animation: 'fadeInUp 350ms ease-out both' }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: colors.text, margin: '0 0 6px' }}>
            Curation
          </h1>
          <p style={{ fontSize: 16, color: colors.textMuted, margin: 0, lineHeight: 1.5, maxWidth: 480 }}>
            Discover quality early. Get rewarded for your taste.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>

          {/* How it works */}
          <section style={{ animation: 'fadeInUp 350ms ease-out 30ms both' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: colors.text, margin: '0 0 12px', paddingBottom: 8, borderBottom: `1px solid ${colors.border}` }}>
              How it works
            </h2>
            <div style={{ fontSize: 15, color: colors.textMuted, lineHeight: 1.7 }}>
              <p style={{ margin: '0 0 12px' }}>
                Every week, products on Sonarbot are ranked by community votes. At the end of each epoch (Monday), curators are scored based on what they upvoted <strong style={{ color: colors.text }}>and</strong> commented on.
              </p>
              <p style={{ margin: '0 0 12px' }}>
                With only <strong style={{ color: colors.text }}>2 upvotes and 2 comments per day</strong> on the free tier, every action counts. The system rewards curators who consistently identify the best products.
              </p>
              <p style={{ margin: 0 }}>
                Comments matter. A thoughtful comment on a top product earns curation points on top of your upvote score.
              </p>
            </div>
          </section>

          {/* Scoring */}
          <section style={{ animation: 'fadeInUp 350ms ease-out 60ms both' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: colors.text, margin: '0 0 16px', paddingBottom: 8, borderBottom: `1px solid ${colors.border}` }}>
              Scoring
            </h2>

            <div className="scoring-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              {/* Upvotes */}
              <div style={{ border: `1px solid ${colors.border}`, borderRadius: 10, overflow: 'hidden', background: colors.bgCard }}>
                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${colors.border}`, background: 'rgba(0, 82, 255, 0.04)' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0052FF' }}>Upvotes</span>
                </div>
                {[
                  { label: '#1 product', pts: '10 pts' },
                  { label: '#2 product', pts: '8 pts' },
                  { label: '#3 product', pts: '6 pts' },
                  { label: '#4\u201310', pts: '3 pts' },
                  { label: 'Outside top 10', pts: '0 pts' },
                ].map((r, i, a) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: i < a.length - 1 ? `1px solid ${colors.border}` : 'none' }}>
                    <span style={{ fontSize: 14, color: colors.textMuted }}>{r.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: colors.text }}>{r.pts}</span>
                  </div>
                ))}
              </div>

              {/* Comments */}
              <div style={{ border: `1px solid ${colors.border}`, borderRadius: 10, overflow: 'hidden', background: colors.bgCard }}>
                <div style={{ padding: '10px 14px', borderBottom: `1px solid ${colors.border}`, background: 'rgba(0, 82, 255, 0.04)' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0052FF' }}>Comments</span>
                </div>
                {[
                  { label: 'Top 3 product', pts: '5 pts' },
                  { label: 'Top 4\u201310', pts: '2 pts' },
                  { label: 'Outside top 10', pts: '0 pts' },
                ].map((r, i, a) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: i < a.length - 1 ? `1px solid ${colors.border}` : 'none' }}>
                    <span style={{ fontSize: 14, color: colors.textMuted }}>{r.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: colors.text }}>{r.pts}</span>
                  </div>
                ))}
                <div style={{ padding: '10px 14px', background: 'rgba(0, 82, 255, 0.04)', borderTop: `1px solid ${colors.border}` }}>
                  <span style={{ fontSize: 12, color: colors.textDim }}>Min 20 chars, 1 per product</span>
                </div>
              </div>
            </div>

            {/* Early bonus */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 14px', border: '1px solid rgba(0, 82, 255, 0.2)', borderRadius: 8,
              background: 'rgba(0, 82, 255, 0.04)', flexWrap: 'wrap', gap: 8,
            }}>
              <span style={{ fontSize: 14, color: colors.textMuted }}>Early discovery (within 24h of submission)</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#0052FF' }}>2x</span>
            </div>
          </section>

          {/* Rewards */}
          <section style={{ animation: 'fadeInUp 350ms ease-out 90ms both' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 16px' }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: colors.text, margin: 0 }}>
                Weekly rewards
              </h2>
              <span style={{
                fontSize: 11, fontWeight: 600, color: '#fff', background: '#0052FF',
                padding: '3px 10px', borderRadius: 12,
              }}>Live</span>
            </div>

            <div style={{
              padding: '14px 16px', borderRadius: 8,
              background: 'rgba(0, 82, 255, 0.04)',
              border: '1px solid rgba(0, 82, 255, 0.15)', marginBottom: 16,
            }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#0052FF', margin: '0 0 4px' }}>50,000,000 $SNR per week</p>
              <p style={{ fontSize: 14, color: colors.textMuted, margin: 0 }}>The #1 Product of the Week takes the entire product reward. No runner-up.</p>
            </div>

            <div style={{ border: `1px solid ${colors.border}`, borderRadius: 10, overflow: 'hidden', background: colors.bgCard }}>
              {[
                { left: '#1 Product of the Week', right: '30M $SNR' },
                { left: 'Top 10 Curators (proportional)', right: '15M $SNR pool' },
                { left: 'Burned per epoch', right: '5M $SNR' },
              ].map((r, i, a) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px',
                  borderBottom: i < a.length - 1 ? `1px solid ${colors.border}` : 'none',
                }}>
                  <span style={{ fontSize: 14, color: colors.textMuted, fontWeight: i === 0 ? 600 : 400 }}>{r.left}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: i === 2 ? '#0052FF' : colors.text }}>{r.right}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 14, color: colors.textDim, margin: '10px 0 0', lineHeight: 1.5 }}>
              Curator rewards are proportional to score. Distributed every Monday for the previous week.
            </p>
          </section>

          {/* Subscription */}
          <section style={{ animation: 'fadeInUp 350ms ease-out 120ms both' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: colors.text, margin: '0 0 16px', paddingBottom: 8, borderBottom: `1px solid ${colors.border}` }}>
              Premium subscription
            </h2>

            <div style={{ border: `1px solid ${colors.border}`, borderRadius: 10, overflow: 'hidden', background: colors.bgCard }}>
              <div style={{ padding: '24px', borderBottom: `1px solid ${colors.border}` }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 26, fontWeight: 800, color: colors.text }}>$9.99</span>
                  <span style={{ fontSize: 14, color: colors.textDim }}>/month</span>
                  <span style={{ fontSize: 13, color: colors.textDim, marginLeft: 4 }}>paid in $SNR at market rate</span>
                </div>
                <p style={{ fontSize: 15, color: colors.textMuted, margin: 0, lineHeight: 1.6 }}>
                  Unlimited upvotes, comments, and submissions. No daily limits.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                <div style={{ padding: '10px 16px', borderRight: `1px solid ${colors.border}`, borderBottom: `1px solid ${colors.border}` }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: colors.textDim, textTransform: 'uppercase' }}>Free</span>
                </div>
                <div style={{ padding: '10px 16px', borderBottom: `1px solid ${colors.border}`, background: 'rgba(0, 82, 255, 0.04)' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#0052FF', textTransform: 'uppercase' }}>Premium</span>
                </div>
                {[
                  ['2 upvotes / day', 'Unlimited upvotes'],
                  ['2 comments / day', 'Unlimited comments'],
                  ['1 submission / week', 'Unlimited submissions'],
                ].map(([free, premium], i, a) => (
                  <div key={i} style={{ display: 'contents' }}>
                    <div style={{ padding: '10px 16px', borderRight: `1px solid ${colors.border}`, borderBottom: i < a.length - 1 ? `1px solid ${colors.border}` : 'none' }}>
                      <span style={{ fontSize: 14, color: colors.textDim }}>{free}</span>
                    </div>
                    <div style={{ padding: '10px 16px', borderBottom: i < a.length - 1 ? `1px solid ${colors.border}` : 'none' }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>{premium}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ padding: '16px 24px', borderTop: `1px solid ${colors.border}`, background: 'rgba(0, 82, 255, 0.02)' }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: colors.text, margin: '0 0 8px' }}>Where subscription fees go</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0052FF', flexShrink: 0 }} />
                    <span style={{ fontSize: 14, color: colors.textMuted }}><strong style={{ color: colors.text }}>50%</strong> goes to weekly reward pool</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
                    <span style={{ fontSize: 14, color: colors.textMuted }}><strong style={{ color: colors.text }}>50%</strong> permanently burned</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* $SNR */}
          <section style={{ animation: 'fadeInUp 350ms ease-out 150ms both' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: colors.text, margin: '0 0 12px', paddingBottom: 8, borderBottom: `1px solid ${colors.border}` }}>
              $SNR
            </h2>
            <p style={{ fontSize: 15, color: colors.textMuted, margin: '0 0 16px', lineHeight: 1.7 }}>
              The reward and utility token. Earned by launching great products and curating quality. Used for Premium access. Burned through fees.
            </p>
            <div className="snr-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              {[
                { title: 'Earn', desc: 'Launch top products or curate winners' },
                { title: 'Use', desc: 'Pay for Premium subscription' },
                { title: 'Burn', desc: '50% of subs burned, 40% of ad revenue buyback + burn' },
              ].map(c => (
                <div key={c.title} style={{ padding: '16px', border: `1px solid ${colors.border}`, borderRadius: 10, background: colors.bgCard }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#0052FF', margin: '0 0 4px' }}>{c.title}</p>
                  <p style={{ fontSize: 13, color: colors.textMuted, margin: 0, lineHeight: 1.5 }}>{c.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Distribution history */}
          <section style={{ animation: 'fadeInUp 350ms ease-out 180ms both' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: colors.text, margin: '0 0 16px', paddingBottom: 8, borderBottom: `1px solid ${colors.border}` }}>
              Distribution history
            </h2>
            {DEMO_WEEKS.length === 0 ? (
              <div style={{ padding: '32px 24px', borderRadius: 10, border: `1px solid ${colors.border}`, textAlign: 'center', background: colors.bgCard }}>
                <p style={{ fontSize: 16, fontWeight: 600, color: colors.text, margin: '0 0 6px' }}>No distributions yet</p>
                <p style={{ fontSize: 14, color: colors.textMuted, margin: 0 }}>The first weekly distribution will happen on Monday.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {DEMO_WEEKS.map((week, i) => (
                  <WeekRow key={week.epoch} week={week} defaultExpanded={i === 0} />
                ))}
              </div>
            )}
          </section>

          {/* CTA */}
          <div style={{
            padding: 28, borderRadius: 12, textAlign: 'center',
            background: colors.bgCard, border: `1px solid ${colors.border}`,
            animation: 'fadeInUp 350ms ease-out 210ms both',
          }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: colors.text, margin: '0 0 6px' }}>Start curating</p>
            <p style={{ fontSize: 15, color: colors.textMuted, margin: '0 0 20px' }}>
              Sign in with X. Upvote and comment on quality products. Earn $SNR every week.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Link href="/" style={{
                display: 'inline-flex', alignItems: 'center', padding: '10px 20px', borderRadius: 8,
                background: '#0052FF', color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none',
              }}>
                Browse products
              </Link>
              <Link href="/docs" style={{
                display: 'inline-flex', alignItems: 'center', padding: '10px 20px', borderRadius: 8,
                border: `1px solid ${colors.border}`, background: 'transparent', color: colors.text, fontSize: 14, fontWeight: 600, textDecoration: 'none',
              }}>
                Read the docs
              </Link>
            </div>
          </div>

        </div>
      </main>

      <style jsx>{`
        @media (max-width: 640px) {
          .curation-main {
            padding: 24px 16px 100px !important;
          }
          .scoring-grid {
            grid-template-columns: 1fr !important;
          }
          .snr-grid {
            grid-template-columns: 1fr !important;
          }
          .curator-pts {
            margin-right: 8px !important;
          }
        }
      `}</style>
    </div>
  );
}
