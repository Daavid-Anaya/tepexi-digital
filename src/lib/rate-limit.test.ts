import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

interface FakeEntry {
  count: number
  expiresAt: number
}

// In-memory stand-in for the Upstash backend. It is shared across module
// reloads, which emulates several instances (or a restart) talking to the
// same Redis database.
const backend = new Map<string, FakeEntry>()
const evalMock = vi.fn(async (_script: string, keys: string[], args: (string | number)[]) => {
  const [key] = keys
  const windowMs = Number(args[0])
  const now = Date.now()
  const entry = backend.get(key)

  if (!entry || entry.expiresAt <= now) {
    backend.set(key, { count: 1, expiresAt: now + windowMs })
    return [1, windowMs]
  }

  entry.count += 1
  return [entry.count, entry.expiresAt - now]
})
const RedisMock = vi.fn(() => ({ eval: evalMock }))
const logErrorMock = vi.fn()

vi.mock('@upstash/redis', () => ({ Redis: RedisMock }))
vi.mock('@/lib/observability', () => ({ logError: logErrorMock }))

const CONTACT = { limit: 5, windowSeconds: 900 }
const REVALIDATE = { limit: 30, windowSeconds: 60 }

const STORE_ENV_VARS = [
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'KV_REST_API_URL',
  'KV_REST_API_TOKEN',
] as const

async function loadRateLimit() {
  vi.resetModules()
  return import('@/lib/rate-limit')
}

// Isolate every test from store variables exported by the developer shell or CI.
beforeEach(() => {
  for (const name of STORE_ENV_VARS) vi.stubEnv(name, undefined)
})

function setUpstashEnv() {
  vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://example.upstash.io')
  vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'test-token')
}

describe('rateLimit with the in-memory store (no Upstash configured outside production)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-19T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllEnvs()
    vi.clearAllMocks()
  })

  it('allows the first 5 contact attempts and blocks the 6th with the remaining wait', async () => {
    const { rateLimit } = await loadRateLimit()

    for (let attempt = 1; attempt <= 5; attempt++) {
      const result = await rateLimit('contact:203.0.113.5', CONTACT)
      expect(result).toEqual({ status: 'allowed', remaining: 5 - attempt, retryAfterSeconds: 0 })
    }

    vi.advanceTimersByTime(60_000)
    const blocked = await rateLimit('contact:203.0.113.5', CONTACT)

    expect(blocked).toEqual({ status: 'blocked', remaining: 0, retryAfterSeconds: 840 })
    expect(RedisMock).not.toHaveBeenCalled()
  })

  it('allows the first 30 revalidate requests and blocks the 31st', async () => {
    const { rateLimit } = await loadRateLimit()

    for (let attempt = 1; attempt <= 30; attempt++) {
      expect((await rateLimit('revalidate:203.0.113.5', REVALIDATE)).status).toBe('allowed')
    }

    expect(await rateLimit('revalidate:203.0.113.5', REVALIDATE)).toEqual({
      status: 'blocked',
      remaining: 0,
      retryAfterSeconds: 60,
    })
  })

  it('uses a fixed window started by the first request and allows new attempts after it expires', async () => {
    const { rateLimit } = await loadRateLimit()

    for (let attempt = 1; attempt <= 5; attempt++) {
      await rateLimit('contact:203.0.113.5', CONTACT)
    }
    vi.advanceTimersByTime(899_999)
    expect((await rateLimit('contact:203.0.113.5', CONTACT)).status).toBe('blocked')

    vi.advanceTimersByTime(1)
    expect(await rateLimit('contact:203.0.113.5', CONTACT)).toEqual({
      status: 'allowed',
      remaining: 4,
      retryAfterSeconds: 0,
    })
  })

  it('keeps separate counters per key', async () => {
    const { rateLimit } = await loadRateLimit()

    for (let attempt = 1; attempt <= 5; attempt++) {
      await rateLimit('contact:203.0.113.5', CONTACT)
    }

    expect((await rateLimit('contact:198.51.100.7', CONTACT)).status).toBe('allowed')
  })

  it('never allows more than the limit for simultaneous requests', async () => {
    const { rateLimit } = await loadRateLimit()

    const results = await Promise.all(
      Array.from({ length: 20 }, () => rateLimit('contact:203.0.113.5', CONTACT)),
    )

    expect(results.filter((result) => result.status === 'allowed')).toHaveLength(5)
    expect(results.filter((result) => result.status === 'blocked')).toHaveLength(15)
  })
})

describe('rateLimit with the shared Upstash store', () => {
  beforeEach(() => {
    backend.clear()
    setUpstashEnv()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllEnvs()
    vi.clearAllMocks()
  })

  it('sends the key and window to a single atomic script call', async () => {
    const { rateLimit } = await loadRateLimit()

    await rateLimit('contact:203.0.113.5', CONTACT)

    expect(RedisMock).toHaveBeenCalledWith(
      expect.objectContaining({ url: 'https://example.upstash.io', token: 'test-token' }),
    )
    expect(evalMock).toHaveBeenCalledTimes(1)
    expect(evalMock).toHaveBeenCalledWith(expect.stringContaining('INCR'), ['contact:203.0.113.5'], [900_000])
  })

  it('accepts the Vercel Marketplace variable names', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', undefined)
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', undefined)
    vi.stubEnv('KV_REST_API_URL', 'https://kv.upstash.io')
    vi.stubEnv('KV_REST_API_TOKEN', 'kv-token')
    const { rateLimit } = await loadRateLimit()

    expect((await rateLimit('contact:203.0.113.5', CONTACT)).status).toBe('allowed')
    expect(RedisMock).toHaveBeenCalledWith(
      expect.objectContaining({ url: 'https://kv.upstash.io', token: 'kv-token' }),
    )
  })

  it('uses the Marketplace pair when the Upstash variables are empty, never mixing pairs', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '')
    vi.stubEnv('KV_REST_API_URL', 'https://kv.upstash.io')
    vi.stubEnv('KV_REST_API_TOKEN', 'kv-token')
    const { rateLimit } = await loadRateLimit()

    expect((await rateLimit('contact:203.0.113.5', CONTACT)).status).toBe('allowed')
    expect(RedisMock).toHaveBeenCalledWith(
      expect.objectContaining({ url: 'https://kv.upstash.io', token: 'kv-token' }),
    )
  })

  it('shares consumption across instances and survives a restart', async () => {
    const firstInstance = await loadRateLimit()
    for (let attempt = 1; attempt <= 3; attempt++) {
      await firstInstance.rateLimit('contact:203.0.113.5', CONTACT)
    }

    const secondInstance = await loadRateLimit()
    expect((await secondInstance.rateLimit('contact:203.0.113.5', CONTACT)).remaining).toBe(1)
    expect((await secondInstance.rateLimit('contact:203.0.113.5', CONTACT)).status).toBe('allowed')

    const restarted = await loadRateLimit()
    expect(await restarted.rateLimit('contact:203.0.113.5', CONTACT)).toEqual({
      status: 'blocked',
      remaining: 0,
      retryAfterSeconds: 900,
    })
  })

  it('reports unavailable and logs when the store fails', async () => {
    evalMock.mockRejectedValueOnce(new Error('connection refused'))
    const { rateLimit } = await loadRateLimit()

    const result = await rateLimit('contact:203.0.113.5', CONTACT)

    expect(result).toEqual({ status: 'unavailable', remaining: 0, retryAfterSeconds: 0 })
    expect(logErrorMock).toHaveBeenCalledWith(
      '[rate-limit] shared store request failed',
      expect.objectContaining({ source: 'rateLimit', error: expect.any(Error) }),
    )
  })

  it('reports unavailable when the store does not answer in time', async () => {
    vi.useFakeTimers()
    evalMock.mockImplementationOnce(() => new Promise(() => undefined))
    const { rateLimit } = await loadRateLimit()

    const pending = rateLimit('contact:203.0.113.5', CONTACT)
    await vi.advanceTimersByTimeAsync(2_000)

    expect((await pending).status).toBe('unavailable')
  })

  it('reports unavailable when the store returns an unexpected payload', async () => {
    evalMock.mockResolvedValueOnce('OK' as never)
    const { rateLimit } = await loadRateLimit()

    expect((await rateLimit('contact:203.0.113.5', CONTACT)).status).toBe('unavailable')
  })
})

describe('rateLimit in production without Upstash configuration', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.clearAllMocks()
  })

  it('reports unavailable instead of silently falling back to per-instance memory', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    const { rateLimit } = await loadRateLimit()

    expect((await rateLimit('contact:203.0.113.5', CONTACT)).status).toBe('unavailable')
    expect(RedisMock).not.toHaveBeenCalled()
    expect(logErrorMock).toHaveBeenCalledWith(
      '[rate-limit] shared store is not configured',
      expect.objectContaining({ source: 'rateLimit' }),
    )
  })
})
