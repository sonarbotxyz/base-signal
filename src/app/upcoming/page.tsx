'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { useTheme } from '@/components/ThemeProvider';

const MONO = "var(--font-jetbrains, 'JetBrains Mono', monospace)";

interface UpcomingProduct {
  id: string;
  number: string;
  name: string;
  description: string;
  category: string;
  daysUntil: number;
}

const UPCOMING_PRODUCTS: UpcomingProduct[] = [
  {
    id: 'baseagent-v2',
    number: '01',
    name: 'BaseAgent v2',
    description: 'Next-gen autonomous AI agents for on-chain operations with multi-step reasoning and wallet management.',
    category: 'AI Agents',
    daysUntil: 2,
  },
  {
    id: 'yieldflow',
    number: '02',
    name: 'YieldFlow',
    description: 'Automated yield optimization across Base DeFi protocols with risk-adjusted portfolio rebalancing.',
    category: 'DeFi',
    daysUntil: 5,
  },
  {
    id: 'sociallink',
    number: '03',
    name: 'SocialLink',
    description: 'Decentralized social graph protocol connecting on-chain identity with reputation scoring.',
    category: 'Social',
    daysUntil: 8,
  },
  {
    id: 'chainoracle',
    number: '04',
    name: 'ChainOracle',
    description: 'High-frequency oracle network providing sub-second price feeds for Base smart contracts.',
    category: 'Infrastructure',
    daysUntil: 12,
  },
  {
    id: 'pixelvault',
    number: '05',
    name: 'PixelVault',
    description: 'Fully on-chain gaming engine with procedurally generated worlds and player-owned economies.',
    category: 'Gaming',
    daysUntil: 15,
  },
  {
    id: 'agentswarm',
    number: '06',
    name: 'AgentSwarm',
    description: 'Coordinated multi-agent framework enabling swarm intelligence for complex on-chain tasks.',
    category: 'AI Agents',
    daysUntil: 20,
  },
];

function useCountdown(daysUntil: number) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (now === null) {
    const h = '00';
    const m = '00';
    const s = '00';
    return `T-${daysUntil}d ${h}:${m}:${s}`;
  }

  const target = now + daysUntil * 86400000;
  const diff = Math.max(0, target - now);
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const h = String(hours).padStart(2, '0');
  const m = String(minutes).padStart(2, '0');
  const s = String(seconds).padStart(2, '0');

  return `T-${days}d ${h}:${m}:${s}`;
}

function AsciiRadar() {
  const { colors } = useTheme();
  const [frame, setFrame] = useState(0);
  const maxFrames = 8;

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame(f => (f + 1) % maxFrames);
    }, 300);
    return () => clearInterval(interval);
  }, []);

  // Radar sweep positions (8 frames rotating clockwise)
  const sweepFrames = [
    // Frame 0: North
    [
      '         .         ',
      '     .   |   .     ',
      '   .     |     .   ',
      '  .      |      .  ',
      ' ........+.........',
      '  .             .  ',
      '   .           .   ',
      '     .       .     ',
      '         .         ',
    ],
    // Frame 1: NE
    [
      '         .         ',
      '     .       .     ',
      '   .        /  .   ',
      '  .       /     .  ',
      ' ........+.........',
      '  .             .  ',
      '   .           .   ',
      '     .       .     ',
      '         .         ',
    ],
    // Frame 2: East
    [
      '         .         ',
      '     .       .     ',
      '   .           .   ',
      '  .             .  ',
      ' ........+--------.',
      '  .             .  ',
      '   .           .   ',
      '     .       .     ',
      '         .         ',
    ],
    // Frame 3: SE
    [
      '         .         ',
      '     .       .     ',
      '   .           .   ',
      '  .             .  ',
      ' ........+.........',
      '  .       \\     .  ',
      '   .        \\  .   ',
      '     .       .     ',
      '         .         ',
    ],
    // Frame 4: South
    [
      '         .         ',
      '     .       .     ',
      '   .           .   ',
      '  .             .  ',
      ' ........+.........',
      '  .      |      .  ',
      '   .     |     .   ',
      '     .   |   .     ',
      '         .         ',
    ],
    // Frame 5: SW
    [
      '         .         ',
      '     .       .     ',
      '   .           .   ',
      '  .             .  ',
      ' ........+.........',
      '  .     /       .  ',
      '   .  /        .   ',
      '     .       .     ',
      '         .         ',
    ],
    // Frame 6: West
    [
      '         .         ',
      '     .       .     ',
      '   .           .   ',
      '  .             .  ',
      ' .--------+........',
      '  .             .  ',
      '   .           .   ',
      '     .       .     ',
      '         .         ',
    ],
    // Frame 7: NW
    [
      '         .         ',
      '     .       .     ',
      '   .  \\        .   ',
      '  .     \\       .  ',
      ' ........+.........',
      '  .             .  ',
      '   .           .   ',
      '     .       .     ',
      '         .         ',
    ],
  ];

  const currentFrame = sweepFrames[frame];

  return (
    <div style={{
      fontFamily: MONO,
      fontSize: 11,
      lineHeight: 1.5,
      textAlign: 'center',
      userSelect: 'none',
      marginBottom: 8,
    }}>
      <div style={{ color: colors.border }}>{'  ┌─────────────────────┐'}</div>
      {currentFrame.map((line, i) => (
        <div key={i}>
          <span style={{ color: colors.border }}>{'  │'}</span>
          <span style={{
            color: i === 4
              ? '#0052FF'
              : line.includes('|') || line.includes('/') || line.includes('\\') || line.includes('-')
                ? '#0052FF'
                : colors.textDim,
            textShadow: (line.includes('|') || line.includes('/') || line.includes('\\') || line.includes('-') || line.includes('+'))
              ? '0 0 8px rgba(0, 82, 255, 0.5)'
              : 'none',
          }}>{line}</span>
          <span style={{ color: colors.border }}>{'│'}</span>
        </div>
      ))}
      <div style={{ color: colors.border }}>{'  └─────────────────────┘'}</div>
      <div style={{
        marginTop: 6,
        fontSize: 10,
        color: colors.textDim,
        letterSpacing: '0.15em',
      }}>
        <span style={{ color: '#0052FF', textShadow: '0 0 6px rgba(0, 82, 255, 0.4)' }}>SCANNING</span>
        <span style={{ color: colors.border }}>{' :: '}</span>
        <span>{UPCOMING_PRODUCTS.length} TARGETS DETECTED</span>
      </div>
    </div>
  );
}

function ProductCard({ product, index }: { product: UpcomingProduct; index: number }) {
  const { colors } = useTheme();
  const [hovered, setHovered] = useState(false);
  const [notified, setNotified] = useState(false);
  const countdown = useCountdown(product.daysUntil);

  const categoryColor = (() => {
    switch (product.category) {
      case 'AI Agents': return '#8b5cf6';
      case 'DeFi': return '#22c55e';
      case 'Social': return '#f472b6';
      case 'Infrastructure': return '#f59e0b';
      case 'Gaming': return '#06b6d4';
      default: return colors.textMuted;
    }
  })();

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: colors.bgCard,
        border: `1px solid ${hovered ? 'rgba(0, 82, 255, 0.3)' : colors.border}`,
        borderRadius: 6,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        transition: 'all 200ms ease-out',
        boxShadow: hovered ? '0 0 24px rgba(0, 82, 255, 0.06)' : 'none',
        animation: `fadeInUp 400ms cubic-bezier(0.16, 1, 0.3, 1) both`,
        animationDelay: `${index * 80}ms`,
      }}
    >
      {/* Header: number + category */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          fontFamily: MONO,
          fontSize: 20,
          fontWeight: 700,
          color: '#0052FF',
          textShadow: '0 0 10px rgba(0, 82, 255, 0.3)',
          letterSpacing: '-0.02em',
        }}>
          {product.number}
        </span>
        <span style={{
          fontFamily: MONO,
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: categoryColor,
          background: `${categoryColor}15`,
          border: `1px solid ${categoryColor}30`,
          padding: '3px 8px',
          borderRadius: 3,
        }}>
          {product.category}
        </span>
      </div>

      {/* Name */}
      <div>
        <h3 style={{
          fontFamily: MONO,
          fontSize: 15,
          fontWeight: 700,
          color: colors.text,
          margin: 0,
          letterSpacing: '-0.01em',
        }}>
          {product.name}
        </h3>
        <p style={{
          fontFamily: MONO,
          fontSize: 12,
          color: colors.textMuted,
          margin: '8px 0 0 0',
          lineHeight: 1.6,
        }}>
          {product.description}
        </p>
      </div>

      {/* Countdown */}
      <div style={{
        fontFamily: MONO,
        fontSize: 13,
        fontWeight: 600,
        color: product.daysUntil <= 3 ? '#0052FF' : colors.textDim,
        textShadow: product.daysUntil <= 3 ? '0 0 8px rgba(0, 82, 255, 0.3)' : 'none',
        background: product.daysUntil <= 3 ? 'rgba(0, 82, 255, 0.06)' : `${colors.bg}`,
        border: `1px solid ${product.daysUntil <= 3 ? 'rgba(0, 82, 255, 0.2)' : colors.border}`,
        borderRadius: 4,
        padding: '8px 12px',
        textAlign: 'center',
        letterSpacing: '0.05em',
      }}>
        {countdown}
      </div>

      {/* Notify button */}
      <button
        onClick={() => setNotified(!notified)}
        style={{
          fontFamily: MONO,
          fontSize: 12,
          fontWeight: 600,
          color: notified ? '#0052FF' : colors.textMuted,
          background: notified ? 'rgba(0, 82, 255, 0.08)' : 'transparent',
          border: `1px solid ${notified ? 'rgba(0, 82, 255, 0.3)' : colors.border}`,
          borderRadius: 4,
          padding: '8px 0',
          cursor: 'pointer',
          transition: 'all 150ms ease-out',
          width: '100%',
        }}
      >
        {notified ? '> notified ✓' : '> notify_me'}
      </button>
    </div>
  );
}

export default function UpcomingPage() {
  const { colors } = useTheme();

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.bg,
      color: colors.text,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div className="ascii-grid-bg" />
      <div className="scanline-overlay" />

      <Header />

      <main style={{
        flex: 1,
        maxWidth: 1080,
        margin: '0 auto',
        padding: '100px 20px 60px',
        width: '100%',
        position: 'relative',
        zIndex: 2,
      }}>
        {/* ASCII Radar Section */}
        <section style={{
          textAlign: 'center',
          marginBottom: 48,
          animation: 'fadeInUp 400ms cubic-bezier(0.16, 1, 0.3, 1) both',
        }}>
          <AsciiRadar />

          <h1 style={{
            fontFamily: MONO,
            fontSize: 28,
            fontWeight: 700,
            color: colors.text,
            margin: '24px 0 0 0',
            letterSpacing: '-0.03em',
          }}>
            Upcoming Launches
          </h1>
          <p style={{
            fontFamily: MONO,
            fontSize: 13,
            color: colors.textMuted,
            margin: '10px 0 0 0',
            letterSpacing: '-0.01em',
          }}>
            Products preparing to launch on Base
          </p>

          {/* Terminal-style status line */}
          <div style={{
            fontFamily: MONO,
            fontSize: 11,
            color: colors.textDim,
            marginTop: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
          }}>
            <span style={{ color: colors.border }}>$</span>
            <span>sonarbot scan --upcoming</span>
            <span style={{ color: colors.border }}>|</span>
            <span style={{ color: '#22c55e' }}>{UPCOMING_PRODUCTS.length} results</span>
          </div>
        </section>

        {/* Separator */}
        <div style={{
          height: 1,
          background: colors.border,
          marginBottom: 40,
        }} />

        {/* Product Grid */}
        <div style={{ marginBottom: 60 }}>
          <div style={{
            display: 'grid',
            gap: 16,
          }} className="upcoming-grid">
            {UPCOMING_PRODUCTS.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        </div>

        {/* Bottom terminal line */}
        <div style={{
          fontFamily: MONO,
          fontSize: 11,
          color: colors.textDim,
          textAlign: 'center',
          padding: '20px 0',
          animation: 'fadeInUp 400ms cubic-bezier(0.16, 1, 0.3, 1) both',
          animationDelay: '600ms',
        }}>
          <span style={{ color: colors.border }}>{'─'.repeat(20)}</span>
          <span style={{ margin: '0 12px', color: colors.textMuted }}>END OF SCAN</span>
          <span style={{ color: colors.border }}>{'─'.repeat(20)}</span>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: `1px solid ${colors.border}`,
        background: colors.bg,
        padding: 20,
        position: 'relative',
        zIndex: 2,
      }}>
        <div style={{
          maxWidth: 1080,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 11,
            color: colors.textDim,
            fontFamily: MONO,
          }}>
            <span style={{ fontWeight: 700, color: '#0052FF' }}>sonarbot</span>
            <span style={{ color: colors.border }}>&middot;</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>

      {/* Responsive grid styles */}
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
