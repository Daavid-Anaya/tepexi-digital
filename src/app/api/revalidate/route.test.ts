import { beforeEach, describe, expect, it, vi } from 'vitest'

const parseBodyMock = vi.fn()
const rateLimitMock = vi.fn()
const revalidatePathMock = vi.fn()
const revalidateTagMock = vi.fn()
const logErrorMock = vi.fn()
const logWarnMock = vi.fn()

vi.mock('next-sanity/webhook', () => ({
  parseBody: parseBodyMock,
}))

vi.mock('@/lib/rate-limit', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/rate-limit')>()),
  rateLimit: rateLimitMock,
}))

vi.mock('next/cache', () => ({
  revalidatePath: revalidatePathMock,
  revalidateTag: revalidateTagMock,
}))

vi.mock('@/lib/observability', () => ({
  logError: logErrorMock,
  logWarn: logWarnMock,
}))

describe('POST /api/revalidate', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    process.env.SANITY_REVALIDATE_SECRET = 'test-secret'
    rateLimitMock.mockResolvedValue({ status: 'allowed', remaining: 29, retryAfterSeconds: 0 })
  })

  it('returns 429 with Retry-After and skips signature verification when blocked', async () => {
    rateLimitMock.mockResolvedValueOnce({ status: 'blocked', remaining: 0, retryAfterSeconds: 42 })
    const { POST } = await import('@/app/api/revalidate/route')
    const request = new Request('https://tepexidigital.com.mx/api/revalidate', {
      method: 'POST',
      headers: { 'x-real-ip': '203.0.113.5' },
    }) as Parameters<typeof POST>[0]

    const response = await POST(request)

    expect(response.status).toBe(429)
    expect(response.headers.get('Retry-After')).toBe('42')
    await expect(response.json()).resolves.toEqual({ message: 'Too many requests' })
    expect(rateLimitMock).toHaveBeenCalledWith('revalidate:203.0.113.5', { limit: 30, windowSeconds: 60 })
    expect(parseBodyMock).not.toHaveBeenCalled()
    expect(revalidatePathMock).not.toHaveBeenCalled()
  })

  it('fails open and still requires a valid signature when the rate limit store is unavailable', async () => {
    rateLimitMock.mockResolvedValueOnce({ status: 'unavailable', remaining: 0, retryAfterSeconds: 0 })
    parseBodyMock.mockResolvedValueOnce({ isValidSignature: false, body: null })
    const { POST } = await import('@/app/api/revalidate/route')
    const request = new Request('https://tepexidigital.com.mx/api/revalidate', {
      method: 'POST',
    }) as Parameters<typeof POST>[0]

    const response = await POST(request)

    expect(response.status).toBe(401)
    expect(parseBodyMock).toHaveBeenCalledTimes(1)
    expect(revalidatePathMock).not.toHaveBeenCalled()
  })

  it('rate limits IPv6 clients by their /64 prefix', async () => {
    parseBodyMock.mockResolvedValueOnce({ isValidSignature: true, body: { _type: 'evento', slug: { current: 'feria' } } })
    const { POST } = await import('@/app/api/revalidate/route')
    const request = new Request('https://tepexidigital.com.mx/api/revalidate', {
      method: 'POST',
      headers: { 'x-real-ip': '2001:db8:1:2:abcd::9' },
    }) as Parameters<typeof POST>[0]

    await POST(request)

    expect(rateLimitMock).toHaveBeenCalledWith('revalidate:2001:db8:1:2::/64', { limit: 30, windowSeconds: 60 })
  })

  it('revalidates normally when allowed', async () => {
    parseBodyMock.mockResolvedValueOnce({ isValidSignature: true, body: { _type: 'evento', slug: { current: 'feria' } } })
    const { POST } = await import('@/app/api/revalidate/route')
    const request = new Request('https://tepexidigital.com.mx/api/revalidate', {
      method: 'POST',
    }) as Parameters<typeof POST>[0]

    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(rateLimitMock).toHaveBeenCalledWith('revalidate:unknown', { limit: 30, windowSeconds: 60 })
    expect(revalidatePathMock).toHaveBeenCalledWith('/agenda')
    expect(revalidatePathMock).toHaveBeenCalledWith('/agenda/feria')
    expect(revalidateTagMock).toHaveBeenCalledWith('sanity', { expire: 0 })
  })

  it('returns 500 and skips webhook parsing when SANITY_REVALIDATE_SECRET is missing', async () => {
    delete process.env.SANITY_REVALIDATE_SECRET

    const { POST } = await import('@/app/api/revalidate/route')
    const request = new Request('https://tepexidigital.com.mx/api/revalidate', {
      method: 'POST',
    }) as Parameters<typeof POST>[0]

    const response = await POST(request)

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      message: 'Revalidation is not configured',
    })
    expect(parseBodyMock).not.toHaveBeenCalled()
    expect(revalidatePathMock).not.toHaveBeenCalled()
    expect(revalidateTagMock).not.toHaveBeenCalled()
    expect(logErrorMock).toHaveBeenCalledWith(
      '[revalidate] missing SANITY_REVALIDATE_SECRET configuration',
      expect.objectContaining({
        route: '/api/revalidate',
        source: 'revalidateRoute',
        statusCode: 500,
        metadata: {
          envVar: 'SANITY_REVALIDATE_SECRET',
        },
      }),
    )
  })
})
