export const MAP_MARKER_SOURCE = {
  LUGAR: 'lugar',
  SERVICIO: 'servicio',
  GASTRONOMIA: 'gastronomia',
  STATIC: 'static',
} as const

export type MapMarkerSource = (typeof MAP_MARKER_SOURCE)[keyof typeof MAP_MARKER_SOURCE]

export interface Coordinates {
  lat: number
  lng: number
}

export interface PlaceCardProps {
  title: string
  slug: string
  category: string
  categoryColor?: string
  imageUrl: string
  imageAlt: string
  excerpt?: string
}

export interface LeafletMapProps {
  markers: MapMarker[]
  center?: Coordinates
  zoom?: number
}

export interface MapMarker {
  id: string
  title: string
  slug: string
  sourceType: MapMarkerSource
  coordinates: Coordinates
  category: string
  categoryColor: string
  type: 'lugar' | 'gastronomia' | 'cultura' | 'servicios'
}

export interface EventCardProps {
  title: string
  slug: string
  date: string
  endDate?: string
  location?: string
  imageUrl?: string
  imageAlt?: string
  isFeatured?: boolean
}
