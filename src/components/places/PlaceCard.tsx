import Image from 'next/image'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import type { PlaceCardProps } from '@/types'

interface PlaceCardComponentProps extends PlaceCardProps {
  basePath?: string
}

export function PlaceCard({
  title,
  slug,
  category,
  imageUrl,
  imageAlt,
  excerpt,
  basePath = '/lugares',
}: PlaceCardComponentProps) {
  return (
    <Card>
      <Link href={`${basePath}/${slug}`} className="group block">
        {/* Image */}
        <div className="relative w-full aspect-video overflow-hidden bg-sand">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={imageAlt || title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-sand/80">
              <span className="text-stone/40 text-sm">Sin imagen</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-2">
          <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium">
            {category}
          </span>
          <h3 className="font-heading font-semibold text-lg text-primary group-hover:text-primary-dark transition-colors leading-tight">
            {title}
          </h3>
          {excerpt && (
            <p className="text-stone text-sm line-clamp-2">{excerpt}</p>
          )}
        </div>
      </Link>
    </Card>
  )
}
