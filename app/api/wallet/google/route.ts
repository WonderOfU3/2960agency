import { NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getCreatorSession } from '@/lib/session'
import { buildGoogleWalletUrl } from '@/lib/wallet/google-pass'

export async function GET() {
  const session = await getCreatorSession()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const rows = await sql`
      SELECT id, sequential_id, batch_number, display_handle, tiktok_username,
             first_name, level, points_total, credits_current, wallet_auth_token
      FROM creators WHERE id = ${session.id}
    `
    if (rows.length === 0) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 })

    const c = rows[0]
    const url = await buildGoogleWalletUrl({
      id: c.id,
      sequentialId: c.sequential_id,
      batchNumber: c.batch_number,
      handle: c.display_handle || c.tiktok_username || c.first_name,
      level: c.level,
      pointsTotal: c.points_total || 0,
      creditsRemaining: c.credits_current || 0,
      walletAuthToken: c.wallet_auth_token,
    })

    return NextResponse.json({ url })
  } catch (err) {
    console.error('Google Wallet error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
