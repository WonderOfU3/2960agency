import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { sendCreatorDripC2, sendCreatorDripC3, sendCreatorDripC4, sendCreatorDripC5, sendRestoDripR2, sendRestoDripR3 } from '@/lib/email'

// Drip email sequences — run daily at 9:00 UTC
// GET /api/cron/drip?secret=YOUR_CRON_SECRET

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    let c2 = 0, c3 = 0, c4 = 0, c5 = 0, r2 = 0, r3 = 0

    // ═══════════════════════════════════════
    //  CREATOR DRIP: C2 (J+1), C3 (J+3), C4 (J+7)
    //  Condition: active, validated, NO bookings ever
    // ═══════════════════════════════════════

    // C2 — J+1: validated yesterday, no bookings, step < 2
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

    // C3 — J+3: validated 3 days ago, no bookings, step < 3
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

    // C4 — J+7: validated 7 days ago, no bookings, step < 4
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

    // C5 — J+10: validated 10 days ago, no bookings, step < 5
    // Push Moteur B: suggest a real published restaurant
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
      // Find a published restaurant to suggest
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
    //  RESTAURANT DRIP: R2 (J+2), R3 (J+7)
    //  Condition: restaurant exists, NOT published
    // ═══════════════════════════════════════

    // R2 — J+2: created 2 days ago, not published, step < 2
    const restosR2 = await sql`
      SELECT r.id, ru.owner_name, ru.email
      FROM restaurants r
      JOIN restaurant_users ru ON ru.restaurant_id = r.id
      WHERE r.is_published = false
        AND r.created_at::date = (CURRENT_DATE - INTERVAL '2 days')::date
        AND r.onboarding_step < 2
    `
    for (const rs of restosR2) {
      await sendRestoDripR2({ ownerName: rs.owner_name, email: rs.email })
      await sql`UPDATE restaurants SET onboarding_step = 2 WHERE id = ${rs.id}`
      r2++
    }

    // R3 — J+7: created 7 days ago, not published, step < 3
    const restosR3 = await sql`
      SELECT r.id, ru.owner_name, ru.email
      FROM restaurants r
      JOIN restaurant_users ru ON ru.restaurant_id = r.id
      WHERE r.is_published = false
        AND r.created_at::date = (CURRENT_DATE - INTERVAL '7 days')::date
        AND r.onboarding_step < 3
    `
    for (const rs of restosR3) {
      await sendRestoDripR3({ ownerName: rs.owner_name, email: rs.email })
      await sql`UPDATE restaurants SET onboarding_step = 3 WHERE id = ${rs.id}`
      r3++
    }

    return NextResponse.json({
      success: true,
      sent: { c2, c3, c4, c5, r2, r3 },
    })
  } catch (err) {
    console.error('Drip cron error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
