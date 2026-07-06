import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { JsonLd } from '@/components/seo/JsonLd'
import { buildBreadcrumbJsonLd } from '@/lib/structured-data'
import { cn } from '@/lib/utils'
import { Container } from '@/components/ui/Container'

const PAGE_HERO_SIZE = {
  DEFAULT: 'default',
  COMPACT: 'compact',
} as const

type PageHeroSize = (typeof PAGE_HERO_SIZE)[keyof typeof PAGE_HERO_SIZE]

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PageHeroProps {
  /** Background image URL */
  imageUrl: string
  /** Overlay opacity — default 0.6 (range 0-1) */
  overlayOpacity?: number
  /** Section padding variant */
  size?: PageHeroSize
  /** Content to render inside */
  children: ReactNode
  /** Additional className for the section */
  className?: string
}

export interface PageHeroBreadcrumbProps {
  /** Items for the breadcrumb. Last item has no href (current page). */
  items: { label: string; href?: string }[]
  currentPath?: string
}

export interface PageHeroHeaderProps {
  icon?: LucideIcon
  title: string
  description?: string
}

export interface PageHeroStat {
  value: string | number
  label: string
}

export interface PageHeroStatsProps {
  stats: PageHeroStat[]
}

export interface PageHeroBackLinkProps {
  /** URL to navigate back to */
  href: string
  /** Label text after the arrow, e.g. "Volver a Lugares" */
  label: string
}

// ─── PageHero (root) ─────────────────────────────────────────────────────────

export function PageHero({
  imageUrl,
  overlayOpacity = 0.6,
  size = PAGE_HERO_SIZE.DEFAULT,
  children,
  className,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        'relative overflow-hidden',
        size === PAGE_HERO_SIZE.DEFAULT ? 'py-12 md:py-20' : 'py-10 md:py-14',
        className,
      )}
    >
      {/* Background image */}
      <Image
        src={imageUrl}
        alt=""
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />

      {/* Dark overlay — opacity controlled via inline style */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }}
        aria-hidden="true"
      />

      {/* Content — sits above overlay */}
      <Container className="relative z-10">
        {children}
      </Container>
    </section>
  )
}

// ─── PageHeroBreadcrumb ───────────────────────────────────────────────────────

export function PageHeroBreadcrumb({ items, currentPath }: PageHeroBreadcrumbProps) {
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(items, currentPath)

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-sm text-white/60 mb-6"
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <span key={index} className="flex items-center gap-2">
              {index > 0 && <span aria-hidden="true">/</span>}
              {!isLast && item.href ? (
                <Link
                  href={item.href}
                  className="hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? 'text-white/90' : undefined}>
                  {item.label}
                </span>
              )}
            </span>
          )
        })}
      </nav>
    </>
  )
}

// ─── PageHeroHeader ───────────────────────────────────────────────────────────

export function PageHeroHeader({ icon: Icon, title, description }: PageHeroHeaderProps) {
  return (
    <div className="flex items-start gap-5">
      {Icon && (
        <div className="flex-shrink-0 w-14 h-14 rounded-2xl hidden sm:flex items-center justify-center bg-white/15">
          <Icon className="w-7 h-7 text-white" aria-hidden="true" />
        </div>
      )}
      <div>
        <h1 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-cream leading-tight mb-3">
          {title}
        </h1>
        {description && (
          <p className="text-cream/75 text-lg max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}

// ─── PageHeroStats ────────────────────────────────────────────────────────────

export function PageHeroStats({ stats }: PageHeroStatsProps) {
  if (stats.length === 0) return null

  return (
    <dl className="mt-6 md:mt-10 flex gap-6 flex-wrap">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="rounded-xl px-5 py-3 text-white bg-white/10"
        >
          <dt className="sr-only">{stat.label}</dt>
          <dd className="text-2xl font-bold font-heading">{stat.value}</dd>
          <dd aria-hidden="true" className="text-xs text-white/70 uppercase tracking-wide">{stat.label}</dd>
        </div>
      ))}
    </dl>
  )
}

// ─── PageHeroBackLink ─────────────────────────────────────────────────────────

export function PageHeroBackLink({ href, label }: PageHeroBackLinkProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm mb-8 group"
    >
      <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
      {label}
    </Link>
  )
}
