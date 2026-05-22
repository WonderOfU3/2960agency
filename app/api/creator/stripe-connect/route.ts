import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getCreatorSession } from '@/lib/session'
import { createConnectAccount, createAccountLink, getConnectAccountStatus } from '@/lib/stripe'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://2960agency.com'

export async function GET() {
  const session = await getCreatorSession()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const creator = await sql`
      SELECT stripe_connect_id, stripe_onboarding_complete FROM creators WHERE id = ${session.id}
    `
    if (creator.length === 0) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 })

    const c = creator[0]

    // If has connect ID but onboarding not marked complete, re-check with Stripe
    if (c.stripe_connect_id && !c.stripe_onboarding_complete) {
      try {
        const status = await getConnectAccountStatus(c.stripe_connect_id)
        if (status.onboardingComplete) {
          await sql`UPDATE creators SET stripe_onboarding_complete = true WHERE id = ${session.id}`
          return NextResponse.json({
            hasAccount: true,
            onboardingComplete: true,
            stripeConnectId: c.stripe_connect_id,
          })
        }
      } catch { /* Stripe API error — return current DB state */ }
    }

    return NextResponse.json({
      hasAccount: !!c.stripe_connect_id,
      onboardingComplete: c.stripe_onboarding_complete || false,
      stripeConnectId: c.stripe_connect_id || null,
    })
  } catch (err) {
    console.error('Get Stripe Connect status error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getCreatorSession()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const { action } = await req.json()

    if (action === 'create_account') {
      // Check if already has an account
      const existing = await sql`
        SELECT stripe_connect_id FROM creators WHERE id = ${session.id}
      `
      let connectId = existing[0]?.stripe_connect_id

      if (!connectId) {
        // Create new Express account
        const account = await createConnectAccount(session.email, session.id)
        connectId = account.id
        await sql`
          UPDATE creators SET stripe_connect_id = ${connectId}
          WHERE id = ${session.id}
        `
      }

      // Create account link for onboarding
      const link = await createAccountLink(
        connectId,
        `${APP_URL}/creator/dashboard?stripe_connect=success`,
        `${APP_URL}/creator/dashboard?stripe_connect=refresh`,
      )

      return NextResponse.json({ url: link.url })
    }

    if (action === 'refresh_link') {
      const creator = await sql`
        SELECT stripe_connect_id FROM creators WHERE id = ${session.id}
      `
      const connectId = creator[0]?.stripe_connect_id
      if (!connectId) {
        return NextResponse.json({ error: 'Aucun compte Stripe connecté' }, { status: 400 })
      }

      const link = await createAccountLink(
        connectId,
        `${APP_URL}/creator/dashboard?stripe_connect=success`,
        `${APP_URL}/creator/dashboard?stripe_connect=refresh`,
      )

      return NextResponse.json({ url: link.url })
    }

    return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
  } catch (err) {
    console.error('Stripe Connect error:', err)
    return NextResponse.json({ error: 'Erreur lors de la configuration Stripe' }, { status: 500 })
  }
}
