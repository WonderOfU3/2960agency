'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import LanguageToggle from '@/components/LanguageToggle'
import ThemeToggle from '@/components/ThemeToggle'
import { useTheme } from '@/context/ThemeContext'

const T = {
  fr: {
    title: 'Espace Restaurant', subtitle: 'Connectez-vous pour gérer vos collabs et abonnement',
    email: 'Email', password: 'Mot de passe', submit: 'Se connecter', loading: 'Connexion...',
    pending: 'Compte en attente', noAccount: 'Pas encore inscrit ?', signup: "S'inscrire",
    back: 'Retour au site', serverErr: 'Erreur de connexion au serveur',
  },
  en: {
    title: 'Restaurant Space', subtitle: 'Log in to manage your collabs and subscription',
    email: 'Email', password: 'Password', submit: 'Log in', loading: 'Logging in...',
    pending: 'Account pending', noAccount: "Don't have an account?", signup: 'Sign up',
    back: 'Back to site', serverErr: 'Server connection error',
  },
}

export default function RestaurantLoginPage() {
  const { locale } = useLanguage()
  const { c } = useTheme()
  const t = T[locale]
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pendingMessage, setPendingMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setPendingMessage('')
    setLoading(true)

    try {
      const res = await fetch('/api/restaurant/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (res.status === 403 && data.status === 'pending_validation') {
        setPendingMessage(data.error)
        setLoading(false)
        return
      }
      if (!res.ok) {
        setError(data.error)
        setLoading(false)
        return
      }
      router.push('/restaurant/dashboard')
    } catch {
      setError(t.serverErr)
      setLoading(false)
    }
  }

  return (
    <section className="min-h-screen relative flex items-center justify-center" style={{ background: c.pageBg }}>
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 50% 35% at 50% 35%, rgba(217,79,42,0.05) 0%, transparent 70%)',
      }} />
      <div className="grain-overlay absolute inset-0 pointer-events-none" />

      <div className="relative w-full" style={{ maxWidth: 420, padding: '40px 20px' }}>
        <div className="flex justify-end gap-2 mb-4"><ThemeToggle /><LanguageToggle /></div>

        <div className="text-center mb-8">
          <Link href="/" className="font-buster text-white/80 text-[11px] tracking-[0.18em] uppercase hover:text-white/60 transition-colors" style={{ textDecoration: 'none' }}>
            2960 Agency
          </Link>
          <h1 className="font-dm text-white font-bold mt-4" style={{ fontSize: 24 }}>{t.title}</h1>
          <p className="font-dm text-white/40 text-[13px] mt-2">{t.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} style={{
          background: c.cardBg, border: `1px solid ${c.cardBorder}`, borderRadius: 20, padding: 28,
        }}>
          <div className="mb-5">
            <label className="font-dm text-white/60 text-[12px] font-semibold uppercase tracking-[0.06em] block mb-2">{t.email}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="contact@restaurant.com" required
              className="font-dm w-full rounded-xl text-[14px] text-white/90 placeholder:text-white/20 outline-none"
              style={{ height: 48, padding: '0 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
          </div>
          <div className="mb-6">
            <label className="font-dm text-white/60 text-[12px] font-semibold uppercase tracking-[0.06em] block mb-2">{t.password}</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
              className="font-dm w-full rounded-xl text-[14px] text-white/90 placeholder:text-white/20 outline-none"
              style={{ height: 48, padding: '0 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
          </div>

          <div className="flex justify-end mb-4">
            <Link href="/forgot-password?type=restaurant" className="font-dm text-[12px] hover:brightness-125 transition-all" style={{ color: '#E8471A', textDecoration: 'none' }}>
              {locale === 'fr' ? 'Mot de passe oublié ?' : 'Forgot password?'}
            </Link>
          </div>

          {pendingMessage && (
            <div className="font-dm text-[13px] mb-4 p-4 rounded-lg" style={{ background: 'rgba(217,79,42,0.08)', border: '1px solid rgba(217,79,42,0.2)', color: '#D94F2A' }}>
              <p className="font-semibold mb-1">&#9203; {t.pending}</p>
              <p className="text-[12px] opacity-80">{pendingMessage}</p>
            </div>
          )}
          {error && (
            <div className="font-dm text-[13px] text-red-400 mb-4 p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.15)' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="font-dm w-full rounded-full text-[13px] font-semibold uppercase tracking-[0.08em] transition-all duration-200 cursor-pointer disabled:opacity-50"
            style={{ height: 48, background: '#E8471A', color: '#fff', border: 'none' }}>
            {loading ? <span className="inline-flex items-center gap-2"><span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />{t.loading}</span> : t.submit}
          </button>
        </form>

        <div className="text-center mt-6 space-y-3">
          <p className="font-dm text-white/30 text-[12px]">
            {t.noAccount}{' '}
            <Link href="/business" className="text-[#E8471A] hover:brightness-125 transition-all" style={{ textDecoration: 'none' }}>{t.signup}</Link>
          </p>
          <Link href="/" className="font-dm text-white/20 text-[12px] hover:text-white/40 transition-colors block">&larr; {t.back}</Link>
        </div>
      </div>
    </section>
  )
}
