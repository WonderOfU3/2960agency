import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import {
  sendCreatorC1,
  sendCreatorLien,
  sendCreatorWB1,
  sendCreatorWB2,
  sendRestoR0,
  sendRestoDripRJ1,
  sendRestoDripRJ3,
  sendRestoDripRJ6,
  sendRestoRP2,
  sendRestoRP5,
  sendRestoNudgeAuto,
  sendRestoWB,
} from '@/lib/email'

// Drip email sequences — runs daily at 10:00 UTC
// GET /api/cron/drip?secret=YOUR_CRON_SECRET

function formatDateFR(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    let c1 = 0, cLien1 = 0, cLien3 = 0, cLien5 = 0, cWB1 = 0, cWB2 = 0
    let rh1 = 0, rj1 = 0, rj3 = 0, rj6 = 0, rp2 = 0, rp5 = 0, rNudge = 0, rWB = 0

    // ═══════════════════════════════════════
    //  CREATOR SEQUENCES
    // ═══════════════════════════════════════

    // C1 — J+1: validated 1 day ago, onboarding_step < 2, no offre_vue event
    const creatorsC1 = await sql`
      SELECT c.id, c.first_name, c.email
      FROM creators c
      WHERE c.status = 'active'
        AND c.validated_at IS NOT NULL
        AND c.validated_at::date = (CURRENT_DATE - INTERVAL '1 day')::date
        AND c.onboarding_step < 2
        AND NOT EXISTS (
          SELECT 1 FROM analytics_events ae
          WHERE ae.user_id = c.id::text
            AND ae.user_type = 'creator'
            AND ae.event = 'offre_vue'
        )
    `
    for (const cr of creatorsC1) {
      await sendCreatorC1({ firstName: cr.first_name, email: cr.email })
      await sql`UPDATE creators SET onboarding_step = 2 WHERE id = ${cr.id}`
      c1++
    }

    // C-LIEN J+1: booking_date = yesterday, post_link IS NULL, post_overdue = false
    const liensJ1 = await sql`
      SELECT b.id AS booking_id, b.booking_date,
             c.first_name, c.email,
             r.name AS resto_name
      FROM bookings b
      JOIN creators c ON c.id = b.creator_id
      JOIN restaurants r ON r.id = b.restaurant_id
      WHERE b.status IN ('confirmed', 'completed')
        AND b.booking_date::date = (CURRENT_DATE - INTERVAL '1 day')::date
        AND b.post_link IS NULL
        AND b.post_overdue = false
    `
    for (const l of liensJ1) {
      const deadline = new Date(l.booking_date)
      deadline.setDate(deadline.getDate() + 5)
      await sendCreatorLien({
        firstName: l.first_name,
        email: l.email,
        restoName: l.resto_name,
        deadlineDate: formatDateFR(deadline),
        dayNum: 1,
      })
      cLien1++
    }

    // C-LIEN J+3: booking_date = 3 days ago
    const liensJ3 = await sql`
      SELECT b.id AS booking_id, b.booking_date,
             c.first_name, c.email,
             r.name AS resto_name
      FROM bookings b
      JOIN creators c ON c.id = b.creator_id
      JOIN restaurants r ON r.id = b.restaurant_id
      WHERE b.status IN ('confirmed', 'completed')
        AND b.booking_date::date = (CURRENT_DATE - INTERVAL '3 days')::date
        AND b.post_link IS NULL
        AND b.post_overdue = false
    `
    for (const l of liensJ3) {
      const deadline = new Date(l.booking_date)
      deadline.setDate(deadline.getDate() + 5)
      await sendCreatorLien({
        firstName: l.first_name,
        email: l.email,
        restoName: l.resto_name,
        deadlineDate: formatDateFR(deadline),
        dayNum: 3,
      })
      cLien3++
    }

    // C-LIEN J+5: booking_date = 5 days ago
    const liensJ5 = await sql`
      SELECT b.id AS booking_id, b.booking_date,
             c.first_name, c.email,
             r.name AS resto_name
      FROM bookings b
      JOIN creators c ON c.id = b.creator_id
      JOIN restaurants r ON r.id = b.restaurant_id
      WHERE b.status IN ('confirmed', 'completed')
        AND b.booking_date::date = (CURRENT_DATE - INTERVAL '5 days')::date
        AND b.post_link IS NULL
        AND b.post_overdue = false
    `
    for (const l of liensJ5) {
      const deadline = new Date(l.booking_date)
      deadline.setDate(deadline.getDate() + 5)
      await sendCreatorLien({
        firstName: l.first_name,
        email: l.email,
        restoName: l.resto_name,
        deadlineDate: formatDateFR(deadline),
        dayNum: 5,
      })
      cLien5++
    }

    // C-WB1 — J+7: validated 7+ days ago, onboarding_step < 7, no connexion in 7 days, no offre_vue ever
    const creatorsWB1 = await sql`
      SELECT c.id, c.first_name, c.email, c.city
      FROM creators c
      WHERE c.status = 'active'
        AND c.validated_at IS NOT NULL
        AND c.validated_at::date <= (CURRENT_DATE - INTERVAL '7 days')::date
        AND c.onboarding_step < 7
        AND NOT EXISTS (
          SELECT 1 FROM analytics_events ae
          WHERE ae.user_id = c.id::text
            AND ae.user_type = 'creator'
            AND ae.event = 'connexion'
            AND ae.created_at >= NOW() - INTERVAL '7 days'
        )
        AND NOT EXISTS (
          SELECT 1 FROM analytics_events ae
          WHERE ae.user_id = c.id::text
            AND ae.user_type = 'creator'
            AND ae.event = 'offre_vue'
        )
    `
    for (const cr of creatorsWB1) {
      const restos = await sql`
        SELECT r.name, r.city, r.virality_tiers
        FROM restaurants r
        WHERE r.is_published = true
          AND r.auto_accept = true
          AND (r.city = ${cr.city} OR ${!cr.city})
        ORDER BY RANDOM() LIMIT 1
      `
      if (restos.length === 0 && cr.city) {
        // Fallback: any published auto-accept restaurant
        const fallback = await sql`
          SELECT r.name, r.city, r.virality_tiers
          FROM restaurants r
          WHERE r.is_published = true AND r.auto_accept = true
          ORDER BY RANDOM() LIMIT 1
        `
        if (fallback.length === 0) continue
        restos.push(fallback[0])
      }
      if (restos.length === 0) continue

      const resto = restos[0]
      const tiers = Array.isArray(resto.virality_tiers) ? resto.virality_tiers : []
      const maxBonus = Math.max(0, ...tiers.map((t: any) => t.bonus || 0))
      const netPrime = Math.round(maxBonus * 0.75)

      await sendCreatorWB1({
        firstName: cr.first_name,
        email: cr.email,
        restoName: resto.name,
        quartier: resto.city || cr.city || 'Paris',
        netPrime,
      })
      await sql`UPDATE creators SET onboarding_step = 7 WHERE id = ${cr.id}`
      cWB1++
    }

    // C-WB2 — J+21: no connexion in 21 days, onboarding_step < 8
    const creatorsWB2 = await sql`
      SELECT c.id, c.first_name, c.email, c.city
      FROM creators c
      WHERE c.status = 'active'
        AND c.validated_at IS NOT NULL
        AND c.onboarding_step < 8
        AND NOT EXISTS (
          SELECT 1 FROM analytics_events ae
          WHERE ae.user_id = c.id::text
            AND ae.user_type = 'creator'
            AND ae.event = 'connexion'
            AND ae.created_at >= NOW() - INTERVAL '21 days'
        )
    `
    for (const cr of creatorsWB2) {
      const restos = await sql`
        SELECT r.name, r.city
        FROM restaurants r
        WHERE r.is_published = true
          AND r.auto_accept = true
          AND (r.city = ${cr.city} OR ${!cr.city})
        ORDER BY RANDOM() LIMIT 1
      `
      if (restos.length === 0 && cr.city) {
        const fallback = await sql`
          SELECT r.name, r.city
          FROM restaurants r
          WHERE r.is_published = true AND r.auto_accept = true
          ORDER BY RANDOM() LIMIT 1
        `
        if (fallback.length === 0) continue
        restos.push(fallback[0])
      }
      if (restos.length === 0) continue

      const resto = restos[0]
      await sendCreatorWB2({
        firstName: cr.first_name,
        email: cr.email,
        restoName: resto.name,
        quartier: resto.city || cr.city || 'Paris',
      })
      await sql`UPDATE creators SET onboarding_step = 8 WHERE id = ${cr.id}`
      cWB2++
    }

    // ═══════════════════════════════════════
    //  RESTAURANT SEQUENCES
    // ═══════════════════════════════════════

    // RH1 — H+1: created 1-2 hours ago, not published, onboarding_step < 1
    const restosH1 = await sql`
      SELECT r.id, r.name, ru.email
      FROM restaurants r
      JOIN restaurant_users ru ON ru.restaurant_id = r.id
      WHERE r.is_published = false
        AND r.created_at >= NOW() - INTERVAL '2 hours'
        AND r.created_at <= NOW() - INTERVAL '1 hour'
        AND r.onboarding_step < 1
    `
    for (const rs of restosH1) {
      await sendRestoR0({ restoName: rs.name, email: rs.email })
      await sql`UPDATE restaurants SET onboarding_step = 1 WHERE id = ${rs.id}`
      rh1++
    }

    // RJ1 — J+1: created 1 day ago, not published, onboarding_step < 2
    const restosJ1 = await sql`
      SELECT r.id, r.name, ru.email
      FROM restaurants r
      JOIN restaurant_users ru ON ru.restaurant_id = r.id
      WHERE r.is_published = false
        AND r.created_at::date = (CURRENT_DATE - INTERVAL '1 day')::date
        AND r.onboarding_step < 2
    `
    for (const rs of restosJ1) {
      await sendRestoDripRJ1({ restoName: rs.name, email: rs.email })
      await sql`UPDATE restaurants SET onboarding_step = 2 WHERE id = ${rs.id}`
      rj1++
    }

    // RJ3 — J+3: created 3 days ago, not published, onboarding_step < 3
    const restosJ3 = await sql`
      SELECT r.id, r.name, ru.email
      FROM restaurants r
      JOIN restaurant_users ru ON ru.restaurant_id = r.id
      WHERE r.is_published = false
        AND r.created_at::date = (CURRENT_DATE - INTERVAL '3 days')::date
        AND r.onboarding_step < 3
    `
    for (const rs of restosJ3) {
      await sendRestoDripRJ3({ restoName: rs.name, email: rs.email })
      await sql`UPDATE restaurants SET onboarding_step = 3 WHERE id = ${rs.id}`
      rj3++
    }

    // RJ6 — J+6: created 6 days ago, not published, onboarding_step < 4
    const restosJ6 = await sql`
      SELECT r.id, r.name, ru.email
      FROM restaurants r
      JOIN restaurant_users ru ON ru.restaurant_id = r.id
      WHERE r.is_published = false
        AND r.created_at::date = (CURRENT_DATE - INTERVAL '6 days')::date
        AND r.onboarding_step < 4
    `
    for (const rs of restosJ6) {
      await sendRestoDripRJ6({ restoName: rs.name, email: rs.email })
      await sql`UPDATE restaurants SET onboarding_step = 4 WHERE id = ${rs.id}`
      rj6++
    }

    // RP2 — J+2 after first_published_at, 0 bookings, onboarding_step < 5
    const restosP2 = await sql`
      SELECT r.id, r.name, r.auto_accept, r.virality_tiers, ru.email
      FROM restaurants r
      JOIN restaurant_users ru ON ru.restaurant_id = r.id
      WHERE r.is_published = true
        AND r.first_published_at IS NOT NULL
        AND r.first_published_at::date = (CURRENT_DATE - INTERVAL '2 days')::date
        AND r.onboarding_step < 5
        AND NOT EXISTS (SELECT 1 FROM bookings b WHERE b.restaurant_id = r.id)
    `
    for (const rs of restosP2) {
      const tiers = Array.isArray(rs.virality_tiers) ? rs.virality_tiers : []
      await sendRestoRP2({
        restoName: rs.name,
        email: rs.email,
        isManual: !rs.auto_accept,
        hasPrime: tiers.length > 0,
      })
      await sql`UPDATE restaurants SET onboarding_step = 5 WHERE id = ${rs.id}`
      rp2++
    }

    // RP5 — J+5 after first_published_at, 0 bookings, onboarding_step < 6
    const restosP5 = await sql`
      SELECT r.id, r.name, ru.email
      FROM restaurants r
      JOIN restaurant_users ru ON ru.restaurant_id = r.id
      WHERE r.is_published = true
        AND r.first_published_at IS NOT NULL
        AND r.first_published_at::date = (CURRENT_DATE - INTERVAL '5 days')::date
        AND r.onboarding_step < 6
        AND NOT EXISTS (SELECT 1 FROM bookings b WHERE b.restaurant_id = r.id)
    `
    for (const rs of restosP5) {
      await sendRestoRP5({ restoName: rs.name, email: rs.email })
      await sql`UPDATE restaurants SET onboarding_step = 6 WHERE id = ${rs.id}`
      rp5++
    }

    // R-NUDGE-AUTO: auto_accept=false, pending booking > 24h old
    const nudgeRestos = await sql`
      SELECT DISTINCT ON (r.id)
        r.id, r.name, ru.email,
        c.first_name AS creator_name
      FROM restaurants r
      JOIN restaurant_users ru ON ru.restaurant_id = r.id
      JOIN bookings b ON b.restaurant_id = r.id
      JOIN creators c ON c.id = b.creator_id
      WHERE r.auto_accept = false
        AND b.status = 'pending'
        AND b.created_at < NOW() - INTERVAL '24 hours'
      ORDER BY r.id, b.created_at ASC
    `
    for (const rs of nudgeRestos) {
      await sendRestoNudgeAuto({
        restoName: rs.name,
        email: rs.email,
        creatorName: rs.creator_name,
      })
      rNudge++
    }

    // R-WB — J+21: published, no connexion/booking activity in 21 days, onboarding_step < 9
    const restosWB = await sql`
      SELECT r.id, r.name, ru.email
      FROM restaurants r
      JOIN restaurant_users ru ON ru.restaurant_id = r.id
      WHERE r.is_published = true
        AND r.onboarding_step < 9
        AND NOT EXISTS (
          SELECT 1 FROM analytics_events ae
          WHERE ae.user_id = r.id::text
            AND ae.user_type = 'restaurant'
            AND ae.event IN ('connexion', 'booking')
            AND ae.created_at >= NOW() - INTERVAL '21 days'
        )
    `
    for (const rs of restosWB) {
      await sendRestoWB({ restoName: rs.name, email: rs.email })
      await sql`UPDATE restaurants SET onboarding_step = 9 WHERE id = ${rs.id}`
      rWB++
    }

    return NextResponse.json({
      success: true,
      sent: {
        c1, cLien1, cLien3, cLien5, cWB1, cWB2,
        rh1, rj1, rj3, rj6, rp2, rp5, rNudge, rWB,
      },
    })
  } catch (err) {
    console.error('Drip cron error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
