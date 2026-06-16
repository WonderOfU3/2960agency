import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Devenir créateur food TikTok à Paris — 2960 Agency',
  description: 'Rejoins 2960 Agency : repas offerts dans les meilleurs restos de Paris, prime de viralité si ta vidéo performe, système de points. Créateurs TikTok et Instagram vérifiés.',
  openGraph: {
    title: 'Devenir créateur food TikTok à Paris — 2960 Agency',
    description: 'Repas offerts, primes de viralité, système de points. Rejoins la communauté de créateurs food 2960.',
    type: 'website',
    url: 'https://2960agency.com/createurs/paris',
  },
  alternates: { canonical: 'https://2960agency.com/createurs/paris' },
}

export default function CreateurParisPage() {
  const faqItems = [
    { q: 'Comment devenir créateur sur 2960 Agency ?', a: 'Inscris-toi sur la plateforme avec ton TikTok ou Instagram. Notre équipe audite ton profil (stats, qualité, sérieux). Si tu es validé, tu accèdes aux offres de restaurants à Paris.' },
    { q: 'Combien ça coûte ?', a: 'Rien. Tu ne paies jamais. Le restaurant offre le repas. Tu peux emmener des amis (selon l\'offre). Si ta vidéo performe, tu peux aussi toucher une prime de viralité.' },
    { q: 'Comment fonctionnent les primes de viralité ?', a: 'Certains restaurants proposent un bonus si ta vidéo dépasse un certain nombre de vues. Par exemple : 50 000 vues → 200€. Le seuil et le montant sont fixés par le restaurant. Tu vois le montant net avant de réserver.' },
    { q: 'Je peux emmener des amis ?', a: 'Oui. Chaque offre indique le nombre maximum de personnes. En général, tu peux emmener 1 à 3 amis. Plus la table est vivante, meilleur est le contenu.' },
    { q: 'Quel délai pour publier la vidéo ?', a: 'Tu as 5 jours après ta visite pour publier ta vidéo et coller le lien dans ton espace. La vidéo doit rester en ligne au moins 12 mois.' },
  ]

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }

  const steps = [
    { num: '1', title: 'Inscris-toi', desc: 'Crée ton compte avec ton TikTok ou Instagram. On audite ton profil sous 48h.' },
    { num: '2', title: 'Réserve un créneau', desc: 'Choisis un restaurant, une date, et viens avec tes potes. Le repas est offert.' },
    { num: '3', title: 'Filme et publie', desc: 'Crée ton contenu, publie sous 5 jours. Si la vidéo performe, tu touches la prime.' },
  ]

  return (
    <div className="min-h-screen" style={{ background: '#F3F4F7', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <nav className="flex items-center justify-between px-5 sm:px-8" style={{ height: 64 }}>
        <Link href="/" className="font-buster text-[18px] sm:text-[22px] text-[#1a1a1a]" style={{ textDecoration: 'none' }}>2960 AGENCY</Link>
        <Link href="/creator" className="font-dm text-[12px] font-semibold px-4 py-2 rounded-full" style={{ background: '#FF6339', color: '#fff', textDecoration: 'none' }}>Devenir créateur</Link>
      </nav>

      {/* Hero */}
      <section className="px-5 sm:px-8 pt-12 sm:pt-20 pb-8 sm:pb-12" style={{ maxWidth: 820, margin: '0 auto' }}>
        <h1 className="font-dm text-[#1a1a1a] text-[26px] sm:text-[40px] font-bold leading-[1.15] tracking-tight mb-5">
          Devenir créateur food TikTok à Paris
        </h1>
        <p className="font-dm text-[#555] text-[15px] sm:text-[17px] leading-[1.7] mb-8" style={{ maxWidth: 640 }}>
          Des restaurants t&apos;invitent à manger gratuitement. Tu filmes, tu publies. Si ta vidéo cartonne, tu touches une prime. Rejoins la communauté de créateurs 2960.
        </p>
        <Link href="/creator" className="inline-block font-dm text-[14px] font-bold rounded-full px-8 py-3.5" style={{ background: '#FF6339', color: '#fff', textDecoration: 'none' }}>
          Rejoindre 2960 Agency &rarr;
        </Link>
      </section>

      {/* Steps */}
      <section className="px-5 sm:px-8 py-12 sm:py-16" style={{ background: '#fff' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <h2 className="font-dm text-[#1a1a1a] text-[20px] sm:text-[24px] font-bold mb-8">Comment ça marche</h2>
          <div className="space-y-8">
            {steps.map(s => (
              <div key={s.num} className="flex gap-4 sm:gap-6">
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-dm text-[16px] font-bold" style={{ background: 'rgba(255,99,57,0.1)', color: '#FF6339' }}>{s.num}</div>
                <div>
                  <h3 className="font-dm text-[#1a1a1a] text-[17px] font-bold mb-1">{s.title}</h3>
                  <p className="font-dm text-[#555] text-[14px] leading-[1.7]">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="px-5 sm:px-8 py-12 sm:py-16" style={{ maxWidth: 820, margin: '0 auto' }}>
        <h2 className="font-dm text-[#1a1a1a] text-[20px] sm:text-[24px] font-bold mb-6">Ce que tu gagnes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { title: 'Repas offerts', desc: 'Mange gratuitement dans les meilleurs restos de Paris. Emmène tes potes.' },
            { title: 'Primes de viralité', desc: 'Jusqu\'à 1 000€ par vidéo si elle dépasse le seuil de vues fixé par le resto.' },
            { title: 'Points et niveaux', desc: 'Chaque collab te fait gagner des points. Plus tu avances, plus tu débloques d\'avantages.' },
            { title: 'Code ambassadeur', desc: 'Parraine des restaurants. 5 inscriptions = 100€.' },
          ].map(b => (
            <div key={b.title} className="rounded-xl p-5" style={{ background: '#fff' }}>
              <h3 className="font-dm text-[#6D0040] text-[15px] font-bold mb-2">{b.title}</h3>
              <p className="font-dm text-[#555] text-[13px] leading-[1.6]">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-5 sm:px-8 py-12 sm:py-16" style={{ background: '#fff' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 className="font-dm text-[#1a1a1a] text-[20px] sm:text-[24px] font-bold mb-8">Questions fréquentes</h2>
          <div className="space-y-6">
            {faqItems.map((f, i) => (
              <div key={i}>
                <h3 className="font-dm text-[#1a1a1a] text-[15px] font-bold mb-2">{f.q}</h3>
                <p className="font-dm text-[#555] text-[14px] leading-[1.7]">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 sm:px-8 py-12 text-center">
        <h2 className="font-dm text-[#1a1a1a] text-[22px] font-bold mb-4">Prêt à manger gratis et créer du contenu ?</h2>
        <Link href="/creator" className="inline-block font-dm text-[14px] font-bold rounded-full px-8 py-3.5" style={{ background: '#FF6339', color: '#fff', textDecoration: 'none' }}>
          Rejoindre 2960 Agency &rarr;
        </Link>
      </section>

      <footer className="px-5 sm:px-8 py-8 text-center" style={{ borderTop: '1px solid #e5e5e5' }}>
        <Link href="/" className="font-buster text-[14px] text-[#bbb] hover:text-[#888] transition-colors" style={{ textDecoration: 'none' }}>2960 AGENCY</Link>
      </footer>
    </div>
  )
}
