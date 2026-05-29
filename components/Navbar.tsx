'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'
import { useTheme } from '@/context/ThemeContext'
import LanguageToggle from '@/components/LanguageToggle'
import ThemeToggle from '@/components/ThemeToggle'

export default function Navbar() {
  const { t } = useLanguage()
  const { c } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()
  const isHome = pathname === '/'

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const fn = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) setMenuOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [menuOpen])

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  const pill =
      'font-dm rounded-full transition-all duration-200 ' +
      'flex items-center justify-center uppercase whitespace-nowrap cursor-pointer'

  const pillBorder = c.isLight ? '1px solid rgba(0,0,0,0.2)' : '1px solid rgba(255,255,255,0.35)'
  const pillColor = c.isLight ? '#222' : '#fff'

  const handleHiwClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isHome) {
      e.preventDefault()
      setMenuOpen(false)
      const el = document.getElementById('comment-ca-marche')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const navLinkStyle = (active: boolean): React.CSSProperties => ({
    fontSize: 14, fontWeight: 400, textDecoration: 'none',
    color: active ? '#D94F2A' : (c.isLight ? '#333' : 'white'),
    transition: 'color 0.2s',
  })

  const mobileNavLinkStyle = (active: boolean): React.CSSProperties => ({
    fontSize: 15, fontWeight: 500, textDecoration: 'none',
    color: active ? '#E8471A' : (c.isLight ? '#222' : 'white'),
    transition: 'color 0.2s',
    padding: '10px 0',
    display: 'block',
  })

  const divider = <div style={{ height: 1, background: c.isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)' }} />

  return (
      <div>
      <nav
          className="fixed left-0 right-0 z-50 flex items-center justify-between pointer-events-none nav-responsive"
          style={{ top: 14 }}
      >
        {/* Logo */}
        <Link
            href="/"
            className="font-buster text-white pointer-events-auto select-none shrink-0 text-[11px] md:text-[14px]"
            style={{ letterSpacing: '0.02em', textDecoration: 'none' }}
        >
          2960 AGENCY
        </Link>

        {/* Right */}
        <div className="flex items-center pointer-events-auto gap-[4px] md:gap-[8px]">

          {/* Nav links — desktop only */}
          <div className="hidden md:flex items-center" style={{ gap: 12, marginRight: 12 }}>
            <a href={isHome ? '#comment-ca-marche' : '/#comment-ca-marche'}
               onClick={handleHiwClick}
               className="font-dm hover:text-white/60 transition-colors duration-200 whitespace-nowrap"
               style={navLinkStyle(false)}
            >
              {t('nav_howItWorks')}
            </a>
            <span style={{ fontSize: 6, color: c.isLight ? '#ccc' : 'rgba(255,255,255,0.2)' }}>•</span>
            <Link href="/tarifs" className="font-dm hover:text-white/60 transition-colors duration-200 whitespace-nowrap" style={navLinkStyle(pathname === '/tarifs')}>
              {t('nav_pricing')}
            </Link>
            <span className="text-white/20" style={{ fontSize: 6 }}>•</span>
            <Link href="/contact" className="font-dm hover:text-white/60 transition-colors duration-200 whitespace-nowrap" style={navLinkStyle(pathname === '/contact')}>
              {t('nav_contact')}
            </Link>
          </div>

          {/* Login buttons — always visible */}
          <Link href="/creator/login" className={`${pill} nav-pill-sm`} style={{
            background: '#E8471A', border: '1px solid #E8471A', color: '#fff', textDecoration: 'none',
          }}>
            {t('nav_login')}
          </Link>
          <Link href="/restaurant/login" className={`${pill} nav-pill-sm`} style={{
            border: pillBorder, color: pillColor, textDecoration: 'none',
          }}>
            {t('nav_loginResto')}
          </Link>

          {/* Theme + Lang toggles — always visible */}
          <ThemeToggle />
          <LanguageToggle />

          {/* Hamburger — mobile only */}
          <button
            ref={btnRef}
            onClick={() => setMenuOpen(v => !v)}
            className="md:hidden flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer w-[26px] h-[26px] md:w-[28px] md:h-[28px]"
            style={{
              background: c.isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)',
              border: `1px solid ${c.isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)'}`,
            }}
          >
            {menuOpen ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c.isLight ? '#222' : '#fff'} strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c.isLight ? '#222' : '#fff'} strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div
          ref={menuRef}
          className="fixed z-50 pointer-events-auto md:hidden"
          style={{
            top: 52, right: 14,
            background: c.isLight ? 'rgba(255,255,255,0.95)' : 'rgba(20,20,18,0.95)',
            backdropFilter: 'blur(16px)',
            border: `1px solid ${c.isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: 16,
            padding: '8px 20px',
            minWidth: 180,
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          }}
        >
          <a
            href={isHome ? '#comment-ca-marche' : '/#comment-ca-marche'}
            onClick={handleHiwClick}
            className="font-dm block"
            style={mobileNavLinkStyle(false)}
          >
            {t('nav_howItWorks')}
          </a>
          {divider}
          <Link href="/tarifs" className="font-dm block" style={mobileNavLinkStyle(pathname === '/tarifs')}>
            {t('nav_pricing')}
          </Link>
          {divider}
          <Link href="/contact" className="font-dm block" style={mobileNavLinkStyle(pathname === '/contact')}>
            {t('nav_contact')}
          </Link>
        </div>
      )}
      </div>
  )
}
