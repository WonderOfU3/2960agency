'use client'

import { useState, useEffect } from 'react'

interface Props {
  onComplete: () => void
  locale: 'fr' | 'en'
}

const STEPS = {
  fr: [
    { target: '[data-tour="people"]', title: 'Nombre de convives', body: 'Indiquez combien de personnes maximum le créateur peut emmener. Par défaut : 3.' },
    { target: '[data-tour="slots"]', title: 'Créneaux + réglages', body: 'Vos créneaux sont pré-remplis (déjeuner + dîner). Ajustez si besoin. L\'acceptation auto et la limite sont configurées ici.' },
    { target: '[data-tour="publish"]', title: 'Publiez votre offre', body: 'Un clic et votre offre est visible. Vos 3 collabs offertes sont activées.' },
  ],
  en: [
    { target: '[data-tour="people"]', title: 'Number of guests', body: 'Set how many people the creator can bring. Default: 3.' },
    { target: '[data-tour="slots"]', title: 'Time slots + settings', body: 'Slots are pre-filled (lunch + dinner). Adjust as needed. Auto-accept and weekly limit are configured here.' },
    { target: '[data-tour="publish"]', title: 'Publish your offer', body: 'One click and your offer goes live. Your 3 free collabs are activated.' },
  ],
}

export default function OnboardingTour({ onComplete, locale }: Props) {
  const [step, setStep] = useState(0)
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null)
  const steps = STEPS[locale]

  useEffect(() => {
    const target = document.querySelector(steps[step].target)
    if (target) {
      const rect = target.getBoundingClientRect()
      setPos({ top: rect.bottom + window.scrollY + 12, left: rect.left + window.scrollX, width: Math.min(320, window.innerWidth - 32) })
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [step, steps])

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1)
    else onComplete()
  }

  if (!pos) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[9998] bg-black/50" onClick={onComplete} />

      {/* Tooltip */}
      <div
        className="absolute z-[9999] rounded-2xl p-5 shadow-xl"
        style={{ top: pos.top, left: Math.max(16, pos.left), width: pos.width, background: '#1e1b17', border: '1px solid rgba(232,71,26,0.3)' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="font-dm text-[#E8471A] text-[11px] font-bold uppercase tracking-wider">
            {step + 1}/{steps.length}
          </span>
          <span className="font-dm text-white text-[14px] font-bold">{steps[step].title}</span>
        </div>
        <p className="font-dm text-white/60 text-[13px] leading-relaxed mb-4">{steps[step].body}</p>
        <div className="flex items-center justify-between">
          <button onClick={onComplete}
            className="font-dm text-white/30 text-[12px] cursor-pointer bg-transparent border-none">
            {locale === 'fr' ? 'Passer' : 'Skip'}
          </button>
          <button onClick={next}
            className="font-dm text-[13px] font-semibold px-4 py-2 rounded-lg cursor-pointer transition-all hover:brightness-110"
            style={{ background: '#E8471A', color: '#fff', border: 'none' }}>
            {step < steps.length - 1 ? (locale === 'fr' ? 'Suivant' : 'Next') : (locale === 'fr' ? 'Compris !' : 'Got it!')}
          </button>
        </div>
      </div>
    </>
  )
}
