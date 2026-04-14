import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2025-03-01',
  // useCdn: false in production for on-demand revalidation via webhook
  // The webhook will trigger revalidatePath/revalidateTag when content changes
  useCdn: process.env.NODE_ENV === 'development',
})
