import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getRestaurantSession } from '@/lib/session'
import { track } from '@/lib/track'
import { triggerMoteurB } from '@/lib/moteur-b'

// GET: list restaurant's own time slots
export async function GET() {
  const session = await getRestaurantSession()
  if (!session || !session.restaurantId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const slots = await sql`
      SELECT * FROM time_slots
      WHERE restaurant_id = ${session.restaurantId}
      ORDER BY specific_date ASC NULLS LAST, day_of_week ASC, start_time ASC
    `

    const restaurant = await sql`
      SELECT offer_description, max_bookings_per_day, max_bookings_per_week, max_people, virality_tiers, photos, is_published, directives, auto_accept, first_published_at, dietary_options
      FROM restaurants WHERE id = ${session.restaurantId}
    `

    const r = restaurant[0]
    const isFirstTime = slots.length === 0 && !r?.first_published_at

    return NextResponse.json({
      slots,
      offerDescription: r?.offer_description || '',
      maxPerDay: r?.max_bookings_per_day || 1,
      maxPeople: r?.max_people || 2,
      viralityTiers: r?.virality_tiers || [],
      isPublished: r?.is_published || false,
      photos: r?.photos || [],
      directives: r?.directives || '',
      maxPerWeek: r?.max_bookings_per_week ?? null,
      autoAccept: r?.auto_accept !== false,
      dietaryOptions: r?.dietary_options || [],
      firstPublishedAt: r?.first_published_at || null,
      isFirstTime,
    })
  } catch (err) {
    console.error('Fetch collabs error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST: add or delete a time slot
export async function POST(req: NextRequest) {
  const session = await getRestaurantSession()
  if (!session || !session.restaurantId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const body = await req.json()

    // Delete a slot
    if (body.action === 'delete') {
      await sql`DELETE FROM time_slots WHERE id = ${body.slotId} AND restaurant_id = ${session.restaurantId}`
      return NextResponse.json({ success: true })
    }

    // Add recurring slot
    if (body.action === 'add_recurring') {
      await sql`
        INSERT INTO time_slots (restaurant_id, day_of_week, start_time, end_time, max_bookings, is_active)
        VALUES (${session.restaurantId}, ${body.dayOfWeek}, ${body.startTime}, ${body.endTime}, ${body.maxBookings || 1}, true)
      `
      return NextResponse.json({ success: true })
    }

    // Add specific date slot
    if (body.action === 'add_date') {
      const date = new Date(body.date)
      await sql`
        INSERT INTO time_slots (restaurant_id, day_of_week, start_time, end_time, max_bookings, is_active, specific_date)
        VALUES (${session.restaurantId}, ${date.getDay()}, ${body.startTime}, ${body.endTime}, ${body.maxBookings || 1}, true, ${body.date})
      `
      return NextResponse.json({ success: true })
    }

    // Update offer (structured: max_people + virality_tiers)
    if (body.action === 'update_offer') {
      const maxPeople = Math.max(1, Math.min(20, parseInt(body.maxPeople) || 2))
      const tiers = Array.isArray(body.viralityTiers) ? body.viralityTiers : []
      const validTiers = tiers
        .filter((t: { views?: number; bonus?: number }) => t.views && t.bonus && t.views > 0 && t.bonus > 0)
        .sort((a: { views: number }, b: { views: number }) => a.views - b.views)
      const offerDesc = `Repas de 1 à ${maxPeople} personne${maxPeople > 1 ? 's' : ''}`
      const directivesText = typeof body.directives === 'string' ? body.directives.slice(0, 1000) : null
      const dietaryOpts = Array.isArray(body.dietaryOptions) ? body.dietaryOptions.filter((o: string) => typeof o === 'string') : []
      await sql`
        UPDATE restaurants
        SET offer_description = ${offerDesc},
            max_people = ${maxPeople},
            virality_tiers = ${JSON.stringify(validTiers)}::jsonb,
            directives = ${directivesText},
            dietary_options = ${dietaryOpts}
        WHERE id = ${session.restaurantId}
      `
      return NextResponse.json({ success: true })
    }

    // Toggle publish (also sets first_published_at on first publish)
    if (body.action === 'toggle_publish') {
      if (body.isPublished) {
        await sql`
          UPDATE restaurants
          SET is_published = true,
              first_published_at = COALESCE(first_published_at, NOW())
          WHERE id = ${session.restaurantId}
        `
        track({ event: 'offre_publiee', userId: session.restaurantId, userType: 'restaurant' })
        // Fire-and-forget Moteur B push to matching creators
        triggerMoteurB(session.restaurantId).catch(() => {})
      } else {
        await sql`UPDATE restaurants SET is_published = false WHERE id = ${session.restaurantId}`
      }
      return NextResponse.json({ success: true })
    }

    // Seed defaults for first-time restaurants (onboarding)
    if (body.action === 'seed_defaults') {
      // Insert 14 default slots: 7 days × 2 ranges (12:00-15:00 + 19:00-21:00)
      for (let day = 0; day < 7; day++) {
        await sql`
          INSERT INTO time_slots (restaurant_id, day_of_week, start_time, end_time, max_bookings, is_active)
          VALUES (${session.restaurantId}, ${day}, '12:00', '15:00', 1, true)
        `
        await sql`
          INSERT INTO time_slots (restaurant_id, day_of_week, start_time, end_time, max_bookings, is_active)
          VALUES (${session.restaurantId}, ${day}, '19:00', '21:00', 1, true)
        `
      }
      await sql`
        UPDATE restaurants
        SET max_people = 3, max_bookings_per_week = 5, offer_description = 'Repas de 1 à 3 personnes'
        WHERE id = ${session.restaurantId}
      `
      return NextResponse.json({ success: true })
    }

    // Update an existing slot inline
    if (body.action === 'update_slot') {
      await sql`
        UPDATE time_slots
        SET start_time = ${body.startTime}, end_time = ${body.endTime}, max_bookings = ${body.maxBookings || 1}
        WHERE id = ${body.slotId} AND restaurant_id = ${session.restaurantId}
      `
      return NextResponse.json({ success: true })
    }

    // Add photo URL
    if (body.action === 'add_photo') {
      await sql`UPDATE restaurants SET photos = array_append(photos, ${body.url}) WHERE id = ${session.restaurantId}`
      return NextResponse.json({ success: true })
    }

    // Remove photo URL
    if (body.action === 'remove_photo') {
      await sql`UPDATE restaurants SET photos = array_remove(photos, ${body.url}) WHERE id = ${session.restaurantId}`
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
  } catch (err) {
    console.error('Collab action error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
