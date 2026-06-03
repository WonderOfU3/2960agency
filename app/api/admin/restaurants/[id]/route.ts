import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getAdminSession } from '@/lib/session'
import { hashPassword } from '@/lib/auth'

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
    const body = await req.json()

    // Block/unblock restaurant
    if (typeof body.isBlocked === 'boolean') {
      await sql`UPDATE restaurants SET is_blocked = ${body.isBlocked} WHERE id = ${parseInt(id)}`
      return NextResponse.json({ success: true })
    }

    // Toggle publish
    if (typeof body.isPublished === 'boolean' && Object.keys(body).length === 1) {
      await sql`
        UPDATE restaurants SET is_published = ${body.isPublished} WHERE id = ${parseInt(id)}
      `
      return NextResponse.json({ success: true })
    }

    // Update subscription plan
    if (body.subscription) {
      const plans: Record<string, { included: number; extra: number }> = {
        free:       { included: 0,   extra: 35 },
        basic:      { included: 1,   extra: 20 },
        active:     { included: 4,   extra: 14 },
        pro:        { included: 999, extra: 0  },
        pro_assist: { included: 999, extra: 0  },
      }
      const plan = plans[body.subscription] || plans.free
      await sql`
        UPDATE restaurants SET
          subscription = ${body.subscription},
          included_collabs = ${plan.included},
          extra_collab_price = ${plan.extra}
        WHERE id = ${parseInt(id)}
      `
      return NextResponse.json({ success: true })
    }

    // Full update
    if (body.name) {
      await sql`
        UPDATE restaurants SET
          name = ${body.name},
          cuisine_type = ${body.cuisineType},
          address = ${body.address},
          city = ${body.city},
          arrondissement = ${body.arrondissement || null},
          offer_description = ${body.offerDescription},
          virality_bonus = ${body.viralityBonus || null},
          max_bookings_per_week = ${body.maxBookingsPerWeek || 3},
          max_bookings_per_day = ${body.maxBookingsPerDay || 1},
          is_published = ${body.isPublished || false}
        WHERE id = ${parseInt(id)}
      `
      return NextResponse.json({ success: true })
    }

    // Reset restaurant user password
    if (body.action === 'reset_password' && body.newPassword) {
      if (body.newPassword.length < 8) {
        return NextResponse.json({ error: 'Mot de passe trop court (min 8 caractères)' }, { status: 400 })
      }
      const hash = await hashPassword(body.newPassword)
      await sql`UPDATE restaurant_users SET password_hash = ${hash} WHERE restaurant_id = ${parseInt(id)}`
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Rien à mettre à jour' }, { status: 400 })
  } catch (err) {
    console.error('Update restaurant error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { id } = await params
    await sql`DELETE FROM restaurants WHERE id = ${parseInt(id)}`
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Delete restaurant error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
