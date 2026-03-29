import { PlaceCard } from './PlaceCard'
import { cn } from '@/lib/utils'
import type { PlaceCardProps } from '@/types'

interface PlaceGridProps {
  places: PlaceCardProps[]
  basePath?: string
  /** Enables asymmetric featured layout: first card spans 2 cols on md+ */
  featured?: boolean
}

export function PlaceGrid({ places, basePath = '/lugares', featured = false }: PlaceGridProps) {
  if (featured && places.length >= 2) {
    const [first, ...rest] = places
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Featured card — spans 2 rows on md+ */}
        <div className="sm:row-span-2">
          <PlaceCard key={first.slug} {...first} basePath={basePath} featured />
        </div>
        {/* Remaining cards */}
        {rest.map((place) => (
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
