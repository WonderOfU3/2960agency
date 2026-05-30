import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { hashPassword } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { token, type, password } = await req.json()

    if (!token || !type || !password || !['creator', 'restaurant'].includes(type)) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Le mot de passe doit faire au moins 8 caractères' }, { status: 400 })
    }

    // Find and validate token
    const codes = await sql`
      SELECT id, email FROM verification_codes
      WHERE code = ${token}
        AND purpose = ${'password_reset_' + type}
        AND used = false
        AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `

    if (codes.length === 0) {
      return NextResponse.json({ error: 'Lien expiré ou invalide. Fais une nouvelle demande.' }, { status: 400 })
    }

    const { id: codeId, email } = codes[0]

    // Hash new password
    const passwordHash = await hashPassword(password)

    // Update password
    if (type === 'creator') {
      const updated = await sql`
        UPDATE creators SET password_hash = ${passwordHash} WHERE LOWER(email) = ${email.toLowerCase()}
        RETURNING id
      `
      if (updated.length === 0) {
        return NextResponse.json({ error: 'Compte non trouvé' }, { status: 404 })
      }
    } else {
      const updated = await sql`
        UPDATE restaurant_users SET password_hash = ${passwordHash} WHERE LOWER(email) = ${email.toLowerCase()}
        RETURNING id
      `
      if (updated.length === 0) {
        return NextResponse.json({ error: 'Compte non trouvé' }, { status: 404 })
      }
    }

    // Mark token as used
    await sql`UPDATE verification_codes SET used = true WHERE id = ${codeId}`

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Reset password error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
