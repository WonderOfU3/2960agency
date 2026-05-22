import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getRestaurantSession } from '@/lib/session'
import { stripe } from '@/lib/stripe'

export async function POST() {
  const session = await getRestaurantSession()
  if (!session || !session.restaurantId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const restaurant = await sql`
      SELECT stripe_subscription_id FROM restaurants WHERE id = ${session.restaurantId}
    `

    const subId = restaurant[0]?.stripe_subscription_id
    if (!subId) {
      return NextResponse.json({ error: 'Aucun abonnement actif' }, { status: 400 })
    }

    // Cancel at period end (Stripe will send customer.subscription.deleted webhook when it ends)
    await stripe.subscriptions.update(subId, {
      cancel_at_period_end: true,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Cancel subscription error:', err)
    return NextResponse.json({ error: 'Erreur lors de l\'annulation' }, { status: 500 })
  }
}
