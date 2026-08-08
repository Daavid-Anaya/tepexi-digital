import { revalidatePath, revalidateTag } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'
import { parseBody } from 'next-sanity/webhook'
import { RATE_LIMITS } from '@/lib/constants'
import { logError, logWarn } from '@/lib/observability'
import { rateLimit } from '@/lib/rate-limit'

// Sanity document types mapped to their paths
const TYPE_TO_PATHS: Record<string, string[]> = {
  lugar: ['/lugares', '/mapa', '/'],
  gastronomia: ['/gastronomia', '/'],
  evento: ['/agenda', '/'],
  servicio: ['/mapa'],
  settings: ['/'],
  categoria: ['/lugares', '/gastronomia', '/mapa', '/'],
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    const { allowed } = rateLimit(`revalidate:${ip}`, RATE_LIMITS.REVALIDATE)
    if (!allowed) {
      logWarn('[revalidate] rate limit exceeded', {
        source: 'revalidateRoute',
        route: '/api/revalidate',
        statusCode: 429,
      })

      return NextResponse.json(
        { message: 'Too many requests' },
        { status: 429 },
      )
    }

    const revalidateSecret = process.env.SANITY_REVALIDATE_SECRET

    if (!revalidateSecret) {
      logError('[revalidate] missing SANITY_REVALIDATE_SECRET configuration', {
        source: 'revalidateRoute',
        route: '/api/revalidate',
        metadata: {
          envVar: 'SANITY_REVALIDATE_SECRET',
        },
        statusCode: 500,
      })

      return NextResponse.json(
        { message: 'Revalidation is not configured' },
        { status: 500 },
      )
    }

    // Verify the webhook signature
    const { isValidSignature, body } = await parseBody<{
      _type: string
      slug?: { current: string }
    }>(req, revalidateSecret)

    if (!isValidSignature) {
      logWarn('[revalidate] invalid webhook signature', {
        source: 'revalidateRoute',
        route: '/api/revalidate',
        metadata: {
          hasBody: Boolean(body),
        },
        statusCode: 401,
      })

      return NextResponse.json(
        { message: 'Invalid signature', isValidSignature },
        { status: 401 }
      )
    }

    if (!body?._type) {
      logWarn('[revalidate] webhook payload is missing _type', {
        source: 'revalidateRoute',
        route: '/api/revalidate',
        metadata: {
          hasSlug: Boolean(body?.slug?.current),
        },
        statusCode: 400,
      })

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
      }
      
      const detailPath = detailPaths[_type]
      if (detailPath) {
        revalidatePath(detailPath)
      }
    }

    // Expire tagged Sanity data immediately for webhook-driven refreshes.
    // Next.js local docs recommend `{ expire: 0 }` for third-party route handlers.
    revalidateTag('sanity', { expire: 0 })

    return NextResponse.json({
      revalidated: true,
      now: Date.now(),
      type: _type,
      paths,
    })
  } catch (error) {
    logError('[revalidate] revalidation request failed', {
      source: 'revalidateRoute',
      route: '/api/revalidate',
      error,
      statusCode: 500,
    })

    return NextResponse.json(
      { message: 'Error revalidating' },
      { status: 500 }
    )
  }
}
