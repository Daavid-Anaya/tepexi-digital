import type { Metadata } from 'next'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import type { PortableTextBlock } from '@portabletext/react'
import { getGastronomiaBySlug } from '@/lib/data'
import { Container } from '@/components/ui/Container'
import { Badge } from '@/components/ui/Badge'
import { ArrowLeft, MapPin, Clock, DollarSign, Utensils, Map, ChefHat } from 'lucide-react'
import DynamicImageCarousel from '@/components/gallery/DynamicImageCarousel'
import DynamicLeafletMap from '@/components/map/DynamicLeafletMap'

const PRICE_RANGE_LABELS: Record<string, string> = {
  bajo: 'Económico',
  medio: 'Precio medio',
  alto: 'Premium',
}

const PRICE_RANGE_SYMBOLS: Record<string, { symbols: string; active: number }> = {
  bajo: { symbols: '$$$', active: 1 },
  medio: { symbols: '$$$', active: 2 },
  alto: { symbols: '$$$', active: 3 },
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
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
          <Utensils className="w-8 h-8 text-accent/40" />
        </div>
        <h1 className="font-heading font-semibold text-xl text-primary mb-2">Elemento no encontrado</h1>
        <p className="text-stone mb-6">No pudimos encontrar este lugar gastronómico.</p>
        <Link
          href="/gastronomia"
          className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Gastronomía
        </Link>
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

  const priceInfo = item.priceRange ? PRICE_RANGE_SYMBOLS[item.priceRange] : null

  return (
    <>
      {/* Hero banner — warm orange accent */}
      <section className="relative overflow-hidden bg-accent py-14">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-12 -left-12 w-64 h-64 rounded-full bg-accent-light" />
          <div className="absolute bottom-0 right-1/3 w-40 h-40 rounded-full bg-primary" />
        </div>

        <Container className="relative">
          {/* Back navigation */}
          <Link
            href="/gastronomia"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            Volver a Gastronomía
          </Link>

          {/* Category badges */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {item.category && (
              <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/25">
                <Utensils className="w-3 h-3" />
                {item.category}
              </span>
            )}
            {item.dishType && (
              <span className="inline-flex items-center bg-white/15 text-white/90 text-xs font-medium px-3 py-1.5 rounded-full">
                {item.dishType}
              </span>
            )}
          </div>

          <h1 className="font-heading font-bold text-3xl md:text-5xl text-white leading-tight mb-3">
            {item.title}
          </h1>

          {item.address && (
            <p className="flex items-center gap-2 text-white/70 mt-3">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span>{item.address}</span>
            </p>
          )}

          {/* Price range visual */}
          {item.priceRange && priceInfo && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-white/60 text-sm">{PRICE_RANGE_LABELS[item.priceRange]}</span>
              <div className="flex gap-0.5">
                {['$', '$', '$'].map((s, i) => (
                  <span
                    key={i}
                    className={i < priceInfo.active ? 'text-white font-bold text-lg' : 'text-white/30 text-lg'}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
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
              {item.description && (
                <div className="prose prose-stone max-w-none prose-headings:font-heading prose-headings:text-primary prose-a:text-accent prose-a:underline-offset-4 prose-strong:text-primary-dark prose-p:leading-relaxed prose-p:text-stone">
                  <PortableText value={item.description as PortableTextBlock[]} />
                </div>
              )}

              {/* Featured dishes */}
              {item.featuredDishes && item.featuredDishes.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <ChefHat className="w-5 h-5 text-accent" />
                    <h2 className="font-heading font-semibold text-primary text-xl">
                      Platillos destacados
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {item.featuredDishes.map((dish: string, i: number) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 bg-cream rounded-xl border border-stone/10 px-4 py-3"
                      >
                        <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                          <Utensils className="w-3.5 h-3.5 text-accent" />
                        </div>
                        <span className="text-sm font-medium text-stone">{dish}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-4">
              <div className="bg-cream rounded-2xl border border-stone/10 overflow-hidden shadow-sm">
                {/* Sidebar header */}
                <div className="bg-accent px-5 py-4">
                  <h2 className="font-heading font-semibold text-white text-sm tracking-wide uppercase">
                    Información
                  </h2>
                </div>

                <div className="p-5 space-y-5">
                  {item.schedule && (
                    <div className="flex gap-3.5">
                      <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <dt className="text-[11px] text-stone uppercase tracking-widest font-semibold mb-0.5">Horario</dt>
                        <dd className="text-sm text-stone leading-snug">{item.schedule}</dd>
                      </div>
                    </div>
                  )}

                  {item.cost && (
                    <div className="flex gap-3.5">
                      <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-secondary" />
                      </div>
                      <div>
                        <dt className="text-[11px] text-stone uppercase tracking-widest font-semibold mb-0.5">Precio aproximado</dt>
                        <dd className="text-sm text-stone leading-snug">{item.cost}</dd>
                      </div>
                    </div>
                  )}

                  {item.address && (
                    <div className="flex gap-3.5">
                      <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-accent" />
                      </div>
                      <div>
                        <dt className="text-[11px] text-stone uppercase tracking-widest font-semibold mb-0.5">Dirección</dt>
                        <dd className="text-sm text-stone leading-snug">{item.address}</dd>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Dish type tags */}
              {item.dishType && (
                <div className="bg-cream rounded-xl border border-stone/10 p-4">
                  <p className="text-xs text-stone uppercase tracking-wide font-semibold mb-2">Tipo de cocina</p>
                  <span className="inline-flex items-center bg-accent/10 text-accent text-xs font-medium px-3 py-1 rounded-full">
                    {item.dishType}
                  </span>
                </div>
              )}
            </aside>
          </div>

          {/* Map section */}
          {markers.length > 0 && (
            <div className="mt-12 rounded-2xl border border-stone/10 overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 bg-cream border-b border-stone/10 px-6 py-4">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Map className="w-4 h-4 text-accent" />
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
