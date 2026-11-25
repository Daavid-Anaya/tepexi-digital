import { defineLive } from 'next-sanity/live'
import { client } from './client'

// serverToken: se usa en el servidor para obtener datos; nunca se envía al navegador
// browserToken: se usa solo en modo borrador para la vista previa en vivo en Sanity Studio
// Cada token DEBE venir de una variable de entorno distinta; nunca se recurre al token de lectura
const serverToken = process.env.SANITY_API_READ_TOKEN
const browserToken = process.env.SANITY_API_BROWSER_TOKEN

export const { sanityFetch, SanityLive } = defineLive({
  client: client.withConfig({
    apiVersion: '2025-03-01',
  }),
  serverToken,
  browserToken,
})
