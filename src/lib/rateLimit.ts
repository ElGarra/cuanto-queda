// In-memory rate limiter — sufficient for Phase 1 (single instance, dev)
// Production upgrade: replace store with Upstash Redis / Vercel KV

interface Bucket { count: number; resetAt: number }

const store = new Map<string, Bucket>()

export function checkRateLimit(
  key: string,
  { max = 5, windowMs = 15 * 60 * 1000 } = {}
): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now()
  const bucket = store.get(key)

  if (!bucket || now > bucket.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfterMs: 0 }
  }

  if (bucket.count >= max)
    return { allowed: false, retryAfterMs: bucket.resetAt - now }

  bucket.count++
  return { allowed: true, retryAfterMs: 0 }
}

export function resetRateLimit(key: string) {
  store.delete(key)
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0].trim()
    ?? req.headers.get('x-real-ip')
    ?? 'unknown'
}
