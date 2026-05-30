import sql from '@/lib/db'

interface NotificationInput {
  recipientType: 'creator' | 'restaurant' | 'admin'
  recipientId: number
  type: string
  title: string
  body: string
  link?: string
}

export async function createNotification(input: NotificationInput) {
  try {
    await sql`
      INSERT INTO notifications (recipient_type, recipient_id, type, title, body, link)
      VALUES (${input.recipientType}, ${input.recipientId}, ${input.type}, ${input.title}, ${input.body}, ${input.link || null})
    `
  } catch (err) {
    console.error('Failed to create notification:', err)
  }
}

export async function notifyNewBooking(creatorName: string, restaurantId: number, bookingDate: string) {
  await createNotification({
    recipientType: 'restaurant',
    recipientId: restaurantId,
    type: 'booking_new',
    title: 'Nouvelle réservation',
    body: `${creatorName} a réservé un créneau le ${bookingDate}`,
    link: '/restaurant/dashboard?tab=collabs',
  })
}

export async function notifyBookingAccepted(creatorId: number, restaurantName: string) {
  await createNotification({
    recipientType: 'creator',
    recipientId: creatorId,
    type: 'booking_accepted',
    title: 'Réservation confirmée',
    body: `${restaurantName} a confirmé votre collab`,
    link: '/creator/dashboard?tab=bookings',
  })
}

export async function notifyBookingRefused(creatorId: number, restaurantName: string) {
  await createNotification({
    recipientType: 'creator',
    recipientId: creatorId,
    type: 'booking_refused',
    title: 'Réservation refusée',
    body: `${restaurantName} a refusé votre demande de collab`,
    link: '/creator/dashboard?tab=bookings',
  })
}

export async function notifyNewMessage(recipientType: 'creator' | 'restaurant', recipientId: number, senderName: string) {
  await createNotification({
    recipientType,
    recipientId,
    type: 'message',
    title: 'Nouveau message',
    body: `${senderName} vous a envoyé un message`,
    link: `/${recipientType === 'creator' ? 'creator' : 'restaurant'}/dashboard?tab=messages`,
  })
}

export async function notifyNewReview(recipientType: 'creator' | 'restaurant', recipientId: number, reviewerName: string, rating: number) {
  await createNotification({
    recipientType,
    recipientId,
    type: 'review',
    title: 'Nouvel avis',
    body: `${reviewerName} vous a donné ${rating}/5`,
  })
}

export async function notifyBookingReminder(creatorId: number, restaurantName: string, bookingDate: string) {
  await createNotification({
    recipientType: 'creator',
    recipientId: creatorId,
    type: 'booking_reminder',
    title: 'Rappel — Reconfirme ta collab',
    body: `Ta collab chez ${restaurantName} le ${bookingDate} approche. Reconfirme ta présence pour maintenir ta réservation.`,
    link: '/creator/dashboard?tab=bookings',
  })
}

export async function notifyCreatorValidated(creatorId: number) {
  await createNotification({
    recipientType: 'creator',
    recipientId: creatorId,
    type: 'validation',
    title: 'Compte validé !',
    body: 'Votre compte a été validé. Vous pouvez maintenant réserver des collabs.',
    link: '/creator/dashboard',
  })
}

export async function notifyCreatorInvited(creatorId: number, restaurantName: string) {
  await createNotification({
    recipientType: 'creator',
    recipientId: creatorId,
    type: 'invitation',
    title: 'Nouvelle invitation !',
    body: `${restaurantName} vous invite à une collaboration.`,
    link: '/creator/dashboard',
  })
}

export async function notifyBookingCancelled(restaurantId: number, creatorName: string) {
  await createNotification({
    recipientType: 'restaurant',
    recipientId: restaurantId,
    type: 'booking_cancelled',
    title: 'Réservation annulée',
    body: `${creatorName} a annulé sa réservation`,
    link: '/restaurant/dashboard?tab=collabs',
  })
}

export async function notifyReconfirmed(restaurantId: number, creatorName: string, bookingDate: string) {
  await createNotification({
    recipientType: 'restaurant',
    recipientId: restaurantId,
    type: 'reconfirmed',
    title: 'Présence reconfirmée',
    body: `${creatorName} a reconfirmé sa présence pour le ${bookingDate}`,
    link: '/restaurant/dashboard?tab=collabs',
  })
}

export async function notifyPostSubmitted(restaurantId: number, creatorName: string) {
  await createNotification({
    recipientType: 'restaurant',
    recipientId: restaurantId,
    type: 'post_submitted',
    title: 'Post soumis',
    body: `${creatorName} a soumis son lien de publication`,
    link: '/restaurant/dashboard?tab=collabs',
  })
}

export async function notifyPostDeadlineWarning(creatorId: number, restaurantName: string) {
  await createNotification({
    recipientType: 'creator',
    recipientId: creatorId,
    type: 'deadline_warning',
    title: 'Plus que 2 jours pour publier !',
    body: `Tu n'as pas encore soumis ton lien pour la collab chez ${restaurantName}. Il te reste 2 jours avant la date limite.`,
    link: '/creator/dashboard?tab=bookings',
  })
}

export async function notifyPostOverdue(creatorId: number, restaurantName: string, violations: number) {
  await createNotification({
    recipientType: 'creator',
    recipientId: creatorId,
    type: 'post_overdue',
    title: 'Délai de publication dépassé',
    body: `Le délai de publication pour ta collab chez ${restaurantName} est dépassé. Avertissement ${violations}/3. Soumets ton lien pour débloquer les réservations.`,
    link: '/creator/dashboard?tab=bookings',
  })
}

export async function notifyRestaurantPostOverdue(restaurantId: number, creatorId: number) {
  await createNotification({
    recipientType: 'restaurant',
    recipientId: restaurantId,
    type: 'post_overdue',
    title: 'Post non soumis dans les délais',
    body: 'Un créateur n\'a pas soumis son post dans les 5 jours suivant la collab. Vous pouvez signaler un problème depuis l\'onglet Collabs.',
    link: '/restaurant/dashboard?tab=collabs',
  })
}

export async function notifyCreatorSuspended(creatorId: number) {
  await createNotification({
    recipientType: 'creator',
    recipientId: creatorId,
    type: 'suspended',
    title: 'Compte suspendu',
    body: 'Votre compte a été suspendu suite à 3 retards de publication. Contactez contact@2960agency.com pour plus d\'informations.',
    link: '/creator/dashboard',
  })
}

export async function notifyAdminReport(restaurantName: string, creatorName: string, bookingId: number) {
  await createNotification({
    recipientType: 'admin',
    recipientId: 1,
    type: 'report',
    title: 'Signalement de post frauduleux',
    body: `${restaurantName} a signalé le post de ${creatorName} (réservation #${bookingId}) comme non conforme.`,
    link: '/admin/dashboard',
  })
}
