import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getCreatorSession } from '@/lib/session'

export async function GET() {
  const session = await getCreatorSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const creator = await sql`
      SELECT
        id, username, first_name, last_name, email, phone,
        tiktok_username, instagram_username, city,
        ambassador_code, referral_count, reward_status, status,
        COALESCE(post_violations, 0) as post_violations
      FROM creators
      WHERE id = ${session.id}
    `

    if (creator.length === 0) {
      return NextResponse.json({ error: 'Créateur non trouvé' }, { status: 404 })
    }

    return NextResponse.json({ creator: creator[0] })
  } catch (err) {
    console.error('Fetch profile error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
