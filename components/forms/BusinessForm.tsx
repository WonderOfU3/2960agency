'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { FormShell, TextField, Divider } from './ui'
import type { Locale } from '@/context/LanguageContext'

const T: Record<Locale, Record<string, string>> = {
  fr: {
    title: "Créez votre compte __restaurant__",
    subtitle: "Inscrivez-vous en 30 secondes. Vous complèterez votre profil dans votre espace.",
    step1: "Inscription",
    next: "Suivant", prev: "Précédent",
    submit: "Créer mon compte", submitting: "Création en cours…", back: "Retour à l'accueil",
    email: "Adresse e-mail",
    password: "Mot de passe", passwordHelp: "Minimum 8 caractères",
    bizName: "Nom du restaurant",
    phEmail: "contact@exemple.com",
    phBiz: "Ex : Le Café des Amis",
    acceptCGUV: "En créant votre compte, vous acceptez les",
    cguLink: "CGU et CGV",
    req: "Ce champ est requis", invEmail: "Adresse e-mail invalide",
    submitErr: "Une erreur est survenue. Réessayez.",
    emailTaken: "Un compte existe déjà avec cet email.",
  },
  en: {
    title: "Create your __restaurant__ account",
    subtitle: "Sign up in 30 seconds. You'll complete your profile in your dashboard.",
    step1: "Sign up",
    next: "Next", prev: "Previous",
    submit: "Create my account", submitting: "Creating…", back: "Back to home",
    email: "Email address",
    password: "Password", passwordHelp: "Minimum 8 characters",
    bizName: "Restaurant name",
    phEmail: "contact@example.com",
    phBiz: "e.g. The Good Coffee",
    acceptCGUV: "By creating an account, you accept the",
    cguLink: "Terms and Conditions",
    req: "This field is required", invEmail: "Invalid email address",
    submitErr: "Something went wrong. Please try again.",
    emailTaken: "An account already exists with this email.",
  },
}

interface State {
  email: string; password: string; bizName: string
}

const INIT: State = {
  email: '', password: '', bizName: '',
}

export default function BusinessForm() {
  const { locale } = useLanguage()
  const router = useRouter()
  const t = T[locale]

  const [form, setForm]             = useState<State>(INIT)
  const [errors, setErrors]         = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { window.scrollTo(0, 0) }, [])

  const set = (k: keyof State, v: string) => {
    setForm(p => ({ ...p, [k]: v }))
    if (errors[k]) setErrors(p => { const n = { ...p }; delete n[k]; return n })
  }

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t.invEmail
    if (!form.password.trim() || form.password.length < 8) e.password = t.passwordHelp
    if (!form.bizName.trim()) e.bizName = t.req
    setErrors(e)
    if (Object.keys(e).length > 0) {
      setTimeout(() => document.querySelector('[data-e]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50)
    }
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)
    try {
      const payload = {
        email: form.email.trim(),
        password: form.password,
        bizName: form.bizName.trim(),
        locale,
      }
      const res = await fetch('/api/submit-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        if (data?.error?.includes('existe déjà') || data?.error?.includes('already exists')) {
          setErrors({ email: t.emailTaken })
          setSubmitting(false)
          return
        }
        throw new Error('failed')
      }
      if (typeof window !== 'undefined') {
        if ((window as any).ttq) { (window as any).ttq.track('CompleteRegistration') }
        if ((window as any).fbq) { (window as any).fbq('track', 'CompleteRegistration') }
      }
      router.push('/business/success')
    } catch {
      setErrors({ submit: t.submitErr })
      setSubmitting(false)
    }
  }

  return (
    <FormShell
      title={t.title} subtitle={t.subtitle}
      stepLabels={[t.step1]} currentStep={0}
      onSubmit={handleSubmit} submitting={submitting}
      nextLabel={t.submit} prevLabel=""
      submitLabel={submitting ? t.submitting : t.submit}
      backHref="/" backLabel={t.back} locale={locale}
    >
      <div className="form-fields">
        <TextField label={t.email} value={form.email} onChange={v => set('email', v)} placeholder={t.phEmail} error={errors.email} required locale={locale} type="email" />
        <TextField label={t.bizName} value={form.bizName} onChange={v => set('bizName', v)} placeholder={t.phBiz} error={errors.bizName} required locale={locale} />
        <TextField label={t.password} value={form.password} onChange={v => set('password', v)} placeholder={t.passwordHelp} error={errors.password} required locale={locale} type="password" autoComplete="new-password" />
        <Divider />

        {/* Legal */}
        <p className="font-dm text-[#c8c3b8]/40 text-[12px] leading-relaxed">
          {t.acceptCGUV}{' '}
          <a href="/legal/cguv-restaurants" target="_blank" rel="noopener" style={{ color: '#E8471A', textDecoration: 'underline' }}>
            {t.cguLink}
          </a>{' '}
          de 2960 Agency.
        </p>
      </div>

      {errors.submit && (
        <div className="bg-[#D94F2A]/[0.04] border border-[#D94F2A]/10 rounded-xl" style={{ padding: '12px 16px', marginTop: 24 }}>
          <p className="font-dm text-[#D94F2A]/70 text-[13px] text-center">{errors.submit}</p>
        </div>
      )}
    </FormShell>
  )
}
