import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'
import { LanguageProvider } from '@/context/LanguageContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { ToastProvider } from '@/components/ui/Toast'

export const metadata: Metadata = {
  title: {
    default: '2960 Agency — Collabs TikTok entre restaurants et créateurs à Paris',
    template: '%s',
  },
  description: 'La plateforme qui connecte restaurants indépendants et créateurs TikTok vérifiés à Paris. Repas offert en échange d\'une vidéo. 3 collabs gratuites pour commencer.',
  metadataBase: new URL('https://2960agency.com'),
  openGraph: {
    title: '2960 Agency — Collabs TikTok restaurants × créateurs',
    description: 'Des restaurants t\'offrent un repas. Tu filmes et publies sur TikTok. 3 collabs gratuites, aucun abonnement pour commencer.',
    type: 'website',
    siteName: '2960 Agency',
    url: 'https://2960agency.com',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: '2960 Agency — Collabs TikTok restaurants × créateurs à Paris',
    description: 'Repas offerts, vidéos TikTok, primes de viralité. La plateforme qui connecte restos et créateurs.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' as const },
  },
  alternates: { canonical: 'https://2960agency.com' },
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: '2960 Agency',
          url: 'https://2960agency.com',
          logo: 'https://2960agency.com/images/logo.png',
          description: 'Plateforme de collaborations TikTok entre restaurants indépendants et créateurs de contenu vérifiés à Paris.',
          email: 'contact@2960agency.com',
          areaServed: { '@type': 'City', name: 'Paris', addressCountry: 'FR' },
          knowsAbout: ['marketing restaurant', 'TikTok food content', 'influencer marketing', 'restaurant visibility', 'content creator marketplace'],
        }) }} />
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
        <Script id="meta-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '1285445073305934');
          fbq('track', 'PageView');
        `}</Script>
        <Script id="tiktok-pixel" strategy="afterInteractive">{`
          !function (w, d, t) {
            w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
            var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
            ttq.load('D8APR6RC77UANKFS2S00');
            ttq.page();
          }(window, document, 'ttq');
        `}</Script>
        <ThemeProvider><LanguageProvider><ToastProvider>{children}</ToastProvider></LanguageProvider></ThemeProvider>
      </body>
    </html>
  )
}
