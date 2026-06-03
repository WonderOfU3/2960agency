'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/context/ThemeContext'

interface PendingRating {
  booking_id: number
  booking_date: string
  video_verified_at: string
  first_name: string
  last_name: string
  tiktok_username: string | null
  post_link: string | null
  deadline: string
}

export default function RatingWidget() {
  const { c } = useTheme()
  const [pendingRatings, setPendingRatings] = useState<PendingRating[]>([])
  const [activeRating, setActiveRating] = useState<number | null>(null)
  const [stars, setStars] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/restaurant/rate')
      .then(r => r.json())
      .then(data => {
        if (data.pendingRatings) setPendingRatings(data.pendingRatings)
      })
      .catch(() => {})
  }, [])

  if (pendingRatings.length === 0) return null

  const handleSubmit = async (bookingId: number) => {
    if (stars === 0) return
    if (stars <= 2 && !comment.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/restaurant/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, rating: stars, comment: comment.trim() || null }),
      })
      if (res.ok) {
        setPendingRatings(prev => prev.filter(p => p.booking_id !== bookingId))
        setActiveRating(null)
        setStars(0)
        setComment('')
      }
    } catch { /* ignore */ }
    setSubmitting(false)
  }

  return (
    <div className="mb-6 space-y-3">
      <p className="font-dm text-[11px] uppercase tracking-[0.06em]" style={{ color: c.textMuted }}>
        Évaluations en attente
      </p>
      {pendingRatings.map(pr => {
        const isActive = activeRating === pr.booking_id
        const deadline = new Date(pr.deadline)
        const daysLeft = Math.max(0, Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))

        return (
          <div key={pr.booking_id} className="rounded-xl p-4" style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}` }}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-dm font-semibold text-[14px]" style={{ color: c.text }}>
                  {pr.first_name} {pr.last_name}
                </p>
                <p className="font-dm text-[11px]" style={{ color: c.textMuted }}>
                  {pr.tiktok_username || ''} · {daysLeft}j restants
                </p>
              </div>
              {pr.post_link && (
                <a href={pr.post_link} target="_blank" rel="noopener noreferrer"
                  className="font-dm text-[11px] px-3 py-1 rounded-lg"
                  style={{ background: 'rgba(232,71,26,0.1)', color: '#E8471A', textDecoration: 'none' }}>
                  Voir le post
                </a>
              )}
            </div>

            {!isActive ? (
              <button onClick={() => { setActiveRating(pr.booking_id); setStars(0); setComment('') }}
                className="font-dm text-[12px] font-semibold px-4 py-2 rounded-lg cursor-pointer transition-all hover:brightness-110 w-full"
                style={{ background: 'rgba(232,71,26,0.15)', color: '#E8471A', border: 'none' }}>
                Noter ce créateur
              </button>
            ) : (
              <div className="mt-3 space-y-3">
                {/* Stars */}
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => setStars(n)}
                      className="text-[28px] cursor-pointer transition-transform hover:scale-110"
                      style={{ background: 'none', border: 'none', opacity: n <= stars ? 1 : 0.2 }}>
                      ★
                    </button>
                  ))}
                </div>

                {/* Comment */}
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder={stars <= 2 ? 'Commentaire obligatoire pour 1-2★' : 'Commentaire optionnel'}
                  className="font-dm w-full rounded-xl text-[13px] text-white/90 placeholder:text-white/20 outline-none resize-none"
                  style={{
                    padding: '12px 14px',
                    background: c.inputBg,
                    border: `1px solid ${stars <= 2 && !comment.trim() ? 'rgba(239,68,68,0.4)' : c.inputBorder}`,
                    minHeight: 80,
                  }}
                />

                <div className="flex gap-2">
                  <button onClick={() => setActiveRating(null)}
                    className="font-dm text-[12px] px-4 py-2 rounded-lg cursor-pointer flex-1"
                    style={{ background: 'rgba(255,255,255,0.06)', color: c.textMuted, border: 'none' }}>
                    Annuler
                  </button>
                  <button
                    onClick={() => handleSubmit(pr.booking_id)}
                    disabled={stars === 0 || (stars <= 2 && !comment.trim()) || submitting}
                    className="font-dm text-[12px] font-semibold px-4 py-2 rounded-lg cursor-pointer flex-1 disabled:opacity-40"
                    style={{ background: '#E8471A', color: '#fff', border: 'none' }}>
                    {submitting ? 'Envoi...' : `Envoyer ${stars}★`}
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
