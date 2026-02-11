'use client';

import Link from 'next/link';
import { useTheme } from './ThemeProvider';

export default function Footer() {
  const { colors } = useTheme();

  return (
    <footer style={{ borderTop: `1px solid ${colors.border}`, background: colors.bg, padding: '24px 20px' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: colors.textDim }}>
          <span style={{
            fontWeight: 700, color: colors.accent,
            fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)",
            fontSize: 12,
          }}>sonarbot</span>
          <span style={{ color: colors.border }}>·</span>
          <span>© {new Date().getFullYear()}</span>
          <span style={{ color: colors.border }}>·</span>
          <span style={{ fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)", fontSize: 11, letterSpacing: '0.5px' }}>detecting signals</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: colors.textDim }}>
          <Link href="/docs" style={{ color: colors.textDim, textDecoration: 'none', transition: 'color 0.2s', fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)", fontSize: 12 }}>Docs</Link>
          <Link href="/curation" style={{ color: colors.textDim, textDecoration: 'none', transition: 'color 0.2s', fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)", fontSize: 12 }}>Curation</Link>
          <a href="https://x.com/sonarbotxyz" target="_blank" rel="noopener noreferrer" style={{ color: colors.textDim, textDecoration: 'none', transition: 'color 0.2s', fontFamily: "var(--font-jetbrains, 'JetBrains Mono', monospace)", fontSize: 12 }}>@sonarbotxyz</a>
        </div>
      </div>
    </footer>
  );
}
