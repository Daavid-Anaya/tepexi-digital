/**
 * Simple in-memory sliding-window rate limiter.
 * Suitable for single-instance deployments (Vercel serverless resets per cold start,
 * which is an acceptable tradeoff for a low-traffic municipal site).
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Periodic cleanup to prevent memory growth
const CLEANUP_INTERVAL_MS = 60_000
let lastCleanup = Date.now()

function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return
  lastCleanup = now
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key)
  }
}

interface RateLimitOptions {
  /** Max requests allowed in the window */
  limit: number
  /** Window duration in seconds */
  windowSeconds: number
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

export function rateLimit(
  key: string,
  { limit, windowSeconds }: RateLimitOptions,
): RateLimitResult {
  cleanup()

  const now = Date.now()
  const windowMs = windowSeconds * 1000
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    const resetAt = now + windowMs
    store.set(key, { count: 1, resetAt })
    return { allowed: true, remaining: limit - 1, resetAt }
  }

  entry.count++
  const allowed = entry.count <= limit
  return {
    allowed,
    remaining: Math.max(0, limit - entry.count),
    resetAt: entry.resetAt,
  }
}
