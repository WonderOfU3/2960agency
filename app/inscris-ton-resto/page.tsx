'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { fireCompleteRegistration } from '@/lib/pixels'

const CTA_LABEL = 'Activer mes 3 premières collabs'
const CTA_SUB = '3 collabs sans abonnement pour commencer. Aucune CB requise.'

function CtaButton({ className = '' }: { className?: string }) {
  return (
    <a href="#form"
      className={`inline-block font-dm text-[14px] sm:text-[15px] font-bold rounded-full transition-all hover:brightness-110 active:scale-[0.98] ${className}`}
      style={{ background: '#E8471A', color: '#fff', padding: '16px 32px', textDecoration: 'none' }}>
      {CTA_LABEL} &rarr;
    </a>
  )
}

function StickyMobileCta() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:hidden transition-all duration-300"
      style={{
        background: 'linear-gradient(to top, rgba(10,10,8,0.98) 60%, transparent)',
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        pointerEvents: visible ? 'auto' : 'none',
      }}>
      <a href="#form"
        className="block w-full text-center font-dm text-[14px] font-bold rounded-full"
        style={{ background: '#E8471A', color: '#fff', padding: '14px 0', textDecoration: 'none' }}>
        {CTA_LABEL} &rarr;
      </a>
    </div>
  )
}

export default function InscrisRestoPageWrapper() {
  return (
    <Suspense>
      <InscrisRestoPage />
    </Suspense>
  )
}

function InscrisRestoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [form, setForm] = useState({ email: '', bizName: '', password: '' })
  const [referralCode, setReferralCode] = useState('')
  const [showReferral, setShowReferral] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [globalError, setGlobalError] = useState('')

  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) { setReferralCode(ref); setShowReferral(true) }
  }, [searchParams])

  const set = (k: string, v: string) => {
    setForm(p => ({ ...p, [k]: v }))
    if (errors[k]) setErrors(p => { const n = { ...p }; delete n[k]; return n })
  }

  const handleSubmit = async () => {
    const e: Record<string, string> = {}
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email invalide'
    if (!form.bizName.trim()) e.bizName = 'Requis'
    if (!form.password || form.password.length < 8) e.password = 'Min. 8 caractères'
    setErrors(e)
    if (Object.keys(e).length > 0) {
      setTimeout(() => document.querySelector('[data-e]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50)
      return
    }

    setSubmitting(true)
    setGlobalError('')
    try {
      const res = await fetch('/api/submit-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim(),
          bizName: form.bizName.trim(),
          password: form.password,
          referralCode: referralCode.trim() || undefined,
          locale: 'fr',
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        if (data?.error?.includes('existe déjà')) {
          setErrors({ email: 'Un compte existe déjà avec cet email.' })
          setSubmitting(false)
          return
        }
        throw new Error('failed')
      }
      fireCompleteRegistration()
      router.push('/business/success')
    } catch {
      setGlobalError('Une erreur est survenue. Réessayez.')
      setSubmitting(false)
    }
  }

  const inputCls = "font-dm w-full rounded-xl text-[14px] text-white/90 placeholder:text-white/25 outline-none"
  const inputStyle = { height: 48, padding: '0 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }

  return (
    <div className="min-h-screen" style={{ background: '#0a0a08', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <StickyMobileCta />

      {/* Nav */}
      <nav className="flex items-center justify-between px-5 sm:px-8" style={{ height: 64 }}>
        <Link href="/" className="font-buster text-[18px] sm:text-[22px] text-white" style={{ textDecoration: 'none' }}>
          2960 AGENCY
        </Link>
        <a href="#form" className="font-dm text-[12px] font-semibold px-4 py-2 rounded-full"
          style={{ background: '#E8471A', color: '#fff', textDecoration: 'none' }}>
          S&apos;inscrire
        </a>
      </nav>

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="px-5 sm:px-8 pt-16 sm:pt-24 pb-12 sm:pb-20" style={{ maxWidth: 820, margin: '0 auto' }}>
        <h1 className="font-dm text-white text-[28px] sm:text-[44px] font-bold leading-[1.15] tracking-tight mb-5 sm:mb-6">
          Vous offrez un repas.<br />Ils publient une vidéo TikTok.
        </h1>
        <p className="font-dm text-[#c8c3b8]/70 text-[15px] sm:text-[17px] leading-[1.7] mb-8 sm:mb-10" style={{ maxWidth: 640 }}>
          Aucuns frais d&apos;agence, aucun abonnement pour commencer. Des créateurs vérifiés réservent un créneau, viennent chez vous, filment et publient. Votre seul coût&nbsp;: le repas le jour de leur visite.
        </p>
        <CtaButton />
        <p className="font-dm text-white/30 text-[13px] mt-4">{CTA_SUB}</p>
      </section>

      {/* ═══════════════ COMMENT ÇA MARCHE ═══════════════ */}
      <section className="px-5 sm:px-8 py-16 sm:py-24" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <p className="font-dm text-[#E8471A] text-[11px] font-bold uppercase tracking-[0.18em] mb-6">Comment ça marche</p>

          <div className="space-y-10 sm:space-y-14">
            {/* Step 1 */}
            <div className="flex gap-4 sm:gap-6">
              <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-dm text-[14px] sm:text-[16px] font-bold"
                style={{ background: 'rgba(232,71,26,0.12)', color: '#E8471A' }}>1</div>
              <div>
                <h3 className="font-dm text-white text-[17px] sm:text-[20px] font-bold mb-2">Vous créez votre offre en 5 minutes</h3>
                <p className="font-dm text-[#c8c3b8]/60 text-[14px] sm:text-[15px] leading-[1.7]">
                  Vous indiquez le nombre de personnes maximum par réservation et vos créneaux disponibles. Le repas, c&apos;est vous qui décidez sur place — comme pour n&apos;importe quel client.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4 sm:gap-6">
              <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-dm text-[14px] sm:text-[16px] font-bold"
                style={{ background: 'rgba(232,71,26,0.12)', color: '#E8471A' }}>2</div>
              <div>
                <h3 className="font-dm text-white text-[17px] sm:text-[20px] font-bold mb-2">Un créateur vérifié réserve</h3>
                <p className="font-dm text-[#c8c3b8]/60 text-[14px] sm:text-[15px] leading-[1.7]">
                  Tous les créateurs sont audités par 2960 avant d&apos;entrer (stats, qualité, sérieux). Activez l&apos;acceptation automatique (recommandée)&nbsp;: les réservations se confirment seules, zéro gestion, et vous ne ratez aucune opportunité. Sinon, validez chaque profil à la main.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4 sm:gap-6">
              <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-dm text-[14px] sm:text-[16px] font-bold"
                style={{ background: 'rgba(232,71,26,0.12)', color: '#E8471A' }}>3</div>
              <div>
                <h3 className="font-dm text-white text-[17px] sm:text-[20px] font-bold mb-2">La vidéo est publiée</h3>
                <p className="font-dm text-[#c8c3b8]/60 text-[14px] sm:text-[15px] leading-[1.7]">
                  Sous 5 jours après sa visite, le créateur publie et dépose le lien directement dans votre tableau de bord.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 sm:mt-14">
            <CtaButton />
          </div>
        </div>
      </section>

      {/* ═══════════════ 3 ARGUMENTS ═══════════════ */}
      <section className="px-5 sm:px-8 py-16 sm:py-24">
        <div style={{ maxWidth: 820, margin: '0 auto' }} className="space-y-12 sm:space-y-16">
          <div>
            <h3 className="font-dm text-white text-[18px] sm:text-[22px] font-bold mb-3 leading-tight">
              Votre restaurant dans la recherche TikTok — sans compte TikTok
            </h3>
            <p className="font-dm text-[#c8c3b8]/60 text-[14px] sm:text-[15px] leading-[1.7]">
              Quand un créateur publie chez vous, la vidéo est indexée&nbsp;: votre cuisine, votre nom, votre adresse. Des personnes qui cherchent où manger peuvent vous découvrir — sans que vous ayez à gérer quoi que ce soit. Ce n&apos;est pas une pub. C&apos;est une présence qui s&apos;installe.
            </p>
          </div>
          <div>
            <h3 className="font-dm text-white text-[18px] sm:text-[22px] font-bold mb-3 leading-tight">
              En moyenne, il faut 7 points de contact avant qu&apos;un consommateur décide de visiter un lieu.
            </h3>
            <p className="font-dm text-[#c8c3b8]/60 text-[14px] sm:text-[15px] leading-[1.7]">
              Des collabs régulières construisent ces points de contact, sur la durée. Chaque vidéo publiée reste en ligne 12 mois minimum contractuellement.
            </p>
          </div>
          <div>
            <h3 className="font-dm text-white text-[18px] sm:text-[22px] font-bold mb-3 leading-tight">
              Des créateurs vérifiés, pas des inconnus
            </h3>
            <p className="font-dm text-[#c8c3b8]/60 text-[14px] sm:text-[15px] leading-[1.7]">
              Avant d&apos;accéder à la plateforme, chaque créateur est audité par 2960. Vous n&apos;accueillez pas n&apos;importe qui. Et si une vidéo ne respecte pas les critères de votre offre, vous pouvez demander sa suppression — la collab n&apos;est pas comptabilisée.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════ PRIMES DE VIRALITÉ ═══════════════ */}
      <section className="px-5 sm:px-8 py-16 sm:py-24" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <p className="font-dm text-[#E8471A] text-[11px] font-bold uppercase tracking-[0.18em] mb-3">Primes de viralité (optionnel)</p>
          <h2 className="font-dm text-white text-[22px] sm:text-[30px] font-bold leading-tight mb-5">
            C&apos;est le levier qui pousse les créateurs à se surpasser — et à choisir votre resto en premier.
          </h2>
          <div className="space-y-4 mb-8">
            <p className="font-dm text-[#c8c3b8]/60 text-[14px] sm:text-[15px] leading-[1.7]">
              Vous décidez de récompenser une vidéo uniquement si elle dépasse un nombre de vues que vous fixez vous-même. Le seuil, le montant&nbsp;: tout est à vous, vous commencez aussi petit que vous voulez. En dessous du seuil, vous ne payez rien.
            </p>
            <p className="font-dm text-[#c8c3b8]/60 text-[14px] sm:text-[15px] leading-[1.7]">
              Autrement dit&nbsp;: vous ne récompensez une vidéo que si elle vous a déjà apporté une vraie visibilité. Jamais un risque — toujours une récompense.
            </p>
          </div>

          {/* Grid */}
          <div className="rounded-2xl p-5 sm:p-6 mb-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="font-dm text-white/40 text-[11px] uppercase tracking-[0.12em] mb-4">Grille utilisée par d&apos;autres restos 2960</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { views: '50\u2013100k', prime: '200\u202F\u20AC' },
                { views: '100\u2013350k', prime: '350\u202F\u20AC' },
                { views: '350\u2013750k', prime: '600\u202F\u20AC' },
                { views: '+750k', prime: '1\u202F000\u202F\u20AC' },
              ].map(t => (
                <div key={t.views} className="rounded-xl p-3 text-center" style={{ background: 'rgba(232,71,26,0.06)', border: '1px solid rgba(232,71,26,0.12)' }}>
                  <p className="font-dm text-white/70 text-[13px] font-semibold">{t.views} vues</p>
                  <p className="font-dm text-[#E8471A] text-[18px] font-bold mt-1">{t.prime}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="font-dm text-[#c8c3b8]/50 text-[13px] leading-[1.7] mb-8">
            Pas sûr&nbsp;? Lancez vos collabs sans prime, vous pourrez en ajouter quand vous voulez.
          </p>
          <CtaButton />
        </div>
      </section>

      {/* ═══════════════ L'OFFRE ═══════════════ */}
      <section className="px-5 sm:px-8 py-16 sm:py-24">
        <div style={{ maxWidth: 820, margin: '0 auto' }} className="text-center">
          <h2 className="font-dm text-white text-[22px] sm:text-[30px] font-bold leading-tight mb-4">
            3 collabs sans abonnement pour commencer.
          </h2>
          <p className="font-dm text-[#c8c3b8]/60 text-[14px] sm:text-[16px] leading-[1.7] mb-8" style={{ maxWidth: 560, margin: '0 auto 32px' }}>
            Aucune CB, aucun engagement. Vous testez, vous voyez comment ça s&apos;intègre à votre quotidien. Puis vous choisissez votre formule — de 29&euro; à 499&euro;/mois HT selon vos besoins.
          </p>
          <CtaButton />
        </div>
      </section>

      {/* ═══════════════ FORMULAIRE ═══════════════ */}
      <section id="form" className="px-5 sm:px-8 py-16 sm:py-24" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <h2 className="font-dm text-white text-[22px] sm:text-[28px] font-bold text-center mb-8">
            Créez votre compte restaurant
          </h2>

          <div className="space-y-4">
            <div data-e={errors.email ? '' : undefined}>
              <label className="font-dm text-white/50 text-[11px] font-semibold uppercase tracking-[0.06em] block mb-1.5">Email <span className="text-[#E8471A]">*</span></label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="contact@exemple.com"
                className={inputCls} style={inputStyle} />
              {errors.email && <p className="font-dm text-[#E8471A]/70 text-[11px] mt-1">{errors.email}</p>}
            </div>

            <div data-e={errors.bizName ? '' : undefined}>
              <label className="font-dm text-white/50 text-[11px] font-semibold uppercase tracking-[0.06em] block mb-1.5">Nom du restaurant <span className="text-[#E8471A]">*</span></label>
              <input value={form.bizName} onChange={e => set('bizName', e.target.value)} placeholder="Le Café des Amis"
                className={inputCls} style={inputStyle} />
              {errors.bizName && <p className="font-dm text-[#E8471A]/70 text-[11px] mt-1">{errors.bizName}</p>}
            </div>

            <div data-e={errors.password ? '' : undefined}>
              <label className="font-dm text-white/50 text-[11px] font-semibold uppercase tracking-[0.06em] block mb-1.5">Mot de passe <span className="text-[#E8471A]">*</span></label>
              <input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min. 8 caractères"
                autoComplete="new-password" className={inputCls} style={inputStyle} />
              {errors.password && <p className="font-dm text-[#E8471A]/70 text-[11px] mt-1">{errors.password}</p>}
            </div>
            {/* Referral code */}
            <div>
              {!showReferral ? (
                <button type="button" onClick={() => setShowReferral(true)}
                  className="font-dm text-white/30 text-[12px] underline cursor-pointer bg-transparent border-none p-0">
                  J&apos;ai un code de parrainage
                </button>
              ) : (
                <div>
                  <label className="font-dm text-white/50 text-[11px] font-semibold uppercase tracking-[0.06em] block mb-1.5">Code de parrainage <span className="text-white/20 normal-case">(optionnel)</span></label>
                  <input value={referralCode} onChange={e => setReferralCode(e.target.value.toUpperCase())} placeholder="Ex : ABC123"
                    className={inputCls} style={inputStyle} />
                  <p className="font-dm text-white/20 text-[10px] mt-1">Votre inscription sera associée au créateur référent.</p>
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="font-dm w-full text-[14px] font-bold rounded-full cursor-pointer transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            style={{ background: '#E8471A', color: '#fff', height: 52, border: 'none' }}>
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Création en cours...
              </span>
            ) : (
              <>{CTA_LABEL} &rarr;</>
            )}
          </button>

          {globalError && (
            <p className="font-dm text-[#E8471A]/70 text-[13px] text-center mt-3">{globalError}</p>
          )}

          {/* Legal */}
          <p className="font-dm text-white/30 text-[11px] leading-relaxed mt-4 text-center">
            En créant votre compte, vous acceptez les{' '}
            <a href="/legal/cguv-restaurants" target="_blank" rel="noopener" style={{ color: '#E8471A', textDecoration: 'underline' }}>
              CGU et CGV
            </a>{' '}
            de 2960 Agency.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-5 sm:px-8 py-8 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <Link href="/" className="font-buster text-[14px] text-white/20 hover:text-white/40 transition-colors" style={{ textDecoration: 'none' }}>
          2960 AGENCY
        </Link>
      </footer>
    </div>
  )
}
