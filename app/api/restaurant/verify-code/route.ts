import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getRestaurantSession } from '@/lib/session'
import { hashPassword } from '@/lib/auth'

const BREVO_API_KEY = process.env.BREVO_API_KEY!
const FROM_EMAIL = 'contact@2960agency.com'
const FROM_NAME = '2960 Agency'

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

async function sendVerificationEmail(email: string, code: string) {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a08;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:500px;margin:40px auto;padding:0 20px;">
  <div style="margin-bottom:28px;">
    <span style="font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#D94F2A;">2960 Agency</span>
  </div>
  <h1 style="color:#fff;font-size:22px;font-weight:700;margin:0 0 16px;">Code de vérification</h1>
  <p style="color:#c8c3b8;font-size:14px;margin:0 0 24px;">Voici votre code pour confirmer la modification :</p>
  <div style="background:#191714;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;border:1px solid #2a2825;">
    <p style="color:#E8471A;font-size:36px;font-weight:700;margin:0;letter-spacing:0.3em;">${code}</p>
  </div>
  <p style="color:#8a8580;font-size:12px;margin:0;">Ce code expire dans 10 minutes.</p>
</div></body></html>`

  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': BREVO_API_KEY },
    body: JSON.stringify({
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email }],
      subject: `${code} — Code de vérification 2960 Agency`,
      htmlContent: html,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    console.error('Brevo verification email error:', res.status, err)
    throw new Error(`Brevo error: ${res.status}`)
  }
}

export async function POST(req: NextRequest) {
  const session = await getRestaurantSession()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const { action, purpose, code, newEmail, newPassword } = await req.json()

    if (action === 'send_code') {
      const verifCode = generateCode()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
      await sql`
        INSERT INTO verification_codes (email, code, purpose, expires_at)
        VALUES (${session.email}, ${verifCode}, ${purpose}, ${expiresAt.toISOString()})
      `
      await sendVerificationEmail(session.email, verifCode)
      return NextResponse.json({ success: true })
    }

    if (action === 'verify_and_change') {
      const valid = await sql`
        SELECT id FROM verification_codes
        WHERE email = ${session.email} AND code = ${code} AND purpose = ${purpose}
          AND used = false AND expires_at > NOW()
        ORDER BY created_at DESC LIMIT 1
      `
      if (valid.length === 0) return NextResponse.json({ error: 'Code invalide ou expiré' }, { status: 400 })
      await sql`UPDATE verification_codes SET used = true WHERE id = ${valid[0].id}`

      if (purpose === 'change_email' && newEmail) {
        const e1 = await sql`SELECT id FROM restaurant_users WHERE email = ${newEmail} AND id != ${session.id}`
        const e2 = await sql`SELECT id FROM creators WHERE email = ${newEmail}`
        const e3 = await sql`SELECT id FROM admins WHERE email = ${newEmail}`
        if (e1.length > 0 || e2.length > 0 || e3.length > 0) return NextResponse.json({ error: 'Email déjà utilisé' }, { status: 400 })
        await sql`UPDATE restaurant_users SET email = ${newEmail} WHERE id = ${session.id}`
        return NextResponse.json({ success: true })
      }

      if (purpose === 'change_password' && newPassword) {
        if (newPassword.length < 8) return NextResponse.json({ error: 'Minimum 8 caractères' }, { status: 400 })
        const hash = await hashPassword(newPassword)
        await sql`UPDATE restaurant_users SET password_hash = ${hash} WHERE id = ${session.id}`
        return NextResponse.json({ success: true })
      }

      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Verify code error:', message)
    if (message.includes('relation') && message.includes('does not exist')) {
      return NextResponse.json({ error: 'Table manquante — contactez le support' }, { status: 500 })
    }
    return NextResponse.json({ error: 'Erreur serveur — réessayez ou contactez le support' }, { status: 500 })
  }
}
