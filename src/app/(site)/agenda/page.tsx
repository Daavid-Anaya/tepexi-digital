import type { Metadata } from 'next'
import { CalendarDays } from 'lucide-react'
import { getUpcomingEventos } from '@/lib/data'
import { Container } from '@/components/ui/Container'
import { EventCard } from '@/components/events/EventCard'
import type { EventCardProps } from '@/types'
import { PageHero, PageHeroBreadcrumb, PageHeroHeader, PageHeroStats } from '@/components/ui/PageHero'

export const metadata: Metadata = {
  title: 'Agenda de Eventos',
  description: 'Próximos eventos y actividades en Tepexi de Rodríguez, Puebla.',
}

export default async function AgendaPage() {
  const data = await getUpcomingEventos()

  const events: EventCardProps[] = data.map((evento) => ({
    title: evento.title,
    slug: evento.slug.current,
    date: evento.date,
    endDate: evento.endDate ?? undefined,
    location: evento.locationName ?? evento.locationText ?? undefined,
    imageUrl: evento.imageUrl ?? undefined,
    imageAlt: evento.imageAlt ?? undefined,
    isFeatured: evento.isFeatured,
  }))

  // Group featured events first
  const featured = events.filter((e) => e.isFeatured)
  const regular = events.filter((e) => !e.isFeatured)

  return (
    <>
      {/* Page hero — calendar inspired */}
      <PageHero imageUrl="/images/agenda/img-hero-agenda.jpg" imageAlt="Imagen hero de la agenda de eventos">
        <PageHeroBreadcrumb items={[{ label: 'Inicio', href: '/' }, { label: 'Agenda' }]} />
        <PageHeroHeader
          icon={CalendarDays}
          title="Agenda de Eventos"
          description="Próximos eventos culturales, fiestas patronales y celebraciones de Tepexi de Rodríguez."
        />
        <PageHeroStats stats={[{ value: events.length, label: 'eventos' }, ...(featured.length > 0 ? [{ value: featured.length, label: 'destacados' }] : [])]} />
      </PageHero>

      <section className="py-10 md:py-16">
        <Container>
          {events.length === 0 ? (
            /* Empty state */
            <div className="text-center py-20">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 rounded-2xl bg-secondary/10 rotate-6" />
                <div className="absolute inset-0 rounded-2xl bg-secondary/10 -rotate-3" />
                <div className="relative w-24 h-24 rounded-2xl bg-cream border border-stone/10 flex items-center justify-center">
                  <span className="text-4xl">📅</span>
                </div>
              </div>
              <h2 className="font-heading font-semibold text-xl text-primary mb-2">
                Sin eventos programados
              </h2>
              <p className="text-stone max-w-sm mx-auto leading-relaxed">
                Por el momento no hay eventos en la agenda. Vuelve pronto para
                enterarte de las próximas celebraciones de Tepexi.
              </p>
            </div>
          ) : (
            <div className="space-y-8 md:space-y-14">
              {/* Featured events */}
              {featured.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-8 bg-secondary rounded-full" />
                    <h2 className="font-heading font-semibold text-primary text-xl sm:text-2xl">
                      Eventos destacados
                    </h2>
                    <span className="bg-secondary/10 text-secondary text-xs font-semibold px-2.5 py-1 rounded-full">
                      {featured.length}
                    </span>
                  </div>

                  {/* Featured with subtle background */}
                  <div className="bg-secondary/5 rounded-2xl border border-secondary/15 p-4 sm:p-6 space-y-4">
                    {featured.map((event) => (
                      <EventCard key={event.slug} {...event} />
                    ))}
                  </div>
                </div>
              )}

              {/* Regular events with timeline */}
              {regular.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-8 bg-stone/30 rounded-full" />
                    <h2 className="font-heading font-semibold text-primary text-xl sm:text-2xl">
                      Próximos eventos
                    </h2>
                    <span className="bg-stone/10 text-stone text-xs font-semibold px-2.5 py-1 rounded-full">
                      {regular.length}
                    </span>
                  </div>

                  {/* Timeline layout */}
                  <div className="relative">
                    {/* Vertical timeline line */}
                    <div className="absolute left-6 top-0 bottom-0 w-px bg-stone/15 hidden sm:block" />

                    <div className="space-y-4">
                      {regular.map((event, index) => (
                        <div key={event.slug} className="relative sm:pl-14">
                          {/* Timeline dot */}
                          <div className="absolute left-4 top-6 w-4 h-4 rounded-full border-2 border-stone/30 bg-sand hidden sm:block" />
                          <EventCard {...event} />
                        </div>
                      ))}
                    </div>
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
