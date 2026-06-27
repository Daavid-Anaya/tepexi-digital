import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PortableText } from '@portabletext/react'
import { getLugarBySlug } from '@/lib/data'

// F-21: ISR — detail pages rarely change; revalidate once per day.
export const revalidate = 86400
import { Container } from '@/components/ui/Container'
import { MapPin, Clock, DollarSign, Star, Map } from 'lucide-react'
import { FichaTecnicaCard } from '@/components/ui/FichaTecnicaCard'
import type { FichaItem } from '@/components/ui/FichaTecnicaCard'
import DynamicImageCarousel from '@/components/gallery/DynamicImageCarousel'
import DynamicLeafletMap from '@/components/map/DynamicLeafletMap'
import { PageHero, PageHeroBackLink } from '@/components/ui/PageHero'
import { HERO_FALLBACKS } from '@/lib/constants'
import { fetchStaticSlugs } from '@/lib/sanity-params'
import { buildSlugMetadata } from '@/lib/metadata'
import { makeDescriptionComponents } from '@/lib/portable-text-components'

interface Props {
  params: Promise<{ slug: string }>
}

export const generateStaticParams = () => fetchStaticSlugs('lugar')

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const lugar = await getLugarBySlug(slug)
  return buildSlugMetadata(slug, 'lugares', lugar ? {
    ...lugar,
    ogImageUrl: lugar.images?.[0]?.url ?? null,
  } : null, 'Lugar turístico')
}

const descriptionComponents = makeDescriptionComponents('primary')

export default async function LugarDetailPage({ params }: Props) {
  const { slug } = await params
  const lugar = await getLugarBySlug(slug)

  if (!lugar) notFound()

  const images = (lugar.images ?? []).map((img) => ({
    url: img.url ?? img.asset?.url ?? '',
    alt: img.alt ?? lugar.title ?? '',
  })).filter((img) => img.url)

  const HERO_FALLBACK = HERO_FALLBACKS.lugares
  const heroImageUrl = images[0]?.url ?? HERO_FALLBACK
  const heroImageAlt = images[0]?.alt ?? `Vista de ${lugar.title}`

  const mapsUrl = lugar.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lugar.address)}`
    : null

  const fichaItems: FichaItem[] = [
    {
      icon: Clock,
      iconColor: 'var(--color-primary, #8B4513)',
      iconBg: 'rgba(139,69,19,0.1)',
      label: 'Horario',
      value: lugar.schedule ?? null,
    },
    {
      icon: DollarSign,
      iconColor: 'var(--color-secondary, #5C7A5C)',
      iconBg: 'rgba(92,122,92,0.1)',
      label: 'Costo',
      value: lugar.cost ?? null,
    },
    {
      icon: MapPin,
      iconColor: 'var(--color-accent, #C0622B)',
      iconBg: 'rgba(192,98,43,0.1)',
      label: 'Dirección',
      value: lugar.address
        ? mapsUrl
          ? (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary underline underline-offset-2 transition-colors"
            >
              {lugar.address}
            </a>
          )
          : lugar.address
        : null,
    },
    {
      icon: Star,
      iconColor: '#D97706',
      iconBg: 'rgb(254,243,199)',
      label: 'Recomendaciones',
      value: lugar.recommendations
        ? (
          <span className="prose prose-sm prose-stone max-w-none">
            <PortableText value={lugar.recommendations} components={descriptionComponents} />
          </span>
        )
        : null,
    },
  ]

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
                    value={lugar.description}
                    components={descriptionComponents}
                  />
                </div>
              )}
            </div>

            {/* Sidebar — ficha técnica */}
            <FichaTecnicaCard
              title="Ficha Técnica"
              headerColor="var(--color-primary, #8B4513)"
              items={fichaItems}
              footer={
                <div className="bg-primary/5 rounded-xl border border-primary/15 p-4">
                  <p className="text-sm text-primary/80 leading-relaxed">
                    💡 Estamos trabajando para completar la información de este lugar, Gracias por su paciencia! ¿Tenés datos o fotos que compartir?{' '}
                    <a href="/contacto" className="underline underline-offset-2 hover:text-primary transition-colors">
                      Contactanos
                    </a>
                    .
                  </p>
                </div>
              }
            />
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
