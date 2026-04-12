'use client'

import { useEffect, useState, useRef } from 'react'
import { cn } from '@/lib/utils'

export interface CategoryNavItem {
  id: string
  label: string
  color: string
  count: number
}

interface CategoryNavProps {
  categories: CategoryNavItem[]
}

export function CategoryNav({ categories }: CategoryNavProps) {
  const [activeId, setActiveId] = useState(categories[0]?.id ?? '')
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    // Track which sections are visible via IntersectionObserver
    const sectionEls = categories
      .map((cat) => document.getElementById(cat.id))
      .filter(Boolean) as HTMLElement[]

    if (sectionEls.length === 0) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible section
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visible[0]) {
          setActiveId(visible[0].target.id)
        }
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0.1,
      }
    )

    for (const el of sectionEls) {
      observerRef.current.observe(el)
    }

    return () => observerRef.current?.disconnect()
  }, [categories])

  function handleClick(id: string) {
    const el = document.getElementById(id)
    if (!el) return
    const yOffset = -100 // account for sticky nav + page header
    const y = el.getBoundingClientRect().top + window.scrollY + yOffset
    window.scrollTo({ top: y, behavior: 'smooth' })
  }

  if (categories.length <= 1) return null

  return (
    <nav
      aria-label="Navegación por categorías"
      className="sticky top-16 z-30 bg-cream/95 backdrop-blur-sm border-b border-primary/10 -mx-4 px-4 md:mx-0 md:px-0"
    >
      <div
        className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-none"
        style={{
          maskImage: 'linear-gradient(to right, black 85%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, black 85%, transparent 100%)',
        }}
      >
        {categories.map((cat) => {
          const isActive = activeId === cat.id
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleClick(cat.id)}
              className={cn(
                'flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-stone hover:bg-primary/10 hover:text-primary'
              )}
            >
              <span
                className="inline-block w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0 ring-1 ring-inset ring-black/10"
                style={{ backgroundColor: cat.color }}
                aria-hidden="true"
              />
              <span>{cat.label}</span>
              <span
                className={cn(
                  'hidden sm:inline text-xs tabular-nums',
                  isActive ? 'text-white/70' : 'text-stone/50'
                )}
              >
                {cat.count}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
