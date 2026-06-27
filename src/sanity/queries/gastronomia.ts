import { defineQuery } from 'next-sanity'

// F-06: imageUrl uses Sanity CDN params — card thumbnails 600×400 px, quality 75.
export const allGastronomiaQuery = defineQuery(`*[_type == "gastronomia"] | order(_createdAt desc) {
  _id,
  title,
  slug,
  "category": category->name,
  "categoryColor": category->color,
  "imageUrl": images[0].asset->url + "?w=600&h=400&q=75&auto=format&fit=crop&crop=center",
  "imageAlt": images[0].alt,
  priceRange,
  dishType
}`)

// F-19: dedicated home query — fetches only the 3 most recent dishes for the home preview.
// Avoids fetching the full gastronomia collection and slicing in JS.
export const latestGastronomiaHomeQuery = defineQuery(`*[_type == "gastronomia"] | order(_createdAt desc)[0...3] {
  _id,
  title,
  slug,
  "category": category->name,
  "categoryColor": category->color,
  "imageUrl": images[0].asset->url + "?w=600&h=400&q=75&auto=format&fit=crop&crop=center",
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
  "images": images[] {
    alt,
    "url": asset->url + "?w=1200&q=80&auto=format&fit=max",
    "asset": { "url": asset->url + "?w=1200&q=80&auto=format&fit=max" }
  },
  "descriptionImage": descriptionImage {
    alt,
    "url": asset->url + "?w=1200&q=80&auto=format&fit=max"
  },
  cost,
  dishType,
  priceRange,
  origin,
  season,
  quote,
  preparationTime,
  difficulty,
  servings,
  keyIngredients[] { name, description, icon, "imageUrl": image.asset->url + "?w=400&h=300&q=70&auto=format&fit=crop&crop=center" },
  preparationSteps[] { title, description, duration },
  seo
}`)
