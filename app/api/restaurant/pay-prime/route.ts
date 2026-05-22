import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getRestaurantSession } from '@/lib/session'
import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const session = await getRestaurantSession()
  if (!session || !session.restaurantId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { bookingId } = await req.json()

    // Get booking with claim info
    const [booking] = await sql`
      SELECT b.*, c.stripe_connect_id, c.stripe_onboarding_complete
      FROM bookings b
      JOIN creators c ON b.creator_id = c.id
      WHERE b.id = ${bookingId} AND b.restaurant_id = ${session.restaurantId}
    `
    if (!booking) {
      return NextResponse.json({ error: 'Réservation non trouvée' }, { status: 404 })
    }
    if (booking.claim_status !== 'pending') {
      return NextResponse.json({ error: 'Pas de réclamation en attente' }, { status: 400 })
    }

    const claimedTier = typeof booking.claimed_tier === 'string' ? JSON.parse(booking.claimed_tier) : booking.claimed_tier
    if (!claimedTier?.bonus) {
      return NextResponse.json({ error: 'Palier invalide' }, { status: 400 })
    }

    const totalAmount = claimedTier.bonus * 100 // cents
    const creatorAmount = Math.round(totalAmount * 0.75)

    // Get restaurant's Stripe customer
    const [resto] = await sql`SELECT stripe_customer_id FROM restaurants WHERE id = ${session.restaurantId}`
    if (!resto?.stripe_customer_id) {
      return NextResponse.json({ error: 'Pas de moyen de paiement configuré' }, { status: 400 })
    }

    // Charge the restaurant via Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'eur',
      customer: resto.stripe_customer_id,
      confirm: true,
      automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
      metadata: {
        type: 'virality_prime',
        bookingId: bookingId.toString(),
        restaurantId: session.restaurantId.toString(),
      },
    })

    if (paymentIntent.status === 'succeeded') {
      // Transfer 75% to creator via Stripe Connect
      if (booking.stripe_connect_id && booking.stripe_onboarding_complete) {
        await stripe.transfers.create({
          amount: creatorAmount,
          currency: 'eur',
          destination: booking.stripe_connect_id,
          transfer_group: `prime_${bookingId}`,
        })
      }

      // Update claim status
      await sql`UPDATE bookings SET claim_status = 'approved' WHERE id = ${bookingId}`

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Paiement échoué' }, { status: 402 })
  } catch (err) {
    console.error('Pay prime error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
