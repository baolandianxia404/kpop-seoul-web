const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

const MAX_REQUESTS = 5
const WINDOW_MS = 24 * 60 * 60 * 1000

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now >= entry.resetAt) {
    const resetAt = now + WINDOW_MS
    rateLimitMap.set(ip, { count: 1, resetAt })
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt }
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { allowed: true, remaining: MAX_REQUESTS - entry.count, resetAt: entry.resetAt }
}

// Clean up stale entries every hour
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now()
    for (const [key, val] of rateLimitMap) {
      if (now >= val.resetAt) rateLimitMap.delete(key)
    }
  }, 60 * 60 * 1000)
}
