import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getCreatorSession } from '@/lib/session'

export async function GET() {
  const session = await getCreatorSession()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const rows = await sql`
      SELECT sequential_id, batch_number, display_handle, tiktok_username,
             first_name, level, wallet_auth_token
      FROM creators WHERE id = ${session.id}
    `
    if (rows.length === 0) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 })

    const c = rows[0]
    return NextResponse.json({
      sequentialId: c.sequential_id,
      batchNumber: c.batch_number,
      handle: c.display_handle || c.tiktok_username || c.first_name,
      level: c.level,
      walletAuthToken: c.wallet_auth_token,
    })
  } catch (err) {
    console.error('Wallet info error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
