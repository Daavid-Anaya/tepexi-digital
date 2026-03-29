import type { Metadata } from 'next'
import { getAllLugares } from '@/lib/data'
import { Container } from '@/components/ui/Container'
import { PlaceGrid } from '@/components/places/PlaceGrid'
import type { PlaceCardProps } from '@/types'

export const metadata: Metadata = {
  title: 'Lugares Turísticos',
  description: 'Descubre los lugares turísticos de Tepexi de Rodríguez, Puebla.',
}

export default async function LugaresPage() {
  const data = await getAllLugares()

  const places: PlaceCardProps[] = data.map((lugar) => ({
    title: lugar.title,
    slug: lugar.slug.current,
    category: lugar.category,
    categoryColor: lugar.categoryColor,
    imageUrl: lugar.imageUrl,
    imageAlt: lugar.imageAlt,
    excerpt: lugar.address ?? undefined,
  }))

  return (
    <>
      <section className="bg-cream py-16">
        <Container>
          <h1 className="font-heading font-bold text-4xl text-primary mb-3">
            Lugares Turísticos
          </h1>
          <p className="text-stone text-lg max-w-2xl">
            Explora los sitios más representativos de Tepexi de Rodríguez.
          </p>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          {places.length === 0 ? (
            <p className="text-stone text-center py-12">
              No hay lugares disponibles por el momento.
            </p>
          ) : (
            <PlaceGrid places={places} basePath="/lugares" />
          )}
        </Container>
      </section>
    </>
  )
}
