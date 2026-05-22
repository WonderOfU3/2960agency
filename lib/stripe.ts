import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
})

// Subscription plans — monthly and yearly Price IDs
// Get Price IDs from Stripe Dashboard: Products → click product → copy the "price_..." ID
export const PLAN_CONFIG: Record<string, {
  monthly: string; yearly: string
  included: number; extra: number; extraPriceId: string
}> = {
  basic: {
    monthly: process.env.STRIPE_PRICE_BASIC_MONTHLY || '',
    yearly: process.env.STRIPE_PRICE_BASIC_YEARLY || '',
    included: 1, extra: 20,
    extraPriceId: process.env.STRIPE_PRICE_EXTRA_BASIC || '',
  },
  active: {
    monthly: process.env.STRIPE_PRICE_ACTIVE_MONTHLY || '',
    yearly: process.env.STRIPE_PRICE_ACTIVE_YEARLY || '',
    included: 4, extra: 14, // 14€ per extra collab
    extraPriceId: process.env.STRIPE_PRICE_EXTRA_ACTIVE || '',
  },
  pro: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY || '',
    yearly: process.env.STRIPE_PRICE_PRO_YEARLY || '',
    included: 999, extra: 0,
    extraPriceId: '',
  },
  pro_assist: {
    monthly: process.env.STRIPE_PRICE_PRO_ASSIST_MONTHLY || '',
    yearly: '', // no yearly for pro+assist
    included: 999, extra: 0,
    extraPriceId: '',
  },
}

// Per-collab price for restaurants without a subscription
export const NO_SUB_EXTRA_PRICE = 35
export const NO_SUB_EXTRA_PRICE_ID = process.env.STRIPE_PRICE_EXTRA_NOSUB || ''

// ═══════════════════════════════════════
// STRIPE CONNECT — Creator payouts
// ═══════════════════════════════════════

/**
 * Create a Stripe Express connected account for a creator.
 * Express accounts let Stripe handle onboarding UI (identity, bank details).
 */
export async function createConnectAccount(email: string, creatorId: number) {
  const account = await stripe.accounts.create({
    type: 'express',
    country: 'FR',
    email,
    capabilities: {
      transfers: { requested: true },
    },
    metadata: {
      creatorId: creatorId.toString(),
      platform: '2960agency',
    },
  })
  return account
}

/**
 * Create an Account Link for Stripe Express onboarding.
 * Redirects the creator to Stripe's hosted onboarding UI.
 */
export async function createAccountLink(stripeConnectId: string, returnUrl: string, refreshUrl: string) {
  const link = await stripe.accountLinks.create({
    account: stripeConnectId,
    type: 'account_onboarding',
    return_url: returnUrl,
    refresh_url: refreshUrl,
  })
  return link
}

/**
 * Check if a connected account has completed onboarding.
 */
export async function getConnectAccountStatus(stripeConnectId: string) {
  const account = await stripe.accounts.retrieve(stripeConnectId)
  return {
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    detailsSubmitted: account.details_submitted,
    onboardingComplete: !!(account.charges_enabled && account.payouts_enabled),
  }
}

/**
 * Transfer funds to a connected account (creator payout for virality bonus).
 * The amount is the creator's 75% share — the platform keeps 25%.
 */
export async function createCreatorPayout(amountCents: number, stripeConnectId: string, bookingId: number) {
  const transfer = await stripe.transfers.create({
    amount: amountCents,
    currency: 'eur',
    destination: stripeConnectId,
    metadata: {
      bookingId: bookingId.toString(),
      type: 'virality_bonus',
    },
  })
  return transfer
}
