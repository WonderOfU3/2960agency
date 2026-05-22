import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getCreatorSession } from '@/lib/session'

export async function POST(req: NextRequest) {
  const session = await getCreatorSession()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const { bookingId, claimedTier } = await req.json()

    if (!bookingId || !claimedTier || typeof claimedTier.views !== 'number' || typeof claimedTier.bonus !== 'number') {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    // Verify booking belongs to creator, has a post link, and no existing claim
    const booking = await sql`
      SELECT id, post_link, claim_status FROM bookings
      WHERE id = ${bookingId} AND creator_id = ${session.id}
    `
    if (booking.length === 0) {
      return NextResponse.json({ error: 'Réservation non trouvée' }, { status: 404 })
    }
    if (!booking[0].post_link) {
      return NextResponse.json({ error: 'Soumets d\'abord le lien de ton post' }, { status: 400 })
    }
    if (booking[0].claim_status) {
      return NextResponse.json({ error: 'Une réclamation existe déjà' }, { status: 400 })
    }

    // Check Stripe Connect onboarding
    const creator = await sql`
      SELECT stripe_connect_id, stripe_onboarding_complete FROM creators WHERE id = ${session.id}
    `
    if (!creator[0]?.stripe_onboarding_complete) {
      return NextResponse.json({ error: 'Connectez votre compte bancaire avant de réclamer une prime' }, { status: 400 })
    }

    await sql`
      UPDATE bookings
      SET claimed_tier = ${JSON.stringify(claimedTier)}::jsonb, claim_status = 'pending'
      WHERE id = ${bookingId}
    `

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Claim tier error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
