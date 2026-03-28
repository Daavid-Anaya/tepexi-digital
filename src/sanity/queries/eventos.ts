import { defineQuery } from 'next-sanity'

export const allEventosQuery = defineQuery(`*[_type == "evento"] | order(date asc) {
  _id,
  title,
  slug,
  "imageUrl": image.asset->url,
  "imageAlt": image.alt,
  date,
  endDate,
  "locationName": location->title,
  locationText,
  isFeatured
}`)

export const featuredEventosQuery = defineQuery(`*[_type == "evento" && isFeatured == true] | order(date asc) {
  _id,
  title,
  slug,
  "imageUrl": image.asset->url,
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
  image,
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

export const upcomingEventosQuery = defineQuery(`*[_type == "evento" && date >= $now] | order(date asc)[0...$limit] {
  _id,
  title,
  slug,
  "imageUrl": image.asset->url,
  "imageAlt": image.alt,
  date,
  endDate,
  "locationName": location->title,
  locationText,
  isFeatured
}`)
