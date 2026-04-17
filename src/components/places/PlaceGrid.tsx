import { PlaceCard } from './PlaceCard'
import { cn } from '@/lib/utils'
import type { PlaceCardProps } from '@/types'

interface PlaceGridProps {
  places: PlaceCardProps[]
  basePath?: string
  featured?: boolean
}

export function PlaceGrid({ places, basePath = '/lugares', featured = false }: PlaceGridProps) {
  // Featured layout: 2x2 symmetric grid
  if (featured) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {places.map((place) => (
          <PlaceCard key={place.slug} {...place} basePath={basePath} />
        ))}
      </div>
    )
  }

  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6')}>
      {places.map((place) => (
        <PlaceCard key={place.slug} {...place} basePath={basePath} />
      ))}
    </div>
  )
}
