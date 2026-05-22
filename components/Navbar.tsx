'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { useTheme } from '@/context/ThemeContext'
import LanguageToggle from '@/components/LanguageToggle'
import ThemeToggle from '@/components/ThemeToggle'

export default function Navbar() {
  const { t, toggleLocale } = useLanguage()
  const { c } = useTheme()
  const [sm, setSm] = useState(false)
  const pathname = usePathname()
  const isHome = pathname === '/'

  useEffect(() => {
    const fn = () => setSm(window.innerWidth < 768)
    fn()
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  const pill =
      'font-dm rounded-full transition-all duration-200 ' +
      'flex items-center justify-center uppercase whitespace-nowrap cursor-pointer'

  const pillBorder = c.isLight ? '1px solid rgba(0,0,0,0.2)' : '1px solid rgba(255,255,255,0.35)'
  const pillColor = c.isLight ? '#222' : '#fff'

  const btnStyle: React.CSSProperties = sm
      ? { height: 28, paddingLeft: 10, paddingRight: 10, fontSize: 10, fontWeight: 500, letterSpacing: '0.04em' }
      : { height: 38, paddingLeft: 14, paddingRight: 14, fontSize: 13, fontWeight: 500, letterSpacing: '0.04em' }

  const handleHiwClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isHome) {
      e.preventDefault()
      const el = document.getElementById('comment-ca-marche')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const navLinkStyle = (active: boolean): React.CSSProperties => ({
    fontSize: 14, fontWeight: 400, textDecoration: 'none',
    color: active ? '#D94F2A' : (c.isLight ? '#333' : 'white'),
    transition: 'color 0.2s',
  })

  return (
      <nav
          className="fixed left-0 right-0 z-50 flex items-center justify-between pointer-events-none nav-responsive"
          style={{ top: 14 }}
      >
        {/* Logo */}
        <Link
            href="/"
            className="font-buster text-white pointer-events-auto select-none shrink-0"
            style={{ fontSize: sm ? 11 : 14, letterSpacing: '0.02em', textDecoration: 'none' }}
        >
          2960 AGENCY
        </Link>

        {/* Right */}
        <div className="flex items-center pointer-events-auto" style={{ gap: sm ? 6 : 8 }}>

          {/* Nav links — desktop only */}
          {!sm && (
              <div className="flex items-center" style={{ gap: 12, marginRight: 12 }}>

                <a href={isHome ? '#comment-ca-marche' : '/#comment-ca-marche'}
                onClick={handleHiwClick}
                className="font-dm hover:text-white/60 transition-colors duration-200 whitespace-nowrap"
                style={navLinkStyle(false)}
                >
                {t('nav_howItWorks')}
              </a>
            <span style={{ fontSize: 6, color: c.isLight ? '#ccc' : 'rgba(255,255,255,0.2)' }}>•</span>
        <Link
            href="/tarifs"
            className="font-dm hover:text-white/60 transition-colors duration-200 whitespace-nowrap"
            style={navLinkStyle(pathname === '/tarifs')}
        >
          {t('nav_pricing')}
        </Link>
        <span className="text-white/20" style={{ fontSize: 6 }}>•</span>
        <Link
            href="/contact"
            className="font-dm hover:text-white/60 transition-colors duration-200 whitespace-nowrap"
            style={navLinkStyle(pathname === '/contact')}
        >
          {t('nav_contact')}
        </Link>
      </div>
)}

{/* Login buttons */}
  <Link href="/creator/login" className={pill} style={{
    ...btnStyle,
    background: '#E8471A',
    border: '1px solid #E8471A',
    color: '#fff',
    textDecoration: 'none',
  }}>
    {t('nav_login')}
  </Link>
  <Link href="/restaurant/login" className={pill} style={{
    ...btnStyle,
    border: pillBorder,
    color: pillColor,
    textDecoration: 'none',
  }}>
    {t('nav_loginResto')}
  </Link>

{/* Theme + Lang toggles */}
  <ThemeToggle />
  <LanguageToggle />
</div>
</nav>
)
}