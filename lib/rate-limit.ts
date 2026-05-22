// In-memory sliding window rate limiter
// Resets on server restart (fine for MVP, use Redis for production scale)

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key)
  }
}, 60000)

interface RateLimitConfig {
  windowMs: number  // Time window in milliseconds
  max: number       // Max requests per window
}

const ROUTE_LIMITS: Record<string, RateLimitConfig> = {
  // Auth routes — strict
  '/api/creator/login':        { windowMs: 60000, max: 5 },
  '/api/restaurant/login':     { windowMs: 60000, max: 5 },
  '/api/admin/login':          { windowMs: 60000, max: 5 },

  // Verification codes — strict
  '/api/creator/verify-code':  { windowMs: 60000, max: 3 },
  '/api/restaurant/verify-code': { windowMs: 60000, max: 3 },

  // Form submissions — moderate
  '/api/submit-creator':       { windowMs: 300000, max: 3 },
  '/api/submit-business':      { windowMs: 300000, max: 3 },
  '/api/contact':              { windowMs: 60000, max: 3 },

  // Upload — moderate
  '/api/upload':               { windowMs: 60000, max: 10 },

  // General API — generous
  'default':                   { windowMs: 60000, max: 60 },
}

export function checkRateLimit(ip: string, path: string): { allowed: boolean; retryAfter: number } {
  const config = ROUTE_LIMITS[path] || ROUTE_LIMITS['default']
  const key = `${ip}:${path}`
  const now = Date.now()

  const entry = store.get(key)

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + config.windowMs })
    return { allowed: true, retryAfter: 0 }
  }

  if (entry.count >= config.max) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
    return { allowed: false, retryAfter }
  }

  entry.count++
  return { allowed: true, retryAfter: 0 }
}
