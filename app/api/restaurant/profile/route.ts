import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getRestaurantSession } from '@/lib/session'
import { hashPassword, verifyPassword } from '@/lib/auth'

export async function GET() {
  const session = await getRestaurantSession()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const user = await sql`
      SELECT owner_name, email, phone, business_name
      FROM restaurant_users WHERE id = ${session.id}
    `
    if (user.length === 0) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 })

    let resto = null
    if (session.restaurantId) {
      const r = await sql`
        SELECT restaurants.name, restaurants.cuisine_type, restaurants.address, restaurants.city, restaurants.arrondissement,
               ba.instagram_username, ba.tiktok_username, ba.website,
               ba.siren, ba.avg_meal_price
        FROM restaurants
        LEFT JOIN business_applications ba ON restaurants.business_application_id = ba.id
        WHERE restaurants.id = ${session.restaurantId}
      `
      if (r.length > 0) resto = r[0]
    }

    return NextResponse.json({ user: user[0], restaurant: resto })
  } catch (err) {
    console.error('Get restaurant profile error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getRestaurantSession()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const body = await req.json()

    if (body.action === 'update_profile') {
      await sql`
        UPDATE restaurant_users SET
          owner_name = ${body.ownerName},
          phone = ${body.phone},
          business_name = ${body.businessName}
        WHERE id = ${session.id}
      `
      if (session.restaurantId) {
        await sql`
          UPDATE restaurants SET
            name = ${body.businessName},
            cuisine_type = ${body.cuisineType || ''},
            address = ${body.address || ''},
            city = ${body.city || ''},
            arrondissement = ${body.arrondissement || null}
          WHERE id = ${session.restaurantId}
        `
      }
      return NextResponse.json({ success: true })
    }

    if (body.action === 'update_socials') {
      if (session.restaurantId) {
        // Update via business_applications linked to restaurant
        const resto = await sql`SELECT business_application_id FROM restaurants WHERE id = ${session.restaurantId}`
        if (resto.length > 0 && resto[0].business_application_id) {
          await sql`
            UPDATE business_applications SET
              instagram_username = ${body.instagram || null},
              tiktok_username = ${body.tiktok || null},
              website = ${body.website || null}
            WHERE id = ${resto[0].business_application_id}
          `
        }
      }
      return NextResponse.json({ success: true })
    }

    if (body.action === 'update_extra') {
      if (session.restaurantId) {
        const resto = await sql`SELECT business_application_id FROM restaurants WHERE id = ${session.restaurantId}`
        if (resto.length > 0 && resto[0].business_application_id) {
          await sql`
            UPDATE business_applications SET
              siren = ${body.siren || null},
              avg_meal_price = ${body.avgMealPrice ? parseInt(body.avgMealPrice) : null}
            WHERE id = ${resto[0].business_application_id}
          `
        }
      }
      return NextResponse.json({ success: true })
    }

    if (body.action === 'change_password') {
      const user = await sql`SELECT password_hash FROM restaurant_users WHERE id = ${session.id}`
      const valid = await verifyPassword(body.currentPassword, user[0].password_hash)
      if (!valid) return NextResponse.json({ error: 'Mot de passe actuel incorrect' }, { status: 400 })
      if (body.newPassword.length < 8) return NextResponse.json({ error: 'Minimum 8 caractères' }, { status: 400 })
      const hash = await hashPassword(body.newPassword)
      await sql`UPDATE restaurant_users SET password_hash = ${hash} WHERE id = ${session.id}`
      return NextResponse.json({ success: true })
    }

    if (body.action === 'change_email') {
      const existing = await sql`SELECT id FROM restaurant_users WHERE email = ${body.email} AND id != ${session.id}`
      if (existing.length > 0) return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 400 })
      await sql`UPDATE restaurant_users SET email = ${body.email} WHERE id = ${session.id}`
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
  } catch (err) {
    console.error('Update restaurant profile error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
