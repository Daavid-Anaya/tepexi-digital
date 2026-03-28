import type { Metadata } from 'next'
import { sanityFetch } from '@/sanity/lib/live'
import { allGastronomiaQuery } from '@/sanity/queries/gastronomia'
import { Container } from '@/components/ui/Container'
import { PlaceGrid } from '@/components/places/PlaceGrid'

export const metadata: Metadata = {
  title: 'Gastronomía',
  description: 'Conoce la gastronomía típica de Tepexi de Rodríguez, Puebla.',
}

export default async function GastronomiaPage() {
  const { data } = await sanityFetch({ query: allGastronomiaQuery })

  type GastronomiaItem = NonNullable<typeof data>[number]
  const places = (data ?? []).map((item: GastronomiaItem) => ({
    title: item.title ?? '',
    slug: item.slug?.current ?? '',
    category: item.category ?? 'Sin categoría',
    categoryColor: item.categoryColor ?? undefined,
    imageUrl: item.imageUrl ?? '',
    imageAlt: item.imageAlt ?? item.title ?? '',
    excerpt: item.address ?? undefined,
  }))

  return (
    <>
      <section className="bg-cream py-16">
        <Container>
          <h1 className="font-heading font-bold text-4xl text-primary mb-3">
            Gastronomía
          </h1>
          <p className="text-stone text-lg max-w-2xl">
            Descubre los sabores tradicionales de Tepexi de Rodríguez.
          </p>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          {places.length === 0 ? (
            <p className="text-stone text-center py-12">
              No hay gastronomía disponible por el momento.
            </p>
          ) : (
            <PlaceGrid places={places} basePath="/gastronomia" />
          )}
        </Container>
      </section>
    </>
  )
}
