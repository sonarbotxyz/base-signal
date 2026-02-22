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
  bg: 'var(--bg-primary)',
  bgCard: 'var(--bg-card)',
  bgCardHover: 'var(--bg-card-hover)',
  text: 'var(--text-primary)',
  textMuted: 'var(--text-secondary)',
  textDim: 'var(--text-muted)',
  accent: 'var(--accent)',
  accentGlow: 'var(--accent-glow)',
  border: 'var(--border-primary)',
  borderLight: 'var(--border-primary)',
  codeBg: 'var(--bg-secondary)',
  bannerBg: 'var(--bg-secondary)',
  upvoteBg: 'var(--upvote-bg)',
  upvoteActiveBg: 'var(--bg-secondary)',
  upvoteActiveText: 'var(--accent)',
  headerBg: 'var(--bg-primary)',
  footerBg: 'var(--bg-primary)',
  separator: 'var(--border-primary)',
  cardShadow: 'var(--card-shadow)',
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
