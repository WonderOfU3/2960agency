'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

const LEVEL_LABELS: Record<string, { label: string; color: string }> = {
  bronze:   { label: 'Bronze',   color: '#CD7F32' },
  silver:   { label: 'Silver',   color: '#C0C0C0' },
  gold:     { label: 'Gold',     color: '#FFD700' },
  platinum: { label: 'Platinum', color: '#E5E4E2' },
}

interface ScanData {
  id: number
  handle: string
  firstName: string
  lastName: string
  level: string
  sequentialId: number
  batchNumber: number
  collabsCompleted: number
  todayBooking: {
    id: number
    restaurantName: string
    alreadyScanned: boolean
  } | null
}

export default function ScanPage() {
  const params = useParams()
  const token = params.token as string
  const [data, setData] = useState<ScanData | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    fetch(`/api/scan?token=${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error)
        else setData(d)
        setLoading(false)
      })
      .catch(() => { setError('Erreur de connexion'); setLoading(false) })
  }, [token])

  const handleValidate = async () => {
    if (!data?.todayBooking) return
    setConfirming(true)
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: data.todayBooking.id, token }),
      })
      const result = await res.json()
      if (result.success) setConfirmed(true)
      else setError(result.error || 'Erreur')
    } catch { setError('Erreur de connexion') }
    setConfirming(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <span className="animate-spin inline-block w-8 h-8 border-2 border-[#ff6339]/30 border-t-[#ff6339] rounded-full" />
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-[#ff6339] text-[14px] font-semibold mb-2">Erreur</p>
          <p className="text-white/40 text-[13px]">{error}</p>
        </div>
      </div>
    )
  }

  if (!data) return null

  const lvl = LEVEL_LABELS[data.level] || LEVEL_LABELS.bronze
  const seqId = `2960-${String(data.sequentialId).padStart(4, '0')}`

  return (
    <div className="min-h-screen bg-black px-5 py-8" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div className="max-w-sm mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{ color: '#ff6339' }}>
            2960 Agency
          </span>
          <p className="text-white/20 text-[10px] mt-1">{seqId}</p>
        </div>

        {/* Avatar + Identity */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: '#6d0040' }}>
            <span className="text-[28px] font-bold" style={{ color: '#ff6339' }}>
              {data.handle.replace('@', '').slice(0, 2).toUpperCase()}
            </span>
          </div>
          <p className="text-white text-[20px] font-bold">@{data.handle.replace('@', '')}</p>
          <p className="text-white/40 text-[13px] mt-1">{data.firstName} {data.lastName}</p>
        </div>

        {/* Level + Stats */}
        <div className="rounded-2xl p-5 mb-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Niveau</p>
              <p className="text-[18px] font-bold" style={{ color: lvl.color }}>{lvl.label}</p>
            </div>
            <div className="text-right">
              <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Tables faites</p>
              <p className="text-white text-[18px] font-bold">{data.collabsCompleted}</p>
            </div>
          </div>
          {data.batchNumber === 1 && (
            <p className="text-[10px] uppercase tracking-wider" style={{ color: '#fcfaa6' }}>
              Batch #01 — Fondateur
            </p>
          )}
        </div>

        {/* Today's collab validation */}
        {confirmed ? (
          <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)' }}>
            <p className="text-[28px] mb-2">✓</p>
            <p className="text-[#4ade80] text-[16px] font-bold mb-1">Arrivée enregistrée</p>
            <p className="text-white/40 text-[13px]">Bon appétit !</p>
          </div>
        ) : data.todayBooking ? (
          data.todayBooking.alreadyScanned ? (
            <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-white/40 text-[13px]">Arrivée déjà validée pour</p>
              <p className="text-white text-[15px] font-semibold mt-1">{data.todayBooking.restaurantName}</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-2xl p-5 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-white/40 text-[11px] uppercase tracking-wider mb-2">Collab aujourd'hui</p>
                <p className="text-white text-[16px] font-bold">{data.todayBooking.restaurantName}</p>
              </div>
              <button
                onClick={handleValidate}
                disabled={confirming}
                className="w-full py-4 rounded-xl text-[15px] font-bold cursor-pointer transition-all hover:brightness-110 disabled:opacity-50"
                style={{ background: '#ff6339', color: '#fff', border: 'none' }}
              >
                {confirming ? 'Validation...' : `Valider l'arrivée de @${data.handle.replace('@', '')}`}
              </button>
            </div>
          )
        ) : (
          <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-white/40 text-[13px]">Pas de collab prévue aujourd'hui</p>
          </div>
        )}

        {error && (
          <p className="text-red-400 text-[12px] text-center mt-4">{error}</p>
        )}

        {/* Footer */}
        <p className="text-white/10 text-[10px] text-center mt-8">2960 Agency — Scan de validation</p>
      </div>
    </div>
  )
}
