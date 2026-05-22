import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getRestaurantSession } from '@/lib/session'
import { stripe, PLAN_CONFIG } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const session = await getRestaurantSession()
  if (!session || !session.restaurantId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { plan, billing } = await req.json() // billing: 'monthly' | 'yearly'

    if (!PLAN_CONFIG[plan]) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
    }

    const planConfig = PLAN_CONFIG[plan]
    const priceId = billing === 'yearly' && planConfig.yearly ? planConfig.yearly : planConfig.monthly

    if (!priceId) {
      return NextResponse.json({ error: 'Prix non configuré' }, { status: 400 })
    }

    // Get or create Stripe customer
    const restaurant = await sql`
      SELECT stripe_customer_id, stripe_subscription_id FROM restaurants WHERE id = ${session.restaurantId}
    `

    let customerId = restaurant[0]?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.email,
        name: session.businessName,
        metadata: { restaurantId: session.restaurantId.toString() },
      })
      customerId = customer.id
      await sql`UPDATE restaurants SET stripe_customer_id = ${customerId} WHERE id = ${session.restaurantId}`
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://2960agency.com'
    const oldSubId = restaurant[0]?.stripe_subscription_id || ''

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/restaurant/dashboard?subscription=success`,
      cancel_url: `${appUrl}/restaurant/dashboard?subscription=cancelled`,
      metadata: {
        restaurantId: session.restaurantId.toString(),
        plan: plan,
        billing: billing || 'monthly',
        oldSubscriptionId: oldSubId,
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'Erreur lors de la création du paiement' }, { status: 500 })
  }
}
