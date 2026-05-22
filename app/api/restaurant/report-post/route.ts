import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getRestaurantSession } from '@/lib/session'
import { notifyAdminReport } from '@/lib/notifications'

export async function POST(req: NextRequest) {
  const session = await getRestaurantSession()
  if (!session || !session.restaurantId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { bookingId, reason } = await req.json()

    const [booking] = await sql`
      SELECT b.id, b.post_link, b.reported_by_restaurant,
             c.first_name, c.last_name
      FROM bookings b
      JOIN creators c ON b.creator_id = c.id
      WHERE b.id = ${bookingId} AND b.restaurant_id = ${session.restaurantId}
    `
    if (!booking) {
      return NextResponse.json({ error: 'Réservation non trouvée' }, { status: 404 })
    }
    if (!booking.post_link) {
      return NextResponse.json({ error: 'Aucun post soumis' }, { status: 400 })
    }
    if (booking.reported_by_restaurant) {
      return NextResponse.json({ error: 'Déjà signalé' }, { status: 409 })
    }

    await sql`
      UPDATE bookings
      SET reported_by_restaurant = true,
          report_reason = ${(reason || '').slice(0, 500)},
          reported_at = NOW()
      WHERE id = ${bookingId}
    `

    await notifyAdminReport(
      session.businessName || 'Restaurant',
      `${booking.first_name} ${booking.last_name}`,
      bookingId
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Report post error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
