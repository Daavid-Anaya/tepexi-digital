/**
 * Data abstraction layer.
 *
 * When NEXT_PUBLIC_SANITY_PROJECT_ID is set → use Sanity + GROQ queries.
 * Otherwise → return mock data so all pages render visually without a CMS.
 */

import type { MapMarker } from '@/types'
import {
  mockLugares,
  mockGastronomia,
  mockCultura,
  mockEventos,
  mockSettings,
  type MockLugar,
  type MockGastronomia,
  type MockCultura,
  type MockEvento,
  type MockSettings,
} from './mock-data'

const USE_MOCK = !process.env.NEXT_PUBLIC_SANITY_PROJECT_ID

// ---------------------------------------------------------------------------
// Return-type aliases (so Sanity and mock paths return the same shapes)
// ---------------------------------------------------------------------------

// --- Lugares list item ---
export interface LugarListItem {
  _id: string
  title: string
  slug: { current: string }
  category: string
  categoryColor: string
  imageUrl: string
  imageAlt: string
  address: string | null
  coordinates: { lat: number; lng: number } | null
}

// --- Lugar detail ---
export interface LugarDetail {
  _id: string
  title: string
  slug: { current: string }
  category: string
  categoryColor: string
  description: unknown[] | null
  images: Array<{ url: string; alt: string; asset: { url: string } }>
  coordinates: { lat: number; lng: number } | null
  address: string | null
  schedule: string | null
  cost: string | null
  recommendations: string | null
  seo: { metaTitle: string | null; metaDescription: string | null } | null
}

// --- Gastronomia list item ---
export interface GastronomiaListItem {
  _id: string
  title: string
  slug: { current: string }
  category: string
  categoryColor: string
  imageUrl: string
  imageAlt: string
  address: string | null
  coordinates: { lat: number; lng: number } | null
  priceRange: string | null
  dishType: string | null
}

// --- Gastronomia detail ---
export interface GastronomiaDetail {
  _id: string
  title: string
  slug: { current: string }
  category: string
  categoryColor: string
  description: unknown[] | null
  images: Array<{ url: string; alt: string; asset: { url: string } }>
  coordinates: { lat: number; lng: number } | null
  address: string | null
  schedule: string | null
  cost: string | null
  dishType: string | null
  featuredDishes: string[]
  priceRange: string | null
  recommendations: string | null
  seo: { metaTitle: string | null; metaDescription: string | null } | null
}

// --- Cultura list item ---
export interface CulturaListItem {
  _id: string
  title: string
  slug: { current: string }
  category: string
  categoryColor: string
  imageUrl: string
  imageAlt: string
  address: string | null
  coordinates: { lat: number; lng: number } | null
  culturalType: string | null
}

// --- Cultura detail ---
export interface CulturaDetail {
  _id: string
  title: string
  slug: { current: string }
  category: string
  categoryColor: string
  description: unknown[] | null
  images: Array<{ url: string; alt: string; asset: { url: string } }>
  coordinates: { lat: number; lng: number } | null
  address: string | null
  schedule: string | null
  cost: string | null
  culturalType: string | null
  recommendations: string | null
  seo: { metaTitle: string | null; metaDescription: string | null } | null
}

// --- Evento list item ---
export interface EventoListItem {
  _id: string
  title: string
  slug: { current: string }
  imageUrl: string | null
  imageAlt: string | null
  date: string
  endDate: string | null
  locationName: string | null
  locationText: string | null
  isFeatured: boolean
}

// ---------------------------------------------------------------------------
// Mock-to-interface mappers
// ---------------------------------------------------------------------------

function mockToLugarList(l: MockLugar): LugarListItem {
  return {
    _id: l._id,
    title: l.title,
    slug: l.slug,
    category: l.category,
    categoryColor: l.categoryColor,
    imageUrl: l.imageUrl,
    imageAlt: l.imageAlt,
    address: l.address,
    coordinates: l.coordinates,
  }
}

function mockToLugarDetail(l: MockLugar): LugarDetail {
  return {
    _id: l._id,
    title: l.title,
    slug: l.slug,
    category: l.category,
    categoryColor: l.categoryColor,
    description: l.description,
    images: l.images,
    coordinates: l.coordinates,
    address: l.address,
    schedule: l.schedule,
    cost: l.cost,
    recommendations: l.recommendations,
    seo: l.seo,
  }
}

function mockToGastronomiaList(g: MockGastronomia): GastronomiaListItem {
  return {
    _id: g._id,
    title: g.title,
    slug: g.slug,
    category: g.category,
    categoryColor: g.categoryColor,
    imageUrl: g.imageUrl,
    imageAlt: g.imageAlt,
    address: g.address,
    coordinates: g.coordinates,
    priceRange: g.priceRange,
    dishType: g.dishType,
  }
}

function mockToGastronomiaDetail(g: MockGastronomia): GastronomiaDetail {
  return {
    _id: g._id,
    title: g.title,
    slug: g.slug,
    category: g.category,
    categoryColor: g.categoryColor,
    description: g.description,
    images: g.images,
    coordinates: g.coordinates,
    address: g.address,
    schedule: g.schedule,
    cost: g.cost,
    dishType: g.dishType,
    featuredDishes: g.featuredDishes,
    priceRange: g.priceRange,
    recommendations: g.recommendations,
    seo: g.seo,
  }
}

function mockToCulturaList(c: MockCultura): CulturaListItem {
  return {
    _id: c._id,
    title: c.title,
    slug: c.slug,
    category: c.category,
    categoryColor: c.categoryColor,
    imageUrl: c.imageUrl,
    imageAlt: c.imageAlt,
    address: c.address,
    coordinates: c.coordinates,
    culturalType: c.culturalType,
  }
}

function mockToCulturaDetail(c: MockCultura): CulturaDetail {
  return {
    _id: c._id,
    title: c.title,
    slug: c.slug,
    category: c.category,
    categoryColor: c.categoryColor,
    description: c.description,
    images: c.images,
    coordinates: c.coordinates,
    address: c.address,
    schedule: c.schedule,
    cost: c.cost,
    culturalType: c.culturalType,
    recommendations: c.recommendations,
    seo: c.seo,
  }
}

function mockToEventoList(e: MockEvento): EventoListItem {
  return {
    _id: e._id,
    title: e.title,
    slug: e.slug,
    imageUrl: e.imageUrl,
    imageAlt: e.imageAlt,
    date: e.date,
    endDate: e.endDate,
    locationName: e.locationName,
    locationText: e.locationText,
    isFeatured: e.isFeatured,
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function getAllLugares(): Promise<LugarListItem[]> {
  if (USE_MOCK) {
    return mockLugares.map(mockToLugarList)
  }
  const { sanityFetch } = await import('@/sanity/lib/live')
  const { allLugaresQuery } = await import('@/sanity/queries/lugares')
  const { data } = await sanityFetch({ query: allLugaresQuery })
  return (data ?? []) as LugarListItem[]
}

export async function getLugarBySlug(slug: string): Promise<LugarDetail | null> {
  if (USE_MOCK) {
    const found = mockLugares.find((l) => l.slug.current === slug)
    return found ? mockToLugarDetail(found) : null
  }
  const { sanityFetch } = await import('@/sanity/lib/live')
  const { lugarBySlugQuery } = await import('@/sanity/queries/lugares')
  const { data } = await sanityFetch({ query: lugarBySlugQuery, params: { slug } })
  return (data ?? null) as LugarDetail | null
}

export async function getAllGastronomia(): Promise<GastronomiaListItem[]> {
  if (USE_MOCK) {
    return mockGastronomia.map(mockToGastronomiaList)
  }
  const { sanityFetch } = await import('@/sanity/lib/live')
  const { allGastronomiaQuery } = await import('@/sanity/queries/gastronomia')
  const { data } = await sanityFetch({ query: allGastronomiaQuery })
  return (data ?? []) as GastronomiaListItem[]
}

export async function getGastronomiaBySlug(slug: string): Promise<GastronomiaDetail | null> {
  if (USE_MOCK) {
    const found = mockGastronomia.find((g) => g.slug.current === slug)
    return found ? mockToGastronomiaDetail(found) : null
  }
  const { sanityFetch } = await import('@/sanity/lib/live')
  const { gastronomiaBySlugQuery } = await import('@/sanity/queries/gastronomia')
  const { data } = await sanityFetch({ query: gastronomiaBySlugQuery, params: { slug } })
  return (data ?? null) as GastronomiaDetail | null
}

export async function getAllCultura(): Promise<CulturaListItem[]> {
  if (USE_MOCK) {
    return mockCultura.map(mockToCulturaList)
  }
  const { sanityFetch } = await import('@/sanity/lib/live')
  const { allCulturaQuery } = await import('@/sanity/queries/cultura')
  const { data } = await sanityFetch({ query: allCulturaQuery })
  return (data ?? []) as CulturaListItem[]
}

export async function getCulturaBySlug(slug: string): Promise<CulturaDetail | null> {
  if (USE_MOCK) {
    const found = mockCultura.find((c) => c.slug.current === slug)
    return found ? mockToCulturaDetail(found) : null
  }
  const { sanityFetch } = await import('@/sanity/lib/live')
  const { culturaBySlugQuery } = await import('@/sanity/queries/cultura')
  const { data } = await sanityFetch({ query: culturaBySlugQuery, params: { slug } })
  return (data ?? null) as CulturaDetail | null
}

export async function getUpcomingEventos(): Promise<EventoListItem[]> {
  if (USE_MOCK) {
    const now = new Date()
    return mockEventos
      .filter((e) => new Date(e.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(mockToEventoList)
  }
  const { sanityFetch } = await import('@/sanity/lib/live')
  const { upcomingEventosQuery } = await import('@/sanity/queries/eventos')
  const now = new Date().toISOString()
  const { data } = await sanityFetch({ query: upcomingEventosQuery, params: { now, limit: 50 } })
  return (data ?? []) as EventoListItem[]
}

export async function getAllMapMarkers(): Promise<MapMarker[]> {
  if (USE_MOCK) {
    const lugarMarkers: MapMarker[] = mockLugares
      .filter((l) => l.coordinates)
      .map((l) => ({
        id: l._id,
        title: l.title,
        slug: l.slug.current,
        coordinates: l.coordinates!,
        category: l.category,
        categoryColor: l.categoryColor,
        type: 'lugar' as const,
      }))

    const gastronomiaMarkers: MapMarker[] = mockGastronomia
      .filter((g) => g.coordinates)
      .map((g) => ({
        id: g._id,
        title: g.title,
        slug: g.slug.current,
        coordinates: g.coordinates!,
        category: g.category,
        categoryColor: g.categoryColor,
        type: 'gastronomia' as const,
      }))

    const culturaMarkers: MapMarker[] = mockCultura
      .filter((c) => c.coordinates)
      .map((c) => ({
        id: c._id,
        title: c.title,
        slug: c.slug.current,
        coordinates: c.coordinates!,
        category: c.category,
        categoryColor: c.categoryColor,
        type: 'cultura' as const,
      }))

    return [...lugarMarkers, ...gastronomiaMarkers, ...culturaMarkers]
  }

  const { sanityFetch } = await import('@/sanity/lib/live')
  const { allLugaresMapQuery } = await import('@/sanity/queries/lugares')
  const { allGastronomiaMapQuery } = await import('@/sanity/queries/gastronomia')
  const { allCulturaMapQuery } = await import('@/sanity/queries/cultura')

  const [{ data: lugares }, { data: gastronomia }, { data: cultura }] = await Promise.all([
    sanityFetch({ query: allLugaresMapQuery }),
    sanityFetch({ query: allGastronomiaMapQuery }),
    sanityFetch({ query: allCulturaMapQuery }),
  ])

  type LugarMapItem = NonNullable<typeof lugares>[number]
  type GastronomiaMapItem = NonNullable<typeof gastronomia>[number]
  type CulturaMapItem = NonNullable<typeof cultura>[number]

  return [
    ...(lugares ?? []).map((l: LugarMapItem) => ({
      id: l._id,
      title: l.title ?? '',
      slug: l.slug?.current ?? '',
      coordinates: { lat: l.coordinates?.lat ?? 0, lng: l.coordinates?.lng ?? 0 },
      category: l.category ?? '',
      categoryColor: l.categoryColor ?? '#8B4513',
      type: 'lugar' as const,
    })),
    ...(gastronomia ?? []).map((g: GastronomiaMapItem) => ({
      id: g._id,
      title: g.title ?? '',
      slug: g.slug?.current ?? '',
      coordinates: { lat: g.coordinates?.lat ?? 0, lng: g.coordinates?.lng ?? 0 },
      category: g.category ?? '',
      categoryColor: g.categoryColor ?? '#2E7D32',
      type: 'gastronomia' as const,
    })),
    ...(cultura ?? []).map((c: CulturaMapItem) => ({
      id: c._id,
      title: c.title ?? '',
      slug: c.slug?.current ?? '',
      coordinates: { lat: c.coordinates?.lat ?? 0, lng: c.coordinates?.lng ?? 0 },
      category: c.category ?? '',
      categoryColor: c.categoryColor ?? '#BF360C',
      type: 'cultura' as const,
    })),
  ].filter((m) => m.coordinates.lat !== 0 || m.coordinates.lng !== 0)
}

export async function getSettings(): Promise<MockSettings> {
  if (USE_MOCK) {
    return mockSettings
  }
  const { sanityFetch } = await import('@/sanity/lib/live')
  const { settingsQuery } = await import('@/sanity/queries/settings')
  const { data } = await sanityFetch({ query: settingsQuery })
  return (data ?? mockSettings) as MockSettings
}
