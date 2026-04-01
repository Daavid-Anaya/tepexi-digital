import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { PortableText } from '@portabletext/react'
import type { PortableTextBlock } from '@portabletext/react'
import { getEventoBySlug } from '@/lib/data'
import { Container } from '@/components/ui/Container'
import { Badge } from '@/components/ui/Badge'
import { ArrowLeft, MapPin, Calendar, CalendarDays, Clock, Map } from 'lucide-react'
import DynamicLeafletMap from '@/components/map/DynamicLeafletMap'

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const evento = await getEventoBySlug(slug)
  if (!evento) return { title: 'No encontrado' }
  return {
    title: evento.seo?.metaTitle ?? evento.title ?? 'Evento',
    description: evento.seo?.metaDescription ?? undefined,
  }
}

export default async function EventoDetailPage({ params }: Props) {
  const { slug } = await params
  const evento = await getEventoBySlug(slug)

  if (!evento) {
    return (
      <Container className="py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
          <CalendarDays className="w-8 h-8 text-secondary/40" />
        </div>
        <h1 className="font-heading font-semibold text-xl text-primary mb-2">Evento no encontrado</h1>
        <p className="text-stone mb-6">No pudimos encontrar este evento en la agenda.</p>
        <Link
          href="/agenda"
          className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Agenda
        </Link>
      </Container>
    )
  }

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
      <section className="relative overflow-hidden bg-secondary py-14">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-secondary-light" />
          <div className="absolute bottom-0 left-1/3 w-40 h-40 rounded-full" style={{ backgroundColor: '#1B5E20' }} />
        </div>

        <Container className="relative">
          {/* Back navigation */}
          <Link
            href="/agenda"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            Volver a Agenda
          </Link>

          <div className="flex items-start gap-6">
            {/* Date box */}
            <div className="flex-shrink-0 flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm text-white text-center">
              <span className="text-3xl font-bold leading-none tabular-nums">{formatted.day}</span>
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
        </Container>
      </section>

      <section className="py-12">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
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
                <div className="prose prose-stone max-w-none prose-headings:font-heading prose-headings:text-primary prose-a:text-secondary prose-a:underline-offset-4 prose-strong:text-primary-dark prose-p:leading-relaxed prose-p:text-stone">
                  <PortableText value={evento.description as PortableTextBlock[]} />
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-4">
              <div className="bg-cream rounded-2xl border border-stone/10 overflow-hidden shadow-sm">
                {/* Sidebar header */}
                <div className="bg-secondary px-5 py-4">
                  <h2 className="font-heading font-semibold text-white text-sm tracking-wide uppercase">
                    Detalles del evento
                  </h2>
                </div>

                <div className="p-5 space-y-5">
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
            <div className="mt-12 rounded-2xl border border-stone/10 overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 bg-cream border-b border-stone/10 px-6 py-4">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Map className="w-4 h-4 text-secondary" />
                </div>
                <h2 className="font-heading font-semibold text-primary text-lg">
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
