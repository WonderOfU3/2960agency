'use client'

import Navbar from '@/components/Navbar'
import { useTheme } from '@/context/ThemeContext'

export default function LegalPage({ title, date, children }: {
  title: string
  date: string
  children: React.ReactNode
}) {
  const { c } = useTheme()

  return (
    <div style={{ background: c.pageBg, minHeight: '100vh' }}>
      <Navbar />
      <div className="grain-overlay fixed inset-0 pointer-events-none" style={{ zIndex: 9998 }} />

      <div className="relative" style={{ paddingTop: 120, paddingBottom: 80 }}>
        <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 20px' }}>
          <div style={{
            background: c.cardBg,
            border: `1px solid ${c.divider}`,
            borderRadius: 20,
            padding: 'clamp(24px, 5vw, 48px)',
          }}>
            <h1 className="font-dm" style={{
              fontSize: 'clamp(1.4rem, 4vw, 2rem)',
              fontWeight: 700,
              color: c.text,
              marginBottom: 8,
              letterSpacing: '-0.02em',
            }}>
              {title}
            </h1>
            <p className="font-dm" style={{
              fontSize: 13,
              color: c.textMuted,
              marginBottom: 32,
            }}>
              {date}
            </p>

            <div className="legal-content font-dm" style={{ color: c.text }}>
              {children}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .legal-content h2 {
          font-size: 1.15rem;
          font-weight: 700;
          margin-top: 32px;
          margin-bottom: 12px;
          letter-spacing: -0.01em;
        }
        .legal-content h3 {
          font-size: 1rem;
          font-weight: 600;
          margin-top: 24px;
          margin-bottom: 8px;
        }
        .legal-content p {
          font-size: 0.87rem;
          line-height: 1.7;
          margin-bottom: 10px;
          opacity: 0.85;
        }
        .legal-content ul {
          list-style: disc;
          padding-left: 20px;
          margin-bottom: 12px;
        }
        .legal-content ul li {
          font-size: 0.87rem;
          line-height: 1.7;
          margin-bottom: 4px;
          opacity: 0.85;
        }
        .legal-content a {
          color: #D94F2A;
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
}
