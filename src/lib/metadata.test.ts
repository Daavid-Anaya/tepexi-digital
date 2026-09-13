import { describe, expect, it } from 'vitest'
import { buildSlugMetadata } from '@/lib/metadata'
import { buildBreadcrumbJsonLd, buildEventJsonLd, buildTouristAttractionJsonLd } from '@/lib/structured-data'

describe('metadata helpers', () => {
  it('uses SEO OG image first, then entity image, then global image fallback', () => {
    const withSeoImage = buildSlugMetadata(
      'feria-de-tepexi',
      'agenda',
      {
        title: 'Feria de Tepexi',
        seo: {
          metaTitle: null,
          metaDescription: null,
          ogImageUrl: 'https://cdn.example.com/seo-image.jpg',
          ogImageAlt: 'SEO image alt',
        },
        primaryImageUrl: 'https://cdn.example.com/entity-image.jpg',
        primaryImageAlt: 'Entity image alt',
      },
      'Evento',
      {
        globalOgImage: {
          url: 'https://cdn.example.com/default-og.jpg',
          alt: 'Default og alt',
        },
      },
    )

    const withEntityImage = buildSlugMetadata(
      'feria-de-tepexi',
      'agenda',
      {
        title: 'Feria de Tepexi',
        seo: {
          metaTitle: null,
          metaDescription: null,
          ogImageUrl: null,
          ogImageAlt: null,
        },
        primaryImageUrl: 'https://cdn.example.com/entity-image.jpg',
        primaryImageAlt: 'Entity image alt',
      },
      'Evento',
      {
        globalOgImage: {
          url: 'https://cdn.example.com/default-og.jpg',
          alt: 'Default og alt',
        },
      },
    )

    const withGlobalImage = buildSlugMetadata(
      'feria-de-tepexi',
      'agenda',
      {
        title: 'Feria de Tepexi',
        seo: {
          metaTitle: null,
          metaDescription: null,
          ogImageUrl: null,
          ogImageAlt: null,
        },
        primaryImageUrl: null,
        primaryImageAlt: null,
      },
      'Evento',
      {
        globalOgImage: {
          url: 'https://cdn.example.com/default-og.jpg',
          alt: 'Default og alt',
        },
      },
    )

    expect(withSeoImage.openGraph?.images).toEqual([
      {
        url: 'https://cdn.example.com/seo-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SEO image alt',
      },
    ])
    expect(withEntityImage.openGraph?.images).toEqual([
      {
        url: 'https://cdn.example.com/entity-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Entity image alt',
      },
    ])
    expect(withGlobalImage.openGraph?.images).toEqual([
      {
        url: 'https://cdn.example.com/default-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Default og alt',
      },
    ])
  })

  it('supports legacy top-level Open Graph image fields for existing detail pages', () => {
    const metadata = buildSlugMetadata(
      'feria-de-tepexi',
      'agenda',
      {
        title: 'Feria de Tepexi',
        ogImageUrl: 'https://cdn.example.com/top-level-og.jpg',
        ogImageAlt: 'Top-level OG alt',
        seo: null,
        primaryImageUrl: 'https://cdn.example.com/entity-image.jpg',
        primaryImageAlt: 'Entity image alt',
      },
      'Evento',
    )

    expect(metadata.openGraph?.images).toEqual([
      {
        url: 'https://cdn.example.com/top-level-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Top-level OG alt',
      },
    ])
    expect((metadata.twitter as { images?: Array<{ url: string; alt: string }> } | undefined)?.images).toEqual([
      { url: 'https://cdn.example.com/top-level-og.jpg', alt: 'Top-level OG alt' },
    ])
  })

  it('creates contextual fallback descriptions and twitter metadata', () => {
    const metadata = buildSlugMetadata(
      'huellas-de-dinosaurio',
      'lugares',
      {
        title: 'Huellas de Dinosaurio',
        seo: null,
        primaryImageUrl: null,
        primaryImageAlt: null,
      },
      'Lugar turístico',
    )

    expect(metadata.description).toContain('Tepexi de Rodríguez, Puebla')
    expect((metadata.twitter as { card?: string } | undefined)?.card).toBe('summary')
    expect(metadata.alternates?.canonical).toBe('/lugares/huellas-de-dinosaurio')
  })
})

describe('structured data helpers', () => {
  it('creates breadcrumb item urls using the current path for the last crumb', () => {
    const jsonLd = buildBreadcrumbJsonLd(
      [
        { label: 'Inicio', href: '/' },
        { label: 'Agenda', href: '/agenda' },
        { label: 'Feria de Tepexi' },
      ],
      '/agenda/feria-de-tepexi',
    )

    expect(jsonLd.itemListElement[2]).toEqual({
      '@type': 'ListItem',
      position: 3,
      name: 'Feria de Tepexi',
      item: 'https://tepexidigital.com.mx/agenda/feria-de-tepexi',
    })
  })

  it('creates event and tourist attraction structured data with local URLs', () => {
    const eventJsonLd = buildEventJsonLd(
      {
        _id: 'evento-1',
        title: 'Feria de Tepexi',
        slug: { current: 'feria-de-tepexi' },
        description: null,
        imageUrl: 'https://cdn.example.com/event.jpg',
        imageAlt: 'Feria banner',
        date: '2026-04-15T18:00:00.000Z',
        endDate: '2026-04-20T23:00:00.000Z',
        location: {
          _id: 'lugar-1',
          title: 'Centro de Tepexi',
          slug: { current: 'centro-de-tepexi' },
          coordinates: { lat: 18.58, lng: -97.92 },
          address: 'Centro, Tepexi de Rodríguez, Puebla',
        },
        locationText: null,
        isFeatured: true,
        seo: null,
      },
      { canonicalPath: '/agenda/feria-de-tepexi' },
    )

    const attractionJsonLd = buildTouristAttractionJsonLd(
      {
        _id: 'lugar-1',
        title: 'Huellas de Dinosaurio',
        slug: { current: 'huellas-de-dinosaurio' },
        category: 'Paleontología',
        categoryColor: '#00838F',
        description: null,
        images: [],
        coordinates: { lat: 18.58, lng: -97.92 },
        address: 'Tepexi de Rodríguez, Puebla',
        schedule: '09:00-17:00',
        cost: 'Gratuito',
        recommendations: null,
        seo: null,
      },
      {
        canonicalPath: '/lugares/huellas-de-dinosaurio',
        primaryImage: {
          url: 'https://cdn.example.com/place.jpg',
          alt: 'Huellas fósiles',
        },
      },
    )

    expect(eventJsonLd?.url).toBe('https://tepexidigital.com.mx/agenda/feria-de-tepexi')
    expect(attractionJsonLd.url).toBe('https://tepexidigital.com.mx/lugares/huellas-de-dinosaurio')
    expect(attractionJsonLd.isAccessibleForFree).toBe(true)
  })
})
