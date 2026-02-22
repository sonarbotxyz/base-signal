'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Using CSS variables via tailwind or directly instead of this big object
export interface ThemeColors {
  bg: string;
  bgCard: string;
  bgCardHover: string;
  text: string;
  textMuted: string;
  textDim: string;
  accent: string;
  accentGlow: string;
  border: string;
  borderLight: string;
  codeBg: string;
  bannerBg: string;
  upvoteBg: string;
  upvoteActiveBg: string;
  upvoteActiveText: string;
  headerBg: string;
  footerBg: string;
  separator: string;
  cardShadow: string;
}

// Fallback just to satisfy existing types cleanly, but we will mostly use tailwind classes.
const fallbackColors: ThemeColors = {
  bg: 'var(--bg)',
  bgCard: 'var(--bg-card)',
  bgCardHover: 'var(--bg-secondary)',
  text: 'var(--text)',
  textMuted: 'var(--text-muted)',
  textDim: 'var(--text-dim)',
  accent: 'var(--accent)',
  accentGlow: 'var(--accent-glow, rgba(0,68,255,0.08))',
  border: 'var(--border)',
  borderLight: 'var(--border)',
  codeBg: 'var(--bg-secondary)',
  bannerBg: 'var(--bg-secondary)',
  upvoteBg: 'transparent',
  upvoteActiveBg: 'var(--upvote-active-bg)',
  upvoteActiveText: 'var(--upvote-active-text)',
  headerBg: 'var(--bg)',
  footerBg: 'var(--bg)',
  separator: 'var(--border)',
  cardShadow: 'none',
};

type Theme = 'dark' | 'light';

interface ThemeContextValue {
  theme: Theme;
  colors: ThemeColors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  colors: fallbackColors,
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light'); // default to light
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('sonarbot-theme') as Theme | null;
    if (stored === 'light' || stored === 'dark') {
      setTheme(stored);
      document.documentElement.setAttribute('data-theme', stored);
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('sonarbot-theme', theme);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, colors: fallbackColors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
