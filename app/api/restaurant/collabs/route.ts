import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getRestaurantSession } from '@/lib/session'
import { track } from '@/lib/track'

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
      SELECT offer_description, max_bookings_per_day, max_bookings_per_week, max_people, virality_tiers, photos, is_published, directives, auto_accept
      FROM restaurants WHERE id = ${session.restaurantId}
    `

    return NextResponse.json({
      slots,
      offerDescription: restaurant[0]?.offer_description || '',
      maxPerDay: restaurant[0]?.max_bookings_per_day || 1,
      maxPeople: restaurant[0]?.max_people || 2,
      viralityTiers: restaurant[0]?.virality_tiers || [],
      isPublished: restaurant[0]?.is_published || false,
      photos: restaurant[0]?.photos || [],
      directives: restaurant[0]?.directives || '',
      maxPerWeek: restaurant[0]?.max_bookings_per_week ?? null,
      autoAccept: restaurant[0]?.auto_accept !== false,
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

    // Add recurring slot — auto-publish the restaurant
    if (body.action === 'add_recurring') {
      await sql`
        INSERT INTO time_slots (restaurant_id, day_of_week, start_time, end_time, max_bookings, is_active)
        VALUES (${session.restaurantId}, ${body.dayOfWeek}, ${body.startTime}, ${body.endTime}, ${body.maxBookings || 1}, true)
      `
      await sql`UPDATE restaurants SET is_published = true WHERE id = ${session.restaurantId}`
      track({ event: 'offre_publiee', userId: session.restaurantId, userType: 'restaurant' })
      return NextResponse.json({ success: true })
    }

    // Add specific date slot — auto-publish
    if (body.action === 'add_date') {
      const date = new Date(body.date)
      await sql`
        INSERT INTO time_slots (restaurant_id, day_of_week, start_time, end_time, max_bookings, is_active, specific_date)
        VALUES (${session.restaurantId}, ${date.getDay()}, ${body.startTime}, ${body.endTime}, ${body.maxBookings || 1}, true, ${body.date})
      `
      await sql`UPDATE restaurants SET is_published = true WHERE id = ${session.restaurantId}`
      track({ event: 'offre_publiee', userId: session.restaurantId, userType: 'restaurant' })
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
      await sql`
        UPDATE restaurants
        SET offer_description = ${offerDesc},
            max_people = ${maxPeople},
            virality_tiers = ${JSON.stringify(validTiers)}::jsonb,
            directives = ${directivesText}
        WHERE id = ${session.restaurantId}
      `
      return NextResponse.json({ success: true })
    }

    // Toggle publish
    if (body.action === 'toggle_publish') {
      await sql`UPDATE restaurants SET is_published = ${body.isPublished} WHERE id = ${session.restaurantId}`
      if (body.isPublished) {
        track({ event: 'offre_publiee', userId: session.restaurantId, userType: 'restaurant' })
      }
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
