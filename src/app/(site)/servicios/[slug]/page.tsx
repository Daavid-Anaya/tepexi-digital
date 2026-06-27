import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PortableText } from '@portabletext/react'
import { getServicioBySlug } from '@/lib/data'

// F-21: ISR — detail pages rarely change; revalidate once per day.
export const revalidate = 86400
import { Container } from '@/components/ui/Container'
import { MapPin, Clock, DollarSign, Star, Map, ConciergeBell } from 'lucide-react'
import { FichaTecnicaCard } from '@/components/ui/FichaTecnicaCard'
import type { FichaItem } from '@/components/ui/FichaTecnicaCard'
import DynamicImageCarousel from '@/components/gallery/DynamicImageCarousel'
import DynamicLeafletMap from '@/components/map/DynamicLeafletMap'
import { PageHero, PageHeroBackLink } from '@/components/ui/PageHero'
import { HERO_FALLBACKS, CATEGORY_COLORS } from '@/lib/constants'
import { fetchStaticSlugs } from '@/lib/sanity-params'
import { buildSlugMetadata } from '@/lib/metadata'

interface Props {
  params: Promise<{ slug: string }>
}

export const generateStaticParams = () => fetchStaticSlugs('servicio')

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const servicio = await getServicioBySlug(slug)
  return buildSlugMetadata(slug, 'servicios', servicio ? {
    ...servicio,
    ogImageUrl: servicio.images?.[0]?.url ?? null,
  } : null, 'Servicio')
}

export default async function ServicioDetailPage({ params }: Props) {
  const { slug } = await params
  const servicio = await getServicioBySlug(slug)

  if (!servicio) notFound()

  const images = (servicio.images ?? []).map((img) => ({
    url: img.url ?? img.asset?.url ?? '',
    alt: img.alt ?? servicio.title ?? '',
  })).filter((img) => img.url)

  const HERO_FALLBACK = HERO_FALLBACKS.servicios
  const heroImageUrl = images[0]?.url ?? HERO_FALLBACK
  const heroImageAlt = images[0]?.alt ?? servicio.title ?? 'Imagen del servicio'

  const mapsUrl = servicio.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(servicio.address)}`
    : null

  const fichaItems: FichaItem[] = [
    {
      icon: Clock,
      iconColor: CATEGORY_COLORS.servicios,
      iconBg: 'rgba(55,71,79,0.1)',
      label: 'Horario',
      value: servicio.schedule ?? null,
    },
    {
      icon: DollarSign,
      iconColor: 'var(--color-secondary, #5C7A5C)',
      iconBg: 'rgba(92,122,92,0.1)',
      label: 'Costo',
      value: servicio.cost ?? null,
    },
    {
      icon: MapPin,
      iconColor: CATEGORY_COLORS.servicios,
      iconBg: 'rgba(55,71,79,0.1)',
      label: 'Dirección',
      value: servicio.address
        ? mapsUrl
          ? (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary underline underline-offset-2 transition-colors"
            >
              {servicio.address}
            </a>
          )
          : servicio.address
        : null,
    },
    {
      icon: Star,
      iconColor: '#D97706',
      iconBg: 'rgb(254,243,199)',
      label: 'Recomendaciones',
      value: servicio.recommendations
        ? (
          <span className="prose prose-sm prose-stone max-w-none">
            <PortableText value={servicio.recommendations} />
          </span>
        )
        : null,
    },
  ]

  const markers = servicio.coordinates
    ? [
        {
          id: servicio._id,
          title: servicio.title ?? '',
          slug: servicio.slug?.current ?? slug,
          coordinates: { lat: servicio.coordinates.lat, lng: servicio.coordinates.lng },
          category: servicio.category ?? '',
          categoryColor: servicio.categoryColor ?? CATEGORY_COLORS.servicios,
          type: 'servicios' as const,
        },
      ]
    : []

  return (
    <>
      {/* Hero banner */}
      <PageHero imageUrl={heroImageUrl} imageAlt={heroImageAlt} size="compact">
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
                  <PortableText value={servicio.description} />
                </div>
              )}
            </div>

            {/* Sidebar */}
            <FichaTecnicaCard
              title="Información del Servicio"
              headerColor={CATEGORY_COLORS.servicios}
              items={fichaItems}
            />
          </div>

          {/* Map section */}
          {markers.length > 0 && (
            <div className="mt-12 rounded-2xl border border-stone/10 overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 bg-cream border-b border-stone/10 px-6 py-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(55,71,79,0.1)' }}>
                   <Map className="w-4 h-4" style={{ color: CATEGORY_COLORS.servicios }} />
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
