import type { Metadata } from 'next'
import './globals.css'
import { LanguageProvider } from '@/context/LanguageContext'

export const metadata: Metadata = {
  title: '2960 Agency — Restaurants & Creators',
  description: 'La plateforme qui connecte restaurants indépendants et créateurs locaux à Paris.',
  openGraph: {
    title: '2960 Agency',
    description: "Des restos t'invitent. Tu crées du contenu. Tout le monde y gagne.",
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  )
}
