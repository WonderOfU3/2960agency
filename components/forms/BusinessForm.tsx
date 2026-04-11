'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { FormShell, TextField, TextareaField, PillSelect, RadioCards, HighlightBox, Divider } from './ui'
import {
  BUSINESS_TYPES, ARRONDISSEMENTS, CREATOR_OFFER, CONTENT_WANTED, CONTENT_DESTINATION,
  CREATIVE_FREEDOM, COLLAB_FREQUENCY, BIZ_PREVIOUS_COLLABS, YES_NO, YES_NO_MAYBE, DAYS, TIMES,
} from './data'
import type { Locale } from '@/context/LanguageContext'

const T: Record<Locale, Record<string, string>> = {
  fr: {
    title: "Rejoins __2960 AGENCY__ en tant qu'entreprise",
    subtitle: "Présente ton adresse et dis-nous ce que tu recherches. On te recontacte rapidement pour t'onboarder.",
    step1: "Ton établissement", step2: "Ce que tu recherches", step3: "Logistique",
    next: "Suivant", prev: "Précédent",
    submit: "Envoyer ma demande", submitting: "Envoi en cours…", back: "Retour à l'accueil",
    bizName: "Nom de l'établissement", yourName: "Votre nom (propriétaire / gérant)",
    email: "Adresse e-mail", phone: "Téléphone",
    instagram: "Instagram", tiktok: "TikTok", website: "Site web",
    bizType: "Type d'établissement", cuisine: "Type de cuisine",
    address: "Adresse", city: "Ville", arrondissement: "Arrondissement (si Paris)",
    phBiz: "Ex : Le Café des Amis", phName: "Ex : Jean Dupont",
    phEmail: "contact@exemple.com", phPhone: "+33 1 23 45 67 89",
    phInsta: "@votrecompte", phTiktok: "@votrecompte", phWeb: "https://www.exemple.com",
    phCuisine: "Ex : Français, Italien, Fusion…", phAddress: "12 rue de la Paix", phCity: "Paris",
    offer: "Qu'offririez-vous généralement à un créateur ?",
    offerHint: "Un repas pour 2 permet au créateur de venir accompagné et de produire un contenu plus naturel et engageant.",
    contentWanted: "Quel contenu souhaiteriez-vous en échange ?",
    contentDestination: "Où souhaitez-vous que le contenu soit posté ?",
    freedom: "Quelle liberté créative donneriez-vous au créateur ?",
    frequency: "À quelle fréquence aimeriez-vous faire des collabs ?",
    prevCollabs: "Avez-vous déjà travaillé avec des créateurs / influenceurs ?",
    prevDetail: "Si oui ou tenté, quelle a été votre expérience ?",
    challenge: "Quel est votre plus grand défi en matière de visibilité actuellement ?",
    phDetail: "Décrivez brièvement…",
    phChallenge: "Ex : Pas assez de contenu en ligne, peu de visibilité sur les réseaux…",
    delivery: "Proposez-vous la livraison ?",
    deliveryCollab: "Seriez-vous ouvert à des collabs en livraison ?",
    bestDays: "Meilleurs jours pour les collabs",
    bestTimes: "Meilleurs créneaux",
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
    submit: "Submit my request", submitting: "Submitting…", back: "Back to home",
    bizName: "Business name", yourName: "Your name (owner / manager)",
    email: "Email address", phone: "Phone",
    instagram: "Instagram", tiktok: "TikTok", website: "Website",
    bizType: "Business type", cuisine: "Cuisine type",
    address: "Address", city: "City", arrondissement: "Arrondissement (if Paris)",
    phBiz: "e.g. The Good Coffee", phName: "e.g. Jane Smith",
    phEmail: "contact@example.com", phPhone: "+1 514 123 4567",
    phInsta: "@youraccount", phTiktok: "@youraccount", phWeb: "https://www.example.com",
    phCuisine: "e.g. French, Italian, Fusion…", phAddress: "12 Main Street", phCity: "Paris",
    offer: "What would you typically offer a creator?",
    offerHint: "A meal for 2 lets the creator bring a guest and produce more natural, engaging content.",
    contentWanted: "What content would you want in exchange?",
    contentDestination: "Where do you want the creator to post the content?",
    freedom: "How much creative freedom would you give the creator?",
    frequency: "How often would you want to do collabs?",
    prevCollabs: "Have you worked with creators / influencers before?",
    prevDetail: "If yes or tried, what was your experience?",
    challenge: "What's your biggest challenge with visibility right now?",
    phDetail: "Describe briefly…",
    phChallenge: "e.g. Not enough content online, low social media visibility…",
    delivery: "Do you offer delivery?",
    deliveryCollab: "Would you be open to delivery-based collabs?",
    bestDays: "Best days for collabs",
    bestTimes: "Best times",
    heardAbout: "How did you hear about us?",
    phHeard: "e.g. Instagram, word of mouth…",
    req: "This field is required", invEmail: "Invalid email address",
    submitErr: "Something went wrong. Please try again.",
  },
}

interface State {
  bizName: string; yourName: string; email: string; phone: string
  instagram: string; tiktok: string; website: string
  bizType: string; cuisine: string; address: string; city: string; arrondissement: string
  offer: string; contentWanted: string[]; contentDestination: string
  freedom: string; frequency: string
  prevCollabs: string; prevDetail: string; challenge: string
  delivery: string; deliveryCollab: string
  bestDays: string[]; bestTimes: string[]
  heardAbout: string
}

const INIT: State = {
  bizName: '', yourName: '', email: '', phone: '',
  instagram: '', tiktok: '', website: '',
  bizType: '', cuisine: '', address: '', city: '', arrondissement: '',
  offer: '', contentWanted: [], contentDestination: '',
  freedom: '', frequency: '',
  prevCollabs: '', prevDetail: '', challenge: '',
  delivery: '', deliveryCollab: '',
  bestDays: [], bestTimes: [],
  heardAbout: '',
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

  const validate = (s: number): boolean => {
    const e: Record<string, string> = {}
    if (s === 0) {
      if (!form.bizName.trim()) e.bizName = t.req
      if (!form.yourName.trim()) e.yourName = t.req
      if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = t.invEmail
      if (!form.phone.trim()) e.phone = t.req
      if (!form.bizType) e.bizType = t.req
      if (!form.cuisine.trim()) e.cuisine = t.req
      if (!form.address.trim()) e.address = t.req
      if (!form.city.trim()) e.city = t.req
    }
    if (s === 1) {
      if (!form.offer) e.offer = t.req
      if (form.contentWanted.length === 0) e.contentWanted = t.req
      if (!form.contentDestination) e.contentDestination = t.req
      if (!form.freedom) e.freedom = t.req
      if (!form.frequency) e.frequency = t.req
      if (!form.prevCollabs) e.prevCollabs = t.req
    }
    if (s === 2) {
      if (!form.delivery) e.delivery = t.req
      if (!form.deliveryCollab) e.deliveryCollab = t.req
      if (form.bestDays.length === 0) e.bestDays = t.req
      if (form.bestTimes.length === 0) e.bestTimes = t.req
    }
    setErrors(e)
    if (Object.keys(e).length > 0) {
      setTimeout(() => document.querySelector('[data-e]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50)
    }
    return Object.keys(e).length === 0
  }

  const next = () => { if (validate(step)) { setStep(s => s + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) } }
  const prev = () => { setStep(s => s - 1); setErrors({}); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  const handleSubmit = async () => {
    if (!validate(step)) return
    setSubmitting(true)
    try {
      const payload = {
        bizName: form.bizName.trim(), yourName: form.yourName.trim(),
        email: form.email.trim(), phone: form.phone.trim(),
        instagram: form.instagram.trim() || null, tiktok: form.tiktok.trim() || null,
        website: form.website.trim() || null,
        bizType: form.bizType, cuisine: form.cuisine.trim(),
        address: form.address.trim(), city: form.city.trim(),
        arrondissement: form.arrondissement || null,
        offer: form.offer, contentWanted: form.contentWanted,
        contentDestination: form.contentDestination,
        freedom: form.freedom, frequency: form.frequency,
        prevCollabs: form.prevCollabs, prevDetail: form.prevDetail.trim() || null,
        challenge: form.challenge.trim() || null,
        delivery: form.delivery, deliveryCollab: form.deliveryCollab,
        bestDays: form.bestDays, bestTimes: form.bestTimes,
        heardAbout: form.heardAbout.trim() || null,
        locale,
      }
      const res = await fetch('/api/submit-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('failed')
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
              <TextField label={t.bizName} value={form.bizName} onChange={v => set('bizName', v)} placeholder={t.phBiz} error={errors.bizName} required locale={locale} />
              <TextField label={t.yourName} value={form.yourName} onChange={v => set('yourName', v)} placeholder={t.phName} error={errors.yourName} required locale={locale} />
              <div className="form-grid-2">
                <TextField label={t.email} value={form.email} onChange={v => set('email', v)} placeholder={t.phEmail} error={errors.email} required locale={locale} type="email" />
                <TextField label={t.phone} value={form.phone} onChange={v => set('phone', v)} placeholder={t.phPhone} error={errors.phone} required locale={locale} type="tel" />
              </div>
              <Divider />
              <div className="form-grid-2">
                <TextField label={t.instagram} value={form.instagram} onChange={v => set('instagram', v)} placeholder={t.phInsta} locale={locale} prefix="@" />
                <TextField label={t.tiktok} value={form.tiktok} onChange={v => set('tiktok', v)} placeholder={t.phTiktok} locale={locale} prefix="@" />
              </div>
              <TextField label={t.website} value={form.website} onChange={v => set('website', v)} placeholder={t.phWeb} locale={locale} type="url" />
              <Divider />
              <RadioCards label={t.bizType} options={BUSINESS_TYPES} selected={form.bizType} onChange={v => set('bizType', v)} error={errors.bizType} required locale={locale} />
              <TextField label={t.cuisine} value={form.cuisine} onChange={v => set('cuisine', v)} placeholder={t.phCuisine} error={errors.cuisine} required locale={locale} />
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
              <RadioCards label={t.offer} options={CREATOR_OFFER} selected={form.offer} onChange={v => set('offer', v)} error={errors.offer} required locale={locale} />
              <HighlightBox>{t.offerHint}</HighlightBox>
              <PillSelect label={t.contentWanted} options={CONTENT_WANTED} selected={form.contentWanted} onToggle={v => toggle('contentWanted', v)} error={errors.contentWanted} required locale={locale} />
              <RadioCards label={t.contentDestination} options={CONTENT_DESTINATION} selected={form.contentDestination} onChange={v => set('contentDestination', v)} error={errors.contentDestination} required locale={locale} />
              <Divider />
              <RadioCards label={t.freedom} options={CREATIVE_FREEDOM} selected={form.freedom} onChange={v => set('freedom', v)} error={errors.freedom} required locale={locale} />
              <RadioCards label={t.frequency} options={COLLAB_FREQUENCY} selected={form.frequency} onChange={v => set('frequency', v)} error={errors.frequency} required locale={locale} />
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
              <RadioCards label={t.delivery} options={YES_NO} selected={form.delivery} onChange={v => set('delivery', v)} error={errors.delivery} required locale={locale} />
              <RadioCards label={t.deliveryCollab} options={YES_NO_MAYBE} selected={form.deliveryCollab} onChange={v => set('deliveryCollab', v)} error={errors.deliveryCollab} required locale={locale} />
              <Divider />
              <PillSelect label={t.bestDays} options={DAYS} selected={form.bestDays} onToggle={v => toggle('bestDays', v)} error={errors.bestDays} required locale={locale} />
              <PillSelect label={t.bestTimes} options={TIMES} selected={form.bestTimes} onToggle={v => toggle('bestTimes', v)} error={errors.bestTimes} required locale={locale} />
              <Divider />
              <TextField label={t.heardAbout} value={form.heardAbout} onChange={v => set('heardAbout', v)} placeholder={t.phHeard} locale={locale} />
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
