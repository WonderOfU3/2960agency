import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { generateMonogramAvatar } from '@/lib/wallet/generate-avatar'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ creatorId: string }> }
) {
  try {
    const { creatorId } = await params
    const creator = await sql`
      SELECT display_handle, tiktok_username, first_name FROM creators WHERE id = ${parseInt(creatorId)}
    `
    if (creator.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const handle = creator[0].display_handle || creator[0].tiktok_username || creator[0].first_name || '2960'
    const buffer = await generateMonogramAvatar(handle)

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (err) {
    console.error('Avatar error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
