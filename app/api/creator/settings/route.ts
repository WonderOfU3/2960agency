import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getCreatorSession } from '@/lib/session'
import { hashPassword, verifyPassword } from '@/lib/auth'

export async function GET() {
  const session = await getCreatorSession()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const creator = await sql`
      SELECT username, first_name, last_name, email, phone,
             tiktok_username, instagram_username, city,
             ambassador_code
      FROM creators WHERE id = ${session.id}
    `
    if (creator.length === 0) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 })
    return NextResponse.json({ profile: creator[0] })
  } catch (err) {
    console.error('Get creator settings error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getCreatorSession()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const body = await req.json()

    // Update basic info
    if (body.action === 'update_profile') {
      // If username is being changed, check uniqueness
      if (body.username) {
        if (body.username.length < 3 || !/^[a-zA-Z0-9_]+$/.test(body.username)) {
          return NextResponse.json({ error: 'Username invalide (min 3 chars, alphanumérique + _)' }, { status: 400 })
        }
        const existingUser = await sql`SELECT id FROM creators WHERE LOWER(username) = LOWER(${body.username}) AND id != ${session.id}`
        if (existingUser.length > 0) {
          return NextResponse.json({ error: 'Ce nom d\'utilisateur est déjà pris' }, { status: 400 })
        }
      }
      await sql`
        UPDATE creators SET
          username = COALESCE(${body.username || null}, username),
          first_name = ${body.firstName},
          last_name = ${body.lastName},
          phone = ${body.phone},
          tiktok_username = ${body.tiktok || null},
          instagram_username = ${body.instagram || null},
          city = ${body.city || null}
        WHERE id = ${session.id}
      `
      return NextResponse.json({ success: true })
    }

    // Change password
    if (body.action === 'change_password') {
      const creator = await sql`SELECT password_hash FROM creators WHERE id = ${session.id}`
      const valid = await verifyPassword(body.currentPassword, creator[0].password_hash)
      if (!valid) return NextResponse.json({ error: 'Mot de passe actuel incorrect' }, { status: 400 })
      if (body.newPassword.length < 8) return NextResponse.json({ error: 'Minimum 8 caractères' }, { status: 400 })
      const hash = await hashPassword(body.newPassword)
      await sql`UPDATE creators SET password_hash = ${hash} WHERE id = ${session.id}`
      return NextResponse.json({ success: true })
    }

    // Change email
    if (body.action === 'change_email') {
      const existing = await sql`SELECT id FROM creators WHERE email = ${body.email} AND id != ${session.id}`
      if (existing.length > 0) return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 400 })
      await sql`UPDATE creators SET email = ${body.email} WHERE id = ${session.id}`
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
  } catch (err) {
    console.error('Update creator settings error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
