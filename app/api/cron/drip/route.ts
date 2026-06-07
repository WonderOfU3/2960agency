import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import {
  sendCreatorDripC2, sendCreatorDripC3, sendCreatorDripC4, sendCreatorDripC5,
  sendRestoDripH1, sendRestoDripJ1, sendRestoDripJ3, sendRestoDripJ6,
  sendRestoPublishedNoBookingsJ2, sendRestoPublishedNoBookingsJ5,
  sendNudgeAutoAccept,
} from '@/lib/email'

// Drip email sequences — run hourly (for H+1) or daily at 9:00 UTC
// GET /api/cron/drip?secret=YOUR_CRON_SECRET

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    let c2 = 0, c3 = 0, c4 = 0, c5 = 0
    let rh1 = 0, rj1 = 0, rj3 = 0, rj6 = 0, rp2 = 0, rp5 = 0, nudge = 0

    // ═══════════════════════════════════════
    //  CREATOR DRIP: C2 (J+1), C3 (J+3), C4 (J+7), C5 (J+10)
    //  Condition: active, validated, NO bookings ever
    // ═══════════════════════════════════════

    // C2 — J+1
    const creatorsC2 = await sql`
      SELECT c.id, c.first_name, c.email
      FROM creators c
      WHERE c.status = 'active'
        AND c.validated_at IS NOT NULL
        AND c.validated_at::date = (CURRENT_DATE - INTERVAL '1 day')::date
        AND c.onboarding_step < 2
        AND NOT EXISTS (SELECT 1 FROM bookings b WHERE b.creator_id = c.id)
    `
    for (const cr of creatorsC2) {
      await sendCreatorDripC2({ firstName: cr.first_name, email: cr.email })
      await sql`UPDATE creators SET onboarding_step = 2 WHERE id = ${cr.id}`
      c2++
    }

    // C3 — J+3
    const creatorsC3 = await sql`
      SELECT c.id, c.first_name, c.email
      FROM creators c
      WHERE c.status = 'active'
        AND c.validated_at IS NOT NULL
        AND c.validated_at::date = (CURRENT_DATE - INTERVAL '3 days')::date
        AND c.onboarding_step < 3
        AND NOT EXISTS (SELECT 1 FROM bookings b WHERE b.creator_id = c.id)
    `
    for (const cr of creatorsC3) {
      await sendCreatorDripC3({ firstName: cr.first_name, email: cr.email })
      await sql`UPDATE creators SET onboarding_step = 3 WHERE id = ${cr.id}`
      c3++
    }

    // C4 — J+7
    const creatorsC4 = await sql`
      SELECT c.id, c.first_name, c.email
      FROM creators c
      WHERE c.status = 'active'
        AND c.validated_at IS NOT NULL
        AND c.validated_at::date = (CURRENT_DATE - INTERVAL '7 days')::date
        AND c.onboarding_step < 4
        AND NOT EXISTS (SELECT 1 FROM bookings b WHERE b.creator_id = c.id)
    `
    for (const cr of creatorsC4) {
      await sendCreatorDripC4({ firstName: cr.first_name, email: cr.email })
      await sql`UPDATE creators SET onboarding_step = 4 WHERE id = ${cr.id}`
      c4++
    }

    // C5 — J+10 (Moteur B push)
    const creatorsC5 = await sql`
      SELECT c.id, c.first_name, c.email
      FROM creators c
      WHERE c.status = 'active'
        AND c.validated_at IS NOT NULL
        AND c.validated_at::date = (CURRENT_DATE - INTERVAL '10 days')::date
        AND c.onboarding_step < 5
        AND NOT EXISTS (SELECT 1 FROM bookings b WHERE b.creator_id = c.id)
    `
    for (const cr of creatorsC5) {
      const restos = await sql`
        SELECT r.name, r.max_people, r.virality_tiers
        FROM restaurants r
        WHERE r.is_published = true
        ORDER BY RANDOM() LIMIT 1
      `
      if (restos.length > 0) {
        const tiers = restos[0].virality_tiers || []
        const maxPrime = Array.isArray(tiers) ? Math.max(0, ...tiers.map((t: any) => t.bonus || 0)) : 0
        await sendCreatorDripC5({
          firstName: cr.first_name,
          email: cr.email,
          restoName: restos[0].name,
          maxGuests: restos[0].max_people || 2,
          maxPrime,
        })
        await sql`UPDATE creators SET onboarding_step = 5 WHERE id = ${cr.id}`
        c5++
      }
    }

    // ═══════════════════════════════════════
    //  RESTAURANT DRIP: H+1, J+1, J+3, J+6 (not published)
    // ═══════════════════════════════════════

    // RH1 — H+1: restaurant created 1-2 hours ago, not published
    const restosH1 = await sql`
      SELECT r.id, ru.owner_name, ru.email
      FROM restaurants r
      JOIN restaurant_users ru ON ru.restaurant_id = r.id
      WHERE r.is_published = false
        AND r.created_at >= NOW() - INTERVAL '2 hours'
        AND r.created_at <= NOW() - INTERVAL '1 hour'
        AND r.onboarding_step < 1
    `
    for (const rs of restosH1) {
      await sendRestoDripH1({ ownerName: rs.owner_name, email: rs.email })
      await sql`UPDATE restaurants SET onboarding_step = 1 WHERE id = ${rs.id}`
      rh1++
    }

    // RJ1 — J+1
    const restosJ1 = await sql`
      SELECT r.id, ru.owner_name, ru.email
      FROM restaurants r
      JOIN restaurant_users ru ON ru.restaurant_id = r.id
      WHERE r.is_published = false
        AND r.created_at::date = (CURRENT_DATE - INTERVAL '1 day')::date
        AND r.onboarding_step < 2
    `
    for (const rs of restosJ1) {
      await sendRestoDripJ1({ ownerName: rs.owner_name, email: rs.email })
      await sql`UPDATE restaurants SET onboarding_step = 2 WHERE id = ${rs.id}`
      rj1++
    }

    // RJ3 — J+3
    const restosJ3 = await sql`
      SELECT r.id, ru.owner_name, ru.email
      FROM restaurants r
      JOIN restaurant_users ru ON ru.restaurant_id = r.id
      WHERE r.is_published = false
        AND r.created_at::date = (CURRENT_DATE - INTERVAL '3 days')::date
        AND r.onboarding_step < 3
    `
    for (const rs of restosJ3) {
      await sendRestoDripJ3({ ownerName: rs.owner_name, email: rs.email })
      await sql`UPDATE restaurants SET onboarding_step = 3 WHERE id = ${rs.id}`
      rj3++
    }

    // RJ6 — J+6
    const restosJ6 = await sql`
      SELECT r.id, ru.owner_name, ru.email
      FROM restaurants r
      JOIN restaurant_users ru ON ru.restaurant_id = r.id
      WHERE r.is_published = false
        AND r.created_at::date = (CURRENT_DATE - INTERVAL '6 days')::date
        AND r.onboarding_step < 4
    `
    for (const rs of restosJ6) {
      await sendRestoDripJ6({ ownerName: rs.owner_name, email: rs.email })
      await sql`UPDATE restaurants SET onboarding_step = 4 WHERE id = ${rs.id}`
      rj6++
    }

    // ═══════════════════════════════════════
    //  PUBLISHED BUT 0 BOOKINGS: J+2, J+5
    // ═══════════════════════════════════════

    // RP2 — J+2 after first publish, 0 bookings
    const restosP2 = await sql`
      SELECT r.id, ru.owner_name, ru.email
      FROM restaurants r
      JOIN restaurant_users ru ON ru.restaurant_id = r.id
      WHERE r.is_published = true
        AND r.first_published_at IS NOT NULL
        AND r.first_published_at::date = (CURRENT_DATE - INTERVAL '2 days')::date
        AND r.onboarding_step < 5
        AND NOT EXISTS (SELECT 1 FROM bookings b WHERE b.restaurant_id = r.id)
    `
    for (const rs of restosP2) {
      await sendRestoPublishedNoBookingsJ2({ ownerName: rs.owner_name, email: rs.email })
      await sql`UPDATE restaurants SET onboarding_step = 5 WHERE id = ${rs.id}`
      rp2++
    }

    // RP5 — J+5 after first publish, 0 bookings
    const restosP5 = await sql`
      SELECT r.id, ru.owner_name, ru.email
      FROM restaurants r
      JOIN restaurant_users ru ON ru.restaurant_id = r.id
      WHERE r.is_published = true
        AND r.first_published_at IS NOT NULL
        AND r.first_published_at::date = (CURRENT_DATE - INTERVAL '5 days')::date
        AND r.onboarding_step < 6
        AND NOT EXISTS (SELECT 1 FROM bookings b WHERE b.restaurant_id = r.id)
    `
    for (const rs of restosP5) {
      await sendRestoPublishedNoBookingsJ5({ ownerName: rs.owner_name, email: rs.email })
      await sql`UPDATE restaurants SET onboarding_step = 6 WHERE id = ${rs.id}`
      rp5++
    }

    // ═══════════════════════════════════════
    //  NUDGE: manual restaurants with pending bookings > 24h
    // ═══════════════════════════════════════

    const manualRestos = await sql`
      SELECT DISTINCT r.id, ru.owner_name, ru.email
      FROM restaurants r
      JOIN restaurant_users ru ON ru.restaurant_id = r.id
      JOIN bookings b ON b.restaurant_id = r.id
      WHERE r.auto_accept = false
        AND b.status = 'pending'
        AND b.created_at < NOW() - INTERVAL '24 hours'
    `
    for (const rs of manualRestos) {
      await sendNudgeAutoAccept({ ownerName: rs.owner_name, email: rs.email })
      nudge++
    }

    return NextResponse.json({
      success: true,
      sent: { c2, c3, c4, c5, rh1, rj1, rj3, rj6, rp2, rp5, nudge },
    })
  } catch (err) {
    console.error('Drip cron error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
