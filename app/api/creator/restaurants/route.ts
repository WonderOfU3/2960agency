import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getCreatorSession } from '@/lib/session'

export async function GET() {
  const session = await getCreatorSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const restaurants = await sql`
      SELECT
        r.id, r.name, r.cuisine_type, r.address, r.city, r.arrondissement,
        r.photos, r.offer_description, r.virality_bonus, r.virality_tiers,
        r.max_bookings_per_week, r.max_bookings_per_day,
        r.max_people, r.is_blocked, r.is_published,
        COALESCE(
          json_agg(
            json_build_object(
              'id', ts.id,
              'day_of_week', ts.day_of_week,
              'start_time', ts.start_time,
              'end_time', ts.end_time,
              'max_bookings', ts.max_bookings,
              'specific_date', ts.specific_date
            )
          ) FILTER (WHERE ts.id IS NOT NULL AND ts.is_active = true),
          '[]'
        ) as time_slots
      FROM restaurants r
      LEFT JOIN time_slots ts ON r.id = ts.restaurant_id
      WHERE r.is_published = true AND (r.is_blocked IS NULL OR r.is_blocked = false)
      GROUP BY r.id
      ORDER BY r.created_at DESC
    `

    return NextResponse.json({ restaurants })
  } catch (err) {
    console.error('Fetch restaurants error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
