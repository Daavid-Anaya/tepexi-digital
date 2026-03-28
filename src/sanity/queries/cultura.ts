import { defineQuery } from 'next-sanity'

export const allCulturaQuery = defineQuery(`*[_type == "cultura"] | order(_createdAt desc) {
  _id,
  title,
  slug,
  "category": category->name,
  "categoryColor": category->color,
  "imageUrl": images[0].asset->url,
  "imageAlt": images[0].alt,
  coordinates,
  address,
  culturalType
}`)

export const culturaBySlugQuery = defineQuery(`*[_type == "cultura" && slug.current == $slug][0] {
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
  culturalType,
  recommendations,
  seo
}`)

export const allCulturaMapQuery = defineQuery(`*[_type == "cultura" && defined(coordinates)] {
  _id,
  title,
  slug,
  "category": category->name,
  "categoryColor": category->color,
  coordinates
}`)
