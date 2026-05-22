import { NextRequest, NextResponse } from 'next/server'
import { getCreatorSession, getRestaurantSession } from '@/lib/session'

const API_SECRET = process.env.CLOUDINARY_API_SECRET!

async function generateSignature(params: Record<string, string>): Promise<string> {
  const sorted = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&')
  const data = new TextEncoder().encode(sorted + API_SECRET)
  const hash = await crypto.subtle.digest('SHA-1', data)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function POST(req: NextRequest) {
  const creator = await getCreatorSession()
  const restaurant = await getRestaurantSession()
  if (!creator && !restaurant) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { folder = '2960agency' } = await req.json()
    const timestamp = String(Math.floor(Date.now() / 1000))

    const params: Record<string, string> = { folder, timestamp }
    const signature = await generateSignature(params)

    return NextResponse.json({
      signature,
      timestamp,
      folder,
      apiKey: process.env.CLOUDINARY_API_KEY!,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    })
  } catch (err) {
    console.error('Sign error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
