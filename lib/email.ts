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
    <img src="${APP_URL}/images/email-logo-v2.png" alt="2960 AGENCY" width="132" height="18" style="display:inline-block;" />
  </div>
  <div style="background:#fff;border-radius:16px;padding:36px 32px;">
    <p style="color:#1A1A1A;font-size:15px;margin:0 0 20px;line-height:1.6;">${greeting}</p>
    ${bodyHtml}
    ${ctaBlock}
  </div>
  <div style="text-align:center;margin-top:24px;">
    <img src="${APP_URL}/images/email-logo-v2.png" alt="2960 AGENCY" width="88" height="12" style="display:inline-block;opacity:0.5;" />${unsub}
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

// C.0 — Candidature explainer (immédiat à l'inscription, transactionnel)
export async function sendRestoExplainer(resto: { restoName: string; email: string }) {
  const body = p(`Votre inscription chez 2960 Agency est enregistrée. En une minute, voici exactement comment ça marche — parce qu'une pub ne dit jamais tout.`) +
    p(`Aujourd'hui, vos futurs clients découvrent les restos sur les réseaux, dans une vidéo. Les restaurants qui remplissent ne cuisinent pas mieux que vous — on les voit, plus souvent, au bon endroit.`) +
    p('Le concept, en 3 étapes :') +
    dash('Vous postez vos créneaux et le nombre de convives que le créateur peut emmener (on recommande 2-3 : une table animée donne une vidéo plus naturelle)') +
    dash('Un créateur local voit vos créneaux et réserve. Vous lui offrez le repas') +
    dash('Il vient, filme, et publie la vidéo sur son compte — vue par son audience : vos voisins. Elle reste en ligne au moins 12 mois') +
    spacer() +
    p('On travaille surtout avec des petits créateurs locaux. Pourquoi c\'est mieux que les gros :') +
    dash('leur audience habite à côté de chez vous = de vrais clients potentiels') +
    dash('on croit un petit créateur comme un conseil d\'ami, pas comme une pub') +
    dash('quand plusieurs créateurs du coin parlent de vous, le quartier se dit « tout le monde y va, sauf moi »') +
    dash('et c\'est du contenu pro, gratuit : pas de photographe ni de vidéaste à payer') +
    spacer() +
    p('Le tout pour le prix d\'un repas — pas 2 000€ la vidéo d\'un gros influenceur, pas 600€/mois une agence, pas de Google Ads.') +
    p('Tout se passe en ligne, à votre rythme, et personne ne vous appelle.')
  const html = buildEmail(`Bonjour ${resto.restoName},`, body, 'Accéder à mon espace', `${APP_URL}/restaurant/dashboard`, false)
  await sendToUser(resto.email, 'Bienvenue chez 2960 Agency — comment ça marche vraiment', html)
}

// R0 — Offre pré-remplie, mettre en ligne (H+1, marketing)
export async function sendRestoR0(resto: { restoName: string; email: string }) {
  const body = p(`Vous n'avez pas eu le temps de remplir votre offre ? On s'en est chargé pour vous. Tout est prêt — il ne reste qu'un geste pour la rendre visible aux créateurs.`) +
    p('Ce qu\'on a rempli à votre place :') +
    dash('vos meilleures photos, récupérées en ligne (à remplacer si vous préférez les vôtres)') +
    dash('vos horaires d\'ouverture habituels, transformés en créneaux') +
    dash('1 seul créateur par service : pas d\'invasion en cuisine') +
    dash('l\'acceptation automatique (modifiable en 1 clic)') +
    dash('aucune prime : vous en ajouterez une plus tard, si vous voulez') +
    spacer() +
    pMuted('Le bouton vous emmène à votre espace : là, un simple toggle « offre visible » met votre offre en ligne. Aucun argent ne sort — vous offrez un repas, rien d\'autre. Et vous la remettez en pause quand vous voulez.')
  const html = buildEmail(`Bonjour ${resto.restoName},`, body, 'Accéder à mon espace', `${APP_URL}/restaurant/dashboard`)
  await sendToUser(resto.email, 'Votre offre est prête — il reste à la rendre visible', html)
}

// RJ1 — Rappel mise en ligne (J+1, marketing)
export async function sendRestoDripRJ1(resto: { restoName: string; email: string }) {
  const body = p(`Votre offre est prête — on l'a remplie pour vous : photos, horaires, et des réglages prudents (1 seul créateur par service, prime désactivée). Il manque juste votre clic.`) +
    p('Tant qu\'elle n\'est pas en ligne, vos 3 collaborations offertes restent en pause — et elles ne tournent pas pour votre visibilité.') +
    spacer() +
    pMuted('(Vous la remettez en pause quand vous voulez. Rien n\'est figé.)')
  const html = buildEmail(`Bonjour ${resto.restoName},`, body, 'Accéder à mon espace', `${APP_URL}/restaurant/dashboard`)
  await sendToUser(resto.email, 'Vos 3 collaborations offertes sont en pause', html)
}

// RJ3 — Pourquoi ça vaut le coup (J+3, marketing)
export async function sendRestoDripRJ3(resto: { restoName: string; email: string }) {
  const body = p('Aujourd\'hui, près de 2 recherches de restaurant sur 3 se font sur les réseaux sociaux. Vos futurs clients ne lisent plus un avis — ils veulent voir le plat, l\'ambiance, le lieu, dans une vraie vidéo. Là où vous n\'apparaissez pas, c\'est un autre qu\'ils trouvent.') +
    p('Ce que des créateurs vérifiés construisent pour vous, concrètement :') +
    dash('vos plats apparaissent dans les recherches liées à votre quartier et votre cuisine, sans que vous ayez de compte à gérer') +
    dash('du contenu authentique produit pour vous, réutilisable sur vos canaux (licence d\'usage)') +
    dash('une présence qui se construit dans la durée : il faut en moyenne plusieurs rencontres avec un lieu avant qu\'un client s\'y décide — chaque vidéo en est une') +
    spacer() +
    p('Votre offre est déjà prête, vos 3 premières collaborations sont offertes.')
  const html = buildEmail(`Bonjour ${resto.restoName},`, body, 'Accéder à mon espace', `${APP_URL}/restaurant/dashboard`)
  await sendToUser(resto.email, 'Vos clients vous cherchent sur les réseaux', html)
}

// RJ6 — Dernier rappel (J+6, marketing)
export async function sendRestoDripRJ6(resto: { restoName: string; email: string; trialEndDate?: string }) {
  const dateLine = resto.trialEndDate ? `, le ${resto.trialEndDate}` : ''
  const body = p(`Vous vous êtes inscrit, et tout est prêt — mais votre offre n'est pas encore en ligne. Le seul effet, c'est que rien ne tourne pour vous : pas de créateur qui réserve, pas de vidéo qui se publie, pas de présence qui se construit. Et vos 3 collaborations offertes ont une fin de fenêtre${dateLine}.`) +
    p('La bonne nouvelle : il n\'y a rien à préparer. Votre offre est déjà rédigée et réglée. Un clic la met en ligne — vous la remettez en pause quand vous voulez.') +
    spacer() +
    pMuted('Une question avant de la mettre en ligne ? Répondez à ce mail, on vous répond.')
  const html = buildEmail(`Bonjour ${resto.restoName},`, body, 'Accéder à mon espace', `${APP_URL}/restaurant/dashboard`)
  await sendToUser(resto.email, 'On garde vos 3 collaborations au chaud', html)
}

// RP2 — Quelques réglages (J+2 sans résa, marketing)
export async function sendRestoRP2(resto: { restoName: string; email: string; isManual: boolean; hasPrime: boolean }) {
  let items = dash('remplacez 1-2 photos par vos propres clichés de plats : les vôtres donnent plus envie que celles trouvées en ligne') +
    dash('ouvrez quelques créneaux en soirée et le week-end : ce sont les plus demandés')
  if (resto.isManual) items += dash('repassez en acceptation automatique : les créateurs réservent là où c\'est instantané')
  else items += dash('gardez l\'acceptation automatique active : les créateurs réservent là où c\'est instantané')
  if (!resto.hasPrime) items += dash('ajoutez une prime de viralité : les créateurs candidatent en priorité sur les offres qui en proposent')
  const body = p('Votre offre est en ligne, et pas encore de réservation. C\'est presque toujours une question de réglage — pas de restaurant. Voici ce qui fait venir les créateurs plus vite :') + items
  const html = buildEmail(`Bonjour ${resto.restoName},`, body, 'Ajuster mon offre', `${APP_URL}/restaurant/dashboard`)
  await sendToUser(resto.email, 'Quelques réglages pour vos premières réservations', html)
}

// RP5 — Prime + créneaux (J+5 sans résa, marketing)
export async function sendRestoRP5(resto: { restoName: string; email: string; hasPrime: boolean }) {
  const primeBlock = !resto.hasPrime
    ? p(`${hl('1. Ajoutez une prime de viralité.')} C'est une assurance-performance inversée : vous ne payez que si une vidéo explose vraiment. Les créateurs filtrent les offres avec prime en premier — sans, la vôtre passe souvent inaperçue. On conseille de démarrer à 50 000 vues → 200€ : un seuil assez haut pour ne se déclencher que sur une vraie performance.`)
    : ''
  const body = p('Toujours pas de réservation. Deux leviers règlent ça la plupart du temps :') +
    primeBlock +
    p(`${hl('2. Ouvrez 2-3 créneaux de plus.')} Soirées, week-end, et augmentez le nombre de créateurs par semaine. Plus de fenêtres ouvertes, plus de chances qu'un créateur tombe sur la bonne.`) +
    spacer() +
    pMuted('Une question pour régler ça ? Répondez à ce mail.')
  const html = buildEmail(`Bonjour ${resto.restoName},`, body, 'Ajuster mon offre', `${APP_URL}/restaurant/dashboard`)
  await sendToUser(resto.email, '2 réglages pour débloquer vos réservations', html)
}

// R-EMPTY3 — Toujours 0 résa à J+10 (marketing)
export async function sendRestoEmpty3(resto: { restoName: string; email: string; isManual: boolean; hasPrime: boolean }) {
  let items = ''
  if (!resto.hasPrime) items += dash('une prime de viralité (on conseille 50 000 vues → 200€) : les créateurs réservent en priorité les offres qui en proposent, et à ce seuil elle ne se déclenche que sur une vraie performance — vous ne payez donc que si une vidéo cartonne')
  if (resto.isManual) items += dash('l\'acceptation automatique : les créateurs vont là où c\'est instantané. Le filtre existe déjà en amont (2960 Agency vérifie chaque créateur) — l\'auto ne baisse pas votre exigence, elle vous évite juste de rater une demande')
  if (!items) items = dash('ouvrez 2-3 créneaux de plus en soirée et le week-end, et augmentez le nombre de créateurs par semaine')
  const body = p('Votre offre est en ligne depuis quelques jours, et n\'a pas encore reçu de réservation. Ce n\'est pas un mauvais signe : c\'est presque toujours une question de réglage, pas de restaurant. Et c\'est exactement ce qui se corrige en 1 minute.') +
    p('Les leviers qui débloquent les premières réservations :') + items
  const html = buildEmail(`Bonjour ${resto.restoName},`, body, 'Ajuster mon offre', `${APP_URL}/restaurant/dashboard`)
  await sendToUser(resto.email, 'Réglons ce qui empêche vos réservations', html)
}

// R-WB — Offre en pause, pas revenue (21j, marketing froid)
export async function sendRestoWB(resto: { restoName: string; email: string }) {
  const body = p('Votre offre est en pause, et vos collaborations offertes ne sont pas encore utilisées. Depuis, de nouveaux créateurs vérifiés ont rejoint 2960 Agency — il y a sans doute un bon profil pour vous aujourd\'hui qui n\'existait pas la dernière fois.') +
    p('La remettre en ligne, c\'est un clic. Vous la remettez en pause quand vous voulez.')
  const html = buildEmail(`Bonjour ${resto.restoName},`, body, 'Remettre mon offre en ligne', `${APP_URL}/restaurant/dashboard`)
  await sendToUser(resto.email, 'Votre offre est en pause — on a du nouveau', html)
}

// R-RESA — Un créateur a réservé (transactionnel)
export async function sendRestoResa(data: { restoName: string; email: string; creatorName: string; date: string; heure: string; numPeople: number }) {
  const body = p(`${hl(data.creatorName)} a réservé pour ${data.date} à ${data.heure} — ${data.numPeople} personne${data.numPeople > 1 ? 's' : ''}.`) +
    p('Tout ce qu\'il y a à faire : un bon accueil, comme pour un client. Signalez ce qui est utile (allergies, plats indisponibles, une table qui filme bien). Le créateur publiera sa vidéo sous 5 jours après la venue.')
  const html = buildEmail(`Bonjour ${data.restoName},`, body, 'Voir la réservation', `${APP_URL}/restaurant/dashboard?tab=collabs`, false)
  await sendToUser(data.email, `Nouvelle réservation : ${data.creatorName} vient le ${data.date}`, html)
}

// R-NUDGE-AUTO — Résa en attente >24h (marketing)
export async function sendRestoNudgeAuto(data: { restoName: string; email: string; creatorName: string }) {
  const body = p(`${hl(data.creatorName)} attend votre validation depuis hier. Et un créateur sans réponse passe vite à l'offre suivante — vous risquez de le perdre pour rien.`) +
    p('L\'acceptation automatique évite exactement ça : vous ne ratez plus une demande pendant le coup de feu. Et ça ne baisse pas votre exigence — les créateurs 2960 Agency sont déjà vérifiés en amont, et vous revenez en manuel en 1 clic quand vous voulez.')
  const html = buildEmail(`Bonjour ${data.restoName},`, body, 'Activer l\'acceptation auto', `${APP_URL}/restaurant/dashboard`, false)
  await sendToUser(data.email, 'Une réservation attend votre réponse depuis 24h', html)
}

// R-ANNUL — Annulation (transactionnel)
export async function sendRestoAnnul(data: { restoName: string; email: string; date: string }) {
  const body = p(`La réservation du ${data.date} vient d'être annulée. C'est rare — et vous n'avez rien à faire : votre créneau est déjà de nouveau libre, un autre créateur peut le réserver.`)
  const html = buildEmail(`Bonjour ${data.restoName},`, body, 'Voir mes créneaux', `${APP_URL}/restaurant/dashboard?tab=collabs`, false)
  await sendToUser(data.email, 'Réservation annulée — votre créneau est de nouveau libre', html)
}

// R-NOSHOW — Créateur non présenté (transactionnel)
export async function sendRestoNoshow(data: { restoName: string; email: string; creatorName: string; date: string }) {
  const body = p(`Vous nous avez signalé que ${hl(data.creatorName)} ne s'est pas présenté le ${data.date}. C'est rare, et ça ne doit rien vous coûter — voici ce qu'on a fait, automatiquement :`) +
    dash('votre créneau est de nouveau libre, un autre créateur peut le réserver') +
    dash('la collaboration vous est recréditée : elle ne compte pas dans vos 3 offertes') +
    spacer() +
    p('Et le créateur absent voit sa fiabilité baisser sur 2960 Agency. C\'est la contrepartie de la vérification qu\'on impose à chaque collaboration : ici, ne pas venir a un coût. C\'est ce qui rend la plateforme fiable pour vous.')
  const html = buildEmail(`Bonjour ${data.restoName},`, body, 'Voir mes créneaux', `${APP_URL}/restaurant/dashboard?tab=collabs`, false)
  await sendToUser(data.email, `Votre créneau du ${data.date} est de nouveau libre`, html)
}

// R-VIDEO — Vidéo en ligne + licence (transactionnel + upsell)
export async function sendRestoVideo(data: { restoName: string; email: string; creatorName: string; postLink: string }) {
  const body = p(`${hl(data.creatorName)} vient de publier votre vidéo : <a href="${data.postLink}" style="color:#FF6339;text-decoration:underline;">voir la vidéo</a>. Elle restera en ligne au moins 12 mois — votre repas offert continue de travailler pour votre visibilité bien après la venue.`) +
    p('Vous voulez aller plus loin et l\'utiliser sur vos propres canaux — site, réseaux, écrans en salle, publicité ? Une vidéo authentique tournée chez vous, sans avoir payé de vidéaste. La licence d\'usage vous en donne le droit :') +
    dash('150€ pour 6 mois') +
    dash('200€ pour 12 mois')
  const html = buildEmail(`Bonjour ${data.restoName},`, body, 'Obtenir la licence d\'usage', `${APP_URL}/restaurant/dashboard`, false)
  await sendToUser(data.email, 'Votre vidéo est en ligne 🎬', html)
}

// R-RETARD — Vidéo en attente après 5 jours (transactionnel)
export async function sendRestoRetard(data: { restoName: string; email: string; creatorName: string; date: string }) {
  const body = p(`${hl(data.creatorName)} est bien venu le ${data.date}, mais sa vidéo n'est pas encore publiée. Vous n'avez rien à faire : nous relançons le créateur automatiquement pour qu'il poste son lien.`) +
    p('C\'est précisément ce que 2960 Agency vérifie à votre place. Une collaboration n\'est validée que lorsque la vidéo est réellement en ligne — pas avant. Et si elle ne l\'est pas dans un délai raisonnable, la collaboration vous est recréditée : vous ne perdez rien.')
  const html = buildEmail(`Bonjour ${data.restoName},`, body, 'Voir le statut de la collaboration', `${APP_URL}/restaurant/dashboard?tab=collabs`, false)
  await sendToUser(data.email, `Votre vidéo chez ${data.restoName} : on s'en occupe`, html)
}

// R-RETRAIT — Demande de retrait accusée (transactionnel)
export async function sendRestoRetrait(data: { restoName: string; email: string; creatorName: string }) {
  const body = p(`Nous avons bien reçu votre demande concernant la vidéo de ${hl(data.creatorName)}. Nous l'examinons selon nos conditions, et nous revenons vers vous.`) +
    p('Si le retrait est accordé, la collaboration n\'est pas comptée dans vos 3 offertes — elle vous est recréditée.')
  const html = buildEmail(`Bonjour ${data.restoName},`, body, 'Suivre ma demande', `${APP_URL}/restaurant/dashboard?tab=collabs`, false)
  await sendToUser(data.email, 'Votre demande de retrait a bien été reçue', html)
}

// R-PRIME — Prime de viralité déclenchée (transactionnel)
export async function sendRestoPrime(data: { restoName: string; email: string; creatorName: string; seuil: string; montant: number }) {
  const body = p(`Bonne nouvelle : la vidéo de ${hl(data.creatorName)} a atteint le seuil que vous aviez fixé (${data.seuil} vues). C'est exactement le scénario que vous aviez choisi de récompenser — une vidéo qui performe vraiment.`) +
    p('Le détail, en toute transparence :') +
    dash(`Montant que vous aviez fixé : ${data.montant}€`) +
    dash('Paiement sécurisé via Stripe') +
    dash('Vous disposez de 7 jours pour vérifier avant tout prélèvement')
  const html = buildEmail(`Bonjour ${data.restoName},`, body, 'Voir et valider la prime', `${APP_URL}/restaurant/dashboard?tab=collabs`, false)
  await sendToUser(data.email, 'Une de vos vidéos a atteint votre seuil de prime', html)
}

// R-CONV — Essai → payant (3e collab livrée, marketing)
export async function sendRestoConv(resto: { restoName: string; email: string; videoCount: number }) {
  const body = p(`Vos 3 collaborations offertes sont terminées. Ce que vous avez maintenant, et qui ne disparaît pas : ${hl(`${resto.videoCount} vidéos`)} publiées sur de vrais comptes, en ligne au moins 12 mois, qui vous rendent visible là où vos clients cherchent. C'est un actif — pas une dépense passée.`) +
    p('Mises bout à bout, ces vidéos auraient coûté une fortune ailleurs : un créateur facturé à la vidéo, une agence à 600€/mois, un vidéaste pour de l\'UGC. Ici, c\'était 3 repas.') +
    p('Pour continuer sans coupure :') +
    dash('Active · 69€/mois · 4 collaborations incluses chaque mois') +
    dash('Pro · 119€/mois · collaborations illimitées + invitations directes + vos directives') +
    dash('Pro+Assist · sur demande · on gère tout à votre place') +
    spacer() +
    pMuted('Pas prêt à choisir ? Vos réservations restent simplement en pause — aucun débit, rien de caché, rien ne part sans votre clic.')
  const html = buildEmail(`Bonjour ${resto.restoName},`, body, 'Choisir ma formule', `${APP_URL}/restaurant/dashboard?tab=settings`)
  await sendToUser(resto.email, `Vos 3 collaborations, ${resto.videoCount} vidéos en ligne`, html)
}

// R-CONV-2 — Rappel conversion (J+3 après R-CONV, marketing)
export async function sendRestoConv2(resto: { restoName: string; email: string }) {
  const body = p('Petit rappel, sans pression : vos contenus sont en ligne au moins 12 mois. Vos réservations sont simplement en pause — aucun débit, rien de caché.') +
    p('Quand vous voulez reprendre, vous avez deux portes :') +
    dash('un abonnement (Active 69€/mois : 4 collaborations · Pro 119€/mois : illimité + invitations directes + vos directives)') +
    dash('ou à la collaboration, sans abonnement : 35€ par collaboration, sans engagement')
  const html = buildEmail(`Bonjour ${resto.restoName},`, body, 'Choisir comment continuer', `${APP_URL}/restaurant/dashboard?tab=settings`)
  await sendToUser(resto.email, 'Vos réservations sont en pause — rien ne se débite', html)
}

// R-FALLBACK — Réveil Sans Abo (30j inactivité, marketing froid)
export async function sendRestoFallback(resto: { restoName: string; email: string }) {
  const body = p('Vous n\'avez pas de collaboration en cours. Depuis votre dernière, de nouveaux créateurs vérifiés ont rejoint 2960 Agency — il y a sans doute un bon profil pour vous aujourd\'hui.') +
    p('Vous pouvez relancer une collaboration à l\'unité (35€), sans engagement, quand le moment vous va.')
  const html = buildEmail(`Bonjour ${resto.restoName},`, body, 'Lancer une collaboration', `${APP_URL}/restaurant/dashboard`)
  await sendToUser(resto.email, 'Une nouvelle collaboration quand vous voulez', html)
}

// R-PAY-ONB — Bienvenue formule payante (transactionnel)
export async function sendRestoPayOnb(data: { restoName: string; email: string; plan: string }) {
  const planDetails = data.plan === 'pro'
    ? 'des collaborations illimitées, des invitations directes aux créateurs, et la possibilité de leur donner vos directives — l\'angle exact que vous voulez mettre en avant'
    : '4 collaborations par mois, et 14€ par collaboration au-delà'
  const body = p(`Votre formule ${hl(data.plan === 'pro' ? 'Pro' : 'Active')} est active. Ce qu'elle vous donne :`) +
    dash(planDetails) +
    spacer() +
    p('Le meilleur moyen de rentabiliser dès aujourd\'hui : lancez votre prochaine collaboration tout de suite, tant que vous y êtes.')
  const html = buildEmail(`Bonjour ${data.restoName},`, body, 'Lancer ma prochaine collaboration', `${APP_URL}/restaurant/dashboard`, false)
  await sendToUser(data.email, 'C\'est parti — voici ce que votre formule débloque', html)
}

// R-PAY-WAKE — Payé mais inactif (transactionnel)
export async function sendRestoPayWake(data: { restoName: string; email: string }) {
  const body = p('Votre abonnement est actif, mais vous n\'avez pas lancé de collaboration ce mois-ci. C\'est le seul cas où votre formule vous coûte sans rien construire — autant la faire travailler.') +
    p('Choisissez un créateur, ouvrez un créneau, et c\'est reparti.')
  const html = buildEmail(`Bonjour ${data.restoName},`, body, 'Lancer une collaboration', `${APP_URL}/restaurant/dashboard`, false)
  await sendToUser(data.email, 'Votre formule tourne — vos collaborations, pas encore', html)
}

// R-PAY-RENEW — Preuve de valeur avant renouvellement (transactionnel)
export async function sendRestoPayRenew(data: { restoName: string; email: string; videoCount: number; period: string }) {
  const body = p(`Sur ${data.period}, vos collaborations ont produit ${hl(`${data.videoCount} vidéos`)}, toutes en ligne au moins 12 mois. Elles continuent de travailler pour votre visibilité, bien après chaque repas offert — et elles s'ajoutent à celles d'avant.`) +
    p('Votre formule se renouvelle bientôt. Rien à faire pour continuer.')
  const html = buildEmail(`Bonjour ${data.restoName},`, body, 'Voir mes vidéos', `${APP_URL}/restaurant/dashboard?tab=collabs`, false)
  await sendToUser(data.email, `Ce mois-ci, vos collaborations en bref`, html)
}

// R-PAY-CHURN — Sortie digne (transactionnel)
export async function sendRestoPayChurn(data: { restoName: string; email: string }) {
  const body = p('Votre abonnement prend fin. Ce qui ne change pas : les vidéos déjà publiées restent en ligne au moins 12 mois, et continuent de travailler pour vous. Ce que vous avez construit vous reste.') +
    p('Vous pouvez reprendre quand vous voulez — à l\'abonnement, ou à la collaboration (35€). Vos données et votre historique sont conservés, vous repartez d\'où vous vous êtes arrêté.')
  const html = buildEmail(`Bonjour ${data.restoName},`, body, 'Revenir quand je veux', `${APP_URL}/restaurant/dashboard`, false)
  await sendToUser(data.email, 'Votre formule prend fin — ce que vous gardez', html)
}

// R-PAUSE — Confirmation mise en pause (transactionnel)
export async function sendRestoPause(data: { restoName: string; email: string; trialEndDate?: string }) {
  const dateLine = data.trialEndDate ? ` jusqu'au ${data.trialEndDate}` : ''
  const body = p('C\'est fait : votre offre est en pause. Les créateurs ne peuvent plus réserver tant que vous ne l\'avez pas remise en ligne. Aucun débit, rien à gérer.') +
    p(`Une chose à noter : vos 3 collaborations offertes restent utilisables${dateLine}. Vous remettez votre offre en ligne quand le moment vous convient.`)
  const html = buildEmail(`Bonjour ${data.restoName},`, body, 'Remettre mon offre en ligne', `${APP_URL}/restaurant/dashboard`, false)
  await sendToUser(data.email, 'Votre offre est en pause', html)
}

// R-HORSZONE — Hors zone (transactionnel)
export async function sendRestoHorsZone(data: { restoName: string; email: string; zone: string }) {
  const body = p(`Merci de votre inscription. On préfère être franc avec vous : 2960 Agency démarre sur Paris et l'Île-de-France, et on ouvre de nouvelles zones progressivement.`) +
    p(`${data.zone} n'est pas encore couverte. Vous mettre en avant maintenant ne servirait à rien — aucun créateur 2960 Agency n'y est encore actif, et on ne veut pas vous faire une promesse qu'on ne peut pas tenir. Vous êtes donc sur notre liste prioritaire : dès qu'on ouvre près de chez vous, vous serez parmi les tout premiers prévenus.`)
  const html = buildEmail(`Bonjour ${data.restoName},`, body, 'Être prévenu en priorité', `${APP_URL}/restaurant/dashboard`, false)
  await sendToUser(data.email, '2960 Agency arrive bientôt dans votre zone', html)
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
export async function sendRestoPublishedNoBookingsJ5(resto: { ownerName: string; email: string }) { await sendRestoRP5({ restoName: resto.ownerName, email: resto.email, hasPrime: false }) }
export async function sendCreatorDripC2(creator: { firstName: string; email: string }) { await sendCreatorC1(creator) }
export async function sendCreatorDripC3(creator: { firstName: string; email: string }) { await sendCreatorC1(creator) }
export async function sendCreatorDripC4(creator: { firstName: string; email: string }) { await sendCreatorC1(creator) }
export async function sendCreatorDripC5(creator: { firstName: string; email: string; restoName: string; maxGuests: number; maxPrime: number }) {
  await sendCreatorInvitation({ firstName: creator.firstName, email: creator.email, restoName: creator.restoName, quartier: '', maxPeople: creator.maxGuests, netPrime: Math.round(creator.maxPrime * 0.75) })
}
export async function sendRestoDripR2(resto: { ownerName: string; email: string }) { await sendRestoDripRJ1({ restoName: resto.ownerName, email: resto.email }) }
export async function sendRestoDripR3(resto: { ownerName: string; email: string }) { await sendRestoDripRJ6({ restoName: resto.ownerName, email: resto.email }) }
