import type { MetadataRoute } from 'next'
import { sanityFetch } from '@/sanity/lib/live'
import { defineQuery } from 'next-sanity'
import { SITE_URL } from '@/lib/constants'

const allSlugsQuery = defineQuery(`{
  "lugares": *[_type == "lugar"]{ "slug": slug.current, _updatedAt },
  "gastronomia": *[_type == "gastronomia"]{ "slug": slug.current, _updatedAt },
  "servicios": *[_type == "servicio"]{ "slug": slug.current, _updatedAt }
}`)

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
    const { data } = await sanityFetch({ query: allSlugsQuery })

    type SlugEntry = { slug: string | null; _updatedAt: string }

    const dynamicRoutes = [
      ...(data?.lugares ?? []).map((l: SlugEntry) => ({
        url: `${baseUrl}/lugares/${l.slug}`,
        lastModified: new Date(l._updatedAt),
      })),
      ...(data?.gastronomia ?? []).map((g: SlugEntry) => ({
        url: `${baseUrl}/gastronomia/${g.slug}`,
        lastModified: new Date(g._updatedAt),
      })),
      ...(data?.servicios ?? []).map((s: SlugEntry) => ({
        url: `${baseUrl}/servicios/${s.slug}`,
        lastModified: new Date(s._updatedAt),
      })),
    ]

    return [...staticRoutes, ...dynamicRoutes]
  } catch {
    return staticRoutes
  }
}
