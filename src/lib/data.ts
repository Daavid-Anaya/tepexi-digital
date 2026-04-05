/**
 * Data abstraction layer.
 *
 * Strategy: Sanity-first with graceful fallback.
 * - When NEXT_PUBLIC_SANITY_PROJECT_ID is set → try Sanity first.
 * - If Sanity returns empty results OR throws a network error → fall back to mock data.
 * - When NEXT_PUBLIC_SANITY_PROJECT_ID is NOT set → use mock data directly.
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
  type SocialLink,
  type SeoDefaults,
} from './mock-data'

const USE_SANITY = !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID

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
  recommendations: unknown[] | null
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
  recommendations: unknown[] | null
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
  recommendations: unknown[] | null
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

// --- Evento detail ---
export interface EventoDetail {
  _id: string
  title: string
  slug: { current: string }
  description: unknown[] | null
  imageUrl: string | null
  imageAlt: string | null
  date: string
  endDate: string | null
  location: {
    _id: string
    title: string
    slug: { current: string }
    coordinates: { lat: number; lng: number } | null
    address: string | null
  } | null
  locationText: string | null
  isFeatured: boolean
  seo: { metaTitle: string | null; metaDescription: string | null } | null
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

function stringToPortableText(text: string | null): unknown[] | null {
  if (!text) return null
  return [
    {
      _type: 'block',
      _key: `mock-rec-${Date.now()}`,
      style: 'normal',
      children: [{ _type: 'span', text, marks: [] }],
      markDefs: [],
    },
  ]
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
    recommendations: stringToPortableText(l.recommendations),
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
    recommendations: stringToPortableText(g.recommendations),
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
    recommendations: stringToPortableText(c.recommendations),
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

function mockToEventoDetail(e: MockEvento): EventoDetail {
  return {
    _id: e._id,
    title: e.title,
    slug: e.slug,
    description: e.description ?? null,
    imageUrl: e.imageUrl,
    imageAlt: e.imageAlt,
    date: e.date,
    endDate: e.endDate,
    location: e.locationCoordinates
      ? {
          _id: `mock-loc-${e._id}`,
          title: e.locationName ?? e.locationText ?? '',
          slug: { current: '' },
          coordinates: e.locationCoordinates,
          address: e.locationAddress,
        }
      : null,
    locationText: e.locationText,
    isFeatured: e.isFeatured,
    seo: e.seo,
  }
}

// ---------------------------------------------------------------------------
// Mock fallback helpers
// ---------------------------------------------------------------------------

function getMockLugaresList(): LugarListItem[] {
  return mockLugares.map(mockToLugarList)
}

function getMockGastronomiaList(): GastronomiaListItem[] {
  return mockGastronomia.map(mockToGastronomiaList)
}

function getMockCulturaList(): CulturaListItem[] {
  return mockCultura.map(mockToCulturaList)
}

function getMockUpcomingEventos(): EventoListItem[] {
  const now = new Date()
  return mockEventos
    .filter((e) => new Date(e.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(mockToEventoList)
}

const CATEGORY_TYPE_MAP: Record<string, 'lugar' | 'gastronomia' | 'cultura' | 'servicios'> = {
  'Ecoturismo y Naturaleza': 'lugar',
  'Historia y Arqueología': 'lugar',
  'Paleontología': 'lugar',
  'Hospedaje': 'lugar',
  'Gastronomía y Comercio Local': 'gastronomia',
  'Cultura y Espacios Públicos': 'cultura',
  'Hotel': 'servicios',
  'Banco': 'servicios',
}

function getMockMapMarkers(): MapMarker[] {
  return mockLugares
    .filter((l) => l.coordinates)
    .map((l) => ({
      id: l._id,
      title: l.title,
      slug: l.slug.current,
      coordinates: l.coordinates!,
      category: l.category,
      categoryColor: l.categoryColor,
      type: CATEGORY_TYPE_MAP[l.category] ?? 'lugar',
    }))
}

// ---------------------------------------------------------------------------
// Public API — Sanity-first with graceful fallback to mock
// ---------------------------------------------------------------------------

export async function getAllLugares(): Promise<LugarListItem[]> {
  if (!USE_SANITY) return getMockLugaresList()

  try {
    const { sanityFetch } = await import('@/sanity/lib/live')
    const { allLugaresQuery } = await import('@/sanity/queries/lugares')
    const { data } = await sanityFetch({ query: allLugaresQuery })
    const results = (data ?? []) as LugarListItem[]
    return results.length > 0 ? results : getMockLugaresList()
  } catch {
    return getMockLugaresList()
  }
}

export async function getLugarBySlug(slug: string): Promise<LugarDetail | null> {
  if (!USE_SANITY) {
    const found = mockLugares.find((l) => l.slug.current === slug)
    return found ? mockToLugarDetail(found) : null
  }

  try {
    const { sanityFetch } = await import('@/sanity/lib/live')
    const { lugarBySlugQuery } = await import('@/sanity/queries/lugares')
    const { data } = await sanityFetch({ query: lugarBySlugQuery, params: { slug } })
    if (data) return data as LugarDetail
    // Sanity has no match — try mock as fallback
    const found = mockLugares.find((l) => l.slug.current === slug)
    return found ? mockToLugarDetail(found) : null
  } catch {
    const found = mockLugares.find((l) => l.slug.current === slug)
    return found ? mockToLugarDetail(found) : null
  }
}

export async function getAllGastronomia(): Promise<GastronomiaListItem[]> {
  if (!USE_SANITY) return getMockGastronomiaList()

  try {
    const { sanityFetch } = await import('@/sanity/lib/live')
    const { allGastronomiaQuery } = await import('@/sanity/queries/gastronomia')
    const { data } = await sanityFetch({ query: allGastronomiaQuery })
    const results = (data ?? []) as GastronomiaListItem[]
    return results.length > 0 ? results : getMockGastronomiaList()
  } catch {
    return getMockGastronomiaList()
  }
}

export async function getGastronomiaBySlug(slug: string): Promise<GastronomiaDetail | null> {
  if (!USE_SANITY) {
    const found = mockGastronomia.find((g) => g.slug.current === slug)
    return found ? mockToGastronomiaDetail(found) : null
  }

  try {
    const { sanityFetch } = await import('@/sanity/lib/live')
    const { gastronomiaBySlugQuery } = await import('@/sanity/queries/gastronomia')
    const { data } = await sanityFetch({ query: gastronomiaBySlugQuery, params: { slug } })
    if (data) return data as GastronomiaDetail
    const found = mockGastronomia.find((g) => g.slug.current === slug)
    return found ? mockToGastronomiaDetail(found) : null
  } catch {
    const found = mockGastronomia.find((g) => g.slug.current === slug)
    return found ? mockToGastronomiaDetail(found) : null
  }
}

export async function getAllCultura(): Promise<CulturaListItem[]> {
  if (!USE_SANITY) return getMockCulturaList()

  try {
    const { sanityFetch } = await import('@/sanity/lib/live')
    const { allCulturaQuery } = await import('@/sanity/queries/cultura')
    const { data } = await sanityFetch({ query: allCulturaQuery })
    const results = (data ?? []) as CulturaListItem[]
    return results.length > 0 ? results : getMockCulturaList()
  } catch {
    return getMockCulturaList()
  }
}

export async function getCulturaBySlug(slug: string): Promise<CulturaDetail | null> {
  if (!USE_SANITY) {
    const found = mockCultura.find((c) => c.slug.current === slug)
    return found ? mockToCulturaDetail(found) : null
  }

  try {
    const { sanityFetch } = await import('@/sanity/lib/live')
    const { culturaBySlugQuery } = await import('@/sanity/queries/cultura')
    const { data } = await sanityFetch({ query: culturaBySlugQuery, params: { slug } })
    if (data) return data as CulturaDetail
    const found = mockCultura.find((c) => c.slug.current === slug)
    return found ? mockToCulturaDetail(found) : null
  } catch {
    const found = mockCultura.find((c) => c.slug.current === slug)
    return found ? mockToCulturaDetail(found) : null
  }
}

export async function getUpcomingEventos(): Promise<EventoListItem[]> {
  if (!USE_SANITY) return getMockUpcomingEventos()

  try {
    const { sanityFetch } = await import('@/sanity/lib/live')
    const { upcomingEventosQuery } = await import('@/sanity/queries/eventos')
    const now = new Date().toISOString()
    const { data } = await sanityFetch({ query: upcomingEventosQuery, params: { now, limit: 50 } })
    const results = (data ?? []) as EventoListItem[]
    return results.length > 0 ? results : getMockUpcomingEventos()
  } catch {
    return getMockUpcomingEventos()
  }
}

export async function getEventoBySlug(slug: string): Promise<EventoDetail | null> {
  if (!USE_SANITY) {
    const found = mockEventos.find((e) => e.slug.current === slug)
    return found ? mockToEventoDetail(found) : null
  }

  try {
    const { sanityFetch } = await import('@/sanity/lib/live')
    const { eventoBySlugQuery } = await import('@/sanity/queries/eventos')
    const { data } = await sanityFetch({ query: eventoBySlugQuery, params: { slug } })
    if (data) return data as EventoDetail
    const found = mockEventos.find((e) => e.slug.current === slug)
    return found ? mockToEventoDetail(found) : null
  } catch {
    const found = mockEventos.find((e) => e.slug.current === slug)
    return found ? mockToEventoDetail(found) : null
  }
}

export async function getAllMapMarkers(): Promise<MapMarker[]> {
  if (!USE_SANITY) return getMockMapMarkers()

  try {
    const { sanityFetch } = await import('@/sanity/lib/live')
    const { allLugaresMapQuery } = await import('@/sanity/queries/lugares')
    const { data } = await sanityFetch({ query: allLugaresMapQuery })
    const results = (data ?? []) as Array<{
      _id: string
      title: string | null
      slug: { current: string } | null
      category: string | null
      categoryColor: string | null
      categoryType: string | null
      coordinates: { lat: number; lng: number } | null
    }>

    if (results.length === 0) return getMockMapMarkers()

    return results
      .filter((l) => l.coordinates && (l.coordinates.lat !== 0 || l.coordinates.lng !== 0))
      .map((l) => ({
        id: l._id,
        title: l.title ?? '',
        slug: l.slug?.current ?? '',
        coordinates: { lat: l.coordinates!.lat, lng: l.coordinates!.lng },
        category: l.category ?? '',
        categoryColor: l.categoryColor ?? '#8B4513',
        type: (l.categoryType as 'lugar' | 'gastronomia' | 'cultura') ?? 'lugar',
      }))
  } catch {
    return getMockMapMarkers()
  }
}

export type { MockSettings as SiteSettings, SocialLink, SeoDefaults }

export async function getSettings(): Promise<MockSettings> {
  if (!USE_SANITY) return mockSettings

  try {
    const { sanityFetch } = await import('@/sanity/lib/live')
    const { settingsQuery } = await import('@/sanity/queries/settings')
    const { data } = await sanityFetch({ query: settingsQuery })
    // If settings doc doesn't exist yet, use mock
    if (!data || !data.siteName) return mockSettings
    return data as MockSettings
  } catch {
    return mockSettings
  }
}
