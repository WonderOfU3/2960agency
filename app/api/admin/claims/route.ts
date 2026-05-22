import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getAdminSession } from '@/lib/session'
import { createCreatorPayout } from '@/lib/stripe'

export async function GET() {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const claims = await sql`
      SELECT
        b.id as booking_id, b.booking_date, b.post_link, b.post_submitted_at,
        b.claimed_tier, b.claim_status,
        c.id as creator_id, c.username, c.first_name, c.last_name, c.email as creator_email,
        c.stripe_connect_id, c.stripe_onboarding_complete,
        r.name as restaurant_name, r.virality_tiers
      FROM bookings b
      JOIN creators c ON b.creator_id = c.id
      JOIN restaurants r ON b.restaurant_id = r.id
      WHERE b.claim_status IS NOT NULL
      ORDER BY
        CASE b.claim_status WHEN 'pending' THEN 0 ELSE 1 END,
        b.post_submitted_at DESC
    `

    return NextResponse.json({ claims })
  } catch (err) {
    console.error('Get claims error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const { bookingId, action } = await req.json()

    if (action === 'approve') {
      // Get booking + creator details
      const booking = await sql`
        SELECT b.claimed_tier, c.stripe_connect_id, c.stripe_onboarding_complete
        FROM bookings b
        JOIN creators c ON b.creator_id = c.id
        WHERE b.id = ${bookingId} AND b.claim_status = 'pending'
      `
      if (booking.length === 0) {
        return NextResponse.json({ error: 'Claim non trouvé' }, { status: 404 })
      }

      const b = booking[0]
      const tier = b.claimed_tier as { views: number; bonus: number }

      // Pay creator 75% via Stripe Connect
      if (b.stripe_connect_id && b.stripe_onboarding_complete && tier?.bonus) {
        const creatorShare = Math.round(tier.bonus * 0.75 * 100) // cents
        await createCreatorPayout(creatorShare, b.stripe_connect_id, bookingId)
      }

      await sql`UPDATE bookings SET claim_status = 'approved' WHERE id = ${bookingId}`
      return NextResponse.json({ success: true })
    }

    if (action === 'reject') {
      await sql`UPDATE bookings SET claim_status = 'rejected' WHERE id = ${bookingId}`
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
  } catch (err) {
    console.error('Update claim error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
