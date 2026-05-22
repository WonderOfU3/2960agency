import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getRestaurantSession } from '@/lib/session'

export async function PATCH(req: NextRequest) {
  const session = await getRestaurantSession()
  if (!session || !session.restaurantId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { autoAccept } = await req.json()

    if (typeof autoAccept === 'boolean') {
      await sql`UPDATE restaurants SET auto_accept = ${autoAccept} WHERE id = ${session.restaurantId}`
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Rien à mettre à jour' }, { status: 400 })
  } catch (err) {
    console.error('Restaurant settings error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
