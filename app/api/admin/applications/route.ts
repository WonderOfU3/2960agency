import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getAdminSession } from '@/lib/session'

export async function GET() {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const applications = await sql`
      SELECT * FROM business_applications
      ORDER BY created_at DESC
    `

    return NextResponse.json({ applications })
  } catch (err) {
    console.error('Fetch applications error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
