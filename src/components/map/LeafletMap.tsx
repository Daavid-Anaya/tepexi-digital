'use client'

import 'leaflet/dist/leaflet.css'
// F-31: Leaflet popup overrides scoped here — only loads when the map is rendered
import './leaflet-overrides.css'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import Link from 'next/link'
import type { LeafletMapProps } from '@/types'
import { TEPEXI_CENTER } from '@/lib/constants'

const DEFAULT_CENTER = TEPEXI_CENTER
const DEFAULT_ZOOM = 14

const HEX_COLOR_RE = /^#[0-9A-Fa-f]{3,8}$/

function createCategoryIcon(color: string): L.DivIcon {
  const fill = HEX_COLOR_RE.test(color) ? color : '#8B4513'
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 44" width="32" height="44">
      <defs>
        <filter id="pin-shadow" x="-30%" y="-10%" width="160%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="rgba(0,0,0,0.35)"/>
        </filter>
      </defs>
      <path
        filter="url(#pin-shadow)"
        d="M16 0C7.163 0 0 7.163 0 16c0 6.04 3.35 11.3 8.3 14.06L16 44l7.7-13.94C28.65 27.3 32 22.04 32 16 32 7.163 24.837 0 16 0z"
        fill="${fill}"
      />
      <circle cx="16" cy="15" r="6.5" fill="white" opacity="0.95"/>
    </svg>
  `
  return L.divIcon({
    className: '',
    html: svg,
    iconSize: [32, 44],
    iconAnchor: [16, 44],
    popupAnchor: [0, -46],
  })
}

const TYPE_PATHS: Record<string, string> = {
  lugar: '/lugares',
  gastronomia: '/lugares',
  cultura: '/lugares',
  servicios: '/servicios',
}

export default function LeafletMap({ markers, center, zoom }: LeafletMapProps) {
  const mapCenter = center ?? DEFAULT_CENTER
  const mapZoom = zoom ?? DEFAULT_ZOOM

  return (
    <MapContainer
      center={[mapCenter.lat, mapCenter.lng]}
      zoom={mapZoom}
      className="w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-lg z-0"
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((marker) => {
        const icon = createCategoryIcon(marker.categoryColor)
        const basePath = TYPE_PATHS[marker.type] ?? '/lugares'
        return (
          <Marker
            key={marker.id}
            position={[marker.coordinates.lat, marker.coordinates.lng]}
            icon={icon}
          >
            <Popup minWidth={180} className="leaflet-popup-custom">
              <div className="text-sm leading-snug" style={{ fontFamily: 'inherit' }}>
                <p
                  className="font-semibold mb-0.5 text-stone-800"
                  style={{ fontSize: '0.875rem' }}
                >
                  {marker.title}
                </p>
                <p
                  className="capitalize mb-3"
                  style={{ fontSize: '0.75rem', color: '#78716c' }}
                >
                  {marker.category}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <Link
                    href={`${basePath}/${marker.slug}`}
                    style={{ fontSize: '0.75rem', color: '#8B4513', textDecoration: 'underline' }}
                  >
                    Ver detalle →
                  </Link>
                  <a
                    href={`https://www.google.com/maps?q=${marker.coordinates.lat},${marker.coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.75rem', color: '#2563eb', textDecoration: 'underline' }}
                  >
                    Abrir en Google Maps ↗
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
