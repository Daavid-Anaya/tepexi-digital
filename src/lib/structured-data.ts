import type { PortableTextBlock } from '@portabletext/react'
import { SITE_URL } from '@/lib/constants'
import type { EventoDetail, LugarDetail, SiteSettings } from '@/lib/data'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface ImageAsset {
  alt?: string | null
  url?: string | null
}

function toAbsoluteUrl(pathOrUrl: string): string {
  return pathOrUrl.startsWith('http') ? pathOrUrl : new URL(pathOrUrl, SITE_URL).toString()
}

function normalizeText(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function portableTextToPlainText(blocks: PortableTextBlock[] | null | undefined): string | null {
  if (!blocks?.length) return null

  const text = blocks
    .flatMap((block) => {
      if (!Array.isArray(block.children)) return []

      return block.children.flatMap((child) => {
        if (typeof child !== 'object' || child === null || !("text" in child)) return []
        return typeof child.text === 'string' ? [child.text] : []
      })
    })
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()

  return text.length > 0 ? text : null
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[], currentPath?: string) {
  const itemListElement = items.map((item, index) => {
    const resolvedHref = item.href ?? (index === items.length - 1 ? currentPath : undefined)

    return {
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(resolvedHref ? { item: toAbsoluteUrl(resolvedHref) } : {}),
    }
  })

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
  }
}

export function buildOrganizationJsonLd(settings: SiteSettings) {
  const sameAs = settings.socialLinks?.map((link) => link.url).filter(Boolean) ?? []

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}#organization`,
    name: settings.siteName,
    url: SITE_URL,
    description: settings.siteDescription,
    ...(settings.contactEmail ? { email: settings.contactEmail } : {}),
    ...(settings.contactPhone ? { telephone: settings.contactPhone } : {}),
    ...(settings.address
      ? {
          address: {
            '@type': 'PostalAddress',
            streetAddress: settings.address,
            addressLocality: 'Tepexi de Rodríguez',
            addressRegion: 'Puebla',
            addressCountry: 'MX',
          },
        }
      : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  }
}

export function buildWebsiteJsonLd(settings: SiteSettings) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}#website`,
    url: SITE_URL,
    name: settings.siteName,
    description: settings.siteDescription,
    inLanguage: 'es-MX',
    publisher: {
      '@id': `${SITE_URL}#organization`,
    },
  }
}

function resolveDescription(
  description: string | null | undefined,
  richText: PortableTextBlock[] | null | undefined,
): string | undefined {
  return normalizeText(description) ?? portableTextToPlainText(richText) ?? undefined
}

function resolveImage(image: ImageAsset | null | undefined, fallbackName: string) {
  const url = normalizeText(image?.url)
  if (!url) return null

  return {
    '@type': 'ImageObject',
    url,
    contentUrl: url,
    caption: normalizeText(image?.alt) ?? fallbackName,
  }
}

export function buildEventJsonLd(evento: EventoDetail, options: { canonicalPath: string }) {
  // A closed/exhausted series has no representative session to advertise.
  if (!evento.date || evento.scheduleStatus === 'closed') return null
  const image = resolveImage({ url: evento.imageUrl, alt: evento.imageAlt }, evento.title)
  const locationName = evento.location?.title ?? evento.locationText ?? 'Tepexi de Rodríguez'
  const locationAddress = evento.location?.address ?? evento.locationText ?? undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: evento.title,
    description: resolveDescription(evento.seo?.metaDescription, evento.description),
    url: toAbsoluteUrl(options.canonicalPath),
    startDate: evento.date,
    ...(evento.endDate ? { endDate: evento.endDate } : {}),
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: {
      '@type': 'Place',
      name: locationName,
      ...(locationAddress ? { address: locationAddress } : {}),
      ...(evento.location?.coordinates
        ? {
            geo: {
              '@type': 'GeoCoordinates',
              latitude: evento.location.coordinates.lat,
              longitude: evento.location.coordinates.lng,
            },
          }
        : {}),
    },
    organizer: {
      '@type': 'Organization',
      name: 'Tepexi Digital',
      url: SITE_URL,
    },
    ...(image ? { image: [image.url] } : {}),
  }
}

export function buildTouristAttractionJsonLd(
  lugar: LugarDetail,
  options: { canonicalPath: string; primaryImage?: ImageAsset | null },
) {
  const image = resolveImage(options.primaryImage, lugar.title)

  return {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: lugar.title,
    description: resolveDescription(lugar.seo?.metaDescription, lugar.description),
    url: toAbsoluteUrl(options.canonicalPath),
    touristType: 'Cultural and local tourism',
    ...(lugar.address ? { address: lugar.address } : {}),
    ...(lugar.coordinates
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: lugar.coordinates.lat,
            longitude: lugar.coordinates.lng,
          },
        }
      : {}),
    ...(image ? { image: [image.url] } : {}),
    ...(lugar.category ? { additionalType: lugar.category } : {}),
    ...(lugar.schedule ? { openingHours: lugar.schedule } : {}),
    ...(normalizeText(lugar.cost)?.toLowerCase() === 'gratuito' ? { isAccessibleForFree: true } : {}),
  }
}
