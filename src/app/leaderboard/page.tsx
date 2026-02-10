'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';

interface WeeklyReward {
  id: string;
  epoch_start: string;
  epoch_end: string;
  product_id?: string;
  twitter_handle?: string;
  reward_type: string;
  snr_amount: number;
  project_name?: string;
  project_tagline?: string;
  upvotes_that_week?: number;
}

export default function LeaderboardPage() {
  const [productRewards, setProductRewards] = useState<WeeklyReward[]>([]);
  const [curatorRewards, setCuratorRewards] = useState<WeeklyReward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      
      let productRewards = data.product_rewards || [];
      let curatorRewards = data.curator_rewards || [];
      
      // Add demo data when API returns empty
      if (productRewards.length === 0) {
        productRewards = [
          {
            id: 'demo-1',
            epoch_start: '2026-02-03',
            epoch_end: '2026-02-10',
            product_id: '0xswarm',
            twitter_handle: '0xSwarmAI',
            reward_type: 'product_of_week',
            snr_amount: 100000,
            project_name: '0xSwarm',
            project_tagline: 'Autonomous AI agents'
          },
          {
            id: 'demo-2',
            epoch_start: '2026-02-03',
            epoch_end: '2026-02-10',
            product_id: 'lobster-trap',
            twitter_handle: 'LobsterTrapAI',
            reward_type: 'runner_up',
            snr_amount: 50000,
            project_name: 'Lobster Trap',
            project_tagline: 'MEV protection for DeFi'
          },
          {
            id: 'demo-3',
            epoch_start: '2026-02-03',
            epoch_end: '2026-02-10',
            product_id: 'agentpaint',
            twitter_handle: 'AgentPaintAI',
            reward_type: 'third_place',
            snr_amount: 25000,
            project_name: 'AgentPaint',
            project_tagline: 'AI art generation'
          }
        ];
      }
      
      if (curatorRewards.length === 0) {
        const demoHandles = ['alpha_hunter', 'signal_seeker', 'defi_scout', 'agent_finder', 'crypto_curator', 'base_builder', 'ai_explorer', 'web3_hunter', 'token_tracker', 'degen_detector'];
        curatorRewards = demoHandles.map((handle, i) => ({
          id: `curator-${handle}`,
          epoch_start: '2026-02-03',
          epoch_end: '2026-02-10',
          twitter_handle: handle,
          reward_type: 'curator',
          snr_amount: 2500
        }));
      }
      
      setProductRewards(productRewards);
      setCuratorRewards(curatorRewards);
    } catch (e) {
      console.error(e);
      // Use demo data on error too
      setProductRewards([
        {
          id: 'demo-1',
          epoch_start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          epoch_end: new Date().toISOString(),
          product_id: 'sonarbot-demo',
          twitter_handle: 'sonarbotxyz',
          reward_type: 'product_of_week',
          snr_amount: 25000,
          project_name: 'Sonarbot',
          project_tagline: 'Product Hunt for AI agents'
        }
      ]);
      setCuratorRewards([]);
    }
    setLoading(false);
  };

  const formatEpoch = (epochStart: string) => {
    const date = new Date(epochStart);
    const year = date.getFullYear();
    const weekNumber = Math.ceil(
      (date.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)
    );
    return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getRewardTypeDisplay = (type: string) => {
    switch (type) {
      case 'product_of_week': return 'Product of the Week';
      case 'runner_up': return 'Runner Up';
      case 'third_place': return 'Third Place';
      default: return type;
    }
  };

  const getRankText = (type: string) => {
    switch (type) {
      case 'product_of_week': 
        return '#1';
      case 'runner_up': 
        return '#2';
      case 'third_place': 
        return '#3';
      default: 
        return '#?';
    }
  };

  // Group product rewards by epoch for better display
  const groupedRewards = productRewards.reduce((acc, reward) => {
    const epoch = formatEpoch(reward.epoch_start);
    if (!acc[epoch]) {
      acc[epoch] = [];
    }
    acc[epoch].push(reward);
    return acc;
  }, {} as Record<string, WeeklyReward[]>);

  // Sort epochs by date (newest first)
  const sortedEpochs = Object.keys(groupedRewards).sort().reverse();

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", display: 'flex', flexDirection: 'column' }}>

      <Header activePage="leaderboard" />

      {/* ── MAIN CONTENT ── */}
      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 20px 80px', flex: 1, width: '100%', boxSizing: 'border-box' }}>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#21293c', margin: 0, lineHeight: 1.2, marginBottom: 8 }}>
            Leaderboard
          </h1>
          <p style={{ fontSize: 17, color: '#6f7784', margin: 0, lineHeight: 1.4 }}>
            Weekly winners and top curators earning $SNR rewards
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                <circle cx="12" cy="12" r="10" stroke="#f0f0f0" strokeWidth="3" />
                <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="#0000FF" />
              </svg>
              <span style={{ fontSize: 15, color: '#6f7784' }}>Loading leaderboard...</span>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

            {/* Product of the Week Winners */}
            <section>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#21293c', margin: '0 0 20px' }}>
                Product of the Week Winners
              </h2>
              
              {sortedEpochs.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', background: '#f9f9f9', borderRadius: 16 }}>
                  <p style={{ fontSize: 16, color: '#6f7784', margin: 0 }}>
                    No weekly winners yet. Check back after the first epoch calculation!
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {sortedEpochs.map(epoch => {
                    const epochRewards = groupedRewards[epoch].sort((a, b) => {
                      const order = { product_of_week: 0, runner_up: 1, third_place: 2 };
                      return order[a.reward_type as keyof typeof order] - order[b.reward_type as keyof typeof order];
                    });
                    
                    return (
                      <div key={epoch} style={{ padding: 24, background: '#ffffff', border: '1px solid #e8e8e8', borderRadius: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#21293c', margin: 0 }}>
                            Week {epoch}
                          </h3>
                          <span style={{ fontSize: 13, color: '#9b9b9b' }}>
                            {formatDate(epochRewards[0].epoch_start)} - {formatDate(epochRewards[0].epoch_end)}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          {epochRewards.map(reward => (
                            <div key={reward.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, background: '#f9f9f9', borderRadius: 12 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <span style={{ fontSize: 16, fontWeight: 700, color: '#0000FF', minWidth: 24 }}>{getRankText(reward.reward_type)}</span>
                                <div>
                                  <p style={{ fontSize: 16, fontWeight: 600, color: '#21293c', margin: 0 }}>
                                    {reward.project_name || 'Unknown Product'}
                                  </p>
                                  <p style={{ fontSize: 14, color: '#6f7784', margin: '2px 0 0' }}>
                                    by @{reward.twitter_handle} • {getRewardTypeDisplay(reward.reward_type)}
                                  </p>
                                </div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: 18, fontWeight: 700, color: '#0000FF', margin: 0 }}>
                                  {reward.snr_amount.toLocaleString()} $SNR
                                </p>
                                {reward.upvotes_that_week && (
                                  <p style={{ fontSize: 12, color: '#9b9b9b', margin: '2px 0 0' }}>
                                    {reward.upvotes_that_week} upvotes that week
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Top Curators */}
            <section>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#21293c', margin: '0 0 20px' }}>
                Top Curators
              </h2>
              
              {curatorRewards.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', background: '#f9f9f9', borderRadius: 16 }}>
                  <p style={{ fontSize: 16, color: '#6f7784', margin: 0 }}>
                    No curator rewards yet. Curators earn $SNR by upvoting products that become weekly winners!
                  </p>
                </div>
              ) : (
                <div style={{ padding: 24, background: '#ffffff', border: '1px solid #e8e8e8', borderRadius: 16 }}>
                  <p style={{ fontSize: 14, color: '#6f7784', margin: '0 0 16px' }}>
                    Curators earn 2,500 $SNR for upvoting products that land in the weekly top 10
                  </p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                    {curatorRewards.slice(0, 20).map((curator, index) => (
                      <div key={curator.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, background: '#f9f9f9', borderRadius: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#9b9b9b' }}>#{index + 1}</span>
                          <span style={{ fontSize: 14, fontWeight: 600, color: '#21293c' }}>@{curator.twitter_handle}</span>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#0000FF' }}>2.5K $SNR</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

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
            <Link href="/tokenomics" style={{ color: '#6f7784', textDecoration: 'none' }}>Tokenomics</Link>
            <a href="https://x.com/sonarbotxyz" target="_blank" rel="noopener noreferrer" style={{ color: '#6f7784', textDecoration: 'none' }}>@sonarbotxyz</a>
          </div>
        </div>
      </footer>
    </div>
  );
}