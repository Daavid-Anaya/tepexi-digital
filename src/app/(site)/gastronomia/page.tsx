import type { Metadata } from 'next'
import Link from 'next/link'
import { Utensils } from 'lucide-react'
import { getAllGastronomia } from '@/lib/data'
import { Container } from '@/components/ui/Container'
import { PlaceGrid } from '@/components/places/PlaceGrid'
import type { PlaceCardProps } from '@/types'

export const metadata: Metadata = {
  title: 'Gastronomía',
  description: 'Conoce la gastronomía típica de Tepexi de Rodríguez, Puebla.',
}

export default async function GastronomiaPage() {
  const data = await getAllGastronomia()

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
      {/* Page hero — warm orange/red accent for gastronomía */}
      <section className="relative overflow-hidden bg-accent py-20">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -left-10 w-72 h-72 rounded-full bg-accent-light" />
          <div className="absolute bottom-0 right-1/3 w-48 h-48 rounded-full bg-primary" />
        </div>

        <Container className="relative">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <span>/</span>
            <span className="text-white/90">Gastronomía</span>
          </nav>

          <div className="flex items-start gap-5">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
              <Utensils className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-4xl md:text-5xl text-white leading-tight mb-3">
                Gastronomía
              </h1>
              <p className="text-white/75 text-lg max-w-2xl leading-relaxed">
                Descubre los sabores tradicionales de la Mixteca Poblana — mole negro,
                chiles secos, tlayudas y los platillos que han alimentado generaciones.
              </p>
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-10 flex gap-6 flex-wrap">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 text-white">
              <div className="text-2xl font-bold font-heading">{places.length}</div>
              <div className="text-xs text-white/70 uppercase tracking-wide">lugares</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 text-white">
              <div className="text-2xl font-bold font-heading">Mixteca</div>
              <div className="text-xs text-white/70 uppercase tracking-wide">cocina</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 text-white">
              <div className="text-2xl font-bold font-heading">Artesanal</div>
              <div className="text-xs text-white/70 uppercase tracking-wide">tradición</div>
            </div>
          </div>
        </Container>
      </section>

      {/* Grid section */}
      <section className="py-16">
        <Container>
          {places.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-5">
                <Utensils className="w-10 h-10 text-accent/50" />
              </div>
              <h2 className="font-heading font-semibold text-xl text-primary mb-2">
                Sin restaurantes disponibles
              </h2>
              <p className="text-stone max-w-sm mx-auto">
                Pronto encontrarás aquí los mejores lugares para degustar la gastronomía de Tepexi.
              </p>
            </div>
          ) : (
            <PlaceGrid places={places} basePath="/gastronomia" />
          )}
        </Container>
      </section>
    </>
  )
}
