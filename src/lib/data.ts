import 'server-only'
import { CATEGORY_COLORS } from './constants'

/**
 * Data abstraction layer.
 *
 * Strategy: Sanity-first with graceful fallback.
 * - When NEXT_PUBLIC_SANITY_PROJECT_ID is set → try Sanity first.
 * - If Sanity returns empty results OR throws a network error → fall back to mock data.
 * - When NEXT_PUBLIC_SANITY_PROJECT_ID is NOT set → use mock data directly.
 */

import { cache } from 'react'
import type { PortableTextBlock } from '@portabletext/react'
import type { MapMarker } from '@/types'
import {
  mockLugares,
  mockSettings,
  type MockLugar,
  type MockSettings,
  type SocialLink,
  type SeoDefaults,
} from './mock-data'
import { sanityFetch } from '@/sanity/lib/live'
import { allLugaresQuery, lugarBySlugQuery, allLugaresMapQuery } from '@/sanity/queries/lugares'
import { servicioBySlugQuery, allServiciosMapQuery } from '@/sanity/queries/servicios'
import { allGastronomiaQuery, gastronomiaBySlugQuery } from '@/sanity/queries/gastronomia'
import { upcomingEventosQuery, eventoBySlugQuery } from '@/sanity/queries/eventos'
import { settingsQuery } from '@/sanity/queries/settings'

const USE_SANITY = !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const IS_PROD = process.env.NODE_ENV === 'production'

// ---------------------------------------------------------------------------
// Mock fallback logging — visibility into when/why mock data is served
// ---------------------------------------------------------------------------

type FallbackReason = 'no-sanity-config' | 'empty-results' | 'fetch-error'

function logMockFallback(source: string, reason: FallbackReason, error?: unknown): void {
  const reasons: Record<FallbackReason, string> = {
    'no-sanity-config': 'NEXT_PUBLIC_SANITY_PROJECT_ID not set',
    'empty-results': 'Sanity returned empty results',
    'fetch-error': 'Sanity fetch failed',
  }

  const message = `[mock-fallback] ${source}: ${reasons[reason]}`

  if (IS_PROD) {
    // In production, mock data should NEVER be served — treat as an error
    console.error(message, error ?? '')
  } else {
    console.warn(message, error ?? '')
  }
}

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
  isFeatured: boolean
}

// --- Lugar detail ---
export interface LugarDetail {
  _id: string
  title: string
  slug: { current: string }
  category: string
  categoryColor: string
  description: PortableTextBlock[] | null
  images: Array<{ url: string; alt: string; asset: { url: string } }>
  coordinates: { lat: number; lng: number } | null
  address: string | null
  schedule: string | null
  cost: string | null
  recommendations: PortableTextBlock[] | null
  seo: { metaTitle: string | null; metaDescription: string | null } | null
}

// --- Servicio detail (same shape as Lugar) ---
export type ServicioDetail = LugarDetail

// --- Gastronomia list item ---
export interface GastronomiaListItem {
  _id: string
  title: string
  slug: { current: string }
  category: string
  categoryColor: string
  imageUrl: string
  imageAlt: string
  priceRange: string | null
  dishType: string[] | null
}

// --- Gastronomia detail ---
export interface GastronomiaDetail {
  _id: string
  title: string
  slug: { current: string }
  category: string
  categoryColor: string
  introduction: PortableTextBlock[] | null
  description: PortableTextBlock[] | null
  images: Array<{ url: string; alt: string; asset: { url: string } }>
  descriptionImage: { url: string; alt: string } | null
  cost: string | null
  dishType: string[] | null
  priceRange: string | null
  origin: string | null
  season: string | null
  quote: { text: string; author: string } | null
  preparationTime: string | null
  difficulty: string | null
  servings: string | null
  keyIngredients: Array<{ name: string | null; description: string | null; icon: string | null; imageUrl: string | null }> | null
  preparationSteps: Array<{ title: string; description: string; duration: string | null }> | null
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
  description: PortableTextBlock[] | null
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
    isFeatured: l.isFeatured ?? false,
  }
}

let _portableTextKeyCounter = 0
function stringToPortableText(text: string | null): PortableTextBlock[] | null {
  if (!text) return null
  return [
    {
      _type: 'block' as const,
      _key: `mock-rec-${++_portableTextKeyCounter}`,
      style: 'normal' as const,
      children: [{ _type: 'span' as const, text, marks: [] as string[] }],
      markDefs: [] as { [key: string]: unknown; _type: string; _key: string }[],
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

// ---------------------------------------------------------------------------
// Mock fallback helpers
// ---------------------------------------------------------------------------

function getMockLugaresList(): LugarListItem[] {
  return mockLugares.map(mockToLugarList)
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
      type: l.categoryType,
    }))
}

// ---------------------------------------------------------------------------
// Public API — Sanity-first with graceful fallback to mock
// ---------------------------------------------------------------------------

export async function getAllLugares(): Promise<LugarListItem[]> {
  if (!USE_SANITY) {
    logMockFallback('getAllLugares', 'no-sanity-config')
    return getMockLugaresList()
  }

  try {
    // TODO: add runtime validation (Zod) when sanityFetch supports explicit generics
    const { data } = await sanityFetch({ query: allLugaresQuery })
    const results = (data ?? []) as LugarListItem[]
    if (results.length > 0) return results
    logMockFallback('getAllLugares', 'empty-results')
    return getMockLugaresList()
  } catch (err) {
    logMockFallback('getAllLugares', 'fetch-error', err)
    return getMockLugaresList()
  }
}

export async function getLugarBySlug(slug: string): Promise<LugarDetail | null> {
  if (!USE_SANITY) {
    logMockFallback('getLugarBySlug', 'no-sanity-config')
    const found = mockLugares.find((l) => l.slug.current === slug)
    return found ? mockToLugarDetail(found) : null
  }

  try {
    const { data } = await sanityFetch({ query: lugarBySlugQuery, params: { slug } })
    if (data) return data as LugarDetail
    logMockFallback('getLugarBySlug', 'empty-results')
    const found = mockLugares.find((l) => l.slug.current === slug)
    return found ? mockToLugarDetail(found) : null
  } catch (err) {
    logMockFallback('getLugarBySlug', 'fetch-error', err)
    const found = mockLugares.find((l) => l.slug.current === slug)
    return found ? mockToLugarDetail(found) : null
  }
}

export async function getServicioBySlug(slug: string): Promise<ServicioDetail | null> {
  if (!USE_SANITY) return null

  try {
    const { data } = await sanityFetch({ query: servicioBySlugQuery, params: { slug } })
    if (data) return data as ServicioDetail
    return null
  } catch {
    return null
  }
}

export async function getAllGastronomia(): Promise<GastronomiaListItem[]> {
  if (!USE_SANITY) {
    // No Sanity config — return empty list to avoid showing fake gastronomy entries.
    return []
  }

  try {
    const { data } = await sanityFetch({ query: allGastronomiaQuery })
    // Intentionally no mock fallback: gastronomia has no mock data.
    // An empty result means no dishes are published yet — that's valid.
    return (data ?? []) as GastronomiaListItem[]
  } catch (err) {
    logMockFallback('getAllGastronomia', 'fetch-error', err)
    return []
  }
}

export async function getGastronomiaBySlug(slug: string): Promise<GastronomiaDetail | null> {
  if (!USE_SANITY) {
    // No Sanity config — return null to avoid serving fake gastronomy detail pages.
    return null
  }

  try {
    const { data } = await sanityFetch({ query: gastronomiaBySlugQuery, params: { slug } })
    if (data) return data as GastronomiaDetail
    return null
  } catch (err) {
    logMockFallback('getGastronomiaBySlug', 'fetch-error', err)
    return null
  }
}

export async function getUpcomingEventos(): Promise<EventoListItem[]> {
  if (!USE_SANITY) {
    // No Sanity config — return empty list instead of mock events to avoid
    // showing fake events to real users on the deployed site.
    return []
  }

  try {
    // Use start-of-today so events remain visible all day until midnight.
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const now = today.toISOString()
    const { data } = await sanityFetch({ query: upcomingEventosQuery, params: { now, limit: 50 } })
    return (data ?? []) as EventoListItem[]
  } catch (err) {
    logMockFallback('getUpcomingEventos', 'fetch-error', err)
    return []
  }
}

export async function getEventoBySlug(slug: string): Promise<EventoDetail | null> {
  if (!USE_SANITY) {
    // No Sanity config — return null to avoid serving fake event detail pages.
    return null
  }

  try {
    const { data } = await sanityFetch({ query: eventoBySlugQuery, params: { slug } })
    if (data) return data as EventoDetail
    return null
  } catch (err) {
    logMockFallback('getEventoBySlug', 'fetch-error', err)
    return null
  }
}

type SanityMapRow = {
  _id: string
  title: string | null
  slug: { current: string } | null
  category: string | null
  categoryColor: string | null
  categoryType: string | null
  coordinates: { lat: number; lng: number } | null
}

function sanityRowsToMarkers(rows: SanityMapRow[]): MapMarker[] {
  return rows
    .filter((r) => r.coordinates && (r.coordinates.lat !== 0 || r.coordinates.lng !== 0))
    .map((r) => ({
      id: r._id,
      title: r.title ?? '',
      slug: r.slug?.current ?? '',
      coordinates: { lat: r.coordinates!.lat, lng: r.coordinates!.lng },
      category: r.category ?? '',
      categoryColor: r.categoryColor ?? CATEGORY_COLORS.default,
      type: (r.categoryType as MapMarker['type']) ?? 'lugar',
    }))
}

export async function getAllMapMarkers(): Promise<MapMarker[]> {
  if (!USE_SANITY) {
    logMockFallback('getAllMapMarkers', 'no-sanity-config')
    return getMockMapMarkers()
  }

  try {
    const [lugaresRes, serviciosRes] = await Promise.all([
      sanityFetch({ query: allLugaresMapQuery }),
      sanityFetch({ query: allServiciosMapQuery }),
    ])

    const lugarRows = (lugaresRes.data ?? []) as SanityMapRow[]
    const servicioRows = (serviciosRes.data ?? []) as SanityMapRow[]
    const allRows = [...lugarRows, ...servicioRows]

    if (allRows.length === 0) {
      logMockFallback('getAllMapMarkers', 'empty-results')
      return getMockMapMarkers()
    }

    return sanityRowsToMarkers(allRows)
  } catch (err) {
    logMockFallback('getAllMapMarkers', 'fetch-error', err)
    return getMockMapMarkers()
  }
}

type SiteSettings = MockSettings
export type { SiteSettings, SocialLink, SeoDefaults }

// React.cache deduplicates calls within the same request — if layout and page
// both call getSettings(), Sanity is only queried once per render pass.
export const getSettings = cache(async (): Promise<SiteSettings> => {
  if (!USE_SANITY) {
    logMockFallback('getSettings', 'no-sanity-config')
    return mockSettings
  }

  try {
    const { data } = await sanityFetch({ query: settingsQuery })
    if (!data || !data.siteName) {
      logMockFallback('getSettings', 'empty-results')
      return mockSettings
    }
    return data as SiteSettings
  } catch (err) {
    logMockFallback('getSettings', 'fetch-error', err)
    return mockSettings
  }
})
