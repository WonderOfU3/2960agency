import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getCreatorSession } from '@/lib/session'

export async function GET() {
  const session = await getCreatorSession()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const creator = await sql`
      SELECT showcase_posts, niche FROM creators WHERE id = ${session.id}
    `
    if (creator.length === 0) return NextResponse.json({ error: 'Non trouvé' }, { status: 404 })

    return NextResponse.json({
      showcasePosts: creator[0].showcase_posts || [],
      niche: creator[0].niche || [],
    })
  } catch (err) {
    console.error('Get showcase error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const session = await getCreatorSession()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const { showcasePosts } = await req.json()

    if (!Array.isArray(showcasePosts) || showcasePosts.length > 2) {
      return NextResponse.json({ error: 'Maximum 2 posts' }, { status: 400 })
    }

    // Validate URLs
    for (const url of showcasePosts) {
      if (typeof url !== 'string' || (!url.startsWith('http://') && !url.startsWith('https://'))) {
        return NextResponse.json({ error: 'URL invalide' }, { status: 400 })
      }
    }

    await sql`
      UPDATE creators SET showcase_posts = ${showcasePosts}
      WHERE id = ${session.id}
    `

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Update showcase error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
