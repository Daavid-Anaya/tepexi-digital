import Image from 'next/image'
import Link from 'next/link'
import { Container } from '@/components/ui/Container'
import { MobileNavToggle } from './MobileNavToggle'
import { NavLinks } from './NavLinks'
import { navLinks } from '@/lib/navigation'

export function Navbar() {
  return (
    <>
      {/* Barra de acento superior */}
      <div className="h-[3px] bg-primary sticky top-0 z-50" aria-hidden="true" />

      {/* F-32: blur-sm reducido (antes blur-md) + fondo más opaco para evitar costo de GPU en cada frame de scroll */}
      <header className="sticky top-[3px] z-50 bg-cream/98 backdrop-blur-sm border-b border-stone/15 shadow-[0_1px_12px_rgba(139,69,19,0.06)]">
        <nav
          role="navigation"
          aria-label="Navegación principal"
        >
          <Container className="flex items-center justify-between h-[60px]">
            {/* Logo / Marca */}
            <Link
              href="/"
              className="flex items-center gap-2 group"
            >
              <Image
                src="/icon.png"
                alt="Tepexi Digital"
                width={32}
                height={32}
                className="rounded-lg shadow-sm"
              />
              <span className="font-heading leading-none">
                <span className="font-bold text-[1.15rem] text-primary group-hover:text-primary-dark transition-colors duration-200">
                  Tepexi
                </span>
                <span className="font-light text-[1.15rem] text-stone ml-0.5">
                  Digital
                </span>
              </span>
            </Link>

            {/* Navegación de escritorio */}
            <NavLinks links={navLinks} />

            {/* Botón del menú móvil */}
            <MobileNavToggle navLinks={navLinks} />
          </Container>
        </nav>
      </header>
    </>
  )
}
