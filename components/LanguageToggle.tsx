'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { useTheme } from '@/context/ThemeContext'

export default function LanguageToggle() {
  const { locale, toggleLocale } = useLanguage()
  const { c } = useTheme()
  const [sm, setSm] = useState(false)

  useEffect(() => {
    const fn = () => setSm(window.innerWidth < 768)
    fn()
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  return (
    <button
      onClick={toggleLocale}
      className="font-dm rounded-full transition-all duration-200 flex items-center justify-center uppercase whitespace-nowrap cursor-pointer"
      style={{
        height: sm ? 28 : 38, paddingLeft: sm ? 8 : 14, paddingRight: sm ? 8 : 14,
        fontSize: sm ? 10 : 13, fontWeight: 500, letterSpacing: '0.04em',
        color: c.isLight ? '#222' : '#fff',
        border: c.isLight ? '1px solid rgba(0,0,0,0.2)' : '1px solid rgba(255,255,255,0.35)',
      }}
    >
      {locale === 'fr' ? (sm ? 'EN' : 'ENGLISH') : (sm ? 'FR' : 'FRANÇAIS')}
    </button>
  )
}
