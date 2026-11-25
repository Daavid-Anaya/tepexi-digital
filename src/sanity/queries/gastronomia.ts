import { defineQuery } from 'next-sanity'
import { HOME_PREVIEW_LIMITS } from '@/lib/constants'

// F-06: imageUrl usa parámetros del CDN de Sanity — miniaturas de tarjeta de 600×400 px, calidad 75.
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

// F-19: consulta dedicada para el inicio — obtiene solo los 3 platillos más recientes para la vista previa.
// Evita obtener toda la colección de gastronomía y recortarla en JS.
export const latestGastronomiaHomeQuery = defineQuery(`*[_type == "gastronomia"] | order(_createdAt desc)[0...${HOME_PREVIEW_LIMITS.LATEST_GASTRONOMIA}] {
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
  "seo": {
    "metaTitle": seo.metaTitle,
    "metaDescription": seo.metaDescription,
    "ogImageUrl": seo.ogImage.asset->url,
    "ogImageAlt": seo.ogImage.alt
  }
}`)
