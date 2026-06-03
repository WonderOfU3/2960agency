import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getRestaurantSession } from '@/lib/session'
import { applyRatingPoints } from '@/lib/gamification'
import { createNotification } from '@/lib/notifications'

export async function POST(req: NextRequest) {
  const session = await getRestaurantSession()
  if (!session || !session.restaurantId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { bookingId, rating, comment } = await req.json()

    if (!bookingId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    }

    // 1★ or 2★ requires a comment
    if (rating <= 2 && (!comment || !comment.trim())) {
      return NextResponse.json({ error: 'Un commentaire est obligatoire pour une note de 1 ou 2 étoiles' }, { status: 400 })
    }

    // Verify booking belongs to this restaurant and has video_verified_at
    const booking = await sql`
      SELECT b.id, b.creator_id, b.video_verified_at, c.first_name
      FROM bookings b
      JOIN creators c ON b.creator_id = c.id
      WHERE b.id = ${bookingId} AND b.restaurant_id = ${session.restaurantId}
    `
    if (booking.length === 0) {
      return NextResponse.json({ error: 'Réservation non trouvée' }, { status: 404 })
    }

    const b = booking[0]
    if (!b.video_verified_at) {
      return NextResponse.json({ error: 'La vidéo n\'a pas encore été vérifiée' }, { status: 400 })
    }

    // Check rating deadline (7 days after video_verified_at)
    const deadline = new Date(b.video_verified_at)
    deadline.setDate(deadline.getDate() + 7)
    if (new Date() > deadline) {
      return NextResponse.json({ error: 'Le délai de notation est dépassé' }, { status: 400 })
    }

    // Check if already rated
    const existing = await sql`
      SELECT id FROM reviews WHERE booking_id = ${bookingId} AND reviewer_type = 'restaurant'
    `
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Cette collab a déjà été notée' }, { status: 400 })
    }

    // Insert rating
    await sql`
      INSERT INTO reviews (booking_id, reviewer_type, reviewer_id, rating, comment, deadline)
      VALUES (${bookingId}, 'restaurant', ${session.restaurantId}, ${rating}, ${comment || null}, ${deadline.toISOString()})
    `

    // Apply points
    await applyRatingPoints(b.creator_id, rating, bookingId)

    // Notify creator
    await createNotification({
      recipientType: 'creator',
      recipientId: b.creator_id,
      type: 'rating_received',
      title: `Note reçue : ${rating}★`,
      body: `${session.businessName} vous a donné ${rating}/5${rating <= 2 ? ' — vous pouvez contester dans les 7 jours' : ''}`,
      link: '/creator/dashboard?tab=bookings',
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Rating error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * GET: Fetch bookings awaiting rating for this restaurant.
 */
export async function GET() {
  const session = await getRestaurantSession()
  if (!session || !session.restaurantId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const pendingRatings = await sql`
      SELECT b.id as booking_id, b.booking_date, b.video_verified_at,
             c.first_name, c.last_name, c.tiktok_username,
             b.post_link,
             (b.video_verified_at + INTERVAL '7 days') as deadline
      FROM bookings b
      JOIN creators c ON b.creator_id = c.id
      LEFT JOIN reviews r ON r.booking_id = b.id AND r.reviewer_type = 'restaurant'
      WHERE b.restaurant_id = ${session.restaurantId}
        AND b.video_verified_at IS NOT NULL
        AND r.id IS NULL
        AND b.video_verified_at + INTERVAL '7 days' > NOW()
      ORDER BY b.video_verified_at ASC
    `

    return NextResponse.json({ pendingRatings })
  } catch (err) {
    console.error('Pending ratings error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
