import sql from '@/lib/db'
import { createNotification } from '@/lib/notifications'

// ═══════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════

export const LEVEL_CONFIG = {
  bronze:   { points: 0,    credits: 3, uniqueRestos: 0,  earlyAccessHours: 0  },
  silver:   { points: 300,  credits: 4, uniqueRestos: 0,  earlyAccessHours: 24 },
  gold:     { points: 800,  credits: 5, uniqueRestos: 5,  earlyAccessHours: 48 },
  platinum: { points: 2500, credits: 6, uniqueRestos: 10, earlyAccessHours: 48 },
} as const

export type Level = keyof typeof LEVEL_CONFIG
const LEVELS_ORDER: Level[] = ['bronze', 'silver', 'gold', 'platinum']

const RATING_POINTS: Record<number, number> = {
  5: 10, 4: 5, 3: 0, 2: -5, 1: -15,
}

const GRACE_PERIOD_DAYS = 15

// ═══════════════════════════════════════════
//  POINTS
// ═══════════════════════════════════════════

/**
 * Add points to a creator and log the transaction.
 * Automatically recalculates level and grace period.
 */
export async function addPoints(
  creatorId: number,
  delta: number,
  action: string,
  bookingId?: number | null,
  note?: string,
) {
  // Insert transaction
  await sql`
    INSERT INTO points_transactions (creator_id, action, delta, booking_id, note)
    VALUES (${creatorId}, ${action}, ${delta}, ${bookingId ?? null}, ${note ?? null})
  `

  // Update total
  await sql`
    UPDATE creators SET points_total = points_total + ${delta} WHERE id = ${creatorId}
  `

  // Recalculate level
  await recalculateLevel(creatorId)
}

// ═══════════════════════════════════════════
//  LEVELS
// ═══════════════════════════════════════════

/**
 * Recalculate a creator's level based on points + unique restaurants.
 * Handles grace period logic for demotions.
 */
export async function recalculateLevel(creatorId: number) {
  const rows = await sql`
    SELECT points_total, level, unique_restaurants, level_grace_expires_at
    FROM creators WHERE id = ${creatorId}
  `
  if (rows.length === 0) return

  const { points_total, level: currentLevel, unique_restaurants, level_grace_expires_at } = rows[0]

  // Find the highest level the creator qualifies for
  let qualifiedLevel: Level = 'bronze'
  for (const lvl of LEVELS_ORDER) {
    const cfg = LEVEL_CONFIG[lvl]
    if (points_total >= cfg.points && unique_restaurants >= cfg.uniqueRestos) {
      qualifiedLevel = lvl
    }
  }

  const currentIdx = LEVELS_ORDER.indexOf(currentLevel as Level)
  const qualifiedIdx = LEVELS_ORDER.indexOf(qualifiedLevel)

  if (qualifiedIdx > currentIdx) {
    // PROMOTION — immediate
    await sql`
      UPDATE creators SET
        level = ${qualifiedLevel},
        level_grace_expires_at = NULL
      WHERE id = ${creatorId}
    `
  } else if (qualifiedIdx < currentIdx) {
    // Would be a DEMOTION — apply grace period
    if (!level_grace_expires_at) {
      // Start grace period
      const graceDate = new Date()
      graceDate.setDate(graceDate.getDate() + GRACE_PERIOD_DAYS)
      await sql`
        UPDATE creators SET level_grace_expires_at = ${graceDate.toISOString()}
        WHERE id = ${creatorId}
      `
    }
    // If grace period already active, do nothing — cron will handle expiration
  } else {
    // Same level — clear any grace period
    if (level_grace_expires_at) {
      await sql`
        UPDATE creators SET level_grace_expires_at = NULL
        WHERE id = ${creatorId}
      `
    }
  }
}

/**
 * Process expired grace periods (called by cron).
 * Demotes creators whose grace period expired while still below threshold.
 */
export async function processExpiredGracePeriods() {
  const expired = await sql`
    SELECT id, points_total, unique_restaurants, level
    FROM creators
    WHERE level_grace_expires_at IS NOT NULL AND level_grace_expires_at < NOW()
  `

  for (const c of expired) {
    let newLevel: Level = 'bronze'
    for (const lvl of LEVELS_ORDER) {
      const cfg = LEVEL_CONFIG[lvl]
      if (c.points_total >= cfg.points && c.unique_restaurants >= cfg.uniqueRestos) {
        newLevel = lvl
      }
    }

    await sql`
      UPDATE creators SET
        level = ${newLevel},
        level_grace_expires_at = NULL
      WHERE id = ${c.id}
    `
  }

  return expired.length
}

// ═══════════════════════════════════════════
//  CREDITS
// ═══════════════════════════════════════════

/**
 * Consume 1 credit when a booking is confirmed.
 * Returns false if no credits available.
 */
export async function consumeCredit(creatorId: number): Promise<boolean> {
  const rows = await sql`
    SELECT credits_current, serial_cancel_blocked FROM creators WHERE id = ${creatorId}
  `
  if (rows.length === 0) return false

  if (rows[0].serial_cancel_blocked) return false
  if (rows[0].credits_current <= 0) return false

  await sql`
    UPDATE creators SET credits_current = credits_current - 1 WHERE id = ${creatorId}
  `
  return true
}

/**
 * Refund 1 credit (cancellation > 72h or restaurant cancellation).
 */
export async function refundCredit(creatorId: number) {
  // Don't exceed the level max
  const rows = await sql`SELECT level FROM creators WHERE id = ${creatorId}`
  if (rows.length === 0) return
  const maxCredits = LEVEL_CONFIG[rows[0].level as Level]?.credits ?? 3

  await sql`
    UPDATE creators SET credits_current = LEAST(credits_current + 1, ${maxCredits})
    WHERE id = ${creatorId}
  `
}

/**
 * Reset all creators' credits on the 1st of each month.
 */
export async function monthlyCreditsReset() {
  const now = new Date()
  const currentMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-01`

  for (const lvl of LEVELS_ORDER) {
    const cfg = LEVEL_CONFIG[lvl]
    await sql`
      UPDATE creators SET
        credits_current = ${cfg.credits},
        credits_reset_month = ${currentMonth}::date,
        serial_cancels_month = 0,
        serial_cancel_blocked = FALSE
      WHERE level = ${lvl}
        AND (credits_reset_month IS NULL OR credits_reset_month < ${currentMonth}::date)
    `
  }
}

// ═══════════════════════════════════════════
//  CANCELLATIONS
// ═══════════════════════════════════════════

/**
 * Handle creator cancellation with credit/points logic.
 * bookingStart is the datetime of the collab (booking_date + start_time).
 */
export async function handleCreatorCancellation(
  creatorId: number,
  bookingId: number,
  bookingStart: Date,
) {
  const now = new Date()
  const hoursUntilCollab = (bookingStart.getTime() - now.getTime()) / (1000 * 60 * 60)

  if (hoursUntilCollab > 72) {
    // > 72h: credit refunded, no penalty
    await refundCredit(creatorId)
  } else if (hoursUntilCollab > 24) {
    // 24-72h: credit lost, -5 pts
    await addPoints(creatorId, -5, 'cancel_24_72h', bookingId, 'Annulation 24-72h avant')
  } else {
    // < 24h: credit lost, -30 pts, count as serial cancel
    await addPoints(creatorId, -30, 'cancel_lt24h', bookingId, 'Annulation < 24h')

    await sql`
      UPDATE creators SET serial_cancels_month = serial_cancels_month + 1 WHERE id = ${creatorId}
    `

    // Check if blocked now
    const rows = await sql`SELECT serial_cancels_month FROM creators WHERE id = ${creatorId}`
    if (rows.length > 0 && rows[0].serial_cancels_month >= 2) {
      await sql`UPDATE creators SET serial_cancel_blocked = TRUE WHERE id = ${creatorId}`
    }
  }
}

/**
 * Handle restaurant cancellation — full refund, no penalty for creator.
 */
export async function handleRestaurantCancellation(creatorId: number) {
  await refundCredit(creatorId)
}

// ═══════════════════════════════════════════
//  RATINGS
// ═══════════════════════════════════════════

/**
 * Apply points from a rating.
 */
export async function applyRatingPoints(creatorId: number, rating: number, bookingId: number) {
  const delta = RATING_POINTS[rating] ?? 0
  if (delta !== 0) {
    await addPoints(creatorId, delta, `rating_${rating}`, bookingId, `Note ${rating}★`)
  }
}

/**
 * Insert auto 3/5 ratings for expired deadlines (called by cron).
 */
export async function insertAutoRatings() {
  // Find reviews with deadline passed and no manual rating
  // We check for bookings with video_verified_at set but no review yet
  const expired = await sql`
    SELECT b.id as booking_id, b.creator_id, b.restaurant_id
    FROM bookings b
    LEFT JOIN reviews r ON r.booking_id = b.id AND r.reviewer_type = 'restaurant'
    WHERE b.video_verified_at IS NOT NULL
      AND b.video_verified_at + INTERVAL '7 days' < NOW()
      AND r.id IS NULL
  `

  for (const row of expired) {
    await sql`
      INSERT INTO reviews (booking_id, reviewer_type, reviewer_id, rating, comment, is_auto, deadline)
      VALUES (${row.booking_id}, 'restaurant', ${row.restaurant_id}, 3, NULL, TRUE,
              (SELECT video_verified_at + INTERVAL '7 days' FROM bookings WHERE id = ${row.booking_id}))
      ON CONFLICT (booking_id, reviewer_type) DO NOTHING
    `
    // Auto 3★ = 0 points, no addPoints needed
  }

  return expired.length
}

// ═══════════════════════════════════════════
//  VIDEO DEADLINE
// ═══════════════════════════════════════════

/**
 * Calculate video deadline: J+5, pushed to Monday if weekend.
 */
export function calculateVideoDeadline(bookingDate: Date): Date {
  const deadline = new Date(bookingDate)
  deadline.setDate(deadline.getDate() + 5)

  // If J+5 is Saturday, push to Monday (J+7)
  if (deadline.getDay() === 6) deadline.setDate(deadline.getDate() + 2)
  // If J+5 is Sunday, push to Monday (J+6)
  else if (deadline.getDay() === 0) deadline.setDate(deadline.getDate() + 1)

  deadline.setHours(23, 59, 59, 999)
  return deadline
}

/**
 * Process expired video deadlines (called by cron).
 */
export async function processExpiredVideoDeadlines() {
  const expired = await sql`
    SELECT b.id, b.creator_id
    FROM bookings b
    WHERE b.video_deadline IS NOT NULL
      AND b.video_deadline < NOW()
      AND b.video_verified_at IS NULL
      AND b.post_submitted_at IS NULL
      AND b.status = 'confirmed'
  `

  for (const b of expired) {
    await sql`UPDATE bookings SET status = 'expired', post_overdue = TRUE WHERE id = ${b.id}`
    await addPoints(b.creator_id, -20, 'video_expired', b.id, 'Vidéo non publiée après deadline')
  }

  return expired.length
}

// ═══════════════════════════════════════════
//  VIDEO VERIFICATION
// ═══════════════════════════════════════════

/**
 * Mark a collab as video verified. Awards +30 pts + optional +5 on-time bonus.
 * Creates rating deadline for the restaurant.
 */
export async function verifyVideo(bookingId: number) {
  const rows = await sql`
    SELECT b.id, b.creator_id, b.restaurant_id, b.booking_date, b.post_submitted_at, b.video_deadline
    FROM bookings b WHERE b.id = ${bookingId}
  `
  if (rows.length === 0) return

  const b = rows[0]
  const now = new Date()

  // Mark as verified
  await sql`UPDATE bookings SET video_verified_at = ${now.toISOString()} WHERE id = ${bookingId}`

  // +30 pts for completing collab
  await addPoints(b.creator_id, 30, 'collab_complete', bookingId, 'Collab complétée')

  // Check if video was submitted on time (within J+5 or extended weekend deadline)
  if (b.post_submitted_at && b.video_deadline) {
    const submitted = new Date(b.post_submitted_at)
    const deadline = new Date(b.video_deadline)
    if (submitted <= deadline) {
      // Check if it's within the strict J+5 (not just the weekend extension)
      const bookingDate = new Date(b.booking_date)
      const strictDeadline = new Date(bookingDate)
      strictDeadline.setDate(strictDeadline.getDate() + 5)
      strictDeadline.setHours(23, 59, 59, 999)

      if (submitted <= strictDeadline) {
        await addPoints(b.creator_id, 5, 'video_on_time', bookingId, 'Vidéo dans les délais')
      }
      // If submitted after J+5 but before weekend-extended deadline: +0
    }
  }

  // Update unique restaurants count
  await sql`
    UPDATE creators SET unique_restaurants = (
      SELECT COUNT(DISTINCT b2.restaurant_id)
      FROM bookings b2
      WHERE b2.creator_id = ${b.creator_id}
        AND b2.video_verified_at IS NOT NULL
    )
    WHERE id = ${b.creator_id}
  `
}

// ═══════════════════════════════════════════
//  REFERRALS
// ═══════════════════════════════════════════

/**
 * Check referral milestones after a restaurant publishes.
 * Returns true if 5-referral bonus was triggered.
 */
export async function checkReferralMilestone(creatorId: number): Promise<boolean> {
  const rows = await sql`
    SELECT COUNT(*) as published_count
    FROM referrals
    WHERE creator_id = ${creatorId}
      AND restaurant_published_at IS NOT NULL
      AND bonus_paid_at IS NULL
  `

  const count = parseInt(rows[0]?.published_count || '0')

  if (count >= 5) {
    // Mark all as paid
    await sql`
      UPDATE referrals SET bonus_paid_at = NOW()
      WHERE creator_id = ${creatorId}
        AND restaurant_published_at IS NOT NULL
        AND bonus_paid_at IS NULL
    `

    // Notify admin — payout is handled manually for now
    await createNotification({
      recipientType: 'admin',
      recipientId: 1,
      type: 'referral_milestone',
      title: 'Parrainage 5/5 atteint',
      body: `Un créateur a atteint 5 parrainages actifs. Payout 100€ à traiter manuellement.`,
      link: '/admin/dashboard',
    })

    return true
  }

  return false
}

// ═══════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════

/**
 * Get a creator's full gamification profile.
 */
export async function getCreatorGamificationProfile(creatorId: number) {
  const rows = await sql`
    SELECT
      points_total, level, unique_restaurants,
      credits_current, credits_reset_month,
      serial_cancels_month, serial_cancel_blocked,
      level_grace_expires_at, featured,
      ambassador_code
    FROM creators WHERE id = ${creatorId}
  `
  if (rows.length === 0) return null

  const c = rows[0]
  const lvl = c.level as Level
  const cfg = LEVEL_CONFIG[lvl]

  // Get next level info
  const currentIdx = LEVELS_ORDER.indexOf(lvl)
  const nextLevel = currentIdx < LEVELS_ORDER.length - 1 ? LEVELS_ORDER[currentIdx + 1] : null
  const nextCfg = nextLevel ? LEVEL_CONFIG[nextLevel] : null

  // Get rating stats
  const ratingRows = await sql`
    SELECT
      COALESCE(AVG(r.rating), 0) as avg_rating,
      COUNT(r.id) as total_ratings
    FROM reviews r
    JOIN bookings b ON r.booking_id = b.id
    WHERE b.creator_id = ${creatorId} AND r.reviewer_type = 'restaurant'
  `

  // Get referral progress
  const refRows = await sql`
    SELECT
      COUNT(*) FILTER (WHERE restaurant_published_at IS NOT NULL AND bonus_paid_at IS NULL) as active_referrals,
      COUNT(*) as total_referrals
    FROM referrals WHERE creator_id = ${creatorId}
  `

  // Get recent point transactions
  const recentTx = await sql`
    SELECT pt.action, pt.delta, pt.note, pt.created_at, pt.booking_id,
           r.name as restaurant_name
    FROM points_transactions pt
    LEFT JOIN bookings b ON pt.booking_id = b.id
    LEFT JOIN restaurants r ON b.restaurant_id = r.id
    WHERE pt.creator_id = ${creatorId}
    ORDER BY pt.created_at DESC
    LIMIT 10
  `

  return {
    points: c.points_total,
    level: lvl,
    uniqueRestaurants: c.unique_restaurants,
    credits: c.credits_current,
    maxCredits: cfg.credits,
    creditsResetMonth: c.credits_reset_month,
    serialCancels: c.serial_cancels_month,
    isBlocked: c.serial_cancel_blocked,
    graceExpiresAt: c.level_grace_expires_at,
    featured: c.featured,
    ambassadorCode: c.ambassador_code,
    nextLevel,
    nextLevelPoints: nextCfg?.points ?? null,
    nextLevelRestos: nextCfg?.uniqueRestos ?? null,
    avgRating: parseFloat(ratingRows[0]?.avg_rating || '0'),
    totalRatings: parseInt(ratingRows[0]?.total_ratings || '0'),
    activeReferrals: parseInt(refRows[0]?.active_referrals || '0'),
    totalReferrals: parseInt(refRows[0]?.total_referrals || '0'),
    recentTransactions: recentTx,
  }
}
