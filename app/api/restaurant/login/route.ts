import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { verifyPassword } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 })
    }

    const users = await sql`
      SELECT id, email, password_hash, owner_name, business_name, phone, restaurant_id, status
      FROM restaurant_users WHERE email = ${email}
    `

    if (users.length === 0) {
      return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 })
    }

    const user = users[0]
    const valid = await verifyPassword(password, user.password_hash)

    if (!valid) {
      return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 })
    }

    if (user.status === 'pending_validation') {
      return NextResponse.json({
        error: 'Votre compte est en cours de validation. Nous vous contacterons bientôt.',
        status: 'pending_validation'
      }, { status: 403 })
    }

    if (user.status === 'blocked') {
      return NextResponse.json({
        error: 'Votre compte a été suspendu. Contactez contact@2960agency.com.',
        status: 'blocked'
      }, { status: 403 })
    }

    const sessionData = JSON.stringify({
      id: user.id,
      email: user.email,
      ownerName: user.owner_name,
      businessName: user.business_name,
      restaurantId: user.restaurant_id,
      role: 'restaurant',
      exp: Date.now() + 24 * 60 * 60 * 1000,
    })
    const token = Buffer.from(sessionData).toString('base64')

    const response = NextResponse.json({
      success: true,
      ownerName: user.owner_name,
    })
    response.cookies.set('restaurant_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60,
      path: '/',
    })

    return response
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Restaurant login error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
