import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PortableText, type PortableTextComponents } from '@portabletext/react'
import type { PortableTextBlock } from '@portabletext/react'
import { getLugarBySlug } from '@/lib/data'
import { client } from '@/sanity/lib/client'
import { Container } from '@/components/ui/Container'
import { MapPin, Clock, DollarSign, Star, Map } from 'lucide-react'
import DynamicImageCarousel from '@/components/gallery/DynamicImageCarousel'
import DynamicLeafletMap from '@/components/map/DynamicLeafletMap'
import { PageHero, PageHeroBackLink } from '@/components/ui/PageHero'
import { isSafeUrl } from '@/lib/safe-url'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  try {
    const slugs = await client.fetch<{ slug: string }[]>(
      `*[_type == "lugar" && defined(slug.current)]{ "slug": slug.current }`,
      {},
      { next: { tags: ['lugar'] } },
    )
    return slugs.map((l) => ({ slug: l.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const lugar = await getLugarBySlug(slug)
  if (!lugar) return { title: 'Lugar no encontrado' }
  const title = lugar.seo?.metaTitle ?? lugar.title ?? 'Lugar turístico'
  const description = lugar.seo?.metaDescription ?? undefined
  const url = `https://tepexidigital.com.mx/lugares/${slug}`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      ...(lugar.images?.[0]?.url && { images: [{ url: lugar.images[0].url, width: 1200, height: 630 }] }),
    },
  }
}

const descriptionComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p style={{ marginBottom: '1rem', lineHeight: '1.75' }} className="text-stone">
        {children}
      </p>
    ),
    h2: ({ children }) => (
      <h2
        style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '2rem', marginBottom: '0.75rem', lineHeight: '1.3' }}
        className="font-heading text-text-primary"
      >
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3
        style={{ fontSize: '1.2rem', fontWeight: 600, marginTop: '1.5rem', marginBottom: '0.5rem', lineHeight: '1.4' }}
        className="font-heading text-text-primary"
      >
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote
        style={{
          borderLeft: '4px solid rgba(139,69,19,0.4)',
          backgroundColor: 'rgba(139,69,19,0.05)',
          paddingLeft: '1rem',
          paddingRight: '1rem',
          paddingTop: '0.5rem',
          paddingBottom: '0.5rem',
          marginTop: '1rem',
          marginBottom: '1rem',
          borderRadius: '0 0.5rem 0.5rem 0',
          fontStyle: 'italic',
        }}
        className="text-stone"
      >
        {children}
      </blockquote>
    ),
  },
  marks: {
    highlight: ({ children }) => (
      <mark style={{ backgroundColor: 'rgba(139,69,19,0.12)', borderRadius: '2px', padding: '0 2px' }} className="text-primary-dark not-italic font-medium">
        {children}
      </mark>
    ),
    link: ({ value, children }) => {
      const href = value?.href
      if (!isSafeUrl(href)) return <>{children}</>
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-4 hover:text-primary-dark transition-colors"
        >
          {children}
        </a>
      )
    },
  },
}

export default async function LugarDetailPage({ params }: Props) {
  const { slug } = await params
  const lugar = await getLugarBySlug(slug)

  if (!lugar) notFound()

  const images = (lugar.images ?? []).map((img) => ({
    url: img.url ?? img.asset?.url ?? '',
    alt: img.alt ?? lugar.title ?? '',
  })).filter((img) => img.url)

  const HERO_FALLBACK = 'https://cdn.sanity.io/images/45s7lmkb/production/737c94162af932675cbb7eaddf8d63e379404009-1920x1440.jpg'
  const heroImageUrl = images[0]?.url ?? HERO_FALLBACK
  const heroImageAlt = images[0]?.alt ?? `Vista de ${lugar.title}`

  const hasFichaTecnica = !!(lugar.schedule || lugar.cost || lugar.address || lugar.recommendations)

  const mapsUrl = lugar.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lugar.address)}`
    : null

  const markers = lugar.coordinates
    ? [
        {
          id: lugar._id,
          title: lugar.title ?? '',
          slug: lugar.slug?.current ?? slug,
          coordinates: { lat: lugar.coordinates.lat, lng: lugar.coordinates.lng },
          category: lugar.category ?? '',
          categoryColor: lugar.categoryColor ?? '#8B4513',
          type: 'lugar' as const,
        },
      ]
    : []

  return (
    <>
      {/* Hero banner */}
      <PageHero imageUrl={heroImageUrl} imageAlt={heroImageAlt} size="compact">
        <PageHeroBackLink href="/lugares" label="Volver a Lugares Turísticos" />

        {/* Category badge */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {lugar.category && (
            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/25">
              <MapPin className="w-3 h-3" />
              {lugar.category}
            </span>
          )}
        </div>

        <h1 className="font-heading font-bold text-3xl md:text-5xl text-white leading-tight mb-3">
          {lugar.title}
        </h1>

        {lugar.address && (
          <p className="flex items-center gap-2 text-white/70 mt-3">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span>{lugar.address}</span>
          </p>
        )}
      </PageHero>

      <section className="py-12">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Image carousel */}
              {images.length > 0 && (
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <DynamicImageCarousel images={images} />
                </div>
              )}

              {/* Description */}
              {lugar.description && (
                <div className="text-base text-stone">
                  <PortableText
                    value={lugar.description as PortableTextBlock[]}
                    components={descriptionComponents}
                  />
                </div>
              )}
            </div>

            {/* Sidebar — ficha técnica */}
            <aside className="space-y-4">
              <div className="bg-cream rounded-2xl border border-stone/10 overflow-hidden shadow-sm">
                {/* Sidebar header */}
                <div className="bg-primary px-4 sm:px-5 py-4">
                  <h2 className="font-heading font-semibold text-white text-base tracking-wide uppercase text-sm">
                    Ficha Técnica
                  </h2>
                </div>

                <div className="p-4 sm:p-5">
                  {hasFichaTecnica ? (
                    <dl className="space-y-5">
                      {lugar.schedule && (
                        <div className="flex gap-3.5">
                          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Clock className="w-[18px] h-[18px] text-primary" />
                          </div>
                          <div>
                            <dt className="text-[11px] text-stone uppercase tracking-widest font-semibold mb-0.5">Horario</dt>
                            <dd className="text-sm text-stone leading-snug">{lugar.schedule}</dd>
                          </div>
                        </div>
                      )}

                      {lugar.cost && (
                        <div className="flex gap-3.5">
                          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center">
                            <DollarSign className="w-[18px] h-[18px] text-secondary" />
                          </div>
                          <div>
                            <dt className="text-[11px] text-stone uppercase tracking-widest font-semibold mb-0.5">Costo</dt>
                            <dd className="text-sm text-stone leading-snug">{lugar.cost}</dd>
                          </div>
                        </div>
                      )}

                      {lugar.address && (
                        <div className="flex gap-3.5">
                          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                            <MapPin className="w-[18px] h-[18px] text-accent" />
                          </div>
                          <div>
                            <dt className="text-[11px] text-stone uppercase tracking-widest font-semibold mb-0.5">Dirección</dt>
                            <dd className="text-sm text-stone leading-snug">
                              {mapsUrl ? (
                                <a
                                  href={mapsUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:text-primary underline underline-offset-2 transition-colors"
                                >
                                  {lugar.address}
                                </a>
                              ) : (
                                lugar.address
                              )}
                            </dd>
                          </div>
                        </div>
                      )}

                      {lugar.recommendations && (
                        <div className="flex gap-3.5">
                          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                            <Star className="w-[18px] h-[18px] text-amber-600" />
                          </div>
                          <div>
                            <dt className="text-[11px] text-stone uppercase tracking-widest font-semibold mb-0.5">Recomendaciones</dt>
                            <dd className="text-sm text-stone leading-snug prose prose-sm prose-stone max-w-none">
                              <PortableText value={lugar.recommendations as PortableTextBlock[]} components={descriptionComponents} />
                            </dd>
                          </div>
                        </div>
                      )}
                    </dl>
                  ) : (
                    <p className="text-sm text-stone/60 italic text-center py-4">
                      Información no disponible aún.
                    </p>
                  )}
                </div>
              </div>

              {/* Quick tip */}
              <div className="bg-primary/5 rounded-xl border border-primary/15 p-4">
                <p className="text-sm text-primary/80 leading-relaxed">
                  💡 Estamos trabajando para completar la información de este lugar, Gracias por su paciencia! ¿Tenés datos o fotos que compartir? <a href="/contacto" className="underline underline-offset-2 hover:text-primary transition-colors">Contactanos</a>.
                </p>
              </div>
            </aside>
          </div>

          {/* Map section */}
          {markers.length > 0 && (
            <div className="mt-8 md:mt-12 rounded-2xl border border-stone/10 overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 bg-cream border-b border-stone/10 px-4 sm:px-6 py-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Map className="w-4 h-4 text-primary" />
                </div>
                <h2 className="font-heading font-semibold text-text-primary text-lg">
                  Ubicación
                </h2>
              </div>
              <DynamicLeafletMap markers={markers} center={markers[0].coordinates} zoom={16} />
            </div>
          )}
        </Container>
      </section>
    </>
  )
}
