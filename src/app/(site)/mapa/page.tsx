import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { sanityFetch } from '@/sanity/lib/live'
import { allLugaresMapQuery } from '@/sanity/queries/lugares'
import { allGastronomiaMapQuery } from '@/sanity/queries/gastronomia'
import { allCulturaMapQuery } from '@/sanity/queries/cultura'
import { Container } from '@/components/ui/Container'
import type { MapMarker } from '@/types'

export const metadata: Metadata = {
  title: 'Mapa Interactivo',
  description: 'Mapa interactivo de los atractivos de Tepexi de Rodríguez, Puebla.',
}

const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] bg-sand animate-pulse rounded-lg flex items-center justify-center">
      <span className="text-stone/60 text-sm">Cargando mapa…</span>
    </div>
  ),
})

export default async function MapaPage() {
  const [{ data: lugares }, { data: gastronomia }, { data: cultura }] = await Promise.all([
    sanityFetch({ query: allLugaresMapQuery }),
    sanityFetch({ query: allGastronomiaMapQuery }),
    sanityFetch({ query: allCulturaMapQuery }),
  ])

  type LugarMapItem = NonNullable<typeof lugares>[number]
  type GastronomiaMapItem = NonNullable<typeof gastronomia>[number]
  type CulturaMapItem = NonNullable<typeof cultura>[number]

  const markers: MapMarker[] = [
    ...(lugares ?? []).map((l: LugarMapItem) => ({
      id: l._id,
      title: l.title ?? '',
      slug: l.slug?.current ?? '',
      coordinates: { lat: l.coordinates?.lat ?? 0, lng: l.coordinates?.lng ?? 0 },
      category: l.category ?? '',
      categoryColor: l.categoryColor ?? '#8B4513',
      type: 'lugar' as const,
    })),
    ...(gastronomia ?? []).map((g: GastronomiaMapItem) => ({
      id: g._id,
      title: g.title ?? '',
      slug: g.slug?.current ?? '',
      coordinates: { lat: g.coordinates?.lat ?? 0, lng: g.coordinates?.lng ?? 0 },
      category: g.category ?? '',
      categoryColor: g.categoryColor ?? '#2E7D32',
      type: 'gastronomia' as const,
    })),
    ...(cultura ?? []).map((c: CulturaMapItem) => ({
      id: c._id,
      title: c.title ?? '',
      slug: c.slug?.current ?? '',
      coordinates: { lat: c.coordinates?.lat ?? 0, lng: c.coordinates?.lng ?? 0 },
      category: c.category ?? '',
      categoryColor: c.categoryColor ?? '#BF360C',
      type: 'cultura' as const,
    })),
  ].filter((m) => m.coordinates.lat !== 0 || m.coordinates.lng !== 0)

  return (
    <>
      <section className="bg-cream py-16">
        <Container>
          <h1 className="font-heading font-bold text-4xl text-primary mb-3">
            Mapa Interactivo
          </h1>
          <p className="text-stone text-lg max-w-2xl">
            Explora todos los atractivos de Tepexi de Rodríguez en el mapa.
          </p>
        </Container>
      </section>

      <section className="py-10">
        <Container>
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-stone">
              <span className="w-3 h-3 rounded-full bg-primary inline-block" />
              Lugares turísticos
            </div>
            <div className="flex items-center gap-2 text-sm text-stone">
              <span className="w-3 h-3 rounded-full bg-secondary inline-block" />
              Gastronomía
            </div>
            <div className="flex items-center gap-2 text-sm text-stone">
              <span className="w-3 h-3 rounded-full bg-accent inline-block" />
              Cultura
            </div>
          </div>

          <LeafletMap
            markers={markers}
            center={{ lat: 18.5793, lng: -97.9218 }}
            zoom={14}
          />

          <p className="text-stone/60 text-xs mt-3 text-center">
            Haz clic en un marcador para ver más información.
          </p>
        </Container>
      </section>
    </>
  )
}
