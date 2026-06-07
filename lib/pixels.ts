// Client-side pixel helpers for TikTok and Meta conversions
// Import these in 'use client' components only

export function fireCompleteRegistration() {
  if (typeof window === 'undefined') return
  if ((window as any).ttq) (window as any).ttq.track('CompleteRegistration')
  if ((window as any).fbq) (window as any).fbq('track', 'CompleteRegistration')
}

export function fireOffrePubliee() {
  if (typeof window === 'undefined') return
  if ((window as any).ttq) (window as any).ttq.track('OffrePubliee')
  if ((window as any).fbq) (window as any).fbq('trackCustom', 'OffrePubliee')
}
