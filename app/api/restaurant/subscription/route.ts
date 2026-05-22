import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getRestaurantSession } from '@/lib/session'

export async function GET() {
  const session = await getRestaurantSession()
  if (!session || !session.restaurantId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const restaurant = await sql`
      SELECT * FROM restaurants WHERE id = ${session.restaurantId}
    `
    if (restaurant.length === 0) {
      return NextResponse.json({ error: 'Restaurant non trouvé' }, { status: 404 })
    }

    const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
    const usage = await sql`
      SELECT completed_count FROM collab_usage
      WHERE restaurant_id = ${session.restaurantId} AND month = ${currentMonth}
    `

    const r = restaurant[0]
    const rawMonthUsage = usage.length > 0 ? usage[0].completed_count : 0
    const included = r.included_collabs ?? 0
    const extraPrice = r.extra_collab_price ?? 35

    // Trial info
    const now = new Date()
    const trialEndsAt = r.trial_ends_at ? new Date(r.trial_ends_at) : null
    const trialCollabsUsed = r.trial_collabs_used ?? 0
    const trialActive = !!(r.trial_started_at && trialEndsAt && now <= trialEndsAt)
    const trialCollabsRemaining = trialActive ? Math.max(0, 3 - trialCollabsUsed) : 0
    const onTrial = trialActive && trialCollabsRemaining > 0
    const trialDaysLeft = trialEndsAt
      ? Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0

    // For free plan: subtract trial collabs (legacy data may include them)
    // For paid plans: collab_usage is reset on subscription change, so use raw value
    const sub = r.subscription || 'free'
    const monthUsage = onTrial
      ? trialCollabsUsed
      : sub === 'free'
        ? Math.max(0, rawMonthUsage - trialCollabsUsed)
        : rawMonthUsage
    const extras = onTrial ? 0 : Math.max(0, monthUsage - included)
    const extraCost = extras * extraPrice

    return NextResponse.json({
      plan: sub,
      includedCollabs: onTrial ? 3 : included,
      extraCollabPrice: extraPrice,
      monthUsage,
      extras,
      extraCost,
      billingCycle: r.billing_cycle || (r.stripe_subscription_id ? 'monthly' : null),
      hasStripe: !!r.stripe_subscription_id,
      // Trial fields
      onTrial,
      trialDaysLeft: onTrial ? trialDaysLeft : 0,
      trialCollabsUsed,
      trialCollabsRemaining,
      trialEndsAt: r.trial_ends_at || null,
    })
  } catch (err) {
    console.error('Fetch subscription error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
