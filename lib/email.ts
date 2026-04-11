const BREVO_API_KEY = process.env.BREVO_API_KEY!
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || 'contact@2960agency.com'
const FROM_EMAIL   = 'contact@2960agency.com'
const FROM_NAME    = '2960 Agency'

function fmt(val: unknown): string {
  if (Array.isArray(val)) return val.join(', ')
  if (val === null || val === undefined || val === '') return '—'
  return String(val)
}

function buildHtml(title: string, rows: [string, unknown][]): string {
  const rowsHtml = rows.map(([label, value]) => `
    <tr>
      <td style="padding:8px 12px;font-weight:600;color:#8a8580;font-size:13px;white-space:nowrap;vertical-align:top;border-bottom:1px solid #1f1d1a;">${label}</td>
      <td style="padding:8px 12px;color:#e8e4dc;font-size:13px;border-bottom:1px solid #1f1d1a;">${fmt(value)}</td>
    </tr>`).join('')

  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a08;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:660px;margin:40px auto;padding:0 20px;">
  <div style="margin-bottom:28px;">
    <span style="font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#D94F2A;">2960 Agency</span>
  </div>
  <h1 style="color:#fff;font-size:20px;font-weight:700;margin:0 0 6px;">${title}</h1>
  <p style="color:#4a4744;font-size:12px;margin:0 0 28px;">${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}</p>
  <table style="width:100%;border-collapse:collapse;background:#191714;border-radius:12px;overflow:hidden;">${rowsHtml}</table>
  <p style="color:#2a2825;font-size:11px;margin-top:28px;">2960 Agency — notification automatique</p>
</div></body></html>`
}

async function sendEmail(subject: string, htmlContent: string) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email: NOTIFY_EMAIL }],
      subject,
      htmlContent,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('Brevo error:', err)
  }
}

export async function sendCreatorNotification(d: Record<string, unknown>) {
  const rows: [string, unknown][] = [
    ['Prénom', d.first_name], ['Nom', d.last_name], ['Email', d.email],
    ['Téléphone', d.phone], ['TikTok', d.tiktok_username], ['Instagram', d.instagram_username],
    ['Ville', d.city], ['Langues parlées', d.languages_spoken], ['Langue contenu', d.content_languages],
    ['Arrondissements', d.favorite_arrondissements], ['Autres zones', d.other_areas], ['Distance max', d.travel_distance],
    ['Types restaurants', d.restaurant_types], ['Autres cuisines', d.other_cuisines],
    ['Coffee shops', d.likes_coffee_shops], ['Prefs coffee', d.coffee_shop_preferences],
    ['Photogénique', d.photogenic_matters], ['Priorités', d.top_priorities],
    ['Lieu idéal', d.ideal_place_description], ['Lieux évités', d.disliked_places],
    ['Restaurant de rêve', d.dream_restaurant], ['Liberté créative', d.creative_freedom],
    ['Plateformes', d.preferred_platforms], ['Collabs précédentes', d.has_done_collabs],
    ['Détail collabs', d.previous_collabs_detail],
    ['Niche', d.niche], ['Audience', d.audience_size],
    ['Contenu publié', d.posted_content], ['Liens contenu', d.content_links],
    ['Note contenu', d.content_note],
  ]
  try {
    await sendEmail(
      `Nouveau créateur — ${d.first_name} ${d.last_name} (@${d.tiktok_username})`,
      buildHtml('Nouvelle candidature créateur', rows)
    )
  } catch (e) { console.error('Creator email failed:', e) }
}

export async function sendBusinessNotification(d: Record<string, unknown>) {
  const rows: [string, unknown][] = [
    ['Établissement', d.business_name], ['Contact', d.owner_name],
    ['Email', d.email], ['Téléphone', d.phone],
    ['Instagram', d.instagram_username], ['TikTok', d.tiktok_username], ['Site web', d.website],
    ['Type', d.business_type], ['Cuisine', d.cuisine_type],
    ['Adresse', d.address], ['Ville', d.city], ['Arrondissement', d.arrondissement],
    ['Offre collab', d.collab_offer], ['Contenu voulu', d.content_wanted],
    ['Liberté créative', d.creative_freedom], ['Fréquence', d.collab_frequency],
    ['Destination contenu', d.content_destination],
    ['Expérience créateurs', d.has_worked_with_creators], ['Détail exp', d.previous_creator_detail],
    ['Défi visibilité', d.visibility_challenge],
    ['Livraison', d.offers_delivery], ['Collabs livraison', d.open_to_delivery_collabs],
    ['Meilleurs jours', d.best_days], ['Créneaux', d.best_times], ['Source', d.heard_about],
  ]
  try {
    await sendEmail(
      `Nouveau restaurant — ${d.business_name} (${d.city})`,
      buildHtml('Nouvelle candidature restaurant', rows)
    )
  } catch (e) { console.error('Business email failed:', e) }
}
