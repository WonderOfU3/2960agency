import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getAdminSession } from '@/lib/session'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { id } = await params
    const restoId = parseInt(id)
    const body = await req.json()

    // Delete a slot
    if (body.action === 'delete') {
      const slotId = parseInt(body.slotId)
      console.log('Deleting slot', slotId, 'from restaurant', restoId)
      await sql`DELETE FROM time_slots WHERE id = ${slotId}`
      return NextResponse.json({ success: true })
    }

    // Add a recurring weekly slot
    if (body.action === 'add_recurring') {
      await sql`
        INSERT INTO time_slots (restaurant_id, day_of_week, start_time, end_time, max_bookings, is_active)
        VALUES (${restoId}, ${body.dayOfWeek}, ${body.startTime}, ${body.endTime}, ${body.maxBookings || 1}, true)
      `
      return NextResponse.json({ success: true })
    }

    // Add a specific date slot
    if (body.action === 'add_date') {
      // Use day_of_week from the actual date
      const date = new Date(body.date)
      const dayOfWeek = date.getDay()
      await sql`
        INSERT INTO time_slots (restaurant_id, day_of_week, start_time, end_time, max_bookings, is_active, specific_date)
        VALUES (${restoId}, ${dayOfWeek}, ${body.startTime}, ${body.endTime}, ${body.maxBookings || 1}, true, ${body.date})
      `
      return NextResponse.json({ success: true })
    }

    // Legacy: add slot (backwards compatible)
    const { dayOfWeek, startTime, endTime, maxBookings } = body
    await sql`
      INSERT INTO time_slots (restaurant_id, day_of_week, start_time, end_time, max_bookings)
      VALUES (${restoId}, ${dayOfWeek}, ${startTime}, ${endTime}, ${maxBookings || 1})
    `

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Slot error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
