'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import type { TranslationStrings } from '@/context/LanguageContext'
import { useTheme } from '@/context/ThemeContext'

type BP = 'mobile' | 'tablet' | 'desktop'
function getBP(): BP {
  const w = typeof window !== 'undefined' ? window.innerWidth : 1024
  return w < 768 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop'
}

const CREATOR_STEPS: { titleKey: keyof TranslationStrings; descKey: keyof TranslationStrings }[] = [
  { titleKey: 'hiw_creators_s1_title', descKey: 'hiw_creators_s1_desc' },
  { titleKey: 'hiw_creators_s2_title', descKey: 'hiw_creators_s2_desc' },
  { titleKey: 'hiw_creators_s3_title', descKey: 'hiw_creators_s3_desc' },
  { titleKey: 'hiw_creators_s4_title', descKey: 'hiw_creators_s4_desc' },
]
const BUSINESS_STEPS: { titleKey: keyof TranslationStrings; descKey: keyof TranslationStrings }[] = [
  { titleKey: 'hiw_businesses_s1_title', descKey: 'hiw_businesses_s1_desc' },
  { titleKey: 'hiw_businesses_s2_title', descKey: 'hiw_businesses_s2_desc' },
  { titleKey: 'hiw_businesses_s3_title', descKey: 'hiw_businesses_s3_desc' },
  { titleKey: 'hiw_businesses_s4_title', descKey: 'hiw_businesses_s4_desc' },
]

/* Simple hook — adds 'visible' class when element enters viewport */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) { el.classList.add('hiw-visible'); obs.disconnect() } },
        { threshold: 0.12 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return ref
}

export default function HowItWorks() {
  const { t, locale } = useLanguage()
  const { c } = useTheme()
  const [bp, setBp] = useState<BP>('desktop')
  const headerRef = useReveal()
  const leftRef   = useReveal()
  const rightRef  = useReveal()

  useEffect(() => {
    const fn = () => setBp(getBP())
    fn()
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  const isM = bp === 'mobile'
  const isT = bp === 'tablet'
  const isStack = isM || isT

  return (
      <section
          id="comment-ca-marche"
          className="relative bg-[#0a0a08] overflow-hidden"
          style={{ padding: isM ? '80px 20px' : isT ? '100px 40px' : '120px 60px' }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(217,79,42,0.03) 0%, transparent 70%)',
        }} />
        <div className="grain-overlay absolute inset-0 pointer-events-none" />

        <div className="relative" style={{ maxWidth: 1120, margin: '0 auto' }}>

          {/* Header */}
          <div
              ref={headerRef}
              className="hiw-reveal"
              style={{ textAlign: 'center', marginBottom: isM ? 40 : 56 }}
          >
            <h2 className="font-dm text-white" style={{
              fontSize: isM ? '1.5rem' : isT ? '2rem' : '2.4rem',
              fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15,
              marginBottom: isM ? 16 : 20,
            }}>
              {t('hiw_title')}
            </h2>
            <p className="font-dm text-white/70" style={{
              fontSize: isM ? '0.9rem' : '1.1rem',
              lineHeight: 1.5, maxWidth: 500, margin: '0 auto', fontWeight: 500,
            }}>
              {t('hiw_subtitle')}
            </p>
          </div>

          {/* Columns */}
          <div style={{
            display: isStack ? 'flex' : 'grid',
            gridTemplateColumns: isStack ? undefined : '1fr 1fr',
            flexDirection: isStack ? 'column' : undefined,
            gap: isM ? 32 : 40,
          }}>
            <div ref={leftRef} className="hiw-reveal" style={{ transitionDelay: '0.05s' }}>
              <Column
                  title={t('hiw_creators_title')}
                  steps={CREATOR_STEPS}
                  ctaLabel={t('hiw_creators_cta')}
                  ctaVariant="solid"
                  ctaHref="/creator"
                  isM={isM}
                  t={t}
                  isLight={c.isLight}
              />
            </div>
            <div ref={rightRef} className="hiw-reveal" style={{ transitionDelay: '0.15s' }}>
              <Column
                  title={t('hiw_businesses_title')}
                  steps={BUSINESS_STEPS}
                  ctaLabel={t('hiw_businesses_cta')}
                  ctaVariant="outline"
                  ctaHref="/business"
                  ctaSubtitle={locale === 'fr' ? '*Pour tout nouveau restaurant inscrit' : '*For every newly registered restaurant'}
                  isM={isM}
                  t={t}
                  isLight={c.isLight}
              />
            </div>
          </div>
        </div>

        <style>{`
        .hiw-reveal {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .hiw-visible {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>
      </section>
  )
}

function Column({ title, steps, ctaLabel, ctaVariant, ctaHref, ctaSubtitle, isM, t, isLight }: {
  title: string
  steps: { titleKey: keyof TranslationStrings; descKey: keyof TranslationStrings }[]
  ctaLabel: string
  ctaVariant: 'solid' | 'outline'
  ctaHref: string
  ctaSubtitle?: string
  isM: boolean
  t: (key: keyof TranslationStrings) => string
  isLight: boolean
}) {
  return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        background: isLight ? '#ffffff' : 'rgba(255,255,255,0.025)',
        border: isLight ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.06)',
        boxShadow: isLight ? '0 2px 12px rgba(0,0,0,0.04)' : 'none',
        borderRadius: 20,
        padding: isM ? '24px 16px' : '36px 32px',
        height: '100%',
      }}>
        <h3 className="font-dm text-white" style={{
          fontSize: isM ? '1.1rem' : '1.25rem',
          fontWeight: 600, letterSpacing: '-0.01em', marginBottom: isM ? 24 : 28,
        }}>
          {title}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: isM ? 20 : 24, flex: 1 }}>
          {steps.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: isM ? 14 : 16, alignItems: 'flex-start' }}>
                <div className="font-dm" style={{
                  flexShrink: 0,
                  width: isM ? 28 : 32, height: isM ? 28 : 32,
                  borderRadius: 10,
                  background: 'rgba(217,79,42,0.12)',
                  border: '1px solid rgba(217,79,42,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: isM ? 12 : 13, fontWeight: 700, color: '#D94F2A', marginTop: 2,
                }}>
                  {i + 1}
                </div>
                <div>
                  <p className="font-dm text-white" style={{
                    fontSize: isM ? '0.85rem' : '0.92rem',
                    fontWeight: 600, lineHeight: 1.3, marginBottom: 4,
                  }}>
                    {t(step.titleKey)}
                  </p>
                  <p className="font-dm text-white/45" style={{
                    fontSize: isM ? '0.78rem' : '0.84rem',
                    fontWeight: 400, lineHeight: 1.55,
                  }}>
                    {t(step.descKey)}
                  </p>
                </div>
              </div>
          ))}
        </div>

        <div style={{ paddingTop: isM ? 28 : 32 }}>
          <Link
              href={ctaHref}
              className={`font-dm rounded-full uppercase transition-all duration-300 flex items-center justify-center ${
                  ctaVariant === 'solid'
                      ? 'bg-white text-[#0a0a08] hover:bg-white/90 hover:scale-[1.03] active:scale-[0.97]'
                      : 'text-white hover:bg-white/5 hover:scale-[1.03] active:scale-[0.97]'
              }`}
              style={{
                height: isM ? 42 : 46,
                fontSize: isM ? 11 : 12, fontWeight: 600, letterSpacing: '0.06em',
                width: '100%', textDecoration: 'none',
                ...(ctaVariant === 'outline' ? {
                  border: isLight ? '1px solid rgba(0,0,0,0.15)' : '1px solid rgba(255,255,255,.2)',
                  backdropFilter: 'blur(8px)',
                } : {}),
              }}
          >
            {ctaLabel}
          </Link>
          {ctaSubtitle && (
            <p className="font-dm" style={{
              fontSize: 11, color: isLight ? '#888888' : 'rgba(255,255,255,0.3)',
              textAlign: 'center', marginTop: 8, fontStyle: 'italic',
            }}>
              {ctaSubtitle}
            </p>
          )}
        </div>
      </div>
  )
}
