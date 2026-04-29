import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Container } from '@/components/ui/Container'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PageHeroProps {
  /** Background image URL */
  imageUrl: string
  /** Alt text for the background image */
  imageAlt?: string
  /** Overlay opacity — default 0.6 (range 0-1) */
  overlayOpacity?: number
  /** Section padding variant */
  size?: 'default' | 'compact'
  /** Content to render inside */
  children: ReactNode
  /** Additional className for the section */
  className?: string
}

export interface PageHeroBreadcrumbProps {
  /** Items for the breadcrumb. Last item has no href (current page). */
  items: { label: string; href?: string }[]
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
  imageAlt = '',
  overlayOpacity = 0.6,
  size = 'default',
  children,
  className,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        'relative overflow-hidden',
        size === 'default' ? 'py-12 md:py-20' : 'py-10 md:py-14',
        className,
      )}
    >
      {/* Background image */}
      <Image
        src={imageUrl}
        alt={imageAlt}
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

export function PageHeroBreadcrumb({ items }: PageHeroBreadcrumbProps) {
  return (
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
  )
}

// ─── PageHeroHeader ───────────────────────────────────────────────────────────

export function PageHeroHeader({ icon: Icon, title, description }: PageHeroHeaderProps) {
  return (
    <div className="flex items-start gap-5">
      {Icon && (
        <div className="flex-shrink-0 w-14 h-14 rounded-2xl hidden sm:flex items-center justify-center bg-white/15">
          <Icon className="w-7 h-7 text-white" />
        </div>
      )}
      <div>
        <h1 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-white leading-tight mb-3">
          {title}
        </h1>
        {description && (
          <p className="text-white/75 text-lg max-w-2xl leading-relaxed">
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
    <div className="mt-6 md:mt-10 flex gap-6 flex-wrap">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="rounded-xl px-5 py-3 text-white bg-white/10"
        >
          <div className="text-2xl font-bold font-heading">{stat.value}</div>
          <div className="text-xs text-white/70 uppercase tracking-wide">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}

// ─── PageHeroBackLink ─────────────────────────────────────────────────────────

export function PageHeroBackLink({ href, label }: PageHeroBackLinkProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm mb-8 group"
    >
      <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
      {label}
    </Link>
  )
}
