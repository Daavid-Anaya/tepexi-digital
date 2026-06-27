import { defineQuery } from 'next-sanity'

// F-06: images use Sanity CDN params — detail images 1200 px wide, quality 80.
export const servicioBySlugQuery = defineQuery(`*[_type == "servicio" && slug.current == $slug][0] {
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

export const allServiciosMapQuery = defineQuery(`*[_type == "servicio" && defined(coordinates)] {
  _id,
  title,
  slug,
  "category": category->name,
  "categoryColor": category->color,
  "categoryType": category->type,
  coordinates
}`)
