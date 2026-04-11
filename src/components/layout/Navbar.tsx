import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { MobileNavToggle } from './MobileNavToggle'

export const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/lugares', label: 'Lugares' },
  { href: '/gastronomia', label: 'Gastronomía' },
  { href: '/cultura', label: 'Cultura' },
  { href: '/como-llegar', label: 'Cómo llegar' },
  { href: '/mapa', label: 'Mapa' },
  { href: '/agenda', label: 'Agenda' },
  { href: '/contacto', label: 'Contacto' },
]

export function Navbar() {
  return (
    <>
      {/* Top accent bar */}
      <div className="h-[3px] bg-primary sticky top-0 z-50" aria-hidden="true" />

      <header className="sticky top-[3px] z-50 bg-cream/95 backdrop-blur-md border-b border-stone/15 shadow-[0_1px_12px_rgba(139,69,19,0.06)]">
        <nav
          role="navigation"
          aria-label="Navegación principal"
        >
          <Container className="flex items-center justify-between h-[60px]">
            {/* Logo / Brand */}
            <Link
              href="/"
              className="flex items-center gap-2 group"
              aria-label="Tepexi Digital — Inicio"
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-cream shadow-sm group-hover:bg-primary-dark transition-colors duration-200">
                <MapPin size={16} strokeWidth={2.5} />
              </span>
              <span className="font-heading leading-none">
                <span className="font-bold text-[1.15rem] text-primary group-hover:text-primary-dark transition-colors duration-200">
                  Tepexi
                </span>
                <span className="font-light text-[1.15rem] text-stone ml-0.5">
                  Digital
                </span>
              </span>
            </Link>

            {/* Desktop nav */}
            <ul className="hidden md:flex items-center gap-0.5" role="list">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="relative px-3 py-2 text-sm font-medium text-stone hover:text-primary rounded-md transition-colors duration-200
                      after:absolute after:bottom-0.5 after:left-3 after:right-3 after:h-[2px]
                      after:bg-primary after:scale-x-0 after:origin-left
                      after:transition-transform after:duration-200
                      hover:after:scale-x-100"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Mobile toggle */}
            <MobileNavToggle navLinks={navLinks} />
          </Container>
        </nav>
      </header>
    </>
  )
}
