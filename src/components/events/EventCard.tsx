import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import type { EventCardProps } from '@/types'

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return {
    day: date.toLocaleDateString('es-MX', { day: '2-digit' }),
    month: date.toLocaleDateString('es-MX', { month: 'short' }).toUpperCase(),
    full: date.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  }
}

export function EventCard({
  title,
  slug,
  date,
  endDate,
  location,
  isFeatured,
}: EventCardProps) {
  const formatted = formatDate(date)

  return (
    <Link href={`/agenda/${slug}`} className="group block">
      <div
        className={cn(
          'flex gap-4 rounded-lg p-4 transition-shadow',
          'bg-cream border border-stone/10',
          'hover:shadow-md',
          isFeatured && 'border-l-4 border-l-primary',
        )}
      >
        {/* Date accent */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-primary text-white text-center">
          <span className="text-xl font-bold leading-none">{formatted.day}</span>
          <span className="text-[10px] uppercase tracking-wide mt-0.5">{formatted.month}</span>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-start gap-2 flex-wrap">
            <h3 className="font-heading font-semibold text-primary group-hover:text-primary-dark transition-colors leading-snug">
              {title}
            </h3>
            {isFeatured && (
              <Badge variant="accent" className="flex-shrink-0">
                Destacado
              </Badge>
            )}
          </div>

          {location && (
            <p className="text-stone text-sm truncate">{location}</p>
          )}

          {endDate && (
            <p className="text-stone/60 text-xs">
              Hasta: {new Date(endDate).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
