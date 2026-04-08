import type { Metadata } from 'next'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import type { PortableTextBlock } from '@portabletext/react'
import { mockCultura } from '@/lib/mock-data'
import { Container } from '@/components/ui/Container'
import { ArrowLeft, MapPin, Clock, DollarSign, Star, Map, Palette } from 'lucide-react'
import DynamicImageCarousel from '@/components/gallery/DynamicImageCarousel'
import DynamicLeafletMap from '@/components/map/DynamicLeafletMap'

const CULTURAL_TYPE_LABELS: Record<string, string> = {
  'sitio-arqueologico': 'Sitio arqueológico',
  tradicion: 'Tradición',
  artesania: 'Artesanía',
  museo: 'Museo',
  patrimonio: 'Patrimonio',
}

const CULTURAL_TYPE_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  'sitio-arqueologico': { bg: 'rgba(74,29,110,0.15)', text: '#4A1D6E', icon: 'rgba(74,29,110,0.9)' },
  tradicion: { bg: 'rgba(191,54,12,0.1)', text: '#BF360C', icon: 'rgba(191,54,12,0.8)' },
  artesania: { bg: 'rgba(139,69,19,0.1)', text: '#8B4513', icon: 'rgba(139,69,19,0.8)' },
  museo: { bg: 'rgba(46,125,50,0.1)', text: '#2E7D32', icon: 'rgba(46,125,50,0.8)' },
  patrimonio: { bg: 'rgba(74,29,110,0.15)', text: '#4A1D6E', icon: 'rgba(74,29,110,0.9)' },
}

interface Props {
  params: Promise<{ slug: string }>
}

function findCulturaBySlug(slug: string) {
  return mockCultura.find((c) => c.slug.current === slug) ?? null
}

function stringToPortableText(text: string | null): PortableTextBlock[] | null {
  if (!text) return null
  return [
    {
      _type: 'block',
      _key: `mock-rec-${Date.now()}`,
      style: 'normal',
      children: [{ _type: 'span', text, marks: [] as string[] }],
      markDefs: [],
    },
  ] as unknown as PortableTextBlock[]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const item = findCulturaBySlug(slug)
  if (!item) return { title: 'No encontrado' }
  return {
    title: item.seo?.metaTitle ?? item.title ?? 'Cultura',
    description: item.seo?.metaDescription ?? undefined,
  }
}

export default async function CulturaDetailPage({ params }: Props) {
  const { slug } = await params
  const item = findCulturaBySlug(slug)

  if (!item) {
    return (
      <Container className="py-20 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(74,29,110,0.1)' }}>
          <Palette className="w-8 h-8" style={{ color: 'rgba(74,29,110,0.4)' }} />
        </div>
        <h1 className="font-heading font-semibold text-xl text-primary mb-2">Elemento no encontrado</h1>
        <p className="text-stone mb-6">No pudimos encontrar este sitio cultural.</p>
        <Link
          href="/cultura"
          className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Cultura
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
          categoryColor: item.categoryColor ?? '#BF360C',
          type: 'cultura' as const,
        },
      ]
    : []

  const culturalTypeColors = item.culturalType ? CULTURAL_TYPE_COLORS[item.culturalType] : null

  return (
    <>
      {/* Hero banner — purple/violet for cultura */}
      <section className="relative overflow-hidden py-14" style={{ backgroundColor: '#4A1D6E' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full" style={{ backgroundColor: '#7B3FA0' }} />
          <div className="absolute bottom-0 left-1/3 w-40 h-40 rounded-full" style={{ backgroundColor: '#2D0A46' }} />
        </div>

        <Container className="relative">
          {/* Back navigation */}
          <Link
            href="/cultura"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            Volver a Cultura
          </Link>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {item.category && (
              <span className="inline-flex items-center gap-1.5 text-white text-xs font-medium px-3 py-1.5 rounded-full border" style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.25)' }}>
                <Palette className="w-3 h-3" />
                {item.category}
              </span>
            )}
            {item.culturalType && (
              <span className="inline-flex items-center text-white/90 text-xs font-medium px-3 py-1.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                {CULTURAL_TYPE_LABELS[item.culturalType] ?? item.culturalType}
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
                <div className="prose prose-stone max-w-none prose-headings:font-heading prose-headings:text-primary prose-a:underline-offset-4 prose-strong:text-primary-dark prose-p:leading-relaxed prose-p:text-stone">
                  <PortableText value={item.description as PortableTextBlock[]} />
                </div>
              )}

              {/* Recommendations */}
              {item.recommendations && (
                <div className="bg-cream rounded-xl border border-stone/10 p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-5 h-5 text-amber-500" />
                    <h2 className="font-heading font-semibold text-primary text-lg">
                      Recomendaciones
                    </h2>
                  </div>
                  <div className="text-stone leading-relaxed prose prose-sm prose-stone max-w-none">
                    <PortableText value={stringToPortableText(item.recommendations)!} />
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-4">
              <div className="bg-cream rounded-2xl border border-stone/10 overflow-hidden shadow-sm">
                {/* Sidebar header */}
                <div className="px-5 py-4" style={{ backgroundColor: '#4A1D6E' }}>
                  <h2 className="font-heading font-semibold text-white text-sm tracking-wide uppercase">
                    Ficha Técnica
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
                        <dt className="text-[11px] text-stone uppercase tracking-widest font-semibold mb-0.5">Costo</dt>
                        <dd className="text-sm text-stone leading-snug">{item.cost}</dd>
                      </div>
                    </div>
                  )}

                  {item.address && (
                    <div className="flex gap-3.5">
                      <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(74,29,110,0.1)' }}>
                        <MapPin className="w-4 h-4" style={{ color: '#4A1D6E' }} />
                      </div>
                      <div>
                        <dt className="text-[11px] text-stone uppercase tracking-widest font-semibold mb-0.5">Dirección</dt>
                        <dd className="text-sm text-stone leading-snug">{item.address}</dd>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Cultural type descriptive badge */}
              {item.culturalType && (
                <div className="rounded-xl border border-stone/10 p-4 bg-cream">
                  <p className="text-xs text-stone uppercase tracking-wide font-semibold mb-3">Tipo de sitio</p>
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: culturalTypeColors?.bg ?? 'rgba(74,29,110,0.1)',
                      color: culturalTypeColors?.text ?? '#4A1D6E',
                    }}
                  >
                    <Palette className="w-4 h-4" />
                    {CULTURAL_TYPE_LABELS[item.culturalType] ?? item.culturalType}
                  </div>
                </div>
              )}
            </aside>
          </div>

          {/* Map section */}
          {markers.length > 0 && (
            <div className="mt-12 rounded-2xl border border-stone/10 overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 bg-cream border-b border-stone/10 px-6 py-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(74,29,110,0.1)' }}>
                  <Map className="w-4 h-4" style={{ color: '#4A1D6E' }} />
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
