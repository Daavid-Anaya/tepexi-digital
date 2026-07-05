import type { MetadataRoute } from 'next'
import { sanityFetch } from '@/sanity/lib/live'
import { defineQuery } from 'next-sanity'
import { SITE_URL } from '@/lib/constants'

const allSlugsQuery = defineQuery(`{
  "lugares": *[_type == "lugar"]{ "slug": slug.current, _updatedAt },
  "gastronomia": *[_type == "gastronomia"]{ "slug": slug.current, _updatedAt },
  "servicios": *[_type == "servicio"]{ "slug": slug.current, _updatedAt }
}`)

interface SitemapSlugEntry {
  _updatedAt: string
  slug: string | null
}

interface SitemapQueryResult {
  gastronomia?: SitemapSlugEntry[]
  lugares?: SitemapSlugEntry[]
  servicios?: SitemapSlugEntry[]
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL

  const staticRoutes = [
    '',
    '/lugares',
    '/gastronomia',
    '/cultura',
    '/agenda',
    '/mapa',
    '/como-llegar',
    '/contacto',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
  }))

  try {
    const response = await sanityFetch({ query: allSlugsQuery }) as { data: SitemapQueryResult | null }
    const data = response.data

    const dynamicRoutes = [
      ...(data?.lugares ?? []).map((lugar) => ({
        url: `${baseUrl}/lugares/${lugar.slug}`,
        lastModified: new Date(lugar._updatedAt),
      })),
      ...(data?.gastronomia ?? []).map((item) => ({
        url: `${baseUrl}/gastronomia/${item.slug}`,
        lastModified: new Date(item._updatedAt),
      })),
      ...(data?.servicios ?? []).map((service) => ({
        url: `${baseUrl}/servicios/${service.slug}`,
        lastModified: new Date(service._updatedAt),
      })),
    ]

    return [...staticRoutes, ...dynamicRoutes]
  } catch {
    return staticRoutes
  }
}
