import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getAdminSession } from '@/lib/session'

export async function GET() {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const bookings = await sql`
      SELECT
        b.id, b.booking_date, b.status, b.created_at,
        b.slot_start_time, b.slot_end_time,
        b.post_link, b.post_submitted_at, b.reconfirmed_at,
        b.claimed_tier, b.claim_status,
        c.first_name as creator_first_name,
        c.last_name as creator_last_name,
        c.email as creator_email,
        c.tiktok_username as creator_tiktok,
        r.name as restaurant_name,
        r.city as restaurant_city
      FROM bookings b
      JOIN creators c ON b.creator_id = c.id
      JOIN restaurants r ON b.restaurant_id = r.id
      ORDER BY b.created_at DESC
      LIMIT 200
    `
    return NextResponse.json({ bookings })
  } catch (err) {
    console.error('Admin collabs error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
