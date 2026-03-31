import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import { getSettings } from '@/lib/data'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()
  const seo = settings.seoDefaults

  return {
    title: {
      template: `%s | ${settings.siteName}`,
      default: seo?.metaTitle ?? `${settings.siteName} — Turismo, Cultura y Gastronomía`,
    },
    description:
      seo?.metaDescription ?? settings.siteDescription,
    openGraph: {
      title: seo?.metaTitle ?? settings.siteName,
      description: seo?.metaDescription ?? settings.siteDescription,
      siteName: settings.siteName,
      locale: 'es_MX',
      type: 'website',
      ...(seo?.ogImageUrl && {
        images: [{ url: seo.ogImageUrl, width: 1200, height: 630 }],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: seo?.metaTitle ?? settings.siteName,
      description: seo?.metaDescription ?? settings.siteDescription,
      ...(seo?.ogImageUrl && { images: [seo.ogImageUrl] }),
    },
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${plusJakartaSans.variable}`}
    >
      <body className="bg-sand antialiased">{children}</body>
    </html>
  )
}
