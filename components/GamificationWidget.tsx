'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { useLanguage } from '@/context/LanguageContext'

interface GamificationProfile {
  points: number
  level: string
  uniqueRestaurants: number
  credits: number
  maxCredits: number
  creditsResetMonth: string | null
  serialCancels: number
  isBlocked: boolean
  graceExpiresAt: string | null
  featured: boolean
  ambassadorCode: string
  nextLevel: string | null
  nextLevelPoints: number | null
  nextLevelRestos: number | null
  avgRating: number
  totalRatings: number
  activeReferrals: number
  totalReferrals: number
  recentTransactions: {
    action: string
    delta: number
    note: string | null
    created_at: string
    restaurant_name: string | null
  }[]
}

const LEVEL_LABELS: Record<string, { emoji: string; label: string; color: string }> = {
  bronze:   { emoji: '🥉', label: 'Bronze',   color: '#CD7F32' },
  silver:   { emoji: '🥈', label: 'Silver',   color: '#C0C0C0' },
  gold:     { emoji: '🥇', label: 'Gold',     color: '#FFD700' },
  platinum: { emoji: '💎', label: 'Platinum', color: '#E5E4E2' },
}

const LEVEL_THRESHOLDS = [
  { level: 'bronze', points: 0, restos: 0 },
  { level: 'silver', points: 300, restos: 0 },
  { level: 'gold', points: 800, restos: 5 },
  { level: 'platinum', points: 2500, restos: 10 },
]

const T = {
  fr: {
    level: 'Niveau',
    credits: 'Crédits ce mois',
    used: 'utilisés',
    resetOn: 'Reset le 1er',
    referral: 'Parrainage',
    restoActive: 'restaurants ont publié',
    when5: 'Quand 5/5 → 100€ virés sur ton compte',
    copyCode: 'Copier',
    copied: 'Copié !',
    history: 'Historique points',
    pts: 'pts',
    uniqueRestos: 'restaurants uniques',
    graceWarning: 'est en danger — remonte au-dessus de',
    graceBefore: 'avant le',
    graceKeep: 'pour le conserver',
    blocked: 'Réservations bloquées ce mois (2 annulations < 24h)',
    rating: 'Note moyenne',
    reviews: 'avis',
    noHistory: 'Aucune activité pour le moment',
  },
  en: {
    level: 'Level',
    credits: 'Credits this month',
    used: 'used',
    resetOn: 'Resets on the 1st',
    referral: 'Referral',
    restoActive: 'restaurants published',
    when5: 'When 5/5 → €100 sent to your account',
    copyCode: 'Copy',
    copied: 'Copied!',
    history: 'Points history',
    pts: 'pts',
    uniqueRestos: 'unique restaurants',
    graceWarning: 'is at risk — get back above',
    graceBefore: 'before',
    graceKeep: 'to keep it',
    blocked: 'Bookings blocked this month (2 last-minute cancellations)',
    rating: 'Average rating',
    reviews: 'reviews',
    noHistory: 'No activity yet',
  },
}

export default function GamificationWidget() {
  const { c } = useTheme()
  const { locale } = useLanguage()
  const t = T[locale]
  const [profile, setProfile] = useState<GamificationProfile | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/creator/gamification')
      .then(r => r.json())
      .then(data => { if (data.points !== undefined) setProfile(data) })
      .catch(() => {})
  }, [])

  if (!profile) return null

  const lvl = LEVEL_LABELS[profile.level] || LEVEL_LABELS.bronze
  const creditsUsed = profile.maxCredits - profile.credits

  // Progress bars for next level
  const nextThreshold = LEVEL_THRESHOLDS.find(l => l.level === profile.nextLevel)

  const handleCopy = () => {
    navigator.clipboard.writeText(profile.ambassadorCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-3 mb-6">
      {/* Grace period warning */}
      {profile.graceExpiresAt && (
        <div className="p-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <p className="font-dm text-[13px] font-semibold" style={{ color: '#ef4444' }}>
            {lvl.emoji} {t.level} {lvl.label} {t.graceWarning} {nextThreshold?.points ?? 0} {t.pts} {t.graceBefore} {new Date(profile.graceExpiresAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US')} {t.graceKeep}
          </p>
        </div>
      )}

      {/* Serial cancel block warning */}
      {profile.isBlocked && (
        <div className="p-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
          <p className="font-dm text-[13px] font-semibold" style={{ color: '#ef4444' }}>
            {t.blocked}
          </p>
        </div>
      )}

      {/* Main grid: Level + Credits + Referral */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Level & Points widget */}
        <div className="p-4 rounded-xl" style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}` }}>
          <div className="flex items-center gap-2 mb-3">
            <span style={{ fontSize: 20 }}>{lvl.emoji}</span>
            <span className="font-dm font-bold text-[14px]" style={{ color: lvl.color }}>{lvl.label}</span>
            <span className="font-dm text-[12px] ml-auto" style={{ color: c.textMuted }}>
              {Math.max(0, profile.points)} {t.pts}
            </span>
          </div>

          {/* Rating */}
          {profile.totalRatings > 0 && (
            <p className="font-dm text-[12px] mb-2" style={{ color: c.textMuted }}>
              {t.rating} : ★ {profile.avgRating.toFixed(1)} · {profile.totalRatings} {t.reviews}
            </p>
          )}

          {/* Progress to next level */}
          {nextThreshold && (
            <div className="space-y-2">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-dm text-[11px]" style={{ color: c.textMuted }}>
                    {profile.points >= nextThreshold.points ? '✓' : `${Math.max(0, profile.points)} / ${nextThreshold.points}`} {t.pts}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full transition-all" style={{
                    width: `${Math.min(100, (Math.max(0, profile.points) / nextThreshold.points) * 100)}%`,
                    background: profile.points >= nextThreshold.points ? '#4ade80' : '#E8471A',
                  }} />
                </div>
              </div>
              {nextThreshold.restos > 0 && (
                <p className="font-dm text-[11px]" style={{ color: profile.uniqueRestaurants >= nextThreshold.restos ? '#4ade80' : c.textMuted }}>
                  {profile.uniqueRestaurants >= nextThreshold.restos ? '✓ ' : ''}{profile.uniqueRestaurants} / {nextThreshold.restos} {t.uniqueRestos}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Credits widget */}
        <div className="p-4 rounded-xl" style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}` }}>
          <p className="font-dm text-[11px] uppercase tracking-[0.06em] mb-3" style={{ color: c.textMuted }}>{t.credits}</p>
          <div className="flex gap-1 mb-2">
            {Array.from({ length: profile.maxCredits }).map((_, i) => (
              <div key={i} className="h-3 flex-1 rounded-sm" style={{
                background: i < creditsUsed ? 'rgba(255,255,255,0.06)' : '#E8471A',
              }} />
            ))}
          </div>
          <p className="font-dm text-[12px]" style={{ color: c.textMuted }}>
            {creditsUsed} / {profile.maxCredits} {t.used}
          </p>
          <p className="font-dm text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
            {t.resetOn}
          </p>
        </div>

        {/* Referral widget */}
        <div className="p-4 rounded-xl" style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}` }}>
          <p className="font-dm text-[11px] uppercase tracking-[0.06em] mb-2" style={{ color: c.textMuted }}>{t.referral}</p>
          <div className="flex items-center gap-2 mb-3">
            <code className="font-dm font-bold text-[16px] tracking-wider" style={{ color: '#E8471A' }}>
              {profile.ambassadorCode}
            </code>
            <button onClick={handleCopy}
              className="font-dm text-[10px] px-3 py-1 rounded-md cursor-pointer transition-all hover:brightness-110"
              style={{ background: 'rgba(232,71,26,0.15)', color: '#E8471A', border: 'none' }}>
              {copied ? t.copied : t.copyCode}
            </button>
          </div>
          <div className="flex gap-1 mb-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-2 flex-1 rounded-sm" style={{
                background: i < profile.activeReferrals ? '#4ade80' : 'rgba(255,255,255,0.06)',
              }} />
            ))}
          </div>
          <p className="font-dm text-[11px]" style={{ color: c.textMuted }}>
            {profile.activeReferrals} / 5 {t.restoActive}
          </p>
          {profile.activeReferrals < 5 && (
            <p className="font-dm text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>{t.when5}</p>
          )}
        </div>
      </div>

      {/* Recent points history */}
      {profile.recentTransactions.length > 0 && (
        <details className="group">
          <summary className="font-dm text-[11px] uppercase tracking-[0.06em] cursor-pointer list-none flex items-center gap-1" style={{ color: c.textMuted }}>
            <span className="group-open:rotate-90 transition-transform">▶</span> {t.history}
          </summary>
          <div className="mt-2 space-y-1">
            {profile.recentTransactions.map((tx, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5 px-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <span className="font-dm font-bold text-[12px] w-16 text-right" style={{
                  color: tx.delta > 0 ? '#4ade80' : tx.delta < 0 ? '#ef4444' : c.textMuted,
                }}>
                  {tx.delta > 0 ? '+' : ''}{tx.delta} {t.pts}
                </span>
                <span className="font-dm text-[12px] flex-1" style={{ color: c.textMuted }}>
                  {tx.note || tx.action}{tx.restaurant_name ? ` — ${tx.restaurant_name}` : ''}
                </span>
                <span className="font-dm text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  {new Date(tx.created_at).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
