import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getRestaurantSession } from '@/lib/session'
import { sendBookingConfirmation } from '@/lib/email'
import { notifyBookingAccepted, notifyBookingRefused } from '@/lib/notifications'
import { nanoid } from 'nanoid'
import { checkCollabBilling, syncCollabUsage } from '@/lib/collab-billing'
import { stripe, PLAN_CONFIG, NO_SUB_EXTRA_PRICE_ID } from '@/lib/stripe'

export async function GET() {
  const session = await getRestaurantSession()
  if (!session || !session.restaurantId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const bookings = await sql`
      SELECT
        b.*,
        c.first_name as creator_first_name,
        c.last_name as creator_last_name,
        c.email as creator_email,
        c.phone as creator_phone,
        c.tiktok_username as creator_tiktok,
        c.instagram_username as creator_instagram,
        c.username as creator_username,
        ts.start_time, ts.end_time, ts.day_of_week,
        r.name as restaurant_name, r.address as restaurant_address,
        r.offer_description as restaurant_offer,
        r.max_people, r.virality_tiers as restaurant_virality_tiers,
        r.subscription
      FROM bookings b
      JOIN creators c ON b.creator_id = c.id
      JOIN time_slots ts ON b.time_slot_id = ts.id
      JOIN restaurants r ON b.restaurant_id = r.id
      WHERE b.restaurant_id = ${session.restaurantId}
      ORDER BY b.booking_date DESC
    `
    return NextResponse.json({ bookings })
  } catch (err) {
    console.error('Restaurant bookings error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getRestaurantSession()
  if (!session || !session.restaurantId) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { bookingId, action } = await req.json()

    // Verify booking belongs to this restaurant
    const booking = await sql`
      SELECT b.*, c.first_name, c.last_name, c.email as creator_email, c.phone as creator_phone,
             c.tiktok_username, r.name as restaurant_name, r.address as restaurant_address,
             r.city as restaurant_city, r.offer_description,
             ts.start_time, ts.end_time
      FROM bookings b
      JOIN creators c ON b.creator_id = c.id
      JOIN restaurants r ON b.restaurant_id = r.id
      JOIN time_slots ts ON b.time_slot_id = ts.id
      WHERE b.id = ${bookingId} AND b.restaurant_id = ${session.restaurantId}
    `
    if (booking.length === 0) {
      return NextResponse.json({ error: 'Réservation non trouvée' }, { status: 404 })
    }

    const b = booking[0]

    if (action === 'accept') {
      // Check if restaurant needs to pay for this collab
      // Pass booking date so trial logic can check if the date falls within trial window
      const bookingDateStr = b.booking_date ? String(b.booking_date).split('T')[0] : undefined
      const billing = await checkCollabBilling(session.restaurantId, bookingDateStr)

      // Restaurant cannot book (no subscription, trial expired)
      if (!billing.canBook) {
        return NextResponse.json({
          success: false,
          cannotBook: true,
          reason: billing.rejectReason || 'Aucun abonnement actif',
        }, { status: 403 })
      }

      if (billing.needsPayment) {
        // Need to pay first — set status to awaiting_payment and create checkout
        await sql`UPDATE bookings SET status = 'awaiting_payment' WHERE id = ${bookingId}`

        // Get or create Stripe customer
        const resto = await sql`SELECT stripe_customer_id FROM restaurants WHERE id = ${session.restaurantId}`
        let customerId = resto[0]?.stripe_customer_id

        if (!customerId) {
          const customer = await stripe.customers.create({
            email: session.email,
            name: session.businessName,
            metadata: { restaurantId: session.restaurantId.toString() },
          })
          customerId = customer.id
          await sql`UPDATE restaurants SET stripe_customer_id = ${customerId} WHERE id = ${session.restaurantId}`
        }

        // Find the right per-collab price ID
        const extraPriceId = billing.subscription === 'basic'
          ? (PLAN_CONFIG.basic?.extraPriceId || NO_SUB_EXTRA_PRICE_ID)
          : billing.subscription === 'active'
          ? (PLAN_CONFIG.active?.extraPriceId || NO_SUB_EXTRA_PRICE_ID)
          : NO_SUB_EXTRA_PRICE_ID

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://2960agency.com'

        const checkoutSession = await stripe.checkout.sessions.create({
          customer: customerId,
          mode: 'payment',
          line_items: [{ price: extraPriceId, quantity: 1 }],
          success_url: `${appUrl}/restaurant/dashboard?collab_paid=true&booking=${bookingId}`,
          cancel_url: `${appUrl}/restaurant/dashboard?collab_paid=false`,
          metadata: {
            restaurantId: session.restaurantId.toString(),
            bookingId: bookingId.toString(),
            type: 'collab_payment',
          },
        })

        return NextResponse.json({
          success: true,
          needsPayment: true,
          checkoutUrl: checkoutSession.url,
          extraPrice: billing.extraPrice,
        })
      }

      // Free collab — confirm directly
      await sql`UPDATE bookings SET status = 'confirmed' WHERE id = ${bookingId}`

      // If this was a trial collab, increment trial_collabs_used directly
      if (billing.onTrial) {
        const rid = Number(session.restaurantId)
        await sql`
          UPDATE restaurants
          SET trial_collabs_used = COALESCE(trial_collabs_used, 0) + 1
          WHERE id = ${rid}
        `
      }

      // Create conversation token
      const convToken = nanoid(32)
      await sql`INSERT INTO conversation_tokens (token, booking_id) VALUES (${convToken}, ${bookingId})`

      // Sync collab usage by counting confirmed non-trial bookings (race-condition safe)
      if (!billing.onTrial) {
        await syncCollabUsage(session.restaurantId, b.booking_date)
      }

      // Send confirmation emails
      const bookingDate = new Date(b.booking_date)
      const DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://2960agency.com'
      await sendBookingConfirmation({
        creatorName: `${b.first_name} ${b.last_name}`,
        creatorEmail: b.creator_email,
        creatorPhone: b.creator_phone,
        creatorTiktok: b.tiktok_username || '',
        restaurantName: b.restaurant_name,
        restaurantAddress: b.restaurant_address,
        restaurantCity: b.restaurant_city,
        restaurantEmail: session.email,
        restaurantOwner: session.ownerName,
        conversationUrl: `${appUrl}/conversation/${convToken}`,
        bookingDate: `${DAYS[bookingDate.getDay()]} ${bookingDate.toLocaleDateString('fr-FR')}`,
        timeSlot: `${b.start_time.slice(0, 5)} - ${b.end_time.slice(0, 5)}`,
        offerDescription: b.offer_description,
      })

      await notifyBookingAccepted(b.creator_id, b.restaurant_name)
      return NextResponse.json({ success: true })
    }

    if (action === 'refuse') {
      await sql`UPDATE bookings SET status = 'refused' WHERE id = ${bookingId}`
      await notifyBookingRefused(b.creator_id, b.restaurant_name)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
  } catch (err) {
    console.error('Restaurant booking action error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
