'use client'

import Link from 'next/link'
import { useState } from 'react'
import Navbar from '@/components/Navbar'
import { useLanguage } from '@/context/LanguageContext'
import { useTheme } from '@/context/ThemeContext'

/* ── À la carte sub-plans ────────────────────────────────── */

interface AlaCartePlan {
  id: string
  name: string; nameEn: string
  price: string
  sub: string; subEn: string
  desc: string; descEn: string
  bullets: string[]; bulletsEn: string[]
  benchmarks: string[]; benchmarksEn: string[]
  cta: string; ctaEn: string
}

const ALA_CARTE: AlaCartePlan[] = [
  {
    id: 'sans_abo',
    name: 'Sans abo', nameEn: 'No sub',
    price: '0',
    sub: 'puis 35€ HT / collab', subEn: 'then €35 excl. tax / collab',
    desc: 'Pour tester ponctuellement ou faire des collabs de temps en temps sans engagement.',
    descEn: 'For occasional collabs with no commitment.',
    bullets: [
      'Accès complet à la plateforme',
      'Publication d\'offres illimitée',
      'Les créateurs postulent à vos offres',
      'Paiement uniquement si collab complétée',
    ],
    bulletsEn: [
      'Full platform access',
      'Unlimited offer posting',
      'Creators apply to your offers',
      'Pay only when a collab is completed',
    ],
    benchmarks: ['1 collab = 35€', '2 collabs = 70€', '4 collabs = 140€'],
    benchmarksEn: ['1 collab = €35', '2 collabs = €70', '4 collabs = €140'],
    cta: 'Commencer gratuitement', ctaEn: 'Start for free',
  },
  {
    id: 'basic',
    name: 'Basic', nameEn: 'Basic',
    price: '29',
    sub: '1 collab incluse, puis 20€ HT/collab', subEn: '1 collab included, then €20 excl. tax/collab',
    desc: 'Pour les établissements qui veulent démarrer sérieusement sans trop s\'engager.',
    descEn: 'For venues that want to start properly without over-committing.',
    bullets: [
      '1 collab incluse / mois',
      '20€ par collab supplémentaire',
      'Publication d\'offres illimitée',
      'Les créateurs postulent à vos offres',
      'Coût réduit sur les collabs en plus',
    ],
    bulletsEn: [
      '1 collab included / month',
      '€20 per additional collab',
      'Unlimited offer posting',
      'Creators apply to your offers',
      'Lower cost on extra collabs',
    ],
    benchmarks: ['1 collab = 29€', '2 collabs = 49€', '3 collabs = 69€'],
    benchmarksEn: ['1 collab = €29', '2 collabs = €49', '3 collabs = €69'],
    cta: 'Choisir Basic', ctaEn: 'Choose Basic',
  },
  {
    id: 'active',
    name: 'Active', nameEn: 'Active',
    price: '69',
    sub: '4 collabs incluses, puis 14€ HT/collab', subEn: '4 collabs included, then €14 excl. tax/collab',
    desc: 'Pour les établissements qui veulent activer plusieurs créateurs chaque mois.',
    descEn: 'For venues that want to activate multiple creators every month.',
    bullets: [
      '4 collabs incluses / mois',
      '14€ par collab supplémentaire',
      'Publication d\'offres illimitée',
      'Les créateurs postulent à vos offres',
      'Meilleur rapport usage / coût',
    ],
    bulletsEn: [
      '4 collabs included / month',
      '€14 per additional collab',
      'Unlimited offer posting',
      'Creators apply to your offers',
      'Best usage / cost ratio',
    ],
    benchmarks: ['4 collabs = 69€', '6 collabs = 97€', '8 collabs = 125€'],
    benchmarksEn: ['4 collabs = €69', '6 collabs = €97', '8 collabs = €125'],
    cta: 'Choisir Active', ctaEn: 'Choose Active',
  },
]

/* ── Component ─────────────────────────────────────────────── */

export default function TarifsPage() {
  const { locale } = useLanguage()
  const { c } = useTheme()
  const fr = locale === 'fr'
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [alaCarteTab, setAlaCarteTab] = useState<string>('sans_abo')

  const yearly = billingCycle === 'yearly'
  const discount = 0.8

  const getPrice = (monthly: string) => {
    const m = parseFloat(monthly)
    if (yearly) return Math.round(m * 12 * discount).toString()
    return monthly
  }

  const priceUnit = yearly ? (fr ? '€ HT/an' : '€/year excl. tax') : (fr ? '€ HT/mois' : '€/month excl. tax')

  const monthlyEquiv = (monthly: string) => {
    if (!yearly) return null
    const m = Math.round(parseFloat(monthly) * discount)
    return fr ? `soit ${m}€/mois` : `or €${m}/month`
  }

  const activePlan = ALA_CARTE.find(p => p.id === alaCarteTab) || ALA_CARTE[0]

  return (
    <div style={{ background: c.pageBg, minHeight: '100vh' }}>
      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <Navbar />

      {/* Top glow */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 60% 35% at 50% -5%, rgba(217,79,42,0.07) 0%, transparent 65%)',
      }} />

      <div className="relative" style={{ paddingTop: 120, paddingBottom: 120 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(217,79,42,0.08)',
              border: '1px solid rgba(217,79,42,0.2)',
              borderRadius: 999, padding: '8px 18px',
              marginBottom: 28,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#D94F2A' }} />
              <span className="font-dm" style={{ fontSize: 12, fontWeight: 600, color: '#D94F2A', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {fr ? 'Essai de lancement : 30 jours + 3 collabs offertes' : 'Launch offer: 30 days + 3 free collabs'}
              </span>
            </div>

            <h1 className="font-dm text-white" style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 16,
            }}>
              {fr ? 'Tarifs simples, sans surprise.' : 'Simple pricing, no surprises.'}
            </h1>
            <p className="font-dm" style={{
              fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
              color: c.isLight ? '#444444' : 'rgba(255,255,255,0.5)', lineHeight: 1.6,
              maxWidth: 480, margin: '0 auto',
            }}>
              {fr ? 'Commencez gratuitement. Montez en puissance quand vous en avez besoin.' : 'Start for free. Scale up when you need to.'}
            </p>
          </div>

          {/* Billing Toggle */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginBottom: 48 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 20,
              background: c.isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${c.isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 999, padding: '8px 12px',
              boxShadow: yearly ? '0 0 30px rgba(217,79,42,0.15)' : 'none',
              transition: 'box-shadow 0.3s',
            }}>
              <button onClick={() => setBillingCycle('monthly')} className="font-dm" style={{
                background: 'transparent', border: 'none',
                color: !yearly ? (c.isLight ? '#111111' : '#fff') : (c.isLight ? '#999999' : 'rgba(255,255,255,0.4)'),
                fontSize: 15, fontWeight: !yearly ? 600 : 500, cursor: 'pointer', padding: '8px 12px',
              }}>
                {fr ? 'Mensuel' : 'Monthly'}
              </button>

              <div onClick={() => setBillingCycle(yearly ? 'monthly' : 'yearly')} style={{
                position: 'relative', width: 56, height: 30,
                background: yearly ? '#D94F2A' : (c.isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'),
                borderRadius: 999, cursor: 'pointer', transition: 'background 0.3s',
                border: '1px solid ' + (yearly ? '#D94F2A' : (c.isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)')),
              }}>
                <div style={{
                  position: 'absolute', top: 3, left: yearly ? 28 : 3,
                  width: 22, height: 22, background: '#fff',
                  borderRadius: '50%', transition: 'left 0.3s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }} />
              </div>

              <button onClick={() => setBillingCycle('yearly')} className="font-dm" style={{
                background: 'transparent', border: 'none',
                color: yearly ? (c.isLight ? '#111111' : '#fff') : (c.isLight ? '#999999' : 'rgba(255,255,255,0.4)'),
                fontSize: 15, fontWeight: yearly ? 600 : 500, cursor: 'pointer',
                padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 10,
              }}>
                {fr ? 'Annuel' : 'Yearly'}
                <span style={{
                  background: 'rgba(217,79,42,0.15)', border: '1px solid rgba(217,79,42,0.3)',
                  color: '#D94F2A', fontSize: 11, fontWeight: 700,
                  letterSpacing: '0.05em', textTransform: 'uppercase',
                  padding: '4px 10px', borderRadius: 999,
                  opacity: yearly ? 1 : 0.6, transition: 'opacity 0.2s',
                }}>
                  −20%
                </span>
              </button>
            </div>

            {yearly && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 16px', background: 'rgba(217,79,42,0.08)',
                border: '1px solid rgba(217,79,42,0.15)',
                borderRadius: 999, animation: 'fadeIn 0.3s ease-out',
              }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1L9 5L13 5.5L10 8.5L10.5 13L7 10.5L3.5 13L4 8.5L1 5.5L5 5L7 1Z" fill="rgba(217,79,42,0.3)" stroke="#D94F2A" strokeWidth="1.2" strokeLinejoin="round"/>
                </svg>
                <span className="font-dm" style={{ fontSize: 12, fontWeight: 600, color: '#D94F2A', letterSpacing: '0.02em' }}>
                  {fr ? 'Économisez 2 mois en payant annuellement' : 'Save 2 months by paying yearly'}
                </span>
              </div>
            )}
          </div>

          {/* ═══ 3-COLUMN GRID ═══ */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(1, 1fr)',
            gap: 20,
            marginBottom: 80,
          }} className="tarifs-grid">
            {/* ── COLUMN 1: À LA CARTE ── */}
            <div style={{
              background: c.cardBg,
              border: `1px solid ${c.inputBorder}`,
              borderRadius: 20,
              padding: 'clamp(20px, 4vw, 32px)',
              display: 'flex', flexDirection: 'column',
            }}>
              <p className="font-dm" style={{
                fontSize: 12, fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: c.isLight ? '#444444' : 'rgba(255,255,255,0.45)',
                marginBottom: 16,
              }}>
                {fr ? 'À la carte' : 'Pay as you go'}
              </p>

              {/* Tabs */}
              <div style={{
                display: 'flex', gap: 0,
                background: c.isLight ? '#e8e8ec' : 'rgba(255,255,255,0.04)',
                borderRadius: 12, padding: 4,
                marginBottom: 24,
              }}>
                {ALA_CARTE.map(plan => (
                  <button key={plan.id} onClick={() => setAlaCarteTab(plan.id)}
                    className="font-dm"
                    style={{
                      flex: 1, padding: '10px 8px',
                      borderRadius: 10, border: 'none',
                      fontSize: 13, fontWeight: alaCarteTab === plan.id ? 600 : 400,
                      cursor: 'pointer', transition: 'all 0.2s',
                      background: alaCarteTab === plan.id ? (c.isLight ? '#ffffff' : 'rgba(255,255,255,0.1)') : 'transparent',
                      color: alaCarteTab === plan.id ? c.text : (c.isLight ? '#888888' : 'rgba(255,255,255,0.35)'),
                      boxShadow: alaCarteTab === plan.id ? (c.isLight ? '0 1px 4px rgba(0,0,0,0.08)' : '0 1px 4px rgba(0,0,0,0.2)') : 'none',
                    }}>
                    {fr ? plan.name : plan.nameEn}
                  </button>
                ))}
              </div>

              {/* Active tab content */}
              <div key={activePlan.id} style={{ animation: 'fadeIn 0.25s ease-out', flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Price */}
                <div style={{ marginBottom: 6 }}>
                  <span className="font-dm text-white" style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>
                    {getPrice(activePlan.price)}
                  </span>
                  <span className="font-dm" style={{ fontSize: 14, color: c.isLight ? '#555555' : 'rgba(255,255,255,0.4)', marginLeft: 4 }}>
                    {priceUnit}
                  </span>
                </div>

                {monthlyEquiv(activePlan.price) && activePlan.price !== '0' && (
                  <p className="font-dm" style={{ fontSize: 12, color: 'rgba(217,79,42,0.6)', marginBottom: 4 }}>
                    {monthlyEquiv(activePlan.price)}
                  </p>
                )}

                <p className="font-dm" style={{ fontSize: 13, color: c.isLight ? '#555555' : 'rgba(255,255,255,0.4)', marginBottom: 24 }}>
                  {fr ? activePlan.sub : activePlan.subEn}
                </p>

                <div style={{ height: 1, background: c.isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)', marginBottom: 20 }} />

                <p className="font-dm" style={{ fontSize: 13, color: c.isLight ? '#444444' : 'rgba(255,255,255,0.45)', marginBottom: 20, lineHeight: 1.6 }}>
                  {fr ? activePlan.desc : activePlan.descEn}
                </p>

                {/* Bullets */}
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {(fr ? activePlan.bullets : activePlan.bulletsEn).map((b, i) => (
                    <li key={i} className="font-dm" style={{ fontSize: 13, color: c.isLight ? '#555555' : 'rgba(200,195,185,0.7)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <svg style={{ flexShrink: 0, marginTop: 2 }} width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <circle cx="6.5" cy="6.5" r="6.5" fill={c.isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'} />
                        <path d="M3.5 6.5L5.5 8.5L9 5" stroke={c.isLight ? '#555555' : 'rgba(255,255,255,0.5)'} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {b}
                    </li>
                  ))}
                </ul>

                {/* Benchmarks */}
                <div style={{
                  background: c.isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${c.isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: 12, padding: '12px 14px', marginBottom: 24,
                }}>
                  <p className="font-dm" style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: c.isLight ? '#707070' : 'rgba(255,255,255,0.25)', marginBottom: 8 }}>
                    {fr ? 'Repères' : 'Examples'}
                  </p>
                  {(fr ? activePlan.benchmarks : activePlan.benchmarksEn).map((b, i) => (
                    <p key={i} className="font-dm" style={{ fontSize: 12.5, color: c.isLight ? '#444444' : 'rgba(255,255,255,0.45)', lineHeight: 1.8 }}>{b}</p>
                  ))}
                </div>

                {/* CTA */}
                <div style={{ marginTop: 'auto' }}>
                  <Link href="/business" className="font-dm" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '100%', height: 46, borderRadius: 999,
                    fontSize: 12, fontWeight: 600, letterSpacing: '0.07em',
                    textTransform: 'uppercase', textDecoration: 'none', transition: 'all 0.2s',
                    background: 'transparent',
                    color: c.isLight ? '#444444' : 'rgba(255,255,255,0.7)',
                    border: `1px solid ${c.isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.15)'}`,
                  }}>
                    {fr ? activePlan.cta : activePlan.ctaEn}
                  </Link>
                </div>
              </div>
            </div>

            {/* ── COLUMN 2: PRO ── */}
            <div style={{
              background: c.cardBg,
              border: '1px solid rgba(217,79,42,0.25)',
              borderRadius: 20,
              padding: 'clamp(20px, 4vw, 32px)',
              display: 'flex', flexDirection: 'column',
              position: 'relative',
              boxShadow: '0 0 40px rgba(217,79,42,0.06)',
            }}>
              {/* Badge */}
              <div style={{
                position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                background: '#D94F2A', color: '#fff',
                borderRadius: 999, padding: '5px 16px',
                fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
                textTransform: 'uppercase', whiteSpace: 'nowrap',
              }} className="font-dm">
                {fr ? 'Le plus populaire' : 'Most popular'}
              </div>

              <p className="font-dm" style={{
                fontSize: 12, fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: '#D94F2A', marginBottom: 16,
              }}>
                Pro
              </p>

              <div style={{ marginBottom: 6 }}>
                <span className="font-dm text-white" style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {getPrice('119')}
                </span>
                <span className="font-dm" style={{ fontSize: 14, color: c.isLight ? '#555555' : 'rgba(255,255,255,0.4)', marginLeft: 4 }}>
                  {priceUnit}
                </span>
              </div>

              {yearly && (
                <p className="font-dm" style={{ fontSize: 12, color: 'rgba(217,79,42,0.6)', marginBottom: 4 }}>
                  {fr ? `soit ${Math.round(119 * 0.8)}€/mois` : `or €${Math.round(119 * 0.8)}/month`}
                </p>
              )}

              <p className="font-dm" style={{ fontSize: 13, color: c.isLight ? '#555555' : 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
                {fr ? 'par établissement — Collabs illimitées*' : 'per venue — Unlimited collabs*'}
              </p>

              <p className="font-dm" style={{ fontSize: 13, color: c.isLight ? '#444444' : 'rgba(255,255,255,0.45)', marginBottom: 20, lineHeight: 1.6 }}>
                {fr
                  ? 'Pour les établissements qui intègrent les collabs dans leur stratégie régulière et veulent choisir leurs créateurs.'
                  : 'For venues that make collabs a core strategy and want to choose their creators.'}
              </p>

              <div style={{ height: 1, background: c.isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)', marginBottom: 20 }} />

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(fr
                  ? ['Collabs illimitées*', 'Publication d\'offres illimitée', 'Les créateurs postulent à vos offres', '10 invitations directes / mois', 'Directives créateurs personnalisées', 'Stats & insights mensuels', 'Liberté totale, budget prévisible']
                  : ['Unlimited collabs*', 'Unlimited offer posting', 'Creators apply to your offers', '10 direct invitations / month', 'Custom creator guidelines', 'Monthly stats & insights', 'Total freedom, predictable budget']
                ).map((b, i) => (
                  <li key={i} className="font-dm" style={{ fontSize: 13, color: c.isLight ? '#555555' : 'rgba(200,195,185,0.7)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <svg style={{ flexShrink: 0, marginTop: 2 }} width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <circle cx="6.5" cy="6.5" r="6.5" fill="rgba(217,79,42,0.15)" />
                      <path d="M3.5 6.5L5.5 8.5L9 5" stroke="#D94F2A" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {b}
                  </li>
                ))}
              </ul>

              {/* Benchmarks */}
              <div style={{
                background: c.isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${c.isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: 12, padding: '12px 14px', marginBottom: 24,
              }}>
                <p className="font-dm" style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: c.isLight ? '#707070' : 'rgba(255,255,255,0.25)', marginBottom: 8 }}>
                  {fr ? 'Repères' : 'Examples'}
                </p>
                {(fr
                  ? ['9 collabs = 119€', '12 collabs = 119€', '20 collabs = 119€']
                  : ['9 collabs = €119', '12 collabs = €119', '20 collabs = €119']
                ).map((b, i) => (
                  <p key={i} className="font-dm" style={{ fontSize: 12.5, color: c.isLight ? '#444444' : 'rgba(255,255,255,0.45)', lineHeight: 1.8 }}>{b}</p>
                ))}
              </div>

              <div style={{ marginTop: 'auto' }}>
                <Link href="/business" className="font-dm" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '100%', height: 46, borderRadius: 999,
                  fontSize: 12, fontWeight: 600, letterSpacing: '0.07em',
                  textTransform: 'uppercase', textDecoration: 'none', transition: 'all 0.2s',
                  background: '#D94F2A', color: '#fff',
                }}>
                  {fr ? 'Choisir Pro' : 'Choose Pro'}
                </Link>
              </div>
            </div>

            {/* ── COLUMN 3: PRO + ASSIST ── */}
            <div style={{
              background: c.cardBg,
              border: `1px solid ${c.isLight ? 'rgba(180,140,20,0.2)' : 'rgba(252,250,166,0.12)'}`,
              borderRadius: 20,
              padding: 'clamp(20px, 4vw, 32px)',
              display: 'flex', flexDirection: 'column',
              position: 'relative',
            }}>
              {/* Badge */}
              <div style={{
                position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                background: c.isLight ? 'rgba(180,140,20,0.1)' : 'rgba(252,250,166,0.12)',
                color: c.isLight ? '#8a6d14' : 'rgba(252,250,166,0.7)',
                border: `1px solid ${c.isLight ? 'rgba(180,140,20,0.25)' : 'rgba(252,250,166,0.2)'}`,
                borderRadius: 999, padding: '5px 16px',
                fontSize: 11, fontWeight: 700, letterSpacing: '0.05em',
                textTransform: 'uppercase', whiteSpace: 'nowrap',
              }} className="font-dm">
                {fr ? 'On s\'en occupe' : 'We handle it'}
              </div>

              <p className="font-dm" style={{
                fontSize: 12, fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: c.isLight ? '#8a6d14' : 'rgba(252,250,166,0.5)', marginBottom: 16,
              }}>
                Pro + Assist
              </p>

              <div style={{ marginBottom: 6 }}>
                <span className="font-dm text-white" style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {getPrice('499')}
                </span>
                <span className="font-dm" style={{ fontSize: 14, color: c.isLight ? '#555555' : 'rgba(255,255,255,0.4)', marginLeft: 4 }}>
                  {priceUnit}
                </span>
              </div>

              {yearly && (
                <p className="font-dm" style={{ fontSize: 12, color: c.isLight ? '#8a6d14' : 'rgba(252,250,166,0.4)', marginBottom: 4 }}>
                  {fr ? `soit ${Math.round(499 * 0.8)}€/mois` : `or €${Math.round(499 * 0.8)}/month`}
                </p>
              )}

              <p className="font-dm" style={{ fontSize: 13, color: c.isLight ? '#555555' : 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
                {fr ? '119€ Pro + 380€ Assist' : '€119 Pro + €380 Assist'}
              </p>

              <p className="font-dm" style={{ fontSize: 13, color: c.isLight ? '#444444' : 'rgba(255,255,255,0.45)', marginBottom: 20, lineHeight: 1.6 }}>
                {fr
                  ? 'Pour les établissements qui veulent les bénéfices des collabs sans gérer le suivi.'
                  : 'For venues that want the benefits of collabs without managing the follow-up.'}
              </p>

              <div style={{ height: 1, background: c.isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)', marginBottom: 20 }} />

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(fr
                  ? ['Tout ce qu\'il y a dans Pro', 'Aide à sélectionner les bons créateurs', 'Lancement des collaborations', 'Suivi des échanges & collabs en cours', 'Récupération des contenus', 'Updates via groupe WhatsApp']
                  : ['Everything in Pro', 'Help selecting the right creators', 'Collab launch support', 'Follow-up on exchanges & active collabs', 'Content retrieval', 'Updates via WhatsApp group']
                ).map((b, i) => (
                  <li key={i} className="font-dm" style={{ fontSize: 13, color: c.isLight ? '#555555' : 'rgba(200,195,185,0.65)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <svg style={{ flexShrink: 0, marginTop: 3 }} width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <circle cx="6.5" cy="6.5" r="6.5" fill={c.isLight ? 'rgba(180,140,20,0.1)' : 'rgba(252,250,166,0.06)'} />
                      <path d="M3.5 6.5L5.5 8.5L9 5" stroke={c.isLight ? '#8a6d14' : 'rgba(252,250,166,0.45)'} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {b}
                  </li>
                ))}
              </ul>

              {/* Ideal for */}
              <div style={{
                background: c.isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${c.isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: 12, padding: '12px 14px', marginBottom: 24,
              }}>
                <p className="font-dm" style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: c.isLight ? '#707070' : 'rgba(255,255,255,0.25)', marginBottom: 8 }}>
                  {fr ? 'Idéal pour' : 'Ideal for'}
                </p>
                {(fr
                  ? ['Restos sans temps', 'Débutants en marketing digital', 'Délégation totale']
                  : ['Restaurants short on time', 'Digital marketing beginners', 'Full delegation']
                ).map((b, i) => (
                  <p key={i} className="font-dm" style={{ fontSize: 12.5, color: c.isLight ? '#444444' : 'rgba(255,255,255,0.45)', lineHeight: 1.8 }}>{b}</p>
                ))}
              </div>

              <div style={{ marginTop: 'auto' }}>
                <Link href="/business" className="font-dm" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '100%', height: 46, borderRadius: 999,
                  fontSize: 12, fontWeight: 600, letterSpacing: '0.07em',
                  textTransform: 'uppercase', textDecoration: 'none', transition: 'all 0.2s',
                  background: 'transparent',
                  color: c.isLight ? '#8a6d14' : 'rgba(252,250,166,0.5)',
                  border: `1px solid ${c.isLight ? 'rgba(180,140,20,0.25)' : 'rgba(252,250,166,0.15)'}`,
                }}>
                  {fr ? 'Choisir Pro + Assist' : 'Choose Pro + Assist'}
                </Link>
              </div>
            </div>
          </div>

          {/* Footer note + CTA */}
          <div style={{
            textAlign: 'center',
            background: c.isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)',
            border: `1px solid ${c.isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'}`,
            borderRadius: 20, padding: '40px 24px',
          }}>
            <p className="font-dm" style={{
              fontSize: 12, color: c.isLight ? '#808080' : 'rgba(255,255,255,0.2)',
              marginBottom: 28, lineHeight: 1.7,
            }}>
              * {fr
                ? 'Dans la limite raisonnable d\'1 collab/jour. Une collab est comptabilisée quand un créateur est sélectionné, la collaboration a bien lieu, et le contenu convenu est livré ou publié.'
                : 'Within the reasonable limit of 1 collab/day. A collab is counted when a creator is selected, the collab takes place, and the agreed content is delivered or published.'}
            </p>
            <h3 className="font-dm text-white" style={{
              fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)', fontWeight: 700, marginBottom: 12,
            }}>
              {fr ? 'Prêt à démarrer ?' : 'Ready to start?'}
            </h3>
            <p className="font-dm" style={{
              fontSize: 14, color: c.isLight ? '#555555' : 'rgba(255,255,255,0.4)', marginBottom: 28,
            }}>
              {fr ? '30 jours d\'essai + 3 collabs offertes pour tout nouvel établissement.' : '30-day trial + 3 free collabs for every new venue.'}
            </p>
            <Link href="/business" className="font-dm" style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              height: 50, paddingInline: 36,
              background: '#D94F2A', color: '#fff',
              borderRadius: 999, fontSize: 13, fontWeight: 600,
              letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none',
            }}>
              {fr ? 'Inscrire mon restaurant' : 'Register my restaurant'}
            </Link>
          </div>
        </div>
      </div>

      {/* Grain */}
      <div className="grain-overlay fixed inset-0 pointer-events-none" style={{ zIndex: 9998 }} />

      {/* Responsive grid styles */}
      <style>{`
        @media (min-width: 1024px) {
          .tarifs-grid {
            grid-template-columns: 1.3fr 1fr 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
