import sql from '@/lib/db'

// Server-side event tracking
// Events are stored in analytics_events table for reporting
// and can be forwarded to TikTok/Facebook Conversions API later

export type TrackEvent =
  | 'offre_publiee'
  | 'abonnement_payant'
  | 'inscription_validee'
  | 'connexion'
  | 'offre_vue'
  | 'reservation_lancee'
  | 'reservation_confirmee'
  | 'lien_video_poste'

interface TrackPayload {
  event: TrackEvent
  userId?: number | string
  userType: 'creator' | 'restaurant'
  metadata?: Record<string, any>
}

export async function track({ event, userId, userType, metadata }: TrackPayload) {
  try {
    await sql`
      INSERT INTO analytics_events (event, user_id, user_type, metadata, created_at)
      VALUES (${event}, ${userId ? String(userId) : null}, ${userType}, ${JSON.stringify(metadata || {})}, NOW())
    `
  } catch (e) {
    // Non-blocking — don't break the flow if tracking fails
    console.error('Track event error:', event, e)
  }
}
