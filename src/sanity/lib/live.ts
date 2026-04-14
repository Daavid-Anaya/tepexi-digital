import { defineLive } from 'next-sanity/live'
import { client } from './client'

const token = process.env.SANITY_API_READ_TOKEN

export const { sanityFetch, SanityLive } = defineLive({
  client: client.withConfig({
    apiVersion: '2025-03-01',
  }),
  serverToken: token,
  browserToken: token,
  // Tag all Sanity fetches for on-demand revalidation
  fetchOptions: {
    next: { tags: ['sanity'] },
  },
})
