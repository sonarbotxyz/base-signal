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
  bg: '#0a0a0f',
  bgCard: '#111827',
  bgCardHover: '#162032',
  text: '#e2e8f0',
  textMuted: '#8892a4',
  textDim: '#64748b',
  accent: '#0044ff',
  accentGlow: 'rgba(0, 68, 255, 0.15)',
  border: '#1e293b',
  borderLight: '#162032',
  codeBg: '#111827',
  bannerBg: 'linear-gradient(135deg, #0a1628, #0d1f3c)',
  upvoteBg: '#111827',
  upvoteActiveBg: 'rgba(0, 68, 255, 0.15)',
  upvoteActiveText: '#0044ff',
  headerBg: 'rgba(10, 10, 15, 0.85)',
  footerBg: '#0a0a0f',
  separator: '#1e293b',
  cardShadow: 'none',
};

const lightColors: ThemeColors = {
  bg: '#f8f9fa',
  bgCard: '#ffffff',
  bgCardHover: '#f0f2f5',
  text: '#1a1a2e',
  textMuted: '#64748b',
  textDim: '#94a3b8',
  accent: '#0000ff',
  accentGlow: 'rgba(0, 0, 255, 0.08)',
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  codeBg: '#f1f5f9',
  bannerBg: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
  upvoteBg: '#f1f5f9',
  upvoteActiveBg: 'rgba(0, 0, 255, 0.08)',
  upvoteActiveText: '#0000ff',
  headerBg: 'rgba(248, 249, 250, 0.85)',
  footerBg: '#f8f9fa',
  separator: '#e2e8f0',
  cardShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
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
