import type { Metadata } from 'next'
import Link from 'next/link'
import { Map, MapPin, Utensils, Palette, ConciergeBell, Info, type LucideIcon } from 'lucide-react'
import { getAllMapMarkers } from '@/lib/data'
import { Container } from '@/components/ui/Container'
import DynamicLeafletMap from '@/components/map/DynamicLeafletMap'

export const metadata: Metadata = {
  title: 'Mapa Interactivo',
  description: 'Mapa interactivo de los atractivos de Tepexi de Rodríguez, Puebla.',
}

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

const LEGEND_TYPES: LegendType[] = [
  {
    label: 'Lugares',
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
      { label: 'Banco', color: '#37474F' },
    ],
  },
]

export default async function MapaPage() {
  const markers = await getAllMapMarkers()

  return (
    <>
      {/* Page hero */}
      <section className="relative overflow-hidden bg-primary py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-primary-light" />
          <div className="absolute bottom-0 left-1/4 w-40 h-40 rounded-full bg-primary-dark" />
        </div>

        <Container className="relative">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/60 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
            <span>/</span>
            <span className="text-white/90">Mapa Interactivo</span>
          </nav>

          <div className="flex items-start gap-5">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
              <Map className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-4xl md:text-5xl text-white leading-tight mb-3">
                Mapa Interactivo
              </h1>
              <p className="text-white/75 text-lg max-w-2xl leading-relaxed">
                Explora todos los atractivos de Tepexi de Rodríguez en un solo mapa.
                Haz clic en cada marcador para ver más información.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-10 flex gap-4 flex-wrap">
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
        </Container>
      </section>

      <section className="py-10">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Legend panel */}
            <aside className="lg:col-span-1 space-y-4">
              <h2 className="font-heading font-semibold text-primary text-lg">
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
                        <Icon className="w-4 h-4 text-primary/70 flex-shrink-0" />
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
                            <span className="text-xs text-stone/80 leading-snug">
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
                  <Info className="w-4 h-4 text-primary/70 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-stone/80 leading-relaxed">
                    Haz clic en cualquier marcador del mapa para ver el nombre y acceder a
                    la información completa del lugar.
                  </p>
                </div>
              </div>
            </aside>

            {/* Map card */}
            <div className="lg:col-span-3">
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
                  center={{ lat: 18.5793, lng: -97.9218 }}
                  zoom={13}
                />
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
