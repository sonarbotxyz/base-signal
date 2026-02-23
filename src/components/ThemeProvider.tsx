'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

const darkColors: ThemeColors = {
  bg: '#0a0a0b',
  bgCard: '#111113',
  bgCardHover: '#18181b',
  text: '#e4e4e7',
  textMuted: '#a1a1aa',
  textDim: '#71717a',
  accent: '#0052FF',
  accentGlow: 'rgba(0, 82, 255, 0.10)',
  border: '#222225',
  borderLight: '#1a1a1d',
  codeBg: '#0f0f11',
  bannerBg: 'linear-gradient(135deg, #0a0e1a, #0d1428)',
  upvoteBg: '#111113',
  upvoteActiveBg: 'rgba(0, 82, 255, 0.12)',
  upvoteActiveText: '#0052FF',
  headerBg: 'rgba(10, 10, 11, 0.85)',
  footerBg: '#0a0a0b',
  separator: '#222225',
  cardShadow: 'none',
};

const lightColors: ThemeColors = {
  bg: '#fafafa',
  bgCard: '#ffffff',
  bgCardHover: '#f4f4f5',
  text: '#09090b',
  textMuted: '#71717a',
  textDim: '#a1a1aa',
  accent: '#0052FF',
  accentGlow: 'rgba(0, 82, 255, 0.06)',
  border: '#e4e4e7',
  borderLight: '#f4f4f5',
  codeBg: '#f4f4f5',
  bannerBg: 'linear-gradient(135deg, #eef2ff, #e8ecff)',
  upvoteBg: '#f4f4f5',
  upvoteActiveBg: 'rgba(0, 82, 255, 0.08)',
  upvoteActiveText: '#0052FF',
  headerBg: 'rgba(250, 250, 250, 0.85)',
  footerBg: '#fafafa',
  separator: '#e4e4e7',
  cardShadow: '0 1px 3px rgba(0,0,0,0.04)',
};

type Theme = 'dark' | 'light';

interface ThemeContextValue {
  theme: Theme;
  colors: ThemeColors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  colors: darkColors,
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('sonarbot-theme') as Theme | null;
    if (stored === 'light' || stored === 'dark') {
      setTheme(stored);
      document.documentElement.setAttribute('data-theme', stored);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
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

  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
