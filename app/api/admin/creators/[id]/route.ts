import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getAdminSession } from '@/lib/session'
import { sendCreatorValidation } from '@/lib/email'

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
    const { action } = await req.json()

    if (action === 'validate') {
      await sql`UPDATE creators SET status = 'active' WHERE id = ${parseInt(id)}`

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

    return NextResponse.json({ error: 'Action invalide' }, { status: 400 })
  } catch (err) {
    console.error('Update creator error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
