import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { sendBookingReminder, sendCreatorRdv } from '@/lib/email'
import { notifyBookingReminder, notifyPostDeadlineWarning, notifyPostOverdue, notifyRestaurantPostOverdue, notifyCreatorSuspended } from '@/lib/notifications'

// Call this endpoint daily via external cron (e.g. Vercel Cron, cron-job.org)
// GET /api/cron/reminders?secret=YOUR_CRON_SECRET

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    // 1. Send reminders for bookings that are 5 days away and haven't been reminded yet
    const toRemind = await sql`
      SELECT b.id, b.booking_date, b.creator_id, b.restaurant_id,
             b.slot_start_time, b.slot_end_time,
             c.first_name, c.last_name, c.email as creator_email,
             r.name as restaurant_name, r.address as restaurant_address, r.city as restaurant_city,
             r.offer_description,
             ts.start_time, ts.end_time,
             ct.token
      FROM bookings b
      JOIN creators c ON b.creator_id = c.id
      JOIN restaurants r ON b.restaurant_id = r.id
      JOIN time_slots ts ON b.time_slot_id = ts.id
      LEFT JOIN conversation_tokens ct ON ct.booking_id = b.id
      WHERE b.status = 'confirmed'
        AND b.reconfirmed_at IS NULL
        AND b.reminder_sent_at IS NULL
        AND b.booking_date <= CURRENT_DATE + INTERVAL '5 days'
        AND b.booking_date > CURRENT_DATE + INTERVAL '1 day'
    `

    let remindersSent = 0
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://2960agency.com'

    for (const b of toRemind) {
      const [y, m, d] = b.booking_date.split('-').map(Number)
      const bookingDate = new Date(y, m - 1, d)
      const DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

      await sendBookingReminder({
        creatorName: `${b.first_name} ${b.last_name}`,
        creatorEmail: b.creator_email,
        restaurantName: b.restaurant_name,
        restaurantAddress: b.restaurant_address,
        restaurantCity: b.restaurant_city,
        bookingDate: `${DAYS[bookingDate.getDay()]} ${bookingDate.toLocaleDateString('fr-FR')}`,
        timeSlot: b.slot_start_time && b.slot_end_time
          ? `${b.slot_start_time.slice(0, 5)} - ${b.slot_end_time.slice(0, 5)}`
          : `${b.start_time.slice(0, 5)} - ${b.end_time.slice(0, 5)}`,
        offerDescription: b.offer_description,
        reconfirmUrl: `${appUrl}/api/creator/bookings/reconfirm-link?bookingId=${b.id}&token=${b.token}`,
      })

      await notifyBookingReminder(
        b.creator_id,
        b.restaurant_name,
        `${DAYS[bookingDate.getDay()]} ${bookingDate.toLocaleDateString('fr-FR')}`
      )

      await sql`UPDATE bookings SET reminder_sent_at = NOW() WHERE id = ${b.id}`
      remindersSent++
    }

    // 2. Auto-cancel bookings that are less than 24h away and not reconfirmed
    const toCancel = await sql`
      UPDATE bookings
      SET status = 'cancelled'
      WHERE status = 'confirmed'
        AND reconfirmed_at IS NULL
        AND reminder_sent_at IS NOT NULL
        AND booking_date <= CURRENT_DATE + INTERVAL '1 day'
        AND booking_date >= CURRENT_DATE
      RETURNING id, creator_id, restaurant_id
    `

    // 3. Post deadline warning — J+3 after booking (2 days before J+5 deadline)
    const toWarn = await sql`
      SELECT b.id, b.creator_id, r.name as restaurant_name
      FROM bookings b
      JOIN restaurants r ON b.restaurant_id = r.id
      WHERE b.status IN ('confirmed', 'completed')
        AND b.post_link IS NULL
        AND b.post_deadline_notified = false
        AND b.booking_date <= CURRENT_DATE - INTERVAL '3 days'
        AND b.booking_date > CURRENT_DATE - INTERVAL '5 days'
    `
    let deadlineWarnings = 0
    for (const b of toWarn) {
      await notifyPostDeadlineWarning(b.creator_id, b.restaurant_name)
      await sql`UPDATE bookings SET post_deadline_notified = true WHERE id = ${b.id}`
      deadlineWarnings++
    }

    // 4. Post overdue — J+5 passed, no post submitted
    const overdue = await sql`
      SELECT b.id, b.creator_id, b.restaurant_id, r.name as restaurant_name
      FROM bookings b
      JOIN restaurants r ON b.restaurant_id = r.id
      WHERE b.status IN ('confirmed', 'completed')
        AND b.post_link IS NULL
        AND b.post_overdue = false
        AND b.booking_date <= CURRENT_DATE - INTERVAL '5 days'
    `
    let overdueCount = 0
    for (const b of overdue) {
      // Mark booking as overdue
      await sql`UPDATE bookings SET post_overdue = true WHERE id = ${b.id}`

      // Increment creator violations
      await sql`UPDATE creators SET post_violations = COALESCE(post_violations, 0) + 1 WHERE id = ${b.creator_id}`

      // Get updated violation count
      const [creator] = await sql`SELECT post_violations FROM creators WHERE id = ${b.creator_id}`
      const violations = creator?.post_violations || 1

      // Notify creator
      await notifyPostOverdue(b.creator_id, b.restaurant_name, violations)

      // Notify restaurant
      await notifyRestaurantPostOverdue(b.restaurant_id, b.creator_id)

      // 3 strikes → suspend
      if (violations >= 3) {
        await sql`UPDATE creators SET status = 'blocked' WHERE id = ${b.creator_id}`
        await notifyCreatorSuspended(b.creator_id)
      }

      overdueCount++
    }

    // 5. C-RDV email — sent the day before a booking
    const toRdv = await sql`
      SELECT b.id, b.booking_date, b.slot_start_time, b.slot_end_time,
             c.first_name, c.email as creator_email,
             r.name as restaurant_name, r.address as restaurant_address, r.city as restaurant_city,
             ts.start_time, ts.end_time
      FROM bookings b
      JOIN creators c ON b.creator_id = c.id
      JOIN restaurants r ON b.restaurant_id = r.id
      JOIN time_slots ts ON b.time_slot_id = ts.id
      WHERE b.status = 'confirmed'
        AND b.booking_date = CURRENT_DATE + INTERVAL '1 day'
        AND b.rdv_sent_at IS NULL
    `

    let rdvSent = 0
    for (const b of toRdv) {
      const timeSlot = b.slot_start_time && b.slot_end_time
        ? `${b.slot_start_time.slice(0, 5)} - ${b.slot_end_time.slice(0, 5)}`
        : `${b.start_time.slice(0, 5)} - ${b.end_time.slice(0, 5)}`

      await sendCreatorRdv({
        firstName: b.first_name,
        email: b.creator_email,
        restoName: b.restaurant_name,
        heure: timeSlot,
        adresse: `${b.restaurant_address}, ${b.restaurant_city}`,
      })

      await sql`UPDATE bookings SET rdv_sent_at = NOW() WHERE id = ${b.id}`
      rdvSent++
    }

    return NextResponse.json({
      remindersSent,
      bookingsCancelled: toCancel.length,
      deadlineWarnings,
      overdueCount,
      rdvSent,
    })
  } catch (err) {
    console.error('Cron reminders error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
