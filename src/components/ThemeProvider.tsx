'use client';

import { createContext, useContext, ReactNode } from 'react';

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
  bg: '#0C0C0E',
  bgCard: '#16161A',
  bgCardHover: '#1E1E24',
  text: '#F5F5F5',
  textMuted: '#8B8B9A',
  textDim: '#56566B',
  accent: '#0052FF',
  accentGlow: 'rgba(0, 82, 255, 0.10)',
  border: '#2A2A32',
  borderLight: '#222228',
  codeBg: '#0f0f11',
  bannerBg: 'linear-gradient(135deg, #0a0e1a, #0d1428)',
  upvoteBg: '#16161A',
  upvoteActiveBg: 'rgba(0, 82, 255, 0.12)',
  upvoteActiveText: '#0052FF',
  headerBg: 'rgba(12, 12, 14, 0.85)',
  footerBg: '#0C0C0E',
  separator: '#2A2A32',
  cardShadow: 'none',
};

interface ThemeContextValue {
  theme: 'dark';
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
  return (
    <ThemeContext.Provider value={{ theme: 'dark', colors: darkColors, toggleTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
}
