'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { FormShell, TextField, TextareaField, PillSelect, RadioCards, HighlightBox, Divider } from './ui'
import {
  BUSINESS_TYPES, ARRONDISSEMENTS, CONTENT_WANTED,
  BIZ_PREVIOUS_COLLABS, DAYS,
} from './data'
import type { Locale } from '@/context/LanguageContext'

const T: Record<Locale, Record<string, string>> = {
  fr: {
    title: "Rejoins __2960 AGENCY__ en tant qu'entreprise",
    subtitle: "Présente ton adresse et dis-nous ce que tu recherches. On te recontacte rapidement pour t'onboarder.",
    step1: "Ton établissement", step2: "Ce que tu recherches", step3: "Logistique",
    next: "Suivant", prev: "Précédent",
    submit: "Créer mon compte", submitting: "Création en cours…", back: "Retour à l'accueil",
    ambassadorCode: "Code ambassadeur (optionnel)", ambassadorHint: "Si un créateur t'a recommandé 2960 Agency, entre son code ici",
    bizName: "Nom de l'établissement", yourName: "Votre nom (propriétaire / gérant)",
    email: "Adresse e-mail", phone: "Téléphone",
    password: "Mot de passe", passwordHelp: "Minimum 8 caractères — pour accéder à votre espace restaurant",
    instagram: "Instagram", tiktok: "TikTok", website: "Site web",
    bizType: "Type d'établissement", cuisine: "Type de cuisine",
    address: "Adresse", city: "Ville", arrondissement: "Arrondissement (si Paris)",
    phBiz: "Ex : Le Café des Amis", phName: "Ex : Jean Dupont",
    phEmail: "contact@exemple.com", phPhone: "+33 1 23 45 67 89",
    phInsta: "@votrecompte", phTiktok: "@votrecompte", phWeb: "https://www.exemple.com",
    phCuisine: "Ex : Français, Italien, Fusion…", phAddress: "12 rue de la Paix", phCity: "Paris",
    offer: "Qu'offririez-vous généralement à un créateur ?",
    offerMeal: "Repas offert pour", offerMealTo: "à", offerMealPersons: "personnes",
    offerHint: "Plus vous êtes généreux, plus les créateurs produiront du beau contenu. Un repas pour 2+ permet une vidéo plus naturelle.",
    viralityBonus: "Prime de viralité si la vidéo fonctionne (à définir dans vos réglages)",
    avgMealPrice: "Prix moyen d'un repas par personne (€)",
    phAvgMeal: "Ex : 25",
    manualSelection: "Souhaitez-vous activer la sélection manuelle des créateurs ?",
    manualSelectionHint: "Par défaut, les créateurs vérifiés sont acceptés automatiquement — idéal pour gagner du temps et ouvrir votre restaurant à de nouveaux univers et clientèles.",
    contentWanted: "Quel contenu souhaiteriez-vous en échange ?",
    acceptCGUV: "J'ai lu et j'accepte les Conditions Générales d'Utilisation et de Vente de la Plateforme 2960 Agency, applicables aux restaurateurs professionnels. Je reconnais créer ce compte pour les besoins de mon activité professionnelle et disposer du pouvoir d'engager l'établissement que je représente.",
    acceptViralityTerms: "En activant l'option Primes de viralité, je reconnais définir librement les seuils et montants des primes proposées aux Créateurs. Je comprends qu'aucune prime n'est prélevée tant qu'une Vidéo n'a pas atteint les seuils définis, et que je disposerai de sept (7) jours pour contester avant tout débit.",
    acceptManualTerms: "En activant la sélection automatique des réservations, je m'engage à accueillir tous les Créateurs vérifiés par 2960, sans discrimination, dans des conditions d'accueil identiques à celles habituellement réservées à ma clientèle.",
    privacyNotice: "En créant un compte, vous reconnaissez avoir pris connaissance de la",
    privacyLink: "Politique de Confidentialité",
    cguLink: "Conditions Générales",
    frequency: "Idéalement à quelle fréquence aimeriez-vous faire des collabs ?",
    freqPerWeek: "par semaine", freqPerMonth: "par mois",
    prevCollabs: "Avez-vous déjà travaillé avec des créateurs / influenceurs ?",
    prevDetail: "Si oui ou tenté, quelle a été votre expérience ?",
    challenge: "Quel est votre plus grand défi en matière de visibilité actuellement ?",
    phDetail: "Décrivez brièvement…",
    phChallenge: "Ex : Pas assez de contenu en ligne, peu de visibilité sur les réseaux…",
    siren: "Numéro SIREN / SIRET de l'établissement",
    phSiren: "Ex : 123 456 789 ou 123 456 789 00012",
    bestDaysHint: "Plus vous êtes disponible, plus vite on pourra vous matcher avec des créateurs ! Beaucoup de créateurs ont un travail ou des études à côté, donc plus de jours = plus de chances.",
    bestDays: "Quels jours et créneaux êtes-vous disponible ?",
    addDay: "+ Ajouter un jour", from: "de", to: "à",
    maxCreatorsWeek: "Combien de créateurs max par semaine ?",
    maxCreatorsSlot: "Combien de créateurs par créneau ?",
    slotCustom: "par créneau",
    heardAbout: "Comment avez-vous entendu parler de nous ?",
    phHeard: "Ex : Instagram, bouche à oreille…",
    req: "Ce champ est requis", invEmail: "Adresse e-mail invalide",
    submitErr: "Une erreur est survenue. Réessaie.",
  },
  en: {
    title: "Join __2960 AGENCY__ as a business",
    subtitle: "Showcase your venue and tell us what you're looking for. We'll get back to you quickly to onboard you.",
    step1: "Your business", step2: "What you're looking for", step3: "Logistics",
    next: "Next", prev: "Previous",
    submit: "Create my account", submitting: "Creating…", back: "Back to home",
    ambassadorCode: "Ambassador code (optional)", ambassadorHint: "If a creator recommended 2960 Agency to you, enter their code here",
    bizName: "Business name", yourName: "Your name (owner / manager)",
    email: "Email address", phone: "Phone",
    password: "Password", passwordHelp: "Minimum 8 characters — to access your restaurant dashboard",
    instagram: "Instagram", tiktok: "TikTok", website: "Website",
    bizType: "Business type", cuisine: "Cuisine type",
    address: "Address", city: "City", arrondissement: "Arrondissement (if Paris)",
    phBiz: "e.g. The Good Coffee", phName: "e.g. Jane Smith",
    phEmail: "contact@example.com", phPhone: "+1 514 123 4567",
    phInsta: "@youraccount", phTiktok: "@youraccount", phWeb: "https://www.example.com",
    phCuisine: "e.g. French, Italian, Fusion…", phAddress: "12 Main Street", phCity: "Paris",
    offer: "What would you typically offer a creator?",
    offerMeal: "Free meal for", offerMealTo: "to", offerMealPersons: "people",
    offerHint: "The more generous you are, the better content creators will produce. A meal for 2+ allows for a more natural video.",
    viralityBonus: "Virality bonus if the video performs (configurable in your settings)",
    avgMealPrice: "Average meal price per person (€)",
    phAvgMeal: "e.g. 25",
    manualSelection: "Would you like to enable manual creator selection?",
    manualSelectionHint: "By default, verified creators are accepted automatically — ideal for saving time and opening your restaurant to new audiences and styles.",
    contentWanted: "What content would you want in exchange?",
    acceptCGUV: "I have read and accept the General Terms of Use and Sale of the 2960 Agency Platform, applicable to professional restaurateurs. I confirm that I am creating this account for my professional activity and that I have the authority to commit the establishment I represent.",
    acceptViralityTerms: "By enabling the Virality Bonuses option, I acknowledge that I freely set the thresholds and amounts of bonuses offered to Creators. I understand that no bonus will be charged until a Video reaches the defined thresholds, and that I will have seven (7) days to dispute before any debit.",
    acceptManualTerms: "By enabling automatic booking selection, I commit to welcoming all Creators verified by 2960, without discrimination, under the same conditions as those usually reserved for my regular customers.",
    privacyNotice: "By creating an account, you acknowledge having read the",
    privacyLink: "Privacy Policy",
    cguLink: "General Terms",
    frequency: "Ideally, how often would you like to do collabs?",
    freqPerWeek: "per week", freqPerMonth: "per month",
    prevCollabs: "Have you worked with creators / influencers before?",
    prevDetail: "If yes or tried, what was your experience?",
    challenge: "What's your biggest challenge with visibility right now?",
    phDetail: "Describe briefly…",
    phChallenge: "e.g. Not enough content online, low social media visibility…",
    siren: "Business registration number (SIREN / SIRET)",
    phSiren: "e.g. 123 456 789 or 123 456 789 00012",
    bestDaysHint: "The more available you are, the faster we can match you with creators! Many creators have jobs or studies on the side, so more days = more chances.",
    bestDays: "Which days and time slots are you available?",
    addDay: "+ Add a day", from: "from", to: "to",
    maxCreatorsWeek: "Max creators per week?",
    maxCreatorsSlot: "How many creators per slot?",
    slotCustom: "per slot",
    heardAbout: "How did you hear about us?",
    phHeard: "e.g. Instagram, word of mouth…",
    req: "This field is required", invEmail: "Invalid email address",
    submitErr: "Something went wrong. Please try again.",
  },
}

interface DaySlot {
  day: string
  from: string
  to: string
}

interface State {
  ambassadorCode: string
  bizName: string; yourName: string; email: string; phone: string; password: string
  instagram: string; tiktok: string; website: string
  bizType: string; cuisine: string; address: string; city: string; arrondissement: string
  offerMealMin: string; offerMealMax: string; viralityBonus: boolean
  avgMealPrice: string; manualSelection: boolean
  contentWanted: string[]; contentDestination: string
  acceptCGUV: boolean; acceptViralityTerms: boolean; acceptManualTerms: boolean
  frequencyCount: string; frequencyUnit: 'week' | 'month'
  prevCollabs: string; prevDetail: string; challenge: string
  daySlots: DaySlot[]
  maxCreatorsWeek: string; maxCreatorsSlot: string
  heardAbout: string; siren: string
}

const INIT: State = {
  ambassadorCode: '',
  bizName: '', yourName: '', email: '', phone: '', password: '',
  instagram: '', tiktok: '', website: '',
  bizType: '', cuisine: '', address: '', city: '', arrondissement: '',
  offerMealMin: '1', offerMealMax: '2', viralityBonus: false,
  avgMealPrice: '', manualSelection: false,
  contentWanted: [], contentDestination: '',
  acceptCGUV: false, acceptViralityTerms: false, acceptManualTerms: false,
  frequencyCount: '2', frequencyUnit: 'week',
  prevCollabs: '', prevDetail: '', challenge: '',
  daySlots: [{ day: 'monday', from: '12:00', to: '15:00' }],
  maxCreatorsWeek: '', maxCreatorsSlot: '',
  heardAbout: '', siren: '',
}

function LegalCheckbox({ checked, onChange, error, required, children }: {
  checked: boolean; onChange: () => void; error?: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <div data-e={error ? '' : undefined}>
      <label className="flex items-start gap-3 cursor-pointer">
        <div onClick={onChange}
          className="flex items-center justify-center flex-shrink-0 rounded transition-all mt-0.5"
          style={{
            width: 20, height: 20,
            background: checked ? '#E8471A' : 'transparent',
            border: checked ? '2px solid #E8471A' : `2px solid ${error ? 'rgba(217,79,42,0.6)' : 'rgba(128,128,128,0.4)'}`,
          }}>
          {checked && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
        <span className="font-dm text-white/50 text-[12px] leading-relaxed">
          {children}
          {required && <span className="text-[#D94F2A] ml-1">*</span>}
        </span>
      </label>
      {error && <p className="font-dm text-[#D94F2A]/70 text-[11px] mt-1 ml-8">{error}</p>}
    </div>
  )
}

export default function BusinessForm() {
  const { locale } = useLanguage()
  const router = useRouter()
  const t = T[locale]

  const [step, setStep]             = useState(0)
  const [form, setForm]             = useState<State>(INIT)
  const [errors, setErrors]         = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { window.scrollTo(0, 0) }, [])

  const set = (k: keyof State, v: string) => {
    setForm(p => ({ ...p, [k]: v }))
    if (errors[k]) setErrors(p => { const n = { ...p }; delete n[k]; return n })
  }

  const toggle = (k: keyof State, v: string) => {
    setForm(p => {
      const arr = p[k] as string[]
      return { ...p, [k]: arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v] }
    })
    if (errors[k]) setErrors(p => { const n = { ...p }; delete n[k]; return n })
  }

  const addDaySlot = () => {
    setForm(p => ({ ...p, daySlots: [...p.daySlots, { day: 'monday', from: '12:00', to: '15:00' }] }))
    if (errors.daySlots) setErrors(p => { const n = { ...p }; delete n.daySlots; return n })
  }

  const updateDaySlot = (i: number, k: keyof DaySlot, v: string) => {
    setForm(p => ({ ...p, daySlots: p.daySlots.map((s, j) => j === i ? { ...s, [k]: v } : s) }))
  }

  const removeDaySlot = (i: number) => {
    setForm(p => ({ ...p, daySlots: p.daySlots.filter((_, j) => j !== i) }))
  }

  const validate = (s: number): boolean => {
    const e: Record<string, string> = {}
    if (s === 0) {
      if (!form.bizName.trim()) e.bizName = t.req
      if (!form.yourName.trim()) e.yourName = t.req
      if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t.invEmail
      if (!form.phone.trim()) e.phone = t.req
      if (!form.password.trim() || form.password.length < 8) e.password = t.passwordHelp
      if (!form.bizType) e.bizType = t.req
      if (!form.cuisine.trim()) e.cuisine = t.req
      if (!form.address.trim()) e.address = t.req
      if (!form.city.trim()) e.city = t.req
    }
    if (s === 1) {
      if (form.contentWanted.length === 0) e.contentWanted = t.req
      if (!form.frequencyCount || parseInt(form.frequencyCount) < 1) e.frequencyCount = t.req
      if (!form.prevCollabs) e.prevCollabs = t.req
    }
    if (s === 2) {
      if (form.daySlots.length === 0) e.daySlots = t.req
      if (!form.maxCreatorsWeek) e.maxCreatorsWeek = t.req
      if (!form.maxCreatorsSlot) e.maxCreatorsSlot = t.req
      if (!form.siren.trim()) e.siren = t.req
      if (!form.acceptCGUV) e.acceptCGUV = t.req
      if (form.viralityBonus && !form.acceptViralityTerms) e.acceptViralityTerms = t.req
      if (!form.manualSelection && !form.acceptManualTerms) e.acceptManualTerms = t.req
    }
    setErrors(e)
    if (Object.keys(e).length > 0) {
      setTimeout(() => document.querySelector('[data-e]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50)
    }
    return Object.keys(e).length === 0
  }

  const next = () => {
    if (validate(step)) {
      if (step === 0 && typeof window !== 'undefined') {
        if ((window as any).ttq) { (window as any).ttq.track('Lead') }
        if ((window as any).fbq) { (window as any).fbq('track', 'Lead') }
      }
      setStep(s => s + 1); window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
  const prev = () => { setStep(s => s - 1); setErrors({}); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  const handleSubmit = async () => {
    if (!validate(step)) return
    setSubmitting(true)
    try {
      const payload = {
        ambassadorCode: form.ambassadorCode.trim() || null,
        bizName: form.bizName.trim(), yourName: form.yourName.trim(), password: form.password,
        email: form.email.trim(), phone: form.phone.trim(),
        instagram: form.instagram.trim() || null, tiktok: form.tiktok.trim() || null,
        website: form.website.trim() || null,
        bizType: form.bizType, cuisine: form.cuisine.trim(),
        address: form.address.trim(), city: form.city.trim(),
        arrondissement: form.arrondissement || null,
        offer: `Repas pour ${form.offerMealMin} à ${form.offerMealMax} personnes${form.viralityBonus ? ' + Prime de viralité' : ''}`,
        avgMealPrice: form.avgMealPrice ? parseInt(form.avgMealPrice) : null,
        manualSelection: form.manualSelection,
        contentWanted: form.contentWanted,
        contentDestination: form.contentDestination,
        freedom: '', frequency: `${form.frequencyCount} ${form.frequencyUnit === 'week' ? (locale === 'fr' ? 'par semaine' : 'per week') : (locale === 'fr' ? 'par mois' : 'per month')}`,
        prevCollabs: form.prevCollabs, prevDetail: form.prevDetail.trim() || null,
        challenge: form.challenge.trim() || null,
        delivery: '', deliveryCollab: '',
        siren: form.siren.trim() || null,
        bestDays: form.daySlots.map(s => s.day),
        bestTimes: form.daySlots.map(s => `${s.day}: ${s.from}-${s.to}`),
        maxCreatorsWeek: form.maxCreatorsWeek,
        maxCreatorsSlot: form.maxCreatorsSlot,
        heardAbout: form.heardAbout.trim() || null,
        locale,
      }
      const res = await fetch('/api/submit-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('failed')
      if (typeof window !== 'undefined') {
        if ((window as any).ttq) { (window as any).ttq.track('CompleteRegistration') }
        if ((window as any).fbq) { (window as any).fbq('track', 'CompleteRegistration') }
      }
      router.push('/business/success')
    } catch {
      setErrors({ submit: t.submitErr })
      setSubmitting(false)
    }
  }

  const steps = [t.step1, t.step2, t.step3]

  return (
      <FormShell
          title={t.title} subtitle={t.subtitle}
          stepLabels={steps} currentStep={step}
          onNext={next} onPrev={prev} onSubmit={handleSubmit} submitting={submitting}
          nextLabel={t.next} prevLabel={t.prev}
          submitLabel={submitting ? t.submitting : t.submit}
          backHref="/" backLabel={t.back} locale={locale}
      >
        {step === 0 && (
            <div className="form-fields">
              <TextField label={t.ambassadorCode} value={form.ambassadorCode} onChange={v => set('ambassadorCode', v.toUpperCase())} placeholder="ABC12345" locale={locale} />
              <p className="font-dm text-[#c8c3b8]/40 text-[12px] leading-relaxed" style={{ marginTop: -12, marginBottom: 16 }}>{t.ambassadorHint}</p>
              <Divider />
              <TextField label={t.bizName} value={form.bizName} onChange={v => set('bizName', v)} placeholder={t.phBiz} error={errors.bizName} required locale={locale} />
              <TextField label={t.yourName} value={form.yourName} onChange={v => set('yourName', v)} placeholder={t.phName} error={errors.yourName} required locale={locale} />
              <div className="form-grid-2">
                <TextField label={t.email} value={form.email} onChange={v => set('email', v)} placeholder={t.phEmail} error={errors.email} required locale={locale} type="email" />
                <TextField label={t.phone} value={form.phone} onChange={v => set('phone', v)} placeholder={t.phPhone} error={errors.phone} required locale={locale} type="tel" />
              </div>
              <TextField label={t.password} value={form.password} onChange={v => set('password', v)} placeholder={t.passwordHelp} error={errors.password} required locale={locale} type="password" autoComplete="new-password" />
              <Divider />
              <div className="form-grid-2">
                <TextField label={t.instagram} value={form.instagram} onChange={v => set('instagram', v)} placeholder={t.phInsta} locale={locale} prefix="@" />
                <TextField label={t.tiktok} value={form.tiktok} onChange={v => set('tiktok', v)} placeholder={t.phTiktok} locale={locale} prefix="@" />
              </div>
              <TextField label={t.website} value={form.website} onChange={v => set('website', v)} placeholder={t.phWeb} locale={locale} type="url" />
              <Divider />
              <RadioCards label={t.bizType} options={BUSINESS_TYPES} selected={form.bizType} onChange={v => set('bizType', v)} error={errors.bizType} required locale={locale} />
              <TextField label={t.cuisine} value={form.cuisine} onChange={v => set('cuisine', v)} placeholder={t.phCuisine} error={errors.cuisine} required locale={locale} />
              <TextField label={t.avgMealPrice} value={form.avgMealPrice} onChange={v => set('avgMealPrice', v)} placeholder={t.phAvgMeal} locale={locale} type="number" />
              <Divider />
              <TextField label={t.address} value={form.address} onChange={v => set('address', v)} placeholder={t.phAddress} error={errors.address} required locale={locale} />
              <div className="form-grid-2">
                <TextField label={t.city} value={form.city} onChange={v => set('city', v)} placeholder={t.phCity} error={errors.city} required locale={locale} />
                <div>
                  <PillSelect label={t.arrondissement} options={ARRONDISSEMENTS}
                              selected={form.arrondissement ? [form.arrondissement] : []}
                              onToggle={v => set('arrondissement', form.arrondissement === v ? '' : v)}
                              locale={locale} compact />
                </div>
              </div>
            </div>
        )}

        {step === 1 && (
            <div className="form-fields">
              {/* Offer: meal for X to X persons */}
              <div>
                <label className="font-dm text-white/60 text-[12px] font-semibold uppercase tracking-[0.06em] block mb-3">
                  {t.offer} <span className="text-[#D94F2A]">*</span>
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-dm text-white/60 text-[13px]">{t.offerMeal}</span>
                  <input type="number" min="1" max="10" value={form.offerMealMin} onChange={e => set('offerMealMin', e.target.value)}
                    className="font-dm rounded-lg text-[14px] text-white/90 outline-none text-center bg-white/[0.04] border border-white/[0.07]"
                    style={{ height: 44, width: 55 }} />
                  <span className="font-dm text-white/60 text-[13px]">{t.offerMealTo}</span>
                  <input type="number" min="1" max="10" value={form.offerMealMax} onChange={e => set('offerMealMax', e.target.value)}
                    className="font-dm rounded-lg text-[14px] text-white/90 outline-none text-center bg-white/[0.04] border border-white/[0.07]"
                    style={{ height: 44, width: 55 }} />
                  <span className="font-dm text-white/60 text-[13px]">{t.offerMealPersons}</span>
                </div>
              </div>

              {/* Virality bonus checkbox */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div onClick={() => setForm(p => ({ ...p, viralityBonus: !p.viralityBonus }))}
                  className="flex items-center justify-center flex-shrink-0 rounded transition-all"
                  style={{
                    width: 22, height: 22,
                    background: form.viralityBonus ? '#E8471A' : 'transparent',
                    border: form.viralityBonus ? '2px solid #E8471A' : '2px solid rgba(128,128,128,0.4)',
                  }}>
                  {form.viralityBonus && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <span className="font-dm text-white/60 text-[13px]">{t.viralityBonus}</span>
              </label>

              <HighlightBox>{t.offerHint}</HighlightBox>

              {/* Manual selection toggle */}
              <div>
                <label className="font-dm text-white/60 text-[12px] font-semibold uppercase tracking-[0.06em] block mb-3">
                  {t.manualSelection}
                </label>
                <div className="flex items-center gap-3">
                  <div
                    onClick={() => setForm(p => ({ ...p, manualSelection: !p.manualSelection }))}
                    className="flex-shrink-0 cursor-pointer transition-all"
                    style={{
                      position: 'relative', width: 48, height: 26,
                      background: form.manualSelection ? '#E8471A' : 'var(--input-bg, rgba(255,255,255,0.1))',
                      borderRadius: 999, border: '1px solid ' + (form.manualSelection ? '#E8471A' : 'var(--input-border, rgba(255,255,255,0.15))'),
                    }}>
                    <div style={{
                      position: 'absolute', top: 2,
                      left: form.manualSelection ? 23 : 2,
                      width: 20, height: 20, background: '#fff',
                      borderRadius: '50%', transition: 'left 0.2s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                      border: '1px solid rgba(0,0,0,0.08)',
                    }} />
                  </div>
                  <span className="font-dm text-white/50 text-[13px]">
                    {form.manualSelection ? (locale === 'fr' ? 'Oui' : 'Yes') : (locale === 'fr' ? 'Non' : 'No')}
                  </span>
                </div>
                <p className="font-dm text-[#c8c3b8]/40 text-[12px] leading-relaxed mt-2">{t.manualSelectionHint}</p>
              </div>

              <PillSelect label={t.contentWanted} options={CONTENT_WANTED} selected={form.contentWanted} onToggle={v => toggle('contentWanted', v)} error={errors.contentWanted} required locale={locale} />
              <Divider />
              <div>
                <label className="font-dm text-white/60 text-[12px] font-semibold uppercase tracking-[0.06em] block mb-3">
                  {t.frequency} <span className="text-[#D94F2A]">*</span>
                </label>
                {errors.frequencyCount && <p className="font-dm text-[#D94F2A]/70 text-[12px] mb-2">{errors.frequencyCount}</p>}
                <div className="flex items-center gap-3">
                  <input type="number" min="1" max="30" value={form.frequencyCount}
                    onChange={e => set('frequencyCount', e.target.value)}
                    className="font-dm rounded-lg text-[14px] text-white/90 outline-none text-center bg-white/[0.04] border border-white/[0.07]"
                    style={{ height: 44, width: 60 }} />
                  <div className="flex gap-1 rounded-lg p-0.5 bg-white/[0.03]">
                    <button type="button" onClick={() => setForm(p => ({ ...p, frequencyUnit: 'week' }))}
                      className={`font-dm text-[12px] font-semibold px-3 py-1.5 rounded-md cursor-pointer transition-all border-none ${form.frequencyUnit === 'week' ? 'bg-[#D94F2A]/[0.15] text-[#E8471A]' : 'bg-transparent text-white/30'}`}>
                      {t.freqPerWeek}
                    </button>
                    <button type="button" onClick={() => setForm(p => ({ ...p, frequencyUnit: 'month' }))}
                      className={`font-dm text-[12px] font-semibold px-3 py-1.5 rounded-md cursor-pointer transition-all border-none ${form.frequencyUnit === 'month' ? 'bg-[#D94F2A]/[0.15] text-[#E8471A]' : 'bg-transparent text-white/30'}`}>
                      {t.freqPerMonth}
                    </button>
                  </div>
                </div>
              </div>
              <Divider />
              <RadioCards label={t.prevCollabs} options={BIZ_PREVIOUS_COLLABS} selected={form.prevCollabs} onChange={v => set('prevCollabs', v)} error={errors.prevCollabs} required locale={locale} />
              {(form.prevCollabs === 'yes' || form.prevCollabs === 'tried') && (
                  <div className="animate-fade-in">
                    <TextareaField label={t.prevDetail} value={form.prevDetail} onChange={v => set('prevDetail', v)} placeholder={t.phDetail} locale={locale} rows={2} />
                  </div>
              )}
              <TextareaField label={t.challenge} value={form.challenge} onChange={v => set('challenge', v)} placeholder={t.phChallenge} locale={locale} rows={2} />
            </div>
        )}

        {step === 2 && (
            <div className="form-fields">
              <HighlightBox>{t.bestDaysHint}</HighlightBox>

              {/* Per-day time slots */}
              <div>
                <label className="font-dm text-white/60 text-[12px] font-semibold uppercase tracking-[0.06em] block mb-3">
                  {t.bestDays} <span className="text-[#D94F2A]">*</span>
                </label>
                {errors.daySlots && <p className="font-dm text-[#D94F2A]/70 text-[12px] mb-2">{errors.daySlots}</p>}

                <div className="space-y-2.5">
                  {form.daySlots.map((slot, i) => (
                    <div key={i} className="flex items-center gap-2 animate-fade-in">
                      <select value={slot.day} onChange={e => updateDaySlot(i, 'day', e.target.value)}
                        className="font-dm rounded-xl text-[13px] text-white/90 outline-none cursor-pointer flex-shrink-0 bg-white/[0.04] border border-white/[0.07]"
                        style={{ height: 48, padding: '0 12px', minWidth: 110 }}>
                        {DAYS.map(d => <option key={d.value} value={d.value}>{d.label[locale]}</option>)}
                      </select>

                      <span className="font-dm text-white/30 text-[12px] flex-shrink-0">{t.from}</span>
                      <input type="time" value={slot.from} onChange={e => updateDaySlot(i, 'from', e.target.value)}
                        className="font-dm rounded-xl text-[13px] text-white/90 outline-none bg-white/[0.04] border border-white/[0.07]"
                        style={{ height: 48, padding: '0 10px', width: 100 }} />

                      <span className="font-dm text-white/30 text-[12px] flex-shrink-0">{t.to}</span>
                      <input type="time" value={slot.to} onChange={e => updateDaySlot(i, 'to', e.target.value)}
                        className="font-dm rounded-xl text-[13px] text-white/90 outline-none bg-white/[0.04] border border-white/[0.07]"
                        style={{ height: 48, padding: '0 10px', width: 100 }} />

                      {form.daySlots.length > 1 && (
                        <button type="button" onClick={() => removeDaySlot(i)}
                          className="font-dm text-red-400/60 hover:text-red-400 text-[18px] cursor-pointer flex-shrink-0 transition-colors"
                          style={{ background: 'none', border: 'none', lineHeight: 1 }}>
                          &times;
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button type="button" onClick={addDaySlot}
                  className="font-dm text-[13px] text-[#E8471A] font-semibold mt-3 cursor-pointer hover:brightness-125 transition-all"
                  style={{ background: 'none', border: 'none', padding: 0 }}>
                  {t.addDay}
                </button>
              </div>

              <Divider />
              <TextField label={t.maxCreatorsWeek} value={form.maxCreatorsWeek} onChange={v => set('maxCreatorsWeek', v)} placeholder="5" error={errors.maxCreatorsWeek} required locale={locale} type="number" />
              <div>
                <label className="font-dm text-white/60 text-[12px] font-semibold uppercase tracking-[0.06em] block mb-3">
                  {t.maxCreatorsSlot} <span className="text-[#D94F2A]">*</span>
                </label>
                {errors.maxCreatorsSlot && <p className="font-dm text-[#D94F2A]/70 text-[12px] mb-2">{errors.maxCreatorsSlot}</p>}
                <div className="flex flex-col gap-2">
                  {(() => {
                    const isCustom = form.maxCreatorsSlot !== '1' && form.maxCreatorsSlot !== 'no_limit' && form.maxCreatorsSlot !== ''
                    return <>
                      <button type="button" onClick={() => set('maxCreatorsSlot', '1')}
                        className={`font-dm text-[13px] text-left px-4 py-3 rounded-xl cursor-pointer transition-all border ${
                          form.maxCreatorsSlot === '1'
                            ? 'bg-[#D94F2A]/[0.08] border-[#D94F2A]/25 text-[#E8471A] font-semibold'
                            : 'bg-white/[0.04] border-white/[0.07] text-white/50'
                        }`}>
                        {locale === 'fr' ? '1 par créneau' : '1 per slot'}
                      </button>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => { if (!isCustom) set('maxCreatorsSlot', '2') }}
                          className={`font-dm text-[13px] text-left px-4 py-3 rounded-xl cursor-pointer transition-all flex-1 border ${
                            isCustom
                              ? 'bg-[#D94F2A]/[0.08] border-[#D94F2A]/25 text-[#E8471A] font-semibold'
                              : 'bg-white/[0.04] border-white/[0.07] text-white/50'
                          }`}>
                          <span className="flex items-center gap-2">
                            <input type="number" min="2" max="20"
                              value={isCustom ? form.maxCreatorsSlot : '2'}
                              onClick={e => e.stopPropagation()}
                              onChange={e => { const v = Math.max(2, parseInt(e.target.value) || 2); set('maxCreatorsSlot', String(v)) }}
                              className="font-dm rounded-lg text-[14px] text-white/90 outline-none text-center bg-white/[0.07] border border-white/[0.10]"
                              style={{ height: 32, width: 48 }} />
                            <span>{t.slotCustom}</span>
                          </span>
                        </button>
                      </div>
                      <button type="button" onClick={() => set('maxCreatorsSlot', 'no_limit')}
                        className={`font-dm text-[13px] text-left px-4 py-3 rounded-xl cursor-pointer transition-all border ${
                          form.maxCreatorsSlot === 'no_limit'
                            ? 'bg-[#D94F2A]/[0.08] border-[#D94F2A]/25 text-[#E8471A] font-semibold'
                            : 'bg-white/[0.04] border-white/[0.07] text-white/50'
                        }`}>
                        {locale === 'fr' ? 'Pas de limite' : 'No limit'}
                      </button>
                    </>
                  })()}
                </div>
              </div>
              <Divider />
              <TextField label={t.heardAbout} value={form.heardAbout} onChange={v => set('heardAbout', v)} placeholder={t.phHeard} locale={locale} />
              <Divider />
              <TextField label={t.siren} value={form.siren} onChange={v => set('siren', v)} placeholder={t.phSiren} error={errors.siren} required locale={locale} />

              <Divider />

              {/* Legal checkboxes */}
              <div className="form-fields" style={{ gap: 16 }}>
                {/* CGUV acceptance — always required */}
                <LegalCheckbox
                  checked={form.acceptCGUV}
                  onChange={() => { setForm(p => ({ ...p, acceptCGUV: !p.acceptCGUV })); if (errors.acceptCGUV) setErrors(p => { const n = { ...p }; delete n.acceptCGUV; return n }) }}
                  error={errors.acceptCGUV}
                  required
                >
                  {locale === 'fr'
                    ? t.acceptCGUV.split('Conditions Générales d\'Utilisation et de Vente').map((part, i) => i === 0
                      ? <span key={i}>{part}<a href="/legal/cguv-restaurants" target="_blank" rel="noopener" style={{ color: '#E8471A', textDecoration: 'underline' }}>Conditions G&#233;n&#233;rales d&apos;Utilisation et de Vente</a></span>
                      : <span key={i}>{part}</span>)
                    : t.acceptCGUV.split('General Terms of Use and Sale').map((part, i) => i === 0
                      ? <span key={i}>{part}<a href="/legal/cguv-restaurants" target="_blank" rel="noopener" style={{ color: '#E8471A', textDecoration: 'underline' }}>General Terms of Use and Sale</a></span>
                      : <span key={i}>{part}</span>)
                  }
                </LegalCheckbox>

                {/* Virality terms — required only if viralityBonus is on */}
                {form.viralityBonus && (
                  <div className="animate-fade-in">
                    <LegalCheckbox
                      checked={form.acceptViralityTerms}
                      onChange={() => { setForm(p => ({ ...p, acceptViralityTerms: !p.acceptViralityTerms })); if (errors.acceptViralityTerms) setErrors(p => { const n = { ...p }; delete n.acceptViralityTerms; return n }) }}
                      error={errors.acceptViralityTerms}
                      required
                    >
                      {t.acceptViralityTerms}
                    </LegalCheckbox>
                  </div>
                )}

                {/* Auto selection terms — required when auto-accept is on (manualSelection is off) */}
                {!form.manualSelection && (
                  <div className="animate-fade-in">
                    <LegalCheckbox
                      checked={form.acceptManualTerms}
                      onChange={() => { setForm(p => ({ ...p, acceptManualTerms: !p.acceptManualTerms })); if (errors.acceptManualTerms) setErrors(p => { const n = { ...p }; delete n.acceptManualTerms; return n }) }}
                      error={errors.acceptManualTerms}
                      required
                    >
                      {t.acceptManualTerms}
                    </LegalCheckbox>
                  </div>
                )}

                {/* Privacy notice (informational, no checkbox) */}
                <p className="font-dm text-[#c8c3b8]/40 text-[12px] leading-relaxed">
                  {t.privacyNotice}{' '}
                  <a href="/legal/privacy" target="_blank" rel="noopener" style={{ color: '#E8471A', textDecoration: 'underline' }}>
                    {t.privacyLink}
                  </a>.
                </p>
              </div>
            </div>
        )}

        {errors.submit && (
            <div className="bg-[#D94F2A]/[0.04] border border-[#D94F2A]/10 rounded-xl" style={{ padding: '12px 16px', marginTop: 24 }}>
              <p className="font-dm text-[#D94F2A]/70 text-[13px] text-center">{errors.submit}</p>
            </div>
        )}
      </FormShell>
  )
}
