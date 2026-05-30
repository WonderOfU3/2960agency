import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { sendMessageNotification } from '@/lib/email'
import { notifyNewMessage } from '@/lib/notifications'

// GET messages using conversation token (restaurant, no login)
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) {
    return NextResponse.json({ error: 'Token requis' }, { status: 400 })
  }

  const conv = await sql`
    SELECT ct.booking_id, b.booking_date, b.status as booking_status,
           r.name as restaurant_name, r.address as restaurant_address,
           c.first_name as creator_first_name, c.last_name as creator_last_name,
           c.tiktok_username as creator_tiktok,
           ba.owner_name as restaurant_owner
    FROM conversation_tokens ct
    JOIN bookings b ON ct.booking_id = b.id
    JOIN restaurants r ON b.restaurant_id = r.id
    JOIN creators c ON b.creator_id = c.id
    LEFT JOIN business_applications ba ON r.business_application_id = ba.id
    WHERE ct.token = ${token}
  `
  if (conv.length === 0) {
    return NextResponse.json({ error: 'Conversation non trouvée' }, { status: 404 })
  }

  // Mark creator messages as read
  await sql`
    UPDATE messages SET is_read = true
    WHERE booking_id = ${conv[0].booking_id} AND sender_type = 'creator' AND is_read = false
  `

  const messages = await sql`
    SELECT * FROM messages WHERE booking_id = ${conv[0].booking_id} ORDER BY created_at ASC
  `

  return NextResponse.json({
    conversation: {
      bookingId: conv[0].booking_id,
      bookingDate: conv[0].booking_date,
      restaurantName: conv[0].restaurant_name,
      restaurantOwner: conv[0].restaurant_owner,
      creatorName: `${conv[0].creator_first_name} ${conv[0].creator_last_name}`,
      creatorTiktok: conv[0].creator_tiktok,
    },
    messages,
  })
}

// POST a message from restaurant (token-based)
export async function POST(req: NextRequest) {
  try {
    const { token, content } = await req.json()
    if (!token || !content?.trim()) {
      return NextResponse.json({ error: 'Token et contenu requis' }, { status: 400 })
    }

    const conv = await sql`
      SELECT ct.booking_id, r.name as restaurant_name, b.creator_id,
             ba.owner_name as restaurant_owner
      FROM conversation_tokens ct
      JOIN bookings b ON ct.booking_id = b.id
      JOIN restaurants r ON b.restaurant_id = r.id
      LEFT JOIN business_applications ba ON r.business_application_id = ba.id
      WHERE ct.token = ${token}
    `
    if (conv.length === 0) {
      return NextResponse.json({ error: 'Conversation non trouvée' }, { status: 404 })
    }

    const senderName = conv[0].restaurant_owner || conv[0].restaurant_name

    await sql`
      INSERT INTO messages (booking_id, sender_type, sender_name, content)
      VALUES (${conv[0].booking_id}, 'restaurant', ${senderName}, ${content.trim()})
    `

    // In-app notification for creator
    try { await notifyNewMessage('creator', conv[0].creator_id, senderName) } catch (e) { console.error('Message notification error:', e) }

    // Notify creator by email (don't let email failure crash the request)
    try {
      const creator = await sql`
        SELECT email, first_name FROM creators WHERE id = ${conv[0].creator_id}
      `
      if (creator.length > 0) {
        await sendMessageNotification({
          recipientEmail: creator[0].email,
          recipientName: creator[0].first_name,
          senderName,
          restaurantName: conv[0].restaurant_name,
          message: content.trim(),
          conversationUrl: null,
        })
      }
    } catch (e) {
      console.error('Message notification failed:', e)
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    const stack = err instanceof Error ? err.stack : ''
    console.error('Restaurant message error:', message, stack)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
