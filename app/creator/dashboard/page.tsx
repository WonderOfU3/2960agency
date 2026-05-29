'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import LanguageToggle from '@/components/LanguageToggle'
import ThemeToggle from '@/components/ThemeToggle'
import NotificationBell from '@/components/NotificationBell'
import { useTheme } from '@/context/ThemeContext'
import { useToast } from '@/components/ui/Toast'

const T = {
  fr: {
    hi: 'Salut,', logout: 'Déconnexion',
    tabOffers: 'Offres restos', tabMessages: 'Messages', tabBookings: 'Mes réservations', tabProfile: 'Mon profil', tabCode: 'Mon code', tabSettings: 'Réglages',
    settingsProfile: 'Informations personnelles', settingsSocials: 'Réseaux sociaux',
    settingsPassword: 'Changer le mot de passe', settingsEmail: 'Changer l\'email',
    currentPassword: 'Mot de passe actuel', newPassword: 'Nouveau mot de passe',
    save: 'Enregistrer', saved: 'Enregistré !',
    noConversations: 'Aucune conversation pour le moment', noConvSub: 'Quand tu réserveras un créneau, tu pourras discuter avec le restaurant ici.',
    noOffers: 'Aucune offre disponible pour le moment',
    offer: "Ce qu'ils offrent", bookSlot: 'Réserver un créneau', slotsComingSoon: 'Créneaux bientôt disponibles',
    noBookings: 'Aucune réservation pour le moment',
    confirmed: 'Confirmé', completed: 'Terminé', cancelled: 'Annulé',
    ambassadorTitle: 'Ton code ambassadeur',
    ambassadorText: "Partage ce code avec des restaurants. Si 5 restaurants s'inscrivent avec ton code, tu gagnes 100€ !",
    copyCode: 'Copier ton code', codeCopied: 'Code copié !',
    progress: 'Progression',
    eligible: 'Tu es éligible aux 100€ ! Contacte-nous pour récupérer ta récompense.',
    paid: 'Récompense payée !',
    bookTitle: 'Réserver un créneau', bookDate: 'Choisir une date (max 5 jours)',
    noDate: 'Aucune date disponible pour ce créneau dans les 5 prochains jours',
    cancel: 'Annuler', confirm: 'Confirmer', booking: 'Réservation...',
    prime: 'prime',
    message: 'Message', send: 'Envoyer', sending: 'Envoi...', messagePh: 'Écrire un message...',
    noMessages: 'Pas encore de messages', closeChat: 'Fermer',
    // Profile tab
    profileTitle: 'Mon profil public', showcaseTitle: 'Mes meilleurs posts',
    showcaseHint: 'Choisis tes 2 meilleures publications — c\'est ce que le restaurant verra en premier.',
    uploadShowcase: 'Ajouter un post', showcaseSaved: 'Profil mis à jour !',
    // Contract modal
    viewContract: 'Voir le contrat', contractTitle: 'Fiche Collaboration',
    contractPeople: 'Nombre de personnes', contractDeadline: 'Date limite de publication',
    contractDuration: 'Durée de maintien en ligne', contractMention: 'Mention obligatoire',
    contractMentionText: 'Collaboration commerciale',
    contractViralityNote: '75% revient au créateur, 25% à 2960',
    contractCGU: 'Les Conditions Générales de la plateforme 2960 Agency s\'appliquent à l\'ensemble de cette collaboration.',
    // Post submission
    submitPost: 'Soumettre le lien', postLinkPh: 'https://www.tiktok.com/@...',
    daysToPublish: 'jours pour publier', postSubmitted: 'Post soumis',
    // Claim
    claimPrime: 'Réclamer ma prime', selectTier: 'Sélectionne le palier atteint',
    claimPending: 'Réclamation en cours', claimApproved: 'Prime approuvée', claimRejected: 'Prime refusée',
    // Stripe Connect
    connectBank: 'Connecter mon compte bancaire', connectBankDesc: 'Pour recevoir tes primes de viralité',
    bankConnected: 'Compte bancaire connecté', finishSetup: 'Finaliser la configuration',
    overdueWarning: 'Tu as un post en retard !',
    overdueText: 'Tu ne peux pas faire de nouvelles réservations tant que tu n\'as pas soumis le lien de ta publication.',
    overdueGoTo: 'Voir mes réservations',
    violationsCount: 'avertissement(s) sur 3',
  },
  en: {
    hi: 'Hey,', logout: 'Log out',
    tabOffers: 'Restaurant offers', tabMessages: 'Messages', tabBookings: 'My bookings', tabProfile: 'My profile', tabCode: 'My code', tabSettings: 'Settings',
    settingsProfile: 'Personal information', settingsSocials: 'Social media',
    settingsPassword: 'Change password', settingsEmail: 'Change email',
    currentPassword: 'Current password', newPassword: 'New password',
    save: 'Save', saved: 'Saved!',
    noConversations: 'No conversations yet', noConvSub: 'When you book a slot, you can chat with the restaurant here.',
    noOffers: 'No offers available at the moment',
    offer: 'What they offer', bookSlot: 'Book a slot', slotsComingSoon: 'Slots coming soon',
    noBookings: 'No bookings yet',
    confirmed: 'Confirmed', completed: 'Completed', cancelled: 'Cancelled',
    ambassadorTitle: 'Your ambassador code',
    ambassadorText: 'Share this code with restaurants. If 5 restaurants sign up with your code, you earn €100!',
    copyCode: 'Copy your code', codeCopied: 'Code copied!',
    progress: 'Progress',
    eligible: "You're eligible for €100! Contact us to claim your reward.",
    paid: 'Reward paid!',
    bookTitle: 'Book a slot', bookDate: 'Choose a date (max 5 days)',
    noDate: 'No dates available for this slot in the next 5 days',
    cancel: 'Cancel', confirm: 'Confirm', booking: 'Booking...',
    prime: 'bonus',
    message: 'Message', send: 'Send', sending: 'Sending...', messagePh: 'Write a message...',
    noMessages: 'No messages yet', closeChat: 'Close',
    profileTitle: 'My public profile', showcaseTitle: 'My best posts',
    showcaseHint: 'Pick your 2 best posts — this is what restaurants will see first.',
    uploadShowcase: 'Add a post', showcaseSaved: 'Profile updated!',
    viewContract: 'View contract', contractTitle: 'Collaboration Sheet',
    contractPeople: 'Number of people', contractDeadline: 'Publication deadline',
    contractDuration: 'Online duration', contractMention: 'Required mention',
    contractMentionText: 'Commercial collaboration',
    contractViralityNote: '75% goes to the creator, 25% to 2960',
    contractCGU: 'The General Terms of the 2960 Agency platform apply to this entire collaboration.',
    submitPost: 'Submit link', postLinkPh: 'https://www.tiktok.com/@...',
    daysToPublish: 'days to publish', postSubmitted: 'Post submitted',
    claimPrime: 'Claim my bonus', selectTier: 'Select the tier reached',
    claimPending: 'Claim pending', claimApproved: 'Bonus approved', claimRejected: 'Bonus rejected',
    connectBank: 'Connect bank account', connectBankDesc: 'To receive your virality bonuses',
    bankConnected: 'Bank account connected', finishSetup: 'Finish setup',
    overdueWarning: 'You have an overdue post!',
    overdueText: 'You cannot make new bookings until you submit the link to your publication.',
    overdueGoTo: 'View my bookings',
    violationsCount: 'warning(s) out of 3',
  },
}

interface TimeSlot {
  id: number
  day_of_week: number
  start_time: string
  end_time: string
  max_bookings: number
  specific_date: string | null
}

interface ViralityTier { views: number; bonus: number }

interface Restaurant {
  id: number
  name: string
  cuisine_type: string
  address: string
  city: string
  arrondissement: string
  photos: string[]
  offer_description: string
  virality_bonus: number | null
  virality_tiers: ViralityTier[]
  max_people: number
  is_blocked: boolean
  is_published: boolean
  time_slots: TimeSlot[]
}

interface Booking {
  id: number
  booking_date: string
  status: string
  num_people: number
  restaurant_name: string
  restaurant_address: string
  restaurant_city: string
  offer_description: string
  restaurant_virality_tiers: ViralityTier[]
  restaurant_subscription: string
  start_time: string
  end_time: string
  reconfirmed_at: string | null
  reminder_sent_at: string | null
  post_link: string | null
  post_submitted_at: string | null
  claimed_tier: ViralityTier | null
  claim_status: string | null
  post_overdue: boolean
}

interface Profile {
  username: string | null
  first_name: string
  post_violations: number
  last_name: string
  ambassador_code: string
  referral_count: number
  reward_status: string
}

const DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
const DAYS_FULL = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

const OFFER_LABELS: Record<string, string> = {
  meal_two: 'Repas pour 2',
  meal_three: 'Repas pour 3',
  meal_payment: 'Repas + Rémunération',
  virality_bonus: 'Prime de viralité',
  discuss: 'À discuter',
  meal_one: 'Repas pour 1',
  payment: 'Rémunération uniquement',
}

function formatOffer(offer: string): string {
  return OFFER_LABELS[offer] || offer
}

export default function CreatorDashboardPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#000' }} />}>
      <CreatorDashboard />
    </Suspense>
  )
}

function CreatorDashboard() {
  const { locale, toggleLocale } = useLanguage()
  const { c } = useTheme()
  const { toast, confirmModal } = useToast()
  const t = T[locale]
  const router = useRouter()
  const [tab, setTab] = useState<'offers' | 'messages' | 'bookings' | 'profile' | 'referrals' | 'settings'>('offers')
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [photoIndexes, setPhotoIndexes] = useState<Record<number, number>>({})
  const [settingsForm, setSettingsForm] = useState({ firstName: '', lastName: '', phone: '', tiktok: '', instagram: '', city: '' })
  const [passwordForm, setPasswordForm] = useState({ newPw: '' })
  const [emailForm, setEmailForm] = useState('')
  const [settingsMsg, setSettingsMsg] = useState('')
  const [verifyStep, setVerifyStep] = useState<null | 'email' | 'password'>(null)
  const [verifyCode, setVerifyCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [settingsLoaded, setSettingsLoaded] = useState(false)
  const [bookingRestaurant, setBookingRestaurant] = useState<Restaurant | null>(null)
  const [calendarDate, setCalendarDate] = useState<string | null>(null) // YYYY-MM-DD
  const [calendarMonth, setCalendarMonth] = useState(() => { const n = new Date(); return { year: n.getFullYear(), month: n.getMonth() } })
  const [availableSlots, setAvailableSlots] = useState<{ start: string; end: string; available: boolean; timeSlotId: number }[]>([])
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string; timeSlotId: number } | null>(null)
  const [numPeople, setNumPeople] = useState(1)
  const [bookingError, setBookingError] = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [codeCopied, setCodeCopied] = useState(false)
  const [conversations, setConversations] = useState<{ booking_id: number; booking_date: string; restaurant_name: string; restaurant_address: string; restaurant_city: string; unread_count: number; total_messages: number; last_message: string; last_sender: string; last_message_at: string }[]>([])
  const [totalUnread, setTotalUnread] = useState(0)
  const [chatBookingId, setChatBookingId] = useState<number | null>(null)
  const [chatMessages, setChatMessages] = useState<{ id: number; sender_type: string; sender_name: string; content: string; created_at: string }[]>([])
  const [chatInput, setChatInput] = useState('')
  const [reviewBookingId, setReviewBookingId] = useState<number | null>(null)
  const [usernameModal, setUsernameModal] = useState(false)
  const [usernameInput, setUsernameInput] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [usernameSaving, setUsernameSaving] = useState(false)
  // Profile tab
  const [showcasePosts, setShowcasePosts] = useState<string[]>([])
  const [showcaseNiche, setShowcaseNiche] = useState<string[]>([])
  const [showcaseUploading, setShowcaseUploading] = useState(false)
  const [showcaseMsg, setShowcaseMsg] = useState('')
  // Contract modal
  const [contractBooking, setContractBooking] = useState<Booking | null>(null)
  // Post submission
  const [postLinkInputs, setPostLinkInputs] = useState<Record<number, string>>({})
  const [postSubmitting, setPostSubmitting] = useState<number | null>(null)
  // Claim
  const [claimBookingId, setClaimBookingId] = useState<number | null>(null)
  const [claimSubmitting, setClaimSubmitting] = useState(false)
  // Stripe Connect
  const [stripeConnect, setStripeConnect] = useState<{ hasAccount: boolean; onboardingComplete: boolean } | null>(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewedBookings, setReviewedBookings] = useState<Set<number>>(new Set())
  const [chatSending, setChatSending] = useState(false)
  const [reconfirmingId, setReconfirmingId] = useState<number | null>(null)
  const searchParams = useSearchParams()

  // Handle reconfirm from email link
  useEffect(() => {
    const rc = searchParams.get('reconfirmed')
    if (rc === 'success') setSettingsMsg(locale === 'fr' ? 'Présence reconfirmée !' : 'Attendance reconfirmed!')
    else if (rc === 'already') setSettingsMsg(locale === 'fr' ? 'Déjà reconfirmé' : 'Already reconfirmed')
    else if (rc === 'too_early') setSettingsMsg(locale === 'fr' ? 'Trop tôt pour reconfirmer' : 'Too early to reconfirm')
    if (rc) { setTab('bookings'); setTimeout(() => setSettingsMsg(''), 4000) }
  }, [searchParams, locale])

  const fetchData = useCallback(async () => {
    try {
      const [restosRes, bookingsRes, profileRes, convsRes] = await Promise.all([
        fetch('/api/creator/restaurants'),
        fetch('/api/creator/bookings'),
        fetch('/api/creator/profile'),
        fetch('/api/creator/messages'),
      ])

      if (restosRes.status === 401) {
        router.push('/creator/login')
        return
      }

      const restosData = await restosRes.json()
      const bookingsData = await bookingsRes.json()
      const profileData = await profileRes.json()
      const convsData = await convsRes.json()

      setRestaurants(restosData.restaurants || [])
      setBookings(bookingsData.bookings || [])
      const p = profileData.creator || null
      setProfile(p)
      if (p && !p.username) setUsernameModal(true)
      setConversations(convsData.conversations || [])
      setTotalUnread(convsData.totalUnread || 0)

      // Fetch showcase & Stripe Connect in parallel (non-blocking)
      Promise.all([
        fetch('/api/creator/showcase').then(r => r.json()).catch(() => null),
        fetch('/api/creator/stripe-connect').then(r => r.json()).catch(() => null),
      ]).then(([sc, stripe]) => {
        if (sc) { setShowcasePosts(sc.showcasePosts || []); setShowcaseNiche(sc.niche || []) }
        if (stripe) setStripeConnect({ hasAccount: stripe.hasAccount, onboardingComplete: stripe.onboardingComplete })
      })
    } catch {
      router.push('/creator/login')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { fetchData() }, [fetchData])

  const fetchSettingsData = async () => {
    try {
      const res = await fetch('/api/creator/settings')
      if (res.ok) {
        const data = await res.json()
        const p = data.profile
        setSettingsForm({
          firstName: p.first_name || '', lastName: p.last_name || '',
          phone: p.phone || '', tiktok: p.tiktok_username || '',
          instagram: p.instagram_username || '', city: p.city || '',
        })
        setEmailForm(p.email || '')
        setSettingsLoaded(true)
      }
    } catch { /* error */ }
  }

  useEffect(() => {
    if (tab === 'settings' && !settingsLoaded) fetchSettingsData()
  }, [tab, settingsLoaded])

  const fetchSlots = async (restaurantId: number, date: string) => {
    setSlotsLoading(true)
    setAvailableSlots([])
    setSelectedSlot(null)
    try {
      const res = await fetch(`/api/creator/available-slots?restaurantId=${restaurantId}&date=${date}`)
      if (res.ok) {
        const data = await res.json()
        setAvailableSlots(data.slots || [])
      }
    } catch { /* error */ }
    setSlotsLoading(false)
  }

  const handleCalendarDayClick = (restaurant: Restaurant, date: string) => {
    setBookingRestaurant(restaurant)
    setCalendarDate(date)
    setBookingError('')
    setSelectedSlot(null)
    setNumPeople(1)
    fetchSlots(restaurant.id, date)
  }

  const handleBook = async () => {
    if (!bookingRestaurant || !calendarDate || !selectedSlot) return
    setBookingError('')
    setBookingLoading(true)

    try {
      const res = await fetch('/api/creator/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: bookingRestaurant.id,
          timeSlotId: selectedSlot.timeSlotId,
          bookingDate: calendarDate,
          slotStartTime: selectedSlot.start,
          slotEndTime: selectedSlot.end,
          numPeople,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setBookingError(data.error)
        setBookingLoading(false)
        return
      }
      setBookingRestaurant(null)
      setCalendarDate(null)
      setSelectedSlot(null)
      await fetchData()
    } catch {
      setBookingError('Erreur de réservation')
    }
    setBookingLoading(false)
  }

  // Check if a date has available slots for a restaurant
  const hasSlotOnDay = (restaurant: Restaurant, date: Date): boolean => {
    const dow = date.getDay()
    const dateStr = toLocalDateStr(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (date < today) return false
    return restaurant.time_slots.some(ts =>
      (ts.specific_date && ts.specific_date.slice(0, 10) === dateStr) ||
      (!ts.specific_date && ts.day_of_week === dow)
    )
  }

  const handleCopyCode = async () => {
    if (!profile) return
    await navigator.clipboard.writeText(profile.ambassador_code)
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2500)
  }

  const openChat = async (bookingId: number) => {
    setChatBookingId(bookingId)
    setChatMessages([])
    try {
      const res = await fetch(`/api/messages?bookingId=${bookingId}`)
      if (res.ok) {
        const data = await res.json()
        setChatMessages(data.messages || [])
      }
      // Refresh conversations to update unread counts
      const convsRes = await fetch('/api/creator/messages')
      if (convsRes.ok) {
        const convsData = await convsRes.json()
        setConversations(convsData.conversations || [])
        setTotalUnread(convsData.totalUnread || 0)
      }
    } catch { /* error */ }
  }

  const sendChat = async () => {
    if (!chatInput.trim() || !chatBookingId || chatSending) return
    setChatSending(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: chatBookingId, content: chatInput }),
      })
      if (res.ok) {
        setChatInput('')
        const r2 = await fetch(`/api/messages?bookingId=${chatBookingId}`)
        if (r2.ok) {
          const data = await r2.json()
          setChatMessages(data.messages || [])
        }
      }
    } catch { /* error */ }
    setChatSending(false)
  }

  const handleLogout = () => {
    document.cookie = 'creator_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    router.push('/creator/login')
  }

  // Format date as YYYY-MM-DD in local timezone (avoids UTC shift)
  const toLocalDateStr = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  // Mini calendar helper: get days in month grid
  const getCalendarDays = (year: number, month: number) => {
    const first = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0).getDate()
    const startDow = (first.getDay() + 6) % 7 // Monday = 0
    const days: (Date | null)[] = []
    for (let i = 0; i < startDow; i++) days.push(null)
    for (let d = 1; d <= lastDay; d++) days.push(new Date(year, month, d))
    return days
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: c.pageBg }}>
        <span className="animate-spin inline-block w-8 h-8 border-2 border-[#E8471A]/30 border-t-[#E8471A] rounded-full" />
      </div>
    )
  }

  const saveUsername = async () => {
    const u = usernameInput.trim().toLowerCase()
    if (u.length < 3 || !/^[a-zA-Z0-9_]+$/.test(u)) {
      setUsernameError(locale === 'fr' ? 'Min 3 caractères, lettres/chiffres/_ uniquement' : 'Min 3 chars, letters/numbers/_ only')
      return
    }
    setUsernameSaving(true)
    setUsernameError('')
    const checkRes = await fetch(`/api/creator/check-username?username=${encodeURIComponent(u)}`)
    const checkData = await checkRes.json()
    if (!checkData.available) {
      setUsernameError(locale === 'fr' ? 'Ce nom d\'utilisateur est déjà pris' : 'This username is already taken')
      setUsernameSaving(false)
      return
    }
    const res = await fetch('/api/creator/settings', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_profile', username: u, firstName: profile?.first_name, lastName: profile?.last_name, phone: '', tiktok: '', instagram: '', city: '' }),
    })
    if (res.ok) {
      setProfile(p => p ? { ...p, username: u } : p)
      setUsernameModal(false)
    } else {
      const data = await res.json()
      setUsernameError(data.error || 'Erreur')
    }
    setUsernameSaving(false)
  }

  return (
    <div className="min-h-screen" style={{ background: c.pageBg }}>
      {/* Username modal — blocks access until username is set */}
      {usernameModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="rounded-2xl w-full animate-fade-in" style={{ maxWidth: 400, padding: 'clamp(16px, 5vw, 24px)', background: c.cardBg, border: `1px solid ${c.divider}` }}>
            <h2 className="font-dm font-bold text-[20px] mb-2" style={{ color: c.text }}>
              {locale === 'fr' ? 'Choisis ton username' : 'Choose your username'}
            </h2>
            <p className="font-dm text-[13px] mb-5" style={{ color: c.textMuted }}>
              {locale === 'fr' ? 'C\'est le nom que les restaurants verront. Lettres, chiffres et _ uniquement.' : 'This is the name restaurants will see. Letters, numbers and _ only.'}
            </p>
            <input
              value={usernameInput}
              onChange={e => setUsernameInput(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
              placeholder={locale === 'fr' ? 'ex: marie_food' : 'e.g. marie_food'}
              className="font-dm w-full rounded-xl text-[14px] outline-none mb-3"
              style={{ height: 48, padding: '0 16px', background: c.inputBg, border: `1px solid ${c.inputBorder}`, color: c.text }}
            />
            {usernameError && <p className="font-dm text-[12px] text-red-400 mb-3">{usernameError}</p>}
            <button
              onClick={saveUsername}
              disabled={usernameSaving || usernameInput.length < 3}
              className="font-dm w-full rounded-full text-[13px] font-semibold uppercase tracking-[0.08em] transition-all cursor-pointer disabled:opacity-50"
              style={{ height: 48, background: '#E8471A', color: '#fff', border: 'none' }}
            >
              {usernameSaving ? (locale === 'fr' ? 'Enregistrement…' : 'Saving…') : (locale === 'fr' ? 'Confirmer' : 'Confirm')}
            </button>
          </div>
        </div>
      )}

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
            {profile && (
              <span className="font-dm text-white/50 text-[13px]">
                {t.hi} <span className="text-white/80 font-semibold">{profile.first_name}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <ThemeToggle />
            <LanguageToggle />
            <button onClick={handleLogout} className="font-dm text-white/30 text-[12px] hover:text-white/60 transition-colors cursor-pointer" style={{ background: 'none', border: 'none' }}>
              {t.logout}
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="px-4 sm:px-8 py-5 overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="flex gap-1 rounded-xl p-1 w-max sm:w-auto" style={{ background: c.cardBg }}>
          {([
            { key: 'offers' as const, label: t.tabOffers, badge: 0 },
            { key: 'messages' as const, label: t.tabMessages, badge: totalUnread },
            { key: 'bookings' as const, label: t.tabBookings, badge: 0 },
            { key: 'profile' as const, label: t.tabProfile, badge: 0 },
            { key: 'referrals' as const, label: t.tabCode, badge: 0 },
            { key: 'settings' as const, label: t.tabSettings, badge: 0 },
          ]).map(tb => (
            <button key={tb.key} onClick={() => setTab(tb.key)}
              className="font-dm text-[13px] font-semibold px-4 sm:px-5 py-2.5 rounded-lg transition-all cursor-pointer relative"
              style={{
                background: tab === tb.key ? '#E8471A' : 'transparent',
                color: tab === tb.key ? '#fff' : (c.isLight ? '#777' : 'rgba(255,255,255,0.4)'),
                border: 'none',
              }}
            >
              {tb.label}
              {tb.badge > 0 && (
                <span className="absolute -top-1 -right-1 font-dm text-[10px] font-bold text-white rounded-full flex items-center justify-center"
                  style={{ width: 18, height: 18, background: '#E8471A', border: '2px solid #191714' }}>
                  {tb.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 sm:px-8 pb-12">
        {/* Overdue post warning banner */}
        {bookings.some(b => b.post_overdue && !b.post_link) && (
          <div className="rounded-2xl p-5 mb-5 animate-fade-in" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(239,68,68,0.15)' }}>
                <span style={{ fontSize: 16 }}>⚠</span>
              </div>
              <div className="flex-1">
                <p className="font-dm font-bold text-[14px] mb-1" style={{ color: '#ef4444' }}>{t.overdueWarning}</p>
                <p className="font-dm text-[12px] mb-2" style={{ color: c.textMuted }}>{t.overdueText}</p>
                {profile && profile.post_violations > 0 && (
                  <p className="font-dm text-[11px] font-semibold mb-2" style={{ color: '#ef4444' }}>
                    {profile.post_violations} {t.violationsCount}
                  </p>
                )}
                <button onClick={() => setTab('bookings')}
                  className="font-dm text-[12px] font-semibold px-4 py-2 rounded-lg cursor-pointer transition-all hover:brightness-110"
                  style={{ background: '#ef4444', color: '#fff', border: 'none' }}>
                  {t.overdueGoTo}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Restaurant offers grid */}
        {tab === 'offers' && (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {restaurants.length === 0 ? (
              <p className="font-dm text-white/30 text-center py-12 col-span-full">
                {t.noOffers}
              </p>
            ) : (
              restaurants.map(r => {
                const calDays = getCalendarDays(calendarMonth.year, calendarMonth.month)
                const monthNames = locale === 'fr'
                  ? ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
                  : ['January','February','March','April','May','June','July','August','September','October','November','December']
                const dayHeaders = locale === 'fr' ? ['L','M','M','J','V','S','D'] : ['M','T','W','T','F','S','S']

                return (
                <div key={r.id} className="rounded-2xl overflow-hidden animate-fade-in relative" style={{
                  background: c.cardBg,
                  border: `1px solid ${r.is_blocked ? 'rgba(239,68,68,0.15)' : c.divider}`,
                  filter: (!r.is_published || r.is_blocked) ? 'blur(5px)' : 'none',
                  opacity: (!r.is_published || r.is_blocked) ? 0.4 : 1,
                  pointerEvents: (!r.is_published || r.is_blocked) ? 'none' : 'auto',
                }}>
                  {/* Padlock overlay for blocked restaurants */}
                  {r.is_blocked && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ pointerEvents: 'none' }}>
                      <div className="rounded-full flex items-center justify-center" style={{ width: 56, height: 56, background: 'rgba(239,68,68,0.15)', border: '2px solid rgba(239,68,68,0.3)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Photo carousel — full width banner */}
                  {(() => {
                    const photos = r.photos && r.photos.length > 0 ? r.photos : []
                    const idx = photoIndexes[r.id] || 0
                    return (
                      <div className="relative overflow-hidden w-full" style={{ aspectRatio: '16/9' }}>
                        {photos.length > 0 ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={photos[idx % photos.length]} alt="" className="w-full h-full object-cover" />
                            {photos.length > 1 && (
                              <>
                                <button onClick={(e) => { e.stopPropagation(); setPhotoIndexes(p => ({ ...p, [r.id]: ((p[r.id] || 0) - 1 + photos.length) % photos.length })) }}
                                  className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer text-[14px]"
                                  style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none' }}>&lsaquo;</button>
                                <button onClick={(e) => { e.stopPropagation(); setPhotoIndexes(p => ({ ...p, [r.id]: ((p[r.id] || 0) + 1) % photos.length })) }}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer text-[14px]"
                                  style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none' }}>&rsaquo;</button>
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                                  {photos.map((_, pi) => (
                                    <div key={pi} className="rounded-full" style={{
                                      width: 6, height: 6,
                                      background: pi === (idx % photos.length) ? '#fff' : 'rgba(255,255,255,0.4)',
                                    }} />
                                  ))}
                                </div>
                              </>
                            )}
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{
                            background: c.isLight ? 'linear-gradient(135deg, #e0ddd8 0%, #d5d0ca 100%)' : 'linear-gradient(135deg, #2a2520 0%, #191714 100%)',
                          }}>
                            <span style={{ fontSize: 48, opacity: 0.15 }}>&#127869;</span>
                          </div>
                        )}
                      </div>
                    )
                  })()}

                  {/* Info + Calendar */}
                  <div className="flex flex-col">
                    {/* Info */}
                    <div className="flex-1 p-4 flex flex-col min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-dm font-semibold text-[16px] truncate" style={{ color: c.text }}>{r.name}</h3>
                        {(r.virality_tiers?.length > 0 || r.virality_bonus) && (
                          <span className="font-dm text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: 'rgba(232,71,26,0.9)', color: '#fff' }}>
                            {t.prime}
                          </span>
                        )}
                      </div>
                      <p className="font-dm text-[#E8471A] text-[12px] font-semibold mb-0.5">{r.cuisine_type}</p>
                      <p className="font-dm text-[12px] mb-3" style={{ color: c.textMuted }}>
                        {r.address}, {r.city} {r.arrondissement ? `(${r.arrondissement})` : ''}
                      </p>
                      <div className="rounded-lg p-3" style={{ background: 'rgba(232,71,26,0.06)', border: '1px solid rgba(232,71,26,0.1)' }}>
                        <p className="font-dm text-[13px]" style={{ color: c.isLight ? '#555' : 'rgba(255,255,255,0.7)' }}>{formatOffer(r.offer_description)}</p>
                        {r.virality_tiers?.length > 0 && (
                          <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(232,71,26,0.1)' }}>
                            <p className="font-dm text-[10px] uppercase tracking-wider mb-1" style={{ color: c.textMuted }}>{t.prime}</p>
                            {r.virality_tiers.map((tier, i) => (
                              <p key={i} className="font-dm text-[12px]" style={{ color: c.isLight ? '#666' : 'rgba(255,255,255,0.5)' }}>
                                &gt; {tier.views >= 1000 ? `${tier.views / 1000}k` : tier.views} {locale === 'fr' ? 'vues' : 'views'} → <span style={{ color: '#4ade80' }}>+{tier.bonus}€</span>
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mini calendar */}
                    <div className="flex-shrink-0 p-4 border-t" style={{ borderColor: c.divider }}>
                    {/* Month nav */}
                    <div className="flex items-center justify-between mb-2">
                      <button onClick={() => setCalendarMonth(p => {
                        const d = new Date(p.year, p.month - 1, 1)
                        return { year: d.getFullYear(), month: d.getMonth() }
                      })} className="font-dm text-white/30 text-[14px] cursor-pointer hover:text-white/60" style={{ background: 'none', border: 'none' }}>&lsaquo;</button>
                      <span className="font-dm text-white/60 text-[11px] font-semibold">{monthNames[calendarMonth.month]} {calendarMonth.year}</span>
                      <button onClick={() => setCalendarMonth(p => {
                        const d = new Date(p.year, p.month + 1, 1)
                        return { year: d.getFullYear(), month: d.getMonth() }
                      })} className="font-dm text-white/30 text-[14px] cursor-pointer hover:text-white/60" style={{ background: 'none', border: 'none' }}>&rsaquo;</button>
                    </div>
                    {/* Day headers */}
                    <div className="grid grid-cols-7 gap-0 mb-1">
                      {dayHeaders.map((d, i) => (
                        <div key={i} className="flex items-center justify-center" style={{ height: 26 }}>
                          <span className="font-dm text-[9px]" style={{ color: c.isLight ? '#aaa' : 'rgba(255,255,255,0.25)' }}>{d}</span>
                        </div>
                      ))}
                    </div>
                    {/* Day cells */}
                    <div className="grid grid-cols-7 gap-0">
                      {calDays.map((day, i) => {
                        if (!day) return <div key={i} style={{ height: 26 }} />
                        const dateStr = toLocalDateStr(day)
                        const hasSlot = hasSlotOnDay(r, day)
                        const isSelected = bookingRestaurant?.id === r.id && calendarDate === dateStr
                        const isPast = day < new Date(new Date().toDateString())
                        return (
                          <div key={i} className="flex items-center justify-center" style={{ height: 26 }}>
                            <button
                              disabled={!hasSlot || isPast}
                              onClick={() => hasSlot && !isPast && handleCalendarDayClick(r, dateStr)}
                              className="font-dm text-[10px] rounded-md flex items-center justify-center cursor-pointer transition-all disabled:cursor-default"
                              style={{
                                width: 26, height: 26,
                                background: isSelected ? '#E8471A' : hasSlot && !isPast ? 'rgba(232,71,26,0.12)' : 'transparent',
                                color: isSelected ? '#fff' : hasSlot && !isPast ? '#E8471A' : (isPast ? (c.isLight ? '#ccc' : 'rgba(255,255,255,0.12)') : (c.isLight ? '#999' : 'rgba(255,255,255,0.25)')),
                                fontWeight: hasSlot ? 700 : 400,
                                border: 'none',
                              }}
                            >
                              {day.getDate()}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                    {!r.time_slots?.length && (
                      <p className="font-dm text-white/20 text-[9px] text-center mt-2 italic">{t.slotsComingSoon}</p>
                    )}
                  </div>
                  </div>{/* close info+calendar row */}
                </div>
              )})
            )}
          </div>
        )}

        {/* Messages tab — split panel */}
        {tab === 'messages' && (
          conversations.length === 0 ? (
            <div className="text-center py-12">
              <p className="font-dm text-white/30 text-[14px] mb-2">{t.noConversations}</p>
              <p className="font-dm text-white/20 text-[12px]">{t.noConvSub}</p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-0 rounded-2xl overflow-hidden" style={{
              height: 'calc(100vh - 180px)',
              border: `1px solid ${c.divider}`,
            }}>
              {/* Left: conversation list */}
              <div className="overflow-y-auto flex-shrink-0 w-full max-h-[200px] sm:max-h-none sm:w-[280px]" style={{
                background: c.cardBg,
                borderRight: `1px solid ${c.divider}`,
              }}>
                {conversations.map(conv => (
                  <button key={conv.booking_id}
                    onClick={() => openChat(conv.booking_id)}
                    className="w-full text-left px-4 py-3.5 transition-all cursor-pointer"
                    style={{
                      background: chatBookingId === conv.booking_id ? (c.isLight ? '#f0f0f3' : '#1e1b17') : 'transparent',
                      borderBottom: `1px solid ${c.divider}`,
                      borderLeft: chatBookingId === conv.booking_id ? '3px solid #E8471A' : '3px solid transparent',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-dm text-white font-semibold text-[13px] truncate flex-1">{conv.restaurant_name}</h3>
                      {conv.unread_count > 0 && (
                        <span className="font-dm text-[9px] font-bold text-white rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ width: 18, height: 18, background: '#E8471A' }}>
                          {conv.unread_count}
                        </span>
                      )}
                      {conv.last_message_at && (
                        <span className="font-dm text-white/15 text-[10px] flex-shrink-0">
                          {new Date(conv.last_message_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                    </div>
                    <p className="font-dm text-white/25 text-[10px] mb-1">
                      {new Date(conv.booking_date).toLocaleDateString('fr-FR')}
                    </p>
                    {conv.last_message && (
                      <p className="font-dm text-[11px] truncate" style={{
                        color: conv.unread_count > 0 ? (c.isLight ? '#333' : 'rgba(255,255,255,0.6)') : (c.isLight ? '#aaa' : 'rgba(255,255,255,0.25)'),
                        fontWeight: conv.unread_count > 0 ? 600 : 400,
                      }}>
                        {conv.last_message}
                      </p>
                    )}
                  </button>
                ))}
              </div>

              {/* Right: active chat */}
              <div className="flex-1 flex flex-col" style={{ background: (c.isLight ? '#f8f8fa' : '#141210') }}>
                {chatBookingId ? (
                  <>
                    {/* Chat header */}
                    {(() => {
                      const activeConv = conversations.find(cv => cv.booking_id === chatBookingId)
                      return activeConv ? (
                        <div className="px-5 py-3.5 flex-shrink-0" style={{
                          background: c.cardBg,
                          borderBottom: `1px solid ${c.divider}`,
                        }}>
                          <h3 className="font-dm text-white font-semibold text-[15px]">{activeConv.restaurant_name}</h3>
                          <p className="font-dm text-white/30 text-[11px]">
                            {activeConv.restaurant_address}, {activeConv.restaurant_city} &middot; {new Date(activeConv.booking_date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      ) : null
                    })()}

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-5 py-4">
                      {chatMessages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                          <p className="font-dm text-white/20 text-[13px]">{t.noMessages}</p>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {chatMessages.map(m => (
                            <div key={m.id} className={`flex ${m.sender_type === 'creator' ? 'justify-end' : 'justify-start'}`}>
                              <div className="max-w-[75%]" style={{
                                background: m.sender_type === 'creator' ? 'rgba(232,71,26,0.15)' : (c.isLight ? '#f0f0f3' : '#1e1b17'),
                                border: `1px solid ${m.sender_type === 'creator' ? 'rgba(232,71,26,0.2)' : 'rgba(255,255,255,0.06)'}`,
                                borderRadius: 16,
                                borderBottomRightRadius: m.sender_type === 'creator' ? 4 : 16,
                                borderBottomLeftRadius: m.sender_type === 'restaurant' ? 4 : 16,
                                padding: '10px 14px',
                              }}>
                                <p className="font-dm text-white/30 text-[10px] mb-0.5">{m.sender_name}</p>
                                <p className="font-dm text-white/85 text-[14px] leading-relaxed whitespace-pre-wrap">{m.content}</p>
                                <p className="font-dm text-white/15 text-[10px] mt-1 text-right">
                                  {new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Input */}
                    <div className="px-5 py-3 flex-shrink-0" style={{
                      background: c.cardBg,
                      borderTop: `1px solid ${c.divider}`,
                    }}>
                      <div className="flex gap-2">
                        <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendChat()}
                          placeholder={t.messagePh}
                          className="font-dm flex-1 rounded-xl text-[14px] text-white/90 placeholder:text-white/20 outline-none"
                          style={{ height: 44, padding: '0 16px', background: c.inputBg, border: `1px solid ${c.inputBorder}` }}
                        />
                        <button onClick={sendChat} disabled={!chatInput.trim() || chatSending}
                          className="font-dm text-[13px] font-semibold px-5 rounded-xl cursor-pointer transition-all disabled:opacity-30"
                          style={{ height: 44, background: '#E8471A', color: '#fff', border: 'none' }}>
                          {chatSending ? '...' : t.send}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="font-dm text-white/15 text-[14px]">
                      {locale === 'fr' ? 'Sélectionne une conversation' : 'Select a conversation'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )
        )}

        {/* Bookings list */}
        {tab === 'bookings' && (
          <div className="space-y-3">
            {bookings.length === 0 ? (
              <p className="font-dm text-white/30 text-center py-12">{t.noBookings}</p>
            ) : (
              bookings.map(b => (
                <div key={b.id} className="rounded-2xl p-5 animate-fade-in" style={{
                  background: c.cardBg,
                  border: `1px solid ${c.divider}`,
                }}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-dm text-white font-semibold text-[15px] mb-1">{b.restaurant_name}</h3>
                      <p className="font-dm text-white/40 text-[13px]">
                        {b.restaurant_address}, {b.restaurant_city}
                      </p>
                      <p className="font-dm text-[#E8471A] text-[13px] font-semibold mt-2">
                        {new Date(b.booking_date).toLocaleDateString('fr-FR', {
                          weekday: 'long', day: 'numeric', month: 'long',
                        })}
                        {' '}&middot;{' '}{b.start_time?.slice(0, 5)} - {b.end_time?.slice(0, 5)}
                      </p>
                      <p className="font-dm text-white/40 text-[12px] mt-1">{formatOffer(b.offer_description)}</p>
                    </div>
                    <span className="font-dm text-[11px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0" style={{
                      background: b.status === 'confirmed' ? 'rgba(74,222,128,0.1)' : b.status === 'pending' ? 'rgba(217,79,42,0.1)' : b.status === 'refused' ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)',
                      color: b.status === 'confirmed' ? '#4ade80' : b.status === 'pending' ? '#D94F2A' : b.status === 'refused' ? '#ef4444' : '#8a8580',
                    }}>
                      {b.status === 'pending' ? (locale === 'fr' ? 'En attente' : 'Pending') : b.status === 'confirmed' ? t.confirmed : b.status === 'refused' ? (locale === 'fr' ? 'Refusé' : 'Refused') : b.status === 'completed' ? t.completed : t.cancelled}
                    </span>
                  </div>

                  {/* Reconfirm button — shows for confirmed bookings within 5 days that aren't reconfirmed */}
                  {b.status === 'confirmed' && !b.reconfirmed_at && (() => {
                    const [by, bm, bd] = (b.booking_date?.slice(0, 10) || '').split('-').map(Number)
                    const bDate = new Date(by, bm - 1, bd)
                    const daysUntil = (bDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                    return daysUntil <= 5 && daysUntil > 0
                  })() && (
                    <div className="mt-3 rounded-xl p-3 animate-fade-in" style={{ background: 'rgba(217,79,42,0.08)', border: '1px solid rgba(217,79,42,0.15)' }}>
                      <p className="font-dm text-[#D94F2A] text-[12px] font-semibold mb-2">
                        {locale === 'fr' ? 'Reconfirme ta présence pour maintenir ta réservation' : 'Reconfirm your attendance to keep your booking'}
                      </p>
                      <button
                        disabled={reconfirmingId === b.id}
                        onClick={async () => {
                          setReconfirmingId(b.id)
                          try {
                            const res = await fetch('/api/creator/bookings/reconfirm', {
                              method: 'POST', headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ bookingId: b.id }),
                            })
                            if (res.ok) {
                              setBookings(prev => prev.map(bk => bk.id === b.id ? { ...bk, reconfirmed_at: new Date().toISOString() } : bk))
                            }
                          } catch { /* */ }
                          setReconfirmingId(null)
                        }}
                        className="font-dm text-[12px] font-semibold px-5 py-2 rounded-lg cursor-pointer transition-all hover:brightness-110"
                        style={{ background: '#4ade80', color: '#000', border: 'none' }}
                      >
                        {reconfirmingId === b.id
                          ? (locale === 'fr' ? 'Confirmation...' : 'Confirming...')
                          : (locale === 'fr' ? 'Je confirme ma présence' : 'Confirm my attendance')}
                      </button>
                    </div>
                  )}

                  {/* Reconfirmed badge */}
                  {b.status === 'confirmed' && b.reconfirmed_at && (
                    <p className="font-dm text-[11px] text-[#4ade80] mt-2">
                      {locale === 'fr' ? 'Présence reconfirmée' : 'Attendance reconfirmed'}
                    </p>
                  )}

                  {/* Cancel button — creator can cancel pending or confirmed bookings */}
                  {(b.status === 'pending' || b.status === 'confirmed') && (
                    <div className="flex justify-end mt-3">
                      <button
                        onClick={() => {
                          confirmModal(
                            locale === 'fr' ? 'Annuler cette réservation ? Cette action est irréversible.' : 'Cancel this booking? This cannot be undone.',
                            async () => {
                              const res = await fetch('/api/creator/bookings', {
                                method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ bookingId: b.id, action: 'cancel' }),
                              })
                              if (res.ok) {
                                setBookings(prev => prev.map(bk => bk.id === b.id ? { ...bk, status: 'cancelled' } : bk))
                                toast(locale === 'fr' ? 'Réservation annulée' : 'Booking cancelled', 'success')
                              }
                            }
                          )
                        }}
                        className="font-dm text-[11px] px-3 py-1.5 rounded-lg cursor-pointer transition-all hover:brightness-110"
                        style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: 'none' }}
                      >
                        {locale === 'fr' ? 'Annuler' : 'Cancel'}
                      </button>
                    </div>
                  )}

                  {/* Message button */}
                  {b.status === 'confirmed' && (
                    <button onClick={() => chatBookingId === b.id ? setChatBookingId(null) : openChat(b.id)}
                      className="font-dm text-[12px] font-semibold px-4 py-2 rounded-lg cursor-pointer transition-all hover:brightness-110 mt-3"
                      style={{ background: chatBookingId === b.id ? 'rgba(255,255,255,0.06)' : 'rgba(232,71,26,0.1)', color: chatBookingId === b.id ? '#8a8580' : '#E8471A', border: 'none' }}
                    >
                      {chatBookingId === b.id ? t.closeChat : `💬 ${t.message}`}
                    </button>
                  )}

                  {/* Review button for completed bookings */}
                  {b.status === 'completed' && !reviewedBookings.has(b.id) && (
                    reviewBookingId === b.id ? (
                      <div className="mt-3 rounded-xl p-4 animate-fade-in" style={{ background: 'rgba(232,71,26,0.05)', border: '1px solid rgba(232,71,26,0.1)' }}>
                        <p className="font-dm text-white/60 text-[12px] mb-2">{locale === 'fr' ? 'Note ton expérience' : 'Rate your experience'}</p>
                        <div className="flex gap-1 mb-3">
                          {[1, 2, 3, 4, 5].map(s => (
                            <button key={s} onClick={() => setReviewRating(s)}
                              className="text-[20px] cursor-pointer" style={{ background: 'none', border: 'none' }}>
                              {s <= reviewRating ? '★' : '☆'}
                            </button>
                          ))}
                        </div>
                        <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)}
                          placeholder={locale === 'fr' ? 'Un commentaire ? (optionnel)' : 'Any comments? (optional)'}
                          className="font-dm w-full rounded-lg text-[12px] text-white/90 placeholder:text-white/20 outline-none mb-3 resize-none"
                          rows={2} style={{ padding: '8px 12px', background: c.inputBg, border: `1px solid ${c.inputBorder}` }} />
                        <div className="flex gap-2">
                          <button onClick={() => { setReviewBookingId(null); setReviewComment(''); setReviewRating(5) }}
                            className="font-dm text-[11px] font-semibold px-3 py-1.5 rounded-lg cursor-pointer"
                            style={{ background: c.inputBg, color: c.textMuted, border: 'none' }}>{t.cancel}</button>
                          <button onClick={async () => {
                            const res = await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ bookingId: b.id, rating: reviewRating, comment: reviewComment || null }) })
                            if (res.ok) { setReviewedBookings(s => new Set([...s, b.id])); setReviewBookingId(null); setReviewComment(''); setReviewRating(5) }
                          }} className="font-dm text-[11px] font-semibold px-4 py-1.5 rounded-lg cursor-pointer"
                            style={{ background: '#E8471A', color: '#fff', border: 'none' }}>
                            {locale === 'fr' ? 'Envoyer' : 'Submit'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setReviewBookingId(b.id)}
                        className="font-dm text-[12px] font-semibold px-4 py-2 rounded-lg cursor-pointer transition-all hover:brightness-110 mt-3"
                        style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: 'none' }}>
                        ★ {locale === 'fr' ? 'Laisser un avis' : 'Leave a review'}
                      </button>
                    )
                  )}
                  {b.status === 'completed' && reviewedBookings.has(b.id) && (
                    <p className="font-dm text-white/30 text-[11px] mt-3">✓ {locale === 'fr' ? 'Avis envoyé' : 'Review submitted'}</p>
                  )}

                  {/* View contract button — for confirmed bookings */}
                  {(b.status === 'confirmed' || b.status === 'completed') && (
                    <button onClick={() => setContractBooking(b)}
                      className="font-dm text-[11px] font-semibold px-3 py-1.5 rounded-lg cursor-pointer mt-2"
                      style={{ background: 'rgba(255,255,255,0.04)', color: c.textMuted, border: `1px solid ${c.divider}` }}>
                      📄 {t.viewContract}
                    </button>
                  )}

                  {/* Post link submission — after booking date has passed */}
                  {(b.status === 'confirmed' || b.status === 'completed') && (() => {
                    const [by, bm, bd] = (b.booking_date?.slice(0, 10) || '').split('-').map(Number)
                    const bDate = new Date(by, bm - 1, bd)
                    const deadline = new Date(bDate.getTime() + 5 * 24 * 60 * 60 * 1000)
                    const daysLeft = Math.max(0, Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                    const isPast = bDate < new Date(new Date().toDateString())
                    if (!isPast) return null
                    return (
                      <div className="mt-3 rounded-xl p-3" style={{ background: 'rgba(232,71,26,0.04)', border: '1px solid rgba(232,71,26,0.1)' }}>
                        {b.post_link ? (
                          <div className="flex items-center gap-2">
                            <span className="text-[#4ade80] text-[11px]">✓</span>
                            <a href={b.post_link} target="_blank" rel="noopener noreferrer" className="font-dm text-[12px] text-[#E8471A] underline" style={{ textUnderlineOffset: 2 }}>
                              {t.postSubmitted}
                            </a>
                          </div>
                        ) : (
                          <>
                            <p className="font-dm text-[11px] mb-2" style={{ color: daysLeft > 0 ? '#E8471A' : '#ef4444' }}>
                              {daysLeft > 0 ? `⏱ ${daysLeft} ${t.daysToPublish}` : (locale === 'fr' ? '⚠ Délai dépassé' : '⚠ Deadline passed')}
                            </p>
                            <div className="flex gap-2">
                              <input
                                value={postLinkInputs[b.id] || ''}
                                onChange={e => setPostLinkInputs(p => ({ ...p, [b.id]: e.target.value }))}
                                placeholder={t.postLinkPh}
                                className="font-dm flex-1 rounded-lg text-[12px] outline-none"
                                style={{ height: 36, padding: '0 10px', background: c.inputBg, border: `1px solid ${c.inputBorder}`, color: c.text }}
                              />
                              <button
                                disabled={postSubmitting === b.id || !postLinkInputs[b.id]?.startsWith('http')}
                                onClick={async () => {
                                  setPostSubmitting(b.id)
                                  const res = await fetch('/api/creator/bookings/submit-post', {
                                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ bookingId: b.id, postLink: postLinkInputs[b.id] }),
                                  })
                                  if (res.ok) {
                                    setBookings(prev => prev.map(bk => bk.id === b.id ? { ...bk, post_link: postLinkInputs[b.id], post_submitted_at: new Date().toISOString() } : bk))
                                    setPostLinkInputs(p => { const n = { ...p }; delete n[b.id]; return n })
                                  }
                                  setPostSubmitting(null)
                                }}
                                className="font-dm text-[11px] font-semibold px-3 rounded-lg cursor-pointer disabled:opacity-50"
                                style={{ background: '#E8471A', color: '#fff', border: 'none' }}>
                                {t.submitPost}
                              </button>
                            </div>
                          </>
                        )}

                        {/* Claim bonus — visible after post submitted */}
                        {b.post_link && b.restaurant_virality_tiers?.length > 0 && (
                          <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${c.divider}` }}>
                            {b.claim_status === 'pending' && <p className="font-dm text-[#E8471A] text-[12px] font-semibold">⏳ {t.claimPending}</p>}
                            {b.claim_status === 'approved' && <p className="font-dm text-[#4ade80] text-[12px] font-semibold">✓ {t.claimApproved}</p>}
                            {b.claim_status === 'rejected' && <p className="font-dm text-[#ef4444] text-[12px] font-semibold">✗ {t.claimRejected}</p>}
                            {!b.claim_status && (
                              claimBookingId === b.id ? (
                                <div className="space-y-2">
                                  <p className="font-dm text-[11px] font-semibold" style={{ color: c.textMuted }}>{t.selectTier}</p>
                                  {b.restaurant_virality_tiers.map((tier, ti) => (
                                    <button key={ti}
                                      disabled={claimSubmitting}
                                      onClick={async () => {
                                        if (!stripeConnect?.onboardingComplete) {
                                          toast(locale === 'fr' ? 'Connecte d\'abord ton compte bancaire dans l\'onglet Mon profil' : 'Connect your bank account first in the My profile tab', 'error')
                                          return
                                        }
                                        setClaimSubmitting(true)
                                        const res = await fetch('/api/creator/bookings/claim-tier', {
                                          method: 'POST', headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ bookingId: b.id, claimedTier: tier }),
                                        })
                                        if (res.ok) {
                                          setBookings(prev => prev.map(bk => bk.id === b.id ? { ...bk, claimed_tier: tier, claim_status: 'pending' } : bk))
                                        } else {
                                          const data = await res.json()
                                          toast(data.error || 'Erreur', 'error')
                                        }
                                        setClaimSubmitting(false)
                                        setClaimBookingId(null)
                                      }}
                                      className="font-dm text-[12px] w-full text-left px-3 py-2 rounded-lg cursor-pointer transition-all hover:brightness-110"
                                      style={{ background: 'rgba(232,71,26,0.08)', color: '#E8471A', border: '1px solid rgba(232,71,26,0.15)' }}>
                                      &gt; {(tier.views / 1000).toFixed(0)}k {locale === 'fr' ? 'vues' : 'views'} → +{tier.bonus}€
                                      <span className="text-[10px] opacity-60 ml-1">({t.contractViralityNote})</span>
                                    </button>
                                  ))}
                                  <button onClick={() => setClaimBookingId(null)} className="font-dm text-[11px] cursor-pointer" style={{ color: c.textMuted, background: 'none', border: 'none' }}>{t.cancel}</button>
                                </div>
                              ) : (
                                <button onClick={() => setClaimBookingId(b.id)}
                                  className="font-dm text-[12px] font-semibold px-4 py-2 rounded-lg cursor-pointer transition-all hover:brightness-110"
                                  style={{ background: 'rgba(232,71,26,0.1)', color: '#E8471A', border: 'none' }}>
                                  🎯 {t.claimPrime}
                                </button>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })()}

                  {/* Inline chat */}
                  {chatBookingId === b.id && (
                    <div className="mt-3 rounded-xl p-4 animate-fade-in" style={{
                      background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.04)',
                    }}>
                      <div className="space-y-2 mb-3" style={{ maxHeight: 250, overflowY: 'auto' }}>
                        {chatMessages.length === 0 ? (
                          <p className="font-dm text-white/20 text-[12px] text-center py-4">{t.noMessages}</p>
                        ) : chatMessages.map(m => (
                          <div key={m.id} className={`flex ${m.sender_type === 'creator' ? 'justify-end' : 'justify-start'}`}>
                            <div className="max-w-[80%]" style={{
                              background: m.sender_type === 'creator' ? 'rgba(232,71,26,0.15)' : c.cardBg,
                              border: `1px solid ${m.sender_type === 'creator' ? 'rgba(232,71,26,0.2)' : 'rgba(255,255,255,0.06)'}`,
                              borderRadius: 12,
                              borderBottomRightRadius: m.sender_type === 'creator' ? 4 : 12,
                              borderBottomLeftRadius: m.sender_type === 'restaurant' ? 4 : 12,
                              padding: '8px 12px',
                            }}>
                              <p className="font-dm text-white/30 text-[9px] mb-0.5">{m.sender_name}</p>
                              <p className="font-dm text-white/80 text-[13px] whitespace-pre-wrap">{m.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendChat()}
                          placeholder={t.messagePh}
                          className="font-dm flex-1 rounded-lg text-[13px] text-white/90 placeholder:text-white/20 outline-none"
                          style={{ height: 40, padding: '0 12px', background: c.inputBg, border: `1px solid ${c.inputBorder}` }}
                        />
                        <button onClick={sendChat} disabled={!chatInput.trim() || chatSending}
                          className="font-dm text-[12px] font-semibold px-4 rounded-lg cursor-pointer transition-all disabled:opacity-30"
                          style={{ height: 40, background: '#E8471A', color: '#fff', border: 'none' }}>
                          {chatSending ? '...' : t.send}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Profile tab */}
        {tab === 'profile' && profile && (
          <div style={{ maxWidth: 600 }}>
            <h2 className="font-dm font-bold text-[20px] mb-6" style={{ color: c.text }}>{t.profileTitle}</h2>

            {/* Username & niche */}
            <div className="rounded-2xl p-5 mb-4" style={{ background: c.cardBg, border: `1px solid ${c.divider}` }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-dm font-bold text-[16px]" style={{ background: 'rgba(232,71,26,0.12)', color: '#E8471A' }}>
                  {(profile.username || profile.first_name)?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-dm font-bold text-[15px]" style={{ color: c.text }}>@{profile.username || '...'}</p>
                  <p className="font-dm text-[12px]" style={{ color: c.textMuted }}>{profile.first_name} {profile.last_name}</p>
                </div>
              </div>
              {showcaseNiche.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {showcaseNiche.map((n, i) => (
                    <span key={i} className="font-dm text-[11px] px-2.5 py-1 rounded-full" style={{ background: 'rgba(232,71,26,0.08)', color: '#E8471A' }}>{n}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Showcase posts */}
            <div className="rounded-2xl p-5 mb-4" style={{ background: c.cardBg, border: `1px solid ${c.divider}` }}>
              <p className="font-dm font-semibold text-[14px] mb-1" style={{ color: c.text }}>{t.showcaseTitle}</p>
              <p className="font-dm text-[12px] mb-4" style={{ color: c.textMuted }}>{t.showcaseHint}</p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {[0, 1].map(i => (
                  <div key={i} className="rounded-xl overflow-hidden relative" style={{ aspectRatio: '9/16', background: c.inputBg, border: `1px dashed ${c.inputBorder}` }}>
                    {showcasePosts[i] ? (
                      <>
                        {showcasePosts[i].match(/\.(mp4|mov|webm)/i) ? (
                          <video src={showcasePosts[i]} className="w-full h-full object-cover" />
                        ) : (
                          <img src={showcasePosts[i]} alt="" className="w-full h-full object-cover" />
                        )}
                        <button onClick={() => setShowcasePosts(p => p.filter((_, j) => j !== i))}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer"
                          style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', fontSize: 12 }}>×</button>
                      </>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                        <span className="font-dm text-[24px] mb-1" style={{ color: c.textMuted }}>+</span>
                        <span className="font-dm text-[11px]" style={{ color: c.textMuted }}>{t.uploadShowcase}</span>
                        <input type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm" className="hidden" onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          if (file.size > 50 * 1024 * 1024) { toast(locale === 'fr' ? 'Fichier trop volumineux (max 50MB)' : 'File too large (max 50MB)', 'error'); return }
                          setShowcaseUploading(true)
                          try {
                            // Get signed upload params from our API
                            const signRes = await fetch('/api/upload/sign', {
                              method: 'POST', headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ folder: '2960agency/showcase' }),
                            })
                            const signData = await signRes.json()
                            // Upload directly to Cloudinary (no server body size limit)
                            const resourceType = file.type.startsWith('video/') ? 'video' : 'image'
                            const cloudForm = new FormData()
                            cloudForm.append('file', file)
                            cloudForm.append('folder', signData.folder)
                            cloudForm.append('timestamp', signData.timestamp)
                            cloudForm.append('api_key', signData.apiKey)
                            cloudForm.append('signature', signData.signature)
                            const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${signData.cloudName}/${resourceType}/upload`, { method: 'POST', body: cloudForm })
                            const cloudData = await cloudRes.json()
                            if (cloudData.secure_url) {
                              setShowcasePosts(p => { const n = [...p]; n[i] = cloudData.secure_url; return n.slice(0, 2) })
                            }
                          } catch (err) { console.error('Upload error:', err) }
                          setShowcaseUploading(false)
                        }} />
                      </label>
                    )}
                  </div>
                ))}
              </div>

              {showcaseUploading && (
                <p className="font-dm text-[12px] mb-3" style={{ color: '#E8471A' }}>
                  <span className="animate-spin inline-block w-3 h-3 border border-[#E8471A]/30 border-t-[#E8471A] rounded-full mr-2" />
                  Upload...
                </p>
              )}

              <button onClick={async () => {
                const res = await fetch('/api/creator/showcase', {
                  method: 'PUT', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ showcasePosts }),
                })
                if (res.ok) { setShowcaseMsg(t.showcaseSaved); setTimeout(() => setShowcaseMsg(''), 2000) }
              }} className="font-dm text-[12px] font-semibold px-5 py-2 rounded-lg cursor-pointer"
                style={{ background: '#E8471A', color: '#fff', border: 'none' }}>{t.save}</button>
              {showcaseMsg && <span className="font-dm text-[12px] text-[#4ade80] ml-3">{showcaseMsg}</span>}
            </div>

            {/* Stripe Connect */}
            <div className="rounded-2xl p-5" style={{ background: c.cardBg, border: `1px solid ${c.divider}` }}>
              <p className="font-dm font-semibold text-[14px] mb-1" style={{ color: c.text }}>{t.connectBank}</p>
              <p className="font-dm text-[12px] mb-4" style={{ color: c.textMuted }}>{t.connectBankDesc}</p>
              {stripeConnect?.onboardingComplete ? (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: '#4ade80' }} />
                  <span className="font-dm text-[#4ade80] text-[13px] font-semibold">{t.bankConnected}</span>
                </div>
              ) : (
                <button onClick={async () => {
                  const res = await fetch('/api/creator/stripe-connect', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: stripeConnect?.hasAccount ? 'refresh_link' : 'create_account' }),
                  })
                  const data = await res.json()
                  if (data.url) window.location.href = data.url
                }} className="font-dm text-[12px] font-semibold px-5 py-2.5 rounded-lg cursor-pointer transition-all hover:brightness-110"
                  style={{ background: '#E8471A', color: '#fff', border: 'none' }}>
                  {stripeConnect?.hasAccount ? t.finishSetup : t.connectBank}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Referral tab */}
        {tab === 'referrals' && profile && (
          <div style={{ maxWidth: 480 }}>
            <div className="rounded-2xl p-6" style={{
              background: 'linear-gradient(135deg, rgba(232,71,26,0.1) 0%, rgba(217,79,42,0.05) 100%)',
              border: '1px solid rgba(232,71,26,0.2)',
            }}>
              <p className="font-dm text-[#E8471A] font-bold text-[16px] mb-2">{t.ambassadorTitle}</p>
              <p className="font-dm text-white/50 text-[13px] mb-4 leading-relaxed">
                {t.ambassadorText}
              </p>

              <div className="rounded-xl p-5 mb-4" style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(232,71,26,0.1)',
              }}>
                <p className="font-dm text-[#E8471A] font-bold text-center text-[28px] tracking-[0.15em]">
                  {profile.ambassador_code}
                </p>
              </div>

              <button onClick={handleCopyCode}
                className="font-dm w-full rounded-full text-[13px] font-semibold py-3 cursor-pointer transition-all"
                style={{
                  background: codeCopied ? 'rgba(74,222,128,0.1)' : 'rgba(232,71,26,0.15)',
                  color: codeCopied ? '#4ade80' : '#E8471A',
                  border: `1px solid ${codeCopied ? 'rgba(74,222,128,0.2)' : 'rgba(232,71,26,0.25)'}`,
                }}
              >
                {codeCopied ? `&#10003; ${t.codeCopied}` : t.copyCode}
              </button>

              {/* Progress */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-dm text-white/40 text-[12px]">{t.progress}</span>
                  <span className="font-dm text-[#E8471A] font-bold text-[13px]">{profile.referral_count}/5</span>
                </div>
                <div className="w-full h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{
                    width: `${Math.min((profile.referral_count / 5) * 100, 100)}%`,
                    background: profile.referral_count >= 5 ? '#4ade80' : '#E8471A',
                  }} />
                </div>
                {profile.reward_status === 'eligible' && (
                  <p className="font-dm text-[#4ade80] text-[13px] font-semibold mt-3 text-center">
                    &#127881; {t.eligible}
                  </p>
                )}
                {profile.reward_status === 'paid' && (
                  <p className="font-dm text-[#4ade80] text-[13px] font-semibold mt-3 text-center">
                    &#10003; {t.paid}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Settings tab */}
        {tab === 'settings' && (
          <div style={{ maxWidth: 520 }}>
            {settingsMsg && (
              <div className="font-dm text-[13px] text-[#4ade80] mb-4 p-3 rounded-lg" style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.15)' }}>
                {settingsMsg}
              </div>
            )}

            {/* Profile info */}
            <div className="rounded-2xl p-5 mb-4" style={{ background: c.cardBg, border: `1px solid ${c.divider}` }}>
              <p className="font-dm text-white/50 text-[11px] uppercase tracking-[0.06em] mb-4">{t.settingsProfile}</p>
              <div className="grid gap-3 sm:grid-cols-2 mb-3">
                <div>
                  <label className="font-dm form-label text-[11px] block mb-1">{locale === 'fr' ? 'Prénom' : 'First name'}</label>
                  <input value={settingsForm.firstName} onChange={e => setSettingsForm(p => ({ ...p, firstName: e.target.value }))}
                    className="font-dm w-full rounded-lg text-[13px] text-white/90 placeholder:text-white/20 outline-none"
                    style={{ height: 40, padding: '0 12px', background: c.inputBg, border: `1px solid ${c.inputBorder}` }}
                    onFocus={() => { if (!settingsForm.firstName && profile) setSettingsForm(p => ({ ...p, firstName: profile.first_name || '' })) }} />
                </div>
                <div>
                  <label className="font-dm form-label text-[11px] block mb-1">{locale === 'fr' ? 'Nom' : 'Last name'}</label>
                  <input value={settingsForm.lastName} onChange={e => setSettingsForm(p => ({ ...p, lastName: e.target.value }))}
                    className="font-dm w-full rounded-lg text-[13px] text-white/90 placeholder:text-white/20 outline-none"
                    style={{ height: 40, padding: '0 12px', background: c.inputBg, border: `1px solid ${c.inputBorder}` }}
                    onFocus={() => { if (!settingsForm.lastName && profile) setSettingsForm(p => ({ ...p, lastName: profile.last_name || '' })) }} />
                </div>
              </div>
              <div className="mb-3">
                <label className="font-dm form-label text-[11px] block mb-1">{locale === 'fr' ? 'Téléphone' : 'Phone'}</label>
                <input value={settingsForm.phone} onChange={e => setSettingsForm(p => ({ ...p, phone: e.target.value }))}
                  className="font-dm w-full rounded-lg text-[13px] text-white/90 placeholder:text-white/20 outline-none"
                  style={{ height: 40, padding: '0 12px', background: c.inputBg, border: `1px solid ${c.inputBorder}` }}
                  onFocus={() => { if (!settingsForm.phone && profile) fetchSettingsData() }} />
              </div>
              <div className="mb-3">
                <label className="font-dm form-label text-[11px] block mb-1">{locale === 'fr' ? 'Ville' : 'City'}</label>
                <input value={settingsForm.city} onChange={e => setSettingsForm(p => ({ ...p, city: e.target.value }))}
                  className="font-dm w-full rounded-lg text-[13px] text-white/90 placeholder:text-white/20 outline-none"
                  style={{ height: 40, padding: '0 12px', background: c.inputBg, border: `1px solid ${c.inputBorder}` }} />
              </div>
              <button onClick={async () => {
                const res = await fetch('/api/creator/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'update_profile', ...settingsForm }) })
                if (res.ok) { setSettingsMsg(t.saved); setTimeout(() => setSettingsMsg(''), 2000) }
              }} className="font-dm text-[12px] font-semibold px-5 py-2 rounded-lg cursor-pointer" style={{ background: '#E8471A', color: '#fff', border: 'none' }}>
                {t.save}
              </button>
            </div>

            {/* Social media */}
            <div className="rounded-2xl p-5 mb-4" style={{ background: c.cardBg, border: `1px solid ${c.divider}` }}>
              <p className="font-dm text-white/50 text-[11px] uppercase tracking-[0.06em] mb-4">{t.settingsSocials}</p>
              <div className="grid gap-3 sm:grid-cols-2 mb-3">
                <div>
                  <label className="font-dm form-label text-[11px] block mb-1">TikTok</label>
                  <input value={settingsForm.tiktok} onChange={e => setSettingsForm(p => ({ ...p, tiktok: e.target.value }))} placeholder="@compte"
                    className="font-dm w-full rounded-lg text-[13px] text-white/90 placeholder:text-white/20 outline-none"
                    style={{ height: 40, padding: '0 12px', background: c.inputBg, border: `1px solid ${c.inputBorder}` }} />
                </div>
                <div>
                  <label className="font-dm form-label text-[11px] block mb-1">Instagram</label>
                  <input value={settingsForm.instagram} onChange={e => setSettingsForm(p => ({ ...p, instagram: e.target.value }))} placeholder="@compte"
                    className="font-dm w-full rounded-lg text-[13px] text-white/90 placeholder:text-white/20 outline-none"
                    style={{ height: 40, padding: '0 12px', background: c.inputBg, border: `1px solid ${c.inputBorder}` }} />
                </div>
              </div>
              <button onClick={async () => {
                const res = await fetch('/api/creator/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'update_profile', ...settingsForm }) })
                if (res.ok) { setSettingsMsg(t.saved); setTimeout(() => setSettingsMsg(''), 2000) }
              }} className="font-dm text-[12px] font-semibold px-5 py-2 rounded-lg cursor-pointer" style={{ background: '#E8471A', color: '#fff', border: 'none' }}>
                {t.save}
              </button>
            </div>

            {/* Change email — with verification */}
            <div className="rounded-2xl p-5 mb-4" style={{ background: c.cardBg, border: `1px solid ${c.divider}` }}>
              <p className="font-dm text-white/50 text-[11px] uppercase tracking-[0.06em] mb-4">{t.settingsEmail}</p>
              {verifyStep !== 'email' ? (
                <>
                  <p className="font-dm text-white/40 text-[12px] mb-3">{locale === 'fr' ? 'Email actuel :' : 'Current email:'} <span className="text-white/70">{emailForm}</span></p>
                  <button onClick={async () => {
                    setVerifyStep('email'); setCodeSent(false); setVerifyCode(''); setSettingsMsg('')
                    try {
                      const res = await fetch('/api/creator/verify-code', { method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'send_code', purpose: 'change_email' }) })
                      if (res.ok) { setCodeSent(true) }
                      else { const d = await res.json(); setSettingsMsg(d.error || (locale === 'fr' ? 'Erreur lors de l\'envoi du code' : 'Error sending code')); setVerifyStep(null) }
                    } catch { setSettingsMsg(locale === 'fr' ? 'Erreur réseau' : 'Network error'); setVerifyStep(null) }
                  }} className="font-dm text-[12px] font-semibold px-5 py-2 rounded-lg cursor-pointer" style={{ background: '#E8471A', color: '#fff', border: 'none' }}>
                    {locale === 'fr' ? 'Modifier l\'email' : 'Change email'}
                  </button>
                </>
              ) : (
                <>
                  {codeSent && <p className="font-dm text-[#4ade80] text-[12px] mb-3">{locale === 'fr' ? 'Un code a été envoyé à votre email' : 'A code was sent to your email'}</p>}
                  <input value={verifyCode} onChange={e => setVerifyCode(e.target.value)} placeholder={locale === 'fr' ? 'Code à 6 chiffres' : '6-digit code'}
                    autoComplete="off" inputMode="numeric"
                    className="font-dm w-full rounded-lg text-[14px] text-white/90 placeholder:text-white/20 outline-none mb-3 text-center tracking-[0.3em] font-bold"
                    style={{ height: 44, padding: '0 12px', background: c.inputBg, border: `1px solid ${c.inputBorder}` }} maxLength={6} />
                  <input type="email" value={emailForm} onChange={e => setEmailForm(e.target.value)} placeholder={locale === 'fr' ? 'Nouvel email' : 'New email'}
                    autoComplete="off"
                    className="font-dm w-full rounded-lg text-[13px] text-white/90 placeholder:text-white/20 outline-none mb-3"
                    style={{ height: 40, padding: '0 12px', background: c.inputBg, border: `1px solid ${c.inputBorder}` }} />
                  <div className="flex gap-2">
                    <button onClick={() => { setVerifyStep(null); setVerifyCode('') }}
                      className="font-dm text-[12px] font-semibold px-4 py-2 rounded-lg cursor-pointer" style={{ background: c.inputBg, color: c.isLight ? '#777' : '#8a8580', border: 'none' }}>
                      {t.cancel}
                    </button>
                    <button onClick={async () => {
                      const res = await fetch('/api/creator/verify-code', { method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'verify_and_change', purpose: 'change_email', code: verifyCode, newEmail: emailForm }) })
                      const data = await res.json()
                      if (res.ok) { toast(locale === 'fr' ? 'Email modifié avec succès' : 'Email changed successfully', 'success'); setVerifyStep(null); setVerifyCode('') }
                      else setSettingsMsg(data.error)
                    }} className="font-dm text-[12px] font-semibold px-5 py-2 rounded-lg cursor-pointer" style={{ background: '#E8471A', color: '#fff', border: 'none' }}>
                      {locale === 'fr' ? 'Confirmer' : 'Confirm'}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Change password — with verification */}
            <div className="rounded-2xl p-5" style={{ background: c.cardBg, border: `1px solid ${c.divider}` }}>
              <p className="font-dm text-white/50 text-[11px] uppercase tracking-[0.06em] mb-4">{t.settingsPassword}</p>
              {verifyStep !== 'password' ? (
                <button onClick={async () => {
                  setVerifyStep('password'); setCodeSent(false); setVerifyCode(''); setSettingsMsg('')
                  try {
                    const res = await fetch('/api/creator/verify-code', { method: 'POST', headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ action: 'send_code', purpose: 'change_password' }) })
                    if (res.ok) { setCodeSent(true) }
                    else { const d = await res.json(); setSettingsMsg(d.error || (locale === 'fr' ? 'Erreur lors de l\'envoi du code' : 'Error sending code')); setVerifyStep(null) }
                  } catch { setSettingsMsg(locale === 'fr' ? 'Erreur réseau' : 'Network error'); setVerifyStep(null) }
                }} className="font-dm text-[12px] font-semibold px-5 py-2 rounded-lg cursor-pointer" style={{ background: '#E8471A', color: '#fff', border: 'none' }}>
                  {locale === 'fr' ? 'Modifier le mot de passe' : 'Change password'}
                </button>
              ) : (
                <>
                  {codeSent && <p className="font-dm text-[#4ade80] text-[12px] mb-3">{locale === 'fr' ? 'Un code a été envoyé à votre email' : 'A code was sent to your email'}</p>}
                  <input value={verifyCode} onChange={e => setVerifyCode(e.target.value)} placeholder={locale === 'fr' ? 'Code à 6 chiffres' : '6-digit code'}
                    autoComplete="off" inputMode="numeric"
                    className="font-dm w-full rounded-lg text-[14px] text-white/90 placeholder:text-white/20 outline-none mb-3 text-center tracking-[0.3em] font-bold"
                    style={{ height: 44, padding: '0 12px', background: c.inputBg, border: `1px solid ${c.inputBorder}` }} maxLength={6} />
                  <input type="password" value={passwordForm.newPw} onChange={e => setPasswordForm(p => ({ ...p, newPw: e.target.value }))}
                    placeholder={t.newPassword} autoComplete="new-password"
                    className="font-dm w-full rounded-lg text-[13px] text-white/90 placeholder:text-white/20 outline-none mb-3"
                    style={{ height: 40, padding: '0 12px', background: c.inputBg, border: `1px solid ${c.inputBorder}` }} />
                  <div className="flex gap-2">
                    <button onClick={() => { setVerifyStep(null); setVerifyCode('') }}
                      className="font-dm text-[12px] font-semibold px-4 py-2 rounded-lg cursor-pointer" style={{ background: c.inputBg, color: c.isLight ? '#777' : '#8a8580', border: 'none' }}>
                      {t.cancel}
                    </button>
                    <button onClick={async () => {
                      const res = await fetch('/api/creator/verify-code', { method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'verify_and_change', purpose: 'change_password', code: verifyCode, newPassword: passwordForm.newPw }) })
                      const data = await res.json()
                      if (res.ok) { toast(locale === 'fr' ? 'Mot de passe modifié avec succès' : 'Password changed successfully', 'success'); setVerifyStep(null); setVerifyCode(''); setPasswordForm({ newPw: '' }) }
                      else setSettingsMsg(data.error)
                    }} className="font-dm text-[12px] font-semibold px-5 py-2 rounded-lg cursor-pointer" style={{ background: '#E8471A', color: '#fff', border: 'none' }}>
                      {locale === 'fr' ? 'Confirmer' : 'Confirm'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Contract modal */}
      {contractBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="rounded-2xl w-full animate-fade-in overflow-y-auto" style={{ maxWidth: 520, maxHeight: '85vh', background: c.cardBg, border: `1px solid ${c.divider}`, padding: 'clamp(16px, 5vw, 28px)' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-dm font-bold text-[18px]" style={{ color: c.text }}>{t.contractTitle}</h3>
              <button onClick={() => setContractBooking(null)} className="font-dm text-[18px] cursor-pointer" style={{ background: 'none', border: 'none', color: c.textMuted }}>×</button>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap justify-between gap-x-4 gap-y-1"><span className="font-dm text-[12px]" style={{ color: c.textMuted }}>Restaurant</span><span className="font-dm text-[13px] font-semibold text-right" style={{ color: c.text }}>{contractBooking.restaurant_name}</span></div>
              <div className="flex flex-wrap justify-between gap-x-4 gap-y-1"><span className="font-dm text-[12px]" style={{ color: c.textMuted }}>{locale === 'fr' ? 'Adresse' : 'Address'}</span><span className="font-dm text-[13px] text-right" style={{ color: c.text }}>{contractBooking.restaurant_address}, {contractBooking.restaurant_city}</span></div>
              <div className="flex flex-wrap justify-between gap-x-4 gap-y-1"><span className="font-dm text-[12px]" style={{ color: c.textMuted }}>{locale === 'fr' ? 'Créateur' : 'Creator'}</span><span className="font-dm text-[13px] font-semibold text-right" style={{ color: c.text }}>@{profile?.username || profile?.first_name}</span></div>
              <div className="flex flex-wrap justify-between gap-x-4 gap-y-1"><span className="font-dm text-[12px]" style={{ color: c.textMuted }}>Date</span><span className="font-dm text-[13px] text-right" style={{ color: c.text }}>{(() => { const [y, m, d] = (contractBooking.booking_date?.slice(0, 10) || '').split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' }) })()}</span></div>
              <div className="flex flex-wrap justify-between gap-x-4 gap-y-1"><span className="font-dm text-[12px]" style={{ color: c.textMuted }}>{locale === 'fr' ? 'Horaire' : 'Time'}</span><span className="font-dm text-[13px] text-right" style={{ color: c.text }}>{contractBooking.start_time?.slice(0, 5)} - {contractBooking.end_time?.slice(0, 5)}</span></div>
              <div className="flex flex-wrap justify-between gap-x-4 gap-y-1"><span className="font-dm text-[12px]" style={{ color: c.textMuted }}>{t.contractPeople}</span><span className="font-dm text-[13px] text-right" style={{ color: c.text }}>{contractBooking.num_people || 1}</span></div>

              <div style={{ height: 1, background: c.divider, margin: '8px 0' }} />

              {/* Virality bonus */}
              {contractBooking.restaurant_virality_tiers?.length > 0 && (
                <div>
                  <p className="font-dm text-[12px] font-semibold mb-1" style={{ color: '#E8471A' }}>{locale === 'fr' ? 'Prime de viralité' : 'Virality bonus'}</p>
                  {contractBooking.restaurant_virality_tiers.map((tier, i) => (
                    <p key={i} className="font-dm text-[12px]" style={{ color: c.text }}>&gt; {(tier.views / 1000).toFixed(0)}k {locale === 'fr' ? 'vues' : 'views'} → +{tier.bonus}€</p>
                  ))}
                  <p className="font-dm text-[11px] mt-1" style={{ color: c.textMuted }}>{t.contractViralityNote}</p>
                </div>
              )}

              <div style={{ height: 1, background: c.divider, margin: '8px 0' }} />

              <div className="flex justify-between"><span className="font-dm text-[12px]" style={{ color: c.textMuted }}>{t.contractDeadline}</span><span className="font-dm text-[13px]" style={{ color: c.text }}>J+5 ({(() => { const [y, m, d] = (contractBooking.booking_date?.slice(0, 10) || '').split('-').map(Number); const dl = new Date(y, m - 1, d); dl.setDate(dl.getDate() + 5); return dl.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long' }) })()})</span></div>
              <div className="flex justify-between"><span className="font-dm text-[12px]" style={{ color: c.textMuted }}>{t.contractDuration}</span><span className="font-dm text-[13px]" style={{ color: c.text }}>12 {locale === 'fr' ? 'mois' : 'months'}</span></div>
              <div className="flex justify-between"><span className="font-dm text-[12px]" style={{ color: c.textMuted }}>{t.contractMention}</span><span className="font-dm text-[13px] font-semibold" style={{ color: '#E8471A' }}>{t.contractMentionText}</span></div>

              <div className="rounded-lg p-3 mt-2" style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${c.divider}` }}>
                <p className="font-dm text-[11px]" style={{ color: c.textMuted }}>
                  {t.contractCGU}{' '}
                  <a href="/legal/cgu-creators" target="_blank" className="text-[#E8471A] underline" style={{ textUnderlineOffset: 2 }}>CGU</a>
                </p>
              </div>
            </div>

            <button onClick={() => setContractBooking(null)} className="font-dm w-full text-[12px] font-semibold py-2.5 rounded-lg cursor-pointer mt-5"
              style={{ background: c.inputBg, color: c.textMuted, border: `1px solid ${c.divider}` }}>{locale === 'fr' ? 'Fermer' : 'Close'}</button>
          </div>
        </div>
      )}

      {/* Slot picker modal */}
      {bookingRestaurant && calendarDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full rounded-2xl animate-step-in" style={{
            maxWidth: 440, padding: 'clamp(16px, 5vw, 24px)',
            background: c.cardBg,
            border: `1px solid ${c.divider}`,
          }}>
            <h3 className="font-dm text-white font-semibold text-[17px] mb-1">{t.bookTitle}</h3>
            <p className="font-dm text-[#E8471A] text-[14px] font-semibold">{bookingRestaurant.name}</p>
            <p className="font-dm text-white/40 text-[12px] mb-4">
              {(() => { const [y, m, d] = calendarDate.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' }); })()}
            </p>

            {/* Time slots */}
            <label className="font-dm text-white/50 text-[11px] uppercase tracking-[0.06em] block mb-2">
              {locale === 'fr' ? 'Choisir un créneau' : 'Choose a time slot'}
            </label>
            {slotsLoading ? (
              <div className="flex justify-center py-4">
                <span className="animate-spin inline-block w-5 h-5 border-2 border-[#E8471A]/30 border-t-[#E8471A] rounded-full" />
              </div>
            ) : availableSlots.length === 0 ? (
              <p className="font-dm text-white/30 text-[13px] mb-4">{locale === 'fr' ? 'Aucun créneau disponible' : 'No slots available'}</p>
            ) : (
              <div className="flex flex-wrap gap-2 mb-4">
                {availableSlots.map((s, i) => (
                  <button key={i} disabled={!s.available}
                    onClick={() => { setSelectedSlot({ start: s.start, end: s.end, timeSlotId: s.timeSlotId }); setBookingError('') }}
                    className="font-dm text-[12px] px-3 py-2 rounded-lg cursor-pointer transition-all disabled:opacity-25 disabled:cursor-not-allowed"
                    style={{
                      background: selectedSlot?.start === s.start ? 'rgba(232,71,26,0.2)' : c.inputBg,
                      color: selectedSlot?.start === s.start ? '#E8471A' : (s.available ? (c.isLight ? '#333' : 'rgba(255,255,255,0.7)') : (c.isLight ? '#ccc' : 'rgba(255,255,255,0.15)')),
                      border: `1px solid ${selectedSlot?.start === s.start ? 'rgba(232,71,26,0.3)' : c.inputBorder}`,
                      fontWeight: selectedSlot?.start === s.start ? 700 : 400,
                    }}
                  >
                    {s.start} - {s.end}
                  </button>
                ))}
              </div>
            )}

            {/* People picker */}
            {selectedSlot && (
              <div className="mb-4">
                <label className="font-dm text-white/50 text-[11px] uppercase tracking-[0.06em] block mb-2">
                  {locale === 'fr' ? 'Nombre de personnes' : 'Number of people'}
                </label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setNumPeople(p => Math.max(1, p - 1))}
                    className="font-dm text-[16px] w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer"
                    style={{ background: c.inputBg, border: `1px solid ${c.inputBorder}`, color: c.isLight ? '#333' : '#fff' }}>-</button>
                  <span className="font-dm text-white font-bold text-[16px]" style={{ minWidth: 20, textAlign: 'center' }}>{numPeople}</span>
                  <button onClick={() => setNumPeople(p => Math.min(bookingRestaurant.max_people || 2, p + 1))}
                    className="font-dm text-[16px] w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer"
                    style={{ background: c.inputBg, border: `1px solid ${c.inputBorder}`, color: c.isLight ? '#333' : '#fff' }}>+</button>
                  <span className="font-dm text-white/30 text-[11px]">max {bookingRestaurant.max_people || 2}</span>
                </div>
              </div>
            )}

            {bookingError && (
              <div className="font-dm text-[13px] text-red-400 mb-4 p-3 rounded-lg" style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.15)',
              }}>{bookingError}</div>
            )}

            <div className="flex gap-3">
              <button onClick={() => { setBookingRestaurant(null); setCalendarDate(null); setSelectedSlot(null); setBookingError('') }}
                className="font-dm flex-1 text-[13px] font-semibold py-3 rounded-lg cursor-pointer transition-all"
                style={{ background: c.inputBg, color: c.isLight ? '#777' : '#8a8580', border: 'none' }}>
                {t.cancel}
              </button>
              <button onClick={handleBook} disabled={!selectedSlot || bookingLoading}
                className="font-dm flex-1 text-[13px] font-semibold py-3 rounded-lg cursor-pointer transition-all disabled:opacity-40"
                style={{ background: '#E8471A', color: '#fff', border: 'none' }}>
                {bookingLoading ? t.booking : t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
