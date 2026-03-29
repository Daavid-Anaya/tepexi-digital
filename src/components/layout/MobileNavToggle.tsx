'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Menu, X, MapPin, Compass, Mountain } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavLink {
  href: string
  label: string
}

interface MobileNavToggleProps {
  navLinks: NavLink[]
}

const navIcons = [MapPin, Compass, Mountain, MapPin, Compass, Mountain, MapPin, Compass]

export function MobileNavToggle({ navLinks }: MobileNavToggleProps) {
  const [isOpen, setIsOpen] = useState(false)

  const close = useCallback(() => setIsOpen(false), [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [close])

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <>
      {/* Hamburger button — only visible below md */}
      <button
        type="button"
        aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={isOpen}
        aria-controls="mobile-nav"
        onClick={() => setIsOpen((prev) => !prev)}
        className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-stone hover:text-primary hover:bg-primary/8 active:scale-95 transition-all duration-150"
      >
        <span
          className={cn(
            'transition-all duration-200',
            isOpen ? 'rotate-90 scale-110' : 'rotate-0 scale-100'
          )}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </span>
      </button>

      {/* Full-screen overlay */}
      <div
        className={cn(
          'md:hidden fixed inset-0 z-[49] transition-all duration-300',
          isOpen ? 'pointer-events-auto' : 'pointer-events-none'
        )}
        aria-hidden={!isOpen}
      >
        {/* Backdrop */}
        <div
          className={cn(
            'absolute inset-0 bg-primary-900/60 backdrop-blur-sm transition-opacity duration-300',
            isOpen ? 'opacity-100' : 'opacity-0'
          )}
          onClick={close}
          aria-hidden="true"
        />

        {/* Slide-in panel */}
        <div
          id="mobile-nav"
          className={cn(
            'absolute top-[63px] inset-x-0 bottom-0',
            'bg-cream flex flex-col',
            'transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
            isOpen ? 'translate-y-0' : '-translate-y-4'
          )}
        >
          {/* Decorative top border */}
          <div className="h-[3px] bg-gradient-to-r from-primary via-accent to-secondary flex-shrink-0" />

          {/* Nav links with stagger */}
          <nav aria-label="Menú móvil" className="flex-1 overflow-y-auto">
            <ul className="flex flex-col py-4 px-2 gap-1" role="list">
              {navLinks.map((link, i) => {
                const Icon = navIcons[i % navIcons.length]
                return (
                  <li
                    key={link.href}
                    className={cn(
                      'transition-all duration-300',
                      isOpen
                        ? 'opacity-100 translate-x-0'
                        : 'opacity-0 -translate-x-6'
                    )}
                    style={{ transitionDelay: isOpen ? `${i * 40 + 60}ms` : '0ms' }}
                  >
                    <Link
                      href={link.href}
                      onClick={close}
                      className="flex items-center gap-4 px-5 py-4 rounded-xl text-base font-medium text-stone hover:text-primary hover:bg-primary/6 active:bg-primary/10 transition-colors duration-150"
                    >
                      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/8 text-primary flex-shrink-0">
                        <Icon size={16} />
                      </span>
                      {link.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Footer accent */}
          <div className="flex-shrink-0 px-6 py-6 border-t border-stone/10">
            <p className="text-xs text-stone/50 text-center">
              Tepexi de Rodríguez, Puebla — México
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
