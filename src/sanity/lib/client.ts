import { createClient } from 'next-sanity'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2025-03-01',
  // useCdn: false en producción para la revalidación bajo demanda vía webhook
  // El webhook dispara revalidatePath/revalidateTag cuando cambia el contenido
  useCdn: process.env.NODE_ENV === 'development',
})
