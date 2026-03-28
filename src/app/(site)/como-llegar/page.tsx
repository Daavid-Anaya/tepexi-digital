import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { Container } from '@/components/ui/Container'
import type { MapMarker } from '@/types'

export const metadata: Metadata = {
  title: 'Cómo Llegar',
  description: 'Indicaciones para llegar a Tepexi de Rodríguez desde Puebla, CDMX y Oaxaca.',
}

const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-sand animate-pulse rounded-lg flex items-center justify-center">
      <span className="text-stone/60 text-sm">Cargando mapa…</span>
    </div>
  ),
})

const centerMarker: MapMarker = {
  id: 'tepexi-centro',
  title: 'Tepexi de Rodríguez',
  slug: '',
  coordinates: { lat: 18.5793, lng: -97.9218 },
  category: 'Municipio',
  categoryColor: '#8B4513',
  type: 'lugar',
}

const routes = [
  {
    from: 'Ciudad de Puebla',
    duration: '1 hora 30 min',
    distance: '~95 km',
    description:
      'Tomar la autopista Puebla-Tehuacán (México 150D) y continuar por la carretera Tepexi de Rodríguez. La ruta es por carretera libre siguiendo las señalizaciones hacia Tepexi.',
  },
  {
    from: 'Ciudad de México (CDMX)',
    duration: '3 horas',
    distance: '~230 km',
    description:
      'Tomar la autopista México-Puebla (ARCO NORTE o México-Puebla 150D), llegar a Puebla y continuar hacia Tepexi de Rodríguez por la carretera Puebla-Tehuacán.',
  },
  {
    from: 'Oaxaca de Juárez',
    duration: '3 horas 30 min',
    distance: '~240 km',
    description:
      'Tomar la autopista Oaxaca-Puebla (México 131 / 190) hacia el norte hasta Tehuacán y continuar por la carretera libre hacia Tepexi de Rodríguez.',
  },
]

export default function ComoLlegarPage() {
  return (
    <>
      <section className="bg-cream py-16">
        <Container>
          <h1 className="font-heading font-bold text-4xl text-primary mb-3">
            Cómo Llegar
          </h1>
          <p className="text-stone text-lg max-w-2xl">
            Tepexi de Rodríguez se ubica en el sur del estado de Puebla, a menos de
            2 horas de la capital poblana.
          </p>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Route cards */}
            <div className="space-y-6">
              <h2 className="font-heading font-semibold text-primary text-2xl">
                Rutas principales
              </h2>

              {routes.map((route) => (
                <div
                  key={route.from}
                  className="bg-cream rounded-lg border border-stone/10 p-5 space-y-2"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-heading font-semibold text-primary">
                      Desde {route.from}
                    </h3>
                    <div className="text-right flex-shrink-0 text-sm text-stone">
                      <div>{route.duration}</div>
                      <div>{route.distance}</div>
                    </div>
                  </div>
                  <p className="text-stone text-sm leading-relaxed">{route.description}</p>
                </div>
              ))}

              {/* Tips */}
              <div className="bg-primary/5 rounded-lg border border-primary/20 p-5">
                <h3 className="font-heading font-semibold text-primary mb-3">
                  Consejos de viaje
                </h3>
                <ul className="space-y-2 text-stone text-sm list-disc list-inside">
                  <li>Verifica el estado de las carreteras antes de salir.</li>
                  <li>Se recomienda viajar de día.</li>
                  <li>Hay gasolineras en Izúcar de Matamoros, a 30 km antes.</li>
                  <li>Lleva efectivo; no todas las tiendas aceptan tarjeta.</li>
                </ul>
              </div>
            </div>

            {/* Map */}
            <div className="space-y-4">
              <h2 className="font-heading font-semibold text-primary text-2xl">
                Ubicación
              </h2>
              <LeafletMap
                markers={[centerMarker]}
                center={{ lat: 18.5793, lng: -97.9218 }}
                zoom={12}
              />
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
