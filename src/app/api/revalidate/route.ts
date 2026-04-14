import { revalidatePath, revalidateTag } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'
import { parseBody } from 'next-sanity/webhook'

// Sanity document types mapped to their paths
const TYPE_TO_PATHS: Record<string, string[]> = {
  lugar: ['/lugares', '/mapa', '/'],
  gastronomia: ['/gastronomia', '/'],
  evento: ['/agenda', '/'],
  servicio: ['/servicios', '/mapa'],
  settings: ['/'],
  categoria: ['/lugares', '/gastronomia', '/mapa', '/'],
}

export async function POST(req: NextRequest) {
  try {
    // Verify the webhook signature
    const { isValidSignature, body } = await parseBody<{
      _type: string
      slug?: { current: string }
    }>(req, process.env.SANITY_REVALIDATE_SECRET)

    if (!isValidSignature) {
      return NextResponse.json(
        { message: 'Invalid signature', isValidSignature },
        { status: 401 }
      )
    }

    if (!body?._type) {
      return NextResponse.json(
        { message: 'Bad request: missing _type' },
        { status: 400 }
      )
    }

    const { _type, slug } = body

    // Revalidate the specific paths for this document type
    const paths = TYPE_TO_PATHS[_type] ?? ['/']
    
    for (const path of paths) {
      revalidatePath(path)
    }

    // If document has a slug, revalidate its detail page too
    if (slug?.current) {
      const detailPaths: Record<string, string> = {
        lugar: `/lugares/${slug.current}`,
        gastronomia: `/gastronomia/${slug.current}`,
        evento: `/agenda/${slug.current}`,
        servicio: `/servicios/${slug.current}`,
      }
      
      const detailPath = detailPaths[_type]
      if (detailPath) {
        revalidatePath(detailPath)
      }
    }

    // Also revalidate by tag for more granular control
    revalidateTag('sanity')

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      type: _type,
      paths,
    })
  } catch (err) {
    console.error('Revalidation error:', err)
    return NextResponse.json(
      { message: 'Error revalidating', error: String(err) },
      { status: 500 }
    )
  }
}
