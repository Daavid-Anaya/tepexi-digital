import type { Metadata } from 'next'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import type { PortableTextBlock } from '@portabletext/react'
import { getLugarBySlug } from '@/lib/data'
import { Container } from '@/components/ui/Container'
import { Badge } from '@/components/ui/Badge'
import { ArrowLeft, MapPin, Clock, DollarSign, Star, Map } from 'lucide-react'
import DynamicImageCarousel from '@/components/gallery/DynamicImageCarousel'
import DynamicLeafletMap from '@/components/map/DynamicLeafletMap'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const lugar = await getLugarBySlug(slug)
  if (!lugar) return { title: 'Lugar no encontrado' }
  return {
    title: lugar.seo?.metaTitle ?? lugar.title ?? 'Lugar turístico',
    description: lugar.seo?.metaDescription ?? undefined,
  }
}

export default async function LugarDetailPage({ params }: Props) {
  const { slug } = await params
  const lugar = await getLugarBySlug(slug)

  if (!lugar) {
    return (
      <Container className="py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-primary/40" />
        </div>
        <h1 className="font-heading font-semibold text-xl text-primary mb-2">Lugar no encontrado</h1>
        <p className="text-stone mb-6">No pudimos encontrar este lugar turístico.</p>
        <Link
          href="/lugares"
          className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Lugares
        </Link>
      </Container>
    )
  }

  const images = (lugar.images ?? []).map((img) => ({
    url: img.url ?? img.asset?.url ?? '',
    alt: img.alt ?? lugar.title ?? '',
  })).filter((img) => img.url)

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
      <section className="relative overflow-hidden bg-primary py-14">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-primary-light" />
          <div className="absolute bottom-0 left-1/3 w-40 h-40 rounded-full bg-primary-dark" />
        </div>

        <Container className="relative">
          {/* Back navigation */}
          <Link
            href="/lugares"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            Volver a Lugares Turísticos
          </Link>

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
        </Container>
      </section>

      <section className="py-12">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
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
                <div className="prose prose-stone max-w-none prose-headings:font-heading prose-headings:text-primary prose-a:text-primary prose-a:underline-offset-4 prose-strong:text-primary-dark prose-p:leading-relaxed prose-p:text-stone">
                  <PortableText value={lugar.description as PortableTextBlock[]} />
                </div>
              )}
            </div>

            {/* Sidebar — ficha técnica */}
            <aside className="space-y-4">
              <div className="bg-cream rounded-2xl border border-stone/10 overflow-hidden shadow-sm">
                {/* Sidebar header */}
                <div className="bg-primary px-5 py-4">
                  <h2 className="font-heading font-semibold text-white text-base tracking-wide uppercase text-sm">
                    Ficha Técnica
                  </h2>
                </div>

                <div className="p-5 space-y-5">
                  {lugar.schedule && (
                    <div className="flex gap-3.5">
                      <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Clock className="w-4.5 h-4.5 text-primary" />
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
                        <DollarSign className="w-4.5 h-4.5 text-secondary" />
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
                        <MapPin className="w-4.5 h-4.5 text-accent" />
                      </div>
                      <div>
                        <dt className="text-[11px] text-stone uppercase tracking-widest font-semibold mb-0.5">Dirección</dt>
                        <dd className="text-sm text-stone leading-snug">{lugar.address}</dd>
                      </div>
                    </div>
                  )}

                  {lugar.recommendations && (
                    <div className="flex gap-3.5">
                      <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                        <Star className="w-4.5 h-4.5 text-amber-600" />
                      </div>
                      <div>
                        <dt className="text-[11px] text-stone uppercase tracking-widest font-semibold mb-0.5">Recomendaciones</dt>
                        <dd className="text-sm text-stone leading-snug prose prose-sm prose-stone max-w-none">
                          <PortableText value={lugar.recommendations as PortableTextBlock[]} />
                        </dd>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick tip */}
              <div className="bg-primary/5 rounded-xl border border-primary/15 p-4">
                <p className="text-sm text-primary/80 leading-relaxed">
                  💡 Se recomienda visitar en la mañana para aprovechar mejor la luz y evitar el calor del mediodía.
                </p>
              </div>
            </aside>
          </div>

          {/* Map section */}
          {markers.length > 0 && (
            <div className="mt-12 rounded-2xl border border-stone/10 overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 bg-cream border-b border-stone/10 px-6 py-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Map className="w-4 h-4 text-primary" />
                </div>
                <h2 className="font-heading font-semibold text-primary text-lg">
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
