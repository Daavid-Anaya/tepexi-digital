import Link from 'next/link'
import { MapPin, Calendar } from 'lucide-react'
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
          'flex gap-4 rounded-xl p-4 transition-all duration-300',
          'bg-cream border border-stone/10',
          'hover:shadow-md hover:border-primary/20 hover:-translate-y-px',
          isFeatured && 'border-l-[3px] border-l-primary bg-primary-50/60',
        )}
      >
        {/* Date accent box */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-primary text-white text-center shadow-sm">
          <span className="text-xl font-bold leading-none tabular-nums">{formatted.day}</span>
          <span className="text-[9px] uppercase tracking-wider mt-1 opacity-80 font-medium">{formatted.month}</span>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2 flex-wrap mb-1">
            <h3 className="font-heading font-semibold text-primary group-hover:text-primary-dark transition-colors duration-200 leading-snug">
              {title}
            </h3>
            {isFeatured && (
              <Badge variant="accent" className="flex-shrink-0 mt-0.5">
                Destacado
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {location && (
              <span className="flex items-center gap-1 text-stone text-xs max-w-full overflow-hidden">
                <MapPin size={11} className="text-stone/60 flex-shrink-0" />
                <span className="truncate">{location}</span>
              </span>
            )}

            {endDate && (
              <span className="flex items-center gap-1 text-stone/50 text-xs">
                <Calendar size={11} className="flex-shrink-0" />
                Hasta {new Date(endDate).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>

        {/* Hover arrow */}
        <div className="flex-shrink-0 flex items-center self-center opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-200">
          <span className="text-primary/40 text-lg leading-none">→</span>
        </div>
      </div>
    </Link>
  )
}
