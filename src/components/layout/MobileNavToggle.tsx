'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavLink {
  href: string
  label: string
}

interface MobileNavToggleProps {
  navLinks: NavLink[]
}

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
        className="md:hidden p-2 rounded-md text-stone hover:text-primary hover:bg-primary/5 transition-colors"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile menu overlay */}
      <div
        id="mobile-nav"
        className={cn(
          'md:hidden fixed inset-x-0 top-16 z-40 bg-cream border-b border-stone/20 shadow-lg',
          'transition-all duration-200 ease-in-out',
          isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-2 pointer-events-none',
        )}
        aria-hidden={!isOpen}
      >
        <nav aria-label="Menú móvil">
          <ul className="flex flex-col py-2" role="list">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={close}
                  className="block px-6 py-3 text-base font-medium text-stone hover:text-primary hover:bg-primary/5 transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  )
}
