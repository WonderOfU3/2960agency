'use client'

import { useState, useRef, type ReactNode } from 'react'
import Link from 'next/link'
import type { Opt } from './data'
import type { Locale } from '@/context/LanguageContext'

/* ── Design tokens ───────────────────────────────────────── */
const PAGE        = '#0c0b09'
const CARD        = '#191714'
const CARD_BORDER = 'rgba(255,255,255,0.08)'
const OPT_LABEL: Record<Locale, string> = { fr: 'optionnel', en: 'optional' }

/* ════════════════════════════════════════
   FORM SHELL — page wrapper + step progress + nav
   ════════════════════════════════════════ */

interface FormShellProps {
  children: ReactNode
  title: ReactNode
  subtitle: string
  stepLabels: string[]
  currentStep: number
  onNext?: () => void
  onPrev?: () => void
  onSubmit?: () => void
  submitting?: boolean
  nextLabel: string
  prevLabel: string
  submitLabel: string
  backHref: string
  backLabel: string
  locale: Locale
}

function renderTitle(title: ReactNode): ReactNode {
  if (typeof title !== 'string') return title
  const parts = title.split(/(__[^_]+__)/g)
  if (parts.length === 1) return title
  return parts.map((part, i) => {
    if (part.startsWith('__') && part.endsWith('__')) {
      return (
        <Link key={i} href="/" className="font-buster hover:text-[#FCFAA6]/60 transition-colors"
          style={{ textDecoration: 'none', color: 'inherit' }}>
          {part.slice(2, -2)}
        </Link>
      )
    }
    return part
  })
}

export function FormShell({
  children, title, subtitle, stepLabels, currentStep,
  onNext, onPrev, onSubmit, submitting,
  nextLabel, prevLabel, submitLabel, backHref, backLabel,
}: FormShellProps) {
  const total  = stepLabels.length
  const isLast = currentStep === total - 1

  return (
    <section className="min-h-screen relative" style={{ background: PAGE }}>
      {/* Warm top glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `
          radial-gradient(ellipse 70% 40% at 50% -5%, rgba(217,79,42,0.06) 0%, transparent 70%),
          radial-gradient(ellipse 50% 30% at 50% 0%, rgba(252,250,166,0.015) 0%, transparent 60%)
        `,
      }} />

      <div className="relative form-wrapper">
        {/* Title */}
        <div className="text-center" style={{ marginBottom: 20 }}>
          <h1 className="font-dm text-white font-bold tracking-tight leading-[1.25] form-title"
            style={{ maxWidth: 900, marginLeft: 'auto', marginRight: 'auto' }}>
            {renderTitle(title)}
          </h1>
        </div>

        {/* Subtitle */}
        <div className="text-center" style={{ marginBottom: 28 }}>
          <p className="font-dm text-[#c8c3b8]/50 leading-relaxed form-subtitle"
            style={{ maxWidth: 760, marginLeft: 'auto', marginRight: 'auto' }}>
            {subtitle}
          </p>
        </div>

        {/* Step progress */}
        <div style={{ marginBottom: 18 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
            <span className="font-dm text-white/60 text-[13px] font-medium tracking-wide">
              {stepLabels[currentStep]}
            </span>
            <div className="flex items-center gap-1.5">
              {stepLabels.map((_, i) => (
                <div key={i} className="h-[6px] rounded-full transition-all duration-400"
                  style={{
                    width: i === currentStep ? 24 : 6,
                    background: i <= currentStep ? '#D94F2A' : 'rgba(255,255,255,0.08)',
                  }}
                />
              ))}
            </div>
          </div>
          <div className="h-px bg-white/[0.04]" />
        </div>

        {/* Card */}
        <div
          className="border animate-step-in form-card"
          key={currentStep}
          style={{
            background: CARD, borderColor: CARD_BORDER,
            boxShadow: '0 2px 8px rgba(0,0,0,0.35), 0 12px 40px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.03)',
          }}
        >
          {children}
        </div>

        {/* CTA */}
        <div style={{ marginTop: 24 }}>
          <button
            type="button"
            onClick={isLast ? onSubmit : onNext}
            disabled={submitting}
            className={`font-dm w-full rounded-full text-[13px] font-semibold uppercase tracking-[0.10em] transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              isLast
                ? 'bg-[#D94F2A] text-white hover:bg-[#c44526] hover:shadow-[0_4px_20px_rgba(217,79,42,0.25)] active:scale-[0.99]'
                : 'bg-white/[0.07] border border-white/[0.10] text-white/90 hover:bg-white/[0.11] hover:border-white/[0.16] active:scale-[0.995]'
            }`}
            style={{ height: 52, padding: '0 24px' }}
          >
            {submitting ? (
              <span className="inline-flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {submitLabel}
              </span>
            ) : isLast ? submitLabel : nextLabel}
          </button>

          {currentStep > 0 && (
            <button type="button" onClick={onPrev}
              className="font-dm w-full text-white/30 text-[13px] hover:text-white/55 transition-colors cursor-pointer"
              style={{ marginTop: 14, padding: '8px 0' }}>
              ← {prevLabel}
            </button>
          )}
        </div>

        <div className="text-center" style={{ marginTop: 32 }}>
          <Link href={backHref}
            className="font-dm text-white/15 text-[12px] hover:text-white/35 transition-colors">
            ← {backLabel}
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ════════════════════════════════════════
   FIELD LABEL
   ════════════════════════════════════════ */

function FieldLabel({ label, required, locale = 'fr', suffix }: {
  label: string; required?: boolean; locale?: Locale; suffix?: string
}) {
  return (
    <label className="font-dm text-[#c8c3b8]/80 text-[13.5px] font-medium block leading-snug"
      style={{ marginBottom: 10 }}>
      {label}
      {required && <span className="text-[#D94F2A]/80" style={{ marginLeft: 2 }}>*</span>}
      {!required && <span className="text-white/20 text-[11.5px] font-normal" style={{ marginLeft: 6 }}>
        ({OPT_LABEL[locale]})
      </span>}
      {suffix && <span className="text-[#FCFAA6]/30 text-[11.5px] font-normal" style={{ marginLeft: 6 }}>{suffix}</span>}
    </label>
  )
}

/* ════════════════════════════════════════
   TEXT FIELD
   ════════════════════════════════════════ */

const INPUT_BASE = 'font-dm w-full rounded-xl text-white text-[14.5px] leading-snug placeholder:text-white/20 focus:outline-none transition-all duration-200'

const inputClasses = (hasError: boolean) =>
  `${INPUT_BASE} bg-white/[0.04] border ${
    hasError
      ? 'border-[#D94F2A]/30 focus:border-[#D94F2A]/50 focus:shadow-[0_0_0_3px_rgba(217,79,42,0.08)]'
      : 'border-white/[0.07] hover:border-white/[0.12] focus:border-[#D94F2A]/35 focus:shadow-[0_0_0_3px_rgba(217,79,42,0.06)]'
  }`

export function TextField({ label, value, onChange, placeholder, error, required, locale = 'fr', type = 'text', prefix }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; error?: string; required?: boolean
  locale?: Locale; type?: string; prefix?: string
}) {
  return (
    <div>
      <FieldLabel label={label} required={required} locale={locale} />
      <div className="relative">
        {prefix && (
          <span className="absolute top-1/2 -translate-y-1/2 font-dm text-white/20 text-[14px] pointer-events-none"
            style={{ left: 16 }}>{prefix}</span>
        )}
        <input type={type} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputClasses(!!error)}
          style={{ height: 56, padding: prefix ? '0 16px 0 34px' : '0 16px' }}
        />
      </div>
      {error && <ErrorMsg>{error}</ErrorMsg>}
    </div>
  )
}

/* ════════════════════════════════════════
   TEXTAREA FIELD
   ════════════════════════════════════════ */

export function TextareaField({ label, value, onChange, placeholder, error, required, locale = 'fr', rows = 3 }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; error?: string; required?: boolean
  locale?: Locale; rows?: number
}) {
  return (
    <div>
      <FieldLabel label={label} required={required} locale={locale} />
      <textarea value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} rows={rows}
        className={`${inputClasses(!!error)} resize-none`}
        style={{ minHeight: 100, padding: 16 }}
      />
      {error && <ErrorMsg>{error}</ErrorMsg>}
    </div>
  )
}

/* ════════════════════════════════════════
   PILL SELECT — multi-select chips
   ════════════════════════════════════════ */

export function PillSelect({ label, options, selected, onToggle, error, required, locale, max, maxLabel, compact }: {
  label: string; options: Opt[]; selected: string[]
  onToggle: (value: string) => void; error?: string
  required?: boolean; locale: Locale; max?: number
  maxLabel?: string; compact?: boolean
}) {
  return (
    <div>
      <FieldLabel label={label} required={required} locale={locale} suffix={maxLabel} />
      <div className="flex flex-wrap" style={{ gap: compact ? 8 : 10 }}>
        {options.map(opt => {
          const active   = selected.includes(opt.value)
          const disabled = !!(max && !active && selected.length >= max)
          return (
            <button key={opt.value} type="button"
              onClick={() => !disabled && onToggle(opt.value)}
              className={`font-dm border transition-all duration-150 cursor-pointer select-none ${
                active
                  ? 'bg-[#D94F2A]/[0.12] border-[#D94F2A]/25 text-white font-medium shadow-[0_0_8px_rgba(217,79,42,0.06)]'
                  : disabled
                    ? 'bg-white/[0.015] border-white/[0.03] text-white/12 cursor-not-allowed'
                    : 'bg-white/[0.03] border-white/[0.06] text-[#c8c3b8]/50 hover:bg-white/[0.05] hover:text-[#c8c3b8]/70 hover:border-white/[0.10]'
              }`}
              style={compact
                ? { fontSize: 12.5, padding: '8px 14px', borderRadius: 10 }
                : { fontSize: 13.5, padding: '11px 18px', borderRadius: 12 }
              }
            >
              {opt.label[locale]}
            </button>
          )
        })}
      </div>
      {error && <ErrorMsg>{error}</ErrorMsg>}
    </div>
  )
}

/* ════════════════════════════════════════
   RADIO CARDS — single select
   ════════════════════════════════════════ */

export function RadioCards({ label, options, selected, onChange, error, required, locale }: {
  label: string; options: Opt[]; selected: string
  onChange: (value: string) => void; error?: string
  required?: boolean; locale: Locale
}) {
  return (
    <div>
      <FieldLabel label={label} required={required} locale={locale} />
      <div className="flex flex-col gap-2">
        {options.map(opt => {
          const active = selected === opt.value
          return (
            <button key={opt.value} type="button"
              onClick={() => onChange(opt.value)}
              className={`font-dm text-[13.5px] w-full text-left rounded-xl border transition-all duration-150 cursor-pointer flex items-center gap-3 ${
                active
                  ? 'bg-[#D94F2A]/[0.08] border-[#D94F2A]/25 text-white'
                  : 'bg-white/[0.02] border-white/[0.06] text-[#c8c3b8]/50 hover:bg-white/[0.04] hover:text-[#c8c3b8]/70 hover:border-white/[0.10]'
              }`}
              style={{ padding: '14px 16px' }}
            >
              <div className={`w-[17px] h-[17px] rounded-full border-[1.5px] flex items-center justify-center flex-shrink-0 transition-all ${
                active ? 'border-[#D94F2A] bg-[#D94F2A]/[0.06]' : 'border-white/15'
              }`}>
                {active && <div className="w-[7px] h-[7px] rounded-full bg-[#D94F2A]" />}
              </div>
              {opt.label[locale]}
            </button>
          )
        })}
      </div>
      {error && <ErrorMsg>{error}</ErrorMsg>}
    </div>
  )
}

/* ════════════════════════════════════════
   FILE UPLOAD ZONE
   ════════════════════════════════════════ */

export interface FileEntry {
  file: File; id: string
  progress: number; status: 'idle' | 'uploading' | 'success' | 'error'
}

export function FileUploadZone({ label, files, onAdd, onRemove, error, required, locale, maxFiles = 3, chooseBtnLabel, dropLabel, formatLabel }: {
  label: string; files: FileEntry[]; onAdd: (files: FileList) => void
  onRemove: (id: string) => void; error?: string; required?: boolean
  locale: Locale; maxFiles?: number
  chooseBtnLabel: string; dropLabel: string; formatLabel: string
}) {
  const [dragging, setDragging] = useState(false)
  const ref = useRef<HTMLInputElement>(null)

  return (
    <div>
      <FieldLabel label={label} required={required} locale={locale} />
      {files.length < maxFiles && (
        <div
          className={`relative rounded-xl text-center transition-all duration-200 cursor-pointer border-[1.5px] border-dashed ${
            dragging
              ? 'border-[#D94F2A]/30 bg-[#D94F2A]/[0.04]'
              : 'border-white/[0.08] hover:border-white/[0.14] hover:bg-white/[0.02]'
          }`}
          style={{ padding: '32px 20px' }}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files.length) onAdd(e.dataTransfer.files) }}
          onClick={() => ref.current?.click()}
        >
          <input ref={ref} type="file" accept=".mp4,.mov" multiple className="hidden"
            onChange={e => { if (e.target.files) onAdd(e.target.files); e.target.value = '' }} />
          <div className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto" style={{ marginBottom: 12 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <p className="font-dm text-white/45 text-[13px] font-medium" style={{ marginBottom: 2 }}>{chooseBtnLabel}</p>
          <p className="font-dm text-white/20 text-[12px]">{dropLabel}</p>
          <p className="font-dm text-white/[0.12] text-[11px]" style={{ marginTop: 8 }}>{formatLabel}</p>
        </div>
      )}
      {files.length > 0 && (
        <div className="flex flex-col gap-2" style={{ marginTop: 12 }}>
          {files.map(f => (
            <div key={f.id} className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl" style={{ padding: '12px 16px' }}>
              <div className="w-8 h-8 rounded-lg bg-[#D94F2A]/[0.08] border border-[#D94F2A]/10 flex items-center justify-center flex-shrink-0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D94F2A" strokeWidth="2" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-dm text-white/70 text-[12.5px] truncate">{f.file.name}</p>
                <p className="font-dm text-white/25 text-[11px]">{(f.file.size / (1024 * 1024)).toFixed(1)} MB</p>
              </div>
              {f.status !== 'uploading' && (
                <button type="button" onClick={() => onRemove(f.id)}
                  className="text-white/20 hover:text-white/45 transition-colors text-[16px] cursor-pointer" style={{ padding: 4 }}>
                  &times;
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {error && <ErrorMsg>{error}</ErrorMsg>}
    </div>
  )
}

/* ════════════════════════════════════════
   LINK INPUTS
   ════════════════════════════════════════ */

export function LinkInputs({ label, links, onSet, onAdd, onRemove, errors, error, required, locale, max = 3, placeholder, addLabel }: {
  label: string; links: string[]; onSet: (i: number, v: string) => void
  onAdd: () => void; onRemove: (i: number) => void
  errors?: Record<string, string>; error?: string; required?: boolean; locale: Locale
  max?: number; placeholder?: string; addLabel: string
}) {
  return (
    <div>
      <FieldLabel label={label} required={required} locale={locale} />
      <div className="flex flex-col gap-2">
        {links.map((link, i) => (
          <div key={i} className="flex gap-2">
            <input type="url" value={link} onChange={e => onSet(i, e.target.value)}
              placeholder={placeholder}
              className={`${inputClasses(!!(errors?.[`link_${i}`] || (i === 0 && error)))} flex-1`}
              style={{ height: 56, padding: '0 16px' }}
            />
            {links.length > 1 && (
              <button type="button" onClick={() => onRemove(i)}
                className="w-[44px] flex-shrink-0 rounded-xl border border-white/[0.06] bg-white/[0.025] text-white/25 hover:text-white/45 hover:border-white/10 transition-colors flex items-center justify-center text-[16px] cursor-pointer">
                &times;
              </button>
            )}
          </div>
        ))}
      </div>
      {links.length < max && (
        <button type="button" onClick={onAdd}
          className="font-dm text-[12.5px] text-[#D94F2A]/60 hover:text-[#D94F2A] transition-colors cursor-pointer"
          style={{ marginTop: 10 }}>
          {addLabel}
        </button>
      )}
      {error && <ErrorMsg>{error}</ErrorMsg>}
    </div>
  )
}

/* ════════════════════════════════════════
   SECTION TITLE / HIGHLIGHT BOX / DIVIDER
   ════════════════════════════════════════ */

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="font-dm text-white/85 text-[15px] font-semibold tracking-tight" style={{ marginBottom: 8 }}>
      {children}
    </h3>
  )
}

export function HighlightBox({ children }: { children: ReactNode }) {
  return (
    <div className="bg-[#FCFAA6]/[0.03] border border-[#FCFAA6]/[0.08] rounded-xl" style={{ padding: '14px 16px' }}>
      <p className="font-dm text-[#c8c3b8]/55 text-[13px] leading-relaxed">
        <span className="text-[#FCFAA6]/50" style={{ marginRight: 6 }}>✶</span>
        {children}
      </p>
    </div>
  )
}

export function Divider() {
  return <div className="border-t border-white/[0.04]" style={{ margin: '10px 0' }} />
}

function ErrorMsg({ children }: { children: ReactNode }) {
  return (
    <p className="font-dm text-[#D94F2A]/70 text-[12px] flex items-center gap-1" style={{ marginTop: 8 }} data-e="">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0 opacity-70">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      {children}
    </p>
  )
}
