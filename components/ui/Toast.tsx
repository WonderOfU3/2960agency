'use client'

import { useState, useCallback, createContext, useContext } from 'react'
import { useTheme } from '@/context/ThemeContext'

// ─── Toast ───
interface ToastData {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

interface ConfirmData {
  message: string
  onConfirm: () => void
}

interface ToastContextType {
  toast: (message: string, type?: 'success' | 'error' | 'info') => void
  confirmModal: (message: string, onConfirm: () => void) => void
}

const ToastContext = createContext<ToastContextType>({
  toast: () => {},
  confirmModal: () => {},
})

export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([])
  const [confirm, setConfirm] = useState<ConfirmData | null>(null)
  const [counter, setCounter] = useState(0)
  const { theme } = useTheme()
  const dark = theme === 'dark'

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = counter
    setCounter(c => c + 1)
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [counter])

  const confirmModal = useCallback((message: string, onConfirm: () => void) => {
    setConfirm({ message, onConfirm })
  }, [])

  return (
    <ToastContext.Provider value={{ toast: addToast, confirmModal }}>
      {children}

      {/* Toast stack */}
      <div style={{ position: 'fixed', bottom: 16, left: 16, right: 16, zIndex: 99999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, pointerEvents: 'none' }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            pointerEvents: 'auto',
            padding: '12px 20px',
            borderRadius: 12,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            fontWeight: 500,
            color: '#fff',
            background: t.type === 'success' ? '#22c55e' : t.type === 'error' ? '#ef4444' : dark ? '#2a2a2a' : '#1e1e1e',
            boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
            animation: 'toastIn 0.3s ease',
            maxWidth: 'min(360px, 100%)',
          }}>
            {t.message}
          </div>
        ))}
      </div>

      {/* Confirm modal */}
      {confirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99998, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div style={{
            background: dark ? '#1e1e1e' : '#fff', borderRadius: 16, padding: 'clamp(20px, 5vw, 28px) clamp(16px, 4vw, 32px)', maxWidth: 400, width: '100%',
            boxShadow: dark ? '0 8px 40px rgba(0,0,0,0.5)' : '0 8px 40px rgba(0,0,0,0.2)', fontFamily: "'DM Sans', sans-serif",
          }}>
            <p style={{ fontSize: 14, color: dark ? '#e5e5e5' : '#1e1e1e', lineHeight: 1.6, marginBottom: 24 }}>{confirm.message}</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirm(null)}
                style={{
                  padding: '10px 20px', borderRadius: 10, border: dark ? '1px solid #333' : '1px solid #e5e5e5', background: dark ? '#2a2a2a' : '#fff',
                  fontSize: 13, fontWeight: 500, color: dark ? '#aaa' : '#666', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Annuler
              </button>
              <button
                onClick={() => { confirm.onConfirm(); setConfirm(null) }}
                style={{
                  padding: '10px 20px', borderRadius: 10, border: 'none', background: '#E8471A',
                  fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ToastContext.Provider>
  )
}
