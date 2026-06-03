import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getCreatorSession } from '@/lib/session'
import { createNotification } from '@/lib/notifications'

export async function POST(req: NextRequest) {
  const session = await getCreatorSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { reviewId } = await req.json()

    // Verify the review exists, belongs to this creator, is 1-2★, and within 7 days
    const review = await sql`
      SELECT r.id, r.rating, r.created_at, r.disputed, r.comment,
             b.creator_id, b.restaurant_id,
             rest.name as restaurant_name
      FROM reviews r
      JOIN bookings b ON r.booking_id = b.id
      JOIN restaurants rest ON b.restaurant_id = rest.id
      WHERE r.id = ${reviewId}
        AND b.creator_id = ${session.id}
        AND r.reviewer_type = 'restaurant'
    `

    if (review.length === 0) {
      return NextResponse.json({ error: 'Avis non trouvé' }, { status: 404 })
    }

    const rv = review[0]

    if (rv.rating > 2) {
      return NextResponse.json({ error: 'Seules les notes de 1 ou 2 étoiles peuvent être contestées' }, { status: 400 })
    }

    if (rv.disputed) {
      return NextResponse.json({ error: 'Cette note a déjà été contestée' }, { status: 400 })
    }

    // Check 7-day dispute window
    const disputeDeadline = new Date(rv.created_at)
    disputeDeadline.setDate(disputeDeadline.getDate() + 7)
    if (new Date() > disputeDeadline) {
      return NextResponse.json({ error: 'Le délai de contestation (7 jours) est dépassé' }, { status: 400 })
    }

    // Mark as disputed
    await sql`UPDATE reviews SET disputed = TRUE WHERE id = ${reviewId}`

    // Notify admin
    await createNotification({
      recipientType: 'admin',
      recipientId: 1,
      type: 'rating_disputed',
      title: 'Note contestée',
      body: `${session.firstName} ${session.lastName} conteste une note de ${rv.rating}★ de ${rv.restaurant_name}${rv.comment ? ` — commentaire: "${rv.comment}"` : ''}`,
      link: '/admin/dashboard',
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Dispute error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
