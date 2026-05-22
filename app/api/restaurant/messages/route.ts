import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getRestaurantSession } from '@/lib/session'
import { sendMessageNotification } from '@/lib/email'

export async function GET() {
  const session = await getRestaurantSession()
  if (!session || !session.restaurantId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const conversations = await sql`
      SELECT
        b.id as booking_id,
        b.booking_date,
        b.status as booking_status,
        c.first_name as creator_first_name,
        c.last_name as creator_last_name,
        c.tiktok_username as creator_tiktok,
        (SELECT COUNT(*) FROM messages m WHERE m.booking_id = b.id AND m.sender_type = 'creator' AND m.is_read = false)::int as unread_count,
        (SELECT COUNT(*) FROM messages m WHERE m.booking_id = b.id)::int as total_messages,
        (SELECT content FROM messages m WHERE m.booking_id = b.id ORDER BY m.created_at DESC LIMIT 1) as last_message,
        (SELECT sender_name FROM messages m WHERE m.booking_id = b.id ORDER BY m.created_at DESC LIMIT 1) as last_sender,
        (SELECT created_at FROM messages m WHERE m.booking_id = b.id ORDER BY m.created_at DESC LIMIT 1) as last_message_at
      FROM bookings b
      JOIN creators c ON b.creator_id = c.id
      WHERE b.restaurant_id = ${session.restaurantId} AND b.status = 'confirmed'
        AND EXISTS (SELECT 1 FROM conversation_tokens ct WHERE ct.booking_id = b.id)
      ORDER BY
        (SELECT MAX(created_at) FROM messages m WHERE m.booking_id = b.id) DESC NULLS LAST,
        b.created_at DESC
    `

    const totalUnread = conversations.reduce((sum: number, c: Record<string, number>) => sum + (c.unread_count || 0), 0 as number)
    return NextResponse.json({ conversations, totalUnread })
  } catch (err) {
    console.error('Restaurant conversations error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// GET messages for a specific booking
export async function POST(req: NextRequest) {
  const session = await getRestaurantSession()
  if (!session || !session.restaurantId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { action, bookingId, content } = await req.json()

    // Get messages
    if (action === 'get_messages') {
      // Verify booking belongs to restaurant
      const booking = await sql`SELECT id FROM bookings WHERE id = ${bookingId} AND restaurant_id = ${session.restaurantId}`
      if (booking.length === 0) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

      await sql`UPDATE messages SET is_read = true WHERE booking_id = ${bookingId} AND sender_type = 'creator' AND is_read = false`
      const messages = await sql`SELECT * FROM messages WHERE booking_id = ${bookingId} ORDER BY created_at ASC`
      return NextResponse.json({ messages })
    }

    // Send message
    if (action === 'send') {
      if (!content?.trim()) return NextResponse.json({ error: 'Contenu requis' }, { status: 400 })

      const booking = await sql`
        SELECT b.id, b.creator_id, r.name as restaurant_name
        FROM bookings b JOIN restaurants r ON b.restaurant_id = r.id
        WHERE b.id = ${bookingId} AND b.restaurant_id = ${session.restaurantId}
      `
      if (booking.length === 0) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

      await sql`
        INSERT INTO messages (booking_id, sender_type, sender_name, content)
        VALUES (${bookingId}, 'restaurant', ${session.ownerName || session.businessName}, ${content.trim()})
      `

      // Notify creator
      try {
        const creator = await sql`SELECT email, first_name FROM creators WHERE id = ${booking[0].creator_id}`
        if (creator.length > 0) {
          await sendMessageNotification({
            recipientEmail: creator[0].email,
            recipientName: creator[0].first_name,
            senderName: session.ownerName || session.businessName,
            restaurantName: booking[0].restaurant_name,
            message: content.trim(),
            conversationUrl: null,
          })
        }
      } catch (e) { console.error('Message notification failed:', e) }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
  } catch (err) {
    console.error('Restaurant message error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
