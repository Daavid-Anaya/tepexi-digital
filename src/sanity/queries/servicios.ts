import { defineQuery } from 'next-sanity'

export const allServiciosMapQuery = defineQuery(`*[_type == "servicio" && defined(coordinates)] {
  _id,
  title,
  slug,
  "category": category->name,
  "categoryColor": category->color,
  "categoryType": category->type,
  coordinates,
  address,
  schedule,
  cost
}`)
