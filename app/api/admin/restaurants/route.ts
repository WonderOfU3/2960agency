import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getAdminSession } from '@/lib/session'

export async function GET() {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`

    const restaurants = await sql`
      SELECT
        r.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', ts.id,
              'day_of_week', ts.day_of_week,
              'start_time', ts.start_time,
              'end_time', ts.end_time,
              'max_bookings', ts.max_bookings,
              'is_active', ts.is_active,
              'specific_date', ts.specific_date
            )
          ) FILTER (WHERE ts.id IS NOT NULL),
          '[]'
        ) as time_slots,
        COALESCE((SELECT cu.completed_count FROM collab_usage cu WHERE cu.restaurant_id = r.id AND cu.month = ${currentMonth}), 0)::int as month_usage
      FROM restaurants r
      LEFT JOIN time_slots ts ON r.id = ts.restaurant_id
      GROUP BY r.id
      ORDER BY r.created_at DESC
    `

    return NextResponse.json({ restaurants })
  } catch (err) {
    console.error('Fetch restaurants error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const body = await req.json()

    const result = await sql`
      INSERT INTO restaurants (
        name, cuisine_type, address, city, arrondissement,
        photos, offer_description, virality_bonus,
        max_bookings_per_week, max_bookings_per_day,
        is_published
      ) VALUES (
        ${body.name}, ${body.cuisineType}, ${body.address}, ${body.city}, ${body.arrondissement || null},
        ${body.photos || []}, ${body.offerDescription}, ${body.viralityBonus || null},
        ${body.maxBookingsPerWeek || 3}, ${body.maxBookingsPerDay || 1},
        ${body.isPublished || false}
      )
      RETURNING id
    `

    // Add time slots if provided
    if (body.timeSlots && body.timeSlots.length > 0) {
      for (const slot of body.timeSlots) {
        await sql`
          INSERT INTO time_slots (restaurant_id, day_of_week, start_time, end_time, max_bookings)
          VALUES (${result[0].id}, ${slot.dayOfWeek}, ${slot.startTime}, ${slot.endTime}, ${slot.maxBookings || 1})
        `
      }
    }

    return NextResponse.json({ success: true, id: result[0].id })
  } catch (err) {
    console.error('Create restaurant error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
