import { revalidatePath, revalidateTag } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'
import { parseBody } from 'next-sanity/webhook'
import { RATE_LIMITS } from '@/lib/constants'
import { logError, logWarn } from '@/lib/observability'
import { getClientIpBucket } from '@/lib/client-ip'
import { RATE_LIMIT_STATUS, rateLimit } from '@/lib/rate-limit'

// Tipos de documento de Sanity asociados a sus rutas
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
    const clientBucket = getClientIpBucket(req.headers)
    const limitResult = await rateLimit(`revalidate:${clientBucket}`, RATE_LIMITS.REVALIDATE)

    // Falla abierto ante `unavailable`: la firma del webhook de abajo sigue protegiendo la
    // ruta, y bloquear dejaría desactualizado el contenido publicado.
    if (limitResult.status === RATE_LIMIT_STATUS.BLOCKED) {
      logWarn('[revalidate] rate limit exceeded', {
        source: 'revalidateRoute',
        route: '/api/revalidate',
        statusCode: 429,
      })

      return NextResponse.json(
        { message: 'Too many requests' },
        {
          status: 429,
          headers: { 'Retry-After': String(limitResult.retryAfterSeconds) },
        },
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

    // Verifica la firma del webhook
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

    // Revalida las rutas específicas de este tipo de documento
    const paths = TYPE_TO_PATHS[_type] ?? ['/']
    
    for (const path of paths) {
      revalidatePath(path)
    }

    // Si el documento tiene slug, revalida también su página de detalle
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

    // Expira de inmediato los datos etiquetados de Sanity en las actualizaciones disparadas por el webhook.
    // La documentación local de Next.js recomienda `{ expire: 0 }` para route handlers de terceros.
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
