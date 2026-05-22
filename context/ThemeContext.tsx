'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type Theme = 'dark' | 'light'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  c: ThemeColors
}

export interface ThemeColors {
  pageBg: string
  cardBg: string
  cardBorder: string
  cardBorderHover: string
  inputBg: string
  inputBorder: string
  inputBorderFocus: string
  text: string
  textMuted: string
  textFaint: string
  textUltraFaint: string
  divider: string
  headerBg: string
  tabBg: string
  accent: string
  // Opacity-based text (for use with Tailwind classes)
  isLight: boolean
}

const DARK: ThemeColors = {
  pageBg: '#0c0b09',
  cardBg: '#191714',
  cardBorder: 'rgba(255,255,255,0.06)',
  cardBorderHover: 'rgba(255,255,255,0.12)',
  inputBg: 'rgba(255,255,255,0.04)',
  inputBorder: 'rgba(255,255,255,0.07)',
  inputBorderFocus: 'rgba(232,71,26,0.4)',
  text: '#ffffff',
  textMuted: 'rgba(255,255,255,0.6)',
  textFaint: 'rgba(255,255,255,0.4)',
  textUltraFaint: 'rgba(255,255,255,0.2)',
  divider: 'rgba(255,255,255,0.06)',
  headerBg: 'rgba(12,11,9,0.85)',
  tabBg: '#191714',
  accent: '#E8471A',
  isLight: false,
}

const LIGHT: ThemeColors = {
  pageBg: '#f3f4f7',
  cardBg: '#ffffff',
  cardBorder: 'rgba(0,0,0,0.08)',
  cardBorderHover: 'rgba(0,0,0,0.15)',
  inputBg: '#e6e6ea',
  inputBorder: 'rgba(0,0,0,0.18)',
  inputBorderFocus: 'rgba(232,71,26,0.4)',
  text: '#111111',
  textMuted: '#555555',
  textFaint: '#777777',
  textUltraFaint: '#bbbbbb',
  divider: 'rgba(0,0,0,0.08)',
  headerBg: 'rgba(243,244,247,0.9)',
  tabBg: '#ffffff',
  accent: '#E8471A',
  isLight: true,
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
  c: DARK,
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    const saved = localStorage.getItem('theme') as Theme
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved)
      document.documentElement.setAttribute('data-theme', saved)
    } else {
      document.documentElement.setAttribute('data-theme', 'light')
    }
  }, [])

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem('theme', next)
      document.documentElement.setAttribute('data-theme', next)
      return next
    })
  }

  const c = theme === 'light' ? LIGHT : DARK

  // Apply theme class to body for global background
  useEffect(() => {
    document.body.style.background = c.pageBg
    document.body.style.color = c.text
  }, [c])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, c }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() { return useContext(ThemeContext) }
