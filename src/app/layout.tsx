import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
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

export const metadata: Metadata = {
  title: {
    template: '%s | Tepexi Digital',
    default: 'Tepexi Digital — Turismo, Cultura y Gastronomía',
  },
  description:
    'Plataforma turística, cultural y gastronómica del municipio de Tepexi de Rodríguez, Puebla, México. Descubre sus lugares, tradiciones, sabores y eventos.',
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
