import Script from 'next/script'
import { headers } from 'next/headers'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Analytics } from "@vercel/analytics/next"
import { getSettings } from '@/lib/data'

const GA_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getSettings()
  const headersList = await headers()
  const nonce = headersList.get('x-nonce') ?? undefined

  // F-10/F-33: detecta la ruta actual para limitar la precarga del hero a la página de inicio.
  // Inyectarla en todas las rutas desperdicia ancho de banda y compite con los heroes de cada página.
  const pathname = headersList.get('x-pathname') ?? headersList.get('x-invoke-path') ?? '/'
  const isHomePage = pathname === '/'

  // F-38: precarga del hero con srcset completo para que cada dispositivo descargue el tamaño adecuado.
  // F-06: parámetros de transformación aplicados directamente sobre la URL del CDN de Sanity.
  const heroBaseUrl = settings.heroImageUrl ?? null
  const heroPreloadSrcSet = heroBaseUrl
    ? [
        `${heroBaseUrl}?w=412&h=280&fit=crop&auto=format&q=80 412w`,
        `${heroBaseUrl}?w=828&h=560&fit=crop&auto=format&q=80 828w`,
        `${heroBaseUrl}?w=1200&h=800&fit=crop&auto=format&q=80 1200w`,
        `${heroBaseUrl}?w=1920&h=1080&fit=crop&auto=format&q=80 1920w`,
      ].join(', ')
    : null
  const heroPreloadSizes = '(max-width: 412px) 412px, (max-width: 828px) 828px, (max-width: 1200px) 1200px, 1920px'
  // href de respaldo para navegadores que no soportan imagesrcset (poco común)
  const heroPreloadHref = heroBaseUrl
    ? `${heroBaseUrl}?w=828&h=560&fit=crop&auto=format&q=80`
    : null

  return (
    <>
      {/* F-10/F-33: precarga el hero LCP solo en la página de inicio, no en todas las rutas */}
      {isHomePage && heroPreloadSrcSet && heroPreloadHref && (
        <link
          rel="preload"
          as="image"
          href={heroPreloadHref}
          imageSrcSet={heroPreloadSrcSet}
          imageSizes={heroPreloadSizes}
          fetchPriority="high"
        />
      )}

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-cream focus:rounded focus:outline-none focus:ring-2 focus:ring-cream"
      >
        Saltar al contenido
      </a>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="min-h-screen">{children}</main>
      <Footer />

      {/* Google Analytics — lazyOnload para que nunca bloquee el LCP ni el TBT */}
      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="lazyOnload"
            nonce={nonce}
          />
          <Script id="ga-init" strategy="lazyOnload" nonce={nonce}>
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}
          </Script>
        </>
      )}

      <Analytics />
    </>
  )
}
