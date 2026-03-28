import type { MetadataRoute } from 'next'
import { sanityFetch } from '@/sanity/lib/live'
import { defineQuery } from 'next-sanity'

const allSlugsQuery = defineQuery(`{
  "lugares": *[_type == "lugar"]{ "slug": slug.current, _updatedAt },
  "gastronomia": *[_type == "gastronomia"]{ "slug": slug.current, _updatedAt },
  "cultura": *[_type == "cultura"]{ "slug": slug.current, _updatedAt }
}`)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://tepexidigital.com'
  const { data } = await sanityFetch({ query: allSlugsQuery })

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
    ...(data?.cultura ?? []).map((c: SlugEntry) => ({
      url: `${baseUrl}/cultura/${c.slug}`,
      lastModified: new Date(c._updatedAt),
    })),
  ]

  return [...staticRoutes, ...dynamicRoutes]
}
