import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/constants'

interface SlugEntityForMeta {
  title?: string | null
  seo?: {
    metaTitle?: string | null
    metaDescription?: string | null
    ogImageUrl?: string | null
    ogImageAlt?: string | null
  } | null
  primaryImageUrl?: string | null
  primaryImageAlt?: string | null
}

interface StaticMetadataOptions {
  description: string
  path: string
  title: string
}

interface SlugMetadataOptions {
  globalOgImage?: {
    alt?: string | null
    url?: string | null
  } | null
}

function resolveFallbackDescription(pathPrefix: string, title: string): string {
  switch (pathPrefix) {
    case 'agenda':
      return `${title} en la agenda turística de Tepexi de Rodríguez, Puebla. Consulta fechas, ubicación y detalles para planear tu visita.`
    case 'lugares':
      return `${title} es un atractivo turístico de Tepexi de Rodríguez, Puebla. Encuentra recomendaciones, ubicación y cómo visitarlo.`
    case 'gastronomia':
      return `${title} forma parte de la gastronomía típica de Tepexi de Rodríguez, Puebla. Descubre sabores locales, origen y recomendaciones.`
    case 'servicios':
      return `${title} ofrece apoyo útil para tu visita a Tepexi de Rodríguez, Puebla. Revisa ubicación, horarios y datos prácticos.`
    default:
      return `${title} en Tepexi de Rodríguez, Puebla.`
  }
}

function resolveImage(
  entity: SlugEntityForMeta,
  options?: SlugMetadataOptions,
): { alt: string; url: string } | null {
  const url = entity.seo?.ogImageUrl ?? entity.primaryImageUrl ?? options?.globalOgImage?.url ?? null
  if (!url) return null

  return {
    url,
    alt:
      entity.seo?.ogImageAlt ??
      entity.primaryImageAlt ??
      options?.globalOgImage?.alt ??
      entity.title ??
      'Tepexi Digital',
  }
}

export function buildStaticPageMetadata({ title, description, path }: StaticMetadataOptions): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
  }
}

/**
 * Build consistent Metadata for any detail/slug page.
 */
export function buildSlugMetadata(
  slug: string,
  pathPrefix: string,
  entity: SlugEntityForMeta | null,
  fallbackTitle: string,
  options?: SlugMetadataOptions,
): Metadata {
  if (!entity) return { title: `${fallbackTitle} no encontrado` }

  const title = entity.seo?.metaTitle ?? entity.title ?? fallbackTitle
  const description = entity.seo?.metaDescription ?? resolveFallbackDescription(pathPrefix, entity.title ?? fallbackTitle)
  const canonicalPath = `/${pathPrefix}/${slug}`
  const absoluteUrl = `${SITE_URL}${canonicalPath}`
  const image = resolveImage(entity, options)

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title,
      description,
      url: absoluteUrl,
      ...(image && {
        images: [{ url: image.url, width: 1200, height: 630, alt: image.alt }],
      }),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(image && {
        images: [{ url: image.url, alt: image.alt }],
      }),
    },
  }
}
