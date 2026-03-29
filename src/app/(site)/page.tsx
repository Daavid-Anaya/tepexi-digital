import type { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { PlaceGrid } from '@/components/places/PlaceGrid'
import { EventCard } from '@/components/events/EventCard'
import { getAllLugares, getAllGastronomia, getUpcomingEventos } from '@/lib/data'
import type { PlaceCardProps, EventCardProps } from '@/types'

export const metadata: Metadata = {
  title: 'Inicio',
  description:
    'Descubre la riqueza turística, cultural y gastronómica de Tepexi de Rodríguez, Puebla.',
}

export default async function HomePage() {
  const [lugaresData, gastronomiaData, eventosData] = await Promise.all([
    getAllLugares(),
    getAllGastronomia(),
    getUpcomingEventos(),
  ])

  const featuredLugares: PlaceCardProps[] = lugaresData.slice(0, 3).map((l) => ({
    title: l.title,
    slug: l.slug.current,
    category: l.category,
    categoryColor: l.categoryColor,
    imageUrl: l.imageUrl,
    imageAlt: l.imageAlt,
    excerpt: l.address ?? undefined,
  }))

  const featuredGastronomia: PlaceCardProps[] = gastronomiaData.slice(0, 3).map((g) => ({
    title: g.title,
    slug: g.slug.current,
    category: g.category,
    categoryColor: g.categoryColor,
    imageUrl: g.imageUrl,
    imageAlt: g.imageAlt,
    excerpt: g.address ?? undefined,
  }))

  const upcomingEvents: EventCardProps[] = eventosData.slice(0, 3).map((e) => ({
    title: e.title,
    slug: e.slug.current,
    date: e.date,
    endDate: e.endDate ?? undefined,
    location: e.locationName ?? e.locationText ?? undefined,
    imageUrl: e.imageUrl ?? undefined,
    imageAlt: e.imageAlt ?? undefined,
    isFeatured: e.isFeatured,
  }))

  return (
    <>
      {/* Hero */}
      <section className="relative bg-cream py-24 md:py-36">
        <Container className="text-center">
          <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-primary leading-tight mb-6">
            Descubre Tepexi de Rodríguez
          </h1>
          <p className="text-stone text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Explora la riqueza turística, cultural y gastronómica de nuestro municipio
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="primary" size="lg">
              <Link href="/lugares">Explorar lugares</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/mapa">Ver mapa</Link>
            </Button>
          </div>
        </Container>
      </section>

      {/* Featured places */}
      <section className="py-20">
        <Container>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-heading font-bold text-3xl text-primary mb-2">
                Lugares destacados
              </h2>
              <p className="text-stone">
                Sitios naturales e históricos que no te puedes perder
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/lugares">Ver todos</Link>
            </Button>
          </div>
          {featuredLugares.length > 0 && (
            <PlaceGrid places={featuredLugares} basePath="/lugares" />
          )}
        </Container>
      </section>

      {/* Events */}
      <section className="bg-cream py-20">
        <Container>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-heading font-bold text-3xl text-primary mb-2">
                Agenda cultural
              </h2>
              <p className="text-stone">
                Próximas celebraciones y eventos del municipio
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/agenda">Ver agenda</Link>
            </Button>
          </div>
          {upcomingEvents.length > 0 && (
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <EventCard key={event.slug} {...event} />
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* Gastronomy */}
      <section className="py-20">
        <Container>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-heading font-bold text-3xl text-primary mb-2">
                Gastronomía local
              </h2>
              <p className="text-stone">
                Sabores de la Mixteca Poblana que debes probar
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/gastronomia">Ver gastronomía</Link>
            </Button>
          </div>
          {featuredGastronomia.length > 0 && (
            <PlaceGrid places={featuredGastronomia} basePath="/gastronomia" />
          )}
        </Container>
      </section>
    </>
  )
}
