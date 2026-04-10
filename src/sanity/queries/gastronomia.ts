import { defineQuery } from 'next-sanity'

export const allGastronomiaQuery = defineQuery(`*[_type == "gastronomia"] | order(_createdAt desc) {
  _id,
  title,
  slug,
  "category": category->name,
  "categoryColor": category->color,
  "imageUrl": images[0].asset->url,
  "imageAlt": images[0].alt,
  priceRange,
  dishType
}`)

export const gastronomiaBySlugQuery = defineQuery(`*[_type == "gastronomia" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  "category": category->name,
  "categoryColor": category->color,
  introduction,
  description,
  "images": images[] { alt, "url": asset->url, "asset": { "url": asset->url } },
  "descriptionImage": descriptionImage { alt, "url": asset->url },
  cost,
  dishType,
  priceRange,
  origin,
  season,
  quote,
  preparationTime,
  difficulty,
  servings,
  keyIngredients[] { name, description, icon, "imageUrl": image.asset->url },
  preparationSteps[] { title, description, duration },
  seo
}`)
