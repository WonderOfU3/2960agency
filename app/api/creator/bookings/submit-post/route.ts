import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getCreatorSession } from '@/lib/session'
import { notifyPostSubmitted } from '@/lib/notifications'
import { sendRestoVideo, sendRestoConv } from '@/lib/email'
import { track } from '@/lib/track'

export async function POST(req: NextRequest) {
  const session = await getCreatorSession()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const { bookingId, postLink } = await req.json()

    if (!bookingId || !postLink || typeof postLink !== 'string') {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    // Validate URL — must be a real URL with a valid domain
    try {
      const url = new URL(postLink)
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error('bad protocol')
      if (!url.hostname.includes('.')) throw new Error('invalid domain')
    } catch {
      return NextResponse.json({ error: 'Lien invalide — entre un vrai lien (ex: https://tiktok.com/...)' }, { status: 400 })
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
    track({ event: 'lien_video_poste', userId: session.id, userType: 'creator', metadata: { bookingId } })

    // Notify restaurant
    try {
      const bk = await sql`
        SELECT b.restaurant_id, c.first_name, c.last_name
        FROM bookings b JOIN creators c ON b.creator_id = c.id
        WHERE b.id = ${bookingId}
      `
      if (bk.length > 0) {
        await notifyPostSubmitted(bk[0].restaurant_id, `${bk[0].first_name} ${bk[0].last_name}`)
      }
    } catch (e) { console.error('Post submit notification error:', e) }

    // R-VIDEO & R-CONV email triggers (non-blocking)
    try {
      const [restaurantRows] = await Promise.all([
        sql`
          SELECT r.name, ru.email, b.restaurant_id, c.first_name, c.last_name
          FROM bookings b
          JOIN restaurants r ON b.restaurant_id = r.id
          JOIN restaurant_users ru ON ru.restaurant_id = r.id
          JOIN creators c ON b.creator_id = c.id
          WHERE b.id = ${bookingId}
          LIMIT 1
        `,
      ])

      if (restaurantRows.length > 0) {
        const { name: restoName, email, restaurant_id, first_name, last_name } = restaurantRows[0]
        const creatorName = `${first_name} ${last_name}`

        // R-VIDEO: notify restaurant that the video is live
        sendRestoVideo({
          restoName,
          email,
          creatorName,
          postLink,
        }).catch((err: unknown) => console.error('R-VIDEO email error:', err))

        // R-CONV: check if this is the restaurant's 3rd completed collab
        const countRows = await sql`
          SELECT COUNT(*)::int AS count FROM bookings
          WHERE restaurant_id = ${restaurant_id} AND post_link IS NOT NULL
        `
        const count = countRows[0]?.count ?? 0
        if (count >= 3) {
          sendRestoConv({
            restoName,
            email,
            videoCount: count,
          }).catch((err: unknown) => console.error('R-CONV email error:', err))
        }
      }
    } catch (e) { console.error('R-VIDEO / R-CONV email error:', e) }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Submit post error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
