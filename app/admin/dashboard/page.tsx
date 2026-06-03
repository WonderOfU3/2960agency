'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTheme } from '@/context/ThemeContext'

interface Creator {
  id: number
  created_at: string
  email: string
  phone: string
  first_name: string
  last_name: string
  tiktok_username: string
  instagram_username: string
  city: string
  ambassador_code: string
  referral_count: number
  reward_status: string
  status: string
}

interface BusinessApp {
  id: number
  created_at: string
  business_name: string
  owner_name: string
  email: string
  phone: string
  instagram_username: string
  tiktok_username: string
  website: string
  business_type: string
  cuisine_type: string
  address: string
  city: string
  arrondissement: string
  collab_offer: string
  content_wanted: string[]
  collab_frequency: string
  best_days: string[]
  best_times: string[]
  referred_by_ambassador_code: string | null
  status: string
}

interface TimeSlot {
  id: number
  day_of_week: number
  start_time: string
  end_time: string
  max_bookings: number
  is_active: boolean
  specific_date: string | null
}

const OFFER_LABELS: Record<string, string> = {
  meal_two: 'Repas pour 2',
  meal_three: 'Repas pour 3',
  meal_payment: 'Repas + Rémunération',
  virality_bonus: 'Prime de viralité',
  discuss: 'À discuter',
  meal_one: 'Repas pour 1',
  payment: 'Rémunération uniquement',
}

function formatOffer(v: string): string {
  return OFFER_LABELS[v] || v
}

interface Restaurant {
  id: number
  created_at: string
  name: string
  cuisine_type: string
  address: string
  city: string
  arrondissement: string
  photos: string[]
  offer_description: string
  virality_bonus: number | null
  max_bookings_per_week: number
  max_bookings_per_day: number
  subscription: string
  included_collabs: number
  extra_collab_price: number
  month_usage: number
  is_blocked: boolean
  is_published: boolean
  time_slots: TimeSlot[]
}

const DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

const SUBSCRIPTION_PLANS: { value: string; label: string; included: number; extra: number; color: string }[] = [
  { value: 'free',       label: 'Sans abonnement',      included: 0,   extra: 35, color: '#8a8580' },
  { value: 'basic',      label: 'Basic (29€/mois)',      included: 1,   extra: 20, color: '#fcfaa6' },
  { value: 'active',     label: 'Active (69€/mois)',     included: 4,   extra: 14, color: '#4ade80' },
  { value: 'pro',        label: 'Pro (119€/mois)',        included: 999, extra: 0,  color: '#E8471A' },
  { value: 'pro_assist', label: 'Pro+Assist (499€/mois)', included: 999, extra: 0,  color: '#E8471A' },
]

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  pending_validation: { bg: 'rgba(217,79,42,0.1)', text: '#D94F2A', label: 'En attente' },
  active: { bg: 'rgba(74,222,128,0.1)', text: '#4ade80', label: 'Actif' },
  blocked: { bg: 'rgba(239,68,68,0.1)', text: '#ef4444', label: 'Bloqué' },
  rejected: { bg: 'rgba(239,68,68,0.1)', text: '#ef4444', label: 'Refusé' },
}

const REWARD_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: 'rgba(255,255,255,0.05)', text: '#8a8580', label: 'En cours' },
  eligible: { bg: 'rgba(232,71,26,0.15)', text: '#E8471A', label: 'Eligible 100€' },
  paid: { bg: 'rgba(74,222,128,0.1)', text: '#4ade80', label: 'Payé' },
}

export default function AdminDashboard() {
  const router = useRouter()
  const { c } = useTheme()
  const [tab, setTab] = useState<'creator_apps' | 'creators' | 'applications' | 'restaurants' | 'collabs' | 'claims' | 'analytics'>('creator_apps')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [analytics, setAnalytics] = useState<any>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [claims, setClaims] = useState<any[]>([])
  const [claimsLoaded, setClaimsLoaded] = useState(false)
  const [creators, setCreators] = useState<Creator[]>([])
  const [applications, setApplications] = useState<BusinessApp[]>([])
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)
  const [showRestoForm, setShowRestoForm] = useState(false)
  const [editingSlotsFor, setEditingSlotsFor] = useState<number | null>(null)
  const [slotMode, setSlotMode] = useState<'recurring' | 'date'>('recurring')
  const [newSlot, setNewSlot] = useState({ dayOfWeek: '1', startTime: '12:00', endTime: '14:00', maxBookings: '1', date: '' })
  const [searchQuery, setSearchQuery] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [collabs, setCollabs] = useState<any[]>([])
  const [collabsLoaded, setCollabsLoaded] = useState(false)

  const sq = searchQuery.toLowerCase().trim()
  const filteredCreators = creators.filter(cr => !sq || [cr.first_name, cr.last_name, cr.email, cr.tiktok_username, cr.instagram_username, cr.city, cr.ambassador_code].some(f => f?.toLowerCase().includes(sq)))
  const filteredApps = applications.filter(a => !sq || [a.business_name, a.owner_name, a.email, a.city, a.address, a.cuisine_type].some(f => f?.toLowerCase().includes(sq)))
  const filteredRestos = restaurants.filter(r => !sq || [r.name, r.cuisine_type, r.address, r.city].some(f => f?.toLowerCase().includes(sq)))

  const handleAddSlot = async (restaurantId: number) => {
    try {
      if (slotMode === 'date' && !newSlot.date) return
      const payload = slotMode === 'recurring'
        ? { action: 'add_recurring', dayOfWeek: parseInt(newSlot.dayOfWeek), startTime: newSlot.startTime, endTime: newSlot.endTime, maxBookings: parseInt(newSlot.maxBookings) }
        : { action: 'add_date', date: newSlot.date, startTime: newSlot.startTime, endTime: newSlot.endTime, maxBookings: parseInt(newSlot.maxBookings) }

      await fetch(`/api/admin/restaurants/${restaurantId}/slots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      setNewSlot({ dayOfWeek: '1', startTime: '12:00', endTime: '14:00', maxBookings: '1', date: '' })
      await fetchData()
    } catch (err) {
      console.error('Add slot error:', err)
    }
  }

  const handleDeleteSlot = async (restaurantId: number, slotId: number) => {
    try {
      await fetch(`/api/admin/restaurants/${restaurantId}/slots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', slotId }),
      })
      await fetchData()
    } catch (err) {
      console.error('Delete slot error:', err)
    }
  }

  const fetchData = useCallback(async () => {
    try {
      const [creatorsRes, appsRes, restaurantsRes] = await Promise.all([
        fetch('/api/admin/creators'),
        fetch('/api/admin/applications'),
        fetch('/api/admin/restaurants'),
      ])

      if (creatorsRes.status === 401) {
        router.push('/admin/login')
        return
      }

      const creatorsData = await creatorsRes.json()
      const appsData = await appsRes.json()
      const restaurantsData = await restaurantsRes.json()

      setCreators(creatorsData.creators || [])
      setApplications(appsData.applications || [])
      setRestaurants(restaurantsData.restaurants || [])
    } catch {
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleCreatorAction = async (id: number, action: string) => {
    try {
      const res = await fetch(`/api/admin/creators/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (res.ok) {
        await fetchData()
      }
    } catch (err) {
      console.error('Action error:', err)
    }
  }

  const handleResetCreatorPassword = async (id: number, email: string) => {
    const newPwd = prompt(`Nouveau mot de passe pour ${email} (min 8 caractères) :`)
    if (!newPwd || newPwd.length < 8) {
      if (newPwd !== null) alert('Mot de passe trop court (min 8 caractères)')
      return
    }
    try {
      const res = await fetch(`/api/admin/creators/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_password', newPassword: newPwd }),
      })
      if (res.ok) alert(`Mot de passe réinitialisé pour ${email}`)
      else alert('Erreur lors de la réinitialisation')
    } catch { alert('Erreur serveur') }
  }

  const handleResetRestoPassword = async (restoId: number, restoName: string) => {
    const newPwd = prompt(`Nouveau mot de passe pour ${restoName} (min 8 caractères) :`)
    if (!newPwd || newPwd.length < 8) {
      if (newPwd !== null) alert('Mot de passe trop court (min 8 caractères)')
      return
    }
    try {
      const res = await fetch(`/api/admin/restaurants/${restoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_password', newPassword: newPwd }),
      })
      if (res.ok) alert(`Mot de passe réinitialisé pour ${restoName}`)
      else alert('Erreur lors de la réinitialisation')
    } catch { alert('Erreur serveur') }
  }

  const handleApplicationAction = async (id: number, action: 'accept' | 'reject') => {
    try {
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (res.ok) {
        await fetchData()
      }
    } catch (err) {
      console.error('Application action error:', err)
    }
  }

  const handleTogglePublish = async (id: number, isPublished: boolean) => {
    try {
      await fetch(`/api/admin/restaurants/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !isPublished }),
      })
      await fetchData()
    } catch (err) {
      console.error('Toggle publish error:', err)
    }
  }

  const handleLogout = () => {
    document.cookie = 'admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: c.pageBg }}>
        <span className="animate-spin inline-block w-8 h-8 border-2 border-[#E8471A]/30 border-t-[#E8471A] rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: c.pageBg }}>
      {/* Header */}
      <header className="sticky top-0 z-50" style={{
        background: c.headerBg,
        backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${c.divider}`,
      }}>
        <div className="flex items-center justify-between px-4 sm:px-8" style={{ height: 64 }}>
          <div className="flex items-center gap-4">
            <Link href="/" className="font-buster text-white/80 text-[10px] tracking-[0.18em] uppercase" style={{ textDecoration: 'none' }}>
              2960 Agency
            </Link>
            <span className="font-dm text-[#E8471A] text-[11px] font-semibold uppercase tracking-[0.1em]">Admin</span>
          </div>
          <button onClick={handleLogout} className="font-dm text-white/30 text-[12px] hover:text-white/60 transition-colors cursor-pointer">
            Déconnexion
          </button>
        </div>
      </header>

      {/* Stats bar */}
      <div className="px-4 sm:px-8 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Candidatures créateurs', value: creators.filter(c => c.status === 'pending_validation').length, color: '#D94F2A' },
            { label: 'Créateurs validés', value: creators.filter(c => c.status === 'active').length, color: '#4ade80' },
            { label: 'Candidatures restos', value: applications.filter(a => !a.status || a.status === 'pending').length, color: '#D94F2A' },
            { label: 'Restaurants', value: restaurants.length, color: '#E8471A' },
          ].map((stat, i) => (
            <div key={i} className="rounded-2xl p-4" style={{
              background: c.cardBg,
              border: `1px solid ${c.divider}`,
            }}>
              <p className="font-dm text-white/40 text-[11px] uppercase tracking-[0.08em]">{stat.label}</p>
              <p className="font-dm font-bold text-[28px]" style={{ color: stat.color }}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Search bar */}
      <div className="px-4 sm:px-8 mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Rechercher un créateur ou restaurant..."
          className="font-dm w-full max-w-md rounded-xl text-[14px] outline-none transition-all"
          style={{
            height: 44, padding: '0 16px',
            background: c.inputBg, border: `1px solid ${c.inputBorder}`,
            color: c.text,
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(232,71,26,0.4)'}
          onBlur={e => e.target.style.borderColor = c.inputBorder || 'rgba(255,255,255,0.08)'}
        />
      </div>

      {/* Tabs */}
      <div className="px-4 sm:px-8 mb-4">
        <div className="flex gap-1 rounded-xl p-1 flex-wrap" style={{ background: c.cardBg, display: 'inline-flex' }}>
          {([
            { key: 'creator_apps' as const, label: 'Candidatures créateurs' },
            { key: 'creators' as const, label: 'Créateurs' },
            { key: 'applications' as const, label: 'Candidatures restos' },
            { key: 'restaurants' as const, label: 'Restaurants' },
            { key: 'collabs' as const, label: 'Collabs' },
            { key: 'claims' as const, label: 'Claims' },
            { key: 'analytics' as const, label: 'Analytics' },
          ]).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="font-dm text-[13px] font-semibold px-5 py-2.5 rounded-lg transition-all cursor-pointer"
              style={{
                background: tab === t.key ? '#E8471A' : 'transparent',
                color: tab === t.key ? '#fff' : (c.isLight ? '#777' : 'rgba(255,255,255,0.4)'),
                border: 'none',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-8 pb-12">
        {/* === CREATOR APPLICATIONS TAB (pending/rejected) === */}
        {tab === 'creator_apps' && (
          <div className="space-y-3">
            {filteredCreators.filter(cr => cr.status === 'pending_validation' || cr.status === 'rejected').length === 0 ? (
              <p className="font-dm text-white/30 text-center py-12">Aucune candidature créateur en attente</p>
            ) : (
              filteredCreators.filter(cr => cr.status === 'pending_validation' || cr.status === 'rejected').map(cr => {
                const s = STATUS_COLORS[cr.status] || STATUS_COLORS.pending_validation
                const r = REWARD_COLORS[cr.reward_status] || REWARD_COLORS.pending
                return (
                  <div key={cr.id} className="rounded-2xl p-5 animate-fade-in" style={{
                    background: c.cardBg,
                    border: `1px solid ${c.divider}`,
                    opacity: cr.status === 'rejected' ? 0.5 : 1,
                  }}>
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          <h3 className="font-dm text-white font-semibold text-[15px]">
                            {cr.first_name} {cr.last_name}
                          </h3>
                          <span className="font-dm text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{
                            background: s.bg, color: s.text,
                          }}>{s.label}</span>
                        </div>
                        <div className="font-dm text-white/40 text-[13px] space-y-0.5">
                          <p>{cr.email} &middot; {cr.phone}</p>
                          <p>
                            {cr.tiktok_username && <span className="text-[#E8471A]">{cr.tiktok_username}</span>}
                            {cr.instagram_username && <span className="ml-2">{cr.instagram_username}</span>}
                            {cr.city && <span className="ml-2">&middot; {cr.city}</span>}
                          </p>
                          <p className="text-white/25">
                            Inscrit le {new Date(cr.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      {cr.status === 'pending_validation' && (
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={() => handleCreatorAction(cr.id, 'validate')}
                            className="font-dm text-[12px] font-semibold px-4 py-2 rounded-lg cursor-pointer transition-all hover:brightness-110"
                            style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: 'none' }}
                          >
                            Valider
                          </button>
                          <button onClick={() => handleCreatorAction(cr.id, 'reject')}
                            className="font-dm text-[12px] font-semibold px-4 py-2 rounded-lg cursor-pointer transition-all hover:brightness-110"
                            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none' }}
                          >
                            Refuser
                          </button>
                        </div>
                      )}
                      {cr.status === 'rejected' && (
                        <span className="font-dm text-[11px] text-[#ef4444]/60 flex-shrink-0">Refusé</span>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* === VALIDATED CREATORS TAB === */}
        {tab === 'creators' && (
          <div className="space-y-3">
            {filteredCreators.filter(cr => cr.status === 'active' || cr.status === 'blocked').length === 0 ? (
              <p className="font-dm text-white/30 text-center py-12">Aucun créateur validé pour le moment</p>
            ) : (
              filteredCreators.filter(cr => cr.status === 'active' || cr.status === 'blocked').map(cr => {
                const s = STATUS_COLORS[cr.status] || STATUS_COLORS.pending_validation
                const r = REWARD_COLORS[cr.reward_status] || REWARD_COLORS.pending
                return (
                  <div key={cr.id} className="rounded-2xl p-5 animate-fade-in" style={{
                    background: c.cardBg,
                    border: `1px solid ${c.divider}`,
                  }}>
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          <h3 className="font-dm text-white font-semibold text-[15px]">
                            {cr.first_name} {cr.last_name}
                          </h3>
                          <span className="font-dm text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{
                            background: s.bg, color: s.text,
                          }}>{s.label}</span>
                          {cr.referral_count > 0 && (
                            <span className="font-dm text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{
                              background: r.bg, color: r.text,
                            }}>
                              {r.label} ({cr.referral_count}/5)
                            </span>
                          )}
                        </div>
                        <div className="font-dm text-white/40 text-[13px] space-y-0.5">
                          <p>{cr.email} &middot; {cr.phone}</p>
                          <p>
                            {cr.tiktok_username && <span className="text-[#E8471A]">{cr.tiktok_username}</span>}
                            {cr.instagram_username && <span className="ml-2">{cr.instagram_username}</span>}
                            {cr.city && <span className="ml-2">&middot; {cr.city}</span>}
                          </p>
                          <p className="text-white/25">
                            Code: <span className="text-white/50 font-mono tracking-wider">{cr.ambassador_code}</span>
                            &middot; Inscrit le {new Date(cr.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        {cr.status === 'pending_validation' && (
                          <>
                            <button onClick={() => handleCreatorAction(cr.id, 'validate')}
                              className="font-dm text-[12px] font-semibold px-4 py-2 rounded-lg cursor-pointer transition-all hover:brightness-110"
                              style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: 'none' }}
                            >
                              Valider
                            </button>
                            <button onClick={() => handleCreatorAction(cr.id, 'reject')}
                              className="font-dm text-[12px] font-semibold px-4 py-2 rounded-lg cursor-pointer transition-all hover:brightness-110"
                              style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none' }}
                            >
                              Refuser
                            </button>
                          </>
                        )}
                        {cr.status === 'active' && (
                          <button onClick={() => handleCreatorAction(cr.id, 'block')}
                            className="font-dm text-[12px] font-semibold px-4 py-2 rounded-lg cursor-pointer transition-all hover:brightness-110"
                            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none' }}
                          >
                            Bloquer
                          </button>
                        )}
                        {cr.status === 'blocked' && (
                          <button onClick={() => handleCreatorAction(cr.id, 'validate')}
                            className="font-dm text-[12px] font-semibold px-4 py-2 rounded-lg cursor-pointer transition-all hover:brightness-110"
                            style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: 'none' }}
                          >
                            Débloquer
                          </button>
                        )}
                        {cr.reward_status === 'eligible' && (
                          <button onClick={() => handleCreatorAction(cr.id, 'mark_paid')}
                            className="font-dm text-[12px] font-semibold px-4 py-2 rounded-lg cursor-pointer transition-all hover:brightness-110"
                            style={{ background: 'rgba(232,71,26,0.15)', color: '#E8471A', border: 'none' }}
                          >
                            Payer 100€
                          </button>
                        )}
                        <button onClick={() => handleResetCreatorPassword(cr.id, cr.email)}
                          className="font-dm text-[12px] font-semibold px-4 py-2 rounded-lg cursor-pointer transition-all hover:brightness-110"
                          style={{ background: 'rgba(255,255,255,0.06)', color: '#8a8580', border: 'none' }}
                        >
                          Reset MDP
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {tab === 'applications' && (
          <div className="space-y-3">
            {filteredApps.length === 0 ? (
              <p className="font-dm text-white/30 text-center py-12">Aucune candidature restaurant</p>
            ) : (
              filteredApps.map(a => {
                const isPending = !a.status || a.status === 'pending'
                const isAccepted = a.status === 'accepted'
                const isRejected = a.status === 'rejected'
                return (
                  <div key={a.id} className="rounded-2xl p-5 animate-fade-in" style={{
                    background: c.cardBg,
                    border: `1px solid ${isAccepted ? 'rgba(74,222,128,0.15)' : isRejected ? 'rgba(239,68,68,0.1)' : c.divider}`,
                    opacity: isRejected ? 0.5 : 1,
                  }}>
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          <h3 className="font-dm text-white font-semibold text-[15px]">{a.business_name}</h3>
                          <span className="font-dm text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{
                            background: isPending ? 'rgba(217,79,42,0.1)' : isAccepted ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)',
                            color: isPending ? '#D94F2A' : isAccepted ? '#4ade80' : '#ef4444',
                          }}>
                            {isPending ? 'En attente' : isAccepted ? 'Accepté' : 'Refusé'}
                          </span>
                          <span className="font-dm text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{
                            background: 'rgba(255,255,255,0.05)', color: '#8a8580',
                          }}>
                            {a.business_type}
                          </span>
                          {a.referred_by_ambassador_code && (
                            <span className="font-dm text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{
                              background: 'rgba(232,71,26,0.1)', color: '#E8471A',
                            }}>
                              Code: {a.referred_by_ambassador_code}
                            </span>
                          )}
                        </div>
                        <div className="font-dm text-white/40 text-[13px] space-y-0.5">
                          <p><span className="text-white/60">{a.owner_name}</span> &middot; {a.email} &middot; {a.phone}</p>
                          <p>{a.cuisine_type} &middot; {a.address}, {a.city} {a.arrondissement ? `(${a.arrondissement})` : ''}</p>
                          <p>
                            {a.instagram_username && <span className="text-white/50">{a.instagram_username}</span>}
                            {a.tiktok_username && <span className="text-white/50 ml-2">{a.tiktok_username}</span>}
                            {a.website && <span className="text-white/30 ml-2">{a.website}</span>}
                          </p>
                        </div>
                        <div className="mt-3 rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                          <p className="font-dm text-white/30 text-[10px] uppercase tracking-wider mb-1">Offre</p>
                          <p className="font-dm text-white/60 text-[13px]">{formatOffer(a.collab_offer)}</p>
                          <div className="flex gap-4 mt-2 flex-wrap">
                            <div>
                              <p className="font-dm text-white/30 text-[10px] uppercase tracking-wider">Fréquence</p>
                              <p className="font-dm text-white/50 text-[12px]">{a.collab_frequency}</p>
                            </div>
                            <div>
                              <p className="font-dm text-white/30 text-[10px] uppercase tracking-wider">Jours</p>
                              <p className="font-dm text-white/50 text-[12px]">{a.best_days?.join(', ')}</p>
                            </div>
                            {a.best_times && a.best_times.length > 0 && (
                              <div>
                                <p className="font-dm text-white/30 text-[10px] uppercase tracking-wider">Créneaux</p>
                                <p className="font-dm text-white/50 text-[12px]">{a.best_times.join(', ')}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="font-dm text-white/25 text-[12px] mt-2">
                          Inscrit le {new Date(a.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>

                      {/* Action buttons */}
                      {isPending && (
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={() => handleApplicationAction(a.id, 'accept')}
                            className="font-dm text-[12px] font-semibold px-4 py-2 rounded-lg cursor-pointer transition-all hover:brightness-110"
                            style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: 'none' }}
                          >
                            Accepter
                          </button>
                          <button onClick={() => handleApplicationAction(a.id, 'reject')}
                            className="font-dm text-[12px] font-semibold px-4 py-2 rounded-lg cursor-pointer transition-all hover:brightness-110"
                            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none' }}
                          >
                            Refuser
                          </button>
                        </div>
                      )}
                      {isAccepted && (
                        <span className="font-dm text-[11px] text-[#4ade80]/60 flex-shrink-0">
                          Restaurant créé
                        </span>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {tab === 'restaurants' && (
          <div>
            <div className="flex justify-end mb-4">
              <button onClick={() => setShowRestoForm(!showRestoForm)}
                className="font-dm text-[13px] font-semibold px-5 py-2.5 rounded-lg cursor-pointer transition-all"
                style={{ background: '#E8471A', color: '#fff', border: 'none' }}
              >
                {showRestoForm ? 'Annuler' : '+ Ajouter un restaurant'}
              </button>
            </div>

            {showRestoForm && <RestaurantForm onSuccess={() => { setShowRestoForm(false); fetchData() }} />}

            <div className="space-y-3 mt-4">
              {filteredRestos.length === 0 ? (
                <p className="font-dm text-white/30 text-center py-12">Aucun restaurant ajouté</p>
              ) : (
                filteredRestos.map(r => (
                  <div key={r.id} className="rounded-2xl p-5 animate-fade-in" style={{
                    background: c.cardBg,
                    border: `1px solid ${c.divider}`,
                  }}>
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="font-dm text-white font-semibold text-[15px]">{r.name}</h3>
                          <span className="font-dm text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{
                            background: r.is_blocked ? 'rgba(239,68,68,0.1)' : r.is_published ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)',
                            color: r.is_blocked ? '#ef4444' : r.is_published ? '#4ade80' : '#8a8580',
                          }}>
                            {r.is_blocked ? 'Bloqué' : r.is_published ? 'Publié' : 'Brouillon'}
                          </span>
                          {r.virality_bonus && (
                            <span className="font-dm text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{
                              background: 'rgba(232,71,26,0.1)', color: '#E8471A',
                            }}>
                              Prime: {r.virality_bonus}€
                            </span>
                          )}
                        </div>
                        <div className="font-dm text-white/40 text-[13px] space-y-0.5">
                          <p>{r.cuisine_type} &middot; {r.address}, {r.city} {r.arrondissement ? `(${r.arrondissement})` : ''}</p>
                          <p className="text-white/60">{r.offer_description}</p>
                          {r.time_slots && r.time_slots.length > 0 && (
                            <div className="flex gap-1.5 flex-wrap mt-2">
                              {r.time_slots.map((ts, i) => (
                                <span key={i} className="font-dm text-[10px] px-2 py-1 rounded" style={{
                                  background: 'rgba(255,255,255,0.04)',
                                  color: ts.is_active ? '#c8c3b8' : '#555',
                                }}>
                                  {DAYS[ts.day_of_week]} {ts.start_time?.slice(0, 5)}-{ts.end_time?.slice(0, 5)}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="font-dm text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{
                              background: `${(SUBSCRIPTION_PLANS.find(p => p.value === (r.subscription || 'free'))?.color || '#8a8580')}20`,
                              color: SUBSCRIPTION_PLANS.find(p => p.value === (r.subscription || 'free'))?.color || '#8a8580',
                            }}>
                              {SUBSCRIPTION_PLANS.find(p => p.value === (r.subscription || 'free'))?.label || 'Sans abonnement'}
                            </span>
                            {(r.subscription || 'free') !== 'pro' && (
                              <span className="text-white/25 text-[11px]">
                                {r.included_collabs || 0} incluses &middot; {r.extra_collab_price || 35}€/extra
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => setEditingSlotsFor(editingSlotsFor === r.id ? null : r.id)}
                          className="font-dm text-[12px] font-semibold px-4 py-2 rounded-lg cursor-pointer transition-all hover:brightness-110"
                          style={{ background: 'rgba(232,71,26,0.1)', color: '#E8471A', border: 'none' }}
                        >
                          {editingSlotsFor === r.id ? 'Fermer' : 'Créneaux'}
                        </button>
                        <button onClick={() => handleTogglePublish(r.id, r.is_published)}
                          className="font-dm text-[12px] font-semibold px-4 py-2 rounded-lg cursor-pointer transition-all hover:brightness-110"
                          style={{
                            background: r.is_published ? 'rgba(255,255,255,0.06)' : 'rgba(74,222,128,0.15)',
                            color: r.is_published ? '#8a8580' : '#4ade80',
                            border: 'none',
                          }}
                        >
                          {r.is_published ? 'Masquer' : 'Publier'}
                        </button>
                        <button onClick={async () => {
                          await fetch(`/api/admin/restaurants/${r.id}`, {
                            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ isBlocked: !r.is_blocked }),
                          })
                          await fetchData()
                        }}
                          className="font-dm text-[12px] font-semibold px-4 py-2 rounded-lg cursor-pointer transition-all hover:brightness-110"
                          style={{
                            background: r.is_blocked ? 'rgba(74,222,128,0.15)' : 'rgba(239,68,68,0.1)',
                            color: r.is_blocked ? '#4ade80' : '#ef4444',
                            border: 'none',
                          }}
                        >
                          {r.is_blocked ? 'Débloquer' : 'Bloquer'}
                        </button>
                        <button onClick={() => handleResetRestoPassword(r.id, r.name)}
                          className="font-dm text-[12px] font-semibold px-4 py-2 rounded-lg cursor-pointer transition-all hover:brightness-110"
                          style={{ background: 'rgba(255,255,255,0.06)', color: '#8a8580', border: 'none' }}
                        >
                          Reset MDP
                        </button>
                      </div>
                    </div>

                    {/* Expandable slots editor */}
                    {editingSlotsFor === r.id && (
                      <div className="mt-4 pt-4 animate-fade-in" style={{ borderTop: `1px solid ${c.divider}` }}>
                        <p className="font-dm text-white/50 text-[11px] uppercase tracking-[0.06em] mb-3">Gérer les créneaux</p>

                        {/* Existing slots — split recurring vs specific */}
                        {r.time_slots && r.time_slots.length > 0 && (() => {
                          const recurring = r.time_slots.filter((ts: TimeSlot) => !ts.specific_date)
                          const specific = r.time_slots.filter((ts: TimeSlot) => ts.specific_date)
                          return (
                            <div className="mb-4">
                              {recurring.length > 0 && (
                                <div className="mb-3">
                                  <p className="font-dm text-white/30 text-[10px] uppercase tracking-wider mb-1.5">Récurrents (chaque semaine)</p>
                                  <div className="space-y-1.5">
                                    {recurring.map((ts: TimeSlot) => (
                                      <div key={ts.id} className="flex items-center justify-between gap-2 rounded-lg px-3 py-2" style={{
                                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)',
                                      }}>
                                        <span className="font-dm text-white/60 text-[12px]">
                                          {DAYS[ts.day_of_week]} {ts.start_time?.slice(0, 5)}-{ts.end_time?.slice(0, 5)}
                                          <span className="text-white/30 ml-2">(max {ts.max_bookings})</span>
                                        </span>
                                        <button onClick={() => handleDeleteSlot(r.id, ts.id)}
                                          className="font-dm text-red-400/60 hover:text-red-400 text-[18px] cursor-pointer transition-colors leading-none"
                                          style={{ background: 'none', border: 'none', padding: '0 4px' }}>
                                          &times;
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              {specific.length > 0 && (
                                <div>
                                  <p className="font-dm text-white/30 text-[10px] uppercase tracking-wider mb-1.5">Dates spécifiques</p>
                                  <div className="space-y-1.5">
                                    {specific.map((ts: TimeSlot) => (
                                      <div key={ts.id} className="flex items-center justify-between gap-2 rounded-lg px-3 py-2" style={{
                                        background: 'rgba(232,71,26,0.04)', border: '1px solid rgba(232,71,26,0.08)',
                                      }}>
                                        <span className="font-dm text-white/60 text-[12px]">
                                          <span className="text-[#E8471A]">{new Date(ts.specific_date!).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                                          {' '}{ts.start_time?.slice(0, 5)}-{ts.end_time?.slice(0, 5)}
                                          <span className="text-white/30 ml-2">(max {ts.max_bookings})</span>
                                        </span>
                                        <button onClick={() => handleDeleteSlot(r.id, ts.id)}
                                          className="font-dm text-red-400/60 hover:text-red-400 text-[18px] cursor-pointer transition-colors leading-none"
                                          style={{ background: 'none', border: 'none', padding: '0 4px' }}>
                                          &times;
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })()}

                        {/* Subscription plan */}
                        <div className="mb-4 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                          <p className="font-dm text-white/40 text-[10px] uppercase tracking-[0.06em] mb-3">Abonnement restaurant</p>
                          <div className="flex flex-wrap gap-2">
                            {SUBSCRIPTION_PLANS.map(plan => (
                              <button key={plan.value}
                                onClick={async () => {
                                  await fetch(`/api/admin/restaurants/${r.id}`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ subscription: plan.value }),
                                  })
                                  await fetchData()
                                }}
                                className="font-dm text-[11px] font-semibold px-3 py-2 rounded-lg cursor-pointer transition-all hover:brightness-110"
                                style={{
                                  background: (r.subscription || 'free') === plan.value ? `${plan.color}25` : 'rgba(255,255,255,0.03)',
                                  color: (r.subscription || 'free') === plan.value ? plan.color : (c.isLight ? '#999' : 'rgba(255,255,255,0.3)'),
                                  border: `1px solid ${(r.subscription || 'free') === plan.value ? `${plan.color}40` : 'rgba(255,255,255,0.06)'}`,
                                }}>
                                {plan.label}
                              </button>
                            ))}
                          </div>
                          {(() => {
                            const plan = SUBSCRIPTION_PLANS.find(p => p.value === (r.subscription || 'free'))!
                            const usage = r.month_usage || 0
                            const included = plan.included
                            const extras = Math.max(0, usage - included)
                            const extraCost = extras * plan.extra
                            return (
                              <div className="mt-2 p-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-dm text-white/30 text-[10px] uppercase tracking-wider">Ce mois</span>
                                  <span className="font-dm text-white/50 text-[12px]">
                                    {usage} collab{usage !== 1 ? 's' : ''}
                                    {(r.subscription || 'free') !== 'pro' && <span className="text-white/25"> / {included} incluse{included !== 1 ? 's' : ''}</span>}
                                  </span>
                                </div>
                                {extras > 0 && (
                                  <p className="font-dm text-[#E8471A] text-[11px] font-semibold">
                                    {extras} extra{extras !== 1 ? 's' : ''} &times; {plan.extra}€ = {extraCost}€ à facturer
                                  </p>
                                )}
                                {(r.subscription || 'free') === 'pro' && (
                                  <p className="font-dm text-white/20 text-[10px]">Collabs illimitées</p>
                                )}
                              </div>
                            )
                          })()}
                        </div>

                        {/* Add slot — toggle between recurring and specific date */}
                        <div className="flex gap-1 rounded-lg p-0.5 mb-3" style={{ background: 'rgba(255,255,255,0.03)', display: 'inline-flex' }}>
                          <button onClick={() => setSlotMode('recurring')}
                            className="font-dm text-[11px] font-semibold px-3 py-1.5 rounded-md cursor-pointer transition-all"
                            style={{
                              background: slotMode === 'recurring' ? 'rgba(255,255,255,0.08)' : 'transparent',
                              color: slotMode === 'recurring' ? (c.isLight ? '#111' : '#fff') : (c.isLight ? '#999' : 'rgba(255,255,255,0.3)'),
                              border: 'none',
                            }}>
                            Chaque semaine
                          </button>
                          <button onClick={() => setSlotMode('date')}
                            className="font-dm text-[11px] font-semibold px-3 py-1.5 rounded-md cursor-pointer transition-all"
                            style={{
                              background: slotMode === 'date' ? 'rgba(232,71,26,0.15)' : 'transparent',
                              color: slotMode === 'date' ? '#E8471A' : (c.isLight ? '#999' : 'rgba(255,255,255,0.3)'),
                              border: 'none',
                            }}>
                            Date précise
                          </button>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {slotMode === 'recurring' ? (
                            <select value={newSlot.dayOfWeek} onChange={e => setNewSlot(p => ({ ...p, dayOfWeek: e.target.value }))}
                              className="font-dm rounded-lg text-[12px] text-white/90 outline-none cursor-pointer"
                              style={{ height: 36, padding: '0 8px', background: c.inputBg, border: `1px solid ${c.cardBorder}` }}>
                              {DAYS.map((d, di) => <option key={di} value={di}>{d}</option>)}
                            </select>
                          ) : (
                            <input type="date" value={newSlot.date} onChange={e => setNewSlot(p => ({ ...p, date: e.target.value }))}
                              min={new Date().toISOString().split('T')[0]}
                              className="font-dm rounded-lg text-[12px] text-white/90 outline-none"
                              style={{ height: 36, padding: '0 8px', background: c.inputBg, border: `1px solid ${c.cardBorder}` }} />
                          )}
                          <input type="time" value={newSlot.startTime} onChange={e => setNewSlot(p => ({ ...p, startTime: e.target.value }))}
                            className="font-dm rounded-lg text-[12px] text-white/90 outline-none"
                            style={{ height: 36, padding: '0 8px', background: c.inputBg, border: `1px solid ${c.cardBorder}`, width: 90 }} />
                          <span className="font-dm text-white/30 text-[11px]">-</span>
                          <input type="time" value={newSlot.endTime} onChange={e => setNewSlot(p => ({ ...p, endTime: e.target.value }))}
                            className="font-dm rounded-lg text-[12px] text-white/90 outline-none"
                            style={{ height: 36, padding: '0 8px', background: c.inputBg, border: `1px solid ${c.cardBorder}`, width: 90 }} />
                          <input type="number" value={newSlot.maxBookings} onChange={e => setNewSlot(p => ({ ...p, maxBookings: e.target.value }))}
                            placeholder="Max" className="font-dm rounded-lg text-[12px] text-white/90 outline-none"
                            style={{ height: 36, padding: '0 8px', background: c.inputBg, border: `1px solid ${c.cardBorder}`, width: 60 }} />
                          <button onClick={() => handleAddSlot(r.id)}
                            className="font-dm text-[12px] font-semibold px-4 py-2 rounded-lg cursor-pointer transition-all hover:brightness-110"
                            style={{ background: '#E8471A', color: '#fff', border: 'none' }}>
                            + Ajouter
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* === COLLABS TAB === */}
        {tab === 'collabs' && (
          <div>
            {!collabsLoaded && (
              <button onClick={async () => {
                const res = await fetch('/api/admin/collabs')
                if (res.ok) { const data = await res.json(); setCollabs(data.bookings || []) }
                setCollabsLoaded(true)
              }} className="font-dm text-[13px] font-semibold px-5 py-2.5 rounded-lg cursor-pointer mb-4"
                style={{ background: '#E8471A', color: '#fff', border: 'none' }}>
                Charger les collabs
              </button>
            )}
            {collabsLoaded && collabs.length === 0 && (
              <p className="font-dm text-white/30 text-center py-12">Aucune collab</p>
            )}
            {collabs.length > 0 && (
              <div className="space-y-2">
                {collabs
                  .filter(cb => !sq || [cb.creator_first_name, cb.creator_last_name, cb.creator_email, cb.creator_tiktok, cb.restaurant_name, cb.restaurant_city].some((f: string) => f?.toLowerCase().includes(sq)))
                  .map((cb: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                  const statusColors: Record<string, { bg: string; text: string }> = {
                    pending: { bg: 'rgba(217,79,42,0.1)', text: '#D94F2A' },
                    confirmed: { bg: 'rgba(74,222,128,0.1)', text: '#4ade80' },
                    refused: { bg: 'rgba(239,68,68,0.1)', text: '#ef4444' },
                    cancelled: { bg: 'rgba(255,255,255,0.05)', text: '#8a8580' },
                    completed: { bg: 'rgba(74,222,128,0.15)', text: '#22c55e' },
                    awaiting_payment: { bg: 'rgba(252,250,166,0.1)', text: '#fcfaa6' },
                  }
                  const sc = statusColors[cb.status] || statusColors.pending
                  const dateStr = cb.booking_date ? String(cb.booking_date).split('T')[0] : ''
                  return (
                    <div key={cb.id} className="rounded-xl p-4 flex items-center justify-between gap-3 flex-wrap" style={{
                      background: c.cardBg, border: `1px solid ${c.divider}`,
                    }}>
                      <div className="flex-1 min-w-0">
                        <p className="font-dm text-[14px] font-semibold" style={{ color: c.text }}>
                          {cb.creator_first_name} {cb.creator_last_name}
                          <span className="text-white/30 mx-2">&rarr;</span>
                          {cb.restaurant_name}
                        </p>
                        <p className="font-dm text-[12px]" style={{ color: c.textMuted }}>
                          {dateStr} &middot; {cb.slot_start_time?.slice(0, 5) || ''} - {cb.slot_end_time?.slice(0, 5) || ''} &middot; {cb.restaurant_city}
                        </p>
                        {cb.post_link && (
                          <a href={cb.post_link} target="_blank" rel="noopener" className="font-dm text-[11px] text-[#E8471A] hover:brightness-125" style={{ textDecoration: 'none' }}>
                            Voir le post
                          </a>
                        )}
                      </div>
                      <span className="font-dm text-[11px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0" style={{
                        background: sc.bg, color: sc.text,
                      }}>
                        {cb.status}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Claims tab */}
        {tab === 'claims' && (
          <div>
            {!claimsLoaded && (
              <button onClick={async () => {
                const res = await fetch('/api/admin/claims')
                if (res.ok) { const data = await res.json(); setClaims(data.claims || []) }
                setClaimsLoaded(true)
              }} className="font-dm text-[13px] font-semibold px-5 py-2.5 rounded-lg cursor-pointer mb-4"
                style={{ background: '#E8471A', color: '#fff', border: 'none' }}>
                Charger les claims
              </button>
            )}
            {claimsLoaded && claims.length === 0 && (
              <p className="font-dm text-[14px]" style={{ color: c.textMuted }}>Aucune réclamation de prime</p>
            )}
            {claims.map((cl) => (
              <div key={cl.booking_id} className="rounded-xl p-4 mb-3" style={{ background: c.cardBg, border: `1px solid ${c.divider}` }}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-dm font-semibold text-[14px]" style={{ color: c.text }}>@{cl.username || cl.first_name} → {cl.restaurant_name}</p>
                    <p className="font-dm text-[12px]" style={{ color: c.textMuted }}>{cl.creator_email} · {new Date(cl.booking_date).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <span className="font-dm text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{
                    background: cl.claim_status === 'pending' ? 'rgba(217,79,42,0.1)' : cl.claim_status === 'approved' ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)',
                    color: cl.claim_status === 'pending' ? '#D94F2A' : cl.claim_status === 'approved' ? '#4ade80' : '#ef4444',
                  }}>{cl.claim_status}</span>
                </div>

                {cl.claimed_tier && (
                  <p className="font-dm text-[13px] mb-1" style={{ color: c.text }}>
                    Palier réclamé : &gt; {((cl.claimed_tier as {views:number}).views / 1000).toFixed(0)}k vues → {(cl.claimed_tier as {bonus:number}).bonus}€
                    <span className="text-[11px]" style={{ color: c.textMuted }}> (75% créateur = {Math.round((cl.claimed_tier as {bonus:number}).bonus * 0.75)}€)</span>
                  </p>
                )}

                {cl.post_link && (
                  <a href={cl.post_link} target="_blank" rel="noopener noreferrer" className="font-dm text-[12px] text-[#E8471A] underline block mb-2" style={{ textUnderlineOffset: 2 }}>
                    Voir le post
                  </a>
                )}

                <p className="font-dm text-[11px] mb-2" style={{ color: c.textMuted }}>
                  Stripe Connect : {cl.stripe_onboarding_complete ? '✓ Connecté' : '✗ Non connecté'}
                </p>

                {cl.claim_status === 'pending' && (
                  <div className="flex gap-2 mt-2">
                    <button onClick={async () => {
                      const res = await fetch('/api/admin/claims', {
                        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ bookingId: cl.booking_id, action: 'approve' }),
                      })
                      if (res.ok) setClaims(prev => prev.map(c2 => c2.booking_id === cl.booking_id ? { ...c2, claim_status: 'approved' } : c2))
                    }} className="font-dm text-[11px] font-semibold px-4 py-1.5 rounded-lg cursor-pointer"
                      style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: 'none' }}>
                      Approuver + Payer
                    </button>
                    <button onClick={async () => {
                      const res = await fetch('/api/admin/claims', {
                        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ bookingId: cl.booking_id, action: 'reject' }),
                      })
                      if (res.ok) setClaims(prev => prev.map(c2 => c2.booking_id === cl.booking_id ? { ...c2, claim_status: 'rejected' } : c2))
                    }} className="font-dm text-[11px] font-semibold px-4 py-1.5 rounded-lg cursor-pointer"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none' }}>
                      Refuser
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === 'analytics' && (
          <div>
            {!analytics && !analyticsLoading && (
              <button onClick={async () => {
                setAnalyticsLoading(true)
                try {
                  const res = await fetch('/api/admin/analytics')
                  if (res.ok) setAnalytics(await res.json())
                } finally { setAnalyticsLoading(false) }
              }} className="font-dm text-[13px] font-semibold px-6 py-3 rounded-lg cursor-pointer"
                style={{ background: '#E8471A', color: '#fff', border: 'none' }}>
                Charger les analytics
              </button>
            )}
            {analyticsLoading && <p className="font-dm text-white/40 text-[13px]">Chargement...</p>}
            {analytics && (
              <div className="space-y-6 animate-fade-in">
                {/* KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Créateurs', value: analytics.creators?.total || 0, sub: `${analytics.creators?.active || 0} actifs` },
                    { label: 'Restaurants', value: analytics.restaurants?.total || 0, sub: `${analytics.restaurants?.published || 0} publiés` },
                    { label: 'Réservations', value: analytics.bookings?.total || 0, sub: `${analytics.bookings?.completed || 0} terminées` },
                    { label: 'Candidatures', value: analytics.applications?.total || 0, sub: `${analytics.applications?.last_7_days || 0} (7j)` },
                  ].map((kpi, i) => (
                    <div key={i} className="rounded-2xl p-5" style={{ background: c.cardBg, border: `1px solid ${c.divider}` }}>
                      <p className="font-dm text-white/40 text-[11px] uppercase tracking-wider mb-1">{kpi.label}</p>
                      <p className="font-dm text-[28px] font-bold" style={{ color: '#E8471A' }}>{kpi.value}</p>
                      <p className="font-dm text-white/30 text-[11px]">{kpi.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Review stats */}
                {analytics.reviewStats && (
                  <div className="rounded-2xl p-5" style={{ background: c.cardBg, border: `1px solid ${c.divider}` }}>
                    <p className="font-dm text-white/50 text-[11px] uppercase tracking-wider mb-2">Avis</p>
                    <div className="flex gap-6">
                      <div>
                        <p className="font-dm text-[22px] font-bold" style={{ color: '#4ade80' }}>
                          {analytics.reviewStats.avg_rating ? `${analytics.reviewStats.avg_rating}/5` : '—'}
                        </p>
                        <p className="font-dm text-white/30 text-[11px]">Note moyenne</p>
                      </div>
                      <div>
                        <p className="font-dm text-[22px] font-bold" style={{ color: c.text }}>{analytics.reviewStats.total_reviews || 0}</p>
                        <p className="font-dm text-white/30 text-[11px]">Avis total</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Monthly bookings */}
                {analytics.monthlyBookings?.length > 0 && (
                  <div className="rounded-2xl p-5" style={{ background: c.cardBg, border: `1px solid ${c.divider}` }}>
                    <p className="font-dm text-white/50 text-[11px] uppercase tracking-wider mb-3">Réservations par mois</p>
                    <div className="flex items-end gap-2" style={{ height: 120 }}>
                      {analytics.monthlyBookings.map((m: { month: string; count: number; completed: number }, i: number) => {
                        const max = Math.max(...analytics.monthlyBookings.map((x: { count: number }) => x.count), 1)
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-full rounded-t" style={{ height: `${(m.count / max) * 100}px`, background: '#E8471A', minHeight: 4 }} />
                            <span className="font-dm text-white/30 text-[9px]">{m.month.slice(5)}</span>
                            <span className="font-dm text-white/50 text-[10px] font-semibold">{m.count}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Monthly signups */}
                {analytics.monthlySignups?.length > 0 && (
                  <div className="rounded-2xl p-5" style={{ background: c.cardBg, border: `1px solid ${c.divider}` }}>
                    <p className="font-dm text-white/50 text-[11px] uppercase tracking-wider mb-3">Inscriptions créateurs par mois</p>
                    <div className="flex items-end gap-2" style={{ height: 120 }}>
                      {analytics.monthlySignups.map((m: { month: string; count: number }, i: number) => {
                        const max = Math.max(...analytics.monthlySignups.map((x: { count: number }) => x.count), 1)
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-full rounded-t" style={{ height: `${(m.count / max) * 100}px`, background: '#4ade80', minHeight: 4 }} />
                            <span className="font-dm text-white/30 text-[9px]">{m.month.slice(5)}</span>
                            <span className="font-dm text-white/50 text-[10px] font-semibold">{m.count}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Top restaurants & creators */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl p-5" style={{ background: c.cardBg, border: `1px solid ${c.divider}` }}>
                    <p className="font-dm text-white/50 text-[11px] uppercase tracking-wider mb-3">Top restaurants</p>
                    {(analytics.topRestaurants || []).slice(0, 5).map((r: { name: string; city: string; booking_count: number; completed_count: number }, i: number) => (
                      <div key={i} className="flex items-center justify-between py-1.5" style={{ borderBottom: `1px solid ${c.divider}` }}>
                        <div>
                          <p className="font-dm text-white/80 text-[12px] font-semibold">{r.name}</p>
                          <p className="font-dm text-white/30 text-[10px]">{r.city}</p>
                        </div>
                        <span className="font-dm text-[#E8471A] text-[13px] font-bold">{r.booking_count}</span>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-2xl p-5" style={{ background: c.cardBg, border: `1px solid ${c.divider}` }}>
                    <p className="font-dm text-white/50 text-[11px] uppercase tracking-wider mb-3">Top créateurs</p>
                    {(analytics.topCreators || []).slice(0, 5).map((cr: { first_name: string; last_name: string; tiktok_username: string; booking_count: number; referral_count: number }, i: number) => (
                      <div key={i} className="flex items-center justify-between py-1.5" style={{ borderBottom: `1px solid ${c.divider}` }}>
                        <div>
                          <p className="font-dm text-white/80 text-[12px] font-semibold">{cr.first_name} {cr.last_name}</p>
                          <p className="font-dm text-white/30 text-[10px]">{cr.tiktok_username} · {cr.referral_count} refs</p>
                        </div>
                        <span className="font-dm text-[#E8471A] text-[13px] font-bold">{cr.booking_count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subscription distribution */}
                {analytics.subscriptions?.length > 0 && (
                  <div className="rounded-2xl p-5" style={{ background: c.cardBg, border: `1px solid ${c.divider}` }}>
                    <p className="font-dm text-white/50 text-[11px] uppercase tracking-wider mb-3">Abonnements</p>
                    <div className="flex gap-4 flex-wrap">
                      {analytics.subscriptions.map((s: { plan: string; count: number }, i: number) => (
                        <div key={i} className="rounded-lg px-4 py-2" style={{ background: c.inputBg }}>
                          <p className="font-dm text-white/60 text-[11px] uppercase">{s.plan}</p>
                          <p className="font-dm text-[18px] font-bold" style={{ color: c.text }}>{s.count}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Restaurant creation form ── */
function RestaurantForm({ onSuccess }: { onSuccess: () => void }) {
  const { c } = useTheme()
  const [form, setForm] = useState({
    name: '', cuisineType: '', address: '', city: '', arrondissement: '',
    offerDescription: '', viralityBonus: '', photos: [] as string[],
    maxBookingsPerWeek: '3', maxBookingsPerDay: '1', isPublished: false,
  })
  const [slots, setSlots] = useState<{ dayOfWeek: string; startTime: string; endTime: string; maxBookings: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string, v: string | boolean) => setForm(p => ({ ...p, [k]: v }))

  const addSlot = () => {
    setSlots(p => [...p, { dayOfWeek: '1', startTime: '12:00', endTime: '14:00', maxBookings: '1' }])
  }

  const updateSlot = (i: number, k: string, v: string) => {
    setSlots(p => p.map((s, j) => j === i ? { ...s, [k]: v } : s))
  }

  const removeSlot = (i: number) => setSlots(p => p.filter((_, j) => j !== i))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.cuisineType || !form.address || !form.city || !form.offerDescription) {
      setError('Remplis les champs obligatoires')
      return
    }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/restaurants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          viralityBonus: form.viralityBonus ? parseFloat(form.viralityBonus) : null,
          maxBookingsPerWeek: parseInt(form.maxBookingsPerWeek),
          maxBookingsPerDay: parseInt(form.maxBookingsPerDay),
          timeSlots: slots.map(s => ({
            dayOfWeek: parseInt(s.dayOfWeek),
            startTime: s.startTime,
            endTime: s.endTime,
            maxBookings: parseInt(s.maxBookings),
          })),
        }),
      })

      if (!res.ok) throw new Error('Failed')
      onSuccess()
    } catch {
      setError('Erreur lors de la création')
      setLoading(false)
    }
  }

  const inputStyle = {
    height: 44,
    padding: '0 14px',
    background: c.inputBg,
    border: `1px solid ${c.cardBorder}`,
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl p-6 mb-4" style={{
      background: c.cardBg,
      border: '1px solid rgba(232,71,26,0.15)',
    }}>
      <h3 className="font-dm text-white font-semibold text-[16px] mb-5">Nouveau restaurant</h3>

      <div className="grid gap-4 sm:grid-cols-2 mb-4">
        <div>
          <label className="font-dm text-white/50 text-[11px] uppercase tracking-[0.06em] block mb-1.5">Nom *</label>
          <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Le Café des Amis"
            className="font-dm w-full rounded-lg text-[13px] text-white/90 placeholder:text-white/20 outline-none" style={inputStyle} />
        </div>
        <div>
          <label className="font-dm text-white/50 text-[11px] uppercase tracking-[0.06em] block mb-1.5">Type de cuisine *</label>
          <input value={form.cuisineType} onChange={e => set('cuisineType', e.target.value)} placeholder="Français, Italien..."
            className="font-dm w-full rounded-lg text-[13px] text-white/90 placeholder:text-white/20 outline-none" style={inputStyle} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-4">
        <div>
          <label className="font-dm text-white/50 text-[11px] uppercase tracking-[0.06em] block mb-1.5">Adresse *</label>
          <input value={form.address} onChange={e => set('address', e.target.value)} placeholder="12 rue de la Paix"
            className="font-dm w-full rounded-lg text-[13px] text-white/90 placeholder:text-white/20 outline-none" style={inputStyle} />
        </div>
        <div>
          <label className="font-dm text-white/50 text-[11px] uppercase tracking-[0.06em] block mb-1.5">Ville *</label>
          <input value={form.city} onChange={e => set('city', e.target.value)} placeholder="Paris"
            className="font-dm w-full rounded-lg text-[13px] text-white/90 placeholder:text-white/20 outline-none" style={inputStyle} />
        </div>
        <div>
          <label className="font-dm text-white/50 text-[11px] uppercase tracking-[0.06em] block mb-1.5">Arrondissement</label>
          <input value={form.arrondissement} onChange={e => set('arrondissement', e.target.value)} placeholder="11ème"
            className="font-dm w-full rounded-lg text-[13px] text-white/90 placeholder:text-white/20 outline-none" style={inputStyle} />
        </div>
      </div>

      <div className="mb-4">
        <label className="font-dm text-white/50 text-[11px] uppercase tracking-[0.06em] block mb-1.5">Offre pour les créateurs *</label>
        <textarea value={form.offerDescription} onChange={e => set('offerDescription', e.target.value)}
          placeholder="Repas pour 2 personnes + dessert"
          className="font-dm w-full rounded-lg text-[13px] text-white/90 placeholder:text-white/20 outline-none resize-none"
          style={{ ...inputStyle, height: 80, padding: '12px 14px' }} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-4">
        <div>
          <label className="font-dm text-white/50 text-[11px] uppercase tracking-[0.06em] block mb-1.5">Prime viralité (€)</label>
          <input type="number" value={form.viralityBonus} onChange={e => set('viralityBonus', e.target.value)} placeholder="50"
            className="font-dm w-full rounded-lg text-[13px] text-white/90 placeholder:text-white/20 outline-none" style={inputStyle} />
        </div>
        <div>
          <label className="font-dm text-white/50 text-[11px] uppercase tracking-[0.06em] block mb-1.5">Max/semaine</label>
          <input type="number" value={form.maxBookingsPerWeek} onChange={e => set('maxBookingsPerWeek', e.target.value)}
            className="font-dm w-full rounded-lg text-[13px] text-white/90 outline-none" style={inputStyle} />
        </div>
        <div>
          <label className="font-dm text-white/50 text-[11px] uppercase tracking-[0.06em] block mb-1.5">Max/jour</label>
          <input type="number" value={form.maxBookingsPerDay} onChange={e => set('maxBookingsPerDay', e.target.value)}
            className="font-dm w-full rounded-lg text-[13px] text-white/90 outline-none" style={inputStyle} />
        </div>
      </div>

      {/* Time slots */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <label className="font-dm text-white/50 text-[11px] uppercase tracking-[0.06em]">Créneaux disponibles</label>
          <button type="button" onClick={addSlot}
            className="font-dm text-[12px] text-[#E8471A] cursor-pointer hover:brightness-125 transition-all"
            style={{ background: 'none', border: 'none' }}
          >
            + Ajouter un créneau
          </button>
        </div>
        {slots.map((slot, i) => (
          <div key={i} className="grid grid-cols-5 gap-2 mb-2 items-center">
            <select value={slot.dayOfWeek} onChange={e => updateSlot(i, 'dayOfWeek', e.target.value)}
              className="font-dm rounded-lg text-[12px] text-white/90 outline-none col-span-1 cursor-pointer"
              style={{ ...inputStyle, height: 38, padding: '0 8px' }}
            >
              {DAYS.map((d, di) => <option key={di} value={di}>{d}</option>)}
            </select>
            <input type="time" value={slot.startTime} onChange={e => updateSlot(i, 'startTime', e.target.value)}
              className="font-dm rounded-lg text-[12px] text-white/90 outline-none" style={{ ...inputStyle, height: 38, padding: '0 8px' }} />
            <input type="time" value={slot.endTime} onChange={e => updateSlot(i, 'endTime', e.target.value)}
              className="font-dm rounded-lg text-[12px] text-white/90 outline-none" style={{ ...inputStyle, height: 38, padding: '0 8px' }} />
            <input type="number" value={slot.maxBookings} onChange={e => updateSlot(i, 'maxBookings', e.target.value)}
              placeholder="Max" className="font-dm rounded-lg text-[12px] text-white/90 outline-none" style={{ ...inputStyle, height: 38, padding: '0 8px' }} />
            <button type="button" onClick={() => removeSlot(i)}
              className="font-dm text-red-400 text-[12px] cursor-pointer hover:text-red-300"
              style={{ background: 'none', border: 'none' }}>
              &times;
            </button>
          </div>
        ))}
      </div>

      {/* Publish toggle */}
      <label className="flex items-center gap-3 mb-5 cursor-pointer">
        <div onClick={() => set('isPublished', !form.isPublished)}
          className="w-10 h-5 rounded-full relative transition-all" style={{
            background: form.isPublished ? '#E8471A' : 'rgba(255,255,255,0.1)',
          }}>
          <div className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all" style={{
            left: form.isPublished ? 22 : 2,
          }} />
        </div>
        <span className="font-dm text-white/60 text-[13px]">
          {form.isPublished ? 'Publié (visible par les créateurs)' : 'Brouillon (non visible)'}
        </span>
      </label>

      {error && (
        <div className="font-dm text-[13px] text-red-400 mb-4 p-3 rounded-lg" style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.15)',
        }}>{error}</div>
      )}

      <button type="submit" disabled={loading}
        className="font-dm text-[13px] font-semibold px-8 py-2.5 rounded-lg cursor-pointer transition-all disabled:opacity-50"
        style={{ background: '#E8471A', color: '#fff', border: 'none' }}
      >
        {loading ? 'Création...' : 'Créer le restaurant'}
      </button>
    </form>
  )
}
