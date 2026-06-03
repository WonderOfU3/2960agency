import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getAdminSession } from '@/lib/session'

export async function GET() {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const collabs = await sql`
      SELECT b.id, b.booking_date, b.post_link,
             c.first_name || ' ' || c.last_name as creator_name,
             r.name as restaurant_name
      FROM bookings b
      JOIN creators c ON b.creator_id = c.id
      JOIN restaurants r ON b.restaurant_id = r.id
      WHERE b.post_link IS NOT NULL
        AND b.video_verified_at IS NULL
        AND b.status IN ('confirmed', 'completed')
      ORDER BY b.post_submitted_at ASC
    `
    return NextResponse.json({ collabs })
  } catch (err) {
    console.error('Collabs to verify error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
