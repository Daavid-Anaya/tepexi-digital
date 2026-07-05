import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CATEGORY_COLORS } from '@/lib/constants'
import { mockLugares, mockSettings } from '@/lib/mock-data'
import {
  fetchSanityList,
  normalizeLugarListItem,
  normalizeSanityMapRows,
  normalizeSiteSettings,
} from '@/lib/data'

describe('data normalization helpers', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.resetModules()
    vi.unstubAllEnvs()
  })

  it('filters invalid Sanity rows and normalizes valid lugar records safely', async () => {
    const fallback = vi.fn(() => [])

    const result = await fetchSanityList({
      source: 'test-lugares',
      query: '*[_type == "lugar"]',
      normalizeItem: normalizeLugarListItem,
      fallback,
      isSanityEnabled: true,
      fetcher: async () => ({
        data: [
          null,
          { _id: 'missing-title', slug: { current: 'broken' }, category: 'cultura', imageUrl: '/bad.jpg' },
          { _id: 'missing-image', title: 'Lugar sin imagen', slug: { current: 'sin-imagen' }, category: 'cultura' },
          {
            _id: 'lugar-1',
            title: 'Ex Convento',
            slug: { current: 'ex-convento' },
            category: 'cultura',
            imageUrl: '/hero.jpg',
            categoryColor: null,
            imageAlt: null,
          },
        ],
      }),
    })

    expect(fallback).not.toHaveBeenCalled()
    expect(console.warn).not.toHaveBeenCalled()
    expect(result).toEqual([
      {
        _id: 'missing-image',
        title: 'Lugar sin imagen',
        slug: { current: 'sin-imagen' },
        category: 'cultura',
        categoryColor: CATEGORY_COLORS.default,
        imageUrl: null,
        imageAlt: 'Lugar sin imagen',
        address: null,
        coordinates: null,
        isFeatured: false,
      },
      {
        _id: 'lugar-1',
        title: 'Ex Convento',
        slug: { current: 'ex-convento' },
        category: 'cultura',
        categoryColor: CATEGORY_COLORS.default,
        imageUrl: '/hero.jpg',
        imageAlt: 'Ex Convento',
        address: null,
        coordinates: null,
        isFeatured: false,
      },
    ])
  })

  it('returns fallback data when Sanity responds with no usable rows', async () => {
    const fallbackRows = [{ _id: 'fallback' }]

    const result = await fetchSanityList({
      source: 'test-empty',
      query: '*[]',
      normalizeItem: () => null,
      fallback: () => fallbackRows,
      isSanityEnabled: true,
      fetcher: async () => ({ data: [] }),
    })

    expect(result).toBe(fallbackRows)
    expect(console.warn).toHaveBeenCalledWith('[mock-fallback] test-empty: Sanity returned empty results', '')
  })

  it('returns fallback data when the Sanity fetch throws', async () => {
    const fallbackRows = [{ _id: 'fallback-error' }]

    const result = await fetchSanityList({
      source: 'test-error',
      query: '*[]',
      normalizeItem: () => null,
      fallback: () => fallbackRows,
      isSanityEnabled: true,
      fetcher: async () => {
        throw new Error('boom')
      },
    })

    expect(result).toBe(fallbackRows)
    expect(console.warn).toHaveBeenCalledWith(
      '[mock-fallback] test-error: Sanity fetch failed',
      expect.any(Error),
    )
  })

  it('normalizes partial settings using mock defaults for missing optional fields', () => {
    const result = normalizeSiteSettings({
      siteName: 'Turismo Tepexi',
      heroTitle: 'Nuevo hero',
      socialLinks: [
        { platform: 'Facebook', url: 'https://facebook.com/tepexi' },
        { platform: 'Instagram' },
        null,
      ],
      seoDefaults: {
        metaTitle: 'Meta nueva',
      },
    })

    expect(result).toEqual({
      siteName: 'Turismo Tepexi',
      siteDescription: mockSettings.siteDescription,
      heroImageUrl: null,
      heroTitle: 'Nuevo hero',
      heroSubtitle: mockSettings.heroSubtitle,
      contactEmail: mockSettings.contactEmail,
      contactPhone: null,
      address: mockSettings.address,
      socialLinks: [{ platform: 'Facebook', url: 'https://facebook.com/tepexi' }],
      seoDefaults: {
        metaTitle: 'Meta nueva',
        metaDescription: null,
        ogImageUrl: null,
      },
    })
  })

  it('drops invalid map rows but keeps zero coordinates for later public filtering', () => {
    const result = normalizeSanityMapRows([
      {
        _id: 'lugar-1',
        title: 'Centro',
        slug: { current: 'centro' },
        category: 'Cultura',
        coordinates: { lat: 0, lng: 0 },
      },
      {
        _id: 'broken',
        title: 'Sin coordenadas válidas',
        slug: { current: 'broken' },
        category: 'Cultura',
        coordinates: { lat: '18.5', lng: -97.9 },
      },
    ])

    expect(result).toEqual([
      {
        _id: 'lugar-1',
        title: 'Centro',
        slug: { current: 'centro' },
        category: 'Cultura',
        categoryColor: CATEGORY_COLORS.default,
        categoryType: 'lugar',
        coordinates: { lat: 0, lng: 0 },
      },
    ])
  })

  it('falls back to mock lugar detail when the public detail wrapper gets empty data', async () => {
    vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'tepexi-project')
    vi.doMock('@/sanity/lib/live', () => ({
      sanityFetch: vi.fn(async () => ({ data: null })),
    }))

    const { getLugarBySlug } = await import('@/lib/data')

    const result = await getLugarBySlug(mockLugares[0].slug.current)

    expect(console.warn).toHaveBeenCalledWith(
      '[mock-fallback] getLugarBySlug: Sanity returned empty results',
      '',
    )
    expect(result).toMatchObject({
      _id: mockLugares[0]._id,
      slug: mockLugares[0].slug,
      title: mockLugares[0].title,
    })
  })

  it('returns mock settings when the public settings wrapper receives invalid partial data', async () => {
    vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'tepexi-project')
    vi.doMock('@/sanity/lib/live', () => ({
      sanityFetch: vi.fn(async () => ({
        data: {
          heroTitle: 'Sin nombre de sitio',
        },
      })),
    }))

    const { getSettings } = await import('@/lib/data')

    const result = await getSettings()

    expect(console.warn).toHaveBeenCalledWith(
      '[mock-fallback] getSettings: Sanity returned empty results',
      '',
    )
    expect(result).toEqual(mockSettings)
  })

  it('filters zero-coordinate markers and falls back to mock markers when the public map wrapper errors', async () => {
    vi.stubEnv('NEXT_PUBLIC_SANITY_PROJECT_ID', 'tepexi-project')

    const sanityFetch = vi
      .fn()
      .mockResolvedValueOnce({
        data: [
          {
            _id: 'valid-lugar',
            title: 'Lugar válido',
            slug: { current: 'lugar-valido' },
            category: 'Cultura',
            categoryColor: '#123456',
            categoryType: 'cultura',
            coordinates: { lat: 18.58, lng: -97.92 },
          },
          {
            _id: 'zero-lugar',
            title: 'Lugar sin mapa',
            slug: { current: 'zero-lugar' },
            category: 'Cultura',
            coordinates: { lat: 0, lng: 0 },
          },
        ],
      })
      .mockRejectedValueOnce(new Error('servicios failed'))

    vi.doMock('@/sanity/lib/live', () => ({ sanityFetch }))

    const { getAllMapMarkers } = await import('@/lib/data')

    const result = await getAllMapMarkers()

    expect(result).toEqual(
      mockLugares.map((lugar) => ({
        id: lugar._id,
        title: lugar.title,
        slug: lugar.slug.current,
        sourceType: 'lugar',
        coordinates: lugar.coordinates,
        category: lugar.category,
        categoryColor: lugar.categoryColor,
        type: lugar.categoryType,
      })),
    )
    expect(console.warn).toHaveBeenCalledWith(
      '[mock-fallback] getAllMapMarkers: Sanity fetch failed',
      expect.any(Error),
    )
  })
})
