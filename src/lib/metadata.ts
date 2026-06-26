import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/constants'

interface SlugEntityForMeta {
  title?: string | null
  seo?: {
    metaTitle?: string | null
    metaDescription?: string | null
  } | null
  /** Provide the resolved OG image URL (caller normalizes from images[0].url or imageUrl) */
  ogImageUrl?: string | null
}

/**
 * Build consistent Metadata for any detail/slug page.
 */
export function buildSlugMetadata(
  slug: string,
  pathPrefix: string,
  entity: SlugEntityForMeta | null,
  fallbackTitle: string,
): Metadata {
  if (!entity) return { title: `${fallbackTitle} no encontrado` }

  const title = entity.seo?.metaTitle ?? entity.title ?? fallbackTitle
  const description = entity.seo?.metaDescription ?? undefined
  const url = `${SITE_URL}/${pathPrefix}/${slug}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      ...(entity.ogImageUrl && {
        images: [{ url: entity.ogImageUrl, width: 1200, height: 630 }],
      }),
    },
  }
}
