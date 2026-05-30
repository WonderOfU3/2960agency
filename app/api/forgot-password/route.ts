import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { nanoid } from 'nanoid'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { email, type } = await req.json()

    if (!email || !type || !['creator', 'restaurant'].includes(type)) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()

    // Find user
    let firstName = ''
    if (type === 'creator') {
      const user = await sql`SELECT first_name FROM creators WHERE LOWER(email) = ${normalizedEmail}`
      if (user.length === 0) {
        // Don't reveal if email exists — always show success
        return NextResponse.json({ success: true })
      }
      firstName = user[0].first_name
    } else {
      const user = await sql`
        SELECT ru.id, ba.owner_name FROM restaurant_users ru
        JOIN business_applications ba ON ru.business_application_id = ba.id
        WHERE LOWER(ru.email) = ${normalizedEmail}
      `
      if (user.length === 0) {
        return NextResponse.json({ success: true })
      }
      firstName = user[0].owner_name || ''
    }

    // Generate reset token
    const token = nanoid(48)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await sql`
      INSERT INTO verification_codes (email, code, purpose, expires_at)
      VALUES (${normalizedEmail}, ${token}, ${'password_reset_' + type}, ${expiresAt})
    `

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://2960agency.com'
    const resetUrl = `${appUrl}/reset-password?token=${token}&type=${type}`

    await sendPasswordResetEmail({
      email: normalizedEmail,
      firstName: firstName || 'là',
      resetUrl,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Forgot password error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
