import type { Metadata } from 'next'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import type { PortableTextBlock } from '@portabletext/react'
import { getServicioBySlug } from '@/lib/data'
import { Container } from '@/components/ui/Container'
import { ArrowLeft, MapPin, Clock, DollarSign, Star, Map, ConciergeBell } from 'lucide-react'
import DynamicImageCarousel from '@/components/gallery/DynamicImageCarousel'
import DynamicLeafletMap from '@/components/map/DynamicLeafletMap'
import { PageHero, PageHeroBackLink } from '@/components/ui/PageHero'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const servicio = await getServicioBySlug(slug)
  if (!servicio) return { title: 'Servicio no encontrado' }
  return {
    title: servicio.seo?.metaTitle ?? servicio.title ?? 'Servicio',
    description: servicio.seo?.metaDescription ?? undefined,
  }
}

export default async function ServicioDetailPage({ params }: Props) {
  const { slug } = await params
  const servicio = await getServicioBySlug(slug)

  if (!servicio) {
    return (
      <Container className="py-20 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(55,71,79,0.1)' }}>
          <ConciergeBell className="w-8 h-8" style={{ color: 'rgba(55,71,79,0.4)' }} />
        </div>
        <h1 className="font-heading font-semibold text-xl text-primary mb-2">Servicio no encontrado</h1>
        <p className="text-stone mb-6">No pudimos encontrar este servicio.</p>
        <Link
          href="/mapa"
          className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Mapa
        </Link>
      </Container>
    )
  }

  const images = (servicio.images ?? []).map((img) => ({
    url: img.url ?? img.asset?.url ?? '',
    alt: img.alt ?? servicio.title ?? '',
  })).filter((img) => img.url)

  const markers = servicio.coordinates
    ? [
        {
          id: servicio._id,
          title: servicio.title ?? '',
          slug: servicio.slug?.current ?? slug,
          coordinates: { lat: servicio.coordinates.lat, lng: servicio.coordinates.lng },
          category: servicio.category ?? '',
          categoryColor: servicio.categoryColor ?? '#37474F',
          type: 'servicios' as const,
        },
      ]
    : []

  return (
    <>
      {/* Hero banner */}
      <PageHero imageUrl="/images/servicios/img-hero-servicios.jpg" imageAlt="Imagen hero de servicio" size="compact">
        <PageHeroBackLink href="/mapa" label="Volver al Mapa" />

        {/* Category badge */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {servicio.category && (
            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/25">
              <ConciergeBell className="w-3 h-3" />
              {servicio.category}
            </span>
          )}
        </div>

        <h1 className="font-heading font-bold text-3xl md:text-5xl text-white leading-tight mb-3">
          {servicio.title}
        </h1>

        {servicio.address && (
          <p className="flex items-center gap-2 text-white/70 mt-3">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span>{servicio.address}</span>
          </p>
        )}
      </PageHero>

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
              {servicio.description && (
                <div className="prose prose-stone max-w-none prose-headings:font-heading prose-headings:text-primary prose-a:underline-offset-4 prose-strong:text-primary-dark prose-p:leading-relaxed prose-p:text-stone">
                  <PortableText value={servicio.description as PortableTextBlock[]} />
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-4">
              <div className="bg-cream rounded-2xl border border-stone/10 overflow-hidden shadow-sm">
                {/* Sidebar header */}
                <div className="px-5 py-4" style={{ backgroundColor: '#37474F' }}>
                  <h2 className="font-heading font-semibold text-white text-sm tracking-wide uppercase">
                    Informacion del Servicio
                  </h2>
                </div>

                <div className="p-5 space-y-5">
                  {servicio.schedule && (
                    <div className="flex gap-3.5">
                      <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(55,71,79,0.1)' }}>
                        <Clock className="w-4 h-4" style={{ color: '#37474F' }} />
                      </div>
                      <div>
                        <dt className="text-[11px] text-stone uppercase tracking-widest font-semibold mb-0.5">Horario</dt>
                        <dd className="text-sm text-stone leading-snug">{servicio.schedule}</dd>
                      </div>
                    </div>
                  )}

                  {servicio.cost && (
                    <div className="flex gap-3.5">
                      <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-secondary" />
                      </div>
                      <div>
                        <dt className="text-[11px] text-stone uppercase tracking-widest font-semibold mb-0.5">Costo</dt>
                        <dd className="text-sm text-stone leading-snug">{servicio.cost}</dd>
                      </div>
                    </div>
                  )}

                  {servicio.address && (
                    <div className="flex gap-3.5">
                      <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(55,71,79,0.1)' }}>
                        <MapPin className="w-4 h-4" style={{ color: '#37474F' }} />
                      </div>
                      <div>
                        <dt className="text-[11px] text-stone uppercase tracking-widest font-semibold mb-0.5">Direccion</dt>
                        <dd className="text-sm text-stone leading-snug">{servicio.address}</dd>
                      </div>
                    </div>
                  )}

                  {servicio.recommendations && (
                    <div className="flex gap-3.5">
                      <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                        <Star className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <dt className="text-[11px] text-stone uppercase tracking-widest font-semibold mb-0.5">Recomendaciones</dt>
                        <dd className="text-sm text-stone leading-snug prose prose-sm prose-stone max-w-none">
                          <PortableText value={servicio.recommendations as PortableTextBlock[]} />
                        </dd>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>

          {/* Map section */}
          {markers.length > 0 && (
            <div className="mt-12 rounded-2xl border border-stone/10 overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 bg-cream border-b border-stone/10 px-6 py-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(55,71,79,0.1)' }}>
                  <Map className="w-4 h-4" style={{ color: '#37474F' }} />
                </div>
                <h2 className="font-heading font-semibold text-text-primary text-lg">
                  Ubicacion
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
