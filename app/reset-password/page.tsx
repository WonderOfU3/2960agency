'use client'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import LanguageToggle from '@/components/LanguageToggle'
import ThemeToggle from '@/components/ThemeToggle'
import { useTheme } from '@/context/ThemeContext'

const T = {
  fr: {
    title: 'Nouveau mot de passe',
    subtitle: 'Choisis un nouveau mot de passe',
    password: 'Nouveau mot de passe',
    confirm: 'Confirmer le mot de passe',
    submit: 'Réinitialiser',
    resetting: 'Réinitialisation...',
    success: 'Mot de passe réinitialisé ! Tu peux maintenant te connecter.',
    login: 'Se connecter',
    mismatch: 'Les mots de passe ne correspondent pas',
    tooShort: 'Minimum 8 caractères',
    serverErr: 'Erreur serveur',
    invalidLink: 'Lien invalide ou expiré. Fais une nouvelle demande.',
    backSite: 'Retour au site',
  },
  en: {
    title: 'New password',
    subtitle: 'Choose a new password',
    password: 'New password',
    confirm: 'Confirm password',
    submit: 'Reset password',
    resetting: 'Resetting...',
    success: 'Password reset! You can now log in.',
    login: 'Log in',
    mismatch: 'Passwords do not match',
    tooShort: 'Minimum 8 characters',
    serverErr: 'Server error',
    invalidLink: 'Invalid or expired link. Please request a new one.',
    backSite: 'Back to site',
  },
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#000' }} />}>
      <ResetPasswordContent />
    </Suspense>
  )
}

function ResetPasswordContent() {
  const { locale } = useLanguage()
  const { c } = useTheme()
  const t = T[locale]
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token') || ''
  const type = searchParams.get('type') === 'restaurant' ? 'restaurant' : 'creator'
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const loginHref = type === 'restaurant' ? '/restaurant/login' : '/creator/login'

  if (!token) {
    return (
      <section className="min-h-screen flex items-center justify-center" style={{ background: c.pageBg }}>
        <div className="text-center p-8">
          <p className="font-dm text-[14px] mb-4" style={{ color: c.text }}>{t.invalidLink}</p>
          <Link href="/" className="font-dm text-[#E8471A] text-[13px]" style={{ textDecoration: 'none' }}>&larr; {t.backSite}</Link>
        </div>
      </section>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) { setError(t.tooShort); return }
    if (password !== confirm) { setError(t.mismatch); return }

    setLoading(true)
    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, type, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || t.serverErr)
        setLoading(false)
        return
      }
      setDone(true)
    } catch {
      setError(t.serverErr)
    }
    setLoading(false)
  }

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

        {done ? (
          <div className="rounded-2xl p-6 text-center" style={{ background: c.cardBg, border: `1px solid ${c.cardBorder}` }}>
            <div className="text-[32px] mb-3">&#10003;</div>
            <p className="font-dm text-[14px] mb-6" style={{ color: c.text }}>{t.success}</p>
            <button onClick={() => router.push(loginHref)}
              className="font-dm text-[13px] font-semibold px-8 py-3 rounded-full cursor-pointer transition-all"
              style={{ background: '#E8471A', color: '#fff', border: 'none' }}>
              {t.login}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-2xl" style={{
            background: c.cardBg, border: `1px solid ${c.cardBorder}`, padding: 28,
          }}>
            <div className="mb-5">
              <label className="font-dm text-[12px] font-semibold uppercase tracking-[0.06em] block mb-2" style={{ color: c.textMuted }}>
                {t.password}
              </label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required minLength={8}
                className="font-dm w-full rounded-xl text-[14px] outline-none transition-all"
                style={{ height: 48, padding: '0 16px', background: c.inputBg, border: `1px solid ${c.inputBorder}`, color: c.text }}
                onFocus={e => e.target.style.borderColor = 'rgba(232,71,26,0.4)'}
                onBlur={e => e.target.style.borderColor = c.inputBorder}
              />
            </div>
            <div className="mb-6">
              <label className="font-dm text-[12px] font-semibold uppercase tracking-[0.06em] block mb-2" style={{ color: c.textMuted }}>
                {t.confirm}
              </label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••" required minLength={8}
                className="font-dm w-full rounded-xl text-[14px] outline-none transition-all"
                style={{ height: 48, padding: '0 16px', background: c.inputBg, border: `1px solid ${c.inputBorder}`, color: c.text }}
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
              {loading ? t.resetting : t.submit}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
