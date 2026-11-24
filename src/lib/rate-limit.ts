/**
 * Fixed-window rate limiter backed by a shared store.
 *
 * Algorithm: the window starts with the first request for a key and lasts
 * `windowSeconds`. Every request inside the window increments the counter;
 * once it exceeds `limit`, requests are blocked until the window expires.
 * This is NOT a sliding window: a client can spend its full quota at the end
 * of one window and again at the start of the next one.
 *
 * Store selection:
 * - Upstash Redis when `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN`
 *   (or the Vercel Marketplace `KV_REST_API_URL`/`KV_REST_API_TOKEN`) are set.
 *   Counters are shared across serverless instances and survive restarts.
 * - In production without that configuration, every check reports
 *   `unavailable` so each caller applies its explicit failure policy instead
 *   of silently degrading to per-instance counters.
 * - Outside production (local dev, tests), a per-process in-memory store.
 *
 * Store errors and timeouts never throw: they return `unavailable` and are
 * logged. Callers decide whether that blocks or allows the operation.
 */

import { Redis } from '@upstash/redis'
import { logError } from '@/lib/observability'

export const RATE_LIMIT_STATUS = {
  ALLOWED: 'allowed',
  BLOCKED: 'blocked',
  UNAVAILABLE: 'unavailable',
} as const

export type RateLimitStatus = (typeof RATE_LIMIT_STATUS)[keyof typeof RATE_LIMIT_STATUS]

interface RateLimitOptions {
  /** Max requests allowed in the window */
  limit: number
  /** Window duration in seconds */
  windowSeconds: number
}

export interface RateLimitResult {
  status: RateLimitStatus
  remaining: number
  /** Seconds until the window resets; 0 unless the request was blocked */
  retryAfterSeconds: number
}

interface WindowHit {
  count: number
  ttlMs: number
}

interface RateLimitStore {
  hit(key: string, windowMs: number): Promise<WindowHit>
}

const STORE_TIMEOUT_MS = 2_000
// The abort signal enforces STORE_TIMEOUT_MS. The backstop is slightly longer
// so the abort settles first and the race only covers work it cannot cancel.
const STORE_BACKSTOP_TIMEOUT_MS = STORE_TIMEOUT_MS + 250

// Atomic: increments the counter, starts the window on the first hit and
// repairs a key left without expiry, then returns [count, remaining ttl ms].
const FIXED_WINDOW_SCRIPT = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
end
local ttl = redis.call('PTTL', KEYS[1])
if ttl < 0 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
  ttl = tonumber(ARGV[1])
end
return { count, ttl }
`

const UNAVAILABLE_RESULT: RateLimitResult = {
  status: RATE_LIMIT_STATUS.UNAVAILABLE,
  remaining: 0,
  retryAfterSeconds: 0,
}

function createMemoryStore(): RateLimitStore {
  const entries = new Map<string, { count: number; resetAt: number }>()

  return {
    async hit(key, windowMs) {
      const now = Date.now()

      for (const [entryKey, entry] of entries) {
        if (entry.resetAt <= now) entries.delete(entryKey)
      }

      const entry = entries.get(key)
      if (!entry) {
        entries.set(key, { count: 1, resetAt: now + windowMs })
        return { count: 1, ttlMs: windowMs }
      }

      entry.count += 1
      return { count: entry.count, ttlMs: entry.resetAt - now }
    },
  }
}

function isWindowReply(value: unknown): value is [number, number] {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    value.every((item) => typeof item === 'number' && Number.isFinite(item))
  )
}

function createRedisStore(redis: Redis): RateLimitStore {
  return {
    async hit(key, windowMs) {
      const reply: unknown = await redis.eval(FIXED_WINDOW_SCRIPT, [key], [windowMs])
      if (!isWindowReply(reply)) {
        throw new Error('Unexpected rate limit store reply')
      }

      const [count, ttlMs] = reply
      return { count, ttlMs }
    },
  }
}

interface StoreCredentials {
  url: string
  token: string
}

// URL and token are resolved as a pair so a partial Upstash configuration
// never combines with Marketplace values, and empty strings count as unset.
function getStoreCredentials(): StoreCredentials | null {
  const pairs = [
    [process.env.UPSTASH_REDIS_REST_URL, process.env.UPSTASH_REDIS_REST_TOKEN],
    [process.env.KV_REST_API_URL, process.env.KV_REST_API_TOKEN],
  ]

  for (const [url, token] of pairs) {
    if (url && token) return { url, token }
  }

  return null
}

function createDefaultStore(): RateLimitStore | null {
  const credentials = getStoreCredentials()

  if (credentials) {
    return createRedisStore(
      new Redis({
        ...credentials,
        // One retry tolerates transient network errors. The client retries only
        // when `fetch` throws, so a connection lost after Redis ran the script
        // can count one request twice; that only overcounts and is accepted.
        retry: { retries: 1 },
        // Evaluated per request, so each one gets its own deadline and is
        // aborted (not retried) when it expires instead of running on.
        signal: () => createTimeoutSignal(STORE_TIMEOUT_MS),
      }),
    )
  }

  if (process.env.NODE_ENV === 'production') return null

  return createMemoryStore()
}

let defaultStore: RateLimitStore | null | undefined

function getDefaultStore(): RateLimitStore | null {
  if (defaultStore === undefined) defaultStore = createDefaultStore()
  return defaultStore
}

function timeoutError(timeoutMs: number): Error {
  return new Error(`Rate limit store timed out after ${timeoutMs}ms`)
}

// Like `AbortSignal.timeout`, but built on `setTimeout` so tests can drive it
// with fake timers. The timer is unref'd so it never keeps the process alive.
function createTimeoutSignal(timeoutMs: number): AbortSignal {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(timeoutError(timeoutMs)), timeoutMs)
  timer.unref?.()
  return controller.signal
}

// Upper bound for any store, including work the abort signal does not cover.
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(timeoutError(timeoutMs)), timeoutMs)
  })

  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}

function getScope(key: string): string {
  return key.split(':')[0] ?? 'unknown'
}

export async function rateLimit(
  key: string,
  { limit, windowSeconds }: RateLimitOptions,
): Promise<RateLimitResult> {
  const store = getDefaultStore()

  if (!store) {
    logError('[rate-limit] shared store is not configured', {
      source: 'rateLimit',
      metadata: { scope: getScope(key) },
    })
    return UNAVAILABLE_RESULT
  }

  let hit: WindowHit
  try {
    hit = await withTimeout(store.hit(key, windowSeconds * 1000), STORE_BACKSTOP_TIMEOUT_MS)
  } catch (error) {
    logError('[rate-limit] shared store request failed', {
      source: 'rateLimit',
      metadata: { scope: getScope(key) },
      error,
    })
    return UNAVAILABLE_RESULT
  }

  if (hit.count > limit) {
    return {
      status: RATE_LIMIT_STATUS.BLOCKED,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil(hit.ttlMs / 1000)),
    }
  }

  return {
    status: RATE_LIMIT_STATUS.ALLOWED,
    remaining: limit - hit.count,
    retryAfterSeconds: 0,
  }
}
