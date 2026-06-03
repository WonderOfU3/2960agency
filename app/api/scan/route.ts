import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { createNotification } from '@/lib/notifications'
import { calculateVideoDeadline } from '@/lib/gamification'

// GET: Fetch creator info for scan page (public, token-protected)
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Token manquant' }, { status: 400 })

  try {
    const creator = await sql`
      SELECT c.id, c.first_name, c.last_name, c.display_handle, c.tiktok_username,
             c.level, c.sequential_id, c.batch_number, c.points_total, c.unique_restaurants,
             c.wallet_auth_token
      FROM creators c
      WHERE c.wallet_auth_token = ${token} AND c.status = 'active'
    `
    if (creator.length === 0) {
      return NextResponse.json({ error: 'Créateur non trouvé' }, { status: 404 })
    }

    const c = creator[0]

    // Get today's booking for this creator (if any)
    const todayBooking = await sql`
      SELECT b.id, b.booking_date, r.name as restaurant_name, b.status
      FROM bookings b
      JOIN restaurants r ON b.restaurant_id = r.id
      WHERE b.creator_id = ${c.id}
        AND b.booking_date = CURRENT_DATE
        AND b.status = 'confirmed'
      LIMIT 1
    `

    // Get completed collabs count
    const stats = await sql`
      SELECT COUNT(*) as total FROM bookings WHERE creator_id = ${c.id} AND video_verified_at IS NOT NULL
    `

    // Check if already scanned today
    let alreadyScanned = false
    if (todayBooking.length > 0) {
      const arrival = await sql`
        SELECT id FROM collab_arrivals WHERE booking_id = ${todayBooking[0].id}
      `
      alreadyScanned = arrival.length > 0
    }

    return NextResponse.json({
      id: c.id,
      handle: c.display_handle || c.tiktok_username || `${c.first_name}`,
      firstName: c.first_name,
      lastName: c.last_name,
      level: c.level,
      sequentialId: c.sequential_id,
      batchNumber: c.batch_number,
      collabsCompleted: parseInt(stats[0]?.total || '0'),
      todayBooking: todayBooking.length > 0 ? {
        id: todayBooking[0].id,
        restaurantName: todayBooking[0].restaurant_name,
        alreadyScanned,
      } : null,
    })
  } catch (err) {
    console.error('Scan GET error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST: Validate arrival
export async function POST(req: NextRequest) {
  try {
    const { bookingId, token } = await req.json()
    if (!bookingId || !token) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    // Verify token matches the creator of this booking
    const booking = await sql`
      SELECT b.id, b.creator_id, b.booking_date, b.restaurant_id, b.status,
             c.wallet_auth_token, c.first_name,
             r.name as restaurant_name
      FROM bookings b
      JOIN creators c ON b.creator_id = c.id
      JOIN restaurants r ON b.restaurant_id = r.id
      WHERE b.id = ${bookingId}
    `
    if (booking.length === 0) {
      return NextResponse.json({ error: 'Réservation non trouvée' }, { status: 404 })
    }

    const b = booking[0]
    if (b.wallet_auth_token !== token) {
      return NextResponse.json({ error: 'Token invalide' }, { status: 403 })
    }
    if (b.status !== 'confirmed') {
      return NextResponse.json({ error: 'Cette réservation n\'est pas confirmée' }, { status: 400 })
    }

    // Check not already scanned
    const existing = await sql`SELECT id FROM collab_arrivals WHERE booking_id = ${bookingId}`
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Arrivée déjà validée' }, { status: 400 })
    }

    // Log arrival
    await sql`
      INSERT INTO collab_arrivals (booking_id, creator_id, scanned_by)
      VALUES (${bookingId}, ${b.creator_id}, 'restaurant_scan')
    `

    // Set video deadline from today (not booking date, since arrival = actual collab date)
    const vDeadline = calculateVideoDeadline(new Date())
    await sql`UPDATE bookings SET video_deadline = ${vDeadline.toISOString()} WHERE id = ${bookingId}`

    // Notify creator
    await createNotification({
      recipientType: 'creator',
      recipientId: b.creator_id,
      type: 'arrival_confirmed',
      title: `${b.restaurant_name} t'a accueilli`,
      body: `C'est parti ! Tu as 5 jours pour publier ta vidéo.`,
      link: '/creator/dashboard?tab=bookings',
    })

    return NextResponse.json({ success: true, creatorName: b.first_name })
  } catch (err) {
    console.error('Scan POST error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
