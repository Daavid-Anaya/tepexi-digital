import { defineLive } from 'next-sanity/live'
import { client } from './client'

// serverToken: used server-side for data fetching — never sent to the browser
// browserToken: used only in draft mode for live preview in the Sanity Studio
// Use separate env vars so the read token is not exposed to the client bundle
const serverToken = process.env.SANITY_API_READ_TOKEN
const browserToken = process.env.SANITY_API_BROWSER_TOKEN ?? process.env.SANITY_API_READ_TOKEN

export const { sanityFetch, SanityLive } = defineLive({
  client: client.withConfig({
    apiVersion: '2025-03-01',
  }),
  serverToken,
  browserToken,
})
