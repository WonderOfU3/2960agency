import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getRestaurantSession } from '@/lib/session'
import { notifyCreatorInvited } from '@/lib/notifications'

export async function POST(req: NextRequest) {
  const session = await getRestaurantSession()
  if (!session || !session.restaurantId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    // Check plan — only Pro and Pro+Assist
    const [resto] = await sql`SELECT subscription FROM restaurants WHERE id = ${session.restaurantId}`
    if (!resto || (resto.subscription !== 'pro' && resto.subscription !== 'pro_assist')) {
      return NextResponse.json({ error: 'Réservé aux abonnements Pro et Pro+Assist' }, { status: 403 })
    }

    // Check monthly limit (10/month)
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const [countRow] = await sql`
      SELECT COUNT(*) as cnt FROM invitations
      WHERE restaurant_id = ${session.restaurantId} AND created_at >= ${monthStart}
    `
    if (parseInt(countRow.cnt) >= 10) {
      return NextResponse.json({ error: 'Limite de 10 invitations par mois atteinte' }, { status: 429 })
    }

    const { creatorId } = await req.json()
    if (!creatorId) {
      return NextResponse.json({ error: 'creatorId requis' }, { status: 400 })
    }

    // Check not already invited this month
    const existing = await sql`
      SELECT id FROM invitations
      WHERE restaurant_id = ${session.restaurantId} AND creator_id = ${creatorId} AND created_at >= ${monthStart}
    `
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Déjà invité ce mois-ci' }, { status: 409 })
    }

    await sql`
      INSERT INTO invitations (restaurant_id, creator_id)
      VALUES (${session.restaurantId}, ${creatorId})
    `

    // Notify creator
    await notifyCreatorInvited(creatorId, session.businessName || 'Un restaurant')

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Invite error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
