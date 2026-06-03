import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/session'
import { verifyVideo } from '@/lib/gamification'
import { createNotification } from '@/lib/notifications'
import sql from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { bookingId } = await req.json()

    const booking = await sql`
      SELECT b.id, b.creator_id, b.restaurant_id, b.video_verified_at,
             r.name as restaurant_name
      FROM bookings b
      JOIN restaurants r ON b.restaurant_id = r.id
      WHERE b.id = ${bookingId}
    `
    if (booking.length === 0) {
      return NextResponse.json({ error: 'Réservation non trouvée' }, { status: 404 })
    }
    if (booking[0].video_verified_at) {
      return NextResponse.json({ error: 'Vidéo déjà vérifiée' }, { status: 400 })
    }

    await verifyVideo(bookingId)

    // Notify restaurant to rate the creator
    await createNotification({
      recipientType: 'restaurant',
      recipientId: booking[0].restaurant_id,
      type: 'rate_creator',
      title: 'Évaluez le créateur',
      body: `La vidéo a été validée — vous avez 7 jours pour noter le créateur`,
      link: '/restaurant/dashboard?tab=collabs',
    })

    // Notify creator
    await createNotification({
      recipientType: 'creator',
      recipientId: booking[0].creator_id,
      type: 'video_verified',
      title: 'Vidéo validée !',
      body: `Votre vidéo pour ${booking[0].restaurant_name} a été validée. +30 pts !`,
      link: '/creator/dashboard?tab=bookings',
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Verify video error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
