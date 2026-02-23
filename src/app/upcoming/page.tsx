'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useTheme } from '@/components/ThemeProvider';

interface UpcomingProduct {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  daysUntil: number;
  maker?: string;
  launchTime?: string;
  logo_url?: string;
}

const UPCOMING_PRODUCTS: UpcomingProduct[] = [
  { id: 'baseagent-v2', name: 'BaseAgent v2', tagline: 'Next-gen autonomous AI agents for on-chain ops', description: 'Autonomous AI agents for on-chain operations with multi-step reasoning and wallet management. Supports batch transactions and MEV protection.', category: 'AI Agents', daysUntil: 0, maker: 'BaseAI Team', launchTime: '2:00 PM UTC' },
  { id: 'defi-scanner', name: 'DeFi Scanner', tagline: 'Real-time DeFi risk analysis', description: 'Monitors smart contract risks and rug-pull indicators across all Base protocols in real time.', category: 'Tools', daysUntil: 0, maker: 'Scanner Labs', launchTime: '5:00 PM UTC' },
  { id: 'yieldflow', name: 'YieldFlow', tagline: 'Automated yield optimization on Base', description: 'Automated yield optimization across Base DeFi protocols with risk-adjusted portfolio rebalancing. Set and forget strategies.', category: 'DeFi', daysUntil: 1, maker: 'YieldFlow Labs', launchTime: '10:00 AM UTC' },
  { id: 'nft-bridge', name: 'NFT Bridge', tagline: 'Cross-chain NFT transfers made simple', description: 'Bridge your NFTs between Ethereum L1 and Base with one click. Supports ERC-721 and ERC-1155.', category: 'Infrastructure', daysUntil: 1, maker: 'Bridge Protocol', launchTime: '3:00 PM UTC' },
  { id: 'sociallink', name: 'SocialLink', tagline: 'Decentralized social graph protocol', description: 'Decentralized social graph protocol connecting on-chain identity with reputation scoring. Integrates Farcaster and Lens.', category: 'Social', daysUntil: 3, maker: 'SocialLink DAO', launchTime: '12:00 PM UTC' },
  { id: 'chainoracle', name: 'ChainOracle', tagline: 'Sub-second oracle price feeds', description: 'High-frequency oracle network providing sub-second price feeds for Base smart contracts. 99.99% uptime SLA.', category: 'Infrastructure', daysUntil: 4, maker: 'Oracle Network Inc.', launchTime: '9:00 AM UTC' },
  { id: 'pixelvault', name: 'PixelVault', tagline: 'Fully on-chain gaming engine', description: 'Fully on-chain gaming engine with procedurally generated worlds and player-owned economies. Build games without servers.', category: 'Gaming', daysUntil: 6, maker: 'PixelVault Studios', launchTime: '1:00 PM UTC' },
  { id: 'agentswarm', name: 'AgentSwarm', tagline: 'Multi-agent swarm intelligence framework', description: 'Coordinated multi-agent framework enabling swarm intelligence for complex on-chain tasks. Agents collaborate autonomously.', category: 'AI Agents', daysUntil: 10, maker: 'Swarm Collective', launchTime: '11:00 AM UTC' },
];

function getLaunchDate(daysUntil: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysUntil);
  return d;
}

function formatDayHeader(daysUntil: number): string {
  if (daysUntil === 0) return 'Today';
  if (daysUntil === 1) return 'Tomorrow';
  const d = getLaunchDate(daysUntil);
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function groupByDay(products: UpcomingProduct[]): { label: string; section: string; date: string; products: UpcomingProduct[] }[] {
  const groups: Map<number, UpcomingProduct[]> = new Map();
  for (const p of products) {
    const existing = groups.get(p.daysUntil) || [];
    existing.push(p);
    groups.set(p.daysUntil, existing);
  }

  const sorted = Array.from(groups.entries()).sort((a, b) => a[0] - b[0]);

  return sorted.map(([days, prods]) => {
    const d = getLaunchDate(days);
    let section = 'Later';
    if (days === 0) section = 'Today';
    else if (days === 1) section = 'Tomorrow';
    else if (days <= 6) section = 'This Week';

    return {
      label: formatDayHeader(days),
      section,
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      products: prods,
    };
  });
}

function ProductCard({ product, index }: { product: UpcomingProduct; index: number }) {
  const { theme, colors } = useTheme();
  const [notified, setNotified] = useState(false);
  const hue = product.name.charCodeAt(0) * 7 % 360;
  const launchDate = getLaunchDate(product.daysUntil);

  return (
    <div
      className="upcoming-card"
      style={{
        background: colors.bgCard,
        border: `1px solid ${colors.border}`,
        borderRadius: 12,
        padding: 20,
        display: 'flex',
        gap: 16,
        transition: 'all 150ms ease-out',
        animation: `fadeInUp 300ms ease-out both`,
        animationDelay: `${index * 40}ms`,
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(0, 82, 255, 0.3)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = colors.border)}
    >
      {/* Logo */}
      <div className="upcoming-logo" style={{
        width: 64, height: 64, borderRadius: 14, flexShrink: 0,
        background: theme === 'dark'
          ? `linear-gradient(135deg, hsl(${hue}, 40%, 14%), hsl(${hue}, 30%, 18%))`
          : `linear-gradient(135deg, hsl(${hue}, 60%, 92%), hsl(${hue}, 50%, 88%))`,
        border: `1px solid ${colors.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{
          fontSize: 24, fontWeight: 700,
          color: theme === 'dark' ? `hsl(${hue}, 50%, 55%)` : `hsl(${hue}, 60%, 40%)`,
        }}>
          {product.name[0]}
        </span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: colors.text, margin: 0 }}>
            {product.name}
          </h3>
          <span style={{
            fontSize: 11, fontWeight: 500, color: colors.textDim,
            border: `1px solid ${colors.border}`, padding: '2px 10px', borderRadius: 12, flexShrink: 0,
          }}>
            {product.category}
          </span>
        </div>

        <p style={{ fontSize: 14, color: colors.textMuted, margin: '0 0 6px', lineHeight: 1.4 }}>
          {product.tagline}
        </p>

        <p style={{ fontSize: 13, color: colors.textDim, margin: '0 0 10px', lineHeight: 1.5 }}>
          {product.description.slice(0, 100)}{product.description.length > 100 ? '...' : ''}
        </p>

        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: product.daysUntil <= 1 ? '#0052FF' : colors.textDim, fontWeight: 600 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            {launchDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
          {product.launchTime && (
            <>
              <span style={{ fontSize: 12, color: colors.textDim }}>·</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: colors.textDim }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {product.launchTime}
              </span>
            </>
          )}
          {product.maker && (
            <>
              <span style={{ fontSize: 12, color: colors.textDim }}>·</span>
              <span style={{ fontSize: 12, color: colors.textDim }}>
                by {product.maker}
              </span>
            </>
          )}
        </div>

        {/* Notify button */}
        <button
          onClick={() => setNotified(!notified)}
          className="upcoming-notify"
          style={{
            fontSize: 13, fontWeight: 600,
            color: notified ? '#0052FF' : colors.textMuted,
            background: notified ? 'rgba(0, 82, 255, 0.08)' : 'transparent',
            border: `1px solid ${notified ? 'rgba(0, 82, 255, 0.3)' : colors.border}`,
            borderRadius: 8, padding: '8px 20px', cursor: 'pointer',
            transition: 'all 150ms ease-out',
            minHeight: 44,
          }}
        >
          {notified ? 'Notified \u2713' : 'Notify me'}
        </button>
      </div>
    </div>
  );
}

export default function UpcomingPage() {
  const { colors } = useTheme();
  const grouped = groupByDay(UPCOMING_PRODUCTS);

  // Group into sections: Today, Tomorrow, This Week, Later
  const sections: { title: string; days: typeof grouped }[] = [];
  const sectionOrder = ['Today', 'Tomorrow', 'This Week', 'Later'];

  for (const s of sectionOrder) {
    const days = grouped.filter(g => g.section === s);
    if (days.length > 0) {
      sections.push({ title: s, days });
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, color: colors.text, display: 'flex', flexDirection: 'column' }}>

      <Header />

      <main className="upcoming-main" style={{ flex: 1, maxWidth: 1080, margin: '0 auto', padding: '40px 20px 80px', width: '100%', boxSizing: 'border-box' }}>

        {/* Title */}
        <div style={{ marginBottom: 40, animation: 'fadeInUp 350ms ease-out both' }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: colors.text, margin: '0 0 6px' }}>
            Upcoming Launches
          </h1>
          <p style={{ fontSize: 15, color: colors.textMuted, margin: 0 }}>
            Products preparing to launch on Base. Get notified when they go live.
          </p>
        </div>

        {/* Calendar-style sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {sections.map((section) => (
            <div key={section.title}>
              {/* Section header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16,
                animation: 'fadeInUp 350ms ease-out both',
              }}>
                <h2 style={{
                  fontSize: 20, fontWeight: 700, color: colors.text, margin: 0,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  {section.title}
                  {section.title === 'Today' && (
                    <span style={{
                      fontSize: 11, fontWeight: 600, color: '#22c55e',
                      background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)',
                      padding: '2px 10px', borderRadius: 12,
                    }}>
                      Live
                    </span>
                  )}
                </h2>
              </div>

              {/* Day groups within section */}
              {section.days.map((day) => (
                <div key={day.label} style={{ marginBottom: 20 }}>
                  {/* Day header (skip for Today/Tomorrow since section header covers it) */}
                  {section.title !== 'Today' && section.title !== 'Tomorrow' && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, paddingLeft: 4,
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.textDim} strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      <span style={{ fontSize: 14, fontWeight: 600, color: colors.textDim }}>
                        {day.label} — {day.date}
                      </span>
                    </div>
                  )}

                  {/* Products for this day */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {day.products.map((product, i) => (
                      <ProductCard key={product.id} product={product} index={i} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </main>

      <Footer />

      <style>{`
        @media (max-width: 640px) {
          .upcoming-main {
            padding: 24px 16px 60px !important;
          }
          .upcoming-card {
            padding: 16px !important;
            gap: 12px !important;
          }
          .upcoming-logo {
            width: 48px !important;
            height: 48px !important;
            border-radius: 12px !important;
          }
          .upcoming-logo span {
            font-size: 20px !important;
          }
          .upcoming-notify {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
