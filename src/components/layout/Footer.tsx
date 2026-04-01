import Link from 'next/link'
import { MapPin, Share2, AtSign, Mail, Phone, Globe } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { getSettings } from '@/lib/data'

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

function getSocialIcon(platform: string) {
  const lower = platform.toLowerCase()
  if (lower.includes('facebook')) return Share2
  if (lower.includes('instagram')) return AtSign
  if (lower.includes('tiktok')) return Globe
  if (lower.includes('twitter') || lower.includes('x')) return Globe
  return Globe
}

export async function Footer() {
  const settings = await getSettings()
  const currentYear = new Date().getFullYear()

  return (
    <footer>
      {/* Wave divider */}
      <div className="overflow-hidden leading-[0] bg-sand">
        <svg
          viewBox="0 0 1440 80"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="block w-full h-16 md:h-20"
          aria-hidden="true"
        >
          <path
            d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z"
            fill="#4E2509"
          />
        </svg>
      </div>

      {/* Main footer body */}
      <div className="bg-primary-800 text-cream">
        <Container className="pt-10 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">
            {/* Brand column */}
            <div className="md:col-span-4 space-y-5">
              {/* Logo */}
              <Link href="/" className="inline-flex items-center gap-2.5 group">
                <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-cream/10 group-hover:bg-cream/20 transition-colors duration-200">
                  <MapPin size={18} className="text-cream" />
                </span>
                <span className="font-heading leading-none">
                  <span className="font-bold text-xl text-cream">Tepexi</span>
                  <span className="font-light text-xl text-cream/60 ml-0.5">Digital</span>
                </span>
              </Link>

              <p className="text-cream/70 text-sm leading-relaxed max-w-xs">
                {settings.siteDescription}
              </p>

              {/* Social icons */}
              <div className="flex items-center gap-2">
                {settings.socialLinks?.map((social) => {
                  const Icon = getSocialIcon(social.platform)
                  return (
                    <a
                      key={social.platform}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.platform}
                      className="flex items-center justify-center w-9 h-9 rounded-lg bg-cream/8 text-cream/60 hover:bg-cream/15 hover:text-cream transition-all duration-200"
                    >
                      <Icon size={16} />
                    </a>
                  )
                })}
                <Link
                  href="/contacto"
                  aria-label="Correo"
                  className="flex items-center justify-center w-9 h-9 rounded-lg bg-cream/8 text-cream/60 hover:bg-cream/15 hover:text-cream transition-all duration-200"
                >
                  <Mail size={16} />
                </Link>
                {settings.contactPhone && (
                  <a
                    href={`tel:${settings.contactPhone}`}
                    aria-label="Teléfono"
                    className="flex items-center justify-center w-9 h-9 rounded-lg bg-cream/8 text-cream/60 hover:bg-cream/15 hover:text-cream transition-all duration-200"
                  >
                    <Phone size={16} />
                  </a>
                )}
              </div>
            </div>

            {/* Explore column */}
            <div className="md:col-span-4">
              <h3 className="font-heading font-semibold text-cream text-sm uppercase tracking-widest mb-5 pb-3 border-b border-cream/10">
                Explorar
              </h3>
              <ul className="space-y-2.5" role="list">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-cream/60 hover:text-cream transition-colors duration-200 flex items-center gap-1.5 group"
                    >
                      <span className="w-0 overflow-hidden group-hover:w-2.5 transition-all duration-200 text-primary-400">→</span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact column */}
            <div className="md:col-span-4">
              <h3 className="font-heading font-semibold text-cream text-sm uppercase tracking-widest mb-5 pb-3 border-b border-cream/10">
                Contacto
              </h3>
              <address className="not-italic space-y-3.5">
                <div className="flex items-start gap-2.5">
                  <MapPin size={15} className="text-primary-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-cream/60 leading-relaxed">
                    {settings.address ? (
                      settings.address.split(',').map((line, i) => (
                        <p key={i}>{line.trim()}</p>
                      ))
                    ) : (
                      <>
                        <p>Tepexi de Rodríguez</p>
                        <p>Puebla, México</p>
                      </>
                    )}
                  </div>
                </div>
                {settings.contactEmail && (
                  <div className="flex items-center gap-2.5">
                    <Mail size={15} className="text-primary-400 flex-shrink-0" />
                    <a
                      href={`mailto:${settings.contactEmail}`}
                      className="text-sm text-cream/60 hover:text-cream transition-colors duration-200"
                    >
                      {settings.contactEmail}
                    </a>
                  </div>
                )}
                {settings.contactPhone && (
                  <div className="flex items-center gap-2.5">
                    <Phone size={15} className="text-primary-400 flex-shrink-0" />
                    <a
                      href={`tel:${settings.contactPhone}`}
                      className="text-sm text-cream/60 hover:text-cream transition-colors duration-200"
                    >
                      {settings.contactPhone}
                    </a>
                  </div>
                )}
              </address>

              {/* Map CTA */}
              <div className="mt-6">
                <Link
                  href="/mapa"
                  className="inline-flex items-center gap-2 text-xs font-medium text-cream bg-cream/10 hover:bg-cream/18 px-4 py-2 rounded-lg transition-all duration-200"
                >
                  <MapPin size={13} />
                  Ver mapa interactivo
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-6 border-t border-cream/8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-cream/40">
            <p>
              © {currentYear} {settings.siteName}. Todos los derechos reservados.
            </p>
            <p>
              Hecho con cariño para Tepexi de Rodríguez
            </p>
          </div>
        </Container>
      </div>
    </footer>
  )
}
