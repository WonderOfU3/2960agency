'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import LanguageToggle from '@/components/LanguageToggle'
import ThemeToggle from '@/components/ThemeToggle'
import { useTheme } from '@/context/ThemeContext'

const T = {
  fr: {
    title: 'Mot de passe oublié',
    subtitle: 'Entre ton email pour recevoir un lien de réinitialisation',
    email: 'Email',
    submit: 'Envoyer le lien',
    sending: 'Envoi en cours...',
    success: 'Si un compte existe avec cet email, tu recevras un lien de réinitialisation.',
    back: 'Retour à la connexion',
    backSite: 'Retour au site',
    serverErr: 'Erreur serveur',
  },
  en: {
    title: 'Forgot password',
    subtitle: 'Enter your email to receive a reset link',
    email: 'Email',
    submit: 'Send reset link',
    sending: 'Sending...',
    success: 'If an account exists with this email, you will receive a reset link.',
    back: 'Back to login',
    backSite: 'Back to site',
    serverErr: 'Server error',
  },
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#000' }} />}>
      <ForgotPasswordContent />
    </Suspense>
  )
}

function ForgotPasswordContent() {
  const { locale } = useLanguage()
  const { c } = useTheme()
  const t = T[locale]
  const searchParams = useSearchParams()
  const type = searchParams.get('type') === 'restaurant' ? 'restaurant' : 'creator'
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || t.serverErr)
        setLoading(false)
        return
      }
      setSent(true)
    } catch {
      setError(t.serverErr)
    }
    setLoading(false)
  }

  const loginHref = type === 'restaurant' ? '/restaurant/login' : '/creator/login'

  return (
    <section className="min-h-screen relative flex items-center justify-center" style={{ background: c.pageBg }}>
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 50% 35% at 50% 35%, rgba(217,79,42,0.05) 0%, transparent 70%)',
      }} />
      <div className="grain-overlay absolute inset-0 pointer-events-none" />

      <div className="relative w-full" style={{ maxWidth: 420, padding: '40px 20px' }}>
        <div className="flex justify-end gap-2 mb-4">
          <ThemeToggle />
          <LanguageToggle />
        </div>

        <div className="text-center mb-8">
          <Link href="/" className="font-buster text-white/80 text-[11px] tracking-[0.18em] uppercase hover:text-white/60 transition-colors" style={{ textDecoration: 'none' }}>
            2960 Agency
          </Link>
          <h1 className="font-dm font-bold mt-4" style={{ fontSize: 24, color: c.text }}>{t.title}</h1>
          <p className="font-dm text-[13px] mt-2" style={{ color: c.textMuted }}>{t.subtitle}</p>
        </div>

        {sent ? (
          <div className="rounded-2xl p-6 text-center" style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}` }}>
            <div className="text-[32px] mb-3">&#9993;</div>
            <p className="font-dm text-[14px] mb-6" style={{ color: c.text }}>{t.success}</p>
            <Link href={loginHref} className="font-dm text-[#E8471A] text-[13px] hover:brightness-125 transition-all" style={{ textDecoration: 'none' }}>
              &larr; {t.back}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-2xl" style={{
            background: c.cardBg,
            border: `1px solid ${c.cardBorder}`,
            padding: 28,
          }}>
            <div className="mb-6">
              <label className="font-dm text-[12px] font-semibold uppercase tracking-[0.06em] block mb-2" style={{ color: c.textMuted }}>
                {t.email}
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ton@email.com"
                required
                className="font-dm w-full rounded-xl text-[14px] outline-none transition-all"
                style={{
                  height: 48, padding: '0 16px',
                  background: c.inputBg, border: `1px solid ${c.inputBorder}`,
                  color: c.text,
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(232,71,26,0.4)'}
                onBlur={e => e.target.style.borderColor = c.inputBorder}
              />
            </div>

            {error && (
              <div className="font-dm text-[13px] text-red-400 mb-4 p-3 rounded-lg" style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.15)',
              }}>{error}</div>
            )}

            <button type="submit" disabled={loading}
              className="font-dm w-full rounded-full text-[13px] font-semibold uppercase tracking-[0.08em] transition-all cursor-pointer disabled:opacity-50"
              style={{ height: 48, background: '#E8471A', color: '#fff', border: 'none' }}>
              {loading ? t.sending : t.submit}
            </button>
          </form>
        )}

        <div className="text-center mt-6 space-y-3">
          <Link href={loginHref} className="font-dm text-[12px] hover:text-white/40 transition-colors block" style={{ color: c.textMuted, textDecoration: 'none' }}>
            &larr; {t.back}
          </Link>
        </div>
      </div>
    </section>
  )
}
