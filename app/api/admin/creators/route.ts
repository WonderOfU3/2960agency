import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getAdminSession } from '@/lib/session'

export async function GET() {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const creators = await sql`
      SELECT
        c.id, c.created_at, c.email, c.phone,
        c.first_name, c.last_name,
        c.tiktok_username, c.instagram_username,
        c.city, c.ambassador_code,
        c.referral_count, c.reward_status, c.status,
        c.application_id
      FROM creators c
      ORDER BY c.created_at DESC
    `

    return NextResponse.json({ creators })
  } catch (err) {
    console.error('Fetch creators error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
