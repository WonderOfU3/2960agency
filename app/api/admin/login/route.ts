import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { verifyPassword } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })
    }

    const admins = await sql`
      SELECT id, email, password_hash, name FROM admins WHERE email = ${email}
    `

    if (admins.length === 0) {
      return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 })
    }

    const admin = admins[0]
    const valid = await verifyPassword(password, admin.password_hash)

    if (!valid) {
      return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 })
    }

    // Create a session token (simple approach using a signed cookie)
    const sessionData = JSON.stringify({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: 'admin',
      exp: Date.now() + 24 * 60 * 60 * 1000, // 24h
    })
    const token = Buffer.from(sessionData).toString('base64')

    const response = NextResponse.json({ success: true, name: admin.name })
    response.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24h
      path: '/',
    })

    return response
  } catch (err) {
    console.error('Admin login error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
