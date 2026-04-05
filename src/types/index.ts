export interface Coordinates {
  lat: number
  lng: number
}

export interface SeoFields {
  metaTitle: string | null
  metaDescription: string | null
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

export interface ContactFormState {
  success: boolean
  error: string | null
}
