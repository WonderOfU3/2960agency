import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getCreatorSession } from '@/lib/session'
import { notifyReconfirmed } from '@/lib/notifications'

// POST: creator reconfirms a booking (between 5 days and 24h before)
export async function POST(req: NextRequest) {
  // Support both session-based and token-based reconfirmation
  const { bookingId, token } = await req.json()

  let creatorId: number | null = null

  if (token) {
    // Token-based (from email link)
    const result = await sql`
      SELECT b.id, b.creator_id, b.booking_date, b.status, b.reconfirmed_at
      FROM bookings b
      JOIN conversation_tokens ct ON ct.booking_id = b.id
      WHERE ct.token = ${token} AND b.id = ${bookingId}
    `
    if (result.length === 0) {
      return NextResponse.json({ error: 'Réservation non trouvée' }, { status: 404 })
    }
    creatorId = result[0].creator_id
  } else {
    // Session-based (from dashboard)
    const session = await getCreatorSession()
    if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    creatorId = session.id
  }

  try {
    const booking = await sql`
      SELECT id, booking_date, status, reconfirmed_at
      FROM bookings
      WHERE id = ${bookingId} AND creator_id = ${creatorId}
    `
    if (booking.length === 0) {
      return NextResponse.json({ error: 'Réservation non trouvée' }, { status: 404 })
    }

    const b = booking[0]

    if (b.status !== 'confirmed') {
      return NextResponse.json({ error: 'Seules les réservations confirmées peuvent être reconfirmées' }, { status: 400 })
    }

    if (b.reconfirmed_at) {
      return NextResponse.json({ error: 'Déjà reconfirmé', reconfirmedAt: b.reconfirmed_at }, { status: 200 })
    }

    // Check timing: must be between 5 days and 24h before booking
    const now = new Date()
    const dateStr = String(b.booking_date).split('T')[0]
    const [y, m, d] = dateStr.split('-').map(Number)
    const bookingDate = new Date(y, m - 1, d)
    const msUntil = bookingDate.getTime() - now.getTime()
    const daysUntil = msUntil / (1000 * 60 * 60 * 24)

    if (daysUntil > 5) {
      return NextResponse.json({ error: 'Trop tôt pour reconfirmer — possible à partir de 5 jours avant' }, { status: 400 })
    }
    if (daysUntil < 0) {
      return NextResponse.json({ error: 'La date de réservation est passée' }, { status: 400 })
    }

    await sql`
      UPDATE bookings SET reconfirmed_at = NOW() WHERE id = ${bookingId}
    `

    // Notify restaurant
    try {
      const bk = await sql`
        SELECT b.restaurant_id, c.first_name, c.last_name, b.booking_date
        FROM bookings b JOIN creators c ON b.creator_id = c.id
        WHERE b.id = ${bookingId}
      `
      if (bk.length > 0) {
        const dateStr = new Date(bk[0].booking_date).toISOString().split('T')[0]
        await notifyReconfirmed(bk[0].restaurant_id, `${bk[0].first_name} ${bk[0].last_name}`, dateStr)
      }
    } catch (e) { console.error('Reconfirm notification error:', e) }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Reconfirm error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
