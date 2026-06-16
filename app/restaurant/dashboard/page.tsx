'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import LanguageToggle from '@/components/LanguageToggle'
import ThemeToggle from '@/components/ThemeToggle'
import NotificationBell from '@/components/NotificationBell'
import { useTheme } from '@/context/ThemeContext'
import { useToast } from '@/components/ui/Toast'
import RatingWidget from '@/components/RatingWidget'
import OnboardingTour from '@/components/restaurant/OnboardingTour'
import { fireOffrePubliee } from '@/lib/pixels'

const T = {
  fr: {
    logout: 'Déconnexion', hi: 'Bonjour,',
    tabOffers: 'Mon offre', tabCollabs: 'Collabs', tabMessages: 'Messages', tabCreators: 'Créateurs', tabSub: 'Abonnement', tabSettings: 'Réglages',
    settingsProfile: 'Informations', settingsSocials: 'Réseaux sociaux', settingsPassword: 'Changer le mot de passe', settingsEmail: "Changer l'email",
    currentPassword: 'Mot de passe actuel', newPassword: 'Nouveau mot de passe', save: 'Enregistrer', saved: 'Enregistré !', cancel: 'Annuler',
    autoAccept: 'Accepter automatiquement les collabs', autoAcceptOff: 'Validation manuelle des collabs',
    weeklyLimit: 'Limite de collabs par semaine', weeklyLimitOff: 'Pas de limite hebdomadaire', weeklyLimitHint: 'Si activé, les créateurs ne pourront plus réserver pour une semaine où la limite est atteinte', perWeek: '/semaine',
    manageSlots: 'Gérer les créneaux', recurring: 'Chaque semaine', specificDate: 'Date précise',
    addSlot: '+ Ajouter', noSlots: 'Aucun créneau configuré', offerLabel: 'Offre pour les créateurs',
    saveOffer: 'Enregistrer',
    photos: 'Photos de votre établissement', addPhoto: 'Ajouter une URL de photo', phPhoto: 'https://exemple.com/photo.jpg', noPhotos: 'Aucune photo ajoutée',
    noCollabs: 'Aucune demande de collab', pending: 'En attente', confirmed: 'Confirmé', refused: 'Refusé', awaitingPayment: 'En attente de paiement',
    accept: 'Accepter', refuse: 'Refuser', pay: 'Payer et confirmer',
    noConvs: 'Aucune conversation', noConvSub: 'Les conversations apparaîtront ici après une collab confirmée.',
    selectConv: 'Sélectionne une conversation', noMessages: 'Pas encore de messages',
    messagePh: 'Écrire un message...', send: 'Envoyer',
    noCreators: 'Aucun créateur disponible',
    currentPlan: 'Abonnement actuel', usage: 'Utilisation ce mois', included: 'incluses',
    extras: 'extras', toInvoice: 'à facturer', unlimited: 'Collabs illimitées',
    changePlan: 'Changer de plan', free: 'Sans abonnement', perCollab: '/collab extra',
    subscribe: 'Souscrire', switchToYearly: 'Passer en annuel -20%', switchToMonthly: 'Passer en mensuel',
    cancelSub: 'Résilier mon abonnement',
    cancelling: 'Résiliation...', cancelled: 'Résiliation programmée',
    cancelTitle: 'Avant de partir…',
    cancelKeepPlan: 'Garder mon abonnement',
    cancelSwitchYearly: 'Passer en annuel et économiser 20%',
    cancelPauseSub: 'Mettre en pause (revenir plus tard)',
    cancelConfirmFinal: 'Résilier définitivement',
    cancelBenefit1: 'collabs confirmées ce mois',
    cancelBenefit2: 'créateurs dans votre réseau',
    cancelBenefit3: 'Vous perdrez l\'accès aux tarifs préférentiels',
    cancelReasonTitle: 'Qu\'est-ce qui pourrait être amélioré ?',
    cancelReasonPrice: 'Trop cher',
    cancelReasonNoUse: 'Je n\'utilise pas assez la plateforme',
    cancelReasonOther: 'Autre raison',
    cancelFinalWarning: 'Votre abonnement restera actif jusqu\'à la fin de la période en cours. Après cette date, vous passerez automatiquement au plan gratuit.',
    activeSub: 'Abonnement actif',
    trialBadge: 'Essai gratuit', trialDaysLeft: 'jours restants', trialCollabsLeft: 'collabs gratuites restantes',
    trialEnds: 'Votre essai se termine le', trialExpired: 'Essai terminé',
    trialNote: 'Les réservations dont la date est après la fin de votre essai seront facturées.',
    upgradeNow: 'Passer à un abonnement',
    directives: 'Directives aux créateurs', directivesHint: 'Instructions spécifiques que vous souhaitez communiquer aux créateurs lors de leur visite',
    directivesPh: 'Ex : Filmez en lumière naturelle, mentionnez notre spécialité du jour…',
    proOnly: 'Passez au niveau Pro pour débloquer cette fonctionnalité.',
    invite: 'Envoyer une invitation', inviteSent: 'Invitation envoyée', inviteMax: 'Max 10 invitations/mois',
    viralityRef: 'Tarifs de référence',
    viewContract: 'Voir le contrat', contractTitle: 'Fiche Collaboration',
    contractPeople: 'Nombre de personnes', contractDeadline: 'Date limite de publication',
    contractDuration: 'Durée de maintien en ligne', contractMention: 'Mention obligatoire',
    contractMentionText: 'Collaboration commerciale', contractViralityNote: '75% revient au créateur, 25% à 2960',
    contractCGU: 'Les CGU de 2960 Agency s\'appliquent.',
    payPrime: 'Payer la prime', payPrimeConfirm: 'Confirmer le paiement de la prime ?',
    paying: 'Paiement...', primePaid: 'Prime payée',
    daysToPublish: 'jours pour publier', postSubmitted: 'Post soumis',
    contestDeadline: 'jours pour contester',
    reportPost: 'Signaler ce post', reportReason: 'Raison du signalement',
    reportReasonPh: 'Ex : Le lien ne correspond pas à la collab…',
    reportSend: 'Envoyer le signalement', reportSent: 'Signalement envoyé',
    reporting: 'Envoi…',
  },
  en: {
    logout: 'Log out', hi: 'Hello,',
    tabOffers: 'My offer', tabCollabs: 'Collabs', tabMessages: 'Messages', tabCreators: 'Creators', tabSub: 'Subscription', tabSettings: 'Settings',
    settingsProfile: 'Information', settingsSocials: 'Social media', settingsPassword: 'Change password', settingsEmail: 'Change email',
    currentPassword: 'Current password', newPassword: 'New password', save: 'Save', saved: 'Saved!', cancel: 'Cancel',
    autoAccept: 'Auto-accept collabs', autoAcceptOff: 'Manual collab validation',
    weeklyLimit: 'Weekly collab limit', weeklyLimitOff: 'No weekly limit', weeklyLimitHint: 'When enabled, creators cannot book a week that has reached the limit', perWeek: '/week',
    manageSlots: 'Manage time slots', recurring: 'Every week', specificDate: 'Specific date',
    addSlot: '+ Add', noSlots: 'No time slots configured', offerLabel: 'Offer for creators',
    saveOffer: 'Save',
    photos: 'Photos of your venue', addPhoto: 'Add a photo URL', phPhoto: 'https://example.com/photo.jpg', noPhotos: 'No photos added',
    noCollabs: 'No collab requests', pending: 'Pending', confirmed: 'Confirmed', refused: 'Refused', awaitingPayment: 'Awaiting payment',
    accept: 'Accept', refuse: 'Refuse', pay: 'Pay & confirm',
    noConvs: 'No conversations', noConvSub: 'Conversations will appear here after a confirmed collab.',
    selectConv: 'Select a conversation', noMessages: 'No messages yet',
    messagePh: 'Write a message...', send: 'Send',
    noCreators: 'No creators available',
    currentPlan: 'Current plan', usage: 'Usage this month', included: 'included',
    extras: 'extras', toInvoice: 'to invoice', unlimited: 'Unlimited collabs',
    changePlan: 'Change plan', free: 'No subscription', perCollab: '/extra collab',
    subscribe: 'Subscribe', switchToYearly: 'Switch to yearly -20%', switchToMonthly: 'Switch to monthly',
    cancelSub: 'Cancel subscription',
    cancelling: 'Cancelling...', cancelled: 'Cancellation scheduled',
    cancelTitle: 'Before you go…',
    cancelKeepPlan: 'Keep my subscription',
    cancelSwitchYearly: 'Switch to yearly and save 20%',
    cancelPauseSub: 'Pause (come back later)',
    cancelConfirmFinal: 'Cancel permanently',
    cancelBenefit1: 'confirmed collabs this month',
    cancelBenefit2: 'creators in your network',
    cancelBenefit3: 'You\'ll lose access to preferential rates',
    cancelReasonTitle: 'What could we improve?',
    cancelReasonPrice: 'Too expensive',
    cancelReasonNoUse: 'I don\'t use the platform enough',
    cancelReasonOther: 'Other reason',
    cancelFinalWarning: 'Your subscription will remain active until the end of the current billing period. After that, you\'ll automatically switch to the free plan.',
    activeSub: 'Active subscription',
    trialBadge: 'Free trial', trialDaysLeft: 'days left', trialCollabsLeft: 'free collabs remaining',
    trialEnds: 'Your trial ends on', trialExpired: 'Trial ended',
    trialNote: 'Bookings with a date after your trial ends will be charged.',
    upgradeNow: 'Upgrade to a plan',
    directives: 'Directives for creators', directivesHint: 'Specific instructions you want to share with creators during their visit',
    directivesPh: 'e.g. Film in natural light, mention our daily special…',
    proOnly: 'Upgrade to Pro to unlock this feature.',
    invite: 'Send an invitation', inviteSent: 'Invitation sent', inviteMax: 'Max 10 invitations/month',
    viralityRef: 'Reference rates',
    viewContract: 'View contract', contractTitle: 'Collaboration Sheet',
    contractPeople: 'Number of people', contractDeadline: 'Publication deadline',
    contractDuration: 'Online maintenance duration', contractMention: 'Required mention',
    contractMentionText: 'Commercial collaboration', contractViralityNote: '75% goes to the creator, 25% to 2960',
    contractCGU: '2960 Agency\'s terms apply.',
    payPrime: 'Pay the bonus', payPrimeConfirm: 'Confirm bonus payment?',
    paying: 'Paying...', primePaid: 'Bonus paid',
    daysToPublish: 'days to publish', postSubmitted: 'Post submitted',
    contestDeadline: 'days to contest',
    reportPost: 'Report this post', reportReason: 'Reason for reporting',
    reportReasonPh: 'e.g. The link does not match the collab…',
    reportSend: 'Send report', reportSent: 'Report sent',
    reporting: 'Sending…',
  },
}

const PLANS = [
  { id: 'free', name: 'Sans abonnement', nameEn: 'No subscription', price: '0', priceYearly: '0', included: 0, extra: 35 },
  { id: 'basic', name: 'Basic', nameEn: 'Basic', price: '29', priceYearly: '278', included: 1, extra: 20 },
  { id: 'active', name: 'Active', nameEn: 'Active', price: '69', priceYearly: '662', included: 4, extra: 14 },
  { id: 'pro', name: 'Pro', nameEn: 'Pro', price: '119', priceYearly: '1142', included: 999, extra: 0 },
  { id: 'pro_assist', name: 'Pro + Assist', nameEn: 'Pro + Assist', price: '499', priceYearly: '', included: 999, extra: 0 },
]

interface Booking {
  id: number; booking_date: string; status: string
  creator_first_name: string; creator_last_name: string
  creator_tiktok: string; creator_instagram: string
  creator_email: string; creator_phone: string
  start_time: string; end_time: string
  post_link?: string; post_submitted_at?: string
  claimed_tier?: { views: number; bonus: number }; claim_status?: string
  restaurant_virality_tiers?: { views: number; bonus: number }[]
  restaurant_offer?: string; restaurant_name?: string; restaurant_address?: string
  max_people?: number; creator_username?: string
  reported_by_restaurant?: boolean; post_overdue?: boolean
}

interface Conversation {
  booking_id: number; booking_date: string
  creator_first_name: string; creator_last_name: string; creator_tiktok: string
  unread_count: number; total_messages: number
  last_message: string; last_sender: string; last_message_at: string
}

interface Creator {
  id: number; username: string | null; first_name: string; last_name: string
  tiktok_username: string; instagram_username: string
  city: string; niche: string[]; audience_size: string
  showcase_posts: string[]
}

interface SubInfo {
  plan: string; billingCycle: string | null; includedCollabs: number; extraCollabPrice: number
  monthUsage: number; extras: number; extraCost: number; hasStripe: boolean
  onTrial: boolean; trialDaysLeft: number; trialCollabsUsed: number
  trialCollabsRemaining: number; trialEndsAt: string | null
}

interface ChatMsg { id: number; sender_type: string; sender_name: string; content: string; created_at: string }

export default function RestaurantDashboard() {
  const { locale } = useLanguage()
  const { c } = useTheme()
  const { toast, confirmModal } = useToast()
  const t = T[locale]
  const router = useRouter()
  const [tab, setTab] = useState<'offers' | 'collabs' | 'messages' | 'creators' | 'subscription' | 'settings'>('offers')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [totalUnread, setTotalUnread] = useState(0)
  const [creators, setCreators] = useState<Creator[]>([])
  const [creatorPhotoIdx, setCreatorPhotoIdx] = useState<Record<number, number>>({})
  const [subInfo, setSubInfo] = useState<SubInfo | null>(null)
  const [autoAccept, setAutoAccept] = useState(true)
  const [maxPerWeek, setMaxPerWeek] = useState<number | null>(null)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [cancelStep, setCancelStep] = useState<0 | 1 | 2>(0) // 0=closed, 1=benefits, 2=reason
  const [cancelReason, setCancelReason] = useState('')
  const [cancelLoading, setCancelLoading] = useState(false)
  const [ownerName, setOwnerName] = useState('')
  const [loading, setLoading] = useState(true)
  const [mySlots, setMySlots] = useState<{ id: number; day_of_week: number; start_time: string; end_time: string; max_bookings: number; specific_date: string | null; is_active: boolean }[]>([])
  const [myOffer, setMyOffer] = useState('')
  const [maxPeople, setMaxPeople] = useState(2)
  const [viralityTiers, setViralityTiers] = useState<{ views: number; bonus: number }[]>([])
  const [myPhotos, setMyPhotos] = useState<string[]>([])
  const [newPhotoUrl, setNewPhotoUrl] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [directives, setDirectives] = useState('')
  const [dietaryOptions, setDietaryOptions] = useState<string[]>([])
  const [showViralityRef, setShowViralityRef] = useState(false)
  const [inviteSending, setInviteSending] = useState<number | null>(null)
  const [invitedCreators, setInvitedCreators] = useState<Set<number>>(new Set())
  const [contractBooking, setContractBooking] = useState<Booking | null>(null)
  const [payingPrime, setPayingPrime] = useState<number | null>(null)
  const [reportBookingId, setReportBookingId] = useState<number | null>(null)
  const [reportReason, setReportReason] = useState('')
  const [reportSending, setReportSending] = useState(false)
  const [reportedBookings, setReportedBookings] = useState<Set<number>>(new Set())
  const [slotMode, setSlotMode] = useState<'recurring' | 'date'>('recurring')
  const [newSlot, setNewSlot] = useState({ dayOfWeek: '1', startTime: '12:00', endTime: '14:00', maxBookings: '1', date: '' })
  const [restoSettings, setRestoSettings] = useState({ ownerName: '', phone: '', businessName: '', cuisineType: '', address: '', city: '', arrondissement: '', tiktok: '', instagram: '', website: '', siren: '', avgMealPrice: '' })
  const [restoPasswordForm, setRestoPasswordForm] = useState({ newPw: '' })
  const [restoEmailForm, setRestoEmailForm] = useState('')
  const [restoSettingsMsg, setRestoSettingsMsg] = useState('')
  const [restoVerifyStep, setRestoVerifyStep] = useState<null | 'email' | 'password'>(null)
  const [restoVerifyCode, setRestoVerifyCode] = useState('')
  const [restoCodeSent, setRestoCodeSent] = useState(false)
  const [restoSettingsLoaded, setRestoSettingsLoaded] = useState(false)
  const [chatBookingId, setChatBookingId] = useState<number | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatSending, setChatSending] = useState(false)
  const [reviewBookingId, setReviewBookingId] = useState<number | null>(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewedBookings, setReviewedBookings] = useState<Set<number>>(new Set())
  const [isFirstTime, setIsFirstTime] = useState(false)
  const [firstPublishedAt, setFirstPublishedAt] = useState<string | null>(null)
  const [showTour, setShowTour] = useState(false)
  const [showPublishConfirm, setShowPublishConfirm] = useState(false)
  const [autoSaveIndicator, setAutoSaveIndicator] = useState(false)
  const [showHelpMenu, setShowHelpMenu] = useState(false)
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [onboardingGate, setOnboardingGate] = useState(false)
  const [onboardingForm, setOnboardingForm] = useState({ ownerName: '', phone: '', address: '', city: '' })
  const [onboardingSaving, setOnboardingSaving] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const [bRes, cRes, sRes, mRes, colRes] = await Promise.all([
        fetch('/api/restaurant/bookings'),
        fetch('/api/restaurant/creators'),
        fetch('/api/restaurant/subscription'),
        fetch('/api/restaurant/messages'),
        fetch('/api/restaurant/collabs'),
      ])
      if (bRes.status === 401) { router.push('/restaurant/login'); return }

      const bData = await bRes.json()
      const cData = await cRes.json()
      const sData = await sRes.json()
      const mData = await mRes.json()

      setBookings(bData.bookings || [])
      setCreators(cData.creators || [])
      setSubInfo(sData.plan ? sData : null)
      setConversations(mData.conversations || [])
      setTotalUnread(mData.totalUnread || 0)

      const colData = await colRes.json()
      setMySlots(colData.slots || [])
      if (colData.offerDescription) setMyOffer(colData.offerDescription)
      setMaxPeople(colData.maxPeople || 2)
      setViralityTiers(colData.viralityTiers || [])
      setMyPhotos(colData.photos || [])
      setIsPublished(colData.isPublished || false)
      setDirectives(colData.directives || '')
      setDietaryOptions(colData.dietaryOptions || [])
      setMaxPerWeek(colData.maxPerWeek ?? null)
      setAutoAccept(colData.autoAccept !== false)
      setIsFirstTime(colData.isFirstTime || false)
      setFirstPublishedAt(colData.firstPublishedAt || null)
      // Check if restaurant needs to complete onboarding (missing address)
      if (colData.isFirstTime) {
        // Fetch profile to check if address/owner are filled
        try {
          const profRes = await fetch('/api/restaurant/profile')
          if (profRes.ok) {
            const profData = await profRes.json()
            const r = profData.restaurant
            const u = profData.user
            // Gate: if no address filled yet, force completion
            if (!r?.address || r.address.trim() === '') {
              setOnboardingGate(true)
              setOnboardingForm({ ownerName: u?.owner_name || '', phone: u?.phone || '', address: r?.address || '', city: r?.city || '' })
            }
          }
        } catch { /* non-blocking */ }
        setMaxPeople(3)
        setMaxPerWeek(5)
      }

      // Get auto_accept from cookie session
      try {
        const cookie = document.cookie.split(';').find(c => c.trim().startsWith('restaurant_session='))
        if (cookie) {
          const data = JSON.parse(atob(cookie.split('=')[1]))
          setOwnerName(data.ownerName || '')
        }
      } catch { /* */ }
    } catch { router.push('/restaurant/login') }
    finally { setLoading(false) }
  }, [router])

  useEffect(() => { fetchData() }, [fetchData])

  const handleBookingAction = async (bookingId: number, action: 'accept' | 'refuse') => {
    const res = await fetch('/api/restaurant/bookings', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, action }),
    })
    const data = await res.json()

    // If payment is required, redirect to Stripe Checkout
    if (data.needsPayment && data.checkoutUrl) {
      window.location.href = data.checkoutUrl
      return
    }

    // Fallback error (restaurant not found, etc.)
    if (!res.ok) {
      toast(data.reason || data.error || (locale === 'fr' ? 'Erreur' : 'Error'), 'error')
      return
    }

    await fetchData()
  }

  const toggleAutoAccept = async () => {
    const newVal = !autoAccept
    setAutoAccept(newVal)
    await fetch('/api/restaurant/settings', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ autoAccept: newVal }),
    })
  }

  const saveMaxPerWeek = async (val: number | null) => {
    setMaxPerWeek(val)
    await fetch('/api/restaurant/settings', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ maxPerWeek: val }),
    })
  }

  const openChat = async (bookingId: number) => {
    setChatBookingId(bookingId)
    setChatMessages([])
    const res = await fetch('/api/restaurant/messages', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get_messages', bookingId }),
    })
    if (res.ok) { const d = await res.json(); setChatMessages(d.messages || []) }
    // Refresh unread
    const mRes = await fetch('/api/restaurant/messages')
    if (mRes.ok) { const d = await mRes.json(); setConversations(d.conversations || []); setTotalUnread(d.totalUnread || 0) }
  }

  // Poll messages every 5 seconds when chat is open
  useEffect(() => {
    if (!chatBookingId) return
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/restaurant/messages', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'get_messages', bookingId: chatBookingId }),
        })
        if (res.ok) { const d = await res.json(); setChatMessages(d.messages || []) }
      } catch { /* */ }
    }, 5000)
    return () => clearInterval(interval)
  }, [chatBookingId])

  const sendChat = async () => {
    if (!chatInput.trim() || !chatBookingId || chatSending) return
    setChatSending(true)
    const res = await fetch('/api/restaurant/messages', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'send', bookingId: chatBookingId, content: chatInput }),
    })
    if (res.ok) {
      setChatInput('')
      const r2 = await fetch('/api/restaurant/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_messages', bookingId: chatBookingId }),
      })
      if (r2.ok) { const d = await r2.json(); setChatMessages(d.messages || []) }
    }
    setChatSending(false)
  }

  const fetchRestoSettings = async () => {
    try {
      const res = await fetch('/api/restaurant/profile')
      if (res.ok) {
        const data = await res.json()
        const u = data.user
        setRestoSettings({
          ownerName: u.owner_name || '', phone: u.phone || '', businessName: u.business_name || '',
          cuisineType: data.restaurant?.cuisine_type || '', address: data.restaurant?.address || '',
          city: data.restaurant?.city || '', arrondissement: data.restaurant?.arrondissement || '',
          tiktok: data.restaurant?.tiktok_username || '', instagram: data.restaurant?.instagram_username || '',
          website: data.restaurant?.website || '',
          siren: data.restaurant?.siren || '', avgMealPrice: data.restaurant?.avg_meal_price ? String(data.restaurant.avg_meal_price) : '',
        })
        setRestoEmailForm(u.email || '')
        setRestoSettingsLoaded(true)
      }
    } catch { /* error */ }
  }

  useEffect(() => {
    if (tab === 'settings' && !restoSettingsLoaded) fetchRestoSettings()
  }, [tab, restoSettingsLoaded])

  const handleAddSlot = async () => {
    const payload = slotMode === 'recurring'
      ? { action: 'add_recurring', dayOfWeek: parseInt(newSlot.dayOfWeek), startTime: newSlot.startTime, endTime: newSlot.endTime, maxBookings: parseInt(newSlot.maxBookings) }
      : { action: 'add_date', date: newSlot.date, startTime: newSlot.startTime, endTime: newSlot.endTime, maxBookings: parseInt(newSlot.maxBookings) }
    if (slotMode === 'date' && !newSlot.date) return
    await fetch('/api/restaurant/collabs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    setNewSlot({ dayOfWeek: '1', startTime: '12:00', endTime: '14:00', maxBookings: '1', date: '' })
    await fetchData()
  }

  const handleDeleteSlot = async (slotId: number) => {
    await fetch('/api/restaurant/collabs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', slotId }) })
    await fetchData()
  }

  const [offerSaved, setOfferSaved] = useState(false)
  const [offerSaving, setOfferSaving] = useState(false)

  const handleSaveOffer = async () => {
    setOfferSaving(true)
    setOfferSaved(false)
    await fetch('/api/restaurant/collabs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'update_offer', maxPeople, viralityTiers, directives, dietaryOptions }) })
    setMyOffer(`Repas de 1 à ${maxPeople} personne${maxPeople > 1 ? 's' : ''}`)
    setOfferSaving(false)
    setOfferSaved(true)
    setTimeout(() => setOfferSaved(false), 3000)
  }

  const [uploading, setUploading] = useState(false)

  const [uploadProgress, setUploadProgress] = useState('')

  const handleUploadPhotos = async (files: FileList) => {
    setUploading(true)
    const total = files.length
    let uploaded = 0
    try {
      for (const file of Array.from(files)) {
        setUploadProgress(`${++uploaded}/${total}`)
        const form = new FormData()
        form.append('file', file)
        form.append('folder', '2960agency/restaurants')
        const res = await fetch('/api/upload', { method: 'POST', body: form })
        if (!res.ok) { const d = await res.json(); toast(d.error || `Upload failed: ${file.name}`, 'error'); continue }
        const { url } = await res.json()
        await fetch('/api/restaurant/collabs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'add_photo', url }) })
      }
      await fetchData()
    } finally { setUploading(false); setUploadProgress('') }
  }

  const handleAddPhoto = async () => {
    if (!newPhotoUrl.trim()) return
    await fetch('/api/restaurant/collabs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'add_photo', url: newPhotoUrl.trim() }) })
    setNewPhotoUrl('')
    await fetchData()
  }

  const handleRemovePhoto = async (url: string) => {
    await fetch('/api/restaurant/collabs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'remove_photo', url }) })
    await fetchData()
  }

  const handleTogglePublish = async () => {
    const newVal = !isPublished
    setIsPublished(newVal)
    await fetch('/api/restaurant/collabs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'toggle_publish', isPublished: newVal }) })
    if (newVal) fireOffrePubliee()
  }

  const handleFirstPublish = async () => {
    if (isFirstTime) {
      await fetch('/api/restaurant/collabs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'seed_defaults' }) })
    }
    setIsPublished(true)
    setFirstPublishedAt(new Date().toISOString())
    setIsFirstTime(false)
    await fetch('/api/restaurant/collabs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'toggle_publish', isPublished: true }) })
    fireOffrePubliee()
    setShowPublishConfirm(true)
    await fetchData()
  }

  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(async () => {
      await handleSaveOffer()
      setAutoSaveIndicator(true)
      setTimeout(() => setAutoSaveIndicator(false), 2000)
    }, 800)
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpdateSlot = async (slotId: number, startTime: string, endTime: string, maxBookings: number) => {
    await fetch('/api/restaurant/collabs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'update_slot', slotId, startTime, endTime, maxBookings }) })
    setAutoSaveIndicator(true)
    setTimeout(() => setAutoSaveIndicator(false), 2000)
    await fetchData()
  }

  const handleCompleteTour = async () => {
    setShowTour(false)
    await fetch('/api/restaurant/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tourSeen: true }) })
  }

  const handleCheckout = async (plan: string) => {
    if (plan === 'free') return
    const res = await fetch('/api/restaurant/checkout', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan, billing: billingCycle }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
  }

  const handleLogout = () => {
    document.cookie = 'restaurant_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    router.push('/restaurant/login')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: c.pageBg }}>
      <span className="animate-spin inline-block w-8 h-8 border-2 border-[#E8471A]/30 border-t-[#E8471A] rounded-full" />
    </div>
  )

  // Onboarding gate: force restaurant to complete profile before accessing dashboard
  if (onboardingGate) {
    const handleOnboardingSave = async () => {
      if (!onboardingForm.ownerName.trim() || !onboardingForm.address.trim()) return
      setOnboardingSaving(true)
      try {
        await fetch('/api/restaurant/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update_profile',
            ownerName: onboardingForm.ownerName.trim(),
            phone: onboardingForm.phone.trim(),
            businessName: restoSettings.businessName || ownerName,
            address: onboardingForm.address.trim(),
            city: onboardingForm.city.trim() || 'Paris',
          }),
        })
        setOnboardingGate(false)
        await fetchData()
      } catch { /* retry */ }
      setOnboardingSaving(false)
    }

    const obInputCls = "font-dm w-full rounded-xl text-[14px] text-white/90 placeholder:text-white/25 outline-none"
    const obInputStyle = { height: 48, padding: '0 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }

    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: c.pageBg }}>
        <div style={{ maxWidth: 440, width: '100%' }}>
          <h1 className="font-dm text-white text-[24px] sm:text-[30px] font-bold text-center mb-2">
            {locale === 'fr' ? 'Complétez votre restaurant' : 'Complete your restaurant'}
          </h1>
          <p className="font-dm text-white/40 text-[14px] text-center mb-8">
            {locale === 'fr' ? 'Ces infos sont nécessaires pour recevoir des créateurs.' : 'This info is needed to receive creators.'}
          </p>
          <div className="space-y-4">
            <div>
              <label className="font-dm text-white/50 text-[11px] font-semibold uppercase tracking-[0.06em] block mb-1.5">
                {locale === 'fr' ? 'Votre nom' : 'Your name'} <span className="text-[#E8471A]">*</span>
              </label>
              <input value={onboardingForm.ownerName} onChange={e => setOnboardingForm(p => ({ ...p, ownerName: e.target.value }))}
                placeholder={locale === 'fr' ? 'Jean Dupont' : 'Jane Smith'}
                className={obInputCls} style={obInputStyle} />
            </div>
            <div>
              <label className="font-dm text-white/50 text-[11px] font-semibold uppercase tracking-[0.06em] block mb-1.5">
                {locale === 'fr' ? 'Adresse du restaurant' : 'Restaurant address'} <span className="text-[#E8471A]">*</span>
              </label>
              <input value={onboardingForm.address} onChange={e => setOnboardingForm(p => ({ ...p, address: e.target.value }))}
                placeholder="12 rue de la Paix, 75002 Paris"
                className={obInputCls} style={obInputStyle} />
            </div>
            <div>
              <label className="font-dm text-white/50 text-[11px] font-semibold uppercase tracking-[0.06em] block mb-1.5">
                {locale === 'fr' ? 'Ville' : 'City'}
              </label>
              <input value={onboardingForm.city} onChange={e => setOnboardingForm(p => ({ ...p, city: e.target.value }))}
                placeholder="Paris"
                className={obInputCls} style={obInputStyle} />
            </div>
            <div>
              <label className="font-dm text-white/50 text-[11px] font-semibold uppercase tracking-[0.06em] block mb-1.5">
                {locale === 'fr' ? 'Téléphone' : 'Phone'} <span className="text-white/20 normal-case">(optionnel)</span>
              </label>
              <input type="tel" value={onboardingForm.phone} onChange={e => setOnboardingForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="+33 1 23 45 67 89"
                className={obInputCls} style={obInputStyle} />
            </div>
          </div>
          <button onClick={handleOnboardingSave} disabled={onboardingSaving || !onboardingForm.ownerName.trim() || !onboardingForm.address.trim()}
            className="font-dm w-full text-[15px] font-bold rounded-xl cursor-pointer transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            style={{ background: '#E8471A', color: '#fff', height: 52, border: 'none' }}>
            {onboardingSaving
              ? (locale === 'fr' ? 'Enregistrement...' : 'Saving...')
              : (locale === 'fr' ? 'Continuer vers mon offre' : 'Continue to my offer')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: c.pageBg }}>
      {/* Header */}
      <header className="sticky top-0 z-50" style={{ background: c.headerBg, backdropFilter: 'blur(16px)', borderBottom: `1px solid ${c.divider}` }}>
        <div className="flex items-center justify-between px-4 sm:px-8" style={{ height: 64 }}>
          <div className="flex items-center gap-4">
            <Link href="/" className="font-buster text-white/80 text-[10px] tracking-[0.18em] uppercase" style={{ textDecoration: 'none' }}>2960 Agency</Link>
            {ownerName && <span className="font-dm text-white/50 text-[13px]">{t.hi} <span className="text-white/80 font-semibold">{ownerName}</span></span>}
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <ThemeToggle />
            <LanguageToggle />
            <button onClick={handleLogout} className="font-dm text-white/30 text-[12px] hover:text-white/60 transition-colors cursor-pointer" style={{ background: 'none', border: 'none' }}>{t.logout}</button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="px-4 sm:px-8 py-5 overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="flex gap-1 rounded-xl p-1 w-max sm:w-auto" style={{ background: c.cardBg }}>
          {([
            { key: 'offers' as const, label: t.tabOffers, badge: 0 },
            { key: 'collabs' as const, label: t.tabCollabs, badge: bookings.filter(b => b.status === 'pending' || b.status === 'awaiting_payment').length },
            { key: 'messages' as const, label: t.tabMessages, badge: totalUnread },
            { key: 'creators' as const, label: t.tabCreators, badge: 0 },
            { key: 'subscription' as const, label: t.tabSub, badge: 0 },
            { key: 'settings' as const, label: t.tabSettings, badge: 0 },
          ]).map(tb => (
            <button key={tb.key} onClick={() => setTab(tb.key)}
              className="font-dm text-[13px] font-semibold px-4 sm:px-5 py-2.5 rounded-lg transition-all cursor-pointer relative"
              style={{ background: tab === tb.key ? '#E8471A' : 'transparent', color: tab === tb.key ? '#fff' : (c.isLight ? '#777' : 'rgba(255,255,255,0.4)'), border: 'none' }}>
              {tb.label}
              {tb.badge > 0 && <span className="absolute -top-1 -right-1 font-dm text-[10px] font-bold text-white rounded-full flex items-center justify-center" style={{ width: 18, height: 18, background: '#E8471A', border: '2px solid #191714' }}>{tb.badge}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 sm:px-8 pb-12">

        {/* === OFFERS TAB === */}
        {tab === 'offers' && (
          <div style={{ maxWidth: 720 }}>

            {/* Publish confirmation overlay */}
            {showPublishConfirm && (
              <div className="rounded-2xl p-6 mb-4 text-center" style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)' }}>
                <p className="font-dm text-[#4ade80] text-[20px] font-bold mb-2">{locale === 'fr' ? 'Vous êtes en ligne !' : 'You\'re live!'}</p>
                <p className="font-dm text-white/50 text-[14px] mb-3">{locale === 'fr' ? 'Vos 3 collabs offertes sont activées. On prévient les créateurs proches de chez vous.' : 'Your 3 free collabs are activated. We\'re notifying nearby creators.'}</p>
                <button onClick={() => setShowPublishConfirm(false)} className="font-dm text-[13px] font-semibold px-5 py-2 rounded-lg cursor-pointer" style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: 'none' }}>OK</button>
              </div>
            )}

            {/* Visibility toggle — only shown AFTER first publish */}
            {firstPublishedAt && !showPublishConfirm && (
              <div className="rounded-2xl p-5 mb-4" style={{
                background: isPublished ? 'rgba(74,222,128,0.04)' : c.cardBg,
                border: `1px solid ${isPublished ? 'rgba(74,222,128,0.15)' : c.divider}`,
              }}>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div onClick={handleTogglePublish}
                    className="w-12 h-6 rounded-full relative transition-all flex-shrink-0" style={{
                      background: isPublished ? '#4ade80' : 'var(--input-bg, rgba(255,255,255,0.1))',
                      border: isPublished ? 'none' : '1px solid var(--input-border, rgba(255,255,255,0.15))',
                    }}>
                    <div className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all" style={{ left: isPublished ? 26 : 2, boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                  </div>
                  <div>
                    <span className="font-dm font-semibold text-[14px] block" style={{ color: c.text }}>
                      {isPublished
                        ? (locale === 'fr' ? 'Offre en ligne' : 'Offer online')
                        : (locale === 'fr' ? 'Offre en pause — invisible, aucune nouvelle réservation' : 'Offer paused — invisible, no new bookings')}
                    </span>
                  </div>
                </label>
              </div>
            )}

            {/* Auto-save indicator */}
            {autoSaveIndicator && (
              <div className="flex items-center gap-2 mb-3 animate-fade-in">
                <span className="font-dm text-[#4ade80] text-[12px] font-semibold">{locale === 'fr' ? 'Enregistré ✓' : 'Saved ✓'}</span>
              </div>
            )}

            {/* Photo banner for new restaurants */}
            {myPhotos.length === 0 && (
              <div className="rounded-xl p-3 mb-4" style={{ background: 'rgba(232,71,26,0.06)', border: '1px solid rgba(232,71,26,0.12)' }}>
                <p className="font-dm text-[#E8471A]/80 text-[12px]">
                  {locale === 'fr' ? 'Ajoutez des photos — les offres avec photos attirent plus de créateurs.' : 'Add photos — offers with photos attract more creators.'}
                </p>
              </div>
            )}

            {/* Structured offer — max people */}
            <div data-tour="people" className="rounded-2xl p-5 mb-4" style={{ background: c.cardBg, border: `1px solid ${c.divider}` }}>
              <div className="flex items-center gap-2 mb-3">
                <label className="font-dm text-white/50 text-[11px] uppercase tracking-[0.06em]">{t.offerLabel}</label>
                <span className="font-dm text-white/20 text-[10px] cursor-help" title={locale === 'fr' ? 'Le créateur peut venir avec des accompagnants jusqu\'à ce nombre' : 'The creator can bring guests up to this number'}>ⓘ</span>
              </div>

              <div className="mb-4">
                <p className="font-dm text-white/60 text-[12px] mb-2">{locale === 'fr' ? 'Repas de 1 à combien de personnes ?' : 'Meal for 1 to how many people?'}</p>
                <div className="flex items-center gap-3">
                  <span className="font-dm text-white/40 text-[13px]">1 →</span>
                  <button onClick={() => { setMaxPeople(p => Math.max(1, p - 1)); triggerAutoSave() }}
                    className="font-dm w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer text-[16px]"
                    style={{ background: c.inputBg, border: `1px solid ${c.inputBorder}`, color: c.text }}>−</button>
                  <span className="font-dm text-[18px] font-bold" style={{ color: '#E8471A', minWidth: 24, textAlign: 'center' }}>{maxPeople}</span>
                  <button onClick={() => { setMaxPeople(p => Math.min(20, p + 1)); triggerAutoSave() }}
                    className="font-dm w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer text-[16px]"
                    style={{ background: c.inputBg, border: `1px solid ${c.inputBorder}`, color: c.text }}>+</button>
                  <span className="font-dm text-white/40 text-[12px]">{locale === 'fr' ? 'personnes' : 'people'}</span>
                </div>
              </div>

              {/* Virality bonus tiers */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-dm text-white/60 text-[12px]">{locale === 'fr' ? 'Prime de viralité (optionnel)' : 'Virality bonus (optional)'}</p>
                  <span className="font-dm text-white/20 text-[10px] cursor-help" title={locale === 'fr' ? 'Vous ne payez que si la vidéo dépasse le seuil de vues que vous fixez' : 'You only pay if the video exceeds the views threshold you set'}>ⓘ</span>
                </div>
                {viralityTiers.length === 0 && (
                  <p className="font-dm text-white/25 text-[11px] mb-3">
                    {locale === 'fr'
                      ? 'Ajoutez une prime pour attirer les meilleurs créateurs — vous fixez le seuil ET le montant, vous ne payez QUE si une vidéo les dépasse.'
                      : 'Add a bonus to attract the best creators — you set the threshold AND the amount, you only pay if a video exceeds them.'}
                  </p>
                )}

                {viralityTiers.map((tier, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <span className="font-dm text-white/40 text-[11px] flex-shrink-0">{locale === 'fr' ? 'Si >' : 'If >'}</span>
                    <input type="number" value={tier.views / 1000} onChange={e => {
                      const v = [...viralityTiers]; v[i] = { ...v[i], views: Math.max(1, parseInt(e.target.value) || 0) * 1000 }; setViralityTiers(v); triggerAutoSave()
                    }}
                      className="font-dm w-20 rounded-lg text-[13px] text-white/90 text-center outline-none"
                      style={{ height: 36, padding: '0 8px', background: c.inputBg, border: `1px solid ${c.inputBorder}` }} />
                    <span className="font-dm text-white/40 text-[11px] flex-shrink-0">k {locale === 'fr' ? 'vues →' : 'views →'}</span>
                    <input type="number" value={tier.bonus} onChange={e => {
                      const v = [...viralityTiers]; v[i] = { ...v[i], bonus: Math.max(1, parseInt(e.target.value) || 0) }; setViralityTiers(v); triggerAutoSave()
                    }}
                      className="font-dm w-20 rounded-lg text-[13px] text-white/90 text-center outline-none"
                      style={{ height: 36, padding: '0 8px', background: c.inputBg, border: `1px solid ${c.inputBorder}` }} />
                    <span className="font-dm text-white/40 text-[11px] flex-shrink-0">€</span>
                    <button onClick={() => { setViralityTiers(v => v.filter((_, j) => j !== i)); triggerAutoSave() }}
                      className="font-dm w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer text-[14px]"
                      style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: 'none' }}>×</button>
                  </div>
                ))}

                <button onClick={() => { setViralityTiers(v => [...v, { views: (v.length > 0 ? v[v.length - 1].views * 2 : 50000), bonus: (v.length > 0 ? Math.round(v[v.length - 1].bonus * 1.5) : 100) }]) }}
                  className="font-dm text-[11px] font-semibold px-3 py-1.5 rounded-lg cursor-pointer transition-all hover:brightness-110 mt-2"
                  style={{ background: 'rgba(232,71,26,0.12)', color: '#E8471A', border: '1px solid rgba(232,71,26,0.2)' }}>
                  + {locale === 'fr' ? 'Ajouter un palier' : 'Add a tier'}
                </button>
              </div>

              {/* Dietary options */}
              <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${c.divider}` }}>
                <label className="font-dm text-white/50 text-[11px] uppercase tracking-[0.06em] block mb-3">
                  {locale === 'fr' ? 'Vous proposez des plats' : 'You offer dishes'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'halal', label: 'Halal' },
                    { key: 'casher', label: 'Casher' },
                    { key: 'vegetarien', label: 'Végétarien' },
                    { key: 'vegan', label: 'Vegan' },
                    { key: 'sans_lactose', label: 'Sans lactose' },
                    { key: 'sans_gluten', label: 'Sans gluten' },
                  ].map(opt => {
                    const active = dietaryOptions.includes(opt.key)
                    return (
                      <button key={opt.key}
                        onClick={() => {
                          setDietaryOptions(prev => active ? prev.filter(o => o !== opt.key) : [...prev, opt.key])
                          triggerAutoSave()
                        }}
                        className="font-dm text-[12px] font-semibold px-3 py-1.5 rounded-full cursor-pointer transition-all"
                        style={{
                          background: active ? 'rgba(232,71,26,0.12)' : c.inputBg,
                          color: active ? '#E8471A' : 'rgba(255,255,255,0.5)',
                          border: `1px solid ${active ? 'rgba(232,71,26,0.3)' : c.inputBorder}`,
                        }}>
                        {active && '✓ '}{opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Directives for creators — Pro & Assist only */}
              <div className="mt-4">
                <label className="font-dm text-white/50 text-[11px] uppercase tracking-[0.06em] block mb-2">{t.directives}</label>
                {subInfo && (subInfo.plan === 'pro' || subInfo.plan === 'pro_assist') ? (
                  <>
                    <p className="font-dm text-white/25 text-[11px] mb-2">{t.directivesHint}</p>
                    <textarea value={directives} onChange={e => { setDirectives(e.target.value); triggerAutoSave() }}
                      placeholder={t.directivesPh} rows={3}
                      className="font-dm w-full rounded-lg text-[13px] text-white/90 placeholder:text-white/20 outline-none resize-none"
                      style={{ padding: '10px 12px', background: c.inputBg, border: `1px solid ${c.inputBorder}` }} />
                  </>
                ) : (
                  <p className="font-dm text-[#E8471A] text-[12px] px-3 py-2.5 rounded-lg" style={{ background: 'rgba(232,71,26,0.06)', border: '1px solid rgba(232,71,26,0.12)' }}>
                    {t.proOnly}
                  </p>
                )}
              </div>
            </div>

            {/* Time slots + auto-accept + weekly limit */}
            <div data-tour="slots" className="rounded-2xl p-5 mb-4" style={{ background: c.cardBg, border: `1px solid ${c.divider}` }}>
              <p className="font-dm text-white/50 text-[11px] uppercase tracking-[0.06em] mb-3">{t.manageSlots}</p>

              {/* First-time preview of default slots */}
              {isFirstTime && mySlots.length === 0 && (
                <div className="mb-4">
                  <p className="font-dm text-white/30 text-[10px] uppercase tracking-wider mb-1.5">{locale === 'fr' ? 'Créneaux par défaut (modifiables)' : 'Default slots (editable)'}</p>
                  <div className="space-y-1.5">
                    {['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'].map((d, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="font-dm text-white/40 text-[12px] w-8">{d}</span>
                        <span className="font-dm text-white/50 text-[12px]">12:00-15:00</span>
                        <span className="font-dm text-white/20 text-[12px]">+</span>
                        <span className="font-dm text-white/50 text-[12px]">19:00-21:00</span>
                      </div>
                    ))}
                  </div>
                  <p className="font-dm text-white/25 text-[11px] mt-2">{locale === 'fr' ? 'Ces créneaux seront créés à la publication. Vous pourrez les modifier après.' : 'These slots will be created on publish. You can edit them after.'}</p>
                </div>
              )}

              {/* Existing slots — inline editable */}
              {mySlots.length > 0 && (
                <div className="mb-4">
                  {(() => {
                    const DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
                    const recurring = mySlots.filter(s => !s.specific_date)
                    const specific = mySlots.filter(s => s.specific_date)
                    return (
                      <>
                        {recurring.length > 0 && (
                          <div className="mb-3">
                            <p className="font-dm text-white/30 text-[10px] uppercase tracking-wider mb-1.5">{t.recurring}</p>
                            <div className="space-y-1.5">
                              {recurring.map(s => (
                                <div key={s.id} className="flex items-center justify-between rounded-lg px-3 py-2 bg-white/[0.03] border border-white/[0.06]">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-dm text-white/60 text-[12px]">{DAYS[s.day_of_week]}</span>
                                    <input type="time" defaultValue={s.start_time?.slice(0, 5)}
                                      onBlur={e => { if (e.target.value !== s.start_time?.slice(0, 5)) handleUpdateSlot(s.id, e.target.value, s.end_time?.slice(0, 5) || '14:00', s.max_bookings) }}
                                      className="font-dm text-white/60 text-[12px] bg-transparent border-none outline-none w-16 cursor-pointer hover:text-white" />
                                    <span className="text-white/30">-</span>
                                    <input type="time" defaultValue={s.end_time?.slice(0, 5)}
                                      onBlur={e => { if (e.target.value !== s.end_time?.slice(0, 5)) handleUpdateSlot(s.id, s.start_time?.slice(0, 5) || '12:00', e.target.value, s.max_bookings) }}
                                      className="font-dm text-white/60 text-[12px] bg-transparent border-none outline-none w-16 cursor-pointer hover:text-white" />
                                    <span className="text-white/30 text-[11px]">max</span>
                                    <input type="number" defaultValue={s.max_bookings} min={1}
                                      onBlur={e => { const v = parseInt(e.target.value) || 1; if (v !== s.max_bookings) handleUpdateSlot(s.id, s.start_time?.slice(0, 5) || '12:00', s.end_time?.slice(0, 5) || '14:00', v) }}
                                      className="font-dm text-white/60 text-[12px] bg-transparent border-none outline-none w-8 text-center cursor-pointer hover:text-white" />
                                  </div>
                                  <button onClick={() => handleDeleteSlot(s.id)} className="font-dm text-red-400/60 hover:text-red-400 text-[18px] cursor-pointer" style={{ background: 'none', border: 'none' }}>&times;</button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {specific.length > 0 && (
                          <div>
                            <p className="font-dm text-white/30 text-[10px] uppercase tracking-wider mb-1.5">{t.specificDate}</p>
                            <div className="space-y-1.5">
                              {specific.map(s => (
                                <div key={s.id} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: 'rgba(232,71,26,0.04)', border: '1px solid rgba(232,71,26,0.08)' }}>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-dm text-[#E8471A] text-[12px]">{new Date(s.specific_date!).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                                    <input type="time" defaultValue={s.start_time?.slice(0, 5)}
                                      onBlur={e => { if (e.target.value !== s.start_time?.slice(0, 5)) handleUpdateSlot(s.id, e.target.value, s.end_time?.slice(0, 5) || '14:00', s.max_bookings) }}
                                      className="font-dm text-white/60 text-[12px] bg-transparent border-none outline-none w-16 cursor-pointer hover:text-white" />
                                    <span className="text-white/30">-</span>
                                    <input type="time" defaultValue={s.end_time?.slice(0, 5)}
                                      onBlur={e => { if (e.target.value !== s.end_time?.slice(0, 5)) handleUpdateSlot(s.id, s.start_time?.slice(0, 5) || '12:00', e.target.value, s.max_bookings) }}
                                      className="font-dm text-white/60 text-[12px] bg-transparent border-none outline-none w-16 cursor-pointer hover:text-white" />
                                    <span className="text-white/30 text-[11px]">max</span>
                                    <input type="number" defaultValue={s.max_bookings} min={1}
                                      onBlur={e => { const v = parseInt(e.target.value) || 1; if (v !== s.max_bookings) handleUpdateSlot(s.id, s.start_time?.slice(0, 5) || '12:00', s.end_time?.slice(0, 5) || '14:00', v) }}
                                      className="font-dm text-white/60 text-[12px] bg-transparent border-none outline-none w-8 text-center cursor-pointer hover:text-white" />
                                  </div>
                                  <button onClick={() => handleDeleteSlot(s.id)} className="font-dm text-red-400/60 hover:text-red-400 text-[18px] cursor-pointer" style={{ background: 'none', border: 'none' }}>&times;</button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )
                  })()}
                </div>
              )}

              {/* Add slot */}
              <div className="flex gap-1 rounded-lg p-0.5 mb-3" style={{ background: 'rgba(255,255,255,0.03)', display: 'inline-flex' }}>
                <button onClick={() => setSlotMode('recurring')} className="font-dm text-[11px] font-semibold px-3 py-1.5 rounded-md cursor-pointer transition-all"
                  style={{ background: slotMode === 'recurring' ? (c.isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)') : 'transparent', color: slotMode === 'recurring' ? (c.isLight ? '#111' : '#fff') : (c.isLight ? '#999' : 'rgba(255,255,255,0.3)'), border: 'none' }}>{t.recurring}</button>
                <button onClick={() => setSlotMode('date')} className="font-dm text-[11px] font-semibold px-3 py-1.5 rounded-md cursor-pointer transition-all"
                  style={{ background: slotMode === 'date' ? 'rgba(232,71,26,0.15)' : 'transparent', color: slotMode === 'date' ? '#E8471A' : (c.isLight ? '#999' : 'rgba(255,255,255,0.3)'), border: 'none' }}>{t.specificDate}</button>
              </div>
              <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:flex-wrap">
                {slotMode === 'recurring' ? (
                  <select value={newSlot.dayOfWeek} onChange={e => setNewSlot(p => ({ ...p, dayOfWeek: e.target.value }))}
                    className="font-dm rounded-lg text-[12px] text-white/90 outline-none cursor-pointer col-span-2"
                    style={{ height: 36, padding: '0 8px', background: c.inputBg, border: `1px solid ${c.inputBorder}` }}>
                    {['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'].map((d, i) => <option key={i} value={i}>{d}</option>)}
                  </select>
                ) : (
                  <input type="date" value={newSlot.date} onChange={e => setNewSlot(p => ({ ...p, date: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="font-dm rounded-lg text-[12px] text-white/90 outline-none col-span-2"
                    style={{ height: 36, padding: '0 8px', background: c.inputBg, border: `1px solid ${c.inputBorder}` }} />
                )}
                <input type="time" value={newSlot.startTime} onChange={e => setNewSlot(p => ({ ...p, startTime: e.target.value }))}
                  className="font-dm rounded-lg text-[12px] text-white/90 outline-none" style={{ height: 36, padding: '0 8px', background: c.inputBg, border: `1px solid ${c.inputBorder}`, minWidth: 0 }} />
                <input type="time" value={newSlot.endTime} onChange={e => setNewSlot(p => ({ ...p, endTime: e.target.value }))}
                  className="font-dm rounded-lg text-[12px] text-white/90 outline-none" style={{ height: 36, padding: '0 8px', background: c.inputBg, border: `1px solid ${c.inputBorder}`, minWidth: 0 }} />
                <input type="number" value={newSlot.maxBookings} onChange={e => setNewSlot(p => ({ ...p, maxBookings: e.target.value }))}
                  placeholder="Max" className="font-dm rounded-lg text-[12px] text-white/90 outline-none" style={{ height: 36, padding: '0 8px', background: c.inputBg, border: `1px solid ${c.inputBorder}`, minWidth: 0 }} />
                <button onClick={handleAddSlot} className="font-dm text-[12px] font-semibold px-4 py-2 rounded-lg cursor-pointer transition-all hover:brightness-110 col-span-2"
                  style={{ background: '#E8471A', color: '#fff', border: 'none', height: 36 }}>{t.addSlot}</button>
              </div>

              {/* Auto-accept toggle (moved from Collabs tab) */}
              <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${c.divider}` }}>
                <label className="flex items-center gap-3 cursor-pointer mb-4">
                  <div onClick={toggleAutoAccept} className="w-10 h-5 rounded-full relative transition-all" style={{ background: autoAccept ? '#E8471A' : 'var(--input-bg, rgba(255,255,255,0.1))', border: autoAccept ? 'none' : '1px solid var(--input-border, rgba(255,255,255,0.15))' }}>
                    <div className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all" style={{ left: autoAccept ? 22 : 2, boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-dm text-white/60 text-[13px]">{autoAccept ? t.autoAccept : t.autoAcceptOff}</span>
                    <span className="font-dm text-white/20 text-[10px] cursor-help" title={locale === 'fr' ? 'Les créateurs vérifiés réservent directement, sans validation manuelle de votre part' : 'Verified creators book directly without your manual approval'}>ⓘ</span>
                  </div>
                </label>

                {/* Weekly limit */}
                <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${c.divider}` }}>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div onClick={() => saveMaxPerWeek(maxPerWeek === null ? 5 : null)}
                      className="w-10 h-5 rounded-full relative transition-all" style={{
                        background: maxPerWeek !== null ? '#E8471A' : 'var(--input-bg, rgba(255,255,255,0.1))',
                        border: maxPerWeek !== null ? 'none' : '1px solid var(--input-border, rgba(255,255,255,0.15))',
                      }}>
                      <div className="w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all" style={{ left: maxPerWeek !== null ? 22 : 2, boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                    </div>
                    <span className="font-dm font-semibold text-[13px]" style={{ color: c.text }}>{maxPerWeek !== null ? t.weeklyLimit : t.weeklyLimitOff}</span>
                  </label>
                  {maxPerWeek !== null && (
                    <div className="flex items-center gap-3 mt-3 ml-[52px]">
                      <button onClick={() => saveMaxPerWeek(Math.max(1, (maxPerWeek || 5) - 1))}
                        className="font-dm w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer text-[16px]"
                        style={{ background: c.inputBg, border: `1px solid ${c.inputBorder}`, color: c.text }}>−</button>
                      <span className="font-dm text-[18px] font-bold" style={{ color: '#E8471A', minWidth: 24, textAlign: 'center' }}>{maxPerWeek}</span>
                      <button onClick={() => saveMaxPerWeek(Math.min(50, (maxPerWeek || 5) + 1))}
                        className="font-dm w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer text-[16px]"
                        style={{ background: c.inputBg, border: `1px solid ${c.inputBorder}`, color: c.text }}>+</button>
                      <span className="font-dm text-white/40 text-[12px]">{t.perWeek}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Photos */}
            <div className="rounded-2xl p-5 mb-4" style={{ background: c.cardBg, border: `1px solid ${c.divider}` }}>
              <label className="font-dm text-white/50 text-[11px] uppercase tracking-[0.06em] block mb-3">{t.photos}</label>
              {myPhotos.length > 0 ? (
                <div className="grid gap-2 mb-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))' }}>
                  {myPhotos.map((url, i) => (
                    <div key={i} className="relative rounded-lg overflow-hidden" style={{ aspectRatio: '1', width: '100%' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => handleRemovePhoto(url)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-[12px] cursor-pointer"
                        style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none' }}>&times;</button>
                    </div>
                  ))}
                </div>
              ) : null}
              <div className="mb-3">
                <label className="font-dm text-[11px] font-semibold px-4 py-2 rounded-lg cursor-pointer transition-all hover:brightness-110 inline-flex items-center gap-2"
                  style={{ background: '#E8471A', color: '#fff' }}>
                  {uploading ? (locale === 'fr' ? `Upload ${uploadProgress}...` : `Uploading ${uploadProgress}...`) : (locale === 'fr' ? 'Uploader des photos' : 'Upload photos')}
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" multiple
                    disabled={uploading}
                    onChange={e => { const files = e.target.files; if (files && files.length > 0) handleUploadPhotos(files); e.target.value = '' }} />
                </label>
              </div>
              <div className="flex gap-2">
                <input value={newPhotoUrl} onChange={e => setNewPhotoUrl(e.target.value)}
                  placeholder={t.phPhoto} onKeyDown={e => e.key === 'Enter' && handleAddPhoto()}
                  className="font-dm flex-1 rounded-lg text-[12px] text-white/90 placeholder:text-white/20 outline-none"
                  style={{ height: 38, padding: '0 12px', background: c.inputBg, border: `1px solid ${c.inputBorder}` }} />
                <button onClick={handleAddPhoto}
                  className="font-dm text-[11px] font-semibold px-3 rounded-lg cursor-pointer transition-all hover:brightness-110"
                  style={{ height: 38, background: c.inputBg, color: c.textMuted, border: `1px solid ${c.inputBorder}` }}>+</button>
              </div>
            </div>

            {/* Publish button — shown only BEFORE first publish */}
            {!firstPublishedAt && (
              <div data-tour="publish" className="sticky bottom-4 z-40 mt-4">
                <button onClick={handleFirstPublish}
                  className="font-dm w-full text-[15px] font-bold rounded-xl cursor-pointer transition-all hover:brightness-110 active:scale-[0.98]"
                  style={{ background: '#E8471A', color: '#fff', height: 56, border: 'none' }}>
                  {locale === 'fr' ? 'Publier mon offre' : 'Publish my offer'} →
                </button>
              </div>
            )}
          </div>
        )}

        {/* === COLLABS TAB === */}
        {tab === 'collabs' && (
          <div style={{ maxWidth: 720 }}>
            {/* Rating widget — pending creator evaluations */}
            <RatingWidget />

            {bookings.length === 0 ? (
              <p className="font-dm text-white/30 text-center py-12">{t.noCollabs}</p>
            ) : (
              <div className="space-y-3">
                {bookings.map(b => (
                  <div key={b.id} className="rounded-2xl p-5" style={{ background: c.cardBg, border: `1px solid ${c.divider}` }}>
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <h3 className="font-dm text-white font-semibold text-[14px]">{b.creator_first_name} {b.creator_last_name}</h3>
                          <span className="font-dm text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{
                            background: b.status === 'pending' ? 'rgba(217,79,42,0.1)' : b.status === 'confirmed' ? 'rgba(74,222,128,0.1)' : b.status === 'awaiting_payment' ? 'rgba(232,71,26,0.1)' : 'rgba(239,68,68,0.1)',
                            color: b.status === 'pending' ? '#D94F2A' : b.status === 'confirmed' ? '#4ade80' : b.status === 'awaiting_payment' ? '#E8471A' : '#ef4444',
                          }}>{b.status === 'pending' ? t.pending : b.status === 'confirmed' ? t.confirmed : b.status === 'awaiting_payment' ? t.awaitingPayment : t.refused}</span>
                        </div>
                        <p className="font-dm text-white/40 text-[12px]">
                          {b.creator_tiktok && <span className="text-white/40">{b.creator_tiktok}</span>}
                          {b.creator_instagram && <span className="text-white/30 ml-2">{b.creator_instagram}</span>}
                        </p>
                        <p className="font-dm text-[#E8471A] text-[13px] font-semibold mt-2">
                          {new Date(b.booking_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                          {' '}&middot; {b.start_time?.slice(0, 5)} - {b.end_time?.slice(0, 5)}
                        </p>
                      </div>

                      {(b.status === 'pending' || b.status === 'awaiting_payment') && (
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={() => handleBookingAction(b.id, 'accept')}
                            className="font-dm text-[12px] font-semibold px-4 py-2 rounded-lg cursor-pointer transition-all hover:brightness-110"
                            style={{ background: b.status === 'awaiting_payment' ? 'rgba(232,71,26,0.15)' : 'rgba(74,222,128,0.15)', color: b.status === 'awaiting_payment' ? '#E8471A' : '#4ade80', border: 'none' }}>
                            {b.status === 'awaiting_payment' ? t.pay : t.accept}
                          </button>
                          <button onClick={() => handleBookingAction(b.id, 'refuse')}
                            className="font-dm text-[12px] font-semibold px-4 py-2 rounded-lg cursor-pointer transition-all hover:brightness-110"
                            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none' }}>{t.refuse}</button>
                        </div>
                      )}
                    </div>

                    {/* Contract + Post link + Pay prime — for confirmed/completed bookings */}
                    {(b.status === 'confirmed' || b.status === 'completed') && (
                      <div className="mt-3 pt-3 space-y-2" style={{ borderTop: `1px solid ${c.divider}` }}>
                        {/* Contract button */}
                        <button onClick={() => setContractBooking(b)}
                          className="font-dm text-[12px] font-semibold px-4 py-2 rounded-lg cursor-pointer transition-all hover:brightness-110"
                          style={{ background: 'rgba(232,71,26,0.08)', color: '#E8471A', border: '1px solid rgba(232,71,26,0.15)' }}>
                          {t.viewContract}
                        </button>

                        {/* Post link if submitted */}
                        {b.post_link && (
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-dm text-[#4ade80] text-[11px] font-semibold">✓ {t.postSubmitted}</span>
                              <a href={b.post_link} target="_blank" rel="noopener"
                                className="font-dm text-[11px] text-[#E8471A] hover:brightness-125 truncate" style={{ textDecoration: 'underline', maxWidth: 200 }}>
                                {b.post_link}
                              </a>
                            </div>
                            {/* Report button */}
                            {b.reported_by_restaurant || reportedBookings.has(b.id) ? (
                              <p className="font-dm text-[11px]" style={{ color: c.textMuted }}>✓ {t.reportSent}</p>
                            ) : reportBookingId === b.id ? (
                              <div className="mt-1 rounded-lg p-3 animate-fade-in" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.12)' }}>
                                <textarea value={reportReason} onChange={e => setReportReason(e.target.value)}
                                  placeholder={t.reportReasonPh} rows={2}
                                  className="font-dm w-full rounded-lg text-[12px] text-white/90 placeholder:text-white/20 outline-none resize-none mb-2"
                                  style={{ padding: '8px 10px', background: c.inputBg, border: `1px solid ${c.inputBorder}` }} />
                                <div className="flex gap-2">
                                  <button onClick={() => { setReportBookingId(null); setReportReason('') }}
                                    className="font-dm text-[11px] px-3 py-1.5 rounded-lg cursor-pointer"
                                    style={{ background: c.inputBg, color: c.textMuted, border: 'none' }}>{t.cancel}</button>
                                  <button disabled={reportSending}
                                    onClick={async () => {
                                      setReportSending(true)
                                      const res = await fetch('/api/restaurant/report-post', {
                                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ bookingId: b.id, reason: reportReason }),
                                      })
                                      if (res.ok) {
                                        setReportedBookings(prev => new Set([...prev, b.id]))
                                        toast(t.reportSent, 'success')
                                      } else {
                                        const d = await res.json()
                                        toast(d.error || 'Erreur', 'error')
                                      }
                                      setReportSending(false)
                                      setReportBookingId(null)
                                      setReportReason('')
                                    }}
                                    className="font-dm text-[11px] font-semibold px-3 py-1.5 rounded-lg cursor-pointer"
                                    style={{ background: '#ef4444', color: '#fff', border: 'none', opacity: reportSending ? 0.6 : 1 }}>
                                    {reportSending ? t.reporting : t.reportSend}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button onClick={() => setReportBookingId(b.id)}
                                className="font-dm text-[11px] cursor-pointer transition-colors hover:opacity-70"
                                style={{ background: 'none', border: 'none', color: c.textMuted, textDecoration: 'underline', textUnderlineOffset: 3, padding: 0 }}>
                                {t.reportPost}
                              </button>
                            )}
                          </div>
                        )}

                        {/* J+5 countdown */}
                        {!b.post_link && (() => {
                          const bd = new Date(b.booking_date)
                          const deadline = new Date(bd.getTime() + 5 * 24 * 60 * 60 * 1000)
                          const daysLeft = Math.max(0, Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                          return daysLeft > 0 ? (
                            <p className="font-dm text-[11px]" style={{ color: daysLeft <= 2 ? '#ef4444' : c.textMuted }}>
                              {daysLeft} {t.daysToPublish}
                            </p>
                          ) : null
                        })()}

                        {/* Pay prime button — when creator claims */}
                        {b.claim_status === 'pending' && b.claimed_tier && (
                          <div className="rounded-lg p-3" style={{ background: 'rgba(232,71,26,0.05)', border: '1px solid rgba(232,71,26,0.12)' }}>
                            <p className="font-dm text-[12px] mb-2" style={{ color: c.text }}>
                              {locale === 'fr' ? 'Le créateur réclame une prime de' : 'The creator claims a bonus of'}{' '}
                              <span className="font-bold text-[#E8471A]">{b.claimed_tier.bonus}€</span>
                              {' '}({locale === 'fr' ? 'pour' : 'for'} &gt;{(b.claimed_tier.views / 1000).toFixed(0)}k {locale === 'fr' ? 'vues' : 'views'})
                            </p>
                            <p className="font-dm text-[10px] mb-2" style={{ color: c.textMuted }}>
                              7 {t.contestDeadline}
                            </p>
                            <button
                              disabled={payingPrime === b.id}
                              onClick={() => {
                                confirmModal(t.payPrimeConfirm, async () => {
                                  setPayingPrime(b.id)
                                  const res = await fetch('/api/restaurant/pay-prime', {
                                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ bookingId: b.id }),
                                  })
                                  if (res.ok) {
                                    toast(t.primePaid, 'success')
                                    setBookings(prev => prev.map(bk => bk.id === b.id ? { ...bk, claim_status: 'approved' } : bk))
                                  } else {
                                    const d = await res.json()
                                    toast(d.error || 'Erreur', 'error')
                                  }
                                  setPayingPrime(null)
                                })
                              }}
                              className="font-dm text-[12px] font-semibold px-4 py-2 rounded-lg cursor-pointer transition-all hover:brightness-110"
                              style={{ background: '#E8471A', color: '#fff', border: 'none', opacity: payingPrime === b.id ? 0.6 : 1 }}>
                              {payingPrime === b.id ? t.paying : t.payPrime}
                            </button>
                          </div>
                        )}
                        {b.claim_status === 'approved' && (
                          <p className="font-dm text-[#4ade80] text-[11px] font-semibold">✓ {t.primePaid}</p>
                        )}
                      </div>
                    )}

                    {/* Review for completed bookings */}
                    {b.status === 'completed' && !reviewedBookings.has(b.id) && (
                      reviewBookingId === b.id ? (
                        <div className="mt-3 rounded-xl p-4 animate-fade-in" style={{ background: 'rgba(232,71,26,0.05)', border: '1px solid rgba(232,71,26,0.1)' }}>
                          <p className="font-dm text-white/60 text-[12px] mb-2">{locale === 'fr' ? 'Notez ce créateur' : 'Rate this creator'}</p>
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
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* === MESSAGES TAB === */}
        {tab === 'messages' && (
          conversations.length === 0 ? (
            <div className="text-center py-12">
              <p className="font-dm text-white/30 text-[14px] mb-2">{t.noConvs}</p>
              <p className="font-dm text-white/20 text-[12px]">{t.noConvSub}</p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-0 rounded-2xl overflow-hidden" style={{ height: 'calc(100vh - 180px)', border: `1px solid ${c.divider}` }}>
              {/* Left: list */}
              <div className="overflow-y-auto flex-shrink-0 w-full max-h-[200px] sm:max-h-none sm:w-[280px]" style={{ background: c.cardBg, borderRight: `1px solid ${c.divider}` }}>
                {conversations.map(conv => (
                  <button key={conv.booking_id} onClick={() => openChat(conv.booking_id)}
                    className="w-full text-left px-4 py-3.5 transition-all cursor-pointer"
                    style={{ background: chatBookingId === conv.booking_id ? (c.isLight ? '#f0f0f3' : '#1e1b17') : 'transparent', borderBottom: `1px solid ${c.divider}`, borderLeft: chatBookingId === conv.booking_id ? '3px solid #E8471A' : '3px solid transparent' }}>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-dm text-white font-semibold text-[13px] truncate flex-1">{conv.creator_first_name} {conv.creator_last_name}</h3>
                      {conv.unread_count > 0 && <span className="font-dm text-[9px] font-bold text-white rounded-full flex items-center justify-center flex-shrink-0" style={{ width: 18, height: 18, background: '#E8471A' }}>{conv.unread_count}</span>}
                    </div>
                    <p className="font-dm text-white/25 text-[10px] mb-1">{conv.creator_tiktok} &middot; {new Date(conv.booking_date).toLocaleDateString('fr-FR')}</p>
                    {conv.last_message && <p className="font-dm text-[11px] truncate" style={{ color: conv.unread_count > 0 ? (c.isLight ? '#333' : 'rgba(255,255,255,0.6)') : (c.isLight ? '#aaa' : 'rgba(255,255,255,0.25)'), fontWeight: conv.unread_count > 0 ? 600 : 400 }}>{conv.last_message}</p>}
                  </button>
                ))}
              </div>
              {/* Right: chat */}
              <div className="flex-1 flex flex-col" style={{ background: (c.isLight ? '#f8f8fa' : '#141210') }}>
                {chatBookingId ? (
                  <>
                    <div className="px-5 py-3.5 flex-shrink-0" style={{ background: c.cardBg, borderBottom: `1px solid ${c.divider}` }}>
                      {(() => { const ac = conversations.find(x => x.booking_id === chatBookingId); return ac ? <h3 className="font-dm text-white font-semibold text-[15px]">{ac.creator_first_name} {ac.creator_last_name} <span className="text-white/30 font-normal text-[12px] ml-2">{ac.creator_tiktok}</span></h3> : null })()}
                    </div>
                    <div className="flex-1 overflow-y-auto px-5 py-4">
                      {chatMessages.length === 0 ? (
                        <div className="flex items-center justify-center h-full"><p className="font-dm text-white/20 text-[13px]">{t.noMessages}</p></div>
                      ) : (
                        <div className="space-y-2.5">
                          {chatMessages.map(m => (
                            <div key={m.id} className={`flex ${m.sender_type === 'restaurant' ? 'justify-end' : 'justify-start'}`}>
                              <div className="max-w-[75%]" style={{
                                background: m.sender_type === 'restaurant' ? 'rgba(232,71,26,0.15)' : (c.isLight ? '#f0f0f3' : '#1e1b17'),
                                border: `1px solid ${m.sender_type === 'restaurant' ? 'rgba(232,71,26,0.2)' : 'rgba(255,255,255,0.06)'}`,
                                borderRadius: 16, borderBottomRightRadius: m.sender_type === 'restaurant' ? 4 : 16, borderBottomLeftRadius: m.sender_type === 'creator' ? 4 : 16, padding: '10px 14px',
                              }}>
                                <p className="font-dm text-white/30 text-[10px] mb-0.5">{m.sender_name}</p>
                                <p className="font-dm text-white/85 text-[14px] leading-relaxed whitespace-pre-wrap">{m.content}</p>
                                <p className="font-dm text-white/15 text-[10px] mt-1 text-right">{new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="px-5 py-3 flex-shrink-0" style={{ background: c.cardBg, borderTop: `1px solid ${c.divider}` }}>
                      <div className="flex gap-2">
                        <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendChat()} placeholder={t.messagePh}
                          className="font-dm flex-1 rounded-xl text-[14px] text-white/90 placeholder:text-white/20 outline-none" style={{ height: 44, padding: '0 16px', background: c.inputBg, border: `1px solid ${c.inputBorder}` }} />
                        <button onClick={sendChat} disabled={!chatInput.trim() || chatSending} className="font-dm text-[13px] font-semibold px-5 rounded-xl cursor-pointer transition-all disabled:opacity-30" style={{ height: 44, background: '#E8471A', color: '#fff', border: 'none' }}>{chatSending ? '...' : t.send}</button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center"><p className="font-dm text-white/15 text-[14px]">{t.selectConv}</p></div>
                )}
              </div>
            </div>
          )
        )}

        {/* === CREATORS TAB === */}
        {tab === 'creators' && (
          <div>
            {!(subInfo && (subInfo.plan === 'pro' || subInfo.plan === 'pro_assist')) ? (
              <div className="rounded-2xl p-8 text-center" style={{ background: c.cardBg, border: `1px solid ${c.divider}` }}>
                <div className="text-[48px] mb-4" style={{ opacity: 0.2 }}>&#128274;</div>
                <h3 className="font-dm font-bold text-[18px] mb-2" style={{ color: c.text }}>
                  {locale === 'fr' ? 'Accès réservé aux comptes Pro' : 'Pro accounts only'}
                </h3>
                <p className="font-dm text-[14px] mb-6" style={{ color: c.textMuted, maxWidth: 400, margin: '0 auto 24px' }}>
                  {locale === 'fr'
                    ? 'Passez au plan Pro pour voir les profils créateurs, consulter leurs vidéos et les inviter directement à collaborer avec votre restaurant.'
                    : 'Upgrade to Pro to view creator profiles, see their videos and invite them directly to collaborate with your restaurant.'}
                </p>
                <button onClick={() => setTab('subscription')}
                  className="font-dm text-[14px] font-bold px-6 py-3 rounded-full cursor-pointer transition-all hover:brightness-110"
                  style={{ background: '#E8471A', color: '#fff', border: 'none' }}>
                  {locale === 'fr' ? 'Voir les formules Pro' : 'View Pro plans'} &rarr;
                </button>
              </div>
            ) : creators.length === 0 ? (
              <p className="font-dm text-white/30 text-center py-12">{t.noCreators}</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {creators.map(cr => {
                  const posts = cr.showcase_posts?.filter(Boolean) || []
                  const idx = creatorPhotoIdx[cr.id] || 0
                  return (
                    <div key={cr.id} className="rounded-2xl overflow-hidden" style={{ background: c.cardBg, border: `1px solid ${c.divider}` }}>
                      {/* Showcase posts — vertical side by side */}
                      {posts.length > 0 ? (
                        <div className="grid gap-1" style={{ gridTemplateColumns: posts.length > 1 ? '1fr 1fr' : '1fr' }}>
                          {posts.slice(0, 2).map((post, pi) => (
                            <div key={pi} className="relative overflow-hidden" style={{ aspectRatio: '9/16' }}>
                              {post.match(/\.(mp4|mov|webm)/i) ? (
                                <video src={post} className="w-full h-full object-cover" muted playsInline
                                  onMouseEnter={e => (e.target as HTMLVideoElement).play()}
                                  onMouseLeave={e => { const v = e.target as HTMLVideoElement; v.pause(); v.currentTime = 0 }} />
                              ) : (
                                <img src={post} alt="" className="w-full h-full object-cover" />
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="w-full flex items-center justify-center" style={{
                          aspectRatio: '16/9',
                          background: c.isLight ? 'linear-gradient(135deg, #e0ddd8 0%, #d5d0ca 100%)' : 'linear-gradient(135deg, #2a2520 0%, #191714 100%)',
                        }}>
                          <span style={{ fontSize: 48, opacity: 0.15 }}>&#127909;</span>
                        </div>
                      )}

                      <div className="p-4">
                        {/* Name & username */}
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center font-dm font-bold text-[11px] flex-shrink-0" style={{ background: 'rgba(232,71,26,0.12)', color: '#E8471A' }}>
                              {(cr.username || cr.first_name)?.[0]?.toUpperCase()}
                            </div>
                            <h3 className="font-dm font-semibold text-[15px] truncate" style={{ color: c.text }}>
                              {cr.username ? `@${cr.username}` : `${cr.first_name} ${cr.last_name}`}
                            </h3>
                          </div>
                          {cr.audience_size && (
                            <span className="font-dm text-[10px] px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: c.inputBg, color: c.textMuted }}>{cr.audience_size}</span>
                          )}
                        </div>
                        {cr.city && <p className="font-dm text-[12px] mb-2" style={{ color: c.textMuted }}>{cr.city}</p>}

                        {/* Niche */}
                        {cr.niche?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {(Array.isArray(cr.niche) ? cr.niche : [cr.niche]).map((n, i) => (
                              <span key={i} className="font-dm text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(232,71,26,0.1)', color: '#E8471A' }}>{n}</span>
                            ))}
                          </div>
                        )}

                        {/* Invitation button */}
                        {subInfo && (subInfo.plan === 'pro' || subInfo.plan === 'pro_assist') ? (
                          invitedCreators.has(cr.id) ? (
                            <p className="font-dm text-[#4ade80] text-[11px] font-semibold">✓ {t.inviteSent}</p>
                          ) : (
                            <button
                              disabled={inviteSending === cr.id}
                              onClick={async () => {
                                setInviteSending(cr.id)
                                const res = await fetch('/api/restaurant/invite', {
                                  method: 'POST', headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ creatorId: cr.id }),
                                })
                                if (res.ok) {
                                  setInvitedCreators(prev => new Set([...prev, cr.id]))
                                  toast(t.inviteSent, 'success')
                                } else {
                                  const d = await res.json()
                                  toast(d.error || 'Erreur', 'error')
                                }
                                setInviteSending(null)
                              }}
                              className="font-dm w-full text-[12px] font-semibold py-2 rounded-lg cursor-pointer transition-all hover:brightness-110"
                              style={{ background: '#E8471A', color: '#fff', border: 'none', opacity: inviteSending === cr.id ? 0.6 : 1 }}>
                              {inviteSending === cr.id ? '...' : t.invite}
                            </button>
                          )
                        ) : (
                          <p className="font-dm text-[11px] px-2 py-2 rounded-lg text-center" style={{ background: 'rgba(232,71,26,0.04)', color: c.textMuted, border: `1px solid ${c.divider}` }}>
                            {t.proOnly}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* === SUBSCRIPTION TAB === */}
        {tab === 'subscription' && subInfo && (
          <div style={{ maxWidth: 720 }}>
            {/* Trial banner */}
            {subInfo.onTrial && (
              <div className="rounded-2xl p-5 mb-4 animate-fade-in" style={{
                background: 'rgba(217,79,42,0.06)',
                border: '1px solid rgba(217,79,42,0.2)',
              }}>
                <div className="flex items-center gap-2 mb-3">
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#D94F2A' }} />
                  <span className="font-dm text-[#D94F2A] text-[12px] font-bold uppercase tracking-[0.06em]">{t.trialBadge}</span>
                </div>
                <div className="flex flex-wrap gap-6 mb-3">
                  <div>
                    <p className="font-dm text-white font-bold text-[28px]">{subInfo.trialDaysLeft}</p>
                    <p className="font-dm text-white/40 text-[12px]">{t.trialDaysLeft}</p>
                  </div>
                  <div>
                    <p className="font-dm text-white font-bold text-[28px]">{subInfo.trialCollabsRemaining}</p>
                    <p className="font-dm text-white/40 text-[12px]">{t.trialCollabsLeft}</p>
                  </div>
                </div>
                {subInfo.trialEndsAt && (
                  <p className="font-dm text-white/40 text-[12px] mb-2">
                    {t.trialEnds} {new Date(subInfo.trialEndsAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                )}
                <p className="font-dm text-white/30 text-[11px]">{t.trialNote}</p>
              </div>
            )}

            {/* Trial expired banner */}
            {!subInfo.onTrial && subInfo.trialCollabsUsed > 0 && (
              <div className="rounded-2xl p-5 mb-4 animate-fade-in" style={{
                background: c.isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${c.divider}`,
              }}>
                <p className="font-dm text-white/50 text-[13px] font-semibold mb-2">{t.trialExpired}</p>
                <p className="font-dm text-white/30 text-[12px] mb-3">
                  {locale === 'fr'
                    ? 'Votre essai gratuit est terminé. Choisissez un abonnement ci-dessous pour continuer vos collabs.'
                    : 'Your free trial has ended. Choose a plan below to continue your collabs.'}
                </p>
                <button onClick={() => {
                  document.querySelector('.tarifs-plans')?.scrollIntoView({ behavior: 'smooth' })
                }}
                  className="font-dm text-[12px] font-semibold py-2 px-4 rounded-lg cursor-pointer transition-all hover:brightness-110"
                  style={{ background: '#E8471A', color: '#fff', border: 'none' }}>
                  {t.upgradeNow}
                </button>
              </div>
            )}

            {/* Current plan info */}
            <div className="rounded-2xl p-6 mb-6" style={{ background: c.cardBg, border: `1px solid ${c.divider}` }}>
              <p className="font-dm text-white/40 text-[11px] uppercase tracking-[0.06em] mb-3">{t.currentPlan}</p>
              <h2 className="font-dm text-white font-bold text-[24px] mb-1">
                {subInfo.onTrial
                  ? (locale === 'fr' ? 'Essai gratuit' : 'Free trial')
                  : (PLANS.find(p => p.id === subInfo.plan)?.[locale === 'fr' ? 'name' : 'nameEn'] || t.free)
                }
              </h2>
              <p className="font-dm text-white/40 text-[13px] mb-4">
                {subInfo.onTrial
                  ? (locale === 'fr' ? `3 collabs offertes — ${subInfo.trialCollabsRemaining} restante${subInfo.trialCollabsRemaining !== 1 ? 's' : ''}` : `3 free collabs — ${subInfo.trialCollabsRemaining} remaining`)
                  : subInfo.plan === 'pro' ? t.unlimited : `${subInfo.includedCollabs} collab${subInfo.includedCollabs !== 1 ? 's' : ''} ${t.included} — ${subInfo.extraCollabPrice}€${t.perCollab}`
                }
              </p>

              {/* Usage */}
              <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-dm text-white/40 text-[12px]">{t.usage}</span>
                  <span className="font-dm text-white/60 text-[13px] font-semibold">{subInfo.monthUsage} collab{subInfo.monthUsage !== 1 ? 's' : ''}</span>
                </div>
                {subInfo.plan !== 'pro' && (
                  <div className="w-full h-2 rounded-full mb-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full transition-all" style={{
                      width: `${Math.min((subInfo.monthUsage / Math.max(subInfo.includedCollabs, 1)) * 100, 100)}%`,
                      background: subInfo.extras > 0 ? '#E8471A' : '#4ade80',
                    }} />
                  </div>
                )}
                {subInfo.extras > 0 && (
                  <p className="font-dm text-[#E8471A] text-[12px] font-semibold">
                    {subInfo.extras} {t.extras} &times; {subInfo.extraCollabPrice}€ = {subInfo.extraCost}€ {t.toInvoice}
                  </p>
                )}
              </div>
            </div>

            {/* Billing toggle */}
            <div className="flex items-center gap-4 mb-4">
              <p className="font-dm text-white/40 text-[11px] uppercase tracking-[0.06em]">{t.changePlan}</p>
              <div className="flex gap-1 rounded-lg p-0.5" style={{ background: 'rgba(255,255,255,0.03)', display: 'inline-flex' }}>
                <button onClick={() => setBillingCycle('monthly')}
                  className="font-dm text-[11px] font-semibold px-3 py-1.5 rounded-md cursor-pointer transition-all"
                  style={{ background: billingCycle === 'monthly' ? (c.isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)') : 'transparent', color: billingCycle === 'monthly' ? (c.isLight ? '#111' : '#fff') : (c.isLight ? '#999' : 'rgba(255,255,255,0.3)'), border: 'none' }}>
                  {locale === 'fr' ? 'Mensuel' : 'Monthly'}
                </button>
                <button onClick={() => setBillingCycle('yearly')}
                  className="font-dm text-[11px] font-semibold px-3 py-1.5 rounded-md cursor-pointer transition-all"
                  style={{ background: billingCycle === 'yearly' ? 'rgba(232,71,26,0.15)' : 'transparent', color: billingCycle === 'yearly' ? '#E8471A' : (c.isLight ? '#999' : 'rgba(255,255,255,0.3)'), border: 'none' }}>
                  {locale === 'fr' ? 'Annuel -20%' : 'Yearly -20%'}
                </button>
              </div>
            </div>

            {/* Plan cards */}
            <div className="grid gap-3 sm:grid-cols-2">
              {PLANS.filter(p => p.id !== 'free' && (billingCycle === 'monthly' || p.priceYearly)).map(plan => {
                const isCurrent = subInfo.plan === plan.id
                const sameBilling = subInfo.billingCycle === billingCycle
                const price = billingCycle === 'yearly' && plan.priceYearly ? plan.priceYearly : plan.price
                const unit = billingCycle === 'yearly' && plan.priceYearly ? (locale === 'fr' ? '/an' : '/year') : (locale === 'fr' ? '/mois' : '/month')

                // Button logic
                let buttonLabel = t.subscribe
                let showButton = true
                if (isCurrent && sameBilling) {
                  showButton = false // exact same plan + cycle
                } else if (isCurrent && !sameBilling) {
                  buttonLabel = billingCycle === 'yearly' ? t.switchToYearly : t.switchToMonthly
                }

                return (
                  <div key={plan.id} className="rounded-2xl p-5" style={{
                    background: isCurrent && sameBilling ? 'rgba(232,71,26,0.06)' : c.cardBg,
                    border: `1px solid ${isCurrent && sameBilling ? 'rgba(232,71,26,0.2)' : c.divider}`,
                  }}>
                    <p className="font-dm font-bold text-[16px] mb-1" style={{ color: c.isLight ? '#111' : '#fff' }}>{locale === 'fr' ? plan.name : plan.nameEn}</p>
                    <p className="font-dm text-[#E8471A] text-[24px] font-bold">{price}<span className="text-[13px] font-normal" style={{ color: c.isLight ? '#999' : 'rgba(255,255,255,0.3)' }}>€{unit}</span></p>
                    <p className="font-dm text-[12px] mb-4" style={{ color: c.isLight ? '#888' : 'rgba(255,255,255,0.4)' }}>
                      {plan.included === 999 ? t.unlimited : `${plan.included} ${t.included} — ${plan.extra}€${t.perCollab}`}
                    </p>
                    {isCurrent && sameBilling ? (
                      <span className="font-dm text-[#4ade80] text-[12px] font-semibold">{t.activeSub}</span>
                    ) : showButton ? (
                      <button onClick={() => handleCheckout(plan.id)}
                        className="font-dm w-full text-[12px] font-semibold py-2.5 rounded-lg cursor-pointer transition-all hover:brightness-110"
                        style={{ background: isCurrent ? 'rgba(232,71,26,0.15)' : '#E8471A', color: isCurrent ? '#E8471A' : '#fff', border: 'none' }}>{buttonLabel}</button>
                    ) : null}
                  </div>
                )
              })}
            </div>

            {/* Cancel subscription — discreet link */}
            {subInfo.hasStripe && subInfo.plan !== 'free' && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setCancelStep(1)}
                  className="font-dm text-[11px] cursor-pointer transition-colors hover:opacity-70"
                  style={{ color: c.isLight ? '#999' : 'rgba(255,255,255,0.2)', background: 'none', border: 'none', textDecoration: 'underline', textUnderlineOffset: 3 }}
                >
                  {t.cancelSub}
                </button>
              </div>
            )}

            {/* ── Retention modal ── */}
            {cancelStep > 0 && subInfo && (
              <div style={{ position: 'fixed', inset: 0, zIndex: 99998, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
                onClick={() => { setCancelStep(0); setCancelReason('') }}>
                <div onClick={e => e.stopPropagation()} style={{
                  background: c.isLight ? '#fff' : '#1a1a1a', borderRadius: 20, padding: '32px 28px', maxWidth: 440, width: '92%',
                  boxShadow: '0 12px 48px rgba(0,0,0,0.25)', border: `1px solid ${c.divider}`,
                }}>

                  {/* Step 1 — Show benefits + alternatives */}
                  {cancelStep === 1 && (
                    <>
                      <p className="font-dm font-bold text-[18px] mb-5" style={{ color: c.isLight ? '#111' : '#fff' }}>
                        {t.cancelTitle}
                      </p>

                      {/* Stats */}
                      <div className="flex gap-3 mb-5">
                        <div className="flex-1 rounded-xl p-3 text-center" style={{ background: 'rgba(232,71,26,0.06)', border: '1px solid rgba(232,71,26,0.12)' }}>
                          <p className="font-dm font-bold text-[22px] text-[#E8471A]">{subInfo.monthUsage}</p>
                          <p className="font-dm text-[11px]" style={{ color: c.isLight ? '#888' : 'rgba(255,255,255,0.4)' }}>{t.cancelBenefit1}</p>
                        </div>
                        <div className="flex-1 rounded-xl p-3 text-center" style={{ background: 'rgba(232,71,26,0.06)', border: '1px solid rgba(232,71,26,0.12)' }}>
                          <p className="font-dm font-bold text-[22px] text-[#E8471A]">{bookings.filter(b => b.status === 'confirmed').length}</p>
                          <p className="font-dm text-[11px]" style={{ color: c.isLight ? '#888' : 'rgba(255,255,255,0.4)' }}>{t.cancelBenefit2}</p>
                        </div>
                      </div>

                      <p className="font-dm text-[12px] mb-6" style={{ color: c.isLight ? '#888' : 'rgba(255,255,255,0.4)' }}>
                        {t.cancelBenefit3}
                      </p>

                      {/* Keep plan — primary CTA */}
                      <button onClick={() => { setCancelStep(0); setCancelReason('') }}
                        className="font-dm w-full text-[13px] font-semibold py-3 rounded-xl cursor-pointer transition-all hover:brightness-110 mb-2.5"
                        style={{ background: '#E8471A', color: '#fff', border: 'none' }}>
                        {t.cancelKeepPlan}
                      </button>

                      {/* Switch to yearly — if currently monthly */}
                      {subInfo.billingCycle !== 'yearly' && (
                        <button onClick={() => { setCancelStep(0); setCancelReason(''); setBillingCycle('yearly') }}
                          className="font-dm w-full text-[13px] font-medium py-3 rounded-xl cursor-pointer transition-all hover:brightness-110 mb-2.5"
                          style={{ background: c.isLight ? '#f5f5f5' : 'rgba(255,255,255,0.06)', color: c.isLight ? '#111' : '#fff', border: `1px solid ${c.divider}` }}>
                          💰 {t.cancelSwitchYearly}
                        </button>
                      )}

                      {/* Continue to cancel */}
                      <button onClick={() => setCancelStep(2)}
                        className="font-dm w-full text-[12px] py-2.5 cursor-pointer transition-colors mt-1"
                        style={{ background: 'none', border: 'none', color: c.isLight ? '#aaa' : 'rgba(255,255,255,0.2)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                        {t.cancelConfirmFinal}
                      </button>
                    </>
                  )}

                  {/* Step 2 — Reason + final confirmation */}
                  {cancelStep === 2 && (
                    <>
                      <p className="font-dm font-bold text-[16px] mb-4" style={{ color: c.isLight ? '#111' : '#fff' }}>
                        {t.cancelReasonTitle}
                      </p>

                      <div className="flex flex-col gap-2 mb-5">
                        {[
                          { key: 'price', label: t.cancelReasonPrice },
                          { key: 'no_use', label: t.cancelReasonNoUse },
                          { key: 'other', label: t.cancelReasonOther },
                        ].map(r => (
                          <button key={r.key} onClick={() => setCancelReason(r.key)}
                            className="font-dm text-[13px] text-left px-4 py-3 rounded-xl cursor-pointer transition-all"
                            style={{
                              background: cancelReason === r.key ? 'rgba(232,71,26,0.08)' : (c.isLight ? '#f8f8f8' : 'rgba(255,255,255,0.04)'),
                              border: `1px solid ${cancelReason === r.key ? 'rgba(232,71,26,0.25)' : c.divider}`,
                              color: cancelReason === r.key ? '#E8471A' : (c.isLight ? '#555' : 'rgba(255,255,255,0.5)'),
                              fontWeight: cancelReason === r.key ? 600 : 400,
                            }}>
                            {r.label}
                          </button>
                        ))}
                      </div>

                      <p className="font-dm text-[11px] mb-5" style={{ color: c.isLight ? '#aaa' : 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>
                        {t.cancelFinalWarning}
                      </p>

                      <div className="flex gap-2.5">
                        <button onClick={() => { setCancelStep(0); setCancelReason('') }}
                          className="font-dm flex-1 text-[13px] font-semibold py-3 rounded-xl cursor-pointer transition-all hover:brightness-110"
                          style={{ background: '#E8471A', color: '#fff', border: 'none' }}>
                          {t.cancelKeepPlan}
                        </button>
                        <button
                          disabled={!cancelReason || cancelLoading}
                          onClick={async () => {
                            setCancelLoading(true)
                            const res = await fetch('/api/restaurant/subscription/cancel', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ reason: cancelReason }),
                            })
                            if (res.ok) {
                              setCancelStep(0)
                              setCancelReason('')
                              toast(t.cancelled, 'success')
                              setTimeout(() => window.location.reload(), 1500)
                            }
                            setCancelLoading(false)
                          }}
                          className="font-dm flex-1 text-[12px] py-3 rounded-xl cursor-pointer transition-all"
                          style={{
                            background: c.isLight ? '#f5f5f5' : 'rgba(255,255,255,0.04)',
                            color: c.isLight ? '#999' : 'rgba(255,255,255,0.25)',
                            border: `1px solid ${c.divider}`,
                            opacity: !cancelReason || cancelLoading ? 0.4 : 1,
                          }}>
                          {cancelLoading ? t.cancelling : t.cancelConfirmFinal}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        {/* Settings tab */}
        {tab === 'settings' && (
          <div style={{ maxWidth: 520 }}>
            {restoSettingsMsg && (
              <div className="font-dm text-[13px] text-[#4ade80] mb-4 p-3 rounded-lg" style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.15)' }}>
                {restoSettingsMsg}
              </div>
            )}

            {/* Business info */}
            <div className="rounded-2xl p-5 mb-4" style={{ background: c.cardBg, border: `1px solid ${c.divider}` }}>
              <p className="font-dm text-white/50 text-[11px] uppercase tracking-[0.06em] mb-4">{t.settingsProfile}</p>
              <div className="grid gap-3 sm:grid-cols-2 mb-3">
                <div>
                  <label className="font-dm form-label text-[11px] block mb-1">{locale === 'fr' ? 'Nom du gérant' : 'Owner name'}</label>
                  <input value={restoSettings.ownerName} onChange={e => setRestoSettings(p => ({ ...p, ownerName: e.target.value }))}
                    className="font-dm w-full rounded-lg text-[13px] text-white/90 placeholder:text-white/20 outline-none"
                    style={{ height: 40, padding: '0 12px', background: c.inputBg, border: `1px solid ${c.inputBorder}` }} />
                </div>
                <div>
                  <label className="font-dm form-label text-[11px] block mb-1">{locale === 'fr' ? 'Téléphone' : 'Phone'}</label>
                  <input value={restoSettings.phone} onChange={e => setRestoSettings(p => ({ ...p, phone: e.target.value }))}
                    className="font-dm w-full rounded-lg text-[13px] text-white/90 placeholder:text-white/20 outline-none"
                    style={{ height: 40, padding: '0 12px', background: c.inputBg, border: `1px solid ${c.inputBorder}` }} />
                </div>
              </div>
              <div className="mb-3">
                <label className="font-dm form-label text-[11px] block mb-1">{locale === 'fr' ? "Nom de l'établissement" : 'Business name'}</label>
                <input value={restoSettings.businessName} onChange={e => setRestoSettings(p => ({ ...p, businessName: e.target.value }))}
                  className="font-dm w-full rounded-lg text-[13px] text-white/90 placeholder:text-white/20 outline-none"
                  style={{ height: 40, padding: '0 12px', background: c.inputBg, border: `1px solid ${c.inputBorder}` }} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 mb-3">
                <div>
                  <label className="font-dm form-label text-[11px] block mb-1">{locale === 'fr' ? 'Type de cuisine' : 'Cuisine type'}</label>
                  <input value={restoSettings.cuisineType} onChange={e => setRestoSettings(p => ({ ...p, cuisineType: e.target.value }))}
                    className="font-dm w-full rounded-lg text-[13px] text-white/90 placeholder:text-white/20 outline-none"
                    style={{ height: 40, padding: '0 12px', background: c.inputBg, border: `1px solid ${c.inputBorder}` }} />
                </div>
                <div>
                  <label className="font-dm form-label text-[11px] block mb-1">{locale === 'fr' ? 'Ville' : 'City'}</label>
                  <input value={restoSettings.city} onChange={e => setRestoSettings(p => ({ ...p, city: e.target.value }))}
                    className="font-dm w-full rounded-lg text-[13px] text-white/90 placeholder:text-white/20 outline-none"
                    style={{ height: 40, padding: '0 12px', background: c.inputBg, border: `1px solid ${c.inputBorder}` }} />
                </div>
              </div>
              <div className="mb-3">
                <label className="font-dm form-label text-[11px] block mb-1">{locale === 'fr' ? 'Adresse' : 'Address'}</label>
                <input value={restoSettings.address} onChange={e => setRestoSettings(p => ({ ...p, address: e.target.value }))}
                  className="font-dm w-full rounded-lg text-[13px] text-white/90 placeholder:text-white/20 outline-none"
                  style={{ height: 40, padding: '0 12px', background: c.inputBg, border: `1px solid ${c.inputBorder}` }} />
              </div>
              <button onClick={async () => {
                const res = await fetch('/api/restaurant/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'update_profile', ...restoSettings }) })
                if (res.ok) { setRestoSettingsMsg(t.saved); setTimeout(() => setRestoSettingsMsg(''), 2000) }
              }} className="font-dm text-[12px] font-semibold px-5 py-2 rounded-lg cursor-pointer" style={{ background: '#E8471A', color: '#fff', border: 'none' }}>
                {t.save}
              </button>
            </div>

            {/* Social media */}
            <div className="rounded-2xl p-5 mb-4" style={{ background: c.cardBg, border: `1px solid ${c.divider}` }}>
              <p className="font-dm text-white/50 text-[11px] uppercase tracking-[0.06em] mb-4">{t.settingsSocials}</p>
              <div className="grid gap-3 sm:grid-cols-2 mb-3">
                <div>
                  <label className="font-dm form-label text-[11px] block mb-1">Instagram</label>
                  <input value={restoSettings.instagram} onChange={e => setRestoSettings(p => ({ ...p, instagram: e.target.value }))} placeholder="@compte"
                    className="font-dm w-full rounded-lg text-[13px] text-white/90 placeholder:text-white/20 outline-none"
                    style={{ height: 40, padding: '0 12px', background: c.inputBg, border: `1px solid ${c.inputBorder}` }} />
                </div>
                <div>
                  <label className="font-dm form-label text-[11px] block mb-1">TikTok</label>
                  <input value={restoSettings.tiktok} onChange={e => setRestoSettings(p => ({ ...p, tiktok: e.target.value }))} placeholder="@compte"
                    className="font-dm w-full rounded-lg text-[13px] text-white/90 placeholder:text-white/20 outline-none"
                    style={{ height: 40, padding: '0 12px', background: c.inputBg, border: `1px solid ${c.inputBorder}` }} />
                </div>
              </div>
              <div className="mb-3">
                <label className="font-dm form-label text-[11px] block mb-1">{locale === 'fr' ? 'Site web' : 'Website'}</label>
                <input value={restoSettings.website} onChange={e => setRestoSettings(p => ({ ...p, website: e.target.value }))} placeholder="https://..."
                  className="font-dm w-full rounded-lg text-[13px] text-white/90 placeholder:text-white/20 outline-none"
                  style={{ height: 40, padding: '0 12px', background: c.inputBg, border: `1px solid ${c.inputBorder}` }} />
              </div>
              <button onClick={async () => {
                const res = await fetch('/api/restaurant/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'update_socials', ...restoSettings }) })
                if (res.ok) { setRestoSettingsMsg(t.saved); setTimeout(() => setRestoSettingsMsg(''), 2000) }
              }} className="font-dm text-[12px] font-semibold px-5 py-2 rounded-lg cursor-pointer" style={{ background: '#E8471A', color: '#fff', border: 'none' }}>
                {t.save}
              </button>
            </div>

            {/* Business details */}
            <div className="rounded-2xl p-5 mb-4" style={{ background: c.cardBg, border: `1px solid ${c.divider}` }}>
              <p className="font-dm text-white/50 text-[11px] uppercase tracking-[0.06em] mb-4">{locale === 'fr' ? 'Informations légales' : 'Legal information'}</p>
              <div className="grid gap-3 sm:grid-cols-2 mb-3">
                <div>
                  <label className="font-dm form-label text-[11px] block mb-1">{locale === 'fr' ? 'SIREN / SIRET' : 'Business registration (SIREN)'}</label>
                  <input value={restoSettings.siren} onChange={e => setRestoSettings(p => ({ ...p, siren: e.target.value }))} placeholder="123 456 789"
                    className="font-dm w-full rounded-lg text-[13px] text-white/90 placeholder:text-white/20 outline-none"
                    style={{ height: 40, padding: '0 12px', background: c.inputBg, border: `1px solid ${c.inputBorder}` }} />
                </div>
                <div>
                  <label className="font-dm form-label text-[11px] block mb-1">{locale === 'fr' ? 'Prix moyen / pers. (€)' : 'Avg. meal price (€)'}</label>
                  <input type="number" value={restoSettings.avgMealPrice} onChange={e => setRestoSettings(p => ({ ...p, avgMealPrice: e.target.value }))} placeholder="25"
                    className="font-dm w-full rounded-lg text-[13px] text-white/90 placeholder:text-white/20 outline-none"
                    style={{ height: 40, padding: '0 12px', background: c.inputBg, border: `1px solid ${c.inputBorder}` }} />
                </div>
              </div>
              <button onClick={async () => {
                const res = await fetch('/api/restaurant/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'update_extra', siren: restoSettings.siren, avgMealPrice: restoSettings.avgMealPrice }) })
                if (res.ok) { setRestoSettingsMsg(t.saved); setTimeout(() => setRestoSettingsMsg(''), 2000) }
              }} className="font-dm text-[12px] font-semibold px-5 py-2 rounded-lg cursor-pointer" style={{ background: '#E8471A', color: '#fff', border: 'none' }}>
                {t.save}
              </button>
            </div>

            {/* Change email — with verification */}
            <div className="rounded-2xl p-5 mb-4" style={{ background: c.cardBg, border: `1px solid ${c.divider}` }}>
              <p className="font-dm text-white/50 text-[11px] uppercase tracking-[0.06em] mb-4">{t.settingsEmail}</p>
              {restoVerifyStep !== 'email' ? (
                <>
                  <p className="font-dm text-white/40 text-[12px] mb-3">{locale === 'fr' ? 'Email actuel :' : 'Current email:'} <span className="text-white/70">{restoEmailForm}</span></p>
                  <button onClick={async () => {
                    setRestoVerifyStep('email'); setRestoCodeSent(false); setRestoVerifyCode(''); setRestoSettingsMsg('')
                    try {
                      const res = await fetch('/api/restaurant/verify-code', { method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'send_code', purpose: 'change_email' }) })
                      if (res.ok) { setRestoCodeSent(true) }
                      else { const d = await res.json(); setRestoSettingsMsg(d.error || 'Erreur envoi du code'); setRestoVerifyStep(null) }
                    } catch { setRestoSettingsMsg('Erreur réseau'); setRestoVerifyStep(null) }
                  }} className="font-dm text-[12px] font-semibold px-5 py-2 rounded-lg cursor-pointer" style={{ background: '#E8471A', color: '#fff', border: 'none' }}>
                    {locale === 'fr' ? "Modifier l'email" : 'Change email'}
                  </button>
                </>
              ) : (
                <>
                  {restoCodeSent && <p className="font-dm text-[#4ade80] text-[12px] mb-3">{locale === 'fr' ? 'Un code a été envoyé à votre email' : 'A code was sent to your email'}</p>}
                  <input value={restoVerifyCode} onChange={e => setRestoVerifyCode(e.target.value)} placeholder={locale === 'fr' ? 'Code à 6 chiffres' : '6-digit code'}
                    autoComplete="off" inputMode="numeric"
                    className="font-dm w-full rounded-lg text-[14px] text-white/90 placeholder:text-white/20 outline-none mb-3 text-center tracking-[0.3em] font-bold"
                    style={{ height: 44, padding: '0 12px', background: c.inputBg, border: `1px solid ${c.inputBorder}` }} maxLength={6} />
                  <input type="email" value={restoEmailForm} onChange={e => setRestoEmailForm(e.target.value)} placeholder={locale === 'fr' ? 'Nouvel email' : 'New email'}
                    autoComplete="off"
                    className="font-dm w-full rounded-lg text-[13px] text-white/90 placeholder:text-white/20 outline-none mb-3"
                    style={{ height: 40, padding: '0 12px', background: c.inputBg, border: `1px solid ${c.inputBorder}` }} />
                  <div className="flex gap-2">
                    <button onClick={() => { setRestoVerifyStep(null); setRestoVerifyCode('') }}
                      className="font-dm text-[12px] font-semibold px-4 py-2 rounded-lg cursor-pointer" style={{ background: c.inputBg, color: c.isLight ? '#777' : '#8a8580', border: 'none' }}>
                      {t.cancel}
                    </button>
                    <button onClick={async () => {
                      const res = await fetch('/api/restaurant/verify-code', { method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'verify_and_change', purpose: 'change_email', code: restoVerifyCode, newEmail: restoEmailForm }) })
                      const data = await res.json()
                      if (res.ok) { toast(locale === 'fr' ? 'Email modifié avec succès' : 'Email changed successfully', 'success'); setRestoVerifyStep(null); setRestoVerifyCode('') }
                      else setRestoSettingsMsg(data.error)
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
              {restoVerifyStep !== 'password' ? (
                <button onClick={async () => {
                  setRestoVerifyStep('password'); setRestoCodeSent(false); setRestoVerifyCode(''); setRestoSettingsMsg('')
                  try {
                    const res = await fetch('/api/restaurant/verify-code', { method: 'POST', headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ action: 'send_code', purpose: 'change_password' }) })
                    if (res.ok) { setRestoCodeSent(true) }
                    else { const d = await res.json(); setRestoSettingsMsg(d.error || 'Erreur envoi du code'); setRestoVerifyStep(null) }
                  } catch { setRestoSettingsMsg('Erreur réseau'); setRestoVerifyStep(null) }
                }} className="font-dm text-[12px] font-semibold px-5 py-2 rounded-lg cursor-pointer" style={{ background: '#E8471A', color: '#fff', border: 'none' }}>
                  {locale === 'fr' ? 'Modifier le mot de passe' : 'Change password'}
                </button>
              ) : (
                <>
                  {restoCodeSent && <p className="font-dm text-[#4ade80] text-[12px] mb-3">{locale === 'fr' ? 'Un code a été envoyé à votre email' : 'A code was sent to your email'}</p>}
                  <input value={restoVerifyCode} onChange={e => setRestoVerifyCode(e.target.value)} placeholder={locale === 'fr' ? 'Code à 6 chiffres' : '6-digit code'}
                    autoComplete="off" inputMode="numeric"
                    className="font-dm w-full rounded-lg text-[14px] text-white/90 placeholder:text-white/20 outline-none mb-3 text-center tracking-[0.3em] font-bold"
                    style={{ height: 44, padding: '0 12px', background: c.inputBg, border: `1px solid ${c.inputBorder}` }} maxLength={6} />
                  <input type="password" value={restoPasswordForm.newPw} onChange={e => setRestoPasswordForm(p => ({ ...p, newPw: e.target.value }))}
                    placeholder={t.newPassword} autoComplete="new-password"
                    className="font-dm w-full rounded-lg text-[13px] text-white/90 placeholder:text-white/20 outline-none mb-3"
                    style={{ height: 40, padding: '0 12px', background: c.inputBg, border: `1px solid ${c.inputBorder}` }} />
                  <div className="flex gap-2">
                    <button onClick={() => { setRestoVerifyStep(null); setRestoVerifyCode('') }}
                      className="font-dm text-[12px] font-semibold px-4 py-2 rounded-lg cursor-pointer" style={{ background: c.inputBg, color: c.isLight ? '#777' : '#8a8580', border: 'none' }}>
                      {t.cancel}
                    </button>
                    <button onClick={async () => {
                      const res = await fetch('/api/restaurant/verify-code', { method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'verify_and_change', purpose: 'change_password', code: restoVerifyCode, newPassword: restoPasswordForm.newPw }) })
                      const data = await res.json()
                      if (res.ok) { toast(locale === 'fr' ? 'Mot de passe modifié avec succès' : 'Password changed successfully', 'success'); setRestoVerifyStep(null); setRestoVerifyCode(''); setRestoPasswordForm({ newPw: '' }) }
                      else setRestoSettingsMsg(data.error)
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={() => setContractBooking(null)}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-md rounded-2xl overflow-hidden overflow-y-auto" style={{ maxHeight: '85vh', background: c.isLight ? '#fff' : '#1a1a1a', border: `1px solid ${c.divider}` }}>
            <div style={{ padding: 'clamp(16px, 5vw, 24px)' }}>
              <h2 className="font-dm font-bold text-[18px] mb-5" style={{ color: c.text }}>{t.contractTitle}</h2>
              <div className="space-y-3">
                <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 font-dm text-[13px]" style={{ color: c.textMuted }}>
                  <span>{locale === 'fr' ? 'Restaurant' : 'Restaurant'}</span>
                  <span className="font-semibold text-right" style={{ color: c.text }}>{contractBooking.restaurant_name || ownerName}</span>
                </div>
                <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 font-dm text-[13px]" style={{ color: c.textMuted }}>
                  <span>{locale === 'fr' ? 'Créateur' : 'Creator'}</span>
                  <span className="font-semibold text-right" style={{ color: c.text }}>
                    {contractBooking.creator_username ? `@${contractBooking.creator_username}` : `${contractBooking.creator_first_name} ${contractBooking.creator_last_name}`}
                  </span>
                </div>
                <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 font-dm text-[13px]" style={{ color: c.textMuted }}>
                  <span>{locale === 'fr' ? 'Date' : 'Date'}</span>
                  <span className="font-semibold text-right" style={{ color: c.text }}>
                    {new Date(contractBooking.booking_date).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </span>
                </div>
                <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 font-dm text-[13px]" style={{ color: c.textMuted }}>
                  <span>{locale === 'fr' ? 'Horaire' : 'Time'}</span>
                  <span className="font-semibold text-right" style={{ color: c.text }}>{contractBooking.start_time?.slice(0, 5)} - {contractBooking.end_time?.slice(0, 5)}</span>
                </div>
                {contractBooking.max_people && (
                  <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 font-dm text-[13px]" style={{ color: c.textMuted }}>
                    <span>{t.contractPeople}</span>
                    <span className="font-semibold text-right" style={{ color: c.text }}>1 → {contractBooking.max_people}</span>
                  </div>
                )}
                <div className="flex justify-between font-dm text-[13px]" style={{ color: c.textMuted }}>
                  <span>{t.contractDeadline}</span>
                  <span className="font-semibold" style={{ color: c.text }}>J+5</span>
                </div>
                <div className="flex justify-between font-dm text-[13px]" style={{ color: c.textMuted }}>
                  <span>{t.contractDuration}</span>
                  <span className="font-semibold" style={{ color: c.text }}>12 {locale === 'fr' ? 'mois' : 'months'}</span>
                </div>
                {contractBooking.restaurant_virality_tiers && contractBooking.restaurant_virality_tiers.length > 0 && (
                  <div className="rounded-lg p-3 mt-2" style={{ background: 'rgba(232,71,26,0.05)', border: '1px solid rgba(232,71,26,0.1)' }}>
                    <p className="font-dm text-[11px] font-semibold mb-1" style={{ color: '#E8471A' }}>{locale === 'fr' ? 'Prime de viralité' : 'Virality bonus'}</p>
                    {contractBooking.restaurant_virality_tiers.map((tier, i) => (
                      <p key={i} className="font-dm text-[11px]" style={{ color: c.textMuted }}>
                        &gt; {(tier.views / 1000).toFixed(0)}k {locale === 'fr' ? 'vues' : 'views'} → +{tier.bonus}€
                        <span className="text-[10px] opacity-60 ml-1">({t.contractViralityNote})</span>
                      </p>
                    ))}
                  </div>
                )}
                <div style={{ borderTop: `1px solid ${c.divider}`, paddingTop: 12, marginTop: 12 }}>
                  <p className="font-dm text-[11px]" style={{ color: c.textMuted }}>
                    {t.contractMention}: <span className="font-semibold">{t.contractMentionText}</span>
                  </p>
                  <p className="font-dm text-[10px] mt-1" style={{ color: c.textMuted, opacity: 0.6 }}>{t.contractCGU}</p>
                </div>
              </div>
              <button onClick={() => setContractBooking(null)}
                className="font-dm w-full text-[13px] font-semibold py-3 rounded-xl cursor-pointer transition-all hover:brightness-110 mt-5"
                style={{ background: '#E8471A', color: '#fff', border: 'none' }}>
                {locale === 'fr' ? 'Fermer' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding tour */}
      {showTour && <OnboardingTour onComplete={handleCompleteTour} locale={locale} />}

      {/* Floating help button */}
      <div className="fixed bottom-5 right-5 z-[100]">
        <button onClick={() => setShowHelpMenu(v => !v)}
          className="w-11 h-11 rounded-full flex items-center justify-center cursor-pointer shadow-lg text-[18px] font-bold transition-all hover:scale-110"
          style={{ background: '#E8471A', color: '#fff', border: 'none' }}>?</button>
        {showHelpMenu && (
          <div className="absolute bottom-14 right-0 rounded-xl p-4 shadow-xl" style={{ background: c.isLight ? '#fff' : '#1e1b17', border: `1px solid ${c.divider}`, width: 220 }}>
            <button onClick={() => { setShowHelpMenu(false); setShowTour(true) }}
              className="font-dm text-[13px] w-full text-left px-3 py-2 rounded-lg cursor-pointer transition-all hover:bg-white/5"
              style={{ background: 'none', border: 'none', color: c.text }}>
              {locale === 'fr' ? 'Rejouer le tour guidé' : 'Replay guided tour'}
            </button>
            <a href="/legal/faq" target="_blank" rel="noopener"
              className="font-dm text-[13px] block px-3 py-2 rounded-lg transition-all hover:bg-white/5"
              style={{ color: c.textMuted, textDecoration: 'none' }}>FAQ</a>
            <a href="mailto:contact@2960agency.com"
              className="font-dm text-[13px] block px-3 py-2 rounded-lg transition-all hover:bg-white/5"
              style={{ color: c.textMuted, textDecoration: 'none' }}>contact@2960agency.com</a>
          </div>
        )}
      </div>
    </div>
  )
}
