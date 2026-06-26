import { client } from '@/sanity/lib/client'

/**
 * Fetch all slugs for a Sanity document type — used by generateStaticParams.
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
