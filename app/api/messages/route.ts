import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getCreatorSession } from '@/lib/session'
import { sendMessageNotification } from '@/lib/email'
import { notifyNewMessage } from '@/lib/notifications'

// GET messages for a booking (creator auth)
export async function GET(req: NextRequest) {
  const session = await getCreatorSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const bookingId = req.nextUrl.searchParams.get('bookingId')
  if (!bookingId) {
    return NextResponse.json({ error: 'bookingId requis' }, { status: 400 })
  }

  // Verify this booking belongs to the creator
  const booking = await sql`
    SELECT b.id FROM bookings b WHERE b.id = ${parseInt(bookingId)} AND b.creator_id = ${session.id}
  `
  if (booking.length === 0) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  // Mark restaurant messages as read
  await sql`
    UPDATE messages SET is_read = true
    WHERE booking_id = ${parseInt(bookingId)} AND sender_type = 'restaurant' AND is_read = false
  `

  const messages = await sql`
    SELECT * FROM messages WHERE booking_id = ${parseInt(bookingId)} ORDER BY created_at ASC
  `

  return NextResponse.json({ messages })
}

// POST a message from creator
export async function POST(req: NextRequest) {
  const session = await getCreatorSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { bookingId, content } = await req.json()
  if (!bookingId || !content?.trim()) {
    return NextResponse.json({ error: 'Contenu requis' }, { status: 400 })
  }

  // Verify booking belongs to creator
  const booking = await sql`
    SELECT b.id, b.restaurant_id, r.name as restaurant_name, r.business_application_id
    FROM bookings b
    JOIN restaurants r ON b.restaurant_id = r.id
    WHERE b.id = ${bookingId} AND b.creator_id = ${session.id}
  `
  if (booking.length === 0) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const senderName = `${session.firstName} ${session.lastName}`

  await sql`
    INSERT INTO messages (booking_id, sender_type, sender_name, content)
    VALUES (${bookingId}, 'creator', ${senderName}, ${content.trim()})
  `

  // In-app notification for restaurant
  try { await notifyNewMessage('restaurant', booking[0].restaurant_id, senderName) } catch (e) { console.error('Message notification error:', e) }

  // Notify restaurant by email
  if (booking[0].business_application_id) {
    const bizApp = await sql`
      SELECT email, owner_name FROM business_applications WHERE id = ${booking[0].business_application_id}
    `
    if (bizApp.length > 0) {
      const token = await sql`
        SELECT token FROM conversation_tokens WHERE booking_id = ${bookingId}
      `
      const conversationUrl = token.length > 0
        ? `${process.env.NEXT_PUBLIC_APP_URL || 'https://2960agency.com'}/conversation/${token[0].token}`
        : null

      await sendMessageNotification({
        recipientEmail: bizApp[0].email,
        recipientName: bizApp[0].owner_name,
        senderName,
        restaurantName: booking[0].restaurant_name,
        message: content.trim(),
        conversationUrl,
      })
    }
  }

  return NextResponse.json({ success: true })
}
