'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useTheme } from '@/components/ThemeProvider';

interface UpcomingProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  daysUntil: number;
}

const UPCOMING_PRODUCTS: UpcomingProduct[] = [
  { id: 'baseagent-v2', name: 'BaseAgent v2', description: 'Next-gen autonomous AI agents for on-chain operations with multi-step reasoning and wallet management.', category: 'AI Agents', daysUntil: 2 },
  { id: 'yieldflow', name: 'YieldFlow', description: 'Automated yield optimization across Base DeFi protocols with risk-adjusted portfolio rebalancing.', category: 'DeFi', daysUntil: 5 },
  { id: 'sociallink', name: 'SocialLink', description: 'Decentralized social graph protocol connecting on-chain identity with reputation scoring.', category: 'Social', daysUntil: 8 },
  { id: 'chainoracle', name: 'ChainOracle', description: 'High-frequency oracle network providing sub-second price feeds for Base smart contracts.', category: 'Infrastructure', daysUntil: 12 },
  { id: 'pixelvault', name: 'PixelVault', description: 'Fully on-chain gaming engine with procedurally generated worlds and player-owned economies.', category: 'Gaming', daysUntil: 15 },
  { id: 'agentswarm', name: 'AgentSwarm', description: 'Coordinated multi-agent framework enabling swarm intelligence for complex on-chain tasks.', category: 'AI Agents', daysUntil: 20 },
];

function ProductCard({ product, index }: { product: UpcomingProduct; index: number }) {
  const { colors } = useTheme();
  const [notified, setNotified] = useState(false);

  return (
    <div
      style={{
        background: colors.bgCard,
        border: `1px solid ${colors.border}`,
        borderRadius: 12,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        transition: 'all 150ms ease-out',
        animation: `fadeInUp 300ms ease-out both`,
        animationDelay: `${index * 60}ms`,
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(0, 82, 255, 0.3)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = colors.border)}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'rgba(0, 82, 255, 0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 700, color: '#0052FF',
        }}>
          {product.name[0]}
        </div>
        <span style={{
          fontSize: 12, fontWeight: 500,
          color: colors.textDim,
          border: `1px solid ${colors.border}`,
          padding: '3px 10px',
          borderRadius: 12,
        }}>
          {product.category}
        </span>
      </div>

      {/* Name + desc */}
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: colors.text, margin: '0 0 4px' }}>
          {product.name}
        </h3>
        <p style={{ fontSize: 14, color: colors.textMuted, margin: 0, lineHeight: 1.5 }}>
          {product.description}
        </p>
      </div>

      {/* Countdown */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 13, fontWeight: 600,
        color: product.daysUntil <= 3 ? '#0052FF' : colors.textDim,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        Launching in {product.daysUntil} days
      </div>

      {/* Notify button */}
      <button
        onClick={() => setNotified(!notified)}
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: notified ? '#0052FF' : colors.textMuted,
          background: notified ? 'rgba(0, 82, 255, 0.08)' : 'transparent',
          border: `1px solid ${notified ? 'rgba(0, 82, 255, 0.3)' : colors.border}`,
          borderRadius: 8,
          padding: '10px 0',
          cursor: 'pointer',
          transition: 'all 150ms ease-out',
          width: '100%',
        }}
      >
        {notified ? 'Notified \u2713' : 'Notify me'}
      </button>
    </div>
  );
}

export default function UpcomingPage() {
  const { colors } = useTheme();

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, color: colors.text, display: 'flex', flexDirection: 'column' }}>

      <Header />

      <main style={{ flex: 1, maxWidth: 1080, margin: '0 auto', padding: '40px 20px 80px', width: '100%' }}>

        {/* Title */}
        <div style={{ marginBottom: 40, animation: 'fadeInUp 350ms ease-out both' }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: colors.text, margin: '0 0 6px' }}>
            Upcoming Launches
          </h1>
          <p style={{ fontSize: 15, color: colors.textMuted, margin: 0 }}>
            Products preparing to launch on Base. Get notified when they go live.
          </p>
        </div>

        {/* Grid */}
        <div className="upcoming-grid" style={{ display: 'grid', gap: 16 }}>
          {UPCOMING_PRODUCTS.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </main>

      <Footer />

      <style>{`
        .upcoming-grid {
          grid-template-columns: 1fr;
        }
        @media (min-width: 640px) {
          .upcoming-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 960px) {
          .upcoming-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
