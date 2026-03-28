'use client'

import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import Link from 'next/link'
import type { LeafletMapProps } from '@/types'

const DEFAULT_CENTER = { lat: 18.5793, lng: -97.9218 }
const DEFAULT_ZOOM = 14

function createCategoryIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="
      width: 24px;
      height: 24px;
      border-radius: 50% 50% 50% 0;
      background-color: ${color || '#8B4513'};
      transform: rotate(-45deg);
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  })
}

const TYPE_PATHS: Record<string, string> = {
  lugar: '/lugares',
  gastronomia: '/gastronomia',
  cultura: '/cultura',
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
            <Popup>
              <div className="text-sm">
                <p className="font-semibold mb-1">{marker.title}</p>
                <p className="text-stone-500 capitalize mb-2">{marker.category}</p>
                <Link
                  href={`${basePath}/${marker.slug}`}
                  className="text-primary underline text-xs"
                >
                  Ver detalle →
                </Link>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
