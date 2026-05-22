import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getCreatorSession, getRestaurantSession, getAdminSession } from '@/lib/session'

function getAuth(creator: Awaited<ReturnType<typeof getCreatorSession>>, restaurant: Awaited<ReturnType<typeof getRestaurantSession>>, admin: Awaited<ReturnType<typeof getAdminSession>>) {
  if (creator) return { type: 'creator' as const, id: creator.id }
  if (restaurant) return { type: 'restaurant' as const, id: restaurant.id }
  if (admin) return { type: 'admin' as const, id: admin.id }
  return null
}

// GET: fetch notifications (with unread count)
export async function GET() {
  const auth = getAuth(await getCreatorSession(), await getRestaurantSession(), await getAdminSession())
  if (!auth) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const notifications = await sql`
      SELECT * FROM notifications
      WHERE recipient_type = ${auth.type} AND recipient_id = ${auth.id}
      ORDER BY created_at DESC
      LIMIT 50
    `

    const unreadCount = await sql`
      SELECT COUNT(*)::int as count FROM notifications
      WHERE recipient_type = ${auth.type} AND recipient_id = ${auth.id} AND read = false
    `

    return NextResponse.json({
      notifications,
      unreadCount: unreadCount[0]?.count || 0,
    })
  } catch (err) {
    console.error('Notifications fetch error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PATCH: mark notifications as read
export async function PATCH(req: NextRequest) {
  const auth = getAuth(await getCreatorSession(), await getRestaurantSession(), await getAdminSession())
  if (!auth) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const { notificationIds, markAll } = await req.json()

    if (markAll) {
      await sql`
        UPDATE notifications SET read = true
        WHERE recipient_type = ${auth.type} AND recipient_id = ${auth.id} AND read = false
      `
    } else if (Array.isArray(notificationIds) && notificationIds.length > 0) {
      await sql`
        UPDATE notifications SET read = true
        WHERE id = ANY(${notificationIds}) AND recipient_type = ${auth.type} AND recipient_id = ${auth.id}
      `
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Notifications update error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
