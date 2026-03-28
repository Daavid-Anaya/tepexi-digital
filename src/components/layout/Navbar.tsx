import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { MobileNavToggle } from './MobileNavToggle'

const navLinks = [
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
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-stone/20">
      <nav
        role="navigation"
        aria-label="Navegación principal"
      >
        <Container className="flex items-center justify-between h-16">
          {/* Logo / Site name */}
          <Link
            href="/"
            className="font-heading font-bold text-xl text-primary hover:text-primary-dark transition-colors"
          >
            Tepexi Digital
          </Link>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-1" role="list">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="px-3 py-2 text-sm font-medium text-stone hover:text-primary hover:bg-primary/5 rounded-md transition-colors"
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
  )
}
