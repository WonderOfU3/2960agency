import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get('username')

  if (!username || username.length < 3) {
    return NextResponse.json({ available: false })
  }

  // Only allow alphanumeric + underscores
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return NextResponse.json({ available: false })
  }

  const existing = await sql`
    SELECT id FROM creators WHERE LOWER(username) = LOWER(${username})
  `

  return NextResponse.json({ available: existing.length === 0 })
}
