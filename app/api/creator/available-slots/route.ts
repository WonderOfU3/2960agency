import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getCreatorSession } from '@/lib/session'
import { generateSubSlots, slotsOverlap } from '@/lib/slots'

export async function GET(req: NextRequest) {
  const session = await getCreatorSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const restaurantId = req.nextUrl.searchParams.get('restaurantId')
  const date = req.nextUrl.searchParams.get('date') // YYYY-MM-DD

  if (!restaurantId || !date) {
    return NextResponse.json({ error: 'restaurantId and date required' }, { status: 400 })
  }

  try {
    const [y, m, day] = date.split('-').map(Number)
    const d = new Date(y, m - 1, day)
    const dayOfWeek = d.getDay()

    // Get matching time slots (recurring by day_of_week OR specific date)
    const timeSlots = await sql`
      SELECT id, start_time, end_time, max_bookings
      FROM time_slots
      WHERE restaurant_id = ${parseInt(restaurantId)}
        AND is_active = true
        AND (
          (specific_date IS NULL AND day_of_week = ${dayOfWeek})
          OR specific_date = ${date}
        )
    `

    if (timeSlots.length === 0) {
      return NextResponse.json({ slots: [], maxPeople: 2 })
    }

    // Get existing bookings for this restaurant + date
    const bookings = await sql`
      SELECT slot_start_time, slot_end_time, time_slot_id, b.status,
             ts.start_time as parent_start, ts.end_time as parent_end
      FROM bookings b
      JOIN time_slots ts ON b.time_slot_id = ts.id
      WHERE b.restaurant_id = ${parseInt(restaurantId)}
        AND b.booking_date = ${date}
        AND b.status != 'cancelled'
        AND b.status != 'refused'
    `

    // Get restaurant max_people
    const resto = await sql`
      SELECT max_people FROM restaurants WHERE id = ${parseInt(restaurantId)}
    `
    const maxPeople = resto[0]?.max_people || 2

    // Generate sub-slots for each time slot and check availability
    const allSlots: { start: string; end: string; available: boolean; timeSlotId: number }[] = []

    for (const ts of timeSlots) {
      const startTime = ts.start_time.slice(0, 5)
      const endTime = ts.end_time.slice(0, 5)
      const subSlots = generateSubSlots(startTime, endTime)

      for (const sub of subSlots) {
        // Count overlapping bookings for this parent time slot
        let overlapCount = 0
        for (const bk of bookings) {
          // Use actual sub-slot times if available, otherwise fall back to parent slot
          const bkStart = bk.slot_start_time ? bk.slot_start_time.slice(0, 5) : bk.parent_start.slice(0, 5)
          const bkEnd = bk.slot_end_time ? bk.slot_end_time.slice(0, 5) : bk.parent_end.slice(0, 5)

          if (slotsOverlap(sub.start, sub.end, bkStart, bkEnd)) {
            overlapCount++
          }
        }

        allSlots.push({
          start: sub.start,
          end: sub.end,
          available: overlapCount < ts.max_bookings,
          timeSlotId: ts.id,
        })
      }
    }

    return NextResponse.json({ slots: allSlots, maxPeople })
  } catch (err) {
    console.error('Available slots error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
