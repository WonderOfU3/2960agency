import sql from '@/lib/db'

/**
 * Sync collab_usage by recounting confirmed bookings for the month.
 * This is race-condition safe: even with concurrent calls, the final
 * count is always correct because it's derived from the bookings table.
 */
export async function syncCollabUsage(restaurantId: number, bookingDate: string) {
  const dateStr = String(bookingDate).split('T')[0]
  const [y, m] = dateStr.split('-').map(Number)
  const month = `${y}-${String(m).padStart(2, '0')}`
  const monthStart = `${month}-01`
  // First day of next month
  const nextM = m === 12 ? 1 : m + 1
  const nextY = m === 12 ? y + 1 : y
  const monthEnd = `${nextY}-${String(nextM).padStart(2, '0')}-01`

  await sql`
    INSERT INTO collab_usage (restaurant_id, month, completed_count)
    VALUES (
      ${restaurantId}, ${month},
      (SELECT COUNT(*) FROM bookings
       WHERE restaurant_id = ${restaurantId}
         AND status = 'confirmed'
         AND booking_date >= ${monthStart}::date
         AND booking_date < ${monthEnd}::date)
    )
    ON CONFLICT (restaurant_id, month)
    DO UPDATE SET completed_count = (
      SELECT COUNT(*) FROM bookings
      WHERE restaurant_id = ${restaurantId}
        AND status = 'confirmed'
        AND booking_date >= ${monthStart}::date
        AND booking_date < ${monthEnd}::date
    )
  `
}

interface BillingCheck {
  canBook: boolean
  needsPayment: boolean
  monthUsage: number
  included: number
  extraPrice: number
  subscription: string
  onTrial: boolean
  trialCollabsRemaining: number
  trialEndsAt: string | null
  rejectReason?: string
}

/**
 * Check if a restaurant's next collab requires payment.
 * Accepts an optional bookingDate — if provided and the restaurant is on trial,
 * the booking date must fall within the trial window for it to be free.
 */
export async function checkCollabBilling(restaurantId: number, bookingDate?: string): Promise<BillingCheck> {
  const restaurant = await sql`
    SELECT subscription, included_collabs, extra_collab_price,
           trial_started_at, trial_ends_at, trial_collabs_used
    FROM restaurants WHERE id = ${restaurantId}
  `

  if (restaurant.length === 0) {
    return { canBook: false, needsPayment: true, monthUsage: 0, included: 0, extraPrice: 35, subscription: 'free', onTrial: false, trialCollabsRemaining: 0, trialEndsAt: null, rejectReason: 'Restaurant non trouvé' }
  }

  const r = restaurant[0]
  const sub = r.subscription || 'free'
  const included = r.included_collabs ?? 0
  const extraPrice = r.extra_collab_price ?? 35

  // Check trial status
  const now = new Date()
  const trialEndsAt = r.trial_ends_at ? new Date(r.trial_ends_at) : null
  const trialCollabsUsed = r.trial_collabs_used ?? 0
  const trialActive = !!(r.trial_started_at && trialEndsAt && now <= trialEndsAt)
  const trialCollabsRemaining = trialActive ? Math.max(0, 3 - trialCollabsUsed) : 0
  const onTrial = trialActive && trialCollabsRemaining > 0

  // Parse booking date for trial window check
  let bookingDateParsed: Date | null = null
  if (bookingDate) {
    const dateOnly = String(bookingDate).split('T')[0]
    const [y, m, d] = dateOnly.split('-').map(Number)
    bookingDateParsed = new Date(y, m - 1, d)
  }

  // If on trial with remaining collabs, check if booking date is within trial
  if (onTrial && trialCollabsRemaining > 0) {
    let bookingWithinTrial = true

    if (bookingDateParsed && trialEndsAt) {
      const trialEndDay = new Date(trialEndsAt.getFullYear(), trialEndsAt.getMonth(), trialEndsAt.getDate())
      bookingWithinTrial = bookingDateParsed <= trialEndDay
    }

    if (bookingWithinTrial) {
      return {
        canBook: true,
        needsPayment: false,
        monthUsage: 0,
        included: 3,
        extraPrice: 0,
        subscription: sub,
        onTrial: true,
        trialCollabsRemaining,
        trialEndsAt: r.trial_ends_at ? String(r.trial_ends_at) : null,
      }
    }
    // Booking is after trial end date — fall through
  }

  // Pro and Pro+Assist have unlimited collabs
  if (sub === 'pro' || sub === 'pro_assist') {
    return { canBook: true, needsPayment: false, monthUsage: 0, included: 999, extraPrice: 0, subscription: sub, onTrial: false, trialCollabsRemaining: 0, trialEndsAt: r.trial_ends_at ? String(r.trial_ends_at) : null }
  }

  // Check current month usage
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const usage = await sql`
    SELECT completed_count FROM collab_usage
    WHERE restaurant_id = ${restaurantId} AND month = ${currentMonth}
  `
  const rawUsage = usage.length > 0 ? usage[0].completed_count : 0

  // No paid subscription (free plan) — must pay per collab after trial
  // Subtract trial collabs from usage (legacy data: trial collabs may have been tracked here)
  if (sub === 'free' && included === 0) {
    return {
      canBook: true,
      needsPayment: true,
      monthUsage: Math.max(0, rawUsage - trialCollabsUsed),
      included: 0,
      extraPrice,
      subscription: sub,
      onTrial: false,
      trialCollabsRemaining: 0,
      trialEndsAt: r.trial_ends_at ? String(r.trial_ends_at) : null,
    }
  }

  // Paid plans: collab_usage is reset on subscription, so use rawUsage directly
  return {
    canBook: true,
    needsPayment: rawUsage >= included,
    monthUsage: rawUsage,
    included,
    extraPrice,
    subscription: sub,
    onTrial: false,
    trialCollabsRemaining: 0,
    trialEndsAt: r.trial_ends_at ? String(r.trial_ends_at) : null,
  }
}
