import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { hashPassword } from '@/lib/auth'

// One-time setup route to create admin account
// DELETE THIS FILE after setting up the admin!
export async function POST(req: NextRequest) {
  try {
    const { email, password, name, setupKey } = await req.json()

    // Simple protection: require a setup key
    if (setupKey !== 'setup2960') {
      return NextResponse.json({ error: 'Clé invalide' }, { status: 403 })
    }

    const hash = await hashPassword(password)

    // Check if admin exists
    const existing = await sql`SELECT id FROM admins WHERE email = ${email}`

    if (existing.length > 0) {
      // Update password
      await sql`UPDATE admins SET password_hash = ${hash}, name = ${name} WHERE email = ${email}`
      return NextResponse.json({ success: true, message: 'Admin mis à jour' })
    }

    // Create new admin
    await sql`
      INSERT INTO admins (email, password_hash, name)
      VALUES (${email}, ${hash}, ${name})
    `

    return NextResponse.json({ success: true, message: 'Admin créé' })
  } catch (err) {
    console.error('Admin setup error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
