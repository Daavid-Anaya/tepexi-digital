import type { MapMarker, MapMarkerSource } from '@/types'

const MARKER_SECTION_PATHS = {
  lugar: '/lugares',
  gastronomia: '/gastronomia',
  cultura: '/cultura',
  servicios: '/servicios',
} as const

const MARKER_DETAIL_PATHS: Partial<Record<MapMarkerSource, string>> = {
  lugar: '/lugares',
  servicio: '/servicios',
  gastronomia: '/gastronomia',
}

interface MapMarkerRoute {
  detailHref: string
  sectionHref: string
}

export function getMapMarkerRoute(marker: Pick<MapMarker, 'type' | 'slug' | 'sourceType'>): MapMarkerRoute {
  const sectionHref = MARKER_SECTION_PATHS[marker.type] ?? MARKER_SECTION_PATHS.lugar
  const detailBasePath = marker.sourceType ? MARKER_DETAIL_PATHS[marker.sourceType] : undefined

  if (!detailBasePath || !marker.slug) {
    return {
      detailHref: sectionHref,
      sectionHref,
    }
  }

  return {
    detailHref: `${detailBasePath}/${marker.slug}`,
    sectionHref,
  }
}
