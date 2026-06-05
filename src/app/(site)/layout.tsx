import Script from 'next/script'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from '@vercel/speed-insights/next'
import { getSettings } from '@/lib/data'

const GA_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getSettings()

  // Build the Next.js image optimizer URL for the hero so the browser
  // can start fetching it before React hydrates — this is the LCP element.
  // Mobile viewport: 412px wide. We request 828w (2x) via the optimizer.
  const heroPreloadUrl = settings.heroImageUrl
    ? `/_next/image?url=${encodeURIComponent(settings.heroImageUrl)}&w=828&q=75`
    : null

  return (
    <>
      {/* Preload LCP hero image — injected into <head> by Next.js App Router */}
      {heroPreloadUrl && (
        <link
          rel="preload"
          as="image"
          href={heroPreloadUrl}
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
          />
          <Script id="ga-init" strategy="lazyOnload">
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
      <SpeedInsights />
    </>
  )
}
