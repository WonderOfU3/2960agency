import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getCreatorSession } from '@/lib/session'
import { sendBookingConfirmation, sendBookingCancelledEmail } from '@/lib/email'
import { notifyNewBooking, notifyBookingCancelled } from '@/lib/notifications'
import { track } from '@/lib/track'
import { nanoid } from 'nanoid'
import { checkCollabBilling, syncCollabUsage } from '@/lib/collab-billing'
import { consumeCredit, handleCreatorCancellation, calculateVideoDeadline } from '@/lib/gamification'

export async function GET() {
  const session = await getCreatorSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const bookings = await sql`
      SELECT
        b.id, b.creator_id, b.restaurant_id, b.time_slot_id, b.booking_date, b.status,
        b.created_at, b.slot_start_time, b.slot_end_time, b.num_people,
        b.reconfirmed_at, b.reminder_sent_at,
        b.post_link, b.post_submitted_at, b.claimed_tier, b.claim_status,
        r.name as restaurant_name,
        r.address as restaurant_address,
        r.city as restaurant_city,
        r.offer_description,
        r.virality_tiers as restaurant_virality_tiers,
        r.subscription as restaurant_subscription,
        ts.start_time,
        ts.end_time,
        ts.day_of_week
      FROM bookings b
      JOIN restaurants r ON b.restaurant_id = r.id
      JOIN time_slots ts ON b.time_slot_id = ts.id
      WHERE b.creator_id = ${session.id}
      ORDER BY b.booking_date DESC
    `

    return NextResponse.json({ bookings })
  } catch (err) {
    console.error('Fetch bookings error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getCreatorSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { bookingId, action } = await req.json()

    if (action === 'cancel') {
      // Only the creator who owns the booking can cancel
      const booking = await sql`
        SELECT b.id, b.status, b.booking_date, b.restaurant_id, b.slot_start_time, ts.start_time
        FROM bookings b
        JOIN time_slots ts ON b.time_slot_id = ts.id
        WHERE b.id = ${bookingId} AND b.creator_id = ${session.id}
      `
      if (booking.length === 0) {
        return NextResponse.json({ error: 'Réservation non trouvée' }, { status: 404 })
      }

      const b = booking[0]
      if (b.status === 'cancelled' || b.status === 'refused') {
        return NextResponse.json({ error: 'Cette réservation est déjà annulée' }, { status: 400 })
      }

      const wasConfirmed = b.status === 'confirmed'

      await sql`UPDATE bookings SET status = 'cancelled' WHERE id = ${bookingId}`

      // Apply gamification cancellation logic (credits + points)
      if (wasConfirmed) {
        // Calculate the booking start datetime
        const bookingDateStr = String(b.booking_date).split('T')[0]
        const startTime = b.slot_start_time || b.start_time || '12:00'
        const bookingStart = new Date(`${bookingDateStr}T${startTime}`)
        await handleCreatorCancellation(session.id, bookingId, bookingStart)
      }

      // Restore restaurant billing counters if the booking was confirmed (non-blocking)
      if (wasConfirmed) {
        try {
          const resto = await sql`
            SELECT trial_started_at, trial_ends_at, trial_collabs_used FROM restaurants WHERE id = ${b.restaurant_id}
          `
          if (resto.length > 0 && resto[0].trial_started_at && resto[0].trial_collabs_used > 0) {
            await sql`
              UPDATE restaurants SET trial_collabs_used = GREATEST(0, trial_collabs_used - 1)
              WHERE id = ${b.restaurant_id}
            `
          }
          await syncCollabUsage(b.restaurant_id, b.booking_date)
        } catch (billingErr) {
          console.error('Billing restore error (booking already cancelled):', billingErr)
        }
      }

      // Notify restaurant (in-app + email)
      try {
        const cr = await sql`SELECT first_name, last_name FROM creators WHERE id = ${session.id}`
        if (cr.length > 0) {
          const creatorName = `${cr[0].first_name} ${cr[0].last_name}`
          await notifyBookingCancelled(b.restaurant_id, creatorName)
          // Send email to restaurant owner
          const ru = await sql`SELECT owner_name, email FROM restaurant_users WHERE restaurant_id = ${b.restaurant_id}`
          if (ru.length > 0) {
            const dateStr = new Date(b.booking_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
            await sendBookingCancelledEmail({ ownerName: ru[0].owner_name, email: ru[0].email, creatorName, bookingDate: dateStr })
          }
        }
      } catch (e) { console.error('Cancel notification error:', e) }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
  } catch (err) {
    console.error('Creator booking action error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getCreatorSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    // Check for overdue posts — block new bookings
    const overdueCheck = await sql`
      SELECT COUNT(*) as cnt FROM bookings
      WHERE creator_id = ${session.id}
        AND post_overdue = true
        AND post_link IS NULL
    `
    if (parseInt(overdueCheck[0].cnt) > 0) {
      return NextResponse.json({
        error: 'Tu as un post en retard. Soumets le lien avant de faire une nouvelle réservation.',
      }, { status: 403 })
    }

    // Check serial cancel block
    const creatorCheck = await sql`
      SELECT serial_cancel_blocked, credits_current FROM creators WHERE id = ${session.id}
    `
    if (creatorCheck.length > 0 && creatorCheck[0].serial_cancel_blocked) {
      return NextResponse.json({
        error: 'Tu as effectué 2 annulations de dernière minute ce mois. Les nouvelles réservations seront disponibles le 1er du mois prochain.',
      }, { status: 403 })
    }
    if (creatorCheck.length > 0 && creatorCheck[0].credits_current <= 0) {
      return NextResponse.json({
        error: 'Tu as utilisé tous tes crédits ce mois. De nouveaux crédits seront disponibles le 1er du mois prochain.',
      }, { status: 403 })
    }

    const { restaurantId, timeSlotId, bookingDate, slotStartTime, slotEndTime, numPeople, source } = await req.json()
    const bookingSource = ['organique', 'moteur_b', 'email_Cx', 'parrainage', 'manual'].includes(source) ? source : 'organique'

    // Validate booking date is max 30 days in advance
    const [y, m, d] = bookingDate.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const maxDate = new Date(today)
    maxDate.setDate(maxDate.getDate() + 30)

    if (date < today) {
      return NextResponse.json({ error: 'La date doit être dans le futur' }, { status: 400 })
    }
    if (date > maxDate) {
      return NextResponse.json({ error: 'Réservation max 30 jours à l\'avance' }, { status: 400 })
    }

    // Check restaurant exists and is published
    const restaurant = await sql`
      SELECT * FROM restaurants WHERE id = ${restaurantId} AND is_published = true
    `
    if (restaurant.length === 0) {
      return NextResponse.json({ error: 'Restaurant non trouvé' }, { status: 404 })
    }
    const resto = restaurant[0]

    // Check time slot exists
    const slot = await sql`
      SELECT * FROM time_slots WHERE id = ${timeSlotId} AND restaurant_id = ${restaurantId} AND is_active = true
    `
    if (slot.length === 0) {
      return NextResponse.json({ error: 'Créneau non trouvé' }, { status: 404 })
    }

    // Check day of week matches
    const bookingDay = date.getDay()
    if (slot[0].day_of_week !== bookingDay) {
      return NextResponse.json({ error: 'Ce créneau n\'est pas disponible ce jour-là' }, { status: 400 })
    }

    // Check overlap availability (1-hour sub-slots)
    if (slotStartTime && slotEndTime) {
      const overlapBookings = await sql`
        SELECT COUNT(*) as count FROM bookings b
        JOIN time_slots ts ON b.time_slot_id = ts.id
        WHERE b.restaurant_id = ${restaurantId}
          AND b.booking_date = ${bookingDate}
          AND b.status != 'cancelled' AND b.status != 'refused'
          AND COALESCE(b.slot_start_time, ts.start_time) < ${slotEndTime}::time
          AND COALESCE(b.slot_end_time, ts.end_time) > ${slotStartTime}::time
      `
      if (parseInt(overlapBookings[0].count) >= slot[0].max_bookings) {
        return NextResponse.json({ error: 'Ce créneau est complet' }, { status: 400 })
      }
    }

    // Check duplicate
    const existing = await sql`
      SELECT id FROM bookings
      WHERE creator_id = ${session.id} AND restaurant_id = ${restaurantId} AND booking_date = ${bookingDate} AND status NOT IN ('cancelled', 'refused')
    `
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Tu as déjà une réservation pour ce restaurant ce jour-là' }, { status: 400 })
    }

    // Check weekly limit (per ISO week: Monday–Sunday)
    if (resto.max_bookings_per_week != null) {
      // Calculate Monday of the booking's week
      const dayOfWeek = date.getDay() // 0=Sun..6=Sat
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() + mondayOffset)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      const wsStr = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`
      const weStr = `${weekEnd.getFullYear()}-${String(weekEnd.getMonth() + 1).padStart(2, '0')}-${String(weekEnd.getDate()).padStart(2, '0')}`

      const weekCount = await sql`
        SELECT COUNT(*) as cnt FROM bookings
        WHERE restaurant_id = ${restaurantId}
          AND booking_date >= ${wsStr}::date AND booking_date <= ${weStr}::date
          AND status != 'cancelled' AND status != 'refused'
      `
      if (parseInt(weekCount[0].cnt) >= resto.max_bookings_per_week) {
        return NextResponse.json({
          error: 'La limite de collabs pour cette semaine est atteinte. Essaie une autre semaine.',
        }, { status: 400 })
      }
    }

    // Check auto_accept and billing
    const autoAccept = resto.auto_accept !== false
    let bookingStatus = 'pending' // default: restaurant must manually accept
    let billingResult: Awaited<ReturnType<typeof checkCollabBilling>> | null = null

    if (autoAccept) {
      // Auto-accept enabled — check billing with the booking date
      billingResult = await checkCollabBilling(restaurantId, bookingDate)

      if (!billingResult.canBook) {
        // Trial expired, no subscription — set to pending so restaurant sees they need a plan
        bookingStatus = 'pending'
      } else if (billingResult.needsPayment) {
        // Over limit — restaurant needs to pay, so set to pending (they'll see it in dashboard)
        bookingStatus = 'pending'
      } else {
        bookingStatus = 'confirmed'
      }
    }

    // Snapshot virality tiers at booking time (lock rule)
    const bookedTiers = resto.virality_tiers && Array.isArray(resto.virality_tiers) && resto.virality_tiers.length > 0
      ? JSON.stringify(resto.virality_tiers) : null

    const bookingResult = await sql`
      INSERT INTO bookings (creator_id, restaurant_id, time_slot_id, booking_date, status, slot_start_time, slot_end_time, num_people, source, booked_virality_tiers)
      VALUES (${session.id}, ${restaurantId}, ${timeSlotId}, ${bookingDate}, ${bookingStatus},
              ${slotStartTime || null}, ${slotEndTime || null}, ${numPeople || 1}, ${bookingSource}, ${bookedTiers}::jsonb)
      RETURNING id
    `
    track({ event: 'reservation_lancee', userId: session.id, userType: 'creator', metadata: { restaurantId, bookingId: bookingResult[0].id } })

    // Consume a credit if auto-confirmed
    if (bookingStatus === 'confirmed') {
      await consumeCredit(session.id)
      // Set video deadline
      const vDeadline = calculateVideoDeadline(date)
      await sql`UPDATE bookings SET video_deadline = ${vDeadline.toISOString()} WHERE id = ${bookingResult[0].id}`
      track({ event: 'reservation_confirmee', userId: session.id, userType: 'creator', metadata: { restaurantId, bookingId: bookingResult[0].id, source: bookingSource } })
    }

    // If auto-confirmed as a trial collab, increment trial_collabs_used
    if (bookingStatus === 'confirmed' && billingResult?.onTrial) {
      const rid = Number(restaurantId)
      await sql`
        UPDATE restaurants
        SET trial_collabs_used = COALESCE(trial_collabs_used, 0) + 1
        WHERE id = ${rid}
      `
    }

    // Sync collab usage by counting confirmed bookings (race-condition safe)
    if (bookingStatus === 'confirmed' && !billingResult?.onTrial) {
      await syncCollabUsage(restaurantId, bookingDate)
    }

    // Create conversation token
    const convToken = nanoid(32)
    await sql`
      INSERT INTO conversation_tokens (token, booking_id)
      VALUES (${convToken}, ${bookingResult[0].id})
    `

    // Get creator details for email
    const creator = await sql`
      SELECT first_name, last_name, email, phone, tiktok_username FROM creators WHERE id = ${session.id}
    `

    // Get restaurant owner's email from business_applications
    let restaurantEmail: string | null = null
    let restaurantOwner: string | null = null
    if (resto.business_application_id) {
      const bizApp = await sql`
        SELECT email, owner_name FROM business_applications WHERE id = ${resto.business_application_id}
      `
      if (bizApp.length > 0) {
        restaurantEmail = bizApp[0].email
        restaurantOwner = bizApp[0].owner_name
      }
    }

    // Send emails (non-blocking — booking is already created)
    try {
      const DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://2960agency.com'
      await sendBookingConfirmation({
        creatorName: `${creator[0].first_name} ${creator[0].last_name}`,
        creatorEmail: creator[0].email,
        creatorPhone: creator[0].phone,
        creatorTiktok: creator[0].tiktok_username || '',
        restaurantName: resto.name,
        restaurantAddress: resto.address,
        restaurantCity: resto.city,
        restaurantEmail,
        restaurantOwner,
        conversationUrl: `${appUrl}/conversation/${convToken}`,
        bookingDate: `${DAYS[date.getDay()]} ${date.toLocaleDateString('fr-FR')}`,
        timeSlot: slotStartTime && slotEndTime
          ? `${slotStartTime.slice(0, 5)} - ${slotEndTime.slice(0, 5)}`
          : `${slot[0].start_time.slice(0, 5)} - ${slot[0].end_time.slice(0, 5)}`,
        offerDescription: resto.offer_description,
      })
    } catch (emailErr) {
      console.error('Email send error (booking already created):', emailErr)
    }

    // In-app notification for restaurant
    try {
      const DAYS_SHORT = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
      await notifyNewBooking(
        `${creator[0].first_name} ${creator[0].last_name}`,
        restaurantId,
        `${DAYS_SHORT[date.getDay()]} ${date.toLocaleDateString('fr-FR')}`
      )
    } catch (notifErr) {
      console.error('Notification error:', notifErr)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Create booking error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
