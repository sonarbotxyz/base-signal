'use client';

import Link from 'next/link';
import { useTheme } from './ThemeProvider';

export default function Footer() {
  const { colors } = useTheme();

  return (
    <footer className="site-footer" style={{ borderTop: `1px solid ${colors.border}`, background: colors.bg, padding: '16px', paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))', position: 'relative', zIndex: 2 }}>
      <div className="footer-inner" style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: colors.textDim }}>
          <span style={{ fontWeight: 700, color: colors.text }}>sonarbot</span>
          <span style={{ color: colors.border }}>&middot;</span>
          <span>&copy; {new Date().getFullYear()}</span>
        </div>
        <div className="footer-links" style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13 }}>
          <Link href="/docs" style={{ color: colors.textDim, textDecoration: 'none', padding: '8px 0' }}>Docs</Link>
          <Link href="/curation" style={{ color: colors.textDim, textDecoration: 'none', padding: '8px 0' }}>Curation</Link>
          <a href="https://x.com/sonarbotxyz" target="_blank" rel="noopener noreferrer" style={{ color: colors.textDim, textDecoration: 'none', padding: '8px 0' }}>@sonarbotxyz</a>
        </div>
      </div>
      <style>{`
        @media (max-width: 480px) {
          .footer-inner {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 8px !important;
          }
          .footer-links {
            gap: 12px !important;
          }
        }
      `}</style>
    </footer>
  );
}
