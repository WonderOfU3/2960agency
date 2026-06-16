import type { Metadata } from 'next'
import Link from 'next/link'
import sql from '@/lib/db'

// ═══════════════════════════════════════════════════════════
//  PROGRAMMATIC SEO — /restaurants/[slug]
//  Handles: paris-9e, italien-paris, etc.
//  Generates hundreds of crawlable landing pages from DB data
// ═══════════════════════════════════════════════════════════

const ARRONDISSEMENTS: Record<string, { num: string; label: string }> = {
  '1er': { num: '1', label: '1er arrondissement' },
  '2e': { num: '2', label: '2e arrondissement' },
  '3e': { num: '3', label: '3e arrondissement' },
  '4e': { num: '4', label: '4e arrondissement' },
  '5e': { num: '5', label: '5e arrondissement' },
  '6e': { num: '6', label: '6e arrondissement' },
  '7e': { num: '7', label: '7e arrondissement' },
  '8e': { num: '8', label: '8e arrondissement' },
  '9e': { num: '9', label: '9e arrondissement' },
  '10e': { num: '10', label: '10e arrondissement' },
  '11e': { num: '11', label: '11e arrondissement' },
  '12e': { num: '12', label: '12e arrondissement' },
  '13e': { num: '13', label: '13e arrondissement' },
  '14e': { num: '14', label: '14e arrondissement' },
  '15e': { num: '15', label: '15e arrondissement' },
  '16e': { num: '16', label: '16e arrondissement' },
  '17e': { num: '17', label: '17e arrondissement' },
  '18e': { num: '18', label: '18e arrondissement' },
  '19e': { num: '19', label: '19e arrondissement' },
  '20e': { num: '20', label: '20e arrondissement' },
}

const CUISINES: Record<string, string> = {
  francais: 'français', italien: 'italien', japonais: 'japonais', chinois: 'chinois',
  libanais: 'libanais', thai: 'thaï', indien: 'indien', mexicain: 'mexicain',
  coreen: 'coréen', vietnamien: 'vietnamien', marocain: 'marocain', turc: 'turc',
  americain: 'américain', africain: 'africain', peruvien: 'péruvien', grec: 'grec',
  espagnol: 'espagnol', brunch: 'brunch', burger: 'burger', pizza: 'pizza',
  sushi: 'sushi', ramen: 'ramen', poke: 'poké', healthy: 'healthy', vegan: 'vegan',
}

function parseSlug(slug: string): { type: 'arrondissement'; arr: string; label: string } | { type: 'cuisine'; cuisine: string; label: string } | null {
  // paris-9e → arrondissement
  const arrMatch = slug.match(/^paris-(\d{1,2}e[r]?)$/)
  if (arrMatch) {
    const key = arrMatch[1]
    const info = ARRONDISSEMENTS[key]
    if (info) return { type: 'arrondissement', arr: key, label: info.label }
  }
  // italien-paris → cuisine
  const cuisineMatch = slug.match(/^([a-z]+)-paris$/)
  if (cuisineMatch) {
    const key = cuisineMatch[1]
    const label = CUISINES[key]
    if (label) return { type: 'cuisine', cuisine: key, label }
  }
  return null
}

export async function generateStaticParams() {
  const arrParams = Object.keys(ARRONDISSEMENTS).map(a => ({ slug: `paris-${a}` }))
  const cuisineParams = Object.keys(CUISINES).map(c => ({ slug: `${c}-paris` }))
  return [...arrParams, ...cuisineParams]
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const parsed = parseSlug(slug)
  if (!parsed) return { title: 'Restaurants — 2960 Agency' }

  if (parsed.type === 'arrondissement') {
    const title = `Restaurants avec collabs TikTok dans le ${parsed.label} de Paris — 2960 Agency`
    const description = `Découvrez les restaurants du ${parsed.label} de Paris qui proposent des collaborations TikTok avec des créateurs vérifiés. Repas offert en échange d'une vidéo. Inscrivez votre restaurant gratuitement.`
    return {
      title, description,
      openGraph: { title, description, type: 'website', url: `https://2960agency.com/restaurants/${slug}` },
      alternates: { canonical: `https://2960agency.com/restaurants/${slug}` },
    }
  }

  const title = `Restaurants ${parsed.label}s à Paris — Collabs TikTok — 2960 Agency`
  const description = `Les meilleurs restaurants ${parsed.label}s de Paris proposent des collaborations TikTok avec des créateurs vérifiés sur 2960 Agency. Repas offert, vidéo publiée. Inscrivez votre restaurant.`
  return {
    title, description,
    openGraph: { title, description, type: 'website', url: `https://2960agency.com/restaurants/${slug}` },
    alternates: { canonical: `https://2960agency.com/restaurants/${slug}` },
  }
}

interface Restaurant {
  id: number; name: string; cuisine_type: string; city: string;
  arrondissement: string | null; address: string; photos: string[] | null;
  max_people: number; dietary_options: string[] | null; virality_tiers: { views: number; bonus: number }[] | null;
}

async function getRestaurants(parsed: NonNullable<ReturnType<typeof parseSlug>>): Promise<Restaurant[]> {
  try {
    if (parsed.type === 'arrondissement') {
      const info = ARRONDISSEMENTS[parsed.arr]
      return await sql`
        SELECT id, name, cuisine_type, city, arrondissement, address, photos, max_people, dietary_options, virality_tiers
        FROM restaurants
        WHERE is_published = true AND (arrondissement = ${info.num} OR arrondissement = ${parsed.arr})
        ORDER BY name
      ` as unknown as Restaurant[]
    }
    const cuisineLabel = CUISINES[parsed.cuisine] || parsed.cuisine
    return await sql`
      SELECT id, name, cuisine_type, city, arrondissement, address, photos, max_people, dietary_options, virality_tiers
      FROM restaurants
      WHERE is_published = true AND LOWER(cuisine_type) LIKE ${`%${cuisineLabel.toLowerCase()}%`}
      ORDER BY name
    ` as unknown as Restaurant[]
  } catch { return [] }
}

function dietaryLabel(key: string): string {
  const map: Record<string, string> = { halal: 'Halal', casher: 'Casher', vegetarien: 'Végétarien', vegan: 'Vegan', sans_lactose: 'Sans lactose', sans_gluten: 'Sans gluten' }
  return map[key] || key
}

export default async function RestaurantListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const parsed = parseSlug(slug)

  if (!parsed) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F3F4F7' }}>
        <div className="text-center">
          <h1 className="font-dm text-[24px] font-bold text-[#1a1a1a] mb-4">Page introuvable</h1>
          <Link href="/" className="font-dm text-[#FF6339] underline">Retour à l'accueil</Link>
        </div>
      </div>
    )
  }

  const restaurants = await getRestaurants(parsed)
  const pageTitle = parsed.type === 'arrondissement'
    ? `Restaurants avec collabs TikTok — ${parsed.label} de Paris`
    : `Restaurants ${parsed.label}s à Paris — Collabs TikTok`
  const pageSubtitle = parsed.type === 'arrondissement'
    ? `Découvrez les restaurants du ${parsed.label} qui collaborent avec des créateurs TikTok vérifiés sur 2960 Agency.`
    : `Les restaurants ${parsed.label}s de Paris qui proposent des collaborations avec des créateurs TikTok et Instagram.`

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: pageTitle,
    description: pageSubtitle,
    numberOfItems: restaurants.length,
    itemListElement: restaurants.slice(0, 20).map((r, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Restaurant',
        name: r.name,
        address: { '@type': 'PostalAddress', streetAddress: r.address, addressLocality: r.city || 'Paris', addressCountry: 'FR' },
        servesCuisine: r.cuisine_type,
      },
    })),
  }

  // FAQ for GEO
  const faqItems = [
    {
      q: `Comment fonctionne une collab TikTok avec un restaurant ${parsed.type === 'cuisine' ? parsed.label : `du ${parsed.label}`} ?`,
      a: `Un créateur vérifié par 2960 Agency réserve un créneau, vient au restaurant avec ses accompagnants (repas offert), filme et publie une vidéo TikTok sous 5 jours. La vidéo reste en ligne au moins 12 mois.`,
    },
    {
      q: 'Combien ça coûte pour un restaurant ?',
      a: `Les 3 premières collaborations sont gratuites, sans engagement ni CB. Ensuite, les formules vont de 69€/mois (Active, 4 collabs) à 119€/mois (Pro, illimité). Le seul coût initial est le repas offert au créateur.`,
    },
    {
      q: 'Les créateurs sont-ils vérifiés ?',
      a: `Oui. Chaque créateur est audité par 2960 Agency avant d'accéder à la plateforme : statistiques, qualité du contenu, sérieux. Un restaurant peut aussi refuser une réservation ou demander la suppression d'une vidéo non conforme.`,
    },
    {
      q: 'Peut-on choisir quel créateur vient ?',
      a: `En mode acceptation automatique (recommandé), les créateurs vérifiés réservent directement. En mode manuel, vous validez chaque profil avant confirmation. Avec la formule Pro, vous pouvez aussi inviter des créateurs spécifiques.`,
    },
  ]

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <div className="min-h-screen" style={{ background: '#F3F4F7', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* Nav */}
      <nav className="flex items-center justify-between px-5 sm:px-8" style={{ height: 64 }}>
        <Link href="/" className="font-buster text-[18px] sm:text-[22px] text-[#1a1a1a]" style={{ textDecoration: 'none' }}>2960 AGENCY</Link>
        <Link href="/inscris-ton-resto" className="font-dm text-[12px] font-semibold px-4 py-2 rounded-full" style={{ background: '#FF6339', color: '#fff', textDecoration: 'none' }}>Inscrire mon resto</Link>
      </nav>

      {/* Hero */}
      <section className="px-5 sm:px-8 pt-12 sm:pt-20 pb-8 sm:pb-12" style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 className="font-dm text-[#1a1a1a] text-[26px] sm:text-[40px] font-bold leading-[1.15] tracking-tight mb-4">
          {pageTitle}
        </h1>
        <p className="font-dm text-[#555] text-[15px] sm:text-[17px] leading-[1.7] mb-6" style={{ maxWidth: 640 }}>
          {pageSubtitle}
        </p>
        {restaurants.length > 0 && (
          <p className="font-dm text-[#999] text-[13px]">{restaurants.length} restaurant{restaurants.length > 1 ? 's' : ''} disponible{restaurants.length > 1 ? 's' : ''}</p>
        )}
      </section>

      {/* Restaurant grid */}
      <section className="px-5 sm:px-8 pb-16" style={{ maxWidth: 900, margin: '0 auto' }}>
        {restaurants.length === 0 ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: '#fff' }}>
            <p className="font-dm text-[#1a1a1a] text-[18px] font-bold mb-3">Pas encore de restaurants ici</p>
            <p className="font-dm text-[#666] text-[14px] mb-6">Soyez le premier restaurant {parsed.type === 'cuisine' ? parsed.label : `du ${parsed.label}`} à rejoindre 2960 Agency.</p>
            <Link href="/inscris-ton-resto" className="inline-block font-dm text-[14px] font-bold rounded-full px-6 py-3" style={{ background: '#FF6339', color: '#fff', textDecoration: 'none' }}>
              Inscrire mon restaurant &rarr;
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {restaurants.map(r => (
              <div key={r.id} className="rounded-2xl overflow-hidden" style={{ background: '#fff' }}>
                {r.photos && r.photos.length > 0 && (
                  <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${r.photos[0]})` }} />
                )}
                <div className="p-5">
                  <h2 className="font-dm text-[#1a1a1a] text-[17px] font-bold mb-1">{r.name}</h2>
                  {r.cuisine_type && <p className="font-dm text-[#6D0040] text-[12px] font-semibold mb-2">{r.cuisine_type}</p>}
                  <p className="font-dm text-[#888] text-[13px] mb-3">{r.address}{r.city ? `, ${r.city}` : ''}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="font-dm text-[11px] px-2 py-0.5 rounded-full" style={{ background: '#F3F4F7', color: '#555' }}>
                      Jusqu&apos;à {r.max_people} pers.
                    </span>
                    {r.virality_tiers && r.virality_tiers.length > 0 && (
                      <span className="font-dm text-[11px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,99,57,0.08)', color: '#FF6339' }}>
                        Prime de viralité
                      </span>
                    )}
                    {r.dietary_options?.map(d => (
                      <span key={d} className="font-dm text-[11px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(109,0,64,0.06)', color: '#6D0040' }}>
                        {dietaryLabel(d)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="px-5 sm:px-8 py-12 sm:py-16 text-center" style={{ background: '#fff' }}>
        <h2 className="font-dm text-[#1a1a1a] text-[22px] sm:text-[28px] font-bold mb-4">
          Vous êtes restaurateur ?
        </h2>
        <p className="font-dm text-[#555] text-[14px] sm:text-[16px] leading-[1.7] mb-6" style={{ maxWidth: 500, margin: '0 auto 24px' }}>
          3 collaborations gratuites pour commencer. Aucune CB, aucun engagement. Des créateurs vérifiés viennent filmer chez vous et publient sur TikTok.
        </p>
        <Link href="/inscris-ton-resto" className="inline-block font-dm text-[14px] font-bold rounded-full px-8 py-3.5" style={{ background: '#FF6339', color: '#fff', textDecoration: 'none' }}>
          Activer mes 3 premières collabs &rarr;
        </Link>
      </section>

      {/* FAQ — GEO optimized */}
      <section className="px-5 sm:px-8 py-12 sm:py-16" style={{ maxWidth: 700, margin: '0 auto' }}>
        <h2 className="font-dm text-[#1a1a1a] text-[20px] sm:text-[24px] font-bold mb-8">Questions fréquentes</h2>
        <div className="space-y-6">
          {faqItems.map((f, i) => (
            <div key={i}>
              <h3 className="font-dm text-[#1a1a1a] text-[15px] font-bold mb-2">{f.q}</h3>
              <p className="font-dm text-[#555] text-[14px] leading-[1.7]">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Internal links — SEO juice */}
      <section className="px-5 sm:px-8 py-12" style={{ background: '#fff' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 className="font-dm text-[#1a1a1a] text-[16px] font-bold mb-4">Explorer par arrondissement</h2>
          <div className="flex flex-wrap gap-2 mb-8">
            {Object.entries(ARRONDISSEMENTS).map(([key, { label }]) => (
              <Link key={key} href={`/restaurants/paris-${key}`} className="font-dm text-[12px] px-3 py-1.5 rounded-full" style={{ background: '#F3F4F7', color: '#6D0040', textDecoration: 'none' }}>
                {label}
              </Link>
            ))}
          </div>
          <h2 className="font-dm text-[#1a1a1a] text-[16px] font-bold mb-4">Explorer par cuisine</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(CUISINES).map(([key, label]) => (
              <Link key={key} href={`/restaurants/${key}-paris`} className="font-dm text-[12px] px-3 py-1.5 rounded-full" style={{ background: '#F3F4F7', color: '#6D0040', textDecoration: 'none' }}>
                {label.charAt(0).toUpperCase() + label.slice(1)}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-5 sm:px-8 py-8 text-center" style={{ borderTop: '1px solid #e5e5e5' }}>
        <Link href="/" className="font-buster text-[14px] text-[#bbb] hover:text-[#888] transition-colors" style={{ textDecoration: 'none' }}>2960 AGENCY</Link>
      </footer>
    </div>
  )
}
