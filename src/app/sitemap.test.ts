import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SITE_URL } from '@/lib/constants'
import sitemap, { revalidate } from '@/app/sitemap'
import { sanityFetch } from '@/sanity/lib/live'
import { logError, logWarn } from '@/lib/observability'

vi.mock('@/sanity/lib/live', () => ({
  sanityFetch: vi.fn(),
}))

vi.mock('@/lib/observability', () => ({
  logError: vi.fn(),
  logWarn: vi.fn(),
}))

describe('sitemap', () => {
  const mockedSanityFetch = vi.mocked(sanityFetch)
  const mockedLogError = vi.mocked(logError)
  const mockedLogWarn = vi.mocked(logWarn)

  beforeEach(() => {
    mockedSanityFetch.mockReset()
    mockedLogError.mockReset()
    mockedLogWarn.mockReset()
  })

  it('exports an explicit ISR revalidation window for the metadata route', () => {
    expect(revalidate).toBe(3600)
  })

  it('emits deterministic static route metadata without lastModified', async () => {
    mockedSanityFetch.mockResolvedValue({
      data: {
        agenda: [],
        lugares: [],
        gastronomia: [],
        servicios: [],
      },
      sourceMap: null,
      tags: [],
    } satisfies Awaited<ReturnType<typeof sanityFetch>>)

    const entries = await sitemap()

    expect(entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: `${SITE_URL}`,
          changeFrequency: 'weekly',
          priority: 1,
        }),
        expect.objectContaining({
          url: `${SITE_URL}/agenda`,
          changeFrequency: 'daily',
          priority: 0.95,
        }),
        expect.objectContaining({
          url: `${SITE_URL}/como-llegar`,
          changeFrequency: 'monthly',
          priority: 0.8,
        }),
      ]),
    )

    for (const url of [SITE_URL, `${SITE_URL}/agenda`, `${SITE_URL}/como-llegar`]) {
      expect(entries.find((entry) => entry.url === url)).not.toHaveProperty('lastModified')
    }
  })

  it('includes agenda detail urls and emits SEO metadata only for valid slugs', async () => {
    const fetchResult = {
      data: {
        agenda: [
          { slug: 'feria-de-tepexi', _updatedAt: '2026-04-15T18:00:00.000Z' },
          { slug: '', _updatedAt: '2026-04-16T18:00:00.000Z' },
          { slug: '   ', _updatedAt: '2026-04-17T18:00:00.000Z' },
          { slug: null, _updatedAt: '2026-04-18T18:00:00.000Z' },
          { slug: 'foo/bar', _updatedAt: '2026-04-19T18:00:00.000Z' },
          { slug: 'foo?x=1', _updatedAt: '2026-04-20T18:00:00.000Z' },
          { slug: 'foo#hash', _updatedAt: '2026-04-21T18:00:00.000Z' },
          { slug: 'has spaces', _updatedAt: '2026-04-22T18:00:00.000Z' },
        ],
        lugares: [{ slug: 'huellas-de-dinosaurio', _updatedAt: '2026-04-10T12:00:00.000Z' }],
        gastronomia: [{ slug: 'mole-poblano', _updatedAt: '2026-04-11T12:00:00.000Z' }],
        servicios: [{ slug: 'hoteles', _updatedAt: '2026-04-12T12:00:00.000Z' }],
      },
      sourceMap: null,
      tags: [],
    } satisfies Awaited<ReturnType<typeof sanityFetch>>

    mockedSanityFetch.mockResolvedValue(fetchResult)

    const entries = await sitemap()

    expect(entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: `${SITE_URL}/agenda/feria-de-tepexi`,
          lastModified: new Date('2026-04-15T18:00:00.000Z'),
          changeFrequency: 'daily',
          priority: 0.85,
        }),
        expect.objectContaining({
          url: `${SITE_URL}/lugares/huellas-de-dinosaurio`,
          lastModified: new Date('2026-04-10T12:00:00.000Z'),
          changeFrequency: 'monthly',
          priority: 0.85,
        }),
        expect.objectContaining({
          url: `${SITE_URL}/gastronomia/mole-poblano`,
          lastModified: new Date('2026-04-11T12:00:00.000Z'),
          changeFrequency: 'weekly',
          priority: 0.8,
        }),
        expect.objectContaining({
          url: `${SITE_URL}/servicios/hoteles`,
          lastModified: new Date('2026-04-12T12:00:00.000Z'),
          changeFrequency: 'monthly',
          priority: 0.75,
        }),
      ]),
    )

    expect(entries.filter((entry) => entry.url.startsWith(`${SITE_URL}/agenda/`))).toHaveLength(1)
    expect(entries.find((entry) => entry.url === `${SITE_URL}/agenda/`)).toBeUndefined()
    expect(mockedLogWarn).toHaveBeenCalledTimes(7)
    expect(mockedLogWarn).toHaveBeenCalledWith(
      '[sitemap] skipped dynamic route with invalid slug',
      expect.objectContaining({
        route: '/sitemap.xml',
        source: 'sitemap',
        metadata: expect.objectContaining({
          contentType: 'agenda',
          slug: expect.objectContaining({
            reason: 'reserved-character',
            receivedType: 'string',
            normalizedLength: 7,
            rawLength: 7,
          }),
        }),
      }),
    )
  })

  it('omits lastModified and logs a warning when dynamic updatedAt is invalid', async () => {
    mockedSanityFetch.mockResolvedValue({
      data: {
        agenda: [{ slug: 'festival-del-maguey', _updatedAt: 'not-a-date' }],
        lugares: [],
        gastronomia: [],
        servicios: [],
      },
      sourceMap: null,
      tags: [],
    } satisfies Awaited<ReturnType<typeof sanityFetch>>)

    const entries = await sitemap()
    const agendaEntry = entries.find((entry) => entry.url === `${SITE_URL}/agenda/festival-del-maguey`)

    expect(agendaEntry).toEqual(
      expect.objectContaining({
        url: `${SITE_URL}/agenda/festival-del-maguey`,
        changeFrequency: 'daily',
        priority: 0.85,
      }),
    )
    expect(agendaEntry).not.toHaveProperty('lastModified')
    expect(mockedLogWarn).toHaveBeenCalledWith(
      '[sitemap] omitted invalid lastModified for dynamic route',
      expect.objectContaining({
        route: '/sitemap.xml',
        source: 'sitemap',
        metadata: expect.objectContaining({
          contentType: 'agenda',
          path: '/agenda/festival-del-maguey',
          updatedAt: expect.objectContaining({
            reason: 'invalid-date',
            receivedType: 'string',
            valueLength: 10,
          }),
        }),
      }),
    )
  })

  it('logs the dynamic fetch failure before serving the static fallback', async () => {
    const fetchError = new Error('Sanity unavailable')

    mockedSanityFetch.mockRejectedValue(fetchError)

    const entries = await sitemap()

    expect(entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ url: SITE_URL }),
        expect.objectContaining({ url: `${SITE_URL}/agenda` }),
      ]),
    )
    expect(entries).toHaveLength(9)
    expect(mockedLogError).toHaveBeenCalledWith(
      '[sitemap] failed to resolve dynamic sitemap entries, serving static fallback only',
      expect.objectContaining({
        route: '/sitemap.xml',
        source: 'sitemap',
        error: fetchError,
        metadata: expect.objectContaining({
          fallbackMode: 'static-only',
          staticRouteCount: 9,
        }),
      }),
    )
  })

  it('logs null CMS sitemap data before serving the static fallback', async () => {
    mockedSanityFetch.mockResolvedValue({
      data: null,
      sourceMap: null,
      tags: [],
    } satisfies Awaited<ReturnType<typeof sanityFetch>>)

    const entries = await sitemap()

    expect(entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ url: SITE_URL }),
        expect.objectContaining({ url: `${SITE_URL}/agenda` }),
      ]),
    )
    expect(entries).toHaveLength(9)
    expect(mockedLogWarn).toHaveBeenCalledWith(
      '[sitemap] received null or unusable CMS sitemap data, serving static fallback only',
      expect.objectContaining({
        route: '/sitemap.xml',
        source: 'sitemap',
        metadata: expect.objectContaining({
          fallbackMode: 'static-only',
          staticRouteCount: 9,
          reason: 'missing-data',
          receivedType: 'null',
        }),
      }),
    )
    expect(mockedLogError).not.toHaveBeenCalled()
  })

  it.each([
    ['string payload', 'not-an-object', 'string'],
    ['array payload', [], 'array'],
    ['undefined payload', undefined, 'undefined'],
  ])(
    'logs %s before serving the static fallback',
    async (_label, payload, receivedType) => {
      mockedSanityFetch.mockResolvedValue({
        data: payload,
        sourceMap: null,
        tags: [],
      } as Awaited<ReturnType<typeof sanityFetch>>)

      const entries = await sitemap()

      expect(entries).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ url: SITE_URL }),
          expect.objectContaining({ url: `${SITE_URL}/agenda` }),
        ]),
      )
      expect(entries).toHaveLength(9)
      expect(mockedLogWarn).toHaveBeenCalledWith(
        '[sitemap] received null or unusable CMS sitemap data, serving static fallback only',
        expect.objectContaining({
          route: '/sitemap.xml',
          source: 'sitemap',
          metadata: expect.objectContaining({
            fallbackMode: 'static-only',
            staticRouteCount: 9,
            reason: 'invalid-payload',
            receivedType,
          }),
        }),
      )
      expect(mockedLogError).not.toHaveBeenCalled()
      mockedLogWarn.mockClear()
    },
  )

  it('logs unusable CMS sitemap collections before serving the static fallback', async () => {
    mockedSanityFetch.mockResolvedValue({
      data: {
        agenda: 'not-an-array',
        lugares: [],
        gastronomia: [],
        servicios: [],
      },
      sourceMap: null,
      tags: [],
    } as Awaited<ReturnType<typeof sanityFetch>>)

    const entries = await sitemap()

    expect(entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ url: SITE_URL }),
        expect.objectContaining({ url: `${SITE_URL}/agenda` }),
      ]),
    )
    expect(entries).toHaveLength(9)
    expect(mockedLogWarn).toHaveBeenCalledWith(
      '[sitemap] received null or unusable CMS sitemap data, serving static fallback only',
      expect.objectContaining({
        route: '/sitemap.xml',
        source: 'sitemap',
        metadata: expect.objectContaining({
          fallbackMode: 'static-only',
          staticRouteCount: 9,
          reason: 'invalid-collection',
          invalidContentType: 'agenda',
          receivedType: 'string',
        }),
      }),
    )
    expect(mockedLogError).not.toHaveBeenCalled()
  })
})
