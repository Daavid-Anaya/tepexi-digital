import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const isDev = process.env.NODE_ENV === 'development'

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const response = NextResponse.next()

  // In development, Next.js uses eval() for hot reload and React Refresh.
  // In production, only nonce-based inline scripts are allowed.
  const scriptSrc = isDev
    ? `script-src 'self' 'unsafe-eval' 'nonce-${nonce}' https://www.googletagmanager.com https://www.google-analytics.com https://va.vercel-scripts.com`
    : `script-src 'self' 'nonce-${nonce}' https://www.googletagmanager.com https://www.google-analytics.com https://va.vercel-scripts.com`

  const csp = [
    `default-src 'self'`,
    scriptSrc,
    `style-src 'self' 'unsafe-inline' https://unpkg.com`,
    `img-src 'self' data: blob: https://cdn.sanity.io https://www.google-analytics.com https://*.tile.openstreetmap.org`,
    `font-src 'self'`,
    `connect-src 'self' https://cdn.sanity.io https://*.api.sanity.io https://www.google-analytics.com https://www.googletagmanager.com https://*.vercel-insights.com${isDev ? ' ws://localhost:* http://localhost:*' : ''}`,
    `frame-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    ...(isDev ? [] : [`upgrade-insecure-requests`]),
  ].join('; ')

  response.headers.set('Content-Security-Policy', csp)
  response.headers.set('x-nonce', nonce)

  return response
}

export const config = {
  matcher: [
    // Match all paths except static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|robots.txt|sitemap.xml).*)',
  ],
}
