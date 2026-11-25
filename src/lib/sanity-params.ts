import { client } from '@/sanity/lib/client'

/**
 * Obtiene todos los slugs de un tipo de documento de Sanity; lo usa generateStaticParams.
 */
export async function fetchStaticSlugs(
  sanityType: string,
): Promise<{ slug: string }[]> {
  try {
    const slugs = await client.fetch<{ slug: string }[]>(
      `*[_type == $type && defined(slug.current)]{ "slug": slug.current }`,
      { type: sanityType },
      { next: { tags: [sanityType] } },
    )
    return slugs.map((item) => ({ slug: item.slug }))
  } catch {
    return []
  }
}
