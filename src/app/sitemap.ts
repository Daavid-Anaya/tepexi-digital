import type { MetadataRoute } from 'next'
import { sanityFetch } from '@/sanity/lib/live'
import { defineQuery } from 'next-sanity'
import { SITE_URL } from '@/lib/constants'
import { logError, logWarn } from '@/lib/observability'

// Keep sitemap freshness aligned with the high-churn listing pages and webhook revalidation.
export const revalidate = 3600

const allSlugsQuery = defineQuery(`{
  "lugares": *[_type == "lugar"]{ "slug": slug.current, _updatedAt },
  "gastronomia": *[_type == "gastronomia"]{ "slug": slug.current, _updatedAt },
  "servicios": *[_type == "servicio"]{ "slug": slug.current, _updatedAt },
  "agenda": *[_type == "evento"]{ "slug": slug.current, _updatedAt }
}`)

interface SitemapSlugEntry {
  _updatedAt: string
  slug: string | null
}

interface SitemapQueryResult {
  agenda?: SitemapSlugEntry[]
  gastronomia?: SitemapSlugEntry[]
  lugares?: SitemapSlugEntry[]
  servicios?: SitemapSlugEntry[]
}

const SITEMAP_CONTENT_TYPE = {
  AGENDA: 'agenda',
  GASTRONOMIA: 'gastronomia',
  LUGARES: 'lugares',
  SERVICIOS: 'servicios',
} as const

type SitemapContentType = (typeof SITEMAP_CONTENT_TYPE)[keyof typeof SITEMAP_CONTENT_TYPE]

interface SitemapDataIssue {
  invalidContentType?: SitemapContentType
  reason: 'invalid-payload' | 'invalid-collection' | 'missing-data'
  receivedType: string
}

interface InvalidSlugMetadata {
  normalizedLength?: number
  rawLength?: number
  receivedType: string
  reason: 'empty' | 'non-string' | 'reserved-character' | 'whitespace'
}

interface InvalidUpdatedAtMetadata {
  receivedType: string
  reason: 'invalid-date'
  valueLength?: number
}

const SITEMAP_ROUTE = '/sitemap.xml'
const SAFE_SLUG_PATTERN = /^[^/?#\s]+$/

function getValueType(value: unknown): string {
  if (value === null) {
    return 'null'
  }

  if (Array.isArray(value)) {
    return 'array'
  }

  return typeof value
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getSitemapDataIssue(data: unknown): SitemapDataIssue | null {
  if (data === null) {
    return {
      reason: 'missing-data',
      receivedType: 'null',
    }
  }

  if (!isRecord(data)) {
    return {
      reason: 'invalid-payload',
      receivedType: getValueType(data),
    }
  }

  for (const contentType of Object.values(SITEMAP_CONTENT_TYPE)) {
    const entries = data[contentType]

    if (entries !== undefined && !Array.isArray(entries)) {
      return {
        reason: 'invalid-collection',
        invalidContentType: contentType,
        receivedType: getValueType(entries),
      }
    }
  }

  return null
}

function getValidSlug(slug: SitemapSlugEntry['slug']): string | null {
  if (typeof slug !== 'string') {
    return null
  }

  const normalizedSlug = slug.trim()

  if (normalizedSlug.length === 0) {
    return null
  }

  return SAFE_SLUG_PATTERN.test(normalizedSlug) ? normalizedSlug : null
}

function getInvalidSlugMetadata(slug: SitemapSlugEntry['slug']): InvalidSlugMetadata {
  if (typeof slug !== 'string') {
    return {
      reason: 'non-string',
      receivedType: getValueType(slug),
    }
  }

  const normalizedSlug = slug.trim()

  if (normalizedSlug.length === 0) {
    return {
      reason: 'empty',
      receivedType: 'string',
      normalizedLength: 0,
      rawLength: slug.length,
    }
  }

  return {
    reason: /\s/.test(normalizedSlug) ? 'whitespace' : 'reserved-character',
    receivedType: 'string',
    normalizedLength: normalizedSlug.length,
    rawLength: slug.length,
  }
}

function getInvalidUpdatedAtMetadata(updatedAt: string): InvalidUpdatedAtMetadata {
  return {
    reason: 'invalid-date',
    receivedType: getValueType(updatedAt),
    ...(typeof updatedAt === 'string' ? { valueLength: updatedAt.length } : {}),
  }
}

const STATIC_ROUTES: Array<{
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>
  path: string
  priority: number
}> = [
  { path: '', changeFrequency: 'weekly', priority: 1 },
  { path: '/lugares', changeFrequency: 'weekly', priority: 0.95 },
  { path: '/agenda', changeFrequency: 'daily', priority: 0.95 },
  { path: '/gastronomia', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/mapa', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/servicios', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/como-llegar', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/cultura', changeFrequency: 'monthly', priority: 0.75 },
  { path: '/contacto', changeFrequency: 'monthly', priority: 0.7 },
]

function createDynamicEntry(
  path: string,
  updatedAt: string,
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>,
  priority: number,
) {
  const lastModified = new Date(updatedAt)

  return {
    url: `${SITE_URL}${path}`,
    ...(Number.isNaN(lastModified.getTime()) ? {} : { lastModified }),
    changeFrequency,
    priority,
  }
}

function buildDynamicEntries(
  entries: SitemapSlugEntry[],
  basePath: string,
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>,
  priority: number,
  contentType: keyof SitemapQueryResult,
) {
  return entries.flatMap((entry) => {
    const slug = getValidSlug(entry.slug)

    if (!slug) {
      logWarn('[sitemap] skipped dynamic route with invalid slug', {
        source: 'sitemap',
        route: SITEMAP_ROUTE,
        metadata: {
          contentType,
          slug: getInvalidSlugMetadata(entry.slug),
        },
      })

      return []
    }

    const dynamicEntry = createDynamicEntry(`${basePath}/${slug}`, entry._updatedAt, changeFrequency, priority)

    if (!('lastModified' in dynamicEntry)) {
      logWarn('[sitemap] omitted invalid lastModified for dynamic route', {
        source: 'sitemap',
        route: SITEMAP_ROUTE,
        metadata: {
          contentType,
          path: `${basePath}/${slug}`,
          updatedAt: getInvalidUpdatedAtMetadata(entry._updatedAt),
        },
      })
    }

    return [dynamicEntry]
  })
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  try {
    const response = await sanityFetch({ query: allSlugsQuery }) as { data: SitemapQueryResult | null }
    const data = response.data

    const dataIssue = getSitemapDataIssue(data)

    if (dataIssue) {
      logWarn('[sitemap] received null or unusable CMS sitemap data, serving static fallback only', {
        source: 'sitemap',
        route: SITEMAP_ROUTE,
        metadata: {
          fallbackMode: 'static-only',
          staticRouteCount: staticRoutes.length,
          ...dataIssue,
        },
      })

      return staticRoutes
    }

    const safeData = data as SitemapQueryResult

    const dynamicRoutes = [
      ...buildDynamicEntries(safeData.lugares ?? [], '/lugares', 'monthly', 0.85, 'lugares'),
      ...buildDynamicEntries(safeData.gastronomia ?? [], '/gastronomia', 'weekly', 0.8, 'gastronomia'),
      ...buildDynamicEntries(safeData.servicios ?? [], '/servicios', 'monthly', 0.75, 'servicios'),
      ...buildDynamicEntries(safeData.agenda ?? [], '/agenda', 'daily', 0.85, 'agenda'),
    ]

    return [...staticRoutes, ...dynamicRoutes]
  } catch (error) {
    logError('[sitemap] failed to resolve dynamic sitemap entries, serving static fallback only', {
      source: 'sitemap',
      route: SITEMAP_ROUTE,
      error,
      metadata: {
        fallbackMode: 'static-only',
        staticRouteCount: staticRoutes.length,
      },
    })

    return staticRoutes
  }
}
