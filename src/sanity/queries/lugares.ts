import { defineQuery } from 'next-sanity'

// F-06: imageUrl uses Sanity CDN params to avoid serving raw originals (2000–6000 px).
// Card thumbnails → 600×400 px, quality 75.
export const allLugaresQuery = defineQuery(`*[_type == "lugar"] | order(isFeatured desc, _createdAt desc) {
  _id,
  title,
  slug,
  "category": category->name,
  "categoryColor": category->color,
  "imageUrl": images[0].asset->url + "?w=600&h=400&q=75&auto=format&fit=crop&crop=center",
  "imageAlt": images[0].alt,
  coordinates,
  address,
  isFeatured
}`)

export const lugarBySlugQuery = defineQuery(`*[_type == "lugar" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  "category": category->name,
  "categoryColor": category->color,
  description,
  "images": images[] {
    alt,
    "url": asset->url + "?w=1200&q=80&auto=format&fit=max",
    "asset": { "url": asset->url + "?w=1200&q=80&auto=format&fit=max" }
  },
  coordinates,
  address,
  schedule,
  cost,
  recommendations,
  seo
}`)

export const allLugaresMapQuery = defineQuery(`*[_type == "lugar" && defined(coordinates)] {
  _id,
  title,
  slug,
  "category": category->name,
  "categoryColor": category->color,
  "categoryType": category->type,
  coordinates
}`)

// F-19: dedicated home query — fetches only featured lugares, max 4, only the fields
// the home page card needs. Avoids fetching the full collection and slicing in JS.
export const featuredLugaresHomeQuery = defineQuery(`*[_type == "lugar" && isFeatured == true] | order(_createdAt desc)[0...4] {
  _id,
  title,
  slug,
  "category": category->name,
  "categoryColor": category->color,
  "imageUrl": images[0].asset->url + "?w=600&h=400&q=75&auto=format&fit=crop&crop=center",
  "imageAlt": images[0].alt,
  address
}`)
