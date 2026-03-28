import type { Metadata } from 'next'
import { sanityFetch } from '@/sanity/lib/live'
import { upcomingEventosQuery } from '@/sanity/queries/eventos'
import { Container } from '@/components/ui/Container'
import { EventCard } from '@/components/events/EventCard'
import type { EventCardProps } from '@/types'

export const metadata: Metadata = {
  title: 'Agenda de Eventos',
  description: 'Próximos eventos y actividades en Tepexi de Rodríguez, Puebla.',
}

export default async function AgendaPage() {
  const now = new Date().toISOString()
  const { data } = await sanityFetch({
    query: upcomingEventosQuery,
    params: { now, limit: 50 },
  })

  type EventoItem = NonNullable<typeof data>[number]
  const events: EventCardProps[] = (data ?? []).map((evento: EventoItem) => ({
    title: evento.title ?? '',
    slug: evento.slug?.current ?? '',
    date: evento.date ?? '',
    endDate: evento.endDate ?? undefined,
    location: evento.locationName ?? evento.locationText ?? undefined,
    imageUrl: evento.imageUrl ?? undefined,
    imageAlt: evento.imageAlt ?? undefined,
    isFeatured: evento.isFeatured ?? false,
  }))

  // Group featured events first
  const featured = events.filter((e: EventCardProps) => e.isFeatured)
  const regular = events.filter((e: EventCardProps) => !e.isFeatured)

  return (
    <>
      <section className="bg-cream py-16">
        <Container>
          <h1 className="font-heading font-bold text-4xl text-primary mb-3">
            Agenda de Eventos
          </h1>
          <p className="text-stone text-lg max-w-2xl">
            Próximos eventos culturales y celebraciones de Tepexi de Rodríguez.
          </p>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          {events.length === 0 ? (
            <p className="text-stone text-center py-12">
              No hay eventos disponibles por el momento.
            </p>
          ) : (
            <div className="space-y-10">
              {/* Featured events */}
              {featured.length > 0 && (
                <div>
                  <h2 className="font-heading font-semibold text-primary text-2xl mb-5">
                    Eventos destacados
                  </h2>
                  <div className="space-y-4">
                    {featured.map((event: EventCardProps) => (
                      <EventCard key={event.slug} {...event} />
                    ))}
                  </div>
                </div>
              )}

              {/* Regular events */}
              {regular.length > 0 && (
                <div>
                  <h2 className="font-heading font-semibold text-primary text-2xl mb-5">
                    Próximos eventos
                  </h2>
                  <div className="space-y-4">
                    {regular.map((event: EventCardProps) => (
                      <EventCard key={event.slug} {...event} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Container>
      </section>
    </>
  )
}
