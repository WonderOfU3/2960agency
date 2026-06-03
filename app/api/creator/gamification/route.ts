import { NextResponse } from 'next/server'
import { getCreatorSession } from '@/lib/session'
import { getCreatorGamificationProfile } from '@/lib/gamification'

export async function GET() {
  const session = await getCreatorSession()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const profile = await getCreatorGamificationProfile(session.id)
    if (!profile) {
      return NextResponse.json({ error: 'Profil non trouvé' }, { status: 404 })
    }
    return NextResponse.json(profile)
  } catch (err) {
    console.error('Gamification profile error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
