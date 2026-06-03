import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getAdminSession } from '@/lib/session'
import { addPoints } from '@/lib/gamification'

export async function GET() {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const disputes = await sql`
      SELECT r.id, r.rating, r.comment, r.created_at, r.booking_id,
             c.first_name || ' ' || c.last_name as creator_name,
             rest.name as restaurant_name
      FROM reviews r
      JOIN bookings b ON r.booking_id = b.id
      JOIN creators c ON b.creator_id = c.id
      JOIN restaurants rest ON b.restaurant_id = rest.id
      WHERE r.disputed = TRUE
      ORDER BY r.created_at DESC
    `
    return NextResponse.json({ disputes })
  } catch (err) {
    console.error('Disputes error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Admin updates a disputed rating
export async function PATCH(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const { reviewId, newRating } = await req.json()
    if (!reviewId || !newRating || newRating < 1 || newRating > 5) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    }

    // Get old rating to adjust points
    const old = await sql`
      SELECT r.rating, b.creator_id, b.id as booking_id
      FROM reviews r JOIN bookings b ON r.booking_id = b.id
      WHERE r.id = ${reviewId}
    `
    if (old.length === 0) return NextResponse.json({ error: 'Avis non trouvé' }, { status: 404 })

    const oldRating = old[0].rating
    const creatorId = old[0].creator_id
    const bookingId = old[0].booking_id

    // Update rating and clear dispute
    await sql`UPDATE reviews SET rating = ${newRating}, disputed = FALSE WHERE id = ${reviewId}`

    // Adjust points: remove old rating points, add new ones
    const RATING_POINTS: Record<number, number> = { 5: 10, 4: 5, 3: 0, 2: -5, 1: -15 }
    const oldDelta = RATING_POINTS[oldRating] ?? 0
    const newDelta = RATING_POINTS[newRating] ?? 0
    const adjustment = newDelta - oldDelta

    if (adjustment !== 0) {
      await addPoints(creatorId, adjustment, 'rating_adjusted', bookingId, `Note ajustée ${oldRating}★ → ${newRating}★`)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Update dispute error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
