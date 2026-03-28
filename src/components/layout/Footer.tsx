import Link from 'next/link'
import { Container } from '@/components/ui/Container'

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

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-primary-dark text-cream">
      <Container className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <h2 className="font-heading font-bold text-xl text-cream">
              Tepexi Digital
            </h2>
            <p className="text-cream/80 text-sm leading-relaxed">
              Plataforma turística, cultural y gastronómica del municipio de
              Tepexi de Rodríguez, Puebla, México.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-heading font-semibold text-cream mb-4">
              Explorar
            </h3>
            <ul className="space-y-2" role="list">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-cream/70 hover:text-cream transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading font-semibold text-cream mb-4">
              Contacto
            </h3>
            <address className="not-italic space-y-2 text-sm text-cream/70">
              <p>Tepexi de Rodríguez, Puebla</p>
              <p>México</p>
              <Link
                href="/contacto"
                className="block hover:text-cream transition-colors"
              >
                Enviar mensaje
              </Link>
            </address>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-cream/10 text-center text-xs text-cream/50">
          <p>
            © {currentYear} Tepexi Digital. Todos los derechos reservados.
          </p>
        </div>
      </Container>
    </footer>
  )
}
