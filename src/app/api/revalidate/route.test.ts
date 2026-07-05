import { beforeEach, describe, expect, it, vi } from 'vitest'

const parseBodyMock = vi.fn()
const rateLimitMock = vi.fn(() => ({ allowed: true }))
const revalidatePathMock = vi.fn()
const revalidateTagMock = vi.fn()
const logErrorMock = vi.fn()
const logWarnMock = vi.fn()

vi.mock('next-sanity/webhook', () => ({
  parseBody: parseBodyMock,
}))

vi.mock('@/lib/rate-limit', () => ({
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
