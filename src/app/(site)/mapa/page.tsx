import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { getAllMapMarkers } from '@/lib/data'
import { Container } from '@/components/ui/Container'

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
  const markers = await getAllMapMarkers()

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
