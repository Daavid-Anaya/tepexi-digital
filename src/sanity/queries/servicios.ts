import { defineQuery } from 'next-sanity'

export const servicioBySlugQuery = defineQuery(`*[_type == "servicio" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  "category": category->name,
  "categoryColor": category->color,
  description,
  "images": images[] { alt, "url": asset->url, "asset": { "url": asset->url } },
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
