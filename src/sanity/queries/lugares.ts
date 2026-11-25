import { defineQuery } from 'next-sanity'
import { HOME_PREVIEW_LIMITS } from '@/lib/constants'

// F-06: imageUrl usa parámetros del CDN de Sanity para no servir originales sin procesar (2000–6000 px).
// Miniaturas de tarjeta → 600×400 px, calidad 75.
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
  "seo": {
    "metaTitle": seo.metaTitle,
    "metaDescription": seo.metaDescription,
    "ogImageUrl": seo.ogImage.asset->url,
    "ogImageAlt": seo.ogImage.alt
  }
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

// F-19: consulta dedicada para el inicio — obtiene solo lugares destacados, máximo 4, solo los campos
// que necesita la tarjeta de la página de inicio. Evita obtener toda la colección y recortarla en JS.
export const featuredLugaresHomeQuery = defineQuery(`*[_type == "lugar" && isFeatured == true] | order(_createdAt desc)[0...${HOME_PREVIEW_LIMITS.FEATURED_LUGARES}] {
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
