'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePrivy, useLoginWithOAuth } from '@privy-io/react-auth';

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

interface UserInfo {
  twitter_handle: string;
  name: string;
  avatar: string | null;
}

export default function TokenomicsPage() {
  const [data, setData] = useState<TokenomicsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { ready, authenticated, logout, getAccessToken } = usePrivy();
  const { initOAuth } = useLoginWithOAuth();

  useEffect(() => {
    fetchTokenomicsData();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (ready && authenticated) {
      fetchUserInfo();
    }
  }, [ready, authenticated]);

  const fetchUserInfo = async () => {
    if (!authenticated) return;
    try {
      const token = await getAccessToken();
      if (!token) return;
      const res = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setUserInfo(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchTokenomicsData = async () => {
    try {
      const res = await fetch('/api/tokenomics');
      const fetchedData = await res.json();
      setData(fetchedData);
    } catch (e) {
      console.error(e);
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

      {/* ── HEADER ── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: '#ffffff', borderBottom: '1px solid #e8e8e8' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', height: 56, gap: 10 }}>
          <Link href="/" style={{ flexShrink: 0, textDecoration: 'none' }}>
            <span style={{ fontWeight: 800, fontSize: 18, color: "#0000FF", lineHeight: 1, whiteSpace: "nowrap" }}>sonarbot :</span>
          </Link>
          <div style={{ flex: 1 }} />
          <Link href="/leaderboard"
            style={{ display: 'flex', alignItems: 'center', height: 34, padding: '0 14px', borderRadius: 20, border: '1px solid #e8e8e8', background: '#fff', fontSize: 13, fontWeight: 600, color: '#21293c', textDecoration: 'none', whiteSpace: 'nowrap' }}>
            🏆 Leaderboard
          </Link>
          <Link href="/docs"
            style={{ display: 'flex', alignItems: 'center', height: 34, padding: '0 14px', borderRadius: 20, border: '1px solid #e8e8e8', background: '#fff', fontSize: 13, fontWeight: 600, color: '#21293c', textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Docs
          </Link>

          {ready && (
            authenticated && userInfo ? (
              <div ref={menuRef} style={{ position: 'relative' }}>
                <button onClick={() => setMenuOpen(!menuOpen)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, height: 34, padding: '0 10px', borderRadius: 20, border: '1px solid #e8e8e8', background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#21293c' }}>
                  {userInfo.avatar ? (
                    <img src={userInfo.avatar} alt="" style={{ width: 22, height: 22, borderRadius: '50%' }} />
                  ) : (
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#6f7784' }}>
                      {userInfo.twitter_handle[0]?.toUpperCase()}
                    </div>
                  )}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#6f7784" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </button>
                {menuOpen && (
                  <div style={{ position: 'absolute', right: 0, top: 40, background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12, padding: 4, minWidth: 160, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', zIndex: 100 }}>
                    <div style={{ padding: '8px 12px', fontSize: 13, fontWeight: 600, color: '#21293c', borderBottom: '1px solid #f0f0f0' }}>@{userInfo.twitter_handle}</div>
                    <button onClick={() => { logout(); setMenuOpen(false); }}
                      style={{ width: '100%', padding: '8px 12px', fontSize: 13, fontWeight: 500, color: '#e53e3e', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', borderRadius: 8 }}>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => initOAuth({ provider: 'twitter' })}
                style={{ display: 'flex', alignItems: 'center', gap: 6, height: 34, padding: '0 14px', borderRadius: 20, background: '#0000FF', border: 'none', fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                Sign in
              </button>
            )
          )}
        </div>
      </header>

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
                    <span style={{ fontSize: 20 }}>🔥</span>
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
                    <span style={{ fontSize: 20 }}>💎</span>
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
                    <span style={{ fontSize: 20 }}>💰</span>
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
                    <span style={{ fontSize: 20 }}>📈</span>
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
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#21293c', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>⚡</span>
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
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#21293c', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>🏆</span>
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
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#21293c', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>🔥</span>
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
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#21293c', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>💼</span>
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
                  🚀 Browse Products
                </Link>
                <Link href="/leaderboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 24, border: '1px solid #0000FF', background: '#fff', color: '#0000FF', fontSize: 16, fontWeight: 600, textDecoration: 'none' }}>
                  🏆 View Leaderboard
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