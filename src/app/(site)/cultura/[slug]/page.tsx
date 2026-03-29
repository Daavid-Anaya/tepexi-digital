import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { PortableText } from '@portabletext/react'
import type { PortableTextBlock } from '@portabletext/react'
import { getCulturaBySlug } from '@/lib/data'
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

const CULTURAL_TYPE_LABELS: Record<string, string> = {
  'sitio-arqueologico': 'Sitio arqueológico',
  tradicion: 'Tradición',
  artesania: 'Artesanía',
  museo: 'Museo',
  patrimonio: 'Patrimonio',
}

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const item = await getCulturaBySlug(slug)
  if (!item) return { title: 'No encontrado' }
  return {
    title: item.seo?.metaTitle ?? item.title ?? 'Cultura',
    description: item.seo?.metaDescription ?? undefined,
  }
}

export default async function CulturaDetailPage({ params }: Props) {
  const { slug } = await params
  const item = await getCulturaBySlug(slug)

  if (!item) {
    return (
      <Container className="py-20 text-center">
        <p className="text-stone">Elemento no encontrado.</p>
      </Container>
    )
  }

  const images = (item.images ?? []).map((img) => ({
    url: img.url ?? img.asset?.url ?? '',
    alt: img.alt ?? item.title ?? '',
  })).filter((img) => img.url)

  const markers = item.coordinates
    ? [
        {
          id: item._id,
          title: item.title ?? '',
          slug: item.slug?.current ?? slug,
          coordinates: { lat: item.coordinates.lat, lng: item.coordinates.lng },
          category: item.category ?? '',
          categoryColor: item.categoryColor ?? '#BF360C',
          type: 'cultura' as const,
        },
      ]
    : []

  return (
    <>
      <section className="bg-cream py-10">
        <Container>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {item.category && <Badge>{item.category}</Badge>}
            {item.culturalType && (
              <Badge variant="secondary">
                {CULTURAL_TYPE_LABELS[item.culturalType] ?? item.culturalType}
              </Badge>
            )}
          </div>
          <h1 className="font-heading font-bold text-3xl md:text-4xl text-primary">
            {item.title}
          </h1>
          {item.address && <p className="text-stone mt-2">{item.address}</p>}
        </Container>
      </section>

      <section className="py-12">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              {images.length > 0 && <ImageCarousel images={images} />}

              {item.description && (
                <div className="prose prose-stone max-w-none">
                  <PortableText value={item.description as PortableTextBlock[]} />
                </div>
              )}

              {item.recommendations && (
                <div>
                  <h2 className="font-heading font-semibold text-primary text-xl mb-3">
                    Recomendaciones
                  </h2>
                  <p className="text-stone">{item.recommendations}</p>
                </div>
              )}
            </div>

            <aside className="space-y-6">
              <div className="bg-cream rounded-lg p-5 space-y-4 border border-stone/10">
                <h2 className="font-heading font-semibold text-primary text-lg">
                  Ficha técnica
                </h2>

                {item.schedule && (
                  <div>
                    <dt className="text-xs text-stone uppercase tracking-wide font-medium">Horario</dt>
                    <dd className="text-sm mt-0.5">{item.schedule}</dd>
                  </div>
                )}

                {item.cost && (
                  <div>
                    <dt className="text-xs text-stone uppercase tracking-wide font-medium">Costo</dt>
                    <dd className="text-sm mt-0.5">{item.cost}</dd>
                  </div>
                )}

                {item.address && (
                  <div>
                    <dt className="text-xs text-stone uppercase tracking-wide font-medium">Dirección</dt>
                    <dd className="text-sm mt-0.5">{item.address}</dd>
                  </div>
                )}
              </div>
            </aside>
          </div>

          {markers.length > 0 && (
            <div className="mt-10">
              <h2 className="font-heading font-semibold text-primary text-xl mb-4">Ubicación</h2>
              <LeafletMap markers={markers} center={markers[0].coordinates} zoom={16} />
            </div>
          )}
        </Container>
      </section>
    </>
  )
}
