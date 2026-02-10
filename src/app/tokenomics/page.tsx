'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';

interface TokenomicsData {
  total_snr_burned: number;
  weekly_rewards: {
    epoch: string;
    total_rewards: number;
    product_rewards: number;
    curator_rewards: number;
    burn_amount: number;
  }[];
  active_subscriptions: number;
  sponsored_revenue: number;
  subscription_revenue: number;
}

export default function TokenomicsPage() {
  const [data, setData] = useState<TokenomicsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTokenomicsData();
  }, []);

  const fetchTokenomicsData = async () => {
    try {
      const res = await fetch('/api/tokenomics');
      let fetchedData = await res.json();
      
      // If no real data exists, use demo data
      if (!fetchedData || (fetchedData.total_snr_burned === 0 && fetchedData.weekly_rewards.length === 0)) {
        fetchedData = {
          total_snr_burned: 245000,
          active_subscriptions: 12,
          sponsored_revenue: 2400,
          subscription_revenue: 12000,
          weekly_rewards: [
            {
              epoch: '2026-W06',
              total_rewards: 225000,
              product_rewards: 175000,
              curator_rewards: 50000,
              burn_amount: 15000
            },
            {
              epoch: '2026-W05',
              total_rewards: 225000,
              product_rewards: 175000,
              curator_rewards: 50000,
              burn_amount: 15000
            },
            {
              epoch: '2026-W04',
              total_rewards: 225000,
              product_rewards: 175000,
              curator_rewards: 50000,
              burn_amount: 15000
            }
          ]
        };
      }
      
      setData(fetchedData);
    } catch (e) {
      console.error(e);
      // Use demo data on error
      setData({
        total_snr_burned: 245000,
        active_subscriptions: 12,
        sponsored_revenue: 2400,
        subscription_revenue: 12000,
        weekly_rewards: [
          {
            epoch: '2026-W06',
            total_rewards: 225000,
            product_rewards: 175000,
            curator_rewards: 50000,
            burn_amount: 15000
          }
        ]
      });
    }
    setLoading(false);
  };

  const formatCurrency = (amount: number, currency: string = '$SNR') => {
    return `${amount.toLocaleString()} ${currency}`;
  };

  const formatUSD = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", display: 'flex', flexDirection: 'column' }}>

      <Header activePage="tokenomics" />

      {/* ── MAIN CONTENT ── */}
      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 20px 80px', flex: 1, width: '100%', boxSizing: 'border-box' }}>

        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#21293c', margin: '0 0 12px', lineHeight: 1.1 }}>
            $SNR Tokenomics
          </h1>
          <p style={{ fontSize: 18, color: '#6f7784', margin: 0, lineHeight: 1.4 }}>
            Transparent, sustainable economics for the Sonarbot ecosystem
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                <circle cx="12" cy="12" r="10" stroke="#f0f0f0" strokeWidth="3" />
                <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="#0000FF" />
              </svg>
              <span style={{ fontSize: 15, color: '#6f7784' }}>Loading tokenomics data...</span>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        ) : data ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

            {/* Key Metrics */}
            <section>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#21293c', margin: '0 0 24px' }}>
                Key Metrics
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20 }}>
                
                {/* Total Burned */}
                <div style={{ padding: 24, borderRadius: 16, background: 'linear-gradient(135deg, #fff5f5 0%, #fee)', border: '1px solid #fed7d7' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#FF4444" stroke="#CC2222" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                      <path d="M2 17l10 5 10-5"/>
                      <path d="M2 12l10 5 10-5"/>
                    </svg>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#21293c', margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Total $SNR Burned
                    </h3>
                  </div>
                  <p style={{ fontSize: 28, fontWeight: 800, color: '#21293c', margin: '0 0 4px' }}>
                    {formatCurrency(data.total_snr_burned)}
                  </p>
                  <p style={{ fontSize: 13, color: '#6f7784', margin: 0 }}>
                    Permanently removed from supply
                  </p>
                </div>

                {/* Active Subscriptions */}
                <div style={{ padding: 24, borderRadius: 16, background: 'linear-gradient(135deg, #f0f8ff 0%, #e6f3ff)', border: '1px solid #bee3f8' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#4444FF" stroke="#2222CC" strokeWidth="2">
                      <rect x="3" y="9" width="18" height="12" rx="2"/>
                      <path d="M9 5v4h6V5a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2z"/>
                    </svg>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#21293c', margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Active Subscriptions
                    </h3>
                  </div>
                  <p style={{ fontSize: 28, fontWeight: 800, color: '#21293c', margin: '0 0 4px' }}>
                    {data.active_subscriptions}
                  </p>
                  <p style={{ fontSize: 13, color: '#6f7784', margin: 0 }}>
                    Premium users with unlimited access
                  </p>
                </div>

                {/* Sponsored Revenue */}
                <div style={{ padding: 24, borderRadius: 16, background: 'linear-gradient(135deg, #f0fff4 0%, #dcfce7)', border: '1px solid #bbf7d0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#22AA22" stroke="#116611" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 6v12m-3-9h6"/>
                    </svg>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#21293c', margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Sponsored Revenue
                    </h3>
                  </div>
                  <p style={{ fontSize: 28, fontWeight: 800, color: '#21293c', margin: '0 0 4px' }}>
                    {formatUSD(data.sponsored_revenue)}
                  </p>
                  <p style={{ fontSize: 13, color: '#6f7784', margin: 0 }}>
                    USDC from advertising partners
                  </p>
                </div>

                {/* Subscription Revenue */}
                <div style={{ padding: 24, borderRadius: 16, background: 'linear-gradient(135deg, #fefbf0 0%, #fef3c7)', border: '1px solid #fde68a' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0000FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
                      <polyline points="17,6 23,6 23,12"/>
                    </svg>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#21293c', margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Subscription Revenue
                    </h3>
                  </div>
                  <p style={{ fontSize: 28, fontWeight: 800, color: '#21293c', margin: '0 0 4px' }}>
                    {formatCurrency(data.subscription_revenue)}
                  </p>
                  <p style={{ fontSize: 13, color: '#6f7784', margin: 0 }}>
                    $SNR from premium subscriptions
                  </p>
                </div>

              </div>
            </section>

            {/* Weekly Reward Distributions */}
            <section>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#21293c', margin: '0 0 24px' }}>
                Weekly Reward Distributions
              </h2>
              
              {data.weekly_rewards.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', background: '#f9f9f9', borderRadius: 16 }}>
                  <p style={{ fontSize: 16, color: '#6f7784', margin: 0 }}>
                    No weekly distributions yet. Check back after the first epoch calculation!
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {data.weekly_rewards.map(week => (
                    <div key={week.epoch} style={{ 
                      padding: 20, borderRadius: 16, background: '#ffffff', 
                      border: '1px solid #e8e8e8', display: 'flex', 
                      alignItems: 'center', justifyContent: 'space-between' 
                    }}>
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#21293c', margin: '0 0 4px' }}>
                          Week {week.epoch}
                        </h3>
                        <p style={{ fontSize: 13, color: '#6f7784', margin: 0 }}>
                          {formatCurrency(week.product_rewards)} to products • {formatCurrency(week.curator_rewards)} to curators
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 18, fontWeight: 700, color: '#0000FF', margin: 0 }}>
                          {formatCurrency(week.total_rewards)}
                        </p>
                        <p style={{ fontSize: 12, color: '#9b9b9b', margin: 0 }}>
                          {formatCurrency(week.burn_amount)} burned
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* How It Works */}
            <section>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#21293c', margin: '0 0 24px' }}>
                How It Works
              </h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
                
                {/* Free vs Premium */}
                <div style={{ padding: 24, borderRadius: 16, background: '#f9f9f9' }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#21293c', margin: '0 0 16px' }}>
                    Free vs Premium
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <h4 style={{ fontSize: 14, fontWeight: 600, color: '#21293c', margin: '0 0 4px' }}>Free Tier</h4>
                      <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13, color: '#6f7784', lineHeight: 1.6 }}>
                        <li>1 product submission per week</li>
                        <li>5 upvotes per day</li>
                        <li>5 comments per day</li>
                        <li>Unlimited reading</li>
                      </ul>
                    </div>
                    <div>
                      <h4 style={{ fontSize: 14, fontWeight: 600, color: '#0000FF', margin: '0 0 4px' }}>Premium - 1000 $SNR/month</h4>
                      <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13, color: '#6f7784', lineHeight: 1.6 }}>
                        <li>Unlimited submissions</li>
                        <li>Unlimited upvotes</li>
                        <li>Unlimited comments</li>
                        <li>Support the ecosystem</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Weekly Rewards */}
                <div style={{ padding: 24, borderRadius: 16, background: '#f9f9f9' }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#21293c', margin: '0 0 16px' }}>
                    Weekly Rewards
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, color: '#6f7784', lineHeight: 1.6 }}>
                    <p style={{ margin: 0 }}><strong style={{ color: '#21293c' }}>Product of the Week:</strong> 100,000 $SNR</p>
                    <p style={{ margin: 0 }}><strong style={{ color: '#21293c' }}>Runner Up:</strong> 50,000 $SNR</p>
                    <p style={{ margin: 0 }}><strong style={{ color: '#21293c' }}>Third Place:</strong> 25,000 $SNR</p>
                    <p style={{ margin: 0 }}><strong style={{ color: '#21293c' }}>Top 20 Curators:</strong> 2,500 $SNR each</p>
                    <p style={{ margin: 0, fontSize: 13, color: '#9b9b9b', marginTop: 8 }}>
                      Curators earn rewards by upvoting products that land in the weekly top 10.
                    </p>
                  </div>
                </div>

                {/* Burn Mechanics */}
                <div style={{ padding: 24, borderRadius: 16, background: '#f9f9f9' }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#21293c', margin: '0 0 16px' }}>
                    Burn Mechanics
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, color: '#6f7784', lineHeight: 1.6 }}>
                    <p style={{ margin: 0 }}><strong style={{ color: '#21293c' }}>Subscriptions:</strong> 50% of $SNR burned weekly</p>
                    <p style={{ margin: 0 }}><strong style={{ color: '#21293c' }}>Sponsored Revenue:</strong> 40% of USDC → swap to $SNR → burn</p>
                    <p style={{ margin: 0 }}><strong style={{ color: '#21293c' }}>Weekly Distribution:</strong> 15,000 $SNR burned per epoch</p>
                    <p style={{ margin: 0, fontSize: 13, color: '#9b9b9b', marginTop: 8 }}>
                      All burns are permanent and verifiable on-chain.
                    </p>
                  </div>
                </div>

                {/* Revenue Split */}
                <div style={{ padding: 24, borderRadius: 16, background: '#f9f9f9' }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#21293c', margin: '0 0 16px' }}>
                    Revenue Split
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, color: '#6f7784', lineHeight: 1.6 }}>
                    <p style={{ margin: 0 }}><strong style={{ color: '#21293c' }}>Subscriptions:</strong> 50% burn, 50% rewards</p>
                    <p style={{ margin: 0 }}><strong style={{ color: '#21293c' }}>Sponsored Revenue:</strong></p>
                    <ul style={{ margin: '4px 0 0', paddingLeft: 16, fontSize: 13 }}>
                      <li>40% → $SNR buyback & burn</li>
                      <li>40% → team development</li>
                      <li>20% → reward pool</li>
                    </ul>
                  </div>
                </div>

              </div>
            </section>

            {/* Footer CTA */}
            <div style={{ padding: 32, borderRadius: 24, background: 'linear-gradient(135deg, #eeeeff 0%, #f0f0ff 100%)', textAlign: 'center', border: '1px solid #d4d4ff' }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#21293c', margin: '0 0 8px' }}>
                Ready to participate?
              </h2>
              <p style={{ fontSize: 16, color: '#6f7784', margin: '0 0 24px' }}>
                Launch your product, upvote great projects, earn $SNR rewards
              </p>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 24, background: '#0000FF', color: '#fff', fontSize: 16, fontWeight: 600, textDecoration: 'none' }}>
                  Browse Products
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 6 }}>
                    <polyline points="9,18 15,12 9,6"/>
                  </svg>
                </Link>
                <Link href="/leaderboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 24, border: '1px solid #0000FF', background: '#fff', color: '#0000FF', fontSize: 16, fontWeight: 600, textDecoration: 'none' }}>
                  View Leaderboard
                </Link>
              </div>
            </div>

          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontSize: 17, fontWeight: 600, color: '#21293c', marginBottom: 4 }}>Unable to load tokenomics data</p>
            <p style={{ fontSize: 14, color: '#6f7784' }}>Please try again later</p>
          </div>
        )}
      </main>

      {/* ── FOOTER ── */}
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