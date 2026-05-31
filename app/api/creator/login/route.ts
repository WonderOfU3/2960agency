import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { verifyPassword } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email: rawEmail, password } = await req.json()
    const email = typeof rawEmail === 'string' ? rawEmail.trim() : rawEmail

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })
    }

    const creators = await sql`
      SELECT id, email, password_hash, first_name, last_name, status, ambassador_code
      FROM creators WHERE LOWER(email) = LOWER(${email})
    `

    if (creators.length === 0) {
      return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 })
    }

    const creator = creators[0]
    const valid = await verifyPassword(password, creator.password_hash)

    if (!valid) {
      return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 })
    }

    if (creator.status === 'pending_validation') {
      return NextResponse.json({
        error: 'Votre compte est en cours de validation. Nous vous contacterons bientôt.',
        status: 'pending_validation'
      }, { status: 403 })
    }

    if (creator.status === 'rejected') {
      return NextResponse.json({
        error: 'Votre candidature n\'a pas été retenue.',
        status: 'rejected'
      }, { status: 403 })
    }

    if (creator.status === 'blocked') {
      return NextResponse.json({
        error: 'Votre compte a été suspendu. Contactez contact@2960agency.com.',
        status: 'blocked'
      }, { status: 403 })
    }

    // Create session
    const sessionData = JSON.stringify({
      id: creator.id,
      email: creator.email,
      firstName: creator.first_name,
      lastName: creator.last_name,
      ambassadorCode: creator.ambassador_code,
      role: 'creator',
      exp: Date.now() + 24 * 60 * 60 * 1000,
    })
    const token = Buffer.from(sessionData).toString('base64')

    const response = NextResponse.json({
      success: true,
      firstName: creator.first_name,
      status: creator.status,
    })
    response.cookies.set('creator_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
      path: '/',
    })

    return response
  } catch (err) {
    console.error('Creator login error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
