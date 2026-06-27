import { defineQuery } from 'next-sanity'

// F-06: imageUrl uses Sanity CDN params — card thumbnails 600×400 px, quality 75.
export const featuredEventosQuery = defineQuery(`*[_type == "evento" && isFeatured == true] | order(date asc) {
  _id,
  title,
  slug,
  "imageUrl": image.asset->url + "?w=600&h=400&q=75&auto=format&fit=crop&crop=center",
  "imageAlt": image.alt,
  date,
  endDate,
  "locationName": location->title,
  locationText
}`)

export const eventoBySlugQuery = defineQuery(`*[_type == "evento" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  description,
  "imageUrl": image.asset->url + "?w=1200&q=80&auto=format&fit=max",
  "imageAlt": image.alt,
  date,
  endDate,
  "location": location->{
    _id,
    title,
    slug,
    coordinates,
    address
  },
  locationText,
  isFeatured,
  seo
}`)

// F-20: dedicated home preview — always fetches exactly 3 upcoming events.
// Avoids the limit:50 fetch in getUpcomingEventos() + slice(0,3) in home page.
export const upcomingEventosPreviewQuery = defineQuery(`*[_type == "evento" && date >= $now] | order(date asc)[0...3] {
  _id,
  title,
  slug,
  "imageUrl": image.asset->url + "?w=600&h=400&q=75&auto=format&fit=crop&crop=center",
  "imageAlt": image.alt,
  date,
  endDate,
  "locationName": location->title,
  locationText,
  isFeatured
}`)

export const upcomingEventosQuery = defineQuery(`*[_type == "evento" && date >= $now] | order(date asc)[0...$limit] {
  _id,
  title,
  slug,
  "imageUrl": image.asset->url + "?w=600&h=400&q=75&auto=format&fit=crop&crop=center",
  "imageAlt": image.alt,
  date,
  endDate,
  "locationName": location->title,
  locationText,
  isFeatured
}`)
