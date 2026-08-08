import Link from 'next/link'
import type { Metadata } from 'next'
import { Map, MapPin, Utensils, Palette, ConciergeBell, ExternalLink, Info, type LucideIcon } from 'lucide-react'
import { getAllMapMarkers } from '@/lib/data'
import type { MapMarker } from '@/types'
import { getMapMarkerRoute } from '@/lib/map-marker-route'

// F-21: ISR — map markers change infrequently, revalidate every hour.
export const revalidate = 3600
import { Container } from '@/components/ui/Container'
import DynamicLeafletMap from '@/components/map/DynamicLeafletMap'
import { buildStaticPageMetadata } from '@/lib/metadata'
import { PageHero, PageHeroBreadcrumb, PageHeroHeader } from '@/components/ui/PageHero'
import { TEPEXI_CENTER, HERO_FALLBACKS, CATEGORY_COLORS } from '@/lib/constants'

export const metadata: Metadata = buildStaticPageMetadata({
  title: 'Mapa Interactivo',
  description: 'Usa el mapa turístico de Tepexi de Rodríguez, Puebla, para ubicar atractivos, servicios, gastronomía y puntos clave del municipio.',
  path: '/mapa',
})

interface LegendCategory {
  label: string
  color: string
}

interface LegendType {
  label: string
  icon: LucideIcon
  showCounter: boolean
  categories: LegendCategory[]
}

interface MarkerGroup {
  title: string
  description: string
  markers: MapMarker[]
}

const LEGEND_TYPES: LegendType[] = [
  {
    label: 'Turístico',
    icon: MapPin,
    showCounter: true,
    categories: [
      { label: 'Ecoturismo y Naturaleza', color: '#2E7D32' },
      { label: 'Historia y Arqueología', color: '#8B4513' },
      { label: 'Paleontología', color: '#00838F' },
    ],
  },
  {
    label: 'Gastronomía',
    icon: Utensils,
    showCounter: true,
    categories: [
      { label: 'Gastronomía y Comercio Local', color: '#E65100' },
    ],
  },
  {
    label: 'Cultura',
    icon: Palette,
    showCounter: true,
    categories: [
      { label: 'Cultura y Espacios Públicos', color: '#7B1FA2' },
    ],
  },
  {
    label: 'Servicios',
    icon: ConciergeBell,
    showCounter: false,
    categories: [
      { label: 'Hospedaje', color: '#5D4037' }, 
      { label: 'Banco', color: CATEGORY_COLORS.servicios },
    ],
  },
]

const MARKER_GROUP_META = {
  lugar: {
    title: 'Lugares turísticos',
    description: 'Sitios naturales, arqueológicos y de interés general.',
  },
  gastronomia: {
    title: 'Gastronomía',
    description: 'Platillos, sabores locales y puntos gastronómicos.',
  },
  cultura: {
    title: 'Cultura',
    description: 'Espacios públicos y referentes culturales del municipio.',
  },
  servicios: {
    title: 'Servicios',
    description: 'Hospedaje, bancos y puntos útiles para tu visita.',
  },
} as const

function buildMarkerGroups(markers: MapMarker[]): MarkerGroup[] {
  return Object.entries(MARKER_GROUP_META)
    .map(([type, meta]) => ({
      ...meta,
      markers: markers
        .filter((marker) => marker.type === type)
        .toSorted((a, b) => a.title.localeCompare(b.title, 'es-MX')),
    }))
    .filter((group) => group.markers.length > 0)
}

export default async function MapaPage() {
  const markers = await getAllMapMarkers()
  const markerGroups = buildMarkerGroups(markers)

  return (
    <>
      {/* Page hero */}
      <PageHero imageUrl={HERO_FALLBACKS.mapa}>
        <PageHeroBreadcrumb items={[{ label: 'Inicio', href: '/' }, { label: 'Mapa Interactivo' }]} currentPath="/mapa" />
        <PageHeroHeader
          icon={Map}
          title="Mapa Interactivo"
          description="Explora todos los atractivos de Tepexi de Rodríguez en un solo mapa. Haz clic en cada marcador para ver más información."
        />
        <div className="mt-6 md:mt-10 flex gap-4 flex-wrap">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 text-white">
            <div className="text-2xl font-bold font-heading">{markers.length}</div>
            <div className="text-xs text-white/70 uppercase tracking-wide">puntos</div>
          </div>
          {LEGEND_TYPES.filter((type) => type.showCounter).map((type) => {
            const count = type.categories.reduce(
              (sum, cat) => sum + markers.filter((m) => m.category === cat.label).length,
              0,
            )
            return (
              <div key={type.label} className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 text-white">
                <div className="text-2xl font-bold font-heading">{count}</div>
                <div className="text-xs text-white/70 uppercase tracking-wide">{type.label}</div>
              </div>
            )
          })}
        </div>
      </PageHero>

      <section className="py-10">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Legend panel */}
            <aside className="lg:col-span-1 space-y-4 order-2 lg:order-none">
              <h2 className="font-heading font-semibold text-text-primary text-lg">
                Categorías
              </h2>

              <div className="space-y-2">
                {LEGEND_TYPES.map((type) => {
                  const Icon = type.icon
                  return (
                    <div
                      key={type.label}
                      className="bg-cream rounded-xl border border-stone/10 overflow-hidden"
                    >
                      {/* Type header */}
                      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-stone/10">
                        <Icon className="w-4 h-4 text-primary/70 flex-shrink-0" aria-hidden="true" />
                        <span className="font-heading font-semibold text-sm text-primary">
                          {type.label}
                        </span>
                      </div>
                      {/* Categories */}
                      <ul className="px-4 py-2.5 space-y-2">
                        {type.categories.map((cat) => (
                          <li key={cat.label} className="flex items-center gap-2.5">
                            <span
                              className="flex-shrink-0 w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: cat.color }}
                            />
                            <span className="text-xs text-stone leading-snug">
                              {cat.label}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>

              {/* Map tip */}
              <div className="bg-primary/5 rounded-xl border border-primary/15 p-4">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-primary/70 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-xs text-stone leading-relaxed">
                    Haz clic en cualquier marcador del mapa para ver información útil y abrir
                    su ubicación en Google Maps.
                  </p>
                </div>
              </div>

            </aside>

            {/* Map card */}
            <div className="lg:col-span-3 order-1 lg:order-none">
              <div className="rounded-2xl border border-stone/10 overflow-hidden shadow-md">
                <div className="flex items-center gap-3 bg-cream border-b border-stone/10 px-5 py-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-stone/20" />
                    <div className="w-3 h-3 rounded-full bg-stone/20" />
                    <div className="w-3 h-3 rounded-full bg-stone/20" />
                  </div>
                  <span className="text-sm text-stone/60 font-medium">Tepexi de Rodríguez, Puebla</span>
                </div>

                <DynamicLeafletMap
                  markers={markers}
                  center={TEPEXI_CENTER}
                  zoom={13}
                />
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-stone/10 bg-cream p-5 shadow-sm md:mt-10">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="font-heading text-2xl font-semibold text-text-primary">
                  Directorio de lugares y servicios
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone">
                  Esta lista funciona como alternativa accesible al mapa interactivo. Los servicios priorizan la ubicación; los lugares con página propia mantienen su enlace de detalle.
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
              {markerGroups.map((group) => (
                <section key={group.title} className="rounded-2xl border border-stone/10 bg-white p-4">
                  <h3 className="font-heading text-lg font-semibold text-primary">{group.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-stone">{group.description}</p>

                  <ul className="mt-4 space-y-3" role="list">
                    {group.markers.map((marker) => (
                      <li key={marker.id} className="rounded-xl border border-stone/10 bg-cream px-4 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-medium text-text-primary">{marker.title}</p>
                            <p className="mt-1 text-sm text-stone">{marker.category}</p>
                          </div>
                          <span className="mt-1 inline-flex h-3 w-3 flex-shrink-0 rounded-full" style={{ backgroundColor: marker.categoryColor }} aria-hidden="true" />
                        </div>

                        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                          {marker.sourceType === 'servicio' ? (
                            <a
                              href={`https://www.google.com/maps?q=${marker.coordinates.lat},${marker.coordinates.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                            >
                              Cómo llegar
                              <ExternalLink className="h-4 w-4" aria-hidden="true" />
                            </a>
                          ) : (
                            <>
                              <Link
                                href={getMapMarkerRoute(marker).detailHref}
                                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                              >
                                Ver detalle
                              </Link>
                              <a
                                href={`https://www.google.com/maps?q=${marker.coordinates.lat},${marker.coordinates.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-primary/20 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                              >
                                Abrir en Google Maps
                                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                              </a>
                            </>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
