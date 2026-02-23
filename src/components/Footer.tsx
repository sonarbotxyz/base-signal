'use client';

import Link from 'next/link';
import { useTheme } from './ThemeProvider';

export default function Footer() {
  const { colors } = useTheme();

  return (
    <footer style={{ borderTop: `1px solid ${colors.border}`, background: colors.bg, padding: '20px', position: 'relative', zIndex: 2 }}>
      <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: colors.textDim }}>
          <span style={{ fontWeight: 700, color: colors.text }}>sonarbot</span>
          <span style={{ color: colors.border }}>&middot;</span>
          <span>&copy; {new Date().getFullYear()}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13 }}>
          <Link href="/docs" style={{ color: colors.textDim, textDecoration: 'none' }}>Docs</Link>
          <Link href="/curation" style={{ color: colors.textDim, textDecoration: 'none' }}>Curation</Link>
          <a href="https://x.com/sonarbotxyz" target="_blank" rel="noopener noreferrer" style={{ color: colors.textDim, textDecoration: 'none' }}>@sonarbotxyz</a>
        </div>
      </div>
    </footer>
  );
}
