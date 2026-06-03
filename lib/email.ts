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

function buildDripEmail(firstName: string, body: string, extra: string | null, ctaLabel: string, ctaUrl: string): string {
  const bodyHtml = body.split('\n').map(line => line.trim()).filter(Boolean).map(line =>
    line.startsWith('•') ? `<li style="margin:4px 0;">${line.slice(1).trim()}</li>` : `<p style="color:#c8c3b8;font-size:15px;margin:0 0 16px;line-height:1.6;">${line}</p>`
  )
  const hasListItems = bodyHtml.some(h => h.startsWith('<li'))
  const bodyContent = hasListItems
    ? bodyHtml.map(h => h.startsWith('<li') ? h : h).join('').replace(/<\/p><li/g, '</p><ul style="color:#c8c3b8;font-size:14px;padding-left:20px;margin:0 0 16px;line-height:1.8;"><li').replace(/<\/li><p/g, '</li></ul><p')
    : bodyHtml.join('')
  // Fix unclosed ul
  const finalBody = bodyContent.includes('<ul') && !bodyContent.includes('</ul>') ? bodyContent + '</ul>' : bodyContent

  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a08;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:560px;margin:40px auto;padding:0 20px;">
  <div style="margin-bottom:32px;">
    <span style="font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#D94F2A;">2960 Agency</span>
  </div>
  <p style="color:#c8c3b8;font-size:15px;margin:0 0 24px;line-height:1.6;">${firstName},</p>
  ${finalBody}
  ${extra ? `<p style="color:#8a8580;font-size:14px;margin:0 0 24px;line-height:1.6;">${extra}</p>` : ''}
  <div style="margin:28px 0;">
    <a href="${ctaUrl}"
       style="display:inline-block;background:#E8471A;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
      ${ctaLabel} →
    </a>
  </div>
  <p style="color:#2a2825;font-size:11px;margin-top:40px;">2960</p>
</div></body></html>`
}

async function sendToUser(email: string, subject: string, htmlContent: string) {
  try {
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'api-key': BREVO_API_KEY },
      body: JSON.stringify({
        sender: { name: FROM_NAME, email: FROM_EMAIL },
        to: [{ email }],
        subject,
        htmlContent,
      }),
    })
  } catch (e) {
    console.error('Drip email failed:', e)
  }
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
    ['Lieu idéal', d.ideal_place_type], ['Lieux évités', d.disliked_places],
    ['Restaurant de rêve', d.dream_restaurant], ['Préférence collab', d.collab_preference],
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
    ['Code ambassadeur', d.referred_by_ambassador_code || '—'],
    ['Prix annuel souhaité', d.annual_subscription_price ? `${d.annual_subscription_price}€` : '—'],
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

// NEW: Booking confirmation emails
export async function sendBookingConfirmation(booking: {
  creatorName: string
  creatorEmail: string
  creatorPhone: string
  creatorTiktok: string
  restaurantName: string
  restaurantAddress: string
  restaurantCity: string
  restaurantEmail: string | null
  restaurantOwner: string | null
  conversationUrl: string | null
  bookingDate: string
  timeSlot: string
  offerDescription: string
}) {
  // Email to creator
  const creatorHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a08;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:660px;margin:40px auto;padding:0 20px;">
  <div style="margin-bottom:28px;">
    <span style="font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#D94F2A;">2960 Agency</span>
  </div>
  <h1 style="color:#fff;font-size:22px;font-weight:700;margin:0 0 12px;">✅ Réservation confirmée !</h1>
  <p style="color:#c8c3b8;font-size:15px;margin:0 0 28px;line-height:1.6;">
    Bonjour ${booking.creatorName},<br><br>
    Ta collab avec <strong style="color:#E8471A;">${booking.restaurantName}</strong> est confirmée !
  </p>

  <div style="background:#191714;border-radius:12px;padding:24px;margin-bottom:24px;border:1px solid #2a2825;">
    <div style="margin-bottom:16px;">
      <div style="color:#8a8580;font-size:12px;margin-bottom:4px;">📍 Restaurant</div>
      <div style="color:#fff;font-size:15px;font-weight:600;">${booking.restaurantName}</div>
      <div style="color:#c8c3b8;font-size:13px;">${booking.restaurantAddress}, ${booking.restaurantCity}</div>
    </div>
    <div style="margin-bottom:16px;">
      <div style="color:#8a8580;font-size:12px;margin-bottom:4px;">📅 Date & Heure</div>
      <div style="color:#fff;font-size:15px;font-weight:600;">${booking.bookingDate}</div>
      <div style="color:#c8c3b8;font-size:13px;">${booking.timeSlot}</div>
    </div>
    <div>
      <div style="color:#8a8580;font-size:12px;margin-bottom:4px;">🎁 Ce que tu reçois</div>
      <div style="color:#c8c3b8;font-size:14px;">${booking.offerDescription}</div>
    </div>
  </div>

  <div style="background:rgba(232,71,26,0.1);border:1px solid rgba(232,71,26,0.2);border-radius:12px;padding:20px;margin-bottom:28px;">
    <p style="color:#E8471A;font-size:13px;font-weight:600;margin:0 0 8px;">📌 Rappel important</p>
    <p style="color:#c8c3b8;font-size:13px;margin:0;line-height:1.6;">
      • Arrive à l'heure<br>
      • Mentionne 2960 Agency en arrivant<br>
      • Crée du contenu authentique et engageant<br>
      • Poste selon les termes convenus
    </p>
  </div>

  <p style="color:#8a8580;font-size:13px;margin-bottom:6px;">Des questions ?</p>
  <p style="color:#c8c3b8;font-size:13px;margin:0;">Contacte-nous : <a href="mailto:contact@2960agency.com" style="color:#E8471A;text-decoration:none;">contact@2960agency.com</a></p>

  <p style="color:#2a2825;font-size:11px;margin-top:32px;">2960 Agency — Bonne collab ! 🚀</p>
</div></body></html>`

  // Email to Yara
  const yaraRows: [string, unknown][] = [
    ['Créateur', booking.creatorName],
    ['TikTok', booking.creatorTiktok],
    ['Email', booking.creatorEmail],
    ['Téléphone', booking.creatorPhone],
    ['Restaurant', booking.restaurantName],
    ['Adresse', `${booking.restaurantAddress}, ${booking.restaurantCity}`],
    ['Date', booking.bookingDate],
    ['Créneau', booking.timeSlot],
    ['Offre', booking.offerDescription],
  ]

  try {
    // Send to creator
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: FROM_NAME, email: FROM_EMAIL },
        to: [{ email: booking.creatorEmail }],
        subject: `✅ Collab confirmée — ${booking.restaurantName}`,
        htmlContent: creatorHtml,
      }),
    })

    // Send to Yara
    await sendEmail(
      `📅 Nouvelle réservation — ${booking.creatorName} → ${booking.restaurantName}`,
      buildHtml('Nouvelle réservation', yaraRows)
    )

    // Send to restaurant
    if (booking.restaurantEmail) {
      const restoHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a08;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:660px;margin:40px auto;padding:0 20px;">
  <div style="margin-bottom:28px;">
    <span style="font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#D94F2A;">2960 Agency</span>
  </div>
  <h1 style="color:#fff;font-size:22px;font-weight:700;margin:0 0 12px;">📅 Un créateur arrive bientôt !</h1>
  <p style="color:#c8c3b8;font-size:15px;margin:0 0 28px;line-height:1.6;">
    Bonjour${booking.restaurantOwner ? ` ${booking.restaurantOwner}` : ''},<br><br>
    Un créateur a réservé un créneau chez <strong style="color:#E8471A;">${booking.restaurantName}</strong>.
  </p>

  <div style="background:#191714;border-radius:12px;padding:24px;margin-bottom:24px;border:1px solid #2a2825;">
    <div style="margin-bottom:16px;">
      <div style="color:#8a8580;font-size:12px;margin-bottom:4px;">👤 Créateur</div>
      <div style="color:#fff;font-size:15px;font-weight:600;">${booking.creatorName}</div>
      <div style="color:#c8c3b8;font-size:13px;">${booking.creatorTiktok ? booking.creatorTiktok : ''}</div>
    </div>
    <div style="margin-bottom:16px;">
      <div style="color:#8a8580;font-size:12px;margin-bottom:4px;">📅 Date & Heure</div>
      <div style="color:#fff;font-size:15px;font-weight:600;">${booking.bookingDate}</div>
      <div style="color:#c8c3b8;font-size:13px;">${booking.timeSlot}</div>
    </div>
    <div>
      <div style="color:#8a8580;font-size:12px;margin-bottom:4px;">🎁 Ce qui a été convenu</div>
      <div style="color:#c8c3b8;font-size:14px;">${booking.offerDescription}</div>
    </div>
  </div>

  <div style="background:rgba(232,71,26,0.08);border:1px solid rgba(232,71,26,0.15);border-radius:12px;padding:20px;margin-bottom:28px;">
    <p style="color:#E8471A;font-size:13px;font-weight:600;margin:0 0 8px;">📌 À préparer</p>
    <p style="color:#c8c3b8;font-size:13px;margin:0;line-height:1.6;">
      • Le créateur mentionnera 2960 Agency en arrivant<br>
      • Préparez l'offre convenue (${booking.offerDescription})<br>
      • Soyez accueillant — une bonne expérience = un meilleur contenu !
    </p>
  </div>

  ${booking.conversationUrl ? `
  <div style="text-align:center;margin-bottom:28px;">
    <p style="color:#c8c3b8;font-size:13px;margin:0 0 12px;">Besoin de communiquer avec le créateur avant sa venue ?</p>
    <a href="${booking.conversationUrl}"
       style="display:inline-block;background:#E8471A;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
      💬 Envoyer un message
    </a>
  </div>
  ` : ''}

  <p style="color:#8a8580;font-size:13px;margin-bottom:6px;">Des questions ?</p>
  <p style="color:#c8c3b8;font-size:13px;margin:0;"><a href="mailto:contact@2960agency.com" style="color:#E8471A;text-decoration:none;">contact@2960agency.com</a></p>

  <p style="color:#2a2825;font-size:11px;margin-top:32px;">2960 Agency — notification automatique</p>
</div></body></html>`

      await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': BREVO_API_KEY,
        },
        body: JSON.stringify({
          sender: { name: FROM_NAME, email: FROM_EMAIL },
          to: [{ email: booking.restaurantEmail }],
          subject: `📅 Nouveau créateur — ${booking.creatorName} le ${booking.bookingDate}`,
          htmlContent: restoHtml,
        }),
      })
    }
  } catch (e) {
    console.error('Booking email failed:', e)
  }
}

// NEW: Welcome email when creator account is created
export async function sendCreatorWelcome(creator: {
  firstName: string
  email: string
  ambassadorCode: string
}) {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a08;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:660px;margin:40px auto;padding:0 20px;">
  <div style="margin-bottom:28px;">
    <span style="font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#D94F2A;">2960 Agency</span>
  </div>
  <h1 style="color:#fff;font-size:24px;font-weight:700;margin:0 0 12px;">Bienvenue chez 2960 Agency ! 🎉</h1>
  <p style="color:#c8c3b8;font-size:15px;margin:0 0 28px;line-height:1.6;">
    Salut ${creator.firstName},<br><br>
    Merci pour ton inscription ! Nous examinons actuellement ton profil pour te matcher avec les meilleures opportunités de collabs.
  </p>

  <div style="background:#191714;border-radius:12px;padding:24px;margin-bottom:24px;border:1px solid #2a2825;">
    <p style="color:#8a8580;font-size:13px;margin:0 0 12px;">📊 Statut de ton compte</p>
    <div style="background:rgba(252,250,166,0.1);border:1px solid rgba(252,250,166,0.15);border-radius:8px;padding:14px;">
      <p style="color:#fcfaa6;font-size:13px;margin:0;font-weight:600;">⏳ En cours de validation</p>
    </div>
    <p style="color:#8a8580;font-size:12px;margin:12px 0 0;">Nous te contacterons dès que ton compte sera validé.</p>
  </div>

  <div style="background:linear-gradient(135deg, rgba(232,71,26,0.1) 0%, rgba(217,79,42,0.05) 100%);border:1px solid rgba(232,71,26,0.2);border-radius:12px;padding:24px;margin-bottom:28px;">
    <p style="color:#E8471A;font-size:14px;font-weight:700;margin:0 0 8px;">🎁 Ton code ambassadeur</p>
    <div style="background:rgba(0,0,0,0.3);border-radius:8px;padding:16px;margin:12px 0 16px;border:1px solid rgba(232,71,26,0.1);">
      <p style="color:#E8471A;font-size:28px;font-weight:700;text-align:center;margin:0;letter-spacing:0.15em;">${creator.ambassadorCode}</p>
    </div>
    <p style="color:#c8c3b8;font-size:13px;margin:0 0 12px;line-height:1.6;">
      Partage ce code avec des restaurants ! Si 5 restaurants s'inscrivent avec ton code, tu gagnes <strong style="color:#E8471A;">100€</strong>.
    </p>
    <p style="color:#8a8580;font-size:12px;margin:0;">Le restaurant doit simplement entrer ton code lors de son inscription.</p>
  </div>

  <p style="color:#8a8580;font-size:13px;margin-bottom:6px;">À très bientôt,</p>
  <p style="color:#c8c3b8;font-size:13px;margin:0;font-weight:600;">L'équipe 2960 Agency</p>

  <p style="color:#2a2825;font-size:11px;margin-top:32px;">contact@2960agency.com</p>
</div></body></html>`

  try {
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: FROM_NAME, email: FROM_EMAIL },
        to: [{ email: creator.email }],
        subject: '🎉 Bienvenue chez 2960 Agency !',
        htmlContent: html,
      }),
    })
  } catch (e) {
    console.error('Welcome email failed:', e)
  }
}

// ═══════════════════════════════════════
// C1 — Creator validated (immediate)
// ═══════════════════════════════════════
export async function sendCreatorValidation(creator: {
  firstName: string
  email: string
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://2960agency.com'
  const html = buildDripEmail(
    creator.firstName,
    'Profil validé. Tu as accès à la plateforme.',
    `Sur 2960 : tu réserves un créneau dans un resto, tu viens avec qui tu veux, tu filmes, tu publies. Aucun frais. Certains restos ajoutent une prime si ta vidéo cartonne — tu la vois sur chaque offre.`,
    'Réserver ma 1ère collab', `${appUrl}/creator/dashboard`,
  )
  await sendToUser(creator.email, 'Tu es accepté(e) sur 2960 ✓', html)
}

// C2 — J+1 if no booking
export async function sendCreatorDripC2(creator: { firstName: string; email: string }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://2960agency.com'
  const html = buildDripEmail(
    creator.firstName,
    'Les créneaux sont ouverts en ce moment — repas offert, contenu réel pour ton feed, et une prime possible si la vidéo performe.',
    null,
    'Voir les restaurants', `${appUrl}/creator/dashboard`,
  )
  await sendToUser(creator.email, 'Repas offert + contenu + potentiellement une prime', html)
}

// C3 — J+3 if no booking
export async function sendCreatorDripC3(creator: { firstName: string; email: string }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://2960agency.com'
  const html = buildDripEmail(
    creator.firstName,
    'Chaque collab sur 2960 te fait avancer dans les niveaux créateurs. Plus tu avances, plus tu débloques d\'avantages. Ça commence dès ta 1ère réservation confirmée.',
    null,
    'Réserver maintenant', `${appUrl}/creator/dashboard`,
  )
  await sendToUser(creator.email, 'Ta 1ère collab démarre tes points', html)
}

// C4 — J+7 if no booking
export async function sendCreatorDripC4(creator: { firstName: string; email: string }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://2960agency.com'
  const html = buildDripEmail(
    creator.firstName,
    'Repas offert, contenu pour ton feed, primes sur les vidéos qui performent. Ton profil est prêt. Il manque juste une réservation.',
    'Si quelque chose bloque, réponds à cet email.',
    'Accéder à la plateforme', `${appUrl}/creator/dashboard`,
  )
  await sendToUser(creator.email, 'Ton profil est validé — les créneaux sont là', html)
}

// ═══════════════════════════════════════
// R1 — Restaurant accepted (immediate)
// ═══════════════════════════════════════
export async function sendBusinessAccepted(business: {
  businessName: string
  ownerName: string
  email: string
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://2960agency.com'
  const html = buildDripEmail(
    business.ownerName,
    `Ton compte est créé. Tes 3 premières collabs sont incluses — 30 jours pour les utiliser.

Une collab = un créateur vient filmer chez toi, publie sur son compte. La vidéo reste indexée sur TikTok 12 mois. Ton seul coût : le repas le jour J.

Pour que les créateurs te trouvent, publie ton offre maintenant. 5 minutes :
• Nombre de personnes max par réservation
• Tes créneaux dispo
• Nombre de créateurs par semaine`,
    null,
    'Publier mon offre', `${appUrl}/restaurant/dashboard`,
  )
  await sendToUser(business.email, 'Bienvenue — tes 3 collabs gratuites t\'attendent', html)
}

// R2 — J+2 if no offer published
export async function sendRestoDripR2(resto: { ownerName: string; email: string }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://2960agency.com'
  const html = buildDripEmail(
    resto.ownerName,
    'Ton compte est ouvert depuis 2 jours. Tant que ton offre n\'est pas publiée, les créateurs sur 2960 ne peuvent pas te trouver. Ça prend 5 minutes.',
    null,
    'Publier mon offre', `${appUrl}/restaurant/dashboard`,
  )
  await sendToUser(resto.email, 'Ton resto n\'est pas encore visible', html)
}

// R3 — J+7 if no offer published
export async function sendRestoDripR3(resto: { ownerName: string; email: string }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://2960agency.com'
  const html = buildDripEmail(
    resto.ownerName,
    `Tes 3 collabs offertes expirent dans 23 jours.

Chaque collab = une vidéo publiée sur TikTok ou Instagram, maintenue en ligne 12 mois. Le contenu tourne encore bien après que le créateur soit reparti — sans que tu gères quoi que ce soit.

Pour les activer : ton offre doit être en ligne. 5 minutes.`,
    null,
    'Activer mes collabs', `${appUrl}/restaurant/dashboard`,
  )
  await sendToUser(resto.email, 'Il reste 23 jours pour tes 3 collabs', html)
}

// NEW: Email to restaurant when their application is rejected
export async function sendBusinessRejected(business: {
  businessName: string
  ownerName: string
  email: string
}) {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a08;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:660px;margin:40px auto;padding:0 20px;">
  <div style="margin-bottom:28px;">
    <span style="font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#D94F2A;">2960 Agency</span>
  </div>
  <h1 style="color:#fff;font-size:24px;font-weight:700;margin:0 0 12px;">Merci pour votre candidature</h1>
  <p style="color:#c8c3b8;font-size:15px;margin:0 0 28px;line-height:1.6;">
    Bonjour ${business.ownerName},<br><br>
    Nous vous remercions pour l'intérêt que vous portez à 2960 Agency. Après examen de votre candidature pour <strong style="color:#fff;">${business.businessName}</strong>, nous ne sommes malheureusement pas en mesure de vous intégrer à la plateforme pour le moment.
  </p>

  <div style="background:#191714;border-radius:12px;padding:24px;margin-bottom:24px;border:1px solid #2a2825;">
    <p style="color:#c8c3b8;font-size:13px;margin:0;line-height:1.6;">
      Cela ne signifie pas que la porte est fermée. Nous onboardons les établissements par vagues et les critères évoluent. N'hésitez pas à repostuler dans quelques semaines.
    </p>
  </div>

  <p style="color:#8a8580;font-size:13px;margin-bottom:6px;">Des questions ?</p>
  <p style="color:#c8c3b8;font-size:13px;margin:0;">Contactez-nous : <a href="mailto:contact@2960agency.com" style="color:#E8471A;text-decoration:none;">contact@2960agency.com</a></p>

  <p style="color:#2a2825;font-size:11px;margin-top:32px;">2960 Agency</p>
</div></body></html>`

  try {
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: FROM_NAME, email: FROM_EMAIL },
        to: [{ email: business.email }],
        subject: 'Votre candidature 2960 Agency',
        htmlContent: html,
      }),
    })
  } catch (e) {
    console.error('Business rejected email failed:', e)
  }
}

// NEW: Message notification email
export async function sendMessageNotification(data: {
  recipientEmail: string
  recipientName: string
  senderName: string
  restaurantName: string
  message: string
  conversationUrl: string | null
}) {
  const buttonHtml = data.conversationUrl
    ? `<a href="${data.conversationUrl}"
         style="display:inline-block;background:#E8471A;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;margin-top:8px;">
        Répondre
      </a>`
    : `<p style="color:#8a8580;font-size:12px;margin-top:8px;">Connectez-vous à votre dashboard pour répondre.</p>`

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a08;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:660px;margin:40px auto;padding:0 20px;">
  <div style="margin-bottom:28px;">
    <span style="font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#D94F2A;">2960 Agency</span>
  </div>
  <h1 style="color:#fff;font-size:20px;font-weight:700;margin:0 0 12px;">💬 Nouveau message</h1>
  <p style="color:#c8c3b8;font-size:14px;margin:0 0 20px;">
    Bonjour ${data.recipientName}, vous avez un nouveau message de <strong style="color:#E8471A;">${data.senderName}</strong> concernant la collab chez ${data.restaurantName}.
  </p>

  <div style="background:#191714;border-radius:12px;padding:20px;margin-bottom:24px;border:1px solid #2a2825;">
    <p style="color:#8a8580;font-size:11px;margin:0 0 8px;">${data.senderName}</p>
    <p style="color:#e8e4dc;font-size:14px;margin:0;line-height:1.6;white-space:pre-wrap;">${data.message}</p>
  </div>

  ${buttonHtml}

  <p style="color:#2a2825;font-size:11px;margin-top:32px;">2960 Agency — notification automatique</p>
</div></body></html>`

  try {
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: FROM_NAME, email: FROM_EMAIL },
        to: [{ email: data.recipientEmail }],
        subject: `💬 Message de ${data.senderName} — ${data.restaurantName}`,
        htmlContent: html,
      }),
    })
  } catch (e) {
    console.error('Message notification email failed:', e)
  }
}

// Booking reminder email (5 days before — creator must reconfirm)
export async function sendBookingReminder(data: {
  creatorName: string
  creatorEmail: string
  restaurantName: string
  restaurantAddress: string
  restaurantCity: string
  bookingDate: string
  timeSlot: string
  offerDescription: string
  reconfirmUrl: string
}) {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a08;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:660px;margin:40px auto;padding:0 20px;">
  <div style="margin-bottom:28px;">
    <span style="font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#D94F2A;">2960 Agency</span>
  </div>
  <h1 style="color:#fff;font-size:22px;font-weight:700;margin:0 0 12px;">Rappel — Collab à venir</h1>
  <p style="color:#c8c3b8;font-size:15px;margin:0 0 24px;line-height:1.6;">
    Salut ${data.creatorName},<br><br>
    Ta collab chez <strong style="color:#E8471A;">${data.restaurantName}</strong> approche !
    Merci de <strong style="color:#fff;">reconfirmer ta présence</strong> pour maintenir ta réservation.
  </p>

  <div style="background:#191714;border-radius:12px;padding:24px;margin-bottom:24px;border:1px solid #2a2825;">
    <div style="margin-bottom:16px;">
      <div style="color:#8a8580;font-size:12px;margin-bottom:4px;">Restaurant</div>
      <div style="color:#fff;font-size:15px;font-weight:600;">${data.restaurantName}</div>
      <div style="color:#c8c3b8;font-size:13px;">${data.restaurantAddress}, ${data.restaurantCity}</div>
    </div>
    <div style="margin-bottom:16px;">
      <div style="color:#8a8580;font-size:12px;margin-bottom:4px;">Date & Heure</div>
      <div style="color:#fff;font-size:15px;font-weight:600;">${data.bookingDate}</div>
      <div style="color:#c8c3b8;font-size:13px;">${data.timeSlot}</div>
    </div>
    <div>
      <div style="color:#8a8580;font-size:12px;margin-bottom:4px;">Ce que tu recois</div>
      <div style="color:#c8c3b8;font-size:14px;">${data.offerDescription}</div>
    </div>
  </div>

  <div style="background:rgba(252,250,166,0.08);border:1px solid rgba(252,250,166,0.15);border-radius:12px;padding:20px;margin-bottom:24px;">
    <p style="color:#fcfaa6;font-size:13px;font-weight:600;margin:0 0 8px;">Action requise</p>
    <p style="color:#c8c3b8;font-size:13px;margin:0;line-height:1.6;">
      Tu dois reconfirmer ta presence au moins <strong style="color:#fff;">24h avant</strong> le rendez-vous.
      Sans reconfirmation, ta reservation sera automatiquement annulee.
    </p>
  </div>

  <div style="text-align:center;margin-bottom:28px;">
    <a href="${data.reconfirmUrl}"
       style="display:inline-block;background:#E8471A;color:#fff;padding:16px 40px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;">
      Je confirme ma presence
    </a>
  </div>

  <p style="color:#8a8580;font-size:12px;margin:0;">Tu peux aussi reconfirmer depuis ton dashboard 2960 Agency.</p>

  <p style="color:#2a2825;font-size:11px;margin-top:32px;">2960 Agency — notification automatique</p>
</div></body></html>`

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: FROM_NAME, email: FROM_EMAIL },
        to: [{ email: data.creatorEmail }],
        subject: `Rappel — Collab chez ${data.restaurantName} le ${data.bookingDate}`,
        htmlContent: html,
      }),
    })
    if (!res.ok) {
      const err = await res.text()
      console.error('Brevo reminder email error:', res.status, err)
    }
  } catch (e) {
    console.error('Reminder email failed:', e)
  }
}

export async function sendPasswordResetEmail(data: {
  email: string
  firstName: string
  resetUrl: string
}) {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a08;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:660px;margin:40px auto;padding:0 20px;">
  <div style="margin-bottom:28px;">
    <span style="font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#D94F2A;">2960 Agency</span>
  </div>
  <h1 style="color:#fff;font-size:22px;font-weight:700;margin:0 0 12px;">Réinitialisation de mot de passe</h1>
  <p style="color:#c8c3b8;font-size:15px;margin:0 0 24px;line-height:1.6;">
    Salut ${data.firstName},<br><br>
    Tu as demandé à réinitialiser ton mot de passe. Clique sur le bouton ci-dessous pour en choisir un nouveau.
  </p>
  <div style="text-align:center;margin:32px 0;">
    <a href="${data.resetUrl}"
       style="display:inline-block;background:#E8471A;color:#fff;padding:16px 40px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;">
      Réinitialiser mon mot de passe
    </a>
  </div>
  <p style="color:#8a8580;font-size:12px;margin:0 0 8px;">Ce lien expire dans 1 heure.</p>
  <p style="color:#8a8580;font-size:12px;margin:0;">Si tu n'as pas fait cette demande, ignore cet email.</p>
  <p style="color:#2a2825;font-size:11px;margin-top:32px;">2960 Agency — notification automatique</p>
</div></body></html>`

  try {
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: FROM_NAME, email: FROM_EMAIL },
        to: [{ email: data.email }],
        subject: 'Réinitialisation de mot de passe — 2960 Agency',
        htmlContent: html,
      }),
    })
  } catch (e) {
    console.error('Password reset email failed:', e)
  }
}
