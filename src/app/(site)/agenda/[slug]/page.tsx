import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { PortableText, type PortableTextComponents } from '@portabletext/react'
import type { PortableTextBlock } from '@portabletext/react'
import { notFound } from 'next/navigation'
import { getEventoBySlug } from '@/lib/data'
import { client } from '@/sanity/lib/client'
import { Container } from '@/components/ui/Container'
import { Badge } from '@/components/ui/Badge'
import { MapPin, Calendar, CalendarDays, Clock, Map } from 'lucide-react'
import DynamicLeafletMap from '@/components/map/DynamicLeafletMap'
import { PageHero, PageHeroBackLink } from '@/components/ui/PageHero'
import { isSafeUrl } from '@/lib/safe-url'

function formatDateFull(dateString: string) {
  return new Date(dateString).toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatDateShort(dateString: string) {
  const date = new Date(dateString)
  return {
    day: date.toLocaleDateString('es-MX', { day: '2-digit' }),
    month: date.toLocaleDateString('es-MX', { month: 'short' }).toUpperCase(),
    year: date.getFullYear().toString(),
  }
}

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  try {
    const slugs = await client.fetch<{ slug: string }[]>(
      `*[_type == "evento" && defined(slug.current)]{ "slug": slug.current }`,
      {},
      { next: { tags: ['evento'] } },
    )
    return slugs.map((e) => ({ slug: e.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const evento = await getEventoBySlug(slug)
  if (!evento) return { title: 'No encontrado' }
  const title = evento.seo?.metaTitle ?? evento.title ?? 'Evento'
  const description = evento.seo?.metaDescription ?? undefined
  const url = `https://tepexidigital.com.mx/agenda/${slug}`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      ...(evento.imageUrl && { images: [{ url: evento.imageUrl, width: 1200, height: 630 }] }),
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
          borderLeft: '4px solid rgba(46,125,50,0.4)',
          backgroundColor: 'rgba(46,125,50,0.05)',
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
      <mark style={{ backgroundColor: 'rgba(46,125,50,0.12)', borderRadius: '2px', padding: '0 2px' }} className="text-secondary not-italic font-medium">
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
          className="text-secondary underline underline-offset-4 hover:text-secondary/80 transition-colors"
        >
          {children}
        </a>
      )
    },
  },
}

export default async function EventoDetailPage({ params }: Props) {
  const { slug } = await params
  const evento = await getEventoBySlug(slug)

  if (!evento) notFound()

  const formatted = formatDateShort(evento.date)
  const locationLabel = evento.location?.title ?? evento.locationText
  const locationCoords = evento.location?.coordinates ?? null

  const markers = locationCoords
    ? [
        {
          id: evento._id,
          title: evento.title ?? '',
          slug: evento.slug?.current ?? slug,
          coordinates: { lat: locationCoords.lat, lng: locationCoords.lng },
          category: 'Evento',
          categoryColor: '#2E7D32',
          type: 'lugar' as const,
        },
      ]
    : []

  return (
    <>
      {/* Hero banner — green/calendar accent */}
      <PageHero imageUrl="https://cdn.sanity.io/images/45s7lmkb/production/1207eeb4636baf3a09b4a926173eb07861f3693e-1920x1280.jpg" imageAlt="Imagen hero de la agenda de eventos" size="compact">
        <PageHeroBackLink href="/agenda" label="Volver a Agenda" />

        <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
          {/* Date box */}
          <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/15 backdrop-blur-sm text-white text-center">
            <span className="text-2xl sm:text-3xl font-bold leading-none tabular-nums">{formatted.day}</span>
            <span className="text-[10px] uppercase tracking-wider mt-1 opacity-80 font-medium">{formatted.month}</span>
          </div>

          <div>
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-3 mb-3">
              {evento.isFeatured && (
                <Badge variant="accent" className="text-xs">
                  Destacado
                </Badge>
              )}
            </div>

            <h1 className="font-heading font-bold text-3xl md:text-5xl text-white leading-tight mb-3">
              {evento.title}
            </h1>

            {/* Date info */}
            <div className="flex flex-wrap items-center gap-4 mt-3">
              <p className="flex items-center gap-2 text-white/70 text-sm">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span className="capitalize">{formatDateFull(evento.date)}</span>
              </p>
              {evento.endDate && (
                <p className="flex items-center gap-2 text-white/60 text-sm">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span>
                    Hasta {formatDateFull(evento.endDate)}
                  </span>
                </p>
              )}
            </div>

            {locationLabel && (
              <p className="flex items-center gap-2 text-white/70 mt-2 text-sm">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>{locationLabel}</span>
              </p>
            )}
          </div>
        </div>
      </PageHero>

      <section className="py-12">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Event image */}
              {evento.imageUrl && (
                <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg">
                  <Image
                    src={evento.imageUrl}
                    alt={evento.imageAlt ?? evento.title ?? 'Imagen del evento'}
                    fill
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    className="object-cover"
                  />
                </div>
              )}

              {/* Description */}
              {evento.description && (
                <div className="text-base text-stone">
                  <PortableText
                    value={evento.description as PortableTextBlock[]}
                    components={descriptionComponents}
                  />
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-4">
              <div className="bg-cream rounded-2xl border border-stone/10 overflow-hidden shadow-sm">
                {/* Sidebar header */}
                <div className="bg-secondary px-4 sm:px-5 py-4">
                  <h2 className="font-heading font-semibold text-white text-sm tracking-wide uppercase">
                    Detalles del evento
                  </h2>
                </div>

                <div className="p-4 sm:p-5 space-y-5">
                  {/* Date */}
                  <div className="flex gap-3.5">
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-secondary" />
                    </div>
                    <div>
                      <dt className="text-[11px] text-stone uppercase tracking-widest font-semibold mb-0.5">Fecha</dt>
                      <dd className="text-sm text-stone leading-snug capitalize">
                        {formatDateFull(evento.date)}
                      </dd>
                      {evento.endDate && (
                        <dd className="text-xs text-stone/60 mt-0.5 capitalize">
                          Hasta {formatDateFull(evento.endDate)}
                        </dd>
                      )}
                    </div>
                  </div>

                  {/* Location */}
                  {locationLabel && (
                    <div className="flex gap-3.5">
                      <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <dt className="text-[11px] text-stone uppercase tracking-widest font-semibold mb-0.5">Ubicación</dt>
                        <dd className="text-sm text-stone leading-snug">{locationLabel}</dd>
                        {evento.location?.address && (
                          <dd className="text-xs text-stone/60 mt-0.5">{evento.location.address}</dd>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Back to agenda CTA */}
              <Link
                href="/agenda"
                className="flex items-center justify-center gap-2 bg-secondary/10 hover:bg-secondary/20 text-secondary font-medium text-sm px-4 py-3 rounded-xl transition-colors duration-200"
              >
                <CalendarDays className="w-4 h-4" />
                Ver toda la agenda
              </Link>
            </aside>
          </div>

          {/* Map section */}
          {markers.length > 0 && (
            <div className="mt-8 md:mt-12 rounded-2xl border border-stone/10 overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 bg-cream border-b border-stone/10 px-4 sm:px-6 py-4">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Map className="w-4 h-4 text-secondary" />
                </div>
                <h2 className="font-heading font-semibold text-text-primary text-lg">
                  Ubicación del evento
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
