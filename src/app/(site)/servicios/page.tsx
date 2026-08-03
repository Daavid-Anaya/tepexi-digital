import type { Metadata } from 'next'
import Link from 'next/link'
import { ConciergeBell, ExternalLink, MapPin } from 'lucide-react'
import { getAllMapMarkers } from '@/lib/data'

export const revalidate = 3600

import { Container } from '@/components/ui/Container'
import { buildStaticPageMetadata } from '@/lib/metadata'
import { PageHero, PageHeroBreadcrumb, PageHeroHeader } from '@/components/ui/PageHero'
import { HERO_FALLBACKS } from '@/lib/constants'
import { getMapMarkerRoute } from '@/lib/map-marker-route'

export const metadata: Metadata = buildStaticPageMetadata({
  title: 'Servicios',
  description: 'Encuentra hospedaje, bancos y servicios útiles para turistas en Tepexi de Rodríguez, Puebla, con accesos rápidos al mapa y ubicaciones.',
  path: '/servicios',
})

export default async function ServiciosPage() {
  const markers = await getAllMapMarkers()
  const services = markers
    .filter((marker) => marker.type === 'servicios')
    .toSorted((a, b) => a.title.localeCompare(b.title, 'es-MX'))

  return (
    <>
      <PageHero imageUrl={HERO_FALLBACKS.servicios}>
        <PageHeroBreadcrumb items={[{ label: 'Inicio', href: '/' }, { label: 'Servicios' }]} currentPath="/servicios" />
        <PageHeroHeader
          icon={ConciergeBell}
          title="Servicios"
          description="Encuentra hospedaje, bancos y otros servicios útiles para planear tu visita con mayor tranquilidad."
        />
      </PageHero>

      <section className="py-10 md:py-16">
        <Container>
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl">
              <h2 className="font-heading text-2xl font-semibold text-text-primary">Servicios disponibles</h2>
              <p className="mt-2 text-base leading-relaxed text-stone">
                Usa esta lista como alternativa al mapa interactivo. Cada ficha te lleva al detalle del servicio y su ubicación.
              </p>
            </div>
            <Link
              href="/mapa"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-primary/20 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <MapPin className="h-4 w-4" aria-hidden="true" />
              Ver mapa interactivo
            </Link>
          </div>

          {services.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-stone/10 bg-cream p-8 text-center shadow-sm">
              <h3 className="font-heading text-xl font-semibold text-text-primary">Servicios en actualización</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone">
                Estamos integrando el directorio de servicios. Mientras tanto, puedes consultar el mapa del sitio para ubicar puntos de apoyo en el municipio.
              </p>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              {services.map((service) => {
                const serviceRoute = getMapMarkerRoute(service)

                return (
                  <article key={service.id} className="rounded-2xl border border-stone/10 bg-cream p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone/60">{service.category}</p>
                        <h3 className="mt-2 font-heading text-xl font-semibold text-primary">{service.title}</h3>
                      </div>
                      <span className="inline-flex h-3 w-3 flex-shrink-0 rounded-full" style={{ backgroundColor: service.categoryColor }} aria-hidden="true" />
                    </div>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      <Link
                        href={serviceRoute.detailHref}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        Ver detalle
                      </Link>
                      <a
                        href={`https://www.google.com/maps?q=${service.coordinates.lat},${service.coordinates.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-primary/20 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        Abrir en Google Maps
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      </a>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </Container>
      </section>
    </>
  )
}
