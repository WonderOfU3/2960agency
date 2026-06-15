const BREVO_API_KEY = process.env.BREVO_API_KEY!
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || 'contact@2960agency.com'
const FROM_EMAIL   = 'contact@2960agency.com'
const FROM_NAME    = '2960 Agency'
const APP_URL      = process.env.NEXT_PUBLIC_APP_URL || 'https://2960agency.com'

// ═══════════════════════════════════════════════════════════
//  TEMPLATE BUILDERS
//  Palette: bg #F3F4F7 · card #fff · purple #6D0040 · orange #FF6339 · text #1A1A1A
//  Font: TAN Buster for brand, DM Sans / system for body
// ═══════════════════════════════════════════════════════════

function buildEmail(greeting: string, bodyHtml: string, ctaLabel: string | null, ctaUrl: string | null, isMarketing = true): string {
  const ctaBlock = ctaLabel && ctaUrl ? `
      <div style="margin:28px 0 0;text-align:center;">
        <a href="${ctaUrl}"
           style="display:inline-block;background:#FF6339;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
          ${ctaLabel} →
        </a>
      </div>` : ''
  const unsub = isMarketing ? `
      <p style="color:#6D0040;font-size:10px;margin:12px 0 0;">
        <a href="${APP_URL}/unsubscribe" style="color:#6D0040;text-decoration:underline;">Se désabonner</a> — tu ne recevras plus ces mails.
      </p>` : ''
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F3F4F7;font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:460px;margin:0 auto;padding:40px 16px;">
  <div style="margin-bottom:24px;text-align:center;">
    <img src="${APP_URL}/images/email-logo.png" alt="2960 AGENCY" width="132" height="18" style="display:inline-block;" />
  </div>
  <div style="background:#fff;border-radius:16px;padding:36px 32px;">
    <p style="color:#1A1A1A;font-size:15px;margin:0 0 20px;line-height:1.6;">${greeting}</p>
    ${bodyHtml}
    ${ctaBlock}
  </div>
  <div style="text-align:center;margin-top:24px;">
    <img src="${APP_URL}/images/email-logo.png" alt="2960 AGENCY" width="88" height="12" style="display:inline-block;opacity:0.5;" />${unsub}
  </div>
</div></body></html>`
}

function p(text: string): string {
  return `<p style="color:#1A1A1A;font-size:15px;margin:0 0 16px;line-height:1.7;">${text}</p>`
}

function pMuted(text: string): string {
  return `<p style="color:#6D0040;font-size:14px;margin:0 0 16px;line-height:1.6;">${text}</p>`
}

function dash(text: string): string {
  return `<p style="color:#1A1A1A;font-size:14px;margin:0 0 8px;line-height:1.6;padding-left:12px;">— ${text}</p>`
}

function spacer(): string {
  return '<div style="height:8px;"></div>'
}

function hl(text: string): string {
  return `<span style="color:#6D0040;font-weight:600;">${text}</span>`
}

// ═══════════════════════════════════════════════════════════
//  SEND HELPERS
// ═══════════════════════════════════════════════════════════

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
  } catch (e) { console.error('Email failed:', e) }
}

async function sendEmail(subject: string, htmlContent: string) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': BREVO_API_KEY },
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

// ═══════════════════════════════════════════════════════════
//  ADMIN NOTIFICATIONS (internal, dark theme)
// ═══════════════════════════════════════════════════════════

function fmt(val: unknown): string {
  if (Array.isArray(val)) return val.join(', ')
  if (val === null || val === undefined || val === '') return '—'
  return String(val)
}

function buildAdminHtml(title: string, rows: [string, unknown][]): string {
  const rowsHtml = rows.map(([label, value]) => `
    <tr>
      <td style="padding:8px 12px;font-weight:600;color:#8a8580;font-size:13px;white-space:nowrap;vertical-align:top;border-bottom:1px solid #1f1d1a;">${label}</td>
      <td style="padding:8px 12px;color:#e8e4dc;font-size:13px;border-bottom:1px solid #1f1d1a;">${fmt(value)}</td>
    </tr>`).join('')
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a08;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:660px;margin:40px auto;padding:0 20px;">
  <div style="margin-bottom:28px;"><span style="font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#D94F2A;">2960 Agency</span></div>
  <h1 style="color:#fff;font-size:20px;font-weight:700;margin:0 0 6px;">${title}</h1>
  <p style="color:#4a4744;font-size:12px;margin:0 0 28px;">${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}</p>
  <table style="width:100%;border-collapse:collapse;background:#191714;border-radius:12px;overflow:hidden;">${rowsHtml}</table>
  <p style="color:#2a2825;font-size:11px;margin-top:28px;">2960 Agency — notification automatique</p>
</div></body></html>`
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
    await sendEmail(`Nouveau créateur — ${d.first_name} ${d.last_name} (@${d.tiktok_username})`, buildAdminHtml('Nouvelle candidature créateur', rows))
  } catch (e) { console.error('Creator email failed:', e) }
}

export async function sendBusinessNotification(d: Record<string, unknown>) {
  const rows: [string, unknown][] = [
    ['Code ambassadeur', d.referred_by_ambassador_code || '—'],
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
    await sendEmail(`Nouveau restaurant — ${d.business_name} (${d.city})`, buildAdminHtml('Nouvelle candidature restaurant', rows))
  } catch (e) { console.error('Business email failed:', e) }
}

// ═══════════════════════════════════════════════════════════
//  CRÉATEUR — SÉQUENCE (voix "tu")
// ═══════════════════════════════════════════════════════════

// C0 — Bienvenue (immédiat après validation admin)
export async function sendCreatorC0(creator: { firstName: string; email: string }) {
  const body = p(`C'est validé : tu fais partie des créateurs 2960.`) +
    p(`Ici, des restos t'ouvrent leur table, tu y vas (tu peux emmener tes potes), tu fais ton contenu, tu le postes. Ton repas est offert.`) +
    p(`Une chose pour bien démarrer : mets tes 2 meilleures vidéos sur ton profil. C'est ce que les restos regardent en premier — un beau profil, c'est toi qui passes devant.`)
  const html = buildEmail(`${creator.firstName}, c'est validé : tu fais partie des créateurs 2960.`, body, 'Compléter mon profil', `${APP_URL}/creator/dashboard`)
  await sendToUser(creator.email, `Bienvenue chez 2960, ${creator.firstName} 🎬`, html)
}

// C1 — Première action (J+1 si offre_vue=0)
export async function sendCreatorC1(creator: { firstName: string; email: string }) {
  const body = p(`On te prépare des invitations qui collent à ton style.`) +
    p(`En attendant, le truc qui te fait passer devant quand une table s'ouvre : mets tes 2 meilleures vidéos sur ton profil — c'est ce que les restos regardent en premier.`)
  const html = buildEmail(`${creator.firstName},`, body, 'Peaufiner mon profil', `${APP_URL}/creator/dashboard`)
  await sendToUser(creator.email, 'Pendant qu\'on te trouve la bonne table…', html)
}

// C-INVIT — Invitation (cœur de l'activation)
export async function sendCreatorInvitation(creator: {
  firstName: string; email: string;
  restoName: string; quartier: string;
  maxPeople: number; netPrime: number;
}) {
  const x = Math.max(1, creator.maxPeople - 2)
  const y = creator.maxPeople - 1
  const potesLine = creator.maxPeople >= 3
    ? dash(`Repas offert pour toi — emmène ${x} à ${y} pote${y > 1 ? 's' : ''}, une table animée fait un meilleur contenu`)
    : dash('Repas offert pour toi')
  const primeLine = creator.netPrime > 0
    ? dash(`Si ta vidéo performe, tu peux toucher jusqu'à ${hl(`${creator.netPrime}€`)}`)
    : ''
  const body = potesLine + primeLine +
    dash('Tu choisis ton créneau, tu postes ta vidéo sous 5 jours')
  const quartierSuffix = creator.quartier ? ` (${creator.quartier})` : ''
  const html = buildEmail(
    `${creator.firstName}, ${hl(creator.restoName)}${quartierSuffix} aimerait te recevoir.`,
    body, 'Voir et réserver (1 clic)', `${APP_URL}/creator/dashboard`,
  )
  await sendToUser(creator.email, `${creator.restoName} aimerait te recevoir 🍝`, html)
}

// C-RECONF — Reconfirme ta venue (72h avant)
export async function sendCreatorReconf(data: {
  firstName: string; email: string;
  restoName: string; date: string; heure: string; maxPeople: number;
  reconfirmUrl: string;
}) {
  const body = p(`Ta collab chez ${hl(data.restoName)} c'est ${data.date} à ${data.heure}.`) +
    p(`Confirme que tu viens (sinon la table est libérée automatiquement à 24h) :`) +
    spacer() +
    (data.maxPeople >= 3
      ? pMuted(`Tu emmènes du monde ? ${data.restoName} accepte jusqu'à ${data.maxPeople} personnes — plus la table est vivante, meilleur est le contenu.`)
      : '')
  const html = buildEmail(`${data.firstName},`, body, 'Je confirme ma venue', data.reconfirmUrl, false)
  await sendToUser(data.email, `Ta collab chez ${data.restoName} approche — confirme ta venue`, html)
}

// C-RDV — C'est demain (J-1)
export async function sendCreatorRdv(data: {
  firstName: string; email: string;
  restoName: string; heure: string; adresse: string;
}) {
  const body = p(`Demain ${data.heure} chez ${hl(data.restoName)}, ${data.adresse}.`) +
    p('La checklist pour un contenu qui passe la validation :') +
    dash('filme sur place') +
    dash('montre le lieu + un plat') +
    dash('poste en public et garde la vidéo en ligne au moins 12 mois') +
    spacer() +
    pMuted('Profite, et régale-toi. Le reste est simple.')
  const html = buildEmail(`${data.firstName},`, body, null, null, false)
  await sendToUser(data.email, `Demain : ta collab chez ${data.restoName} 🎬`, html)
}

// C-LIEN — Poste ton lien (J+1, J+3, J+5)
export async function sendCreatorLien(data: {
  firstName: string; email: string;
  restoName: string; deadlineDate: string; dayNum: 1 | 3 | 5;
}) {
  let subject: string
  let bodyText: string
  let extraText: string

  if (data.dayNum === 1) {
    subject = `Alors, c'était comment chez ${data.restoName} ? 🍴`
    bodyText = `J'espère que tu t'es régalé chez ${hl(data.restoName)} !`
    extraText = `Dès que ta vidéo est en ligne, colle le lien dans ton espace — c'est ce qui valide ta collab et te fait gagner tes points 2960.`
  } else if (data.dayNum === 3) {
    subject = `Ton lien chez ${data.restoName} — il reste 2 jours`
    bodyText = `Ta vidéo chez ${hl(data.restoName)} n'a plus que 2 jours pour être validée.`
    extraText = `Colle le lien dans ton espace et ta collab est bouclée — tes points tombent dans la foulée.`
  } else {
    subject = `Dernier jour pour valider ta collab chez ${data.restoName}`
    bodyText = `C'est le dernier jour pour valider ta collab chez ${hl(data.restoName)}.`
    extraText = `Il te reste à coller le lien de ta vidéo dans ton espace — c'est rapide, et ça boucle tout (collab validée + points).`
  }

  const body = p(bodyText) + p(extraText) +
    (data.dayNum === 1 ? pMuted(`Tu as jusqu'au ${data.deadlineDate}.`) : '')
  const html = buildEmail(`${data.firstName},`, body, 'Ajouter le lien de ma vidéo', `${APP_URL}/creator/dashboard`)
  await sendToUser(data.email, subject, html)
}

// C-WB1 — At risk (J+7 sans activité)
export async function sendCreatorWB1(creator: {
  firstName: string; email: string;
  restoName: string; quartier: string; netPrime: number;
}) {
  const primeLine = creator.netPrime > 0
    ? ` Jusqu'à ${creator.netPrime}€ si ta vidéo performe.`
    : ''
  const body = p(`On a une table qui colle à ton style : ${hl(creator.restoName)}, ${creator.quartier}.`) +
    p(`Repas offert, emmène tes potes. Tu n'as rien à chercher — c'est déjà prêt, tu valides en 1 clic.${primeLine}`)
  const html = buildEmail(`${creator.firstName},`, body, 'Voir ma table', `${APP_URL}/creator/dashboard`)
  await sendToUser(creator.email, `On t'a trouvé une table, ${creator.firstName}`, html)
}

// C-WB2 — Dormant (J+21 sans connexion)
export async function sendCreatorWB2(creator: {
  firstName: string; email: string;
  restoName: string; quartier: string;
}) {
  const body = p(`Ça fait un moment ! On ne te lâche pas.`) +
    p(`Une nouvelle adresse vient d'ouvrir près de chez toi : ${hl(creator.restoName)}. Si c'est le bon moment, ta place t'attend.`)
  const html = buildEmail(`${creator.firstName},`, body, 'Je jette un œil', `${APP_URL}/creator/dashboard`)
  await sendToUser(creator.email, `On pense à toi — une nouvelle table près de ${creator.quartier}`, html)
}

// ═══════════════════════════════════════════════════════════
//  RESTAURANT — SÉQUENCE (voix "vous")
// ═══════════════════════════════════════════════════════════

// R0/RH1 — Bienvenue + publier (H+1 ou immédiat après acceptation)
export async function sendRestoR0(resto: { restoName: string; email: string }) {
  const body = p(`Votre compte est actif, et vos 3 collaborations offertes vous attendent (à utiliser sous 30 jours).`) +
    p(`Pour les activer, une seule étape : publier votre offre. On l'a pré-remplie pour vous — il vous reste à vérifier et à cliquer sur Publier.`) +
    spacer() +
    pMuted('Une fois en ligne, des créateurs vérifiés peuvent réserver et venir créer du contenu chez vous.')
  const html = buildEmail(`Bonjour ${resto.restoName},`, body, 'Publier mon offre (2 min)', `${APP_URL}/restaurant/dashboard`)
  await sendToUser(resto.email, 'Bienvenue sur 2960 — publiez votre 1ère offre en 2 min', html)
}

// RJ1 — Relance publication (J+1)
export async function sendRestoDripRJ1(resto: { restoName: string; email: string }) {
  const body = p(`Votre compte est prêt, mais votre offre n'est pas encore en ligne — vos 3 collaborations offertes restent en pause tant qu'elle ne l'est pas.`) +
    p('L\'offre est déjà pré-remplie. 2 minutes suffisent :')
  const html = buildEmail(`Bonjour ${resto.restoName},`, body, 'Mettre mon offre en ligne', `${APP_URL}/restaurant/dashboard`)
  await sendToUser(resto.email, 'Vos 3 collaborations offertes ne tournent pas encore', html)
}

// RJ3 — Pourquoi ça vaut le coup (J+3)
export async function sendRestoDripRJ3(resto: { restoName: string; email: string }) {
  const body = p('Ce que des créateurs vérifiés font concrètement pour vous :') +
    dash('vos plats apparaissent dans les recherches TikTok de votre quartier et de votre cuisine, sans que vous ayez de compte à gérer') +
    dash('du contenu authentique produit pour vous, que vous pouvez réutiliser (licence d\'usage)') +
    dash('chaque collaboration vous montre quel angle et quel plat résonnent le mieux') +
    spacer() +
    p('Ce n\'est pas un coup unique : c\'est une présence qui se construit dans la durée. Et vos 3 premières collaborations sont offertes.')
  const html = buildEmail(`Bonjour ${resto.restoName},`, body, 'Publier mon offre', `${APP_URL}/restaurant/dashboard`)
  await sendToUser(resto.email, 'Comment 2960 travaille pour votre visibilité', html)
}

// RJ6 — Dernier rappel (J+6)
export async function sendRestoDripRJ6(resto: { restoName: string; email: string }) {
  const body = p('Vos 3 collaborations offertes vous attendent toujours. Il suffit de publier votre offre (déjà pré-remplie) pour les activer — avant la fin de votre fenêtre de 30 jours.') +
    spacer() +
    pMuted('Une question avant de publier ? Répondez à ce mail.')
  const html = buildEmail(`Bonjour ${resto.restoName},`, body, 'Activer mes collaborations', `${APP_URL}/restaurant/dashboard`)
  await sendToUser(resto.email, 'On garde vos 3 collaborations offertes au chaud', html)
}

// R-RESA — Un créateur a réservé (transactionnel)
export async function sendRestoResa(data: {
  restoName: string; email: string;
  creatorName: string; date: string; heure: string; numPeople: number;
}) {
  const body = p(`${hl(data.creatorName)} a réservé pour ${data.date} à ${data.heure} — ${data.numPeople} personne${data.numPeople > 1 ? 's' : ''}.`) +
    p('À préparer : un bon accueil, et toute information utile à signaler (allergies, plats indisponibles, table filmable). Le créateur publiera sa vidéo sous 5 jours.')
  const html = buildEmail(`Bonjour ${data.restoName},`, body, 'Voir la réservation', `${APP_URL}/restaurant/dashboard?tab=collabs`, false)
  await sendToUser(data.email, `Nouvelle réservation : ${data.creatorName} vient le ${data.date}`, html)
}

// R-NUDGE-AUTO — Passez en auto (résa en attente >24h)
export async function sendRestoNudgeAuto(data: { restoName: string; email: string; creatorName: string }) {
  const body = p(`${hl(data.creatorName)} attend votre validation depuis hier. Les créateurs sérieux passent vite à l'offre suivante s'ils n'ont pas de réponse.`) +
    p('L\'acceptation automatique vous évite ça : les créateurs 2960 sont déjà vérifiés en amont, vous gagnez du temps, et vous revenez en manuel en 1 clic quand vous le souhaitez.')
  const html = buildEmail(`Bonjour ${data.restoName},`, body, 'Activer l\'acceptation auto', `${APP_URL}/restaurant/dashboard`, false)
  await sendToUser(data.email, 'Une réservation attend votre réponse depuis 24h', html)
}

// R-VIDEO — Vidéo en ligne + licence (transactionnel)
export async function sendRestoVideo(data: {
  restoName: string; email: string;
  creatorName: string; postLink: string;
}) {
  const body = p(`${hl(data.creatorName)} a publié votre vidéo : <a href="${data.postLink}" style="color:#FF6339;text-decoration:underline;">voir la vidéo</a>. Elle restera en ligne au moins 12 mois — votre repas offert continue de travailler bien après la collaboration.`) +
    p('Vous voulez l\'utiliser sur vos propres canaux (site, réseaux, écrans en salle, publicité) ? La licence d\'usage vous en donne le droit :') +
    dash('150€ pour 6 mois') +
    dash('200€ pour 12 mois')
  const html = buildEmail(`Bonjour ${data.restoName},`, body, 'Obtenir la licence d\'usage', `${APP_URL}/restaurant/dashboard`, false)
  await sendToUser(data.email, 'Votre vidéo est en ligne 🎬 (et elle peut travailler plus longtemps)', html)
}

// RP2 — Quelques réglages (J+2 sans résa)
export async function sendRestoRP2(resto: { restoName: string; email: string; isManual: boolean; hasPrime: boolean }) {
  let items = dash('ajoutez 1-2 photos appétissantes de vos plats (c\'est ce qui déclenche l\'envie)') +
    dash('ouvrez quelques créneaux en soirée et le week-end (les plus demandés)')
  if (resto.isManual) items += dash('passez en acceptation automatique : les créateurs réservent là où c\'est instantané')
  if (!resto.hasPrime) items += dash('ajoutez une prime de viralité : les créateurs sont plus attirés par les offres qui en proposent')
  const body = p('Votre offre est en ligne — voici ce qui fait venir les créateurs plus vite :') + items
  const html = buildEmail(`Bonjour ${resto.restoName},`, body, 'Ajuster mon offre', `${APP_URL}/restaurant/dashboard`)
  await sendToUser(resto.email, 'Quelques réglages pour attirer les premiers créateurs', html)
}

// RP5 — Prime + créneaux (J+5 sans résa)
export async function sendRestoRP5(resto: { restoName: string; email: string }) {
  const body = p('Vous n\'avez pas encore reçu de réservation. Deux leviers règlent ça la plupart du temps :') +
    p(`<strong style="color:#1A1A1A;">1. Ajoutez une prime de viralité.</strong> Les créateurs candidatent en priorité sur les offres qui en proposent. On conseille de démarrer à 50 000 vues → 200€ : un seuil assez haut pour ne se déclencher que si une vidéo performe vraiment.`) +
    p(`<strong style="color:#1A1A1A;">2. Ouvrez 2-3 créneaux de plus</strong> (soirées, week-end) et augmentez le nombre de créateurs par semaine.`) +
    spacer() +
    pMuted('Une question pour configurer ? Répondez à ce mail.')
  const html = buildEmail(`Bonjour ${resto.restoName},`, body, 'Ajuster mon offre', `${APP_URL}/restaurant/dashboard`)
  await sendToUser(resto.email, '2 réglages pour vos premières réservations', html)
}

// R-WB — Resto inactif (J+21)
export async function sendRestoWB(resto: { restoName: string; email: string }) {
  const body = p('Votre offre est en pause et vos collaborations offertes ne sont pas encore utilisées. Le catalogue créateurs a évolué depuis votre inscription — il y a sans doute un bon profil pour vous aujourd\'hui.')
  const html = buildEmail(`Bonjour ${resto.restoName},`, body, 'Réactiver mon offre', `${APP_URL}/restaurant/dashboard`)
  await sendToUser(resto.email, 'Vos collaborations offertes vous attendent toujours', html)
}

// R-CONV — Essai → payant (3e collab livrée)
export async function sendRestoConv(resto: { restoName: string; email: string; videoCount: number }) {
  const body = p(`Vos 3 collaborations offertes sont terminées : ${hl(`${resto.videoCount} vidéos`)} publiées, en ligne au moins 12 mois, qui travaillent pour votre visibilité.`) +
    p('Pour continuer sans interruption, voici les formules :') +
    dash('Active (69€/mois) : 4 collaborations incluses') +
    dash('Pro (119€/mois) : collaborations illimitées + invitations directes + directives aux créateurs') +
    spacer() +
    pMuted('Pas prêt ? Vos réservations sont simplement en pause — aucun débit, rien de caché.')
  const html = buildEmail(`Bonjour ${resto.restoName},`, body, 'Choisir ma formule', `${APP_URL}/restaurant/dashboard?tab=settings`)
  await sendToUser(resto.email, `Vos 3 collaborations offertes ont produit ${resto.videoCount} vidéos`, html)
}

// R-ANNUL — Annulation (transactionnel)
export async function sendRestoAnnul(data: { restoName: string; email: string; date: string }) {
  const body = p(`La réservation du ${data.date} vient d'être annulée. Votre créneau est de nouveau libre — un autre créateur peut le réserver.`)
  const html = buildEmail(`Bonjour ${data.restoName},`, body, 'Voir mes créneaux', `${APP_URL}/restaurant/dashboard?tab=collabs`, false)
  await sendToUser(data.email, 'Réservation annulée — votre créneau est de nouveau libre', html)
}

// ═══════════════════════════════════════════════════════════
//  TRANSACTIONAL (shared)
// ═══════════════════════════════════════════════════════════

// Booking confirmation → creator
export async function sendCreatorBookingConfirm(data: {
  creatorName: string; creatorEmail: string;
  restaurantName: string; restaurantAddress: string; restaurantCity: string;
  bookingDate: string; timeSlot: string; offerDescription: string;
}) {
  const body = p(`Ta collab avec ${hl(data.restaurantName)} est confirmée !`) +
    `<div style="background:#F3F4F7;border-radius:12px;padding:20px;margin:16px 0;">
      <div style="margin-bottom:12px;"><span style="color:#6D0040;font-size:12px;">📍 Restaurant</span><br><strong style="color:#1A1A1A;font-size:15px;">${data.restaurantName}</strong><br><span style="color:#6D0040;font-size:13px;">${data.restaurantAddress}, ${data.restaurantCity}</span></div>
      <div style="margin-bottom:12px;"><span style="color:#6D0040;font-size:12px;">📅 Date & Heure</span><br><strong style="color:#1A1A1A;font-size:15px;">${data.bookingDate}</strong><br><span style="color:#6D0040;font-size:13px;">${data.timeSlot}</span></div>
      <div><span style="color:#6D0040;font-size:12px;">🎁 Ce que tu reçois</span><br><span style="color:#1A1A1A;font-size:14px;">${data.offerDescription}</span></div>
    </div>` +
    p('<strong>Rappel :</strong>') +
    dash('Arrive à l\'heure') +
    dash('Mentionne 2960 Agency en arrivant') +
    dash('Crée du contenu authentique et engageant') +
    dash('Poste selon les termes convenus')
  const html = buildEmail(`Bonjour ${data.creatorName},`, body, null, null, false)
  await sendToUser(data.creatorEmail, `✅ Collab confirmée — ${data.restaurantName}`, html)
}

// Booking confirmation → admin (Yara)
export async function sendAdminBookingNotification(data: {
  creatorName: string; creatorTiktok: string; creatorEmail: string; creatorPhone: string;
  restaurantName: string; restaurantAddress: string;
  bookingDate: string; timeSlot: string; offerDescription: string;
}) {
  const rows: [string, unknown][] = [
    ['Créateur', data.creatorName], ['TikTok', data.creatorTiktok],
    ['Email', data.creatorEmail], ['Téléphone', data.creatorPhone],
    ['Restaurant', data.restaurantName], ['Adresse', data.restaurantAddress],
    ['Date', data.bookingDate], ['Créneau', data.timeSlot], ['Offre', data.offerDescription],
  ]
  await sendEmail(`📅 Nouvelle réservation — ${data.creatorName} → ${data.restaurantName}`, buildAdminHtml('Nouvelle réservation', rows))
}

// Welcome creator (pre-validation, at signup)
export async function sendCreatorWelcome(creator: { firstName: string; email: string; ambassadorCode: string }) {
  const body = p('Merci pour ton inscription ! Nous examinons actuellement ton profil pour te matcher avec les meilleures opportunités de collabs.') +
    `<div style="background:#F3F4F7;border-radius:12px;padding:20px;margin:16px 0;">
      <p style="color:#6D0040;font-size:13px;margin:0 0 8px;">📊 Statut de ton compte</p>
      <div style="background:#FFF9E0;border:1px solid #F5E6A3;border-radius:8px;padding:12px;">
        <p style="color:#8B6914;font-size:13px;margin:0;font-weight:600;">⏳ En cours de validation</p>
      </div>
      <p style="color:#6D0040;font-size:12px;margin:10px 0 0;">Nous te contacterons dès que ton compte sera validé.</p>
    </div>` +
    `<div style="background:rgba(109,0,64,0.05);border:1px solid rgba(109,0,64,0.12);border-radius:12px;padding:20px;margin:16px 0;">
      <p style="color:#6D0040;font-size:14px;font-weight:700;margin:0 0 8px;">🎁 Ton code ambassadeur</p>
      <div style="background:#fff;border-radius:8px;padding:14px;margin:8px 0 12px;border:1px solid rgba(109,0,64,0.08);">
        <p style="color:#6D0040;font-size:26px;font-weight:700;text-align:center;margin:0;letter-spacing:0.15em;">${creator.ambassadorCode}</p>
      </div>
      <p style="color:#1A1A1A;font-size:13px;margin:0 0 8px;line-height:1.6;">Partage ce code avec des restaurants ! Si 5 restaurants s'inscrivent avec ton code, tu gagnes ${hl('100€')}.</p>
      <p style="color:#6D0040;font-size:12px;margin:0;">Le restaurant doit simplement entrer ton code lors de son inscription.</p>
    </div>`
  const html = buildEmail(`Salut ${creator.firstName},`, body, null, null, false)
  await sendToUser(creator.email, '🎉 Bienvenue chez 2960 Agency !', html)
}

// Message notification
export async function sendMessageNotification(data: {
  recipientEmail: string; recipientName: string;
  senderName: string; restaurantName: string;
  message: string; conversationUrl: string | null;
}) {
  const body = p(`Vous avez un nouveau message de ${hl(data.senderName)} concernant la collab chez ${data.restaurantName}.`) +
    `<div style="background:#F3F4F7;border-radius:12px;padding:16px;margin:16px 0;">
      <p style="color:#6D0040;font-size:11px;margin:0 0 6px;">${data.senderName}</p>
      <p style="color:#1A1A1A;font-size:14px;margin:0;line-height:1.6;white-space:pre-wrap;">${data.message}</p>
    </div>`
  const html = buildEmail(`Bonjour ${data.recipientName},`, body,
    data.conversationUrl ? 'Répondre' : null,
    data.conversationUrl, false)
  await sendToUser(data.recipientEmail, `💬 Message de ${data.senderName} — ${data.restaurantName}`, html)
}

// Password reset
export async function sendPasswordResetEmail(data: { email: string; firstName: string; resetUrl: string }) {
  const body = p('Tu as demandé à réinitialiser ton mot de passe. Clique sur le bouton ci-dessous pour en choisir un nouveau.') +
    spacer() +
    pMuted('Ce lien expire dans 1 heure. Si tu n\'as pas fait cette demande, ignore cet email.')
  const html = buildEmail(`Salut ${data.firstName},`, body, 'Réinitialiser mon mot de passe', data.resetUrl, false)
  await sendToUser(data.email, 'Réinitialisation de mot de passe — 2960 Agency', html)
}

// Business rejected
export async function sendBusinessRejected(business: { businessName: string; ownerName: string; email: string }) {
  const body = p(`Nous vous remercions pour l'intérêt que vous portez à 2960 Agency. Après examen de votre candidature pour ${hl(business.businessName)}, nous ne sommes malheureusement pas en mesure de vous intégrer à la plateforme pour le moment.`) +
    `<div style="background:#F3F4F7;border-radius:12px;padding:20px;margin:16px 0;">
      <p style="color:#1A1A1A;font-size:13px;margin:0;line-height:1.6;">Cela ne signifie pas que la porte est fermée. Nous onboardons les établissements par vagues et les critères évoluent. N'hésitez pas à repostuler dans quelques semaines.</p>
    </div>` +
    pMuted('Des questions ? Répondez à ce mail ou contactez-nous : <a href="mailto:contact@2960agency.com" style="color:#FF6339;text-decoration:none;">contact@2960agency.com</a>')
  const html = buildEmail(`Bonjour ${business.ownerName},`, body, null, null, false)
  await sendToUser(business.email, 'Votre candidature 2960 Agency', html)
}

// Business accepted (alias for R0)
export async function sendBusinessAccepted(business: { businessName: string; ownerName: string; email: string }) {
  await sendRestoR0({ restoName: business.businessName, email: business.email })
}

// ═══════════════════════════════════════════════════════════
//  LEGACY ALIASES (backward compatibility for existing callers)
// ═══════════════════════════════════════════════════════════

export const sendCreatorValidation = sendCreatorC0

export async function sendBookingConfirmation(booking: {
  creatorName: string; creatorEmail: string; creatorPhone: string; creatorTiktok: string;
  restaurantName: string; restaurantAddress: string; restaurantCity: string;
  restaurantEmail: string | null; restaurantOwner: string | null;
  conversationUrl: string | null;
  bookingDate: string; timeSlot: string; offerDescription: string;
}) {
  await sendCreatorBookingConfirm({
    creatorName: booking.creatorName, creatorEmail: booking.creatorEmail,
    restaurantName: booking.restaurantName, restaurantAddress: booking.restaurantAddress,
    restaurantCity: booking.restaurantCity,
    bookingDate: booking.bookingDate, timeSlot: booking.timeSlot,
    offerDescription: booking.offerDescription,
  })
  await sendAdminBookingNotification({
    creatorName: booking.creatorName, creatorTiktok: booking.creatorTiktok,
    creatorEmail: booking.creatorEmail, creatorPhone: booking.creatorPhone,
    restaurantName: booking.restaurantName,
    restaurantAddress: `${booking.restaurantAddress}, ${booking.restaurantCity}`,
    bookingDate: booking.bookingDate, timeSlot: booking.timeSlot,
    offerDescription: booking.offerDescription,
  })
  if (booking.restaurantEmail) {
    const numMatch = booking.offerDescription?.match(/(\d+)/)
    const numPeople = numMatch ? parseInt(numMatch[1]) : 1
    await sendRestoResa({
      restoName: booking.restaurantName, email: booking.restaurantEmail,
      creatorName: booking.creatorName, date: booking.bookingDate,
      heure: booking.timeSlot, numPeople,
    })
  }
}

export async function sendBookingCancelledEmail(resto: { ownerName: string; email: string; creatorName: string; bookingDate: string }) {
  await sendRestoAnnul({ restoName: resto.ownerName, email: resto.email, date: resto.bookingDate })
}

export async function sendBookingReminder(data: {
  creatorName: string; creatorEmail: string;
  restaurantName: string; restaurantAddress: string; restaurantCity: string;
  bookingDate: string; timeSlot: string; offerDescription: string;
  reconfirmUrl: string;
}) {
  await sendCreatorReconf({
    firstName: data.creatorName.split(' ')[0], email: data.creatorEmail,
    restoName: data.restaurantName,
    date: data.bookingDate, heure: data.timeSlot,
    maxPeople: 3,
    reconfirmUrl: data.reconfirmUrl,
  })
}

export async function sendMoteurBPush(creator: { firstName: string; email: string; restoName: string; maxGuests: number; netPrime: number }) {
  await sendCreatorInvitation({
    firstName: creator.firstName, email: creator.email,
    restoName: creator.restoName, quartier: '',
    maxPeople: creator.maxGuests, netPrime: creator.netPrime,
  })
}

export async function sendNudgeAutoAccept(resto: { ownerName: string; email: string }) {
  await sendRestoNudgeAuto({ restoName: resto.ownerName, email: resto.email, creatorName: 'Un créateur' })
}

export async function sendRestoDripH1(resto: { ownerName: string; email: string }) { await sendRestoR0({ restoName: resto.ownerName, email: resto.email }) }
export async function sendRestoDripJ1(resto: { ownerName: string; email: string }) { await sendRestoDripRJ1({ restoName: resto.ownerName, email: resto.email }) }
export async function sendRestoDripJ3(resto: { ownerName: string; email: string }) { await sendRestoDripRJ3({ restoName: resto.ownerName, email: resto.email }) }
export async function sendRestoDripJ6(resto: { ownerName: string; email: string }) { await sendRestoDripRJ6({ restoName: resto.ownerName, email: resto.email }) }
export async function sendRestoPublishedNoBookingsJ2(resto: { ownerName: string; email: string }) { await sendRestoRP2({ restoName: resto.ownerName, email: resto.email, isManual: false, hasPrime: false }) }
export async function sendRestoPublishedNoBookingsJ5(resto: { ownerName: string; email: string }) { await sendRestoRP5({ restoName: resto.ownerName, email: resto.email }) }
export async function sendCreatorDripC2(creator: { firstName: string; email: string }) { await sendCreatorC1(creator) }
export async function sendCreatorDripC3(creator: { firstName: string; email: string }) { await sendCreatorC1(creator) }
export async function sendCreatorDripC4(creator: { firstName: string; email: string }) { await sendCreatorC1(creator) }
export async function sendCreatorDripC5(creator: { firstName: string; email: string; restoName: string; maxGuests: number; maxPrime: number }) {
  await sendCreatorInvitation({ firstName: creator.firstName, email: creator.email, restoName: creator.restoName, quartier: '', maxPeople: creator.maxGuests, netPrime: Math.round(creator.maxPrime * 0.75) })
}
export async function sendRestoDripR2(resto: { ownerName: string; email: string }) { await sendRestoDripRJ1({ restoName: resto.ownerName, email: resto.email }) }
export async function sendRestoDripR3(resto: { ownerName: string; email: string }) { await sendRestoDripRJ6({ restoName: resto.ownerName, email: resto.email }) }
