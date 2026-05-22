'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useTheme } from '@/context/ThemeContext'
import { useLanguage } from '@/context/LanguageContext'

interface Notification {
  id: number
  type: string
  title: string
  body: string
  link: string | null
  read: boolean
  created_at: string
}

export default function NotificationBell() {
  const { c } = useTheme()
  const { locale } = useLanguage()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications')
      if (!res.ok) return
      const data = await res.json()
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000) // poll every 30s
    return () => clearInterval(interval)
  }, [fetchNotifications])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const markAllRead = async () => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAll: true }),
    })
    setUnreadCount(0)
    setNotifications(n => n.map(x => ({ ...x, read: true })))
  }

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return locale === 'fr' ? "à l'instant" : 'just now'
    if (mins < 60) return `${mins}m`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h`
    return `${Math.floor(hours / 24)}j`
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer transition-all"
        style={{ background: open ? c.inputBg : 'transparent', border: 'none', color: c.textMuted }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
            style={{ background: '#E8471A', minWidth: 18, height: 18, padding: '0 4px' }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed sm:absolute inset-x-2 sm:inset-x-auto sm:right-0 top-16 sm:top-11 rounded-xl overflow-hidden animate-fade-in z-50"
          style={{
            maxWidth: 360, maxHeight: 400,
            background: c.cardBg,
            border: `1px solid ${c.divider}`,
            boxShadow: c.isLight ? '0 8px 30px rgba(0,0,0,0.12)' : '0 8px 30px rgba(0,0,0,0.4)',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${c.divider}` }}>
            <span className="font-dm text-[13px] font-semibold" style={{ color: c.text }}>
              Notifications
            </span>
            {unreadCount > 0 && (
              <button onClick={markAllRead}
                className="font-dm text-[11px] cursor-pointer"
                style={{ color: '#E8471A', background: 'none', border: 'none' }}>
                {locale === 'fr' ? 'Tout lire' : 'Mark all read'}
              </button>
            )}
          </div>

          <div style={{ maxHeight: 340, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <p className="font-dm text-center py-8 text-[12px]" style={{ color: c.textFaint }}>
                {locale === 'fr' ? 'Aucune notification' : 'No notifications'}
              </p>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className="px-4 py-3 transition-all cursor-default"
                  style={{
                    borderBottom: `1px solid ${c.divider}`,
                    background: n.read ? 'transparent' : (c.isLight ? 'rgba(232,71,26,0.03)' : 'rgba(232,71,26,0.05)'),
                  }}
                  onClick={() => {
                    if (n.link) window.location.href = n.link
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-dm text-[12px] font-semibold" style={{ color: n.read ? c.textMuted : c.text }}>
                        {!n.read && <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5" style={{ background: '#E8471A', verticalAlign: 'middle' }} />}
                        {n.title}
                      </p>
                      <p className="font-dm text-[11px] mt-0.5" style={{ color: c.textFaint }}>{n.body}</p>
                    </div>
                    <span className="font-dm text-[10px] flex-shrink-0" style={{ color: c.textUltraFaint }}>
                      {timeAgo(n.created_at)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
