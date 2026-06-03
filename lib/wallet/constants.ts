export const BRAND_COLORS = {
  bordeaux: '#6d0040',
  orange: '#ff6339',
  cream: '#fcfaa6',
  light: '#efefef',
} as const

export const LEVEL_COLORS = {
  bronze: {
    backgroundColor: 'rgb(109, 0, 64)',
    foregroundColor: 'rgb(255, 99, 57)',
    labelColor: 'rgb(239, 239, 239)',
    hex: '#6d0040',
  },
  silver: {
    backgroundColor: 'rgb(109, 0, 64)',
    foregroundColor: 'rgb(239, 239, 239)',
    labelColor: 'rgb(252, 250, 166)',
    hex: '#6d0040',
  },
  gold: {
    backgroundColor: 'rgb(255, 99, 57)',
    foregroundColor: 'rgb(109, 0, 64)',
    labelColor: 'rgb(252, 250, 166)',
    hex: '#ff6339',
  },
  platinum: {
    backgroundColor: 'rgb(239, 239, 239)',
    foregroundColor: 'rgb(109, 0, 64)',
    labelColor: 'rgb(255, 99, 57)',
    hex: '#efefef',
  },
} as const

export type WalletLevel = keyof typeof LEVEL_COLORS

export function formatSequentialId(id: number): string {
  return `2960-${String(id).padStart(4, '0')}`
}

export function getBatchNumber(sequentialId: number): number {
  if (sequentialId <= 40) return 1
  return Math.ceil((sequentialId - 40) / 100) + 1
}

export function formatCreditsExpiry(): string {
  const now = new Date()
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const months = ['janv.', 'fév.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']
  return `expire ${nextMonth.getDate()} ${months[nextMonth.getMonth()]}`
}

export function ptsMissingForNextLevel(points: number, level: string): string {
  const thresholds: Record<string, { next: string; pts: number }> = {
    bronze: { next: 'Silver', pts: 300 },
    silver: { next: 'Gold', pts: 800 },
    gold: { next: 'Platinum', pts: 2500 },
  }
  const t = thresholds[level]
  if (!t) return 'Niveau maximum atteint'
  const missing = Math.max(0, t.pts - points)
  return `${missing} pts pour ${t.next}`
}
