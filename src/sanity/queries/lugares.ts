import { defineQuery } from 'next-sanity'

export const allLugaresQuery = defineQuery(`*[_type == "lugar"] | order(_createdAt desc) {
  _id,
  title,
  slug,
  "category": category->name,
  "categoryColor": category->color,
  "imageUrl": images[0].asset->url,
  "imageAlt": images[0].alt,
  coordinates,
  address
}`)

export const lugarBySlugQuery = defineQuery(`*[_type == "lugar" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  "category": category->name,
  "categoryColor": category->color,
  description,
  images,
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
  coordinates
}`)
