import sql from '@/lib/db'
import { sendMoteurBPush } from '@/lib/email'
import { createNotification } from '@/lib/notifications'

const MAX_PUSHES_PER_WEEK = 2
const MAX_CREATORS_PER_RESTAURANT = 10

export async function triggerMoteurB(restaurantId: number) {
  try {
    // Fetch restaurant details
    const restos = await sql`
      SELECT name, city, cuisine_type, max_people, virality_tiers, auto_accept
      FROM restaurants WHERE id = ${restaurantId}
    `
    if (restos.length === 0) return
    const resto = restos[0]

    // Only push for auto-accept restaurants
    if (!resto.auto_accept) return

    // Calculate net prime (75% of max tier)
    const tiers = resto.virality_tiers || []
    const maxBonus = Array.isArray(tiers) ? Math.max(0, ...tiers.map((t: any) => t.bonus || 0)) : 0
    const netPrime = Math.round(maxBonus * 0.75)

    // Find matching creators: same city, active, not already pushed for this restaurant
    const creators = await sql`
      SELECT c.id, c.first_name, c.email, c.city, c.niche
      FROM creators c
      WHERE c.status = 'active'
        AND (c.city IS NOT NULL AND LOWER(c.city) = LOWER(${resto.city || ''}))
        AND NOT EXISTS (
          SELECT 1 FROM moteur_b_pushes p
          WHERE p.creator_id = c.id AND p.restaurant_id = ${restaurantId}
        )
      ORDER BY RANDOM()
      LIMIT ${MAX_CREATORS_PER_RESTAURANT * 2}
    `

    let pushed = 0
    for (const creator of creators) {
      if (pushed >= MAX_CREATORS_PER_RESTAURANT) break

      // Check cap: max 2 pushes per creator per 7 days
      const recentPushes = await sql`
        SELECT COUNT(*) as cnt FROM moteur_b_pushes
        WHERE creator_id = ${creator.id}
          AND pushed_at > NOW() - INTERVAL '7 days'
      `
      if (parseInt(recentPushes[0].cnt) >= MAX_PUSHES_PER_WEEK) continue

      // Send push notification + email
      await createNotification({
        recipientType: 'creator',
        recipientId: creator.id,
        type: 'moteur_b',
        title: `${resto.name} aimerait te recevoir`,
        body: `Emmène jusqu'à ${resto.max_people || 2} potes.${netPrime > 0 ? ` Gagne jusqu'à ${netPrime}€.` : ''} Réserve en 1 clic.`,
        link: '/creator/dashboard',
      })

      await sendMoteurBPush({
        firstName: creator.first_name,
        email: creator.email,
        restoName: resto.name,
        maxGuests: resto.max_people || 2,
        netPrime,
      })

      // Track the push
      await sql`
        INSERT INTO moteur_b_pushes (creator_id, restaurant_id)
        VALUES (${creator.id}, ${restaurantId})
      `

      pushed++
    }

    return pushed
  } catch (err) {
    console.error('Moteur B error:', err)
    return 0
  }
}
