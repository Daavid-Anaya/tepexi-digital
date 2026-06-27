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

  // F-10/F-33: detect current pathname to scope hero preload to home only.
  // Injecting it on every route wastes bandwidth competing with page-specific heroes.
  const pathname = headersList.get('x-pathname') ?? headersList.get('x-invoke-path') ?? '/'
  const isHomePage = pathname === '/'

  // F-38: hero preload with full srcset so each device downloads the right size.
  // F-06: transformation params applied directly on the Sanity CDN URL.
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
  // Fallback href for browsers that don't support imagesrcset (rare)
  const heroPreloadHref = heroBaseUrl
    ? `${heroBaseUrl}?w=828&h=560&fit=crop&auto=format&q=80`
    : null

  return (
    <>
      {/* F-10/F-33: Preload LCP hero only on the home page — not on every route */}
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

      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />

      {/* Google Analytics — lazyOnload so it never blocks LCP or TBT */}
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
