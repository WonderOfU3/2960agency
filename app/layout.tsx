import type { Metadata, Viewport } from 'next'
import './globals.css'
import { LanguageProvider } from '@/context/LanguageContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { ToastProvider } from '@/components/ui/Toast'

export const metadata: Metadata = {
  title: '2960 Agency — Restaurants & Creators',
  description: 'La plateforme qui connecte restaurants indépendants et créateurs locaux à Paris.',
  openGraph: {
    title: '2960 Agency',
    description: "Des restos t'invitent. Tu crées du contenu. Tout le monde y gagne.",
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var t = localStorage.getItem('theme');
            if (t === 'dark' || t === 'light') {
              document.documentElement.setAttribute('data-theme', t);
            }
          })();
        `}} />
      </head>
      <body>
        <ThemeProvider><LanguageProvider><ToastProvider>{children}</ToastProvider></LanguageProvider></ThemeProvider>
      </body>
    </html>
  )
}
