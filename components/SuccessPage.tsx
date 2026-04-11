'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import type { Locale } from '@/context/LanguageContext'

interface Props { variant: 'creator' | 'business' }

const CONTENT: Record<'creator' | 'business', Record<Locale, {
  title: string; text: string; extra: string
  referralTitle: string; referralText: string
  referralBtn: string; referralCopied: string; backBtn: string
}>> = {
  creator: {
    fr: {
      title: 'Tu es inscrit !',
      text: 'Nous avons bien reçu ta candidature. Nous examinons chaque profil et le matchons avec les restaurants et coffee shops les plus pertinents.',
      extra: 'On revient vers toi avant le lancement avec tes premières opportunités de collab.',
      referralTitle: 'Fais profiter tes amis',
      referralText: "Envoie le lien à tes amis créateurs pour qu'ils accèdent aussi aux meilleures collabs.",
      referralBtn: "Copier le lien d'inscription",
      referralCopied: 'Lien copié !', backBtn: "Retour à l'accueil",
    },
    en: {
      title: "You're in!",
      text: "We've received your application. We review every profile and match it with the most relevant restaurants and coffee shops.",
      extra: "We'll get back to you before launch with your first collab opportunities.",
      referralTitle: 'Share with friends',
      referralText: "Send the link to your creator friends so they can access the best collabs too.",
      referralBtn: 'Copy signup link',
      referralCopied: 'Link copied!', backBtn: 'Back to home',
    },
  },
  business: {
    fr: {
      title: 'Demande reçue !',
      text: "Nous avons bien reçu votre profil. Nous onboardons les établissements par petites vagues pour garantir des matchs de qualité avec nos créateurs.",
      extra: 'On revient vers vous rapidement. En attendant, pour toute question : contact@2960agency.com',
      referralTitle: 'Parlez-en autour de vous',
      referralText: "Partagez le lien avec d'autres établissements qui veulent gagner en visibilité grâce aux créateurs.",
      referralBtn: "Copier le lien d'inscription",
      referralCopied: 'Lien copié !', backBtn: "Retour à l'accueil",
    },
    en: {
      title: 'Request received!',
      text: "We've received your profile. We onboard venues in small waves to ensure quality matches with our creator base.",
      extra: "We'll get back to you soon. In the meantime, for any questions: contact@2960agency.com",
      referralTitle: 'Spread the word',
      referralText: "Share the link with other venues that want to boost their visibility through creators.",
      referralBtn: 'Copy signup link',
      referralCopied: 'Link copied!', backBtn: 'Back to home',
    },
  },
}

export default function SuccessPage({ variant }: Props) {
  const { locale } = useLanguage()
  const c = CONTENT[variant][locale]
  const [copied, setCopied] = useState(false)

  useEffect(() => { window.scrollTo(0, 0) }, [])

  const handleCopy = async () => {
    const url = `${window.location.origin}/${variant}`
    try {
      if (navigator.share) {
        await navigator.share({ title: '2960 Agency', url })
      } else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      }
    } catch { /* cancelled */ }
  }

  return (
    <section className="min-h-screen relative flex items-center justify-center" style={{ background: '#0c0b09' }}>
      {/* Warm glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `
          radial-gradient(ellipse 50% 35% at 50% 35%, rgba(217,79,42,0.05) 0%, transparent 70%),
          radial-gradient(ellipse 40% 25% at 50% 30%, rgba(252,250,166,0.012) 0%, transparent 60%)
        `,
      }} />
      <div className="grain-overlay absolute inset-0 pointer-events-none" />

      <div className="relative text-center" style={{ maxWidth: 520, padding: '60px 20px' }}>
        {/* Check icon */}
        <div className="flex items-center justify-center" style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'rgba(217,79,42,0.08)', border: '1px solid rgba(217,79,42,0.18)',
          marginBottom: 28, marginLeft: 'auto', marginRight: 'auto',
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#D94F2A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="font-dm text-white font-bold tracking-tight" style={{ fontSize: 26, marginBottom: 16 }}>
          {c.title}
        </h1>
        <p className="font-dm text-white/50 leading-relaxed" style={{ fontSize: 15, marginBottom: 12 }}>
          {c.text}
        </p>
        <p className="font-dm text-white/35 leading-relaxed" style={{ fontSize: 14, marginBottom: 40 }}>
          {c.extra}
        </p>

        {/* Referral card */}
        <div style={{
          background: 'rgba(252,250,166,0.025)', border: '1px solid rgba(252,250,166,0.07)',
          borderRadius: 20, padding: '24px 20px', marginBottom: 32,
        }}>
          <p className="font-dm text-white/80 font-semibold" style={{ fontSize: 15, marginBottom: 8 }}>{c.referralTitle}</p>
          <p className="font-dm text-white/40 leading-relaxed" style={{ fontSize: 13, marginBottom: 18 }}>{c.referralText}</p>
          <button onClick={handleCopy}
            className="font-dm w-full rounded-full text-[13px] font-semibold uppercase tracking-[0.08em] transition-all duration-200 cursor-pointer"
            style={{
              height: 48,
              background: copied ? 'rgba(74,222,128,0.1)' : '#D94F2A',
              color: copied ? 'rgba(74,222,128,0.8)' : '#fff',
              border: copied ? '1px solid rgba(74,222,128,0.15)' : 'none',
            }}>
            {copied ? (
              <span className="inline-flex items-center justify-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                {c.referralCopied}
              </span>
            ) : c.referralBtn}
          </button>
        </div>

        <Link href="/" className="font-dm text-white/20 text-[12px] hover:text-white/40 transition-colors">
          ← {c.backBtn}
        </Link>
      </div>
    </section>
  )
}
