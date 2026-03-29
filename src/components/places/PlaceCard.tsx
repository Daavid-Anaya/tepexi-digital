import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import type { PlaceCardProps } from '@/types'

interface PlaceCardComponentProps extends PlaceCardProps {
  basePath?: string
  featured?: boolean
}

export function PlaceCard({
  title,
  slug,
  category,
  imageUrl,
  imageAlt,
  excerpt,
  basePath = '/lugares',
  featured = false,
}: PlaceCardComponentProps) {
  return (
    <Card className={cn(featured && 'md:row-span-2')}>
      <Link href={`${basePath}/${slug}`} className="group block h-full flex flex-col">
        {/* Image container */}
        <div
          className={cn(
            'relative w-full overflow-hidden bg-sand flex-shrink-0',
            featured ? 'aspect-[4/3] md:aspect-auto md:flex-1 min-h-[260px]' : 'aspect-video'
          )}
        >
          {imageUrl ? (
            <>
              <Image
                src={imageUrl}
                alt={imageAlt || title}
                fill
                sizes={featured
                  ? '(max-width: 640px) 100vw, (max-width: 1024px) 66vw, 50vw'
                  : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                }
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Bottom gradient overlay for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary-900/60 via-transparent to-transparent opacity-70 group-hover:opacity-80 transition-opacity duration-300" />
              {/* Category badge over image */}
              <span className="absolute top-3 left-3 inline-flex items-center rounded-full bg-cream/90 backdrop-blur-sm text-primary px-2.5 py-1 text-xs font-semibold shadow-sm">
                {category}
              </span>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-sand/80 min-h-[180px]">
              <span className="text-stone/40 text-sm">Sin imagen</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className={cn('p-4 flex flex-col gap-2', featured && 'p-5')}>
          <h3
            className={cn(
              'font-heading font-semibold text-primary group-hover:text-primary-dark transition-colors duration-200 leading-snug',
              featured ? 'text-xl' : 'text-base'
            )}
          >
            {title}
          </h3>
          {excerpt && (
            <p className="text-stone text-sm line-clamp-2 leading-relaxed">{excerpt}</p>
          )}
          {/* Hover CTA */}
          <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary-500 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200">
            Explorar
            <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform duration-200" />
          </span>
        </div>
      </Link>
    </Card>
  )
}
