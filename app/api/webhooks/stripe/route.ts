import { NextRequest, NextResponse } from 'next/server'
import { stripe, PLAN_CONFIG, NO_SUB_EXTRA_PRICE } from '@/lib/stripe'
import sql from '@/lib/db'
import { nanoid } from 'nanoid'
import { sendBookingConfirmation } from '@/lib/email'
import { syncCollabUsage } from '@/lib/collab-billing'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const restaurantId = session.metadata?.restaurantId
        const type = session.metadata?.type

        // Per-collab payment — confirm the booking
        if (type === 'collab_payment' && restaurantId) {
          const bookingId = session.metadata?.bookingId
          if (bookingId) {
            // Confirm the booking
            await sql`UPDATE bookings SET status = 'confirmed' WHERE id = ${parseInt(bookingId)}`

            // Create conversation token
            const convToken = nanoid(32)
            await sql`INSERT INTO conversation_tokens (token, booking_id) VALUES (${convToken}, ${parseInt(bookingId)})`

            // Sync collab usage from bookings (race-condition safe)
            const bk2 = await sql`SELECT booking_date FROM bookings WHERE id = ${parseInt(bookingId)}`
            if (bk2.length > 0) {
              await syncCollabUsage(parseInt(restaurantId), bk2[0].booking_date)
            }

            // Send confirmation emails
            const booking = await sql`
              SELECT b.*, c.first_name, c.last_name, c.email as creator_email, c.phone as creator_phone,
                     c.tiktok_username, r.name as restaurant_name, r.address as restaurant_address,
                     r.city as restaurant_city, r.offer_description,
                     ts.start_time, ts.end_time,
                     ba.email as resto_email, ba.owner_name as resto_owner
              FROM bookings b
              JOIN creators c ON b.creator_id = c.id
              JOIN restaurants r ON b.restaurant_id = r.id
              JOIN time_slots ts ON b.time_slot_id = ts.id
              LEFT JOIN business_applications ba ON r.business_application_id = ba.id
              WHERE b.id = ${parseInt(bookingId)}
            `
            if (booking.length > 0) {
              const bk = booking[0]
              const date = new Date(bk.booking_date)
              const DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
              const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://2960agency.com'
              await sendBookingConfirmation({
                creatorName: `${bk.first_name} ${bk.last_name}`,
                creatorEmail: bk.creator_email,
                creatorPhone: bk.creator_phone,
                creatorTiktok: bk.tiktok_username || '',
                restaurantName: bk.restaurant_name,
                restaurantAddress: bk.restaurant_address,
                restaurantCity: bk.restaurant_city,
                restaurantEmail: bk.resto_email,
                restaurantOwner: bk.resto_owner,
                conversationUrl: `${appUrl}/conversation/${convToken}`,
                bookingDate: `${DAYS[date.getDay()]} ${date.toLocaleDateString('fr-FR')}`,
                timeSlot: `${bk.start_time.slice(0, 5)} - ${bk.end_time.slice(0, 5)}`,
                offerDescription: bk.offer_description,
              })
            }
          }
          break
        }

        // Subscription payment
        const plan = session.metadata?.plan
        const subscriptionId = session.subscription as string

        if (restaurantId && plan && PLAN_CONFIG[plan]) {
          const p = PLAN_CONFIG[plan]
          const rid = parseInt(restaurantId)
          const billing = session.metadata?.billing || 'monthly'

          // Cancel the old subscription AFTER the new one is confirmed
          const oldSubId = session.metadata?.oldSubscriptionId
          if (oldSubId) {
            try {
              await stripe.subscriptions.cancel(oldSubId)
            } catch { /* already cancelled */ }
          }

          await sql`
            UPDATE restaurants SET
              subscription = ${plan},
              billing_cycle = ${billing},
              included_collabs = ${p.included},
              extra_collab_price = ${p.extra},
              stripe_subscription_id = ${subscriptionId}
            WHERE id = ${rid}
          `
          // Reset collab_usage for this month — previous collabs were trial or paid per-unit
          const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
          await sql`
            DELETE FROM collab_usage
            WHERE restaurant_id = ${rid} AND month = ${currentMonth}
          `
        }
        break
      }

      case 'customer.subscription.updated': {
        // Plan change mid-month (e.g. basic → active)
        const sub = event.data.object
        const planId = sub.metadata?.plan
        if (planId && PLAN_CONFIG[planId]) {
          const p = PLAN_CONFIG[planId]
          // Find restaurant by stripe_subscription_id
          const resto = await sql`
            SELECT id FROM restaurants WHERE stripe_subscription_id = ${sub.id}
          `
          if (resto.length > 0) {
            const rid = resto[0].id
            await sql`
              UPDATE restaurants SET
                subscription = ${planId},
                included_collabs = ${p.included},
                extra_collab_price = ${p.extra}
              WHERE id = ${rid}
            `
            // Reset usage — previous collabs were billed under the old plan
            const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
            await sql`
              DELETE FROM collab_usage
              WHERE restaurant_id = ${rid} AND month = ${currentMonth}
            `
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object
        // Find restaurant before clearing subscription
        const resto = await sql`
          SELECT id FROM restaurants WHERE stripe_subscription_id = ${sub.id}
        `
        await sql`
          UPDATE restaurants SET
            subscription = 'free',
            billing_cycle = NULL,
            included_collabs = 0,
            extra_collab_price = ${NO_SUB_EXTRA_PRICE},
            stripe_subscription_id = NULL
          WHERE stripe_subscription_id = ${sub.id}
        `
        // Reset usage — old plan's accounting no longer applies
        if (resto.length > 0) {
          const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
          await sql`
            DELETE FROM collab_usage
            WHERE restaurant_id = ${resto[0].id} AND month = ${currentMonth}
          `
        }
        break
      }

      case 'account.updated': {
        // Stripe Connect: creator account onboarding completed
        const account = event.data.object
        if (account.charges_enabled && account.payouts_enabled) {
          await sql`
            UPDATE creators SET stripe_onboarding_complete = true
            WHERE stripe_connect_id = ${account.id}
          `
        }
        break
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
  }

  return NextResponse.json({ received: true })
}
