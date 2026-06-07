import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getAdminSession } from '@/lib/session'
import { sendCreatorValidation } from '@/lib/email'
import { hashPassword } from '@/lib/auth'
import { track } from '@/lib/track'

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
    const { action } = body

    if (action === 'validate') {
      await sql`UPDATE creators SET status = 'active', validated_at = NOW(), onboarding_step = 1 WHERE id = ${parseInt(id)}`
      track({ event: 'inscription_validee', userId: id, userType: 'creator' })

      // Send validation email to creator
      const creator = await sql`
        SELECT first_name, email FROM creators WHERE id = ${parseInt(id)}
      `
      if (creator.length > 0) {
        await sendCreatorValidation({
          firstName: creator[0].first_name,
          email: creator[0].email,
        })
      }

      return NextResponse.json({ success: true, status: 'active' })
    }

    if (action === 'reject') {
      await sql`UPDATE creators SET status = 'rejected' WHERE id = ${parseInt(id)}`
      return NextResponse.json({ success: true, status: 'rejected' })
    }

    if (action === 'block') {
      await sql`UPDATE creators SET status = 'blocked' WHERE id = ${parseInt(id)}`
      return NextResponse.json({ success: true, status: 'blocked' })
    }

    if (action === 'mark_paid') {
      await sql`UPDATE creators SET reward_status = 'paid' WHERE id = ${parseInt(id)}`
      return NextResponse.json({ success: true, reward_status: 'paid' })
    }

    if (action === 'reset_password') {
      const newPassword = body.newPassword
      if (!newPassword || newPassword.length < 8) {
        return NextResponse.json({ error: 'Mot de passe trop court (min 8 caractères)' }, { status: 400 })
      }
      const hash = await hashPassword(newPassword)
      await sql`UPDATE creators SET password_hash = ${hash} WHERE id = ${parseInt(id)}`
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
  } catch (err) {
    console.error('Update creator error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
