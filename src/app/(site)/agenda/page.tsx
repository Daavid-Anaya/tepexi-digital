import type { Metadata } from 'next'
import { CalendarDays } from 'lucide-react'
import Link from 'next/link'
import { getUpcomingEventos } from '@/lib/data'
import { Container } from '@/components/ui/Container'
import { EventCard } from '@/components/events/EventCard'
import type { EventCardProps } from '@/types'

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
      <section className="relative overflow-hidden bg-secondary py-12 md:py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-secondary-light" />
          <div className="absolute bottom-0 left-1/4 w-40 h-40 rounded-full" style={{ backgroundColor: '#1B5E20' }} />
        </div>

        <Container className="relative">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <span>/</span>
            <span className="text-white/90">Agenda</span>
          </nav>

          <div className="flex items-start gap-5">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm hidden sm:flex items-center justify-center">
              <CalendarDays className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-white leading-tight mb-3">
                Agenda de Eventos
              </h1>
              <p className="text-white/75 text-lg max-w-2xl leading-relaxed">
                Próximos eventos culturales, fiestas patronales y celebraciones
                de Tepexi de Rodríguez.
              </p>
            </div>
          </div>

          {/* Calendar stats */}
          <div className="mt-6 md:mt-10 flex gap-6 flex-wrap">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 text-white">
              <div className="text-2xl font-bold font-heading">{events.length}</div>
              <div className="text-xs text-white/70 uppercase tracking-wide">eventos</div>
            </div>
            {featured.length > 0 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 text-white">
                <div className="text-2xl font-bold font-heading">{featured.length}</div>
                <div className="text-xs text-white/70 uppercase tracking-wide">destacados</div>
              </div>
            )}
          </div>
        </Container>
      </section>

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
