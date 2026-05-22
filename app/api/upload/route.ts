import { NextRequest, NextResponse } from 'next/server'
import { getCreatorSession } from '@/lib/session'
import { getRestaurantSession } from '@/lib/session'

export const maxDuration = 60

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME!
const API_KEY = process.env.CLOUDINARY_API_KEY!
const API_SECRET = process.env.CLOUDINARY_API_SECRET!

async function generateSignature(params: Record<string, string>): Promise<string> {
  const sorted = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&')
  const data = new TextEncoder().encode(sorted + API_SECRET)
  const hash = await crypto.subtle.digest('SHA-1', data)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function POST(req: NextRequest) {
  // Auth: either creator or restaurant
  const creator = await getCreatorSession()
  const restaurant = await getRestaurantSession()
  if (!creator && !restaurant) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const folder = formData.get('folder') as string || '2960agency'

    if (!file) {
      return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Type de fichier non supporté' }, { status: 400 })
    }

    // Max 50MB for videos, 10MB for images
    const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'Fichier trop volumineux' }, { status: 400 })
    }

    const timestamp = String(Math.floor(Date.now() / 1000))
    const resourceType = file.type.startsWith('video/') ? 'video' : 'image'

    const params: Record<string, string> = {
      folder,
      timestamp,
    }

    const signature = await generateSignature(params)

    // Upload to Cloudinary
    const cloudForm = new FormData()
    cloudForm.append('file', file)
    cloudForm.append('folder', folder)
    cloudForm.append('timestamp', timestamp)
    cloudForm.append('api_key', API_KEY)
    cloudForm.append('signature', signature)

    const cloudRes = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
      { method: 'POST', body: cloudForm }
    )

    if (!cloudRes.ok) {
      const err = await cloudRes.text()
      console.error('Cloudinary upload error:', err)
      return NextResponse.json({ error: 'Erreur lors de l\'upload' }, { status: 500 })
    }

    const result = await cloudRes.json()

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      resourceType,
      width: result.width,
      height: result.height,
      format: result.format,
      duration: result.duration, // for videos
    })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
