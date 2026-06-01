import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { token, platform, recipientType, recipientId } = await req.json()

    if (!token || !platform || !recipientType || !recipientId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Upsert: if same token exists, update the recipient info
    await sql`
      INSERT INTO push_tokens (token, platform, recipient_type, recipient_id, updated_at)
      VALUES (${token}, ${platform}, ${recipientType}, ${recipientId}, NOW())
      ON CONFLICT (token)
      DO UPDATE SET
        recipient_type = ${recipientType},
        recipient_id = ${recipientId},
        platform = ${platform},
        updated_at = NOW()
    `

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Push register error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
