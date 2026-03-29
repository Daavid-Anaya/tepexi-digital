'use client'

import dynamic from 'next/dynamic'

interface ImageCarouselProps {
  images: Array<{ url: string; alt: string }>
  autoPlay?: boolean
  interval?: number
}

const ImageCarousel = dynamic(() => import('./ImageCarousel'), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-video bg-sand animate-pulse rounded-2xl shadow-md" />
  ),
})

export default function DynamicImageCarousel(props: ImageCarouselProps) {
  return <ImageCarousel {...props} />
}
