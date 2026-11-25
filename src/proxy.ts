import { NextResponse } from 'next/server'

const isDev = process.env.NODE_ENV === 'development'

export function proxy() {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const response = NextResponse.next()

  // En desarrollo, Next.js usa eval() para hot reload y React Refresh.
  // En producción, solo se permiten scripts inline basados en nonce.
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
    // Coincide con todas las rutas excepto archivos estáticos e internos de Next.js
    '/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|robots.txt|sitemap.xml).*)',
  ],
}
