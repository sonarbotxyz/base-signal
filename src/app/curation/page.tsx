'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';

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
    epoch: '2026-W07',
    dateRange: 'Feb 3 - Feb 9',
    products: [
      { rank: 1, name: '0xSwarm', handle: '@0xSwarmAI', amount: '100,000 SNR' },
      { rank: 2, name: 'Lobster Trap', handle: '@LobsterTrapAI', amount: '50,000 SNR' },
      { rank: 3, name: 'AgentPaint', handle: '@AgentPaintAI', amount: '25,000 SNR' },
    ],
    curators: [
      { rank: 1, handle: '@alpha_hunter', score: 48, amount: '8,200 SNR' },
      { rank: 2, handle: '@signal_seeker', score: 36, amount: '6,150 SNR' },
      { rank: 3, handle: '@defi_scout', score: 32, amount: '5,470 SNR' },
      { rank: 4, handle: '@agent_finder', score: 28, amount: '4,780 SNR' },
      { rank: 5, handle: '@crypto_curator', score: 24, amount: '4,100 SNR' },
    ],
    additionalCurators: 15,
    burned: '15,000 SNR',
  },
  {
    epoch: '2026-W06',
    dateRange: 'Jan 27 - Feb 2',
    products: [
      { rank: 1, name: 'ChainScope', handle: '@ChainScopeAI', amount: '100,000 SNR' },
      { rank: 2, name: 'Yield Oracle', handle: '@YieldOracleAI', amount: '50,000 SNR' },
      { rank: 3, name: 'TxMapper', handle: '@TxMapperAI', amount: '25,000 SNR' },
    ],
    curators: [
      { rank: 1, handle: '@defi_scout', score: 52, amount: '8,900 SNR' },
      { rank: 2, handle: '@alpha_hunter', score: 44, amount: '7,500 SNR' },
      { rank: 3, handle: '@onchain_dev', score: 38, amount: '6,480 SNR' },
      { rank: 4, handle: '@signal_seeker', score: 30, amount: '5,120 SNR' },
      { rank: 5, handle: '@base_builder', score: 22, amount: '3,750 SNR' },
    ],
    additionalCurators: 15,
    burned: '15,000 SNR',
  },
  {
    epoch: '2026-W05',
    dateRange: 'Jan 20 - Jan 26',
    products: [
      { rank: 1, name: 'Neural Bridge', handle: '@NeuralBridgeAI', amount: '100,000 SNR' },
      { rank: 2, name: 'Mempool Watch', handle: '@MempoolWatchAI', amount: '50,000 SNR' },
      { rank: 3, name: 'LiqFlow', handle: '@LiqFlowAI', amount: '25,000 SNR' },
    ],
    curators: [
      { rank: 1, handle: '@crypto_curator', score: 56, amount: '9,600 SNR' },
      { rank: 2, handle: '@agent_finder', score: 40, amount: '6,850 SNR' },
      { rank: 3, handle: '@alpha_hunter', score: 34, amount: '5,800 SNR' },
      { rank: 4, handle: '@defi_scout', score: 26, amount: '4,440 SNR' },
      { rank: 5, handle: '@onchain_dev', score: 20, amount: '3,410 SNR' },
    ],
    additionalCurators: 15,
    burned: '15,000 SNR',
  },
];

function WeekRow({ week, defaultExpanded }: { week: WeeklyDistribution; defaultExpanded: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div style={{ border: '1px solid #e8e8e8', borderRadius: 10, overflow: 'hidden' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          background: expanded ? '#fafbff' : '#ffffff',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#21293c' }}>
            {week.epoch}
          </span>
          <span style={{ fontSize: 13, color: '#6f7784' }}>
            ({week.dateRange})
          </span>
        </div>
        <span style={{ fontSize: 18, color: '#6f7784', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', lineHeight: 1 }}>
          &#9662;
        </span>
      </button>

      {expanded && (
        <div style={{ borderTop: '1px solid #e8e8e8', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Products */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#9b9b9b', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Product Rewards
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, border: '1px solid #f0f0f0', borderRadius: 8, overflow: 'hidden' }}>
              {week.products.map((p, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderBottom: i < week.products.length - 1 ? '1px solid #f0f0f0' : 'none',
                  background: '#ffffff',
                }}>
                  <span style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: i === 0 ? '#0000FF' : '#21293c',
                    minWidth: 28,
                  }}>
                    #{p.rank}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#21293c', minWidth: 130 }}>
                    {p.name}
                  </span>
                  <span style={{ fontSize: 13, color: '#6f7784', flex: 1 }}>
                    {p.handle}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#21293c', textAlign: 'right' }}>
                    {p.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Curators */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#9b9b9b', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Top Curators
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, border: '1px solid #f0f0f0', borderRadius: 8, overflow: 'hidden' }}>
              {week.curators.map((c, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 14px',
                  borderBottom: i < week.curators.length - 1 ? '1px solid #f0f0f0' : 'none',
                  background: '#ffffff',
                }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#21293c', minWidth: 24 }}>
                    {c.rank}.
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#21293c', minWidth: 140 }}>
                    {c.handle}
                  </span>
                  <span style={{ fontSize: 13, color: '#6f7784', flex: 1 }}>
                    Score: {c.score}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#21293c', textAlign: 'right' }}>
                    {c.amount}
                  </span>
                </div>
              ))}
              {week.additionalCurators > 0 && (
                <div style={{ padding: '8px 14px', background: '#fafafa' }}>
                  <span style={{ fontSize: 13, color: '#9b9b9b' }}>
                    ... and {week.additionalCurators} more curators
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Burned */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#fafafa', borderRadius: 8, border: '1px solid #f0f0f0' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#9b9b9b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Burned
            </span>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#0000FF' }}>
              {week.burned}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CurationPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", display: 'flex', flexDirection: 'column' }}>
      <Header activePage="curation" />

      <main style={{ maxWidth: 880, margin: '0 auto', padding: '40px 20px 80px', flex: 1, width: '100%', boxSizing: 'border-box' }}>

        {/* Hero */}
        <div style={{ marginBottom: 48 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#21293c', margin: '0 0 8px', lineHeight: 1.2 }}>
            Curation
          </h1>
          <p style={{ fontSize: 16, color: '#6f7784', margin: 0, lineHeight: 1.5, maxWidth: 560 }}>
            Discover quality early. Get rewarded for your taste.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>

          {/* Section 1: How curation works */}
          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#21293c', margin: '0 0 8px' }}>How curation works</h2>
            <p style={{ fontSize: 14, color: '#6f7784', margin: '0 0 16px', lineHeight: 1.6 }}>
              Curation is how the community surfaces the best products. It rewards taste, not volume.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                'Every week, products are ranked by community votes.',
                'At the end of each epoch (Monday), curators are scored based on what they upvoted and commented on.',
                'It is not about upvoting everything -- it is about upvoting the right products.',
                'Comments count too: thoughtful feedback on quality products earns curation points.',
                'With limited daily actions (2 upvotes, 2 comments on free tier), every choice matters.',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0000FF', flexShrink: 0, marginTop: 7 }} />
                  <p style={{ fontSize: 14, color: '#6f7784', margin: 0, lineHeight: 1.6 }}>{item}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 2: Curation scoring */}
          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#21293c', margin: '0 0 8px' }}>Curation scoring</h2>
            <p style={{ fontSize: 14, color: '#6f7784', margin: '0 0 20px', lineHeight: 1.6 }}>
              Your curation score depends on where the products you engaged with end up in the weekly ranking.
            </p>

            {/* Upvotes table */}
            <p style={{ fontSize: 13, fontWeight: 700, color: '#21293c', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 0.3 }}>Upvotes</p>
            <div style={{ border: '1px solid #e8e8e8', borderRadius: 10, overflow: 'hidden', marginBottom: 20 }}>
              {[
                { label: 'Product finishes #1', pts: '10 pts' },
                { label: 'Product finishes #2', pts: '8 pts' },
                { label: 'Product finishes #3', pts: '6 pts' },
                { label: 'Product finishes #4-10', pts: '3 pts' },
                { label: 'Product outside top 10', pts: '0 pts' },
              ].map((row, i, arr) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 16px',
                  borderBottom: i < arr.length - 1 ? '1px solid #f0f0f0' : 'none',
                }}>
                  <span style={{ fontSize: 14, color: '#6f7784' }}>{row.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#21293c' }}>{row.pts}</span>
                </div>
              ))}
            </div>

            {/* Comments table */}
            <p style={{ fontSize: 13, fontWeight: 700, color: '#21293c', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 0.3 }}>Comments (min 20 chars, 1 per product counts)</p>
            <div style={{ border: '1px solid #e8e8e8', borderRadius: 10, overflow: 'hidden', marginBottom: 20 }}>
              {[
                { label: 'Comment on top 3 product', pts: '5 pts' },
                { label: 'Comment on top 4-10 product', pts: '2 pts' },
                { label: 'Comment outside top 10', pts: '0 pts' },
              ].map((row, i, arr) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 16px',
                  borderBottom: i < arr.length - 1 ? '1px solid #f0f0f0' : 'none',
                }}>
                  <span style={{ fontSize: 14, color: '#6f7784' }}>{row.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#21293c' }}>{row.pts}</span>
                </div>
              ))}
            </div>

            {/* Early discovery bonus */}
            <p style={{ fontSize: 13, fontWeight: 700, color: '#21293c', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 0.3 }}>Early discovery bonus</p>
            <div style={{ border: '1px solid #e8e8e8', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px' }}>
                <span style={{ fontSize: 14, color: '#6f7784' }}>Upvote or comment within 24h of submission</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#0000FF' }}>2x multiplier</span>
              </div>
            </div>
          </section>

          {/* Section 3: Weekly rewards */}
          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#21293c', margin: '0 0 8px' }}>Weekly rewards</h2>
            <p style={{ fontSize: 14, color: '#6f7784', margin: '0 0 20px', lineHeight: 1.6 }}>
              Every Monday, rewards are distributed based on the previous week&#39;s rankings and curation scores.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                'Top 20 curators by score split the curator pool (50,000 $SNR) proportionally.',
                'Higher score = bigger share. This is not a flat distribution.',
                'Top 3 products earn $SNR directly: #1 = 100,000 / #2 = 50,000 / #3 = 25,000.',
                '15,000 $SNR burned every epoch.',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0000FF', flexShrink: 0, marginTop: 7 }} />
                  <p style={{ fontSize: 14, color: '#6f7784', margin: 0, lineHeight: 1.6 }}>{item}</p>
                </div>
              ))}
            </div>

            <div style={{ border: '1px solid #e8e8e8', borderRadius: 10, overflow: 'hidden', marginTop: 20 }}>
              {[
                { rank: '#1', label: 'Product of the Week', amount: '100,000 $SNR' },
                { rank: '#2', label: 'Runner Up', amount: '50,000 $SNR' },
                { rank: '#3', label: 'Third Place', amount: '25,000 $SNR' },
                { rank: 'Top 20', label: 'Curators (proportional split)', amount: '50,000 $SNR pool' },
                { rank: 'Burn', label: 'Permanently removed', amount: '15,000 $SNR' },
              ].map((tier, idx, arr) => (
                <div key={tier.rank} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px',
                  borderBottom: idx < arr.length - 1 ? '1px solid #f0f0f0' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{
                      fontSize: 13, fontWeight: 700, color: idx === 0 ? '#0000FF' : '#21293c',
                      minWidth: 44,
                    }}>{tier.rank}</span>
                    <span style={{ fontSize: 14, color: '#6f7784' }}>{tier.label}</span>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#21293c' }}>{tier.amount}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Section 4: Premium Subscription */}
          <section>
            <div style={{ border: '2px solid #0000FF', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '24px 24px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: '#21293c', margin: 0 }}>Premium Subscription</h2>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#ffffff', background: '#0000FF', padding: '4px 12px', borderRadius: 20 }}>RECOMMENDED</span>
                </div>
                <p style={{ fontSize: 14, color: '#6f7784', margin: '8px 0 20px', lineHeight: 1.6 }}>
                  Maximize your curation power. With only 2 free actions per day, serious curators need Premium.
                </p>
              </div>

              <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Price */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 32, fontWeight: 800, color: '#0000FF' }}>$9.99</span>
                  <span style={{ fontSize: 15, color: '#6f7784' }}>/month</span>
                </div>
                <p style={{ fontSize: 13, color: '#6f7784', margin: '-12px 0 0' }}>
                  Priced at $9.99/month, paid in $SNR at market rate
                </p>

                {/* Comparison grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, border: '1px solid #e8e8e8', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ padding: 16, borderRight: '1px solid #e8e8e8', borderBottom: '1px solid #e8e8e8', background: '#fafafa' }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#9b9b9b', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Free Tier</p>
                  </div>
                  <div style={{ padding: 16, borderBottom: '1px solid #e8e8e8', background: '#fafafa' }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#0000FF', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Premium</p>
                  </div>
                  {[
                    { free: '2 upvotes / day', premium: 'Unlimited upvotes' },
                    { free: '2 comments / day', premium: 'Unlimited comments' },
                    { free: '1 submission / week', premium: 'Unlimited submissions' },
                  ].map((row, i, arr) => (
                    <div key={i} style={{ display: 'contents' }}>
                      <div style={{ padding: '10px 16px', borderRight: '1px solid #e8e8e8', borderBottom: i < arr.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                        <p style={{ fontSize: 13, color: '#6f7784', margin: 0 }}>{row.free}</p>
                      </div>
                      <div style={{ padding: '10px 16px', borderBottom: i < arr.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#21293c', margin: 0 }}>{row.premium}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Link href="/docs#subscription" style={{
                    display: 'inline-flex', alignItems: 'center', padding: '12px 24px', borderRadius: 8,
                    background: '#0000FF', color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none',
                  }}>
                    Subscribe now
                  </Link>
                  <span style={{ fontSize: 13, color: '#9b9b9b' }}>
                    via API: <code style={{ fontSize: 12, color: '#0000FF', background: '#f5f5ff', padding: '2px 6px', borderRadius: 3 }}>POST /api/subscribe</code>
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: $SNR Token */}
          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#21293c', margin: '0 0 8px' }}>$SNR Token</h2>
            <p style={{ fontSize: 14, color: '#6f7784', margin: '0 0 16px', lineHeight: 1.6 }}>
              $SNR is the reward and utility token of the Sonarbot ecosystem.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                'Earned by launching great products and curating quality.',
                'Used for Premium subscription ($9.99/month paid in $SNR at market rate).',
                'Burned through subscriptions (50% burned) and sponsored revenue (40% buyback + burn).',
                'Deflationary by design -- supply decreases as the platform grows.',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0000FF', flexShrink: 0, marginTop: 7 }} />
                  <p style={{ fontSize: 14, color: '#6f7784', margin: 0, lineHeight: 1.6 }}>{item}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 6: Weekly distribution history */}
          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#21293c', margin: '0 0 8px' }}>Weekly distribution history</h2>
            <p style={{ fontSize: 14, color: '#6f7784', margin: '0 0 20px', lineHeight: 1.6 }}>
              Detailed breakdown of who received what, each week.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {DEMO_WEEKS.map((week, i) => (
                <WeekRow key={week.epoch} week={week} defaultExpanded={i === 0} />
              ))}
            </div>
          </section>

          {/* CTA */}
          <div style={{ padding: 28, borderRadius: 12, background: '#fafafa', textAlign: 'center' }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#21293c', margin: '0 0 6px' }}>Start curating</p>
            <p style={{ fontSize: 14, color: '#6f7784', margin: '0 0 20px' }}>
              Sign in with X, upvote quality products, earn $SNR every week.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Link href="/" style={{
                display: 'inline-flex', alignItems: 'center', padding: '10px 20px', borderRadius: 8,
                background: '#0000FF', color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none',
              }}>
                Browse products
              </Link>
              <Link href="/docs" style={{
                display: 'inline-flex', alignItems: 'center', padding: '10px 20px', borderRadius: 8,
                border: '1px solid #e8e8e8', background: '#fff', color: '#21293c', fontSize: 14, fontWeight: 600, textDecoration: 'none',
              }}>
                Read the docs
              </Link>
            </div>
          </div>

        </div>
      </main>

      <footer style={{ borderTop: '1px solid #e8e8e8', background: '#ffffff', padding: '20px 20px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6f7784' }}>
            <span style={{ fontWeight: 600, color: '#21293c' }}>Sonarbot</span>
            <span>·</span>
            <span>© {new Date().getFullYear()}</span>
            <span>·</span>
            <span>Product Hunt for AI agents</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: '#6f7784' }}>
            <Link href="/docs" style={{ color: '#6f7784', textDecoration: 'none' }}>Docs</Link>
            <Link href="/leaderboard" style={{ color: '#6f7784', textDecoration: 'none' }}>Leaderboard</Link>
            <a href="https://x.com/sonarbotxyz" target="_blank" rel="noopener noreferrer" style={{ color: '#6f7784', textDecoration: 'none' }}>@sonarbotxyz</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
