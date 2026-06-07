'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { useLanguage } from '@/context/LanguageContext'

interface WalletInfo {
  sequentialId: number
  batchNumber: number
  handle: string
  level: string
  walletAuthToken: string
}

const T = {
  fr: {
    title: 'Ton ID Créateur 2960',
    subtitle: 'Accréditation permanente. Mis à jour automatiquement.',
    scanInfo: 'Montre ce QR au restaurant pour valider ton arrivée',
    copyLink: 'Copier le lien de scan',
    copied: 'Copié !',
    addGoogle: 'Ajouter à Google Wallet',
    appleSoon: 'Apple Wallet — bientôt disponible',
  },
  en: {
    title: 'Your 2960 Creator ID',
    subtitle: 'Permanent accreditation. Updated automatically.',
    scanInfo: 'Show this QR to the restaurant to validate your arrival',
    copyLink: 'Copy scan link',
    copied: 'Copied!',
    addGoogle: 'Add to Google Wallet',
    appleSoon: 'Apple Wallet — coming soon',
  },
}

const LEVEL_COLORS: Record<string, string> = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E5E4E2',
}

export default function WalletIdWidget() {
  const { c } = useTheme()
  const { locale } = useLanguage()
  const t = T[locale]
  const [info, setInfo] = useState<WalletInfo | null>(null)
  const [copied, setCopied] = useState(false)
  const [walletLoading, setWalletLoading] = useState(false)

  useEffect(() => {
    fetch('/api/creator/gamification')
      .then(r => r.json())
      .then(data => {
        if (data.ambassadorCode) {
          // Also fetch sequential_id
          fetch('/api/creator/wallet-info')
            .then(r => r.json())
            .then(w => { if (w.sequentialId) setInfo(w) })
            .catch(() => {})
        }
      })
      .catch(() => {})
  }, [])

  if (!info) return null

  const seqId = `2960-${String(info.sequentialId).padStart(4, '0')}`
  const scanUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/scan/${info.walletAuthToken}`
  const lvlColor = LEVEL_COLORS[info.level] || LEVEL_COLORS.bronze

  const handleCopy = () => {
    navigator.clipboard.writeText(scanUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleGoogleWallet = async () => {
    setWalletLoading(true)
    try {
      const res = await fetch('/api/wallet/google')
      const data = await res.json()
      if (data.url) window.open(data.url, '_blank')
    } catch { /* ignore */ }
    setWalletLoading(false)
  }

  return (
    <div className="rounded-2xl overflow-hidden mb-6" style={{ background: '#6d0040', border: '1px solid rgba(255,99,57,0.2)' }}>
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ color: '#ff6339' }}>
            2960 Agency
          </span>
          <span className="text-[11px] font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {seqId}
          </span>
        </div>

        {/* Identity */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,0,0,0.3)' }}>
            <span className="text-[16px] font-bold" style={{ color: '#ff6339' }}>
              {info.handle.replace('@', '').slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-[15px] font-bold" style={{ color: '#fff' }}>@{info.handle.replace('@', '')}</p>
            <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: lvlColor }}>{info.level}</p>
          </div>
        </div>

        {info.batchNumber === 1 && (
          <p className="text-[9px] uppercase tracking-wider mb-3" style={{ color: '#fcfaa6' }}>
            Batch #01
          </p>
        )}

        {/* QR scan info */}
        <p className="text-[12px] mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>{t.scanInfo}</p>

        <button onClick={handleCopy}
          className="font-dm text-[11px] font-semibold px-4 py-2 rounded-lg cursor-pointer transition-all hover:brightness-110"
          style={{ background: 'rgba(255,99,57,0.2)', color: '#ff6339', border: 'none' }}>
          {copied ? t.copied : t.copyLink}
        </button>
      </div>

      {/* Wallet buttons */}
      <div className="px-5 py-3 space-y-2" style={{ background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button
          onClick={handleGoogleWallet}
          disabled={walletLoading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg cursor-pointer transition-all hover:brightness-110 disabled:opacity-50"
          style={{ background: '#000', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span className="text-[12px] font-semibold text-white">
            {walletLoading ? '...' : t.addGoogle}
          </span>
        </button>
        <p className="text-[10px] text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
          {t.appleSoon}
        </p>
      </div>
    </div>
  )
}
