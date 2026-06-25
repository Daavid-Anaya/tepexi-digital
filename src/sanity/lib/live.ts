import { defineLive } from 'next-sanity/live'
import { client } from './client'

// serverToken: used server-side for data fetching — never sent to the browser
// browserToken: used only in draft mode for live preview in the Sanity Studio
// Each token MUST come from a separate env var — never fall back to the read token
const serverToken = process.env.SANITY_API_READ_TOKEN
const browserToken = process.env.SANITY_API_BROWSER_TOKEN

export const { sanityFetch, SanityLive } = defineLive({
  client: client.withConfig({
    apiVersion: '2025-03-01',
  }),
  serverToken,
  browserToken,
})
