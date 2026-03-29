import type { Metadata } from 'next'
import Link from 'next/link'
import { Palette } from 'lucide-react'
import { getAllCultura } from '@/lib/data'
import { Container } from '@/components/ui/Container'
import { PlaceGrid } from '@/components/places/PlaceGrid'
import type { PlaceCardProps } from '@/types'

export const metadata: Metadata = {
  title: 'Cultura',
  description: 'Conoce la riqueza cultural de Tepexi de Rodríguez, Puebla.',
}

export default async function CulturaPage() {
  const data = await getAllCultura()

  const places: PlaceCardProps[] = data.map((item) => ({
    title: item.title,
    slug: item.slug.current,
    category: item.category,
    categoryColor: item.categoryColor,
    imageUrl: item.imageUrl,
    imageAlt: item.imageAlt,
    excerpt: item.address ?? undefined,
  }))

  return (
    <>
      {/* Page hero — purple/violet tone for cultura */}
      <section className="relative overflow-hidden py-20" style={{ backgroundColor: '#4A1D6E' }}>
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full" style={{ backgroundColor: '#7B3FA0' }} />
          <div className="absolute -bottom-10 left-1/4 w-56 h-56 rounded-full" style={{ backgroundColor: '#2D0A46' }} />
        </div>

        <Container className="relative">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <span>/</span>
            <span className="text-white/90">Cultura</span>
          </nav>

          <div className="flex items-start gap-5">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
              <Palette className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-4xl md:text-5xl text-white leading-tight mb-3">
                Cultura
              </h1>
              <p className="text-white/75 text-lg max-w-2xl leading-relaxed">
                Sitios arqueológicos, tradiciones vivas, artesanías y el patrimonio ancestral
                de la Mixteca Poblana que persiste a través de los siglos.
              </p>
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-10 flex gap-6 flex-wrap">
            <div className="rounded-xl px-5 py-3 text-white" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <div className="text-2xl font-bold font-heading">{places.length}</div>
              <div className="text-xs text-white/70 uppercase tracking-wide">sitios</div>
            </div>
            <div className="rounded-xl px-5 py-3 text-white" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <div className="text-2xl font-bold font-heading">Prehispánico</div>
              <div className="text-xs text-white/70 uppercase tracking-wide">legado</div>
            </div>
            <div className="rounded-xl px-5 py-3 text-white" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
              <div className="text-2xl font-bold font-heading">Patrimonio</div>
              <div className="text-xs text-white/70 uppercase tracking-wide">categoría</div>
            </div>
          </div>
        </Container>
      </section>

      {/* Grid section */}
      <section className="py-16">
        <Container>
          {places.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: 'rgba(74,29,110,0.1)' }}>
                <Palette className="w-10 h-10" style={{ color: 'rgba(74,29,110,0.4)' }} />
              </div>
              <h2 className="font-heading font-semibold text-xl text-primary mb-2">
                Sin sitios culturales disponibles
              </h2>
              <p className="text-stone max-w-sm mx-auto">
                Pronto encontrarás aquí el rico patrimonio cultural de Tepexi de Rodríguez.
              </p>
            </div>
          ) : (
            <PlaceGrid places={places} basePath="/cultura" />
          )}
        </Container>
      </section>
    </>
  )
}
