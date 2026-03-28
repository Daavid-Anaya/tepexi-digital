import { defineQuery } from 'next-sanity'

export const allGastronomiaQuery = defineQuery(`*[_type == "gastronomia"] | order(_createdAt desc) {
  _id,
  title,
  slug,
  "category": category->name,
  "categoryColor": category->color,
  "imageUrl": images[0].asset->url,
  "imageAlt": images[0].alt,
  coordinates,
  address,
  priceRange,
  dishType
}`)

export const gastronomiaBySlugQuery = defineQuery(`*[_type == "gastronomia" && slug.current == $slug][0] {
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
  dishType,
  featuredDishes,
  priceRange,
  recommendations,
  seo
}`)

export const allGastronomiaMapQuery = defineQuery(`*[_type == "gastronomia" && defined(coordinates)] {
  _id,
  title,
  slug,
  "category": category->name,
  "categoryColor": category->color,
  coordinates
}`)
