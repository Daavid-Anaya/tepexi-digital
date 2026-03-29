import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { PortableText } from '@portabletext/react'
import type { PortableTextBlock } from '@portabletext/react'
import { getGastronomiaBySlug } from '@/lib/data'
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

const PRICE_RANGE_LABELS: Record<string, string> = {
  bajo: 'Económico',
  medio: 'Precio medio',
  alto: 'Premium',
}

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const item = await getGastronomiaBySlug(slug)
  if (!item) return { title: 'No encontrado' }
  return {
    title: item.seo?.metaTitle ?? item.title ?? 'Gastronomía',
    description: item.seo?.metaDescription ?? undefined,
  }
}

export default async function GastronomiaDetailPage({ params }: Props) {
  const { slug } = await params
  const item = await getGastronomiaBySlug(slug)

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
          categoryColor: item.categoryColor ?? '#2E7D32',
          type: 'gastronomia' as const,
        },
      ]
    : []

  return (
    <>
      <section className="bg-cream py-10">
        <Container>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {item.category && <Badge>{item.category}</Badge>}
            {item.dishType && <Badge variant="secondary">{item.dishType}</Badge>}
            {item.priceRange && (
              <Badge variant="accent">
                {PRICE_RANGE_LABELS[item.priceRange] ?? item.priceRange}
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

              {/* Featured dishes */}
              {item.featuredDishes && item.featuredDishes.length > 0 && (
                <div>
                  <h2 className="font-heading font-semibold text-primary text-xl mb-3">
                    Platillos destacados
                  </h2>
                  <ul className="list-disc list-inside space-y-1 text-stone">
                    {item.featuredDishes.map((dish: string, i: number) => (
                      <li key={i}>{dish}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <aside className="space-y-6">
              <div className="bg-cream rounded-lg p-5 space-y-4 border border-stone/10">
                <h2 className="font-heading font-semibold text-primary text-lg">
                  Información
                </h2>

                {item.schedule && (
                  <div>
                    <dt className="text-xs text-stone uppercase tracking-wide font-medium">Horario</dt>
                    <dd className="text-sm mt-0.5">{item.schedule}</dd>
                  </div>
                )}

                {item.cost && (
                  <div>
                    <dt className="text-xs text-stone uppercase tracking-wide font-medium">Precio aproximado</dt>
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
