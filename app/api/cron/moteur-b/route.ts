import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { triggerMoteurB } from '@/lib/moteur-b'

// Catch-up cron for Moteur B — runs every 30 min
// Finds recently published restaurants and pushes matching creators
// GET /api/cron/moteur-b?secret=YOUR_CRON_SECRET

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    // Find restaurants published in the last 30 minutes that haven't been pushed yet
    const newlyPublished = await sql`
      SELECT r.id
      FROM restaurants r
      WHERE r.is_published = true
        AND r.auto_accept = true
        AND r.first_published_at IS NOT NULL
        AND r.first_published_at > NOW() - INTERVAL '30 minutes'
        AND NOT EXISTS (
          SELECT 1 FROM moteur_b_pushes p WHERE p.restaurant_id = r.id
        )
    `

    let totalPushed = 0
    for (const resto of newlyPublished) {
      const pushed = await triggerMoteurB(resto.id)
      totalPushed += (pushed || 0)
    }

    return NextResponse.json({ success: true, restaurants: newlyPublished.length, pushed: totalPushed })
  } catch (err) {
    console.error('Moteur B cron error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
