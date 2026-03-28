import { PlaceCard } from './PlaceCard'
import type { PlaceCardProps } from '@/types'

interface PlaceGridProps {
  places: PlaceCardProps[]
  basePath?: string
}

export function PlaceGrid({ places, basePath = '/lugares' }: PlaceGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {places.map((place) => (
        <PlaceCard key={place.slug} {...place} basePath={basePath} />
      ))}
    </div>
  )
}
