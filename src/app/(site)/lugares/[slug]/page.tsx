import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { PortableText } from '@portabletext/react'
import { sanityFetch } from '@/sanity/lib/live'
import { lugarBySlugQuery } from '@/sanity/queries/lugares'
import { urlFor } from '@/sanity/lib/image'
import { Container } from '@/components/ui/Container'
import { Badge } from '@/components/ui/Badge'

const ImageCarousel = dynamic(() => import('@/components/gallery/ImageCarousel'), {
  ssr: false,
  loading: () => <div className="w-full aspect-video bg-sand animate-pulse rounded-lg" />,
})

const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), {
  ssr: false,
  loading: () => <div className="w-full h-[400px] bg-sand animate-pulse rounded-lg" />,
})

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { data } = await sanityFetch({ query: lugarBySlugQuery, params: { slug } })
  if (!data) return { title: 'Lugar no encontrado' }
  return {
    title: data.seo?.metaTitle ?? data.title ?? 'Lugar turístico',
    description: data.seo?.metaDescription ?? undefined,
  }
}

export default async function LugarDetailPage({ params }: Props) {
  const { slug } = await params
  const { data: lugar } = await sanityFetch({ query: lugarBySlugQuery, params: { slug } })

  if (!lugar) {
    return (
      <Container className="py-20 text-center">
        <p className="text-stone">Lugar no encontrado.</p>
      </Container>
    )
  }

  const images = (lugar.images ?? [])
    .filter((img: { asset?: { url?: string }; alt?: string }) => img?.asset?.url)
    .map((img: { asset?: { url?: string }; alt?: string }) => ({
      url: urlFor(img).width(1200).url(),
      alt: img.alt ?? lugar.title ?? '',
    }))

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
      {/* Header */}
      <section className="bg-cream py-10">
        <Container>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {lugar.category && <Badge>{lugar.category}</Badge>}
          </div>
          <h1 className="font-heading font-bold text-3xl md:text-4xl text-primary">
            {lugar.title}
          </h1>
          {lugar.address && (
            <p className="text-stone mt-2">{lugar.address}</p>
          )}
        </Container>
      </section>

      <section className="py-12">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Image carousel */}
              {images.length > 0 && <ImageCarousel images={images} />}

              {/* Description */}
              {lugar.description && (
                <div className="prose prose-stone max-w-none">
                  <PortableText value={lugar.description} />
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Ficha técnica */}
              <div className="bg-cream rounded-lg p-5 space-y-4 border border-stone/10">
                <h2 className="font-heading font-semibold text-primary text-lg">
                  Ficha técnica
                </h2>

                {lugar.schedule && (
                  <div>
                    <dt className="text-xs text-stone uppercase tracking-wide font-medium">Horario</dt>
                    <dd className="text-sm mt-0.5">{lugar.schedule}</dd>
                  </div>
                )}

                {lugar.cost && (
                  <div>
                    <dt className="text-xs text-stone uppercase tracking-wide font-medium">Costo</dt>
                    <dd className="text-sm mt-0.5">{lugar.cost}</dd>
                  </div>
                )}

                {lugar.address && (
                  <div>
                    <dt className="text-xs text-stone uppercase tracking-wide font-medium">Dirección</dt>
                    <dd className="text-sm mt-0.5">{lugar.address}</dd>
                  </div>
                )}

                {lugar.recommendations && (
                  <div>
                    <dt className="text-xs text-stone uppercase tracking-wide font-medium">Recomendaciones</dt>
                    <dd className="text-sm mt-0.5">{lugar.recommendations}</dd>
                  </div>
                )}
              </div>
            </aside>
          </div>

          {/* Map */}
          {markers.length > 0 && (
            <div className="mt-10">
              <h2 className="font-heading font-semibold text-primary text-xl mb-4">
                Ubicación
              </h2>
              <LeafletMap markers={markers} center={markers[0].coordinates} zoom={16} />
            </div>
          )}
        </Container>
      </section>
    </>
  )
}
