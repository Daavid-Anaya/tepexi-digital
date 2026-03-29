import type { Metadata } from 'next'
import Link from 'next/link'
import { Navigation, Car, Bus, Clock, Milestone, Lightbulb, ArrowRight } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import DynamicLeafletMap from '@/components/map/DynamicLeafletMap'
import type { MapMarker } from '@/types'

export const metadata: Metadata = {
  title: 'Cómo Llegar',
  description: 'Indicaciones para llegar a Tepexi de Rodríguez desde Puebla, CDMX y Oaxaca.',
}

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
    duration: '1h 30min',
    distance: '~95 km',
    description:
      'Tomar la autopista Puebla-Tehuacán (México 150D) y continuar por la carretera Tepexi de Rodríguez. La ruta es por carretera libre siguiendo las señalizaciones hacia Tepexi.',
    icon: Car,
    color: 'bg-primary',
    lightColor: 'bg-primary/10',
    textColor: 'text-primary',
  },
  {
    from: 'Ciudad de México (CDMX)',
    duration: '3h 00min',
    distance: '~230 km',
    description:
      'Tomar la autopista México-Puebla (ARCO NORTE o México-Puebla 150D), llegar a Puebla y continuar hacia Tepexi de Rodríguez por la carretera Puebla-Tehuacán.',
    icon: Car,
    color: 'bg-accent',
    lightColor: 'bg-accent/10',
    textColor: 'text-accent',
  },
  {
    from: 'Oaxaca de Juárez',
    duration: '3h 30min',
    distance: '~240 km',
    description:
      'Tomar la autopista Oaxaca-Puebla (México 131 / 190) hacia el norte hasta Tehuacán y continuar por la carretera libre hacia Tepexi de Rodríguez.',
    icon: Bus,
    color: 'bg-secondary',
    lightColor: 'bg-secondary/10',
    textColor: 'text-secondary',
  },
]

const tips = [
  'Verifica el estado de las carreteras antes de salir.',
  'Se recomienda viajar de día.',
  'Hay gasolineras en Izúcar de Matamoros, a 30 km antes.',
  'Lleva efectivo; no todas las tiendas aceptan tarjeta.',
]

export default function ComoLlegarPage() {
  return (
    <>
      {/* Page hero */}
      <section className="relative overflow-hidden bg-primary py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-primary-light" />
          <div className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full bg-primary-dark" />
        </div>

        <Container className="relative">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <span>/</span>
            <span className="text-white/90">Cómo Llegar</span>
          </nav>

          <div className="flex items-start gap-5">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
              <Navigation className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-4xl md:text-5xl text-white leading-tight mb-3">
                Cómo Llegar
              </h1>
              <p className="text-white/75 text-lg max-w-2xl leading-relaxed">
                Tepexi de Rodríguez se ubica en el sur del estado de Puebla, a menos de
                2 horas de la capital poblana.
              </p>
            </div>
          </div>

          {/* Distance highlights */}
          <div className="mt-10 grid grid-cols-3 gap-4 max-w-lg">
            {routes.map((r) => (
              <div key={r.from} className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-white text-center">
                <div className="text-xl font-bold font-heading">{r.duration}</div>
                <div className="text-[11px] text-white/60 leading-tight mt-0.5">desde {r.from.split(' ')[r.from.split(' ').length - 1]}</div>
              </div>
            ))}
          </div>
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

              {routes.map((route) => {
                const Icon = route.icon
                return (
                  <div
                    key={route.from}
                    className="bg-cream rounded-2xl border border-stone/10 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Route header */}
                    <div className={`${route.color} px-5 py-4`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                            <Icon className="w-4.5 h-4.5 text-white" />
                          </div>
                          <div>
                            <div className="text-white/70 text-xs font-medium uppercase tracking-wide">Desde</div>
                            <h3 className="font-heading font-semibold text-white leading-tight">
                              {route.from}
                            </h3>
                          </div>
                        </div>
                        <div className="text-right text-white">
                          <div className="flex items-center gap-1.5 justify-end">
                            <Clock className="w-3.5 h-3.5 opacity-70" />
                            <span className="font-bold font-heading">{route.duration}</span>
                          </div>
                          <div className="text-white/60 text-xs flex items-center gap-1 justify-end">
                            <Milestone className="w-3 h-3" />
                            {route.distance}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Route description */}
                    <div className="px-5 py-4">
                      <p className="text-stone text-sm leading-relaxed">{route.description}</p>

                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=Tepexi+de+Rodríguez,+Puebla,+Mexico&origin=${encodeURIComponent(route.from)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`mt-3 inline-flex items-center gap-1.5 text-xs font-semibold ${route.textColor} hover:opacity-75 transition-opacity`}
                      >
                        Ver en Google Maps
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                )
              })}

              {/* Tips card */}
              <div className="bg-amber-50 rounded-2xl border border-amber-200/60 overflow-hidden">
                <div className="bg-amber-100 px-5 py-3 flex items-center gap-2">
                  <Lightbulb className="w-4.5 h-4.5 text-amber-600" />
                  <h3 className="font-heading font-semibold text-amber-900 text-sm">
                    Consejos de viaje
                  </h3>
                </div>
                <ul className="px-5 py-4 space-y-2.5">
                  {tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-amber-900/80">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-200 text-amber-700 text-xs font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Map */}
            <div className="space-y-4">
              <h2 className="font-heading font-semibold text-primary text-2xl">
                Ubicación
              </h2>
              <div className="rounded-2xl border border-stone/10 overflow-hidden shadow-md sticky top-6">
                <div className="flex items-center gap-2 bg-cream border-b border-stone/10 px-5 py-3">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Navigation className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-sm text-stone font-medium">Tepexi de Rodríguez, Puebla</span>
                </div>
                <DynamicLeafletMap
                  markers={[centerMarker]}
                  center={{ lat: 18.5793, lng: -97.9218 }}
                  zoom={12}
                />
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
