import { PlaceGrid } from './PlaceGrid'
import type { PlaceCardProps } from '@/types'

interface CategorySectionProps {
  id: string
  label: string
  color: string
  places: PlaceCardProps[]
  basePath?: string
}

export function CategorySection({
  id,
  label,
  color,
  places,
  basePath = '/lugares',
}: CategorySectionProps) {
  if (places.length === 0) return null

  return (
    <section id={id} className="scroll-mt-28">
      {/* Category header */}
      <div className="flex items-center gap-3 mb-4 sm:mb-6">
        <span
          className="w-3.5 h-3.5 rounded-full flex-shrink-0 ring-2 ring-offset-2 ring-offset-cream"
          style={{ backgroundColor: color, boxShadow: `0 0 0 1px ${color}33` }}
          aria-hidden="true"
        />
        <h2 className="font-heading font-bold text-xl sm:text-2xl text-primary">
          {label}
        </h2>
        <span className="text-sm text-stone/60 tabular-nums">
          {places.length} {places.length === 1 ? 'lugar' : 'lugares'}
        </span>
      </div>

      <PlaceGrid places={places} basePath={basePath} />
    </section>
  )
}
