'use client'

import { Capacitor } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'

/**
 * Initialize native push notifications on mobile (Capacitor).
 * On web, this is a no-op.
 *
 * Call this once after login, passing the user's role and ID
 * so the backend can store the device token.
 */
export async function initPushNotifications(
  recipientType: 'creator' | 'restaurant',
  recipientId: number,
) {
  if (!Capacitor.isNativePlatform()) return

  const permission = await PushNotifications.requestPermissions()
  if (permission.receive !== 'granted') return

  await PushNotifications.register()

  PushNotifications.addListener('registration', async (token) => {
    try {
      await fetch('/api/push/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token.value,
          platform: Capacitor.getPlatform(), // 'ios' | 'android'
          recipientType,
          recipientId,
        }),
      })
    } catch (err) {
      console.error('Push token registration failed:', err)
    }
  })

  PushNotifications.addListener('registrationError', (err) => {
    console.error('Push registration error:', err)
  })

  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    // Notification received while app is in foreground
    console.log('Push received:', notification)
  })

  PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    // User tapped the notification — navigate to the link
    const link = action.notification.data?.link
    if (link && typeof window !== 'undefined') {
      window.location.href = link
    }
  })
}
