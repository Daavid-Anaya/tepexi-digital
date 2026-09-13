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
  scheduleType, timezone, closed, weekly,
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
  scheduleType, timezone, closed, weekly,
  "location": location->{
    _id,
    title,
    slug,
    coordinates,
    address
  },
  locationText,
  isFeatured,
  "seo": {
    "metaTitle": seo.metaTitle,
    "metaDescription": seo.metaDescription,
    "ogImageUrl": seo.ogImage.asset->url,
    "ogImageAlt": seo.ogImage.alt
  }
}`)

// Resolve recurrence before sorting/limiting: original dates cannot rank a series.
export const upcomingEventosPreviewQuery = defineQuery(`*[_type == "evento" && closed != true] {
  _id,
  title,
  slug,
  "imageUrl": image.asset->url + "?w=600&h=400&q=75&auto=format&fit=crop&crop=center",
  "imageAlt": image.alt,
  date,
  endDate,
  scheduleType, timezone, closed, weekly,
  "locationName": location->title,
  locationText,
  isFeatured
}`)

export const upcomingEventosQuery = defineQuery(`*[_type == "evento" && closed != true] {
  _id,
  title,
  slug,
  "imageUrl": image.asset->url + "?w=600&h=400&q=75&auto=format&fit=crop&crop=center",
  "imageAlt": image.alt,
  date,
  endDate,
  scheduleType, timezone, closed, weekly,
  "locationName": location->title,
  locationText,
  isFeatured
}`)
