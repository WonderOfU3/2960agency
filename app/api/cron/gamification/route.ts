import { NextRequest, NextResponse } from 'next/server'
import {
  monthlyCreditsReset,
  processExpiredGracePeriods,
  insertAutoRatings,
  processExpiredVideoDeadlines,
  LEVEL_CONFIG,
} from '@/lib/gamification'
import sql from '@/lib/db'
import { createNotification } from '@/lib/notifications'

// Call this endpoint hourly via external cron
// GET /api/cron/gamification?secret=YOUR_CRON_SECRET

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const results: Record<string, number | string> = {}

    // ═══════════════════════════════════════
    //  1. Monthly credits reset (1st of month)
    // ═══════════════════════════════════════
    const now = new Date()
    if (now.getUTCDate() === 1 && now.getUTCHours() === 0) {
      await monthlyCreditsReset()
      results.creditsReset = 'done'
    }

    // ═══════════════════════════════════════
    //  2. Auto-insert 3/5 ratings for expired deadlines
    // ═══════════════════════════════════════
    const autoRatings = await insertAutoRatings()
    results.autoRatings = autoRatings

    // ═══════════════════════════════════════
    //  3. Process expired grace periods (demote levels)
    // ═══════════════════════════════════════
    const demoted = await processExpiredGracePeriods()
    results.levelDemotions = demoted

    // ═══════════════════════════════════════
    //  4. Process expired video deadlines (-20 pts)
    // ═══════════════════════════════════════
    const expired = await processExpiredVideoDeadlines()
    results.videoExpired = expired

    // ═══════════════════════════════════════
    //  5. Platinum monthly audit (1st of month, 01:00 UTC)
    // ═══════════════════════════════════════
    if (now.getUTCDate() === 1 && now.getUTCHours() === 1) {
      const platinumCreators = await sql`
        SELECT c.id, c.first_name, c.last_name, c.email,
               c.tiktok_username, c.instagram_username, c.points_total
        FROM creators c
        WHERE c.level = 'platinum' AND c.status = 'active'
      `

      for (const pc of platinumCreators) {
        // Gather 30-day collab data
        const collabData = await sql`
          SELECT b.booking_date, r.name as restaurant_name,
                 rv.rating, rv.comment,
                 b.post_link
          FROM bookings b
          JOIN restaurants r ON b.restaurant_id = r.id
          LEFT JOIN reviews rv ON rv.booking_id = b.id AND rv.reviewer_type = 'restaurant'
          WHERE b.creator_id = ${pc.id}
            AND b.video_verified_at IS NOT NULL
            AND b.video_verified_at > NOW() - INTERVAL '30 days'
          ORDER BY b.booking_date DESC
        `

        // Get points earned this month
        const ptData = await sql`
          SELECT SUM(delta) as pts_earned
          FROM points_transactions
          WHERE creator_id = ${pc.id}
            AND created_at > NOW() - INTERVAL '30 days'
        `

        // Notify admin with audit data
        const auditBody = [
          `Créateur: ${pc.first_name} ${pc.last_name}`,
          `TikTok: ${pc.tiktok_username || 'N/A'} | Instagram: ${pc.instagram_username || 'N/A'}`,
          `Points: ${pc.points_total} (+${ptData[0]?.pts_earned || 0} ce mois)`,
          `Collabs (30j): ${collabData.length}`,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          collabData.map((c: any) =>
            `  - ${c.restaurant_name}${c.rating ? ` (${c.rating}★)` : ''}`
          ).join('\n'),
        ].join('\n')

        await createNotification({
          recipientType: 'admin',
          recipientId: 1,
          type: 'platinum_audit',
          title: `Audit Platinum — ${pc.first_name} ${pc.last_name}`,
          body: auditBody,
          link: '/admin/dashboard',
        })
      }

      results.platinumAudits = platinumCreators.length
    }

    // ═══════════════════════════════════════
    //  6. Gold/Platinum featured notification (1st of month)
    // ═══════════════════════════════════════
    if (now.getUTCDate() === 1 && now.getUTCHours() === 1) {
      const featuredCreators = await sql`
        SELECT id, first_name, last_name, tiktok_username, instagram_username, level
        FROM creators
        WHERE level IN ('gold', 'platinum') AND status = 'active'
      `

      for (const fc of featuredCreators) {
        await createNotification({
          recipientType: 'admin',
          recipientId: 1,
          type: 'featured_creator',
          title: `Créateur ${fc.level === 'platinum' ? 'Platinum' : 'Gold'} à mettre en avant`,
          body: `${fc.first_name} ${fc.last_name} — TikTok: ${fc.tiktok_username || 'N/A'}, Instagram: ${fc.instagram_username || 'N/A'}`,
          link: '/admin/dashboard',
        })

        // Mark as featured
        await sql`UPDATE creators SET featured = TRUE WHERE id = ${fc.id}`
      }

      results.featuredNotifications = featuredCreators.length
    }

    // Log for void usage
    void LEVEL_CONFIG

    return NextResponse.json({ success: true, ...results })
  } catch (err) {
    console.error('Gamification cron error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
