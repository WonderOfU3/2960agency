import type { MetadataRoute } from 'next'
import sql from '@/lib/db'

const BASE = 'https://2960agency.com'

const ARRONDISSEMENTS = [
  '1er', '2e', '3e', '4e', '5e', '6e', '7e', '8e', '9e', '10e',
  '11e', '12e', '13e', '14e', '15e', '16e', '17e', '18e', '19e', '20e',
]

const CUISINES = [
  'francais', 'italien', 'japonais', 'chinois', 'libanais', 'thai',
  'indien', 'mexicain', 'coreen', 'vietnamien', 'marocain', 'turc',
  'americain', 'africain', 'peruvien', 'grec', 'espagnol', 'brunch',
  'burger', 'pizza', 'sushi', 'ramen', 'poke', 'healthy', 'vegan',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/inscris-ton-resto`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/creator`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/business`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/tarifs`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/legal/mentions`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE}/legal/cgu-creators`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE}/legal/cguv-restaurants`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE}/legal/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ]

  // Programmatic: arrondissement pages
  const arrondissementPages: MetadataRoute.Sitemap = ARRONDISSEMENTS.map(arr => ({
    url: `${BASE}/restaurants/paris-${arr}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Programmatic: cuisine pages
  const cuisinePages: MetadataRoute.Sitemap = CUISINES.map(c => ({
    url: `${BASE}/restaurants/${c}-paris`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Programmatic: individual restaurant pages (published only)
  let restoPages: MetadataRoute.Sitemap = []
  try {
    const restos = await sql`
      SELECT id, name, updated_at FROM restaurants
      WHERE is_published = true
      ORDER BY id
    `
    restoPages = restos.map((r) => ({
      url: `${BASE}/restaurants/${r.id}`,
      lastModified: new Date(r.updated_at || now),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch { /* DB not available at build time */ }

  // Creators hub
  const creatorPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/createurs/paris`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
  ]

  return [...staticPages, ...arrondissementPages, ...cuisinePages, ...restoPages, ...creatorPages]
}
