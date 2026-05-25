'use client'

import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import { useTheme } from '@/context/ThemeContext'

const LINKS = [
  { href: '/legal/mentions', fr: 'Mentions l\u00e9gales', en: 'Legal Notice' },
  { href: '/legal/privacy', fr: 'Politique de confidentialit\u00e9', en: 'Privacy Policy' },
  { href: '/legal/cgu-creators', fr: 'CGU Cr\u00e9ateurs', en: 'Creator Terms' },
  { href: '/legal/cguv-restaurants', fr: 'CGUV Restaurants', en: 'Restaurant Terms' },
]

export default function Footer() {
  const { locale } = useLanguage()
  const { c } = useTheme()

  const linkColor = c.isLight ? '#888' : 'rgba(255,255,255,0.25)'
  const hoverColor = c.isLight ? '#555' : 'rgba(255,255,255,0.5)'
  const borderColor = c.isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.04)'

  return (
    <footer className="relative" style={{ padding: '32px 24px 28px', borderTop: `1px solid ${borderColor}` }}>
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2" style={{ maxWidth: 800, margin: '0 auto' }}>
        {LINKS.map(link => (
          <Link
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener"
            className="font-dm transition-colors duration-200"
            style={{ fontSize: 12, color: linkColor, textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = hoverColor)}
            onMouseLeave={e => (e.currentTarget.style.color = linkColor)}
          >
            {locale === 'fr' ? link.fr : link.en}
          </Link>
        ))}
      </div>
      <p className="font-dm text-center" style={{ fontSize: 11, color: linkColor, marginTop: 12, opacity: 0.6 }}>
        &copy; {new Date().getFullYear()} 2960 Agency
      </p>
    </footer>
  )
}
