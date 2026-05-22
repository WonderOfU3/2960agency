import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getCreatorSession } from '@/lib/session'

export async function POST(req: NextRequest) {
  const session = await getCreatorSession()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const { bookingId, postLink } = await req.json()

    if (!bookingId || !postLink || typeof postLink !== 'string') {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    // Validate URL
    if (!postLink.startsWith('http://') && !postLink.startsWith('https://')) {
      return NextResponse.json({ error: 'Lien invalide' }, { status: 400 })
    }

    // Verify booking belongs to creator and is confirmed
    const booking = await sql`
      SELECT id, status, booking_date FROM bookings
      WHERE id = ${bookingId} AND creator_id = ${session.id}
    `
    if (booking.length === 0) {
      return NextResponse.json({ error: 'Réservation non trouvée' }, { status: 404 })
    }
    if (booking[0].status !== 'confirmed' && booking[0].status !== 'completed') {
      return NextResponse.json({ error: 'Réservation non confirmée' }, { status: 400 })
    }

    await sql`
      UPDATE bookings
      SET post_link = ${postLink}, post_submitted_at = NOW()
      WHERE id = ${bookingId}
    `

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Submit post error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
