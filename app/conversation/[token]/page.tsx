'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useTheme } from '@/context/ThemeContext'

interface Message {
  id: number
  created_at: string
  sender_type: 'creator' | 'restaurant'
  sender_name: string
  content: string
}

interface Conversation {
  bookingId: number
  bookingDate: string
  restaurantName: string
  restaurantOwner: string
  creatorName: string
  creatorTiktok: string
}

export default function ConversationPage() {
  const params = useParams<{ token: string }>()
  const { c } = useTheme()
  const token = params.token as string
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/messages/restaurant?token=${token}`)
      if (!res.ok) {
        setError('Conversation non trouvée')
        setLoading(false)
        return
      }
      const data = await res.json()
      setConversation(data.conversation)
      setMessages(data.messages)
    } catch {
      setError('Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { fetchMessages() }, [fetchMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Poll for new messages every 15s
  useEffect(() => {
    if (error) return
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [fetchMessages, error])

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return
    setSending(true)
    try {
      const res = await fetch('/api/messages/restaurant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, content: newMessage }),
      })
      if (res.ok) {
        setNewMessage('')
        await fetchMessages()
      }
    } catch { /* error */ }
    setSending(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: c.pageBg }}>
        <span className="animate-spin inline-block w-8 h-8 border-2 border-[#E8471A]/30 border-t-[#E8471A] rounded-full" />
      </div>
    )
  }

  if (error || !conversation) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: c.pageBg }}>
        <div className="text-center">
          <p className="font-dm text-white/40 text-[15px] mb-4">{error || 'Conversation non trouvée'}</p>
          <Link href="/" className="font-dm text-[#E8471A] text-[13px]" style={{ textDecoration: 'none' }}>
            Retour au site
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: c.isLight ? '#f8f8fa' : '#141210' }}>
      {/* Header */}
      <header style={{
        background: c.cardBg,
        borderBottom: `1px solid ${c.cardBorder}`,
      }}>
        <div className="px-4 sm:px-8 py-4">
          <div className="flex items-center gap-3 mb-1">
            <Link href="/" className="font-buster text-white/80 text-[10px] tracking-[0.18em] uppercase" style={{ textDecoration: 'none' }}>
              2960 Agency
            </Link>
            <span className="font-dm text-[#E8471A] text-[11px] font-semibold">Messages</span>
          </div>
          <h1 className="font-dm text-white font-semibold text-[16px]">
            {conversation.creatorName}
            {conversation.creatorTiktok && <span className="text-white/40 font-normal ml-2">{conversation.creatorTiktok}</span>}
          </h1>
          <p className="font-dm text-white/30 text-[12px]">
            Collab chez {conversation.restaurantName} &middot; {new Date(conversation.bookingDate).toLocaleDateString('fr-FR')}
          </p>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="font-dm text-white/40 text-[14px] mb-2">Pas encore de messages</p>
            <p className="font-dm text-white/30 text-[12px]">Envoyez un message au créateur pour discuter de la collab</p>
          </div>
        ) : (
          <div className="space-y-3 max-w-[640px] mx-auto">
            {messages.map(m => (
              <div key={m.id} className={`flex ${m.sender_type === 'restaurant' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[90%] sm:max-w-[80%]" style={{
                  background: m.sender_type === 'restaurant' ? 'rgba(232,71,26,0.18)' : (c.isLight ? '#f0f0f3' : '#1e1b17'),
                  border: `1px solid ${m.sender_type === 'restaurant' ? 'rgba(232,71,26,0.25)' : c.cardBorder}`,
                  borderRadius: 16,
                  borderBottomRightRadius: m.sender_type === 'restaurant' ? 4 : 16,
                  borderBottomLeftRadius: m.sender_type === 'creator' ? 4 : 16,
                  padding: '12px 16px',
                }}>
                  <p className="font-dm text-white/40 text-[10px] mb-1">{m.sender_name}</p>
                  <p className="font-dm text-white/80 text-[14px] leading-relaxed whitespace-pre-wrap">{m.content}</p>
                  <p className="font-dm text-white/20 text-[10px] mt-1 text-right">
                    {new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 sm:px-8 py-4" style={{
        background: c.cardBg,
        borderTop: `1px solid ${c.cardBorder}`,
      }}>
        <div className="flex gap-3 max-w-[640px] mx-auto">
          <input
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Écrire un message..."
            className="font-dm flex-1 rounded-xl text-[14px] text-white/90 placeholder:text-white/20 outline-none"
            style={{
              height: 48,
              padding: '0 16px',
              background: c.inputBg,
              border: `1px solid ${c.cardBorder}`,
            }}
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="font-dm text-[13px] font-semibold px-6 rounded-xl cursor-pointer transition-all disabled:opacity-30"
            style={{ height: 48, background: '#E8471A', color: '#fff', border: 'none' }}
          >
            {sending ? '...' : 'Envoyer'}
          </button>
        </div>
      </div>
    </div>
  )
}
