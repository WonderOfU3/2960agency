'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import LanguageToggle from '@/components/LanguageToggle'
import ThemeToggle from '@/components/ThemeToggle'
import { useTheme } from '@/context/ThemeContext'

export default function AdminLoginPage() {
  const router = useRouter()
  const { c } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erreur de connexion')
        setLoading(false)
        return
      }

      router.push('/admin/dashboard')
    } catch {
      setError('Erreur de connexion au serveur')
      setLoading(false)
    }
  }

  return (
    <section className="min-h-screen relative flex items-center justify-center" style={{ background: c.pageBg }}>
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `
          radial-gradient(ellipse 50% 35% at 50% 35%, rgba(217,79,42,0.05) 0%, transparent 70%),
          radial-gradient(ellipse 40% 25% at 50% 30%, rgba(252,250,166,0.012) 0%, transparent 60%)
        `,
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
          <h1 className="font-dm text-white font-bold mt-4" style={{ fontSize: 24 }}>
            Administration
          </h1>
          <p className="font-dm text-white/40 text-[13px] mt-2">
            Espace réservé à l'équipe 2960 Agency
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{
          background: c.cardBg,
          border: `1px solid ${c.cardBorder}`,
          borderRadius: 20,
          padding: 28,
        }}>
          <div className="mb-5">
            <label className="font-dm text-white/60 text-[12px] font-semibold uppercase tracking-[0.06em] block mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder=""
              required
              className="font-dm w-full rounded-xl text-[14px] text-white/90 placeholder:text-white/20 outline-none transition-all"
              style={{
                height: 48,
                padding: '0 16px',
                background: c.inputBg,
                border: `1px solid ${c.cardBorder}`,
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(232,71,26,0.4)'}
              onBlur={e => e.target.style.borderColor = c.cardBorder}
            />
          </div>

          <div className="mb-6">
            <label className="font-dm text-white/60 text-[12px] font-semibold uppercase tracking-[0.06em] block mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="font-dm w-full rounded-xl text-[14px] text-white/90 placeholder:text-white/20 outline-none transition-all"
              style={{
                height: 48,
                padding: '0 16px',
                background: c.inputBg,
                border: `1px solid ${c.cardBorder}`,
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(232,71,26,0.4)'}
              onBlur={e => e.target.style.borderColor = c.cardBorder}
            />
          </div>

          {error && (
            <div className="font-dm text-[13px] text-red-400 mb-4 p-3 rounded-lg" style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.15)',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="font-dm w-full rounded-full text-[13px] font-semibold uppercase tracking-[0.08em] transition-all duration-200 cursor-pointer disabled:opacity-50"
            style={{
              height: 48,
              background: '#E8471A',
              color: '#fff',
              border: 'none',
            }}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                Connexion...
              </span>
            ) : 'Se connecter'}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link href="/" className="font-dm text-white/20 text-[12px] hover:text-white/40 transition-colors">
            &larr; Retour au site
          </Link>
        </div>
      </div>
    </section>
  )
}
