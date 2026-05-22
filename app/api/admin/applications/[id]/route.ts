import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getAdminSession } from '@/lib/session'
import { sendBusinessAccepted, sendBusinessRejected } from '@/lib/email'

const OFFER_LABELS: Record<string, string> = {
  meal_two: 'Repas pour 2',
  meal_three: 'Repas pour 3',
  meal_payment: 'Repas + Rémunération',
  virality_bonus: 'Prime de viralité',
  discuss: 'À discuter',
  // legacy values
  meal_one: 'Repas pour 1',
  payment: 'Rémunération uniquement',
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { id } = await params
    const { action } = await req.json()
    const appId = parseInt(id)

    if (action === 'accept') {
      // Get the application
      const apps = await sql`
        SELECT * FROM business_applications WHERE id = ${appId}
      `
      if (apps.length === 0) {
        return NextResponse.json({ error: 'Candidature non trouvée' }, { status: 404 })
      }
      const app = apps[0]

      // Mark as accepted
      await sql`UPDATE business_applications SET status = 'accepted' WHERE id = ${appId}`

      // Create a restaurant from the application (translate offer value to label)
      const offerText = OFFER_LABELS[app.collab_offer] || app.collab_offer
      const restoResult = await sql`
        INSERT INTO restaurants (
          name, cuisine_type, address, city, arrondissement,
          offer_description, is_published, business_application_id,
          referred_by_code,
          trial_started_at, trial_ends_at, trial_collabs_used
        ) VALUES (
          ${app.business_name}, ${app.cuisine_type}, ${app.address}, ${app.city}, ${app.arrondissement},
          ${offerText}, false, ${appId},
          ${app.referred_by_ambassador_code},
          NOW(), NOW() + INTERVAL '30 days', 0
        )
        RETURNING id
      `

      // Activate restaurant user account and link to the restaurant
      await sql`
        UPDATE restaurant_users
        SET status = 'active', restaurant_id = ${restoResult[0].id}
        WHERE application_id = ${appId}
      `

      // If there's an ambassador code, NOW increment the referral count
      if (app.referred_by_ambassador_code) {
        const creator = await sql`
          SELECT id, referral_count FROM creators
          WHERE ambassador_code = ${app.referred_by_ambassador_code}
        `
        if (creator.length > 0) {
          const newCount = (creator[0].referral_count || 0) + 1
          await sql`
            UPDATE creators
            SET referral_count = ${newCount},
                reward_status = CASE WHEN ${newCount} >= 5 THEN 'eligible' ELSE reward_status END
            WHERE id = ${creator[0].id}
          `
        }
      }

      // Send acceptance email to restaurant
      await sendBusinessAccepted({
        businessName: app.business_name,
        ownerName: app.owner_name,
        email: app.email,
      })

      return NextResponse.json({ success: true, status: 'accepted' })
    }

    if (action === 'reject') {
      const apps = await sql`
        SELECT business_name, owner_name, email FROM business_applications WHERE id = ${appId}
      `
      await sql`UPDATE business_applications SET status = 'rejected' WHERE id = ${appId}`

      if (apps.length > 0) {
        await sendBusinessRejected({
          businessName: apps[0].business_name,
          ownerName: apps[0].owner_name,
          email: apps[0].email,
        })
      }

      return NextResponse.json({ success: true, status: 'rejected' })
    }

    return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
  } catch (err) {
    console.error('Update application error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
