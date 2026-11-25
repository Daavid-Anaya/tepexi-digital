import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Ejercita el cliente real de @upstash/redis contra un `fetch` simulado, para que la
// cancelación por timeout y la política de reintentos se verifiquen de punta a punta.
const logErrorMock = vi.fn()
vi.mock('@/lib/observability', () => ({ logError: logErrorMock }))

const CONTACT = { limit: 5, windowSeconds: 900 }

// Upstash responde a comandos individuales con `{ result }` y a pipelines (que usa
// el auto-pipelining predeterminado del cliente) con `[{ result }]`.
function upstashReply(url: string, result: unknown): Response {
  const body = url.includes('pipeline') ? [{ result }] : { result }
  return new Response(JSON.stringify(body), { status: 200 })
}

function hangUntilAborted(_url: string, init: RequestInit): Promise<Response> {
  return new Promise((_, reject) => {
    init.signal?.addEventListener('abort', () => reject(init.signal?.reason))
  })
}

async function loadRateLimit() {
  vi.resetModules()
  return import('@/lib/rate-limit')
}

describe('rateLimit with the real Upstash client', () => {
  const fetchMock = vi.fn<(url: string, init: RequestInit) => Promise<Response>>()

  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('fetch', fetchMock)
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://example.upstash.io')
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'test-token')
    vi.stubEnv('KV_REST_API_URL', undefined)
    vi.stubEnv('KV_REST_API_TOKEN', undefined)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
    vi.clearAllMocks()
    fetchMock.mockReset()
  })

  it('cancels the request to a store that does not answer and reports unavailable', async () => {
    fetchMock.mockImplementation(hangUntilAborted)
    const { rateLimit } = await loadRateLimit()

    const pending = rateLimit('contact:203.0.113.5', CONTACT)
    await vi.advanceTimersByTimeAsync(1_999)
    const [, init] = fetchMock.mock.calls[0]
    expect(init.signal?.aborted).toBe(false)

    let settled = false
    void pending.then(() => {
      settled = true
    })
    await vi.advanceTimersByTimeAsync(1)

    // Resuelto solo por el aborto: el plazo de respaldo aún no vence y
    // el error registrado es el motivo del aborto, no el error propio del respaldo.
    expect(settled).toBe(true)
    expect(await pending).toEqual({ status: 'unavailable', remaining: 0, retryAfterSeconds: 0 })
    expect(init.signal?.aborted).toBe(true)
    expect(logErrorMock).toHaveBeenCalledWith(
      '[rate-limit] shared store request failed',
      expect.objectContaining({ source: 'rateLimit' }),
    )
    // Identidad, no igualdad profunda: ambos errores de timeout comparten el mismo mensaje.
    expect(logErrorMock.mock.calls[0][1].error).toBe(init.signal?.reason)

    // La solicitud cancelada no se reintenta después del timeout.
    await vi.advanceTimersByTimeAsync(5_000)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('falls back to the backstop deadline when the request ignores the abort', async () => {
    fetchMock.mockImplementation(() => new Promise<Response>(() => undefined))
    const { rateLimit } = await loadRateLimit()

    const pending = rateLimit('contact:203.0.113.5', CONTACT)
    let settled = false
    void pending.then(() => {
      settled = true
    })

    await vi.advanceTimersByTimeAsync(2_249)
    expect(settled).toBe(false)

    await vi.advanceTimersByTimeAsync(1)
    expect(await pending).toEqual({ status: 'unavailable', remaining: 0, retryAfterSeconds: 0 })
    expect(logErrorMock).toHaveBeenCalledWith(
      '[rate-limit] shared store request failed',
      expect.objectContaining({ error: expect.objectContaining({ message: expect.stringContaining('timed out') }) }),
    )
  })

  it('gives every request its own timeout signal', async () => {
    fetchMock.mockImplementation(async (url) => upstashReply(url, [1, 900_000]))
    const { rateLimit } = await loadRateLimit()

    await rateLimit('contact:203.0.113.5', CONTACT)
    await vi.advanceTimersByTimeAsync(2_000)
    const result = await rateLimit('contact:198.51.100.7', CONTACT)

    expect(result.status).toBe('allowed')
    const [first, second] = fetchMock.mock.calls.map(([, init]) => init.signal)
    expect(first).toBeInstanceOf(AbortSignal)
    expect(second).not.toBe(first)
    expect(second?.aborted).toBe(false)
  })

  it('retries once after a network error', async () => {
    fetchMock
      .mockRejectedValueOnce(new TypeError('fetch failed'))
      .mockImplementation(async (url) => upstashReply(url, [1, 900_000]))
    const { rateLimit } = await loadRateLimit()

    const pending = rateLimit('contact:203.0.113.5', CONTACT)
    await vi.advanceTimersByTimeAsync(100)

    expect(await pending).toEqual({ status: 'allowed', remaining: 4, retryAfterSeconds: 0 })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('stops after a single retry and reports unavailable when the network keeps failing', async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'))
    const { rateLimit } = await loadRateLimit()

    const pending = rateLimit('contact:203.0.113.5', CONTACT)
    await vi.advanceTimersByTimeAsync(1_000)

    expect((await pending).status).toBe('unavailable')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
