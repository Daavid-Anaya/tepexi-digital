import 'server-only'
import { CATEGORY_COLORS, HOME_PREVIEW_LIMITS } from './constants'

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
import { MAP_MARKER_SOURCE, MAP_MARKER_TYPE, type MapMarker, type MapMarkerType } from '@/types'
import { logError, logWarn } from '@/lib/observability'
import {
  mockLugares,
  mockSettings,
  type MockLugar,
  type MockSettings,
  type SocialLink,
  type SeoDefaults,
} from './mock-data'
import { sanityFetch } from '@/sanity/lib/live'
import { allLugaresQuery, lugarBySlugQuery, allLugaresMapQuery, featuredLugaresHomeQuery } from '@/sanity/queries/lugares'
import { servicioBySlugQuery, allServiciosMapQuery } from '@/sanity/queries/servicios'
import { allGastronomiaQuery, gastronomiaBySlugQuery, latestGastronomiaHomeQuery } from '@/sanity/queries/gastronomia'
import { upcomingEventosQuery, upcomingEventosPreviewQuery, eventoBySlugQuery } from '@/sanity/queries/eventos'
import { settingsQuery } from '@/sanity/queries/settings'

const USE_SANITY = !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const IS_PROD = process.env.NODE_ENV === 'production'
type SanityFetcherParams = Parameters<typeof sanityFetch>[0]
type SanityFetcherResult = { data: unknown }
type SanityDataFetcher = (params: SanityFetcherParams) => Promise<SanityFetcherResult>

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
    logError(message, {
      source,
      metadata: {
        isProd: IS_PROD,
        reason,
        usesFallbackData: true,
      },
      ...(error !== undefined ? { error } : {}),
    })
  } else {
    logWarn(message, {
      source,
      metadata: {
        isProd: IS_PROD,
        reason,
        usesFallbackData: true,
      },
      ...(error !== undefined ? { error } : {}),
    })
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
  imageUrl: string | null
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
  return mockLugares.map((l) => ({
    id: l._id,
    title: l.title,
    slug: l.slug.current,
    sourceType: MAP_MARKER_SOURCE.LUGAR,
    coordinates: l.coordinates,
    category: l.category,
    categoryColor: l.categoryColor,
    type: l.categoryType,
  }))
}

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null
}

function readString(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

function readBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function readNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function readStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null

  const results = value.filter((item): item is string => typeof item === 'string')
  return results.length > 0 ? results : null
}

function readSlug(value: unknown): { current: string } | null {
  if (!isRecord(value)) return null

  const current = readString(value.current)
  return current ? { current } : null
}

function readCoordinates(value: unknown): { lat: number; lng: number } | null {
  if (!isRecord(value)) return null

  const lat = readNumber(value.lat)
  const lng = readNumber(value.lng)

  return lat === null || lng === null ? null : { lat, lng }
}

function isPortableTextBlockArray(value: unknown): value is PortableTextBlock[] {
  return Array.isArray(value) && value.every((item) => isRecord(item) && typeof item._type === 'string')
}

function readPortableText(value: unknown): PortableTextBlock[] | null {
  return isPortableTextBlockArray(value) ? value : null
}

function readSeo(value: unknown): { metaTitle: string | null; metaDescription: string | null } | null {
  if (!isRecord(value)) return null

  return {
    metaTitle: readString(value.metaTitle),
    metaDescription: readString(value.metaDescription),
  }
}

function normalizeImageList(value: unknown): LugarDetail['images'] {
  if (!Array.isArray(value)) return []

  return value.flatMap((item) => {
    if (!isRecord(item)) return []

    const asset = isRecord(item.asset) ? item.asset : null
    const assetUrl = asset ? readString(asset.url) : null
    const url = readString(item.url) ?? assetUrl

    if (!url) return []

    return [{
      url,
      alt: readString(item.alt) ?? '',
      asset: { url: assetUrl ?? url },
    }]
  })
}

function normalizeDescriptionImage(value: unknown): { url: string; alt: string } | null {
  if (!isRecord(value)) return null

  const url = readString(value.url)
  if (!url) return null

  return {
    url,
    alt: readString(value.alt) ?? '',
  }
}

function normalizeKeyIngredients(value: unknown): GastronomiaDetail['keyIngredients'] {
  if (!Array.isArray(value)) return null

  const results = value.flatMap((item) => {
    if (!isRecord(item)) return []

    return [{
      name: readString(item.name),
      description: readString(item.description),
      icon: readString(item.icon),
      imageUrl: readString(item.imageUrl),
    }]
  })

  return results.length > 0 ? results : null
}

function normalizePreparationSteps(value: unknown): GastronomiaDetail['preparationSteps'] {
  if (!Array.isArray(value)) return null

  const results = value.flatMap((item) => {
    if (!isRecord(item)) return []

    const title = readString(item.title)
    const description = readString(item.description)

    if (!title || !description) return []

    return [{
      title,
      description,
      duration: readString(item.duration),
    }]
  })

  return results.length > 0 ? results : null
}

export function normalizeLugarListItem(value: unknown): LugarListItem | null {
  if (!isRecord(value)) return null

  const _id = readString(value._id)
  const title = readString(value.title)
  const slug = readSlug(value.slug)
  const category = readString(value.category)
  const imageUrl = readString(value.imageUrl)

  if (!_id || !title || !slug || !category) {
    return null
  }

  return {
    _id,
    title,
    slug,
    category,
    categoryColor: readString(value.categoryColor) ?? CATEGORY_COLORS.default,
    imageUrl,
    imageAlt: readString(value.imageAlt) ?? title,
    address: readString(value.address),
    coordinates: readCoordinates(value.coordinates),
    isFeatured: readBoolean(value.isFeatured),
  }
}

function normalizeLugarDetail(value: unknown): LugarDetail | null {
  if (!isRecord(value)) return null

  const _id = readString(value._id)
  const title = readString(value.title)
  const slug = readSlug(value.slug)
  const category = readString(value.category)

  if (!_id || !title || !slug || !category) {
    return null
  }

  return {
    _id,
    title,
    slug,
    category,
    categoryColor: readString(value.categoryColor) ?? CATEGORY_COLORS.default,
    description: readPortableText(value.description),
    images: normalizeImageList(value.images),
    coordinates: readCoordinates(value.coordinates),
    address: readString(value.address),
    schedule: readString(value.schedule),
    cost: readString(value.cost),
    recommendations: readPortableText(value.recommendations),
    seo: readSeo(value.seo),
  }
}

function normalizeGastronomiaListItem(value: unknown): GastronomiaListItem | null {
  if (!isRecord(value)) return null

  const _id = readString(value._id)
  const title = readString(value.title)
  const slug = readSlug(value.slug)
  const category = readString(value.category)
  const imageUrl = readString(value.imageUrl)

  if (!_id || !title || !slug || !category || !imageUrl) {
    return null
  }

  return {
    _id,
    title,
    slug,
    category,
    categoryColor: readString(value.categoryColor) ?? CATEGORY_COLORS.default,
    imageUrl,
    imageAlt: readString(value.imageAlt) ?? title,
    priceRange: readString(value.priceRange),
    dishType: readStringArray(value.dishType),
  }
}

function normalizeGastronomiaDetail(value: unknown): GastronomiaDetail | null {
  if (!isRecord(value)) return null

  const _id = readString(value._id)
  const title = readString(value.title)
  const slug = readSlug(value.slug)
  const category = readString(value.category)

  if (!_id || !title || !slug || !category) {
    return null
  }

  return {
    _id,
    title,
    slug,
    category,
    categoryColor: readString(value.categoryColor) ?? CATEGORY_COLORS.default,
    introduction: readPortableText(value.introduction),
    description: readPortableText(value.description),
    images: normalizeImageList(value.images),
    descriptionImage: normalizeDescriptionImage(value.descriptionImage),
    cost: readString(value.cost),
    dishType: readStringArray(value.dishType),
    priceRange: readString(value.priceRange),
    origin: readString(value.origin),
    season: readString(value.season),
    quote: isRecord(value.quote)
      ? {
          text: readString(value.quote.text) ?? '',
          author: readString(value.quote.author) ?? '',
        }
      : null,
    preparationTime: readString(value.preparationTime),
    difficulty: readString(value.difficulty),
    servings: readString(value.servings),
    keyIngredients: normalizeKeyIngredients(value.keyIngredients),
    preparationSteps: normalizePreparationSteps(value.preparationSteps),
    seo: readSeo(value.seo),
  }
}

function normalizeEventoListItem(value: unknown): EventoListItem | null {
  if (!isRecord(value)) return null

  const _id = readString(value._id)
  const title = readString(value.title)
  const slug = readSlug(value.slug)
  const date = readString(value.date)

  if (!_id || !title || !slug || !date) {
    return null
  }

  return {
    _id,
    title,
    slug,
    imageUrl: readString(value.imageUrl),
    imageAlt: readString(value.imageAlt),
    date,
    endDate: readString(value.endDate),
    locationName: readString(value.locationName),
    locationText: readString(value.locationText),
    isFeatured: readBoolean(value.isFeatured),
  }
}

function normalizeEventoLocation(value: unknown): EventoDetail['location'] {
  if (!isRecord(value)) return null

  const _id = readString(value._id)
  const title = readString(value.title)
  const slug = readSlug(value.slug)

  if (!_id || !title || !slug) {
    return null
  }

  return {
    _id,
    title,
    slug,
    coordinates: readCoordinates(value.coordinates),
    address: readString(value.address),
  }
}

function normalizeEventoDetail(value: unknown): EventoDetail | null {
  if (!isRecord(value)) return null

  const _id = readString(value._id)
  const title = readString(value.title)
  const slug = readSlug(value.slug)
  const date = readString(value.date)

  if (!_id || !title || !slug || !date) {
    return null
  }

  return {
    _id,
    title,
    slug,
    description: readPortableText(value.description),
    imageUrl: readString(value.imageUrl),
    imageAlt: readString(value.imageAlt),
    date,
    endDate: readString(value.endDate),
    location: normalizeEventoLocation(value.location),
    locationText: readString(value.locationText),
    isFeatured: readBoolean(value.isFeatured),
    seo: readSeo(value.seo),
  }
}

export function normalizeSiteSettings(value: unknown): SiteSettings | null {
  if (!isRecord(value)) return null

  const siteName = readString(value.siteName)
  if (!siteName) return null

  const normalizedSocialLinks = Array.isArray(value.socialLinks)
    ? value.socialLinks.flatMap((item) => {
        if (!isRecord(item)) return []

        const platform = readString(item.platform)
        const url = readString(item.url)

        return platform && url ? [{ platform, url }] : []
      })
    : null

  const seoDefaults = isRecord(value.seoDefaults)
    ? {
        metaTitle: readString(value.seoDefaults.metaTitle),
        metaDescription: readString(value.seoDefaults.metaDescription),
        ogImageUrl: readString(value.seoDefaults.ogImageUrl),
      }
    : null

  return {
    siteName,
    siteDescription: readString(value.siteDescription) ?? mockSettings.siteDescription,
    heroImageUrl: readString(value.heroImageUrl),
    heroTitle: readString(value.heroTitle) ?? mockSettings.heroTitle,
    heroSubtitle: readString(value.heroSubtitle) ?? mockSettings.heroSubtitle,
    contactEmail: readString(value.contactEmail) ?? mockSettings.contactEmail,
    contactPhone: readString(value.contactPhone) ?? mockSettings.contactPhone,
    address: readString(value.address) ?? mockSettings.address,
    socialLinks: normalizedSocialLinks && normalizedSocialLinks.length > 0 ? normalizedSocialLinks : null,
    seoDefaults,
  }
}

const MAP_MARKER_TYPES = new Set<string>(Object.values(MAP_MARKER_TYPE))

function isMapMarkerType(value: unknown): value is MapMarkerType {
  return typeof value === 'string' && MAP_MARKER_TYPES.has(value)
}

function normalizeMapMarkerType(value: unknown): MapMarkerType {
  return isMapMarkerType(value) ? value : MAP_MARKER_TYPE.LUGAR
}

type SanityMapRow = {
  _id: string
  title: string
  slug: { current: string }
  category: string
  categoryColor: string
  categoryType: MapMarkerType
  coordinates: { lat: number; lng: number }
}

export function normalizeSanityMapRows(value: unknown): SanityMapRow[] {
  if (!Array.isArray(value)) return []

  return value.flatMap((item) => {
    if (!isRecord(item)) return []

    const _id = readString(item._id)
    const title = readString(item.title)
    const slug = readSlug(item.slug)
    const category = readString(item.category)
    const coordinates = readCoordinates(item.coordinates)

    if (!_id || !title || !slug || !category || !coordinates) {
      return []
    }

    return [{
      _id,
      title,
      slug,
      category,
      categoryColor: readString(item.categoryColor) ?? CATEGORY_COLORS.default,
      categoryType: normalizeMapMarkerType(item.categoryType),
      coordinates,
    }]
  })
}

export function normalizeArray<T>(value: unknown, normalizeItem: (item: unknown) => T | null): T[] {
  if (!Array.isArray(value)) return []

  return value.flatMap((item) => {
    const normalized = normalizeItem(item)
    return normalized ? [normalized] : []
  })
}

interface SanityListOptions<T> {
  source: string
  query: string
  params?: Record<string, unknown>
  normalizeItem: (item: unknown) => T | null
  fallback: () => T[]
  fetcher?: SanityDataFetcher
  isSanityEnabled?: boolean
  useFallbackOnEmpty?: boolean
  logNoSanityConfig?: boolean
}

export async function fetchSanityList<T>({
  source,
  query,
  params,
  normalizeItem,
  fallback,
  fetcher = sanityFetch,
  isSanityEnabled = USE_SANITY,
  useFallbackOnEmpty = true,
  logNoSanityConfig = true,
}: SanityListOptions<T>): Promise<T[]> {
  if (!isSanityEnabled) {
    if (logNoSanityConfig) {
      logMockFallback(source, 'no-sanity-config')
    }

    return fallback()
  }

  try {
    const { data } = await fetcher({ query, params })
    const results = normalizeArray(data, normalizeItem)

    if (results.length > 0 || !useFallbackOnEmpty) {
      return results
    }

    logMockFallback(source, 'empty-results')
    return fallback()
  } catch (err) {
    logMockFallback(source, 'fetch-error', err)
    return fallback()
  }
}

interface SanityDetailOptions<T> {
  source: string
  query: string
  params?: Record<string, unknown>
  normalize: (value: unknown) => T | null
  fallback: () => T | null
  fetcher?: SanityDataFetcher
  isSanityEnabled?: boolean
  logNoSanityConfig?: boolean
  logEmpty?: boolean
}

export async function fetchSanityDetail<T>({
  source,
  query,
  params,
  normalize,
  fallback,
  fetcher = sanityFetch,
  isSanityEnabled = USE_SANITY,
  logNoSanityConfig = true,
  logEmpty = false,
}: SanityDetailOptions<T>): Promise<T | null> {
  if (!isSanityEnabled) {
    if (logNoSanityConfig) {
      logMockFallback(source, 'no-sanity-config')
    }

    return fallback()
  }

  try {
    const { data } = await fetcher({ query, params })
    const result = normalize(data)

    if (result) {
      return result
    }

    if (logEmpty) {
      logMockFallback(source, 'empty-results')
    }

    return fallback()
  } catch (err) {
    logMockFallback(source, 'fetch-error', err)
    return fallback()
  }
}

// ---------------------------------------------------------------------------
// Public API — Sanity-first with graceful fallback to mock
// ---------------------------------------------------------------------------

export async function getAllLugares(): Promise<LugarListItem[]> {
  return fetchSanityList({
    source: 'getAllLugares',
    query: allLugaresQuery,
    normalizeItem: normalizeLugarListItem,
    fallback: getMockLugaresList,
  })
}

export async function getLugarBySlug(slug: string): Promise<LugarDetail | null> {
  return fetchSanityDetail({
    source: 'getLugarBySlug',
    query: lugarBySlugQuery,
    params: { slug },
    normalize: normalizeLugarDetail,
    logEmpty: true,
    fallback: () => {
      const found = mockLugares.find((l) => l.slug.current === slug)
      return found ? mockToLugarDetail(found) : null
    },
  })
}

export async function getServicioBySlug(slug: string): Promise<ServicioDetail | null> {
  return fetchSanityDetail({
    source: 'getServicioBySlug',
    query: servicioBySlugQuery,
    params: { slug },
    normalize: normalizeLugarDetail,
    logNoSanityConfig: false,
    fallback: () => null,
  })
}

export async function getAllGastronomia(): Promise<GastronomiaListItem[]> {
  return fetchSanityList({
    source: 'getAllGastronomia',
    query: allGastronomiaQuery,
    normalizeItem: normalizeGastronomiaListItem,
    fallback: () => [],
    useFallbackOnEmpty: false,
    logNoSanityConfig: false,
  })
}

export async function getGastronomiaBySlug(slug: string): Promise<GastronomiaDetail | null> {
  return fetchSanityDetail({
    source: 'getGastronomiaBySlug',
    query: gastronomiaBySlugQuery,
    params: { slug },
    normalize: normalizeGastronomiaDetail,
    logNoSanityConfig: false,
    fallback: () => null,
  })
}

// F-19: home page — only featured lugares, max 4, only card fields.
export async function getFeaturedLugaresForHome(): Promise<LugarListItem[]> {
  const getFeaturedMockLugares = () =>
    getMockLugaresList()
      .filter((l) => l.isFeatured)
      .slice(0, HOME_PREVIEW_LIMITS.FEATURED_LUGARES)

  return fetchSanityList({
    source: 'getFeaturedLugaresForHome',
    query: featuredLugaresHomeQuery,
    normalizeItem: normalizeLugarListItem,
    fallback: getFeaturedMockLugares,
  })
}

// F-19: home page — only the 3 most recent gastronomia items, only card fields.
export async function getLatestGastronomiaForHome(): Promise<GastronomiaListItem[]> {
  return fetchSanityList({
    source: 'getLatestGastronomiaForHome',
    query: latestGastronomiaHomeQuery,
    normalizeItem: normalizeGastronomiaListItem,
    fallback: () => [],
    useFallbackOnEmpty: false,
    logNoSanityConfig: false,
  })
}

function getStartOfTodayIso(): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today.toISOString()
}

// F-20: home page — only the 3 next upcoming events, limited at GROQ level.
export async function getUpcomingEventosPreview(): Promise<EventoListItem[]> {
  return fetchSanityList({
    source: 'getUpcomingEventosPreview',
    query: upcomingEventosPreviewQuery,
    params: { now: getStartOfTodayIso() },
    normalizeItem: normalizeEventoListItem,
    fallback: () => [],
    useFallbackOnEmpty: false,
    logNoSanityConfig: false,
  })
}

export async function getUpcomingEventos(): Promise<EventoListItem[]> {
  return fetchSanityList({
    source: 'getUpcomingEventos',
    query: upcomingEventosQuery,
    params: { now: getStartOfTodayIso() },
    normalizeItem: normalizeEventoListItem,
    fallback: () => [],
    useFallbackOnEmpty: false,
    logNoSanityConfig: false,
  })
}

export async function getEventoBySlug(slug: string): Promise<EventoDetail | null> {
  return fetchSanityDetail({
    source: 'getEventoBySlug',
    query: eventoBySlugQuery,
    params: { slug },
    normalize: normalizeEventoDetail,
    logNoSanityConfig: false,
    fallback: () => null,
  })
}

function sanityRowsToMarkers(rows: SanityMapRow[], sourceType: MapMarker['sourceType']): MapMarker[] {
  return rows
    .filter((r) => r.coordinates.lat !== 0 || r.coordinates.lng !== 0)
    .map((r) => ({
      id: r._id,
      title: r.title,
      slug: r.slug.current,
      sourceType,
      coordinates: r.coordinates,
      category: r.category,
      categoryColor: r.categoryColor,
      type: r.categoryType,
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

    const lugarRows = normalizeSanityMapRows(lugaresRes.data)
    const servicioRows = normalizeSanityMapRows(serviciosRes.data)
    const allRows = [...lugarRows, ...servicioRows]

    if (allRows.length === 0) {
      logMockFallback('getAllMapMarkers', 'empty-results')
      return getMockMapMarkers()
    }

    return [
      ...sanityRowsToMarkers(lugarRows, MAP_MARKER_SOURCE.LUGAR),
      ...sanityRowsToMarkers(servicioRows, MAP_MARKER_SOURCE.SERVICIO),
    ]
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
  const settings = await fetchSanityDetail({
    source: 'getSettings',
    query: settingsQuery,
    normalize: normalizeSiteSettings,
    logEmpty: true,
    fallback: () => mockSettings,
  })

  return settings ?? mockSettings
})
