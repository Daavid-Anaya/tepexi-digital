import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ChevronDown, Map, Utensils, Landmark } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { PlaceGrid } from '@/components/places/PlaceGrid'
import { EventCard } from '@/components/events/EventCard'
import { getAllLugares, getAllGastronomia, getUpcomingEventos, getSettings } from '@/lib/data'
import type { PlaceCardProps, EventCardProps } from '@/types'

export const metadata: Metadata = {
  title: 'Inicio',
  description:
    'Descubre la riqueza turística, cultural y gastronómica de Tepexi de Rodríguez, Puebla.',
}

export default async function HomePage() {
  const [lugaresData, gastronomiaData, eventosData, settings] = await Promise.all([
    getAllLugares(),
    getAllGastronomia(),
    getUpcomingEventos(),
    getSettings(),
  ])

  const featuredLugares: PlaceCardProps[] = lugaresData
    .filter((l) => l.isFeatured)
    .slice(0, 4)
    .map((l) => ({
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
    excerpt: undefined,
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
      {/* ============================================================
          HERO — full-width cinematic
          ============================================================ */}
      <section className="relative min-h-[70vh] md:min-h-[88vh] flex flex-col items-center justify-center overflow-hidden bg-primary-900">
        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src={settings.heroImageUrl ?? 'https://picsum.photos/seed/tepexi-nature/1920/1080'}
            alt={settings.heroTitle ?? 'Paisaje de Tepexi de Rodríguez'}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {/* Layered gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary-900/70 via-primary-900/40 to-primary-900/85" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/40 via-transparent to-primary-900/20" />
        </div>

        {/* Decorative top-left diagonal accent */}
        <div
          className="hidden sm:block absolute top-0 left-0 w-64 h-1.5 bg-gradient-to-r from-accent via-primary to-transparent origin-top-left -rotate-[30deg] translate-y-8 -translate-x-4 opacity-60"
          aria-hidden="true"
        />

        {/* Content */}
        <Container className="relative z-10 text-center py-12 md:py-24">
          {/* Eyebrow label */}
          <p className="inline-flex items-center gap-2 text-cream/70 text-sm font-medium uppercase tracking-[0.2em] mb-6 animate-fade-in">
            <span className="w-6 h-px bg-cream/50" />
            Mixteca Poblana, México
            <span className="w-6 h-px bg-cream/50" />
          </p>

          {/* Main headline */}
          <h1
            className="font-heading font-bold text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-text-primary leading-[1.05] mb-6 animate-fade-in-up"
            style={{ textShadow: '0 2px 24px rgba(0,0,0,0.4)' }}
          >
            {settings.heroTitle ? (
              <>
                {settings.heroTitle.split(' ').slice(0, 1).join(' ')}
                <br />
                <span className="text-primary-300">
                  {settings.heroTitle.split(' ').slice(1).join(' ')}
                </span>
              </>
            ) : (
              <>
                Descubre
                <br />
                <span className="text-primary-300">Tepexi</span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p
            className="text-cream/80 text-lg md:text-xl max-w-2xl mx-auto mb-6 md:mb-10 leading-relaxed animate-fade-in-up"
            style={{ animationDelay: '100ms' }}
          >
            {settings.heroSubtitle ??
              'Huellas de dinosaurios, arquitectura colonial, manantiales naturales y la gastronomía única de la Mixteca Poblana'}
          </p>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row gap-3 justify-center items-center animate-fade-in-up"
            style={{ animationDelay: '200ms' }}
          >
            <Button asChild variant="primary" size="lg">
              <Link href="/lugares">
                Explorar lugares
                <ArrowRight size={18} />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-cream/50 text-cream hover:bg-cream hover:text-primary"
            >
              <Link href="/mapa">
                <Map size={18} />
                Ver mapa
              </Link>
            </Button>
          </div>

          {/* Stats strip */}
          <div
            className="mt-8 md:mt-16 flex flex-wrap justify-center gap-8 sm:gap-12 animate-fade-in"
            style={{ animationDelay: '400ms' }}
          >
            {[
              { value: '3', label: 'Zonas arqueológicas' },
              { value: '12+', label: 'Sitios naturales' },
              { value: '200+', label: 'Años de historia' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="font-heading font-bold text-3xl text-primary-300 leading-none">{value}</p>
                <p className="text-cream/60 text-xs mt-1 uppercase tracking-wide">{label}</p>
              </div>
            ))}
          </div>
        </Container>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-1 text-cream/50 z-10">
          <span className="text-[10px] uppercase tracking-widest">Desliza</span>
          <ChevronDown size={18} className="animate-bounce-slow" />
        </div>
      </section>

      {/* ============================================================
          FEATURED PLACES
          ============================================================ */}
      <section className="py-20 md:py-28 bg-sand">
        <Container>
          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 md:mb-14">
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary/60 mb-3">
                <span className="w-5 h-px bg-primary/40" />
                Destinos
              </p>
              <h2 className="font-heading font-bold text-3xl md:text-4xl text-primary leading-tight">
                Lugares destacados
              </h2>
              <p className="text-stone mt-2 text-base">
                Sitios naturales e históricos que no te puedes perder
              </p>
            </div>
            <Link
              href="/lugares"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark group shrink-0 transition-colors duration-200"
            >
              Ver todos
              <ArrowRight
                size={15}
                className="group-hover:translate-x-0.5 transition-transform duration-200"
              />
            </Link>
          </div>

          {featuredLugares.length > 0 && (
            <PlaceGrid places={featuredLugares} basePath="/lugares" featured />
          )}
        </Container>
      </section>

      {/* ============================================================
          EVENTS / AGENDA
          ============================================================ */}
      <section className="py-20 md:py-28 bg-cream relative overflow-hidden">
        {/* Subtle background pattern */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          aria-hidden="true"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              #8B4513 0,
              #8B4513 1px,
              transparent 0,
              transparent 50%
            )`,
            backgroundSize: '30px 30px',
          }}
        />

        <Container className="relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 md:mb-14">
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary/60 mb-3">
                <span className="w-5 h-px bg-primary/40" />
                Próximamente
              </p>
              <h2 className="font-heading font-bold text-3xl md:text-4xl text-primary leading-tight">
                Agenda cultural
              </h2>
              <p className="text-stone mt-2 text-base">
                Celebraciones y eventos del municipio
              </p>
            </div>
            <Link
              href="/agenda"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark group shrink-0 transition-colors duration-200"
            >
              Ver agenda completa
              <ArrowRight
                size={15}
                className="group-hover:translate-x-0.5 transition-transform duration-200"
              />
            </Link>
          </div>

          {upcomingEvents.length > 0 && (
            <div className="space-y-3 max-w-3xl">
              {upcomingEvents.map((event) => (
                <EventCard key={event.slug} {...event} />
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* ============================================================
          GASTRONOMY
          ============================================================ */}
      <section className="py-20 md:py-28 bg-sand">
        <Container>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-6 md:mb-8">
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary/60 mb-3">
                <span className="w-5 h-px bg-primary/40" />
                Sabores
              </p>
              <h2 className="font-heading font-bold text-3xl md:text-4xl text-primary leading-tight">
                Gastronomía local
              </h2>
              <p className="text-stone mt-2 text-base">
                Sabores de la Mixteca Poblana que debes probar
              </p>
            </div>
            <Link
              href="/gastronomia"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark group shrink-0 transition-colors duration-200"
            >
              Ver gastronomía
              <ArrowRight
                size={15}
                className="group-hover:translate-x-0.5 transition-transform duration-200"
              />
            </Link>
          </div>

          {/* Warm introduction paragraph */}
          <p className="text-stone/80 text-base leading-relaxed max-w-2xl mb-10 border-l-2 border-primary/30 pl-4">
            La cocina de la Mixteca Poblana es un tesoro vivo: huaxmole, chileatole, tlacoyos y
            el mezcal artesanal, recetas transmitidas de generación en generación. Cada
            platillo es una historia de la tierra.
          </p>

          {featuredGastronomia.length > 0 && (
            <PlaceGrid places={featuredGastronomia} basePath="/gastronomia" />
          )}
        </Container>
      </section>

      {/* ============================================================
          EXPLORE CATEGORIES STRIP
          ============================================================ */}
      <section className="py-16 bg-primary-800">
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: Landmark,
                title: 'Cultura e Historia',
                description: 'Un recorrido por zonas arqueológicas, templos coloniales y tradiciones vivas',
                href: '/cultura',
              },
              {
                icon: Map,
                title: 'Mapa Interactivo',
                description: 'Navega por todos los puntos de interés del municipio',
                href: '/mapa',
              },
              {
                icon: Utensils,
                title: 'Gastronomía',
                description: 'Los sabores únicos de la Mixteca Poblana',
                href: '/gastronomia',
              },
            ].map(({ icon: Icon, title, description, href }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-start gap-4 p-4 sm:p-6 rounded-xl bg-cream/5 border border-cream/10 hover:bg-cream/10 hover:border-cream/20 transition-all duration-200"
              >
                <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-cream/10 text-cream/80 group-hover:bg-primary-400/30 transition-colors duration-200 flex-shrink-0">
                  <Icon size={20} />
                </span>
                <div>
                  <h3 className="font-heading font-semibold text-cream leading-tight mb-1 group-hover:text-primary-300 transition-colors duration-200">
                    {title}
                  </h3>
                  <p className="text-cream/50 text-sm leading-relaxed">{description}</p>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ============================================================
          CTA BANNER
          ============================================================ */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-cream">
        {/* Warm gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-100 via-cream to-sand" />

        {/* Decorative blob */}
        <div
          className="absolute -right-20 top-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-primary/6 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="absolute -left-10 bottom-0 w-60 h-60 rounded-full bg-accent/5 blur-3xl"
          aria-hidden="true"
        />

        <Container className="relative text-center">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary/50 mb-4">
            <span className="w-5 h-px bg-primary/30" />
            ¿Listo para explorar?
            <span className="w-5 h-px bg-primary/30" />
          </p>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl text-primary leading-tight mb-4">
            Descubre Tepexi
            <br />
            de Rodríguez
          </h2>
          <p className="text-stone text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Un municipio que guarda dinosaurios en su suelo, danzas en sus plazas
            y sabores únicos en cada mesa.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="primary" size="lg">
              <Link href="/mapa">
                <Map size={18} />
                Ver mapa interactivo
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link href="/contacto">
                Contáctanos
                <ArrowRight size={18} />
              </Link>
            </Button>
          </div>
        </Container>
      </section>
    </>
  )
}
