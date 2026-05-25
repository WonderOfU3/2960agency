'use client'

import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useLanguage } from '@/context/LanguageContext'
import { useTheme } from '@/context/ThemeContext'

type Locale = 'fr' | 'en'

type Translations = {
    title: string; subtitle: string; name: string; email: string
    subject: string; message: string; phName: string; phEmail: string
    phMessage: string; send: string; sending: string; successTitle: string
    successText: string; backHome: string; errorMsg: string
    subjects: string[]; selectSubject: string
}

const T: Record<Locale, Translations> = {
    fr: {
        title: 'Une question ?',
        subtitle: 'On vous répond sous 24h.',
        name: 'Votre nom',
        email: 'Adresse e-mail',
        subject: 'Sujet',
        message: 'Votre message',
        phName: 'Marie Dupont',
        phEmail: 'marie@exemple.com',
        phMessage: 'Décrivez votre question ou demande…',
        send: 'Envoyer',
        sending: 'Envoi…',
        successTitle: 'Message envoyé.',
        successText: 'On vous revient très vite.',
        backHome: "Retour à l'accueil",
        errorMsg: 'Une erreur est survenue. Réessayez ou écrivez-nous directement à contact@2960agency.com.',
        subjects: [
            'Question générale',
            'Je suis créateur',
            'Je suis un restaurant / café',
            'Partenariat',
            'Problème technique',
            'Autre',
        ],
        selectSubject: 'Choisir un sujet…',
    },
    en: {
        title: 'Got a question?',
        subtitle: "We'll get back to you within 24h.",
        name: 'Your name',
        email: 'Email address',
        subject: 'Subject',
        message: 'Your message',
        phName: 'Jane Smith',
        phEmail: 'jane@example.com',
        phMessage: 'Describe your question or request…',
        send: 'Send',
        sending: 'Sending…',
        successTitle: 'Message sent.',
        successText: "We'll get back to you very soon.",
        backHome: 'Back to home',
        errorMsg: 'Something went wrong. Try again or email us directly at contact@2960agency.com.',
        subjects: [
            'General question',
            "I'm a creator",
            "I'm a restaurant / café",
            'Partnership',
            'Technical issue',
            'Other',
        ],
        selectSubject: 'Choose a subject…',
    },
}

function getInputCSS(isLight: boolean) {
  return `
  width: 100%;
  background: ${isLight ? '#e6e6ea' : 'rgba(255,255,255,0.04)'};
  border: 1px solid ${isLight ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.08)'};
  border-radius: 14px;
  color: ${isLight ? '#111' : '#fff'};
  font-family: 'DM Sans', sans-serif;
  font-size: 14.5px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
`
}

export default function ContactPage() {
    const { locale } = useLanguage()
    const { c } = useTheme()
    const t = T[locale]

    const [form, setForm]   = useState({ name: '', email: '', subject: '', message: '' })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)
    const [sent, setSent]   = useState(false)
    const [serverError, setServerError] = useState('')
    const [focused, setFocused] = useState<string | null>(null)

    const set = (k: string, v: string) => {
        setForm(p => ({ ...p, [k]: v }))
        if (errors[k]) setErrors(p => { const n = { ...p }; delete n[k]; return n })
    }

    const validate = () => {
        const e: Record<string, string> = {}
        if (!form.name.trim())    e.name    = locale === 'fr' ? 'Requis' : 'Required'
        if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = locale === 'fr' ? 'Email invalide' : 'Invalid email'
        if (!form.subject)        e.subject = locale === 'fr' ? 'Requis' : 'Required'
        if (form.message.trim().length < 10) e.message = locale === 'fr' ? 'Message trop court' : 'Message too short'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return
        setLoading(true)
        setServerError('')
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            if (!res.ok) throw new Error()
            setSent(true)
        } catch {
            setServerError(t.errorMsg)
        } finally {
            setLoading(false)
        }
    }

    const borderColor = (field: string) =>
        errors[field]
            ? 'rgba(217,79,42,0.45)'
            : focused === field
                ? 'rgba(217,79,42,0.4)'
                : (c.isLight ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.08)')

    const INPUT = getInputCSS(c.isLight)
    const labelColor = c.isLight ? '#333333' : 'rgba(200,195,185,0.7)'

    const shadow = (field: string) =>
        focused === field && !errors[field]
            ? '0 0 0 3px rgba(217,79,42,0.07)'
            : 'none'

    return (
        <div style={{ background: c.pageBg, minHeight: '100vh' }}>
            <Navbar />

            {/* Glow */}
            <div className="fixed inset-0 pointer-events-none" style={{
                background: 'radial-gradient(ellipse 50% 30% at 50% -5%, rgba(217,79,42,0.06) 0%, transparent 65%)',
            }} />

            <div className="relative" style={{
                minHeight: '100vh',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '120px 20px 80px',
            }}>
                <div style={{ width: '100%', maxWidth: 560 }}>

                    {sent ? (
                        /* ── Success state ── */
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <div style={{
                                width: 64, height: 64, borderRadius: '50%',
                                background: 'rgba(217,79,42,0.08)',
                                border: '1px solid rgba(217,79,42,0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 28px',
                            }}>
                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#D94F2A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                            <h1 className="font-dm text-white" style={{ fontSize: 26, fontWeight: 700, marginBottom: 12 }}>
                                {t.successTitle}
                            </h1>
                            <p className="font-dm" style={{ fontSize: 15, color: c.isLight ? '#444444' : 'rgba(255,255,255,0.45)', marginBottom: 40 }}>
                                {t.successText}
                            </p>
                            <Link href="/" className="font-dm" style={{
                                fontSize: 13, color: c.isLight ? '#707070' : 'rgba(255,255,255,0.25)',
                                textDecoration: 'none', letterSpacing: '0.02em',
                            }}>
                                ← {t.backHome}
                            </Link>
                        </div>
                    ) : (
                        /* ── Form ── */
                        <>
                            {/* Header */}
                            <div style={{ marginBottom: 40 }}>
                                <h1 className="font-dm text-white" style={{
                                    fontSize: 'clamp(2rem, 5vw, 2.8rem)',
                                    fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1,
                                    marginBottom: 10,
                                }}>
                                    {t.title}
                                </h1>
                                <p className="font-dm" style={{ fontSize: 16, color: c.isLight ? '#4a4a4a' : 'rgba(255,255,255,0.4)' }}>
                                    {t.subtitle}
                                </p>
                                <div style={{
                                    marginTop: 16,
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                }}>
                                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                        <rect x="1" y="3" width="14" height="10" rx="2" stroke="rgba(217,79,42,0.6)" strokeWidth="1.3"/>
                                        <path d="M1 5l7 5 7-5" stroke="rgba(217,79,42,0.6)" strokeWidth="1.3" strokeLinecap="round"/>
                                    </svg>
                                    <span className="font-dm" style={{ fontSize: 13, color: 'rgba(217,79,42,0.7)' }}>
                    contact@2960agency.com
                  </span>
                                </div>
                            </div>

                            {/* Card */}
                            <div style={{
                                background: c.cardBg,
                                border: `1px solid ${c.inputBorder}`,
                                borderRadius: 24,
                                padding: 'clamp(20px, 5vw, 32px) clamp(16px, 4vw, 28px)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.3), 0 16px 48px rgba(0,0,0,0.15)',
                            }}>
                                <form onSubmit={handleSubmit}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                                        {/* Name + Email */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 14 }}>
                                            <div>
                                                <label className="font-dm" style={{
                                                    display: 'block', fontSize: 13, fontWeight: 500,
                                                    color: labelColor, marginBottom: 8,
                                                }}>
                                                    {t.name}
                                                    <span style={{ color: '#D94F2A', marginLeft: 2 }}>*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={form.name}
                                                    onChange={e => set('name', e.target.value)}
                                                    placeholder={t.phName}
                                                    onFocus={() => setFocused('name')}
                                                    onBlur={() => setFocused(null)}
                                                    style={{
                                                        ...Object.fromEntries(INPUT.split(';').filter(Boolean).map(r => {
                                                            const [k, ...v] = r.trim().split(':')
                                                            return [k.trim().replace(/-([a-z])/g, (_: string, c: string) => c.toUpperCase()), v.join(':').trim()]
                                                        })),
                                                        borderColor: borderColor('name'),
                                                        boxShadow: shadow('name'),
                                                        height: 52, padding: '0 14px',
                                                    }}
                                                />
                                                {errors.name && <p className="font-dm" style={{ fontSize: 12, color: 'rgba(217,79,42,0.7)', marginTop: 6 }}>{errors.name}</p>}
                                            </div>

                                            <div>
                                                <label className="font-dm" style={{
                                                    display: 'block', fontSize: 13, fontWeight: 500,
                                                    color: labelColor, marginBottom: 8,
                                                }}>
                                                    {t.email}
                                                    <span style={{ color: '#D94F2A', marginLeft: 2 }}>*</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    value={form.email}
                                                    onChange={e => set('email', e.target.value)}
                                                    placeholder={t.phEmail}
                                                    onFocus={() => setFocused('email')}
                                                    onBlur={() => setFocused(null)}
                                                    style={{
                                                        ...Object.fromEntries(INPUT.split(';').filter(Boolean).map(r => {
                                                            const [k, ...v] = r.trim().split(':')
                                                            return [k.trim().replace(/-([a-z])/g, (_: string, c: string) => c.toUpperCase()), v.join(':').trim()]
                                                        })),
                                                        borderColor: borderColor('email'),
                                                        boxShadow: shadow('email'),
                                                        height: 52, padding: '0 14px',
                                                    }}
                                                />
                                                {errors.email && <p className="font-dm" style={{ fontSize: 12, color: 'rgba(217,79,42,0.7)', marginTop: 6 }}>{errors.email}</p>}
                                            </div>
                                        </div>

                                        {/* Subject */}
                                        <div>
                                            <label className="font-dm" style={{
                                                display: 'block', fontSize: 13, fontWeight: 500,
                                                color: labelColor, marginBottom: 8,
                                            }}>
                                                {t.subject}
                                                <span style={{ color: '#D94F2A', marginLeft: 2 }}>*</span>
                                            </label>
                                            <div style={{ position: 'relative' }}>
                                                <select
                                                    value={form.subject}
                                                    onChange={e => set('subject', e.target.value)}
                                                    onFocus={() => setFocused('subject')}
                                                    onBlur={() => setFocused(null)}
                                                    style={{
                                                        width: '100%',
                                                        background: c.isLight ? '#e6e6ea' : 'rgba(255,255,255,0.04)',
                                                        border: `1px solid ${borderColor('subject')}`,
                                                        boxShadow: shadow('subject'),
                                                        borderRadius: 14,
                                                        color: form.subject ? (c.isLight ? '#111' : '#fff') : (c.isLight ? '#999' : 'rgba(255,255,255,0.25)'),
                                                        fontFamily: "'DM Sans', sans-serif",
                                                        fontSize: 14.5,
                                                        height: 52,
                                                        padding: '0 40px 0 14px',
                                                        outline: 'none',
                                                        appearance: 'none',
                                                        cursor: 'pointer',
                                                        transition: 'border-color 0.2s',
                                                    }}
                                                >
                                                    <option value="" disabled style={{ background: c.cardBg }}>{t.selectSubject}</option>
                                                    {t.subjects.map((s: string, i: number) => (
                                                        <option key={i} value={s} style={{ background: c.cardBg }}>{s}</option>
                                                    ))}
                                                </select>
                                                <svg style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                                                     width="14" height="14" viewBox="0 0 14 14" fill="none">
                                                    <path d="M3 5L7 9L11 5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                            {errors.subject && <p className="font-dm" style={{ fontSize: 12, color: 'rgba(217,79,42,0.7)', marginTop: 6 }}>{errors.subject}</p>}
                                        </div>

                                        {/* Message */}
                                        <div>
                                            <label className="font-dm" style={{
                                                display: 'block', fontSize: 13, fontWeight: 500,
                                                color: labelColor, marginBottom: 8,
                                            }}>
                                                {t.message}
                                                <span style={{ color: '#D94F2A', marginLeft: 2 }}>*</span>
                                            </label>
                                            <textarea
                                                value={form.message}
                                                onChange={e => set('message', e.target.value)}
                                                placeholder={t.phMessage}
                                                rows={5}
                                                onFocus={() => setFocused('message')}
                                                onBlur={() => setFocused(null)}
                                                style={{
                                                    width: '100%',
                                                    background: c.isLight ? '#e6e6ea' : 'rgba(255,255,255,0.04)',
                                                    border: `1px solid ${borderColor('message')}`,
                                                    boxShadow: shadow('message'),
                                                    borderRadius: 14,
                                                    color: c.isLight ? '#111' : '#fff',
                                                    fontFamily: "'DM Sans', sans-serif",
                                                    fontSize: 14.5,
                                                    padding: 16,
                                                    outline: 'none',
                                                    resize: 'none',
                                                    transition: 'border-color 0.2s',
                                                    boxSizing: 'border-box',
                                                    lineHeight: 1.6,
                                                }}
                                            />
                                            {errors.message && <p className="font-dm" style={{ fontSize: 12, color: 'rgba(217,79,42,0.7)', marginTop: 6 }}>{errors.message}</p>}
                                        </div>

                                        {/* Server error */}
                                        {serverError && (
                                            <div style={{
                                                background: 'rgba(217,79,42,0.05)',
                                                border: '1px solid rgba(217,79,42,0.15)',
                                                borderRadius: 10, padding: '12px 16px',
                                            }}>
                                                <p className="font-dm" style={{ fontSize: 13, color: 'rgba(217,79,42,0.75)', lineHeight: 1.5 }}>
                                                    {serverError}
                                                </p>
                                            </div>
                                        )}

                                        {/* Submit */}
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="font-dm"
                                            style={{
                                                height: 52,
                                                background: loading ? 'rgba(217,79,42,0.6)' : '#D94F2A',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: 999,
                                                fontSize: 13, fontWeight: 600,
                                                letterSpacing: '0.08em', textTransform: 'uppercase',
                                                cursor: loading ? 'not-allowed' : 'pointer',
                                                transition: 'background 0.2s, transform 0.15s',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                            }}
                                        >
                                            {loading ? (
                                                <>
                          <span style={{
                              width: 14, height: 14,
                              border: '2px solid rgba(255,255,255,0.3)',
                              borderTopColor: '#fff',
                              borderRadius: '50%',
                              display: 'inline-block',
                              animation: 'spin 0.7s linear infinite',
                          }} />
                                                    {t.sending}
                                                </>
                                            ) : t.send}
                                        </button>

                                    </div>
                                </form>
                            </div>

                            {/* Back */}
                            <div style={{ textAlign: 'center', marginTop: 28 }}>
                                <Link href="/" className="font-dm" style={{
                                    fontSize: 12, color: c.isLight ? '#808080' : 'rgba(255,255,255,0.2)',
                                    textDecoration: 'none',
                                    transition: 'color 0.2s',
                                }}>
                                    ← {t.backHome}
                                </Link>
                            </div>
                        </>
                    )}

                </div>
            </div>

            <Footer />

            <div className="grain-overlay fixed inset-0 pointer-events-none" style={{ zIndex: 9998 }} />
        </div>
    )
}
