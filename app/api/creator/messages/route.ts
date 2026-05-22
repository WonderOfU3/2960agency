import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getCreatorSession } from '@/lib/session'

// GET all conversations for the logged-in creator
export async function GET() {
  const session = await getCreatorSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const conversations = await sql`
      SELECT
        b.id as booking_id,
        b.booking_date,
        b.status as booking_status,
        r.name as restaurant_name,
        r.address as restaurant_address,
        r.city as restaurant_city,
        (SELECT COUNT(*) FROM messages m WHERE m.booking_id = b.id AND m.sender_type = 'restaurant' AND m.is_read = false)::int as unread_count,
        (SELECT COUNT(*) FROM messages m WHERE m.booking_id = b.id)::int as total_messages,
        (SELECT content FROM messages m WHERE m.booking_id = b.id ORDER BY m.created_at DESC LIMIT 1) as last_message,
        (SELECT sender_name FROM messages m WHERE m.booking_id = b.id ORDER BY m.created_at DESC LIMIT 1) as last_sender,
        (SELECT created_at FROM messages m WHERE m.booking_id = b.id ORDER BY m.created_at DESC LIMIT 1) as last_message_at
      FROM bookings b
      JOIN restaurants r ON b.restaurant_id = r.id
      WHERE b.creator_id = ${session.id}
        AND EXISTS (SELECT 1 FROM conversation_tokens ct WHERE ct.booking_id = b.id)
      ORDER BY
        (SELECT MAX(created_at) FROM messages m WHERE m.booking_id = b.id) DESC NULLS LAST,
        b.created_at DESC
    `

    const totalUnread = conversations.reduce((sum: number, c: Record<string, number>) => sum + (c.unread_count || 0), 0 as number)

    return NextResponse.json({ conversations, totalUnread })
  } catch (err) {
    console.error('Fetch conversations error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
