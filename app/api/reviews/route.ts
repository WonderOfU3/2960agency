import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getCreatorSession, getRestaurantSession } from '@/lib/session'

// GET: fetch reviews for a booking
export async function GET(req: NextRequest) {
  const creator = await getCreatorSession()
  const restaurant = await getRestaurantSession()
  if (!creator && !restaurant) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const bookingId = req.nextUrl.searchParams.get('bookingId')
  const targetType = req.nextUrl.searchParams.get('targetType') // 'creator' | 'restaurant'
  const targetId = req.nextUrl.searchParams.get('targetId')

  try {
    // Get reviews for a specific booking
    if (bookingId) {
      const reviews = await sql`
        SELECT * FROM reviews WHERE booking_id = ${parseInt(bookingId)}
      `
      return NextResponse.json({ reviews })
    }

    // Get average rating for a target (creator or restaurant)
    if (targetType && targetId) {
      const stats = await sql`
        SELECT
          COUNT(*)::int as review_count,
          ROUND(AVG(rating), 1)::float as avg_rating
        FROM reviews r
        JOIN bookings b ON r.booking_id = b.id
        WHERE r.reviewer_type = ${targetType === 'creator' ? 'restaurant' : 'creator'}
          AND ${targetType === 'creator' ? sql`b.creator_id = ${parseInt(targetId)}` : sql`b.restaurant_id = ${parseInt(targetId)}`}
      `
      return NextResponse.json(stats[0] || { review_count: 0, avg_rating: null })
    }

    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
  } catch (err) {
    console.error('Reviews fetch error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST: submit a review
export async function POST(req: NextRequest) {
  const creator = await getCreatorSession()
  const restaurant = await getRestaurantSession()
  if (!creator && !restaurant) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { bookingId, rating, comment } = await req.json()

    if (!bookingId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    }

    // Verify the booking exists and is completed
    const booking = await sql`
      SELECT id, creator_id, restaurant_id, status FROM bookings WHERE id = ${bookingId}
    `
    if (booking.length === 0) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 })
    }
    if (booking[0].status !== 'completed') {
      return NextResponse.json({ error: 'La collab doit être terminée pour laisser un avis' }, { status: 400 })
    }

    const reviewerType = creator ? 'creator' : 'restaurant'
    const reviewerId = creator ? creator.id : restaurant!.id

    // Verify the reviewer is part of this booking
    if (creator && booking[0].creator_id !== creator.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }
    if (restaurant && booking[0].restaurant_id !== restaurant.restaurantId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    // Check if already reviewed
    const existing = await sql`
      SELECT id FROM reviews WHERE booking_id = ${bookingId} AND reviewer_type = ${reviewerType}
    `
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Vous avez déjà laissé un avis pour cette collab' }, { status: 400 })
    }

    await sql`
      INSERT INTO reviews (booking_id, reviewer_type, reviewer_id, rating, comment)
      VALUES (${bookingId}, ${reviewerType}, ${reviewerId}, ${rating}, ${comment || null})
    `

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Review submit error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
