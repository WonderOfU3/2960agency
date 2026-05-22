'use client'

import { useLanguage } from '@/context/LanguageContext'
import { useTheme } from '@/context/ThemeContext'

export default function LanguageToggle() {
  const { locale, toggleLocale } = useLanguage()
  const { c } = useTheme()

  return (
    <button
      onClick={toggleLocale}
      className="font-dm rounded-full transition-all duration-200 flex items-center justify-center uppercase whitespace-nowrap cursor-pointer"
      style={{
        height: 38, paddingLeft: 14, paddingRight: 14, fontSize: 13, fontWeight: 500, letterSpacing: '0.04em',
        color: c.isLight ? '#222' : '#fff',
        border: c.isLight ? '1px solid rgba(0,0,0,0.2)' : '1px solid rgba(255,255,255,0.35)',
      }}
    >
      {locale === 'fr' ? 'ENGLISH' : 'FRANÇAIS'}
    </button>
  )
}
