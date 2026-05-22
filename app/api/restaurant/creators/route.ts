import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getRestaurantSession } from '@/lib/session'

export async function GET() {
  const session = await getRestaurantSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const creators = await sql`
      SELECT
        creators.id, creators.username, creators.first_name, creators.last_name,
        creators.tiktok_username, creators.instagram_username,
        creators.showcase_posts, creators.niche,
        ca.city, ca.audience_size
      FROM creators
      LEFT JOIN creator_applications ca ON creators.application_id = ca.id
      WHERE creators.status = 'active'
        AND creators.username IS NOT NULL
        AND creators.niche IS NOT NULL AND array_length(creators.niche, 1) > 0
        AND creators.showcase_posts IS NOT NULL AND array_length(creators.showcase_posts, 1) > 0
      ORDER BY creators.created_at DESC
    `
    return NextResponse.json({ creators })
  } catch (err) {
    console.error('Fetch creators error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
