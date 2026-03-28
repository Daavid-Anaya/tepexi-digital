'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CarouselImage {
  url: string
  alt: string
}

interface ImageCarouselProps {
  images: CarouselImage[]
  autoPlay?: boolean
  interval?: number
}

export default function ImageCarousel({
  images,
  autoPlay = true,
  interval = 5000,
}: ImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function goNext() {
    setActiveIndex((prev) => (prev + 1) % images.length)
  }

  function goPrev() {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  function goTo(index: number) {
    setActiveIndex(index)
  }

  useEffect(() => {
    if (!autoPlay || isHovered || images.length <= 1) return

    timerRef.current = setInterval(goNext, interval)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [autoPlay, interval, isHovered, images.length])

  if (images.length === 0) return null

  return (
    <div
      className="relative w-full aspect-video overflow-hidden rounded-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides */}
      <div
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <div key={index} className="relative min-w-full h-full flex-shrink-0">
            <Image
              src={image.url}
              alt={image.alt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
              className="object-cover"
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      {/* Navigation buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={goPrev}
            aria-label="Imagen anterior"
            className={cn(
              'absolute left-2 top-1/2 -translate-y-1/2 z-10',
              'bg-black/40 hover:bg-black/60 text-white',
              'rounded-full p-1.5 transition-colors',
            )}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goNext}
            aria-label="Siguiente imagen"
            className={cn(
              'absolute right-2 top-1/2 -translate-y-1/2 z-10',
              'bg-black/40 hover:bg-black/60 text-white',
              'rounded-full p-1.5 transition-colors',
            )}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              aria-label={`Ir a imagen ${index + 1}`}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                index === activeIndex
                  ? 'bg-white scale-110'
                  : 'bg-white/50 hover:bg-white/75',
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}
